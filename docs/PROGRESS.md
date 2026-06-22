# PROGRESS — AI Agent Desk 接力进度

> 接力交接班记录。**每个 Step 收尾、以及任何停止工作前，必须更新本文件并 commit。**
> 下一个接手的 Agent（Claude Code 或 Codex）以本文件判断从哪里继续，**不重做已完成 Step**。
> 本文件不改变 frozen spec（`docs/PRD.md`），只记录实现进度与状态。协议见 `docs/HANDOFF.md`。

## 当前状态

- 当前 Step：**Step 6 已完成，等待人类评审**（评审通过前不要开始 Step 7）
- 子状态：done — Web 侧 AI 分析触发链路打通：触发 → `mockLLMAdapter` → AIAnalysis + ToolAction 渲染 + §5.2 分流标注 + fallback UI（dev 预览实测通过）
- 最后工作的 Agent：Claude Code（Opus）
- 最后 commit：`Step 6: AI 分析触发（mockLLMAdapter → AIAnalysis + ToolAction 渲染 + 分流标注）`
- 当前分支：main
- 是否有未提交改动：否
- 质量闸门（`pnpm -w check`）：✅ 全绿（typecheck × 4 包 + eslint + vitest 21 passed）；dev 预览实测：触发→建议→两动作（RN/Web 分流）渲染 ✅ 无 console 错误

## 下一步（接手者先做这个）

> ⏸ **先等人类评审通过 Step 6。** 通过后再做 §14 Step 7：**承重墙 ToolApprovalCard**（PRD §9）。把 Step 6 的 `SuggestedActionPreview` 升级为真正的审批卡：用 `@xstate/react`（`useMachine`/`useActor`）绑定 shared 的 `approvalMachine`（一个 ToolAction 一台实例）；editing 态用 `TOOL_ACTION_PARAMS_SCHEMAS[action.type]` **schema 驱动**渲染参数表单（不硬编码字段，§9.5），编辑写 `editedParams` 草稿、支持 `originalParams` vs 草稿 diff、SAVE 时 Zod 校验通过再写回 `params`；各状态（suggested/editing/executing/success/failed/rejected/rollback）UI 呈现；**每个关键动作写入 Timeline**（§6.1.5 / §9.5）。React19 hook（useActionState/useOptimistic）只用于表现层，状态流转归 XState（ADR-0001 红线）。注意：低风险动作（create_followup_task）走 Web 审批可在卡上操作；medium/high（send_coupon）在 Web 只可看/改参不可批（§5.2），其完整裁决在 RN（Step 9）。失败演示用 Header 的「强制执行失败」开关（Step 8 接线）。

## Step 清单（对应 PRD §14）

- [x] Step 1 — monorepo 基础（.npmrc / metro / exports / tsconfig references）
- [x] Step 2 — shared 类型与 Zod schema（Zod-first + `TOOL_ACTION_PARAMS_SCHEMAS` + 分流策略）
- [x] Step 3 — XState `approvalMachine`（§9.3 全部转移，含 CANCEL）
- [x] Step 4 — Mock LLM Adapter（过 `AIAnalysisSchema` + fallback）
- [x] Step 5 — Web 工作台三栏骨架
- [x] Step 6 — AI 分析触发（生成 AIAnalysis + ToolAction）
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
- Step 6 产物：`api/workbench-queries.ts` 加 `useAnalysis`（读）+ `useTriggerAnalysis`（mutation 调 `mockLLMAdapter`，写 `mock/analysis-store.ts` 内存库 + `setQueryData`）。`features/workbench/AiSuggestionPanel.tsx`（触发按钮 / §7.4 展示 / fallback Alert / `App.useApp()` toast）+ `SuggestedActionPreview.tsx`（动作只读预览 + `requiresMobileApproval` 分流徽标）。`ConversationDetailPanel` 用 AiSuggestionPanel 替换占位。labels 加 SENTIMENT/TOOL_ACTION_TYPE。
- 注意（设计使然，已记 DECISIONS）：mock 为单一固定场景，**任意会话触发都返回 §11.3 price_negotiation**；demo 用张女士这条。SuggestedActionPreview 是只读预览，Step 7 升级为带状态机的 ToolApprovalCard。
- 实现级决策见 `docs/DECISIONS.md`，Step 7 起请沿用。
