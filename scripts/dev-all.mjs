// One-command launcher for both ends (PRD demo convenience).
//
// Why not `pnpm -r --parallel run dev`: Expo's dev server needs a real TTY for
// its interactive terminal (QR code + hotkeys). Under pnpm --parallel the child
// has no TTY and `expo start` crashes. So we run the Web (Vite) server in the
// BACKGROUND and Expo in the FOREGROUND, where it inherits this terminal's TTY
// and keeps full interactivity + Metro hot-reload.
import { spawn } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';

function pnpm(args, options) {
  return spawn('pnpm', args, { shell: true, ...options });
}

console.log('▶ Web 工作台启动中（后台）：http://localhost:5173');
console.log('  （需要 Web 日志时，单独跑 pnpm dev:web）\n');
const web = pnpm(['--filter', '@ai-agent-desk/web', 'dev'], { stdio: 'ignore' });

console.log('▶ RN 审批端（Expo，前台，可扫码 / 热重载）：\n');
const mobile = pnpm(['--filter', '@ai-agent-desk/mobile', 'start'], { stdio: 'inherit' });

let stopping = false;
function stopWeb() {
  if (stopping) return;
  stopping = true;
  try {
    if (isWindows && web.pid) {
      spawn('taskkill', ['/pid', String(web.pid), '/T', '/F'], { shell: true, stdio: 'ignore' });
    } else {
      web.kill('SIGTERM');
    }
  } catch {
    // best-effort cleanup
  }
}

mobile.on('exit', (code) => {
  stopWeb();
  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    mobile.kill(signal);
    stopWeb();
  });
}
