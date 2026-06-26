# PROGRESS — AI Agent Desk 接力进度

> 接力交接班记录。**每个 Step 收尾、以及任何停止工作前，必须更新本文件并 commit。**
> 下一个接手的 Agent（Claude Code 或 Codex）以本文件判断从哪里继续，**不重做已完成 Step**。
> 本文件不改变 frozen spec（`docs/PRD.md`），只记录实现进度与状态。协议见 `docs/HANDOFF.md`。

## 当前状态

- 当前阶段：**v0.2 后端纵切 · M1 完成（2026-06-26）** —— 人类已立项的 frozen-v0.1 之外增强（见 `docs/adr/0002-*.md`）。v0.1 仍 sealed 于 tag `v1.0.0`。
- 子状态：M1 done — 新增 `apps/server`（NestJS + Prisma + SQLite）骨架；`LLMAdapter` 接口迁入 shared；shared 加严「禁 Node 内置」红线 + 反例测试；Prisma 两张表（ToolAction / TimelineEvent）字段对齐 shared 并有对齐契约测试。monorepo 5 包（workspace 6 项目）。
- 最后工作的 Agent：Claude Code（Opus）
- 最后 commit：（本次 M1 提交）`M1: server skeleton + shared 接缝整理`
- 当前分支：**feat/v0.2-m1-server-skeleton**（未 push，等人类 review 后再决定推送/开 PR）
- 是否有未提交改动：否（M1 已提交）
- 质量闸门（`pnpm -w check`）：✅ 全绿 — typecheck × 6 workspace 项目（含 server `prisma generate && tsc`）+ eslint + vitest **26 passed**（shared 18 含 3 条边界反例 / mock-ai 6 / server 2 对齐）。本地 smoke：`pnpm --filter @ai-agent-desk/server dev` 起 Nest、`GET /health`→`{"status":"ok"}`、启动日志确认运行时消费 shared。

## v0.2 里程碑（任务书 M1→M4 串行，各自独立 PR）

- [x] **M1** — 服务端骨架 + shared 接缝整理（本次完成）
- [ ] **M2** — LLM Gateway（`RealLLMAdapter` + `LLM_PROVIDER` 切换 + 服务端 `AIAnalysisSchema` 校验 + `POST /sessions/:id/suggest` SSE）
- [ ] **M3** — 审批 + Timeline 持久化（`POST /actions/:id/transition` 用 shared XState 校验合法转移、非法 409；append-only Timeline；Web/RN 改打服务端）
- [ ] **M4** — 工具执行端点（Mock CRM 进程内 stub；`POST /actions/:id/execute`；幂等 idempotency key；失败/人工→补偿回滚）

## 下一步（接手者先做这个）

> ▶ **从 M2 开始**，先读 `docs/adr/0002-v0.2-backend-vertical-slice.md`（§2 已固化 LLM provider/key/SSE/确定性隔离方向）。M2 一个独立 PR，DoD 绿了再进 M3。
>
> 接手须知（M1 留下的接缝）：
> - 服务端运行时＝`ts-node` + `tsconfig-paths/register` + `apps/server/tsconfig.json` 的 `moduleTypes`（强制 shared/mock-ai 的 `.ts` 按 cjs 加载，绕过其 `package.json "type":"module"`）。回退方案＝SWC（见 ADR-0002 §5）。
> - 服务端消费 shared 的同一份 `AIAnalysisSchema` / `approvalMachine` / `requiresMobileApproval`，**不得另起平行规则**（任务书 §0）。
> - 真模型只本地 smoke、不入 CI；CI 已为 server typecheck 的 `prisma generate` 注入 throwaway `DATABASE_URL`（见 `.github/workflows/ci.yml`）。
> - `apps/server/.env` 本地用（gitignored）；`.env.example` 已占位 M2 的 `LLM_PROVIDER`/key。

## Step 清单（对应 PRD §14）

- [x] Step 1 — monorepo 基础（.npmrc / metro / exports / tsconfig references）
- [x] Step 2 — shared 类型与 Zod schema（Zod-first + `TOOL_ACTION_PARAMS_SCHEMAS` + 分流策略）
- [x] Step 3 — XState `approvalMachine`（§9.3 全部转移，含 CANCEL）
- [x] Step 4 — Mock LLM Adapter（过 `AIAnalysisSchema` + fallback）
- [x] Step 5 — Web 工作台三栏骨架
- [x] Step 6 — AI 分析触发（生成 AIAnalysis + ToolAction）
- [x] Step 7 — ToolApprovalCard（schema 驱动参数表单 + diff + Timeline 写入）
- [x] Step 8 — 打通 Web 闭环（含 failed→rollback 确定性演示）
- [x] Step 9 — RN 审批端（Expo Router 三屏 + 复用 shared）
- [x] Step 10 — Expo Notifications 模拟推送链路
- [x] Step 11 — 产出 README.md / docs/STATE_MACHINE.md / docs/DEMO_SCRIPT.md

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
- Step 9 产物：`apps/mobile` 转 Expo Router（entry=`index.ts`→`expo-router/entry`；`App.tsx` 弃用占位返回 null，因无法 rm）。`app/_layout.tsx`(Stack) + `app/index.tsx`(待审批列表 FlashList) + `app/approval/[id].tsx`(详情，绑 `approvalMachine`，4 裁决) + `app/receipt/[id].tsx`(回执)。`src/store/approval-store.ts`(Zustand) + `src/mock/seed.ts`(跑 mockLLMAdapter→`requiresMobileApproval` 过滤出 RN 任务，故只剩 send_coupon) + `src/components/ParamsEditor.tsx`(原生 schema 驱动表单) + `src/lib/{labels,format}`。`getSchemaFields` 已**移到 `packages/shared/src/schema-fields.ts`**（web/RN 共用），web `lib/schema-fields.ts` 改为再导出。app.json 加 scheme `aiagentdesk` + web bundler metro + platforms 含 web。`.claude/launch.json` 加 `mobile-web`（端口 8082）。
- 守住：RN 只做审批收件箱（不重做工作台）；修改后同意=EDIT→SAVE→APPROVE 复用现有转移（§5.2）；表单原生最小实现 + Zod 校验（§8.3）。
- Step 10 产物：`src/notifications.ts`（`setNotificationHandler` + `ensureNotificationPermission` + `sendApprovalPush`，本地通知、web 返回 false 触发降级）；`app/_layout.tsx` 加 `addNotificationResponseReceivedListener` → 点通知跳 `/approval/[id]`（native）；`app/index.tsx` 每张卡加「模拟收到推送」按钮（native 发本地通知；web 直达详情）+ 已推送标记；store 加 `pushedTaskIds`/`markPushed`。expo-notifications `~0.32.17`（手动按 bundledNativeModules 版本加，因 expo install 在本机 pnpm 偶发 spawn 失败）。
- 运维注意：preview `expo start --web` 停止后可能残留 metro/jest-worker node 进程，会锁 `node_modules/metro-core` 致下次 `pnpm install` ENOENT；解法是杀掉 ai-agent-desk 的 expo/jest-worker 进程后重装（本步已遇到并处理）。
- 实现级决策见 `docs/DECISIONS.md`，Step 11 起请沿用。
