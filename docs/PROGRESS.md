# PROGRESS — AI Agent Desk 接力进度

> 接力交接班记录。**每个 Step 收尾、以及任何停止工作前，必须更新本文件并 commit。**
> 下一个接手的 Agent（Claude Code 或 Codex）以本文件判断从哪里继续，**不重做已完成 Step**。
> 本文件不改变 frozen spec（`docs/PRD.md`），只记录实现进度与状态。协议见 `docs/HANDOFF.md`。

## 当前状态

- 当前 Step：**Step 4 已完成，等待人类评审**（评审通过前不要开始 Step 5）
- 子状态：done — `packages/mock-ai` Mock LLM Adapter（固定 §11.3 demo → 过 `AIAnalysisSchema` + fallback）+ 契约测试就绪
- 最后工作的 Agent：Claude Code（Opus）
- 最后 commit：`Step 4: Mock LLM Adapter（固定 §11.3 demo + AIAnalysisSchema 校验 + fallback）`
- 当前分支：main
- 是否有未提交改动：否
- 质量闸门（`pnpm -w check`）：✅ 全绿（typecheck × 4 包 + eslint + vitest：21 passed = 分流 4 + 状态机 11 + 适配器 6）

## 下一步（接手者先做这个）

> ⏸ **先等人类评审通过 Step 4。** 通过后再做 §14 Step 5：搭 `apps/web` 三栏工作台骨架（PRD §7.1）：Header（标题/状态筛选/Demo 入口）+ 会话列表 + 消息流+AI 建议 + 客户上下文+Timeline 区域。技术栈用既定 Vite+React+TS+React Router+TanStack Query+Zustand+**AntD v5**；AntD 接入时按 ADR-0001 加 `@ant-design/v5-patch-for-react-19` 并在入口 import。Step 5 只搭骨架与布局，**不实现 AI 触发/审批逻辑**（那是 Step 6/7）。mock 数据可先用静态占位，真实 AI 触发走 `mockLLMAdapter`（已就绪）。

## Step 清单（对应 PRD §14）

- [x] Step 1 — monorepo 基础（.npmrc / metro / exports / tsconfig references）
- [x] Step 2 — shared 类型与 Zod schema（Zod-first + `TOOL_ACTION_PARAMS_SCHEMAS` + 分流策略）
- [x] Step 3 — XState `approvalMachine`（§9.3 全部转移，含 CANCEL）
- [x] Step 4 — Mock LLM Adapter（过 `AIAnalysisSchema` + fallback）
- [ ] Step 5 — Web 工作台三栏骨架
- [ ] Step 6 — AI 分析触发（生成 AIAnalysis + ToolAction）
- [ ] Step 7 — ToolApprovalCard（schema 驱动参数表单 + diff + Timeline 写入）
- [ ] Step 8 — 打通 Web 闭环（含 failed→rollback 确定性演示）
- [ ] Step 9 — RN 审批端（Expo Router 三屏 + 复用 shared）
- [ ] Step 10 — Expo Notifications 模拟推送链路
- [ ] Step 11 — 产出 README.md / docs/STATE_MACHINE.md / docs/DEMO_SCRIPT.md

> 节奏：Step 2–3 完成后先让 `tsc` 全绿再进 UI；不要一口气铺到 RN。

## 活跃卡点（blocker）

- 无。（已解决）原先唯一事实源文件名 `docs/AI_Agent_Desk_PRD_v0.3.1_FROZEN.md` 与 `CLAUDE.md` / `AGENTS.md` / PRD §3.1 的引用 `docs/PRD.md` 不一致；人类已将其重命名为 `docs/PRD.md`，现与所有引用一致。

## 给下一个 Agent 的备注

- Step 2 产物：`packages/shared/src` 按 PRD §10 依赖顺序拆文件（`enums` / `tool-action-params` / `tool-action` / `ai-analysis` / `conversation` / `customer` / `message` / `timeline-event` / `approval-task` / `approval-routing`），`index.ts` 统一 barrel 导出。全部 Zod-first，types 由 `z.infer` 派生，无平行 interface。`mock-ai/src/index.ts` 仍是占位（Step 4 才填）。
- ToolAction 参数严格按 type 定型（判别联合 + `TOOL_ACTION_PARAMS_SCHEMAS` `satisfies` 全覆盖）；唯一允许的 `z.record(z.unknown())` 只在 TimelineEvent 的 before/after snapshot（PRD §10.8）。
- zod 钉 v3（3.25.76），不上 zod v4：v4 改了 `z.record` 签名，会迫使改动 PRD §10 冻结的 schema 写法。详见 `docs/DECISIONS.md`。
- 质量闸门跑法：根目录 `pnpm -w check`（= `typecheck` + `lint` + `test`）。跨包靠 `tsconfig.base.json` 的 `paths` 解析 TS 源码；root `tsconfig.json` 的 `references` 仅供 IDE。React/Expo 基线见 `docs/adr/0001-adopt-react-19.md`（Accepted）。
- Step 3 产物：`packages/shared/src/approval-machine.ts`（XState v5 `setup().createMachine`），barrel 已导出。`approved` 用 `always` 建模瞬时态（APPROVE 后直达 executing）；`rejected`/`rollback` 为无出向终态。机器纯净：无 guard、无 I/O；副作用（Timeline/执行/校验）留 app 层。绑定库 `@xstate/react`（apps 用，shared 不引）。状态机文档见 `docs/STATE_MACHINE.md`。
- Step 4 产物：`packages/mock-ai/src`（`types`/`adapter`/`fallback`/barrel）。`mockLLMAdapter.analyzeConversation` 单一固定场景（§11.3 price_negotiation，非空消息即返回），构建 candidate 后 `AIAnalysisSchema.parse` 作类型闸门；初始化 `originalParams=params`、`editedParams` 留空、`status=suggested`。fallback：空消息或异常 → `createFallbackAnalysis`（sentinel intent `analysis_unavailable`，`isFallbackAnalysis` 检测），仍过 schema。导出 `DEMO_CUSTOMER_MESSAGE` 供 Step 6 复用。
- 实现级决策见 `docs/DECISIONS.md`，Step 5 起请沿用。
