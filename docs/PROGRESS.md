# PROGRESS — AI Agent Desk 接力进度

> 接力交接班记录。**每个 Step 收尾、以及任何停止工作前，必须更新本文件并 commit。**
> 下一个接手的 Agent（Claude Code 或 Codex）以本文件判断从哪里继续，**不重做已完成 Step**。
> 本文件不改变 frozen spec（`docs/PRD.md`），只记录实现进度与状态。协议见 `docs/HANDOFF.md`。

## 当前状态

- 当前 Step：**Step 8 已完成，等待人类评审**（评审通过前不要开始 Step 9）
- 子状态：done — Web 闭环打通：会话 status/pendingActionCount 随动作生命周期派生联动 + conversation_status_updated Timeline + 确定性 failed→rollback（forceNextExecutionFailure）整链
- 最后工作的 Agent：Claude Code（Opus）
- 最后 commit：`Step 8: 打通 Web 闭环（会话状态联动 + 确定性 failed→rollback + Timeline）`
- 当前分支：main
- 是否有未提交改动：否
- 质量闸门（`pnpm -w check`）：✅ 全绿（typecheck × 4 包 + eslint + vitest 21 passed）；web `vite build` ✅。注意：本次 dev 预览 screenshot 工具间歇性超时（无 console 错误，属预览渲染器抓图不稳定），Step 8 的卡片交互在 Step 7 已实测；Step 8 增量（状态派生 + Timeline 事件）经 check + build + 代码核对验证。下次开发可重试预览实测整链。

## 下一步（接手者先做这个）

> ⏸ **先等人类评审通过 Step 8。** 通过后再做 §14 Step 9：搭 `apps/mobile` RN 审批端（PRD §8，Expo Router 三屏：待审批列表 / 审批详情 / 状态回执）。**复用 `packages/shared`** 的类型/schema/`approvalMachine`/`requiresMobileApproval`；RN 只做审批收件箱，不重做工作台（§13.1.15）。审批详情「修改后同意」用 per-type 参数 Zod schema 校验，但表单用**原生 RN 组件**最小实现（AntD 不在 RN，§8.3）。RN 裁决→状态机映射全复用现有转移（§5.2）：同意 APPROVE / 拒绝 REJECT / 修改后同意 EDIT→SAVE→APPROVE / 稍后处理 ApprovalTask.delayed。ApprovalTask 列表数据本期可用 RN 本地 mock（与 Web 跨进程同步不在 MVP 真实链路；Step 10 用 Expo Notifications 模拟推送链路）。`@xstate/react` 在 mobile 也要装（shared 不含）。

## Step 清单（对应 PRD §14）

- [x] Step 1 — monorepo 基础（.npmrc / metro / exports / tsconfig references）
- [x] Step 2 — shared 类型与 Zod schema（Zod-first + `TOOL_ACTION_PARAMS_SCHEMAS` + 分流策略）
- [x] Step 3 — XState `approvalMachine`（§9.3 全部转移，含 CANCEL）
- [x] Step 4 — Mock LLM Adapter（过 `AIAnalysisSchema` + fallback）
- [x] Step 5 — Web 工作台三栏骨架
- [x] Step 6 — AI 分析触发（生成 AIAnalysis + ToolAction）
- [x] Step 7 — ToolApprovalCard（schema 驱动参数表单 + diff + Timeline 写入）
- [x] Step 8 — 打通 Web 闭环（含 failed→rollback 确定性演示）
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
- Step 7 产物：`features/workbench/ToolApprovalCard.tsx`（`useMachine(approvalMachine)`，一动作一实例；状态归 XState，React state 仅存 params/draft/errors/failedReason 表现数据）。`SchemaParamsForm.tsx` + `lib/schema-fields.ts`（读 zod v3 `_def` 内省，按 `TOOL_ACTION_PARAMS_SCHEMAS[type]` 渲染，不硬编码字段）。`SuggestedActionPreview.tsx` 改为只读 body（被卡复用）。`mock/timeline-store.ts` + `useTimelineWriter`：卡在 SAVE/APPROVE/executing/success/failed/rollback/reject 写 Timeline；触发时写 ai_analysis_created + tool_action_suggested。执行用 `useEffect`（status==='executing'）+ setTimeout，按 `forceNextExecutionFailure` 确定性决定成败并一次性复位。
- 关键约束守住：状态机不散落（§12.3）；schema 驱动表单（§9.5）；§5.2 分流——medium/high 在 Web 禁批（确认/拒绝 disabled + 说明），low 可批。React19 hooks 未用于状态流转（ADR-0001 红线）。
- Step 8 产物：`mock/action-status-store.ts`（actionId→status 投影）；`api/workbench-queries.ts` 的 `deriveConversation` 据 analysisStore + actionStatusStore 派生会话 status/pendingActionCount（pending = 不在 success/rejected/rollback）；`useActionStatusSync` 由卡 effect 调用（每次 status 变化，approved 瞬时跳过）；trigger 写 conversation_status_updated「待审批」、卡执行成功写 conversation_status_updated。会话 status 全派生、不落库；张女士两动作中 send_coupon 走 RN 故 Web 闭环后仍保留 1 pending（waiting_approval），符合预期（其裁决在 Step 9 RN）。
- 实现级决策见 `docs/DECISIONS.md`，Step 9 起请沿用。
