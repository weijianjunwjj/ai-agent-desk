# PROGRESS — AI Agent Desk 接力进度

> 接力交接班记录。**每个 Step 收尾、以及任何停止工作前，必须更新本文件并 commit。**
> 下一个接手的 Agent（Claude Code 或 Codex）以本文件判断从哪里继续，**不重做已完成 Step**。
> 本文件不改变 frozen spec（`docs/PRD.md`），只记录实现进度与状态。协议见 `docs/HANDOFF.md`。

## 当前状态

- 当前 Step：**Step 5 已完成，等待人类评审**（评审通过前不要开始 Step 6）
- 子状态：done — `apps/web` 三栏工作台骨架（AntD v5 + RR7 + TanStack Query + Zustand）渲染通过（dev 预览截图确认，无 console 错误）
- 最后工作的 Agent：Claude Code（Opus）
- 最后 commit：`Step 5: Web 三栏工作台骨架（AntD v5 + RR7 + TanStack Query + Zustand）`
- 当前分支：main
- 是否有未提交改动：否
- 质量闸门（`pnpm -w check`）：✅ 全绿（typecheck × 4 包 + eslint + vitest 21 passed）；web `vite build` ✅；dev 预览渲染 ✅ 无 console 错误

## 下一步（接手者先做这个）

> ⏸ **先等人类评审通过 Step 5。** 通过后再做 §14 Step 6：实现 AI 分析触发。选中会话 → 触发客户消息 → 调 `mockLLMAdapter.analyzeConversation`（已就绪，走 TanStack Query mutation）→ 生成 `AIAnalysis` + `ToolAction`。把结果写进消息流（ai_suggestion 消息）与右栏，并据 `requiresMobileApproval(action.riskLevel)` 标注分流；fallback（`isFallbackAnalysis`）要有 UI。ToolApprovalCard 本体留到 Step 7。注意承重墙优先：别铺浅页面，先把触发→建议→（后续）审批这条链路做实。当前 AI 建议区是占位 Alert（`ConversationDetailPanel.tsx`），Step 6 替换为真实建议渲染。

## Step 清单（对应 PRD §14）

- [x] Step 1 — monorepo 基础（.npmrc / metro / exports / tsconfig references）
- [x] Step 2 — shared 类型与 Zod schema（Zod-first + `TOOL_ACTION_PARAMS_SCHEMAS` + 分流策略）
- [x] Step 3 — XState `approvalMachine`（§9.3 全部转移，含 CANCEL）
- [x] Step 4 — Mock LLM Adapter（过 `AIAnalysisSchema` + fallback）
- [x] Step 5 — Web 工作台三栏骨架
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
- Step 5 产物（`apps/web/src`）：`main.tsx`（首行 import AntD React19 patch）→ `app/providers.tsx`（QueryClient + ConfigProvider + AntD `App`）→ `app/router.tsx`（RR7 单路由 `/` → `App` → `WorkbenchLayout`）。状态：`store/workbench-store.ts`（Zustand：selectedConversationId / statusFilter / forceNextExecutionFailure）。数据：`mock/fixtures.ts`（静态占位，typed against shared；含张女士 price 案，复用 mock-ai 的 `DEMO_CUSTOMER_MESSAGE`）+ `api/workbench-queries.ts`（TanStack Query 包装）。布局：`features/workbench/`（WorkbenchLayout/Header/ConversationListPanel/ConversationDetailPanel/CustomerContextPanel）。`lib/labels.ts`+`lib/format.ts` 工具。
- Step 5 仅骨架：AI 建议区是占位 Alert，审批卡未做；Header 的「强制执行失败」开关已接 store 但 Step 8 才生效。`.claude/launch.json` 配了 web dev（端口 5174）供预览/`/run`。
- 实现级决策见 `docs/DECISIONS.md`，Step 6 起请沿用。
