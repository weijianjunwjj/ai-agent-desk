// Captures the three Web screenshots used in README, by driving the running web
// dev server with Playwright through the demo flow (see docs/DEMO_SCRIPT.md).
//
// Prereqs: pnpm add -Dw playwright && pnpm exec playwright install chromium
// Usage:   pnpm dev:web   (in one terminal), then in another:
//          pnpm screenshots:web   (or: node scripts/capture-web-screenshots.mjs [baseURL])
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const baseURL = process.argv[2] ?? 'http://localhost:5173';
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../docs/screenshots');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });

try {
  await page.goto(baseURL, { waitUntil: 'networkidle' });

  // Select 张女士 and trigger AI analysis.
  await page.locator('.ant-list-item').first().click();
  await page.getByRole('button', { name: '触发 AI 分析' }).click();
  await page.getByText('建议动作（2）').waitFor({ timeout: 15000 });
  await page.waitForTimeout(500);

  // 1) Workbench overview.
  await page.screenshot({ path: path.join(outDir, 'web-workbench.png') });

  // 2) Schema-driven editing + diff (open the editor on the first card).
  await page.getByRole('button', { name: '修改参数' }).first().click();
  await page.getByText('与 AI 原始参数对比').waitFor({ timeout: 10000 });
  const editingCard = page.locator('.ant-card-small', { hasText: '编辑参数' }).first();
  await editingCard.scrollIntoViewIfNeeded();
  await editingCard.screenshot({ path: path.join(outDir, 'web-approval-editing.png') });

  // 3) Failed -> rollback (deterministic via the header force-fail switch).
  // 重新分析 regenerates fresh cards, so no need to cancel the editor first.
  await page.locator('.ant-switch').first().click(); // 强制执行失败 on
  await page.getByRole('button', { name: '重新分析' }).first().click();
  await page.getByText('建议动作（2）').waitFor({ timeout: 15000 });
  // The followup (low-risk) card is the only one with an enabled 确认执行.
  await page.getByRole('button', { name: '确认执行' }).and(page.locator(':not([disabled])')).click();
  // Wait for the card's failed Alert (exact, so it doesn't match the header's
  // "强制执行失败" switch label).
  await page.getByText('执行失败', { exact: true }).waitFor({ timeout: 15000 });
  // AntD v5 auto-inserts a space between two CJK chars: the button reads "回 滚".
  await page.getByRole('button', { name: /回\s*滚/ }).first().click();
  await page.getByText('已回滚', { exact: true }).waitFor({ timeout: 10000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'web-rollback.png') });

  console.log('Captured: web-workbench.png, web-approval-editing.png, web-rollback.png');
} finally {
  await browser.close();
}
