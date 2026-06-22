# PROGRESS — AI Agent Desk 接力进度

> 接力交接班记录。**每个 Step 收尾、以及任何停止工作前，必须更新本文件并 commit。**
> 下一个接手的 Agent（Claude Code 或 Codex）以本文件判断从哪里继续，**不重做已完成 Step**。
> 本文件不改变 frozen spec（`docs/PRD.md`），只记录实现进度与状态。协议见 `docs/HANDOFF.md`。

## 当前状态

- 当前 Step：**Step 1 已完成，等待人类评审**（评审通过前不要开始 Step 2）
- 子状态：done — monorepo 骨架与工程配置就绪，`pnpm install` + `pnpm -w check` 全绿
- 最后工作的 Agent：Claude Code（Opus）
- 最后 commit：`Step 1: monorepo 骨架与工程配置`
- 当前分支：main
- 是否有未提交改动：否
- 质量闸门（`pnpm -w check`）：✅ 全绿（typecheck × 4 包 + eslint + vitest passWithNoTests）

## 下一步（接手者先做这个）

> ⏸ **先等人类评审通过 Step 1。** 通过后再做 §14 Step 2：在 `packages/shared` 定义 Zod-first 类型与 schema（枚举 → 参数 schema + `TOOL_ACTION_PARAMS_SCHEMAS` 注册表 → ToolAction 判别联合 → AIAnalysis → Conversation/Customer/Message → TimelineEvent → ApprovalTask），并加审批分流策略 `MOBILE_APPROVAL_RISK_THRESHOLD` + `requiresMobileApproval`（见 PRD §10 / §5.2）。types 一律 `z.infer` 派生，不写平行 interface。随该 Step 补 §12 契约测试（分流 low→Web、medium/high→RN）。

## Step 清单（对应 PRD §14）

- [x] Step 1 — monorepo 基础（.npmrc / metro / exports / tsconfig references）
- [ ] Step 2 — shared 类型与 Zod schema（Zod-first + `TOOL_ACTION_PARAMS_SCHEMAS` + 分流策略）
- [ ] Step 3 — XState `approvalMachine`（§9.3 全部转移，含 CANCEL）
- [ ] Step 4 — Mock LLM Adapter（过 `AIAnalysisSchema` + fallback）
- [ ] Step 5 — Web 工作台三栏骨架
- [ ] Step 6 — AI 分析触发（生成 AIAnalysis + ToolAction）
- [ ] Step 7 — ToolApprovalCard（schema 驱动参数表单 + diff + Timeline 写入）
- [ ] Step 8 — 打通 Web 闭环（含 failed→rollback 确定性演示）
- [ ] Step 9 — RN 审批端（Expo Router 三屏 + 复用 shared）
- [ ] Step 10 — Expo Notifications 模拟推送链路
- [ ] Step 11 — 产出 README.md / docs/STATE_MACHINE.md / docs/DEMO_SCRIPT.md

> 节奏：Step 2–3 完成后先让 `tsc` 全绿再进 UI；不要一口气铺到 RN。

## 活跃卡点（blocker）

- 无（非阻塞）：唯一事实源文件名是 `docs/AI_Agent_Desk_PRD_v0.3.1_FROZEN.md`，但 `CLAUDE.md` / `AGENTS.md` / PRD §3.1 里写的是 `docs/PRD.md`。内容齐全，不影响实现；是否要改名或加别名留给人类裁决（未擅自改）。

## 给下一个 Agent 的备注

- Step 1 仅骨架，无业务代码：`packages/shared`、`packages/mock-ai` 的 `src/index.ts` 只是占位常量；`apps/web`、`apps/mobile` 只有最小可编译外壳。
- 质量闸门跑法：根目录 `pnpm -w check`（= `typecheck` + `lint` + `test`）。typecheck 是 `pnpm -r tsc --noEmit`，跨包靠 `tsconfig.base.json` 的 `paths` 解析 TS 源码；root `tsconfig.json` 的 `references` 仅供 IDE / 工作区图谱（check 不跑 `tsc -b`）。
- 实现级决策见 `docs/DECISIONS.md`（包命名、版本、metro/eslint 取舍），Step 2 起请沿用。
