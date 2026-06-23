# DECISIONS — AI Agent Desk 实现级决策日志

> 只记录 **frozen spec（`docs/PRD.md`）未规定的实现级选择**，让接力的下一个 Agent 保持一致、不重新发明。
> **已被 PRD 决定的事（技术栈、状态机、审批分流、Zod-first 等）不在此记录，也不在此推翻。**
> 若你不同意某条已记录的决策：**不要悄悄改**——在此追加说明，必要时交人类裁决。

## 适用范围（什么该记这里）

记：目录与命名约定、组件拆分粒度、Zustand store 切片方式、mock 数据组织、测试取舍、依赖的具体版本/用法等 PRD 没写死的工程选择。

不记：任何 PRD 已规定的内容（用 PRD 的 §引用即可，不复制、不修改）。

## 记录格式

每条一段：`日期 · Step · 决策 / 背景 / 由谁（CC | Codex）`。

## 决策记录

<!-- 示例（实现时按此格式追加，可删除本示例）：
### 2026-XX-XX · Step 1 · 目录与命名
- 决策：apps/web 用 `src/features/<domain>` 组织；组件文件 PascalCase。
- 背景：PRD 未规定 web 内部目录结构。
- 由：CC
-->

### 2026-06-22 · Step 1 · 包命名与工具链基线
- 决策：workspace 包统一用 scope `@ai-agent-desk/*`（`shared` / `mock-ai` / `web` / `mobile`），互相依赖用 `workspace:*`。工具链基线：TypeScript ^5.7、ESLint 9（flat config）+ typescript-eslint 8、Vitest 2、Vite 6。pnpm 经 `packageManager` 钉在 9.15.2。React / Expo 基线见下方「React/Expo 基线（ADR-0001 Accepted）」条。
- 背景：PRD 未规定包名前缀与具体版本。
- 由：CC

### 2026-06-22 · Step 1 · React/Expo 基线（ADR-0001 Accepted）
- 决策：React 19.1 + Expo SDK 54（RN 0.81）；Web 精确对齐 mobile 经 expo install 推导的 React 版本，hoisted 单实例；AntD 留 v5 + @ant-design/v5-patch-for-react-19（入口 import）。
- 边界：React 19 的 useActionState/useOptimistic/use 仅限 UI 表现层；ToolAction 状态仍归 XState（§12.3）。
- 背景：PRD §3 未钉 React 主版本；现 mobile 仅骨架，切换成本最低。
- 由：人类批准 + Claude/GPT 评审。

### 2026-06-22 · Step 1 · TS 解析（path vs references）
- 决策：跨包类型解析靠 `tsconfig.base.json` 的 `paths`（指向各包 `src/index.ts` 源码）；各包 `tsconfig.json` 用 `tsc --noEmit`、**不写 `references` 字段**（避免 composite 约束）。根 `tsconfig.json` 保留 `references` 数组，仅作 IDE / 工作区项目图谱，质量闸门不跑 `tsc -b`。各包 `exports`/`main`/`types` 直指 `./src/index.ts`，让 Vite(esbuild) 与 Metro 直接吃 TS 源码、免构建。
- 背景：PRD §14 Step 1 要求“配 tsconfig path/references”，但 composite + `noEmit` 互斥会让 per-package typecheck 变复杂；此方案两个要求都满足且 `pnpm -w check` 稳定全绿。
- 由：CC

### 2026-06-22 · Step 1 · 质量闸门脚本形态
- 决策：根 `check` = `typecheck && lint && test`。`typecheck` = `pnpm -r --workspace-concurrency=1 typecheck`（每包 `tsc --noEmit`）；`lint` = 根 `eslint .`（flat config 覆盖全仓）；`test` = `pnpm -r test`，仅 `shared`/`mock-ai` 定义 `vitest run --passWithNoTests`（Step 1 无测试文件即绿，契约测试随 Step 2–4 补）。
- 背景：PRD §12 给的 `pnpm -w exec tsc --noEmit && pnpm -w lint && pnpm -w test` 是建议，明确允许“按实际包结构调整”。
- 由：CC

### 2026-06-22 · Step 1 · ESLint flat config 边界规则
- 决策：用 ESLint 9 flat config（`eslint.config.mjs`）。TS 文件关 `no-undef`（交给 tsc）；`**/*.{js,cjs,mjs}` 给 node globals 并关 `@typescript-eslint/no-require-imports`（`metro.config.js` 是 CommonJS）。架构红线：`packages/shared/**` 用 `no-restricted-imports` 禁 `react` / `react-dom` / `react-native` / `@xstate/react` / `antd` / `@ant-design/*`（PRD §3.4 / §13）。
- 背景：PRD §12 要求把 shared 不引 UI 的红线自动化为 lint 失败。
- 由：CC

### 2026-06-22 · Step 2 · shared schema 组织与 zod 版本
- 决策：`packages/shared/src` 按 PRD §10 依赖顺序一文件一域拆分（`enums` / `tool-action-params` / `tool-action` / `ai-analysis` / `conversation` / `customer` / `message` / `timeline-event` / `approval-task` / `approval-routing`），`index.ts` 仅做 barrel 重导出。契约测试与被测源码同目录（`approval-routing.test.ts`）。zod 钉 **v3（^3.25.76）**，不上 zod v4。
- 背景：PRD §10 未规定 shared 内部文件划分；一域一文件便于评审对照章节。zod v4 改了 `z.record` 等签名，会迫使改动 PRD §10 冻结的 schema 写法（如 `z.record(z.unknown())`），故留 v3 以忠实复刻冻结数据模型。
- 由：CC

### 2026-06-22 · Step 3 · approvalMachine 建模取舍
- 决策：用 XState v5 `setup().createMachine`。`approved` 瞬时态用 `always` 自动转移到 `executing`（推荐表的 `approved--EXECUTE-->executing` 落地为自动转移，app 不手动派发 EXECUTE）。`rejected`/`rollback` 建模为**无出向转移的普通终态**（不用 `type:'final'`，避免 actor 停止、便于 UI 持续读状态）。机器无 guard、无 action/I-O；副作用（Timeline 写入、mock 执行、参数校验）留 app 层以保 shared 纯净。事件无 payload。
- 背景：PRD §9.3 要求瞬时 approved 且实现全部转移；§3.4/§12.3 要求 shared 无 React/无 I/O。
- 由：CC

### 2026-06-22 · Step 4 · Mock LLM Adapter 形态
- 决策：`mock-ai` 拆 `types`（§11.2 服务接口，非数据模型，可写 interface）/ `adapter` / `fallback` / barrel。本期单一固定场景（§11.3），任意非空消息都返回 price_negotiation；构建无类型 candidate 后用 `AIAnalysisSchema.parse` 作唯一类型闸门（happy path 通过、异常落 fallback）。rawOutput 存「模型原始文本」JSON 串。fallback 用 sentinel `intent='analysis_unavailable'` + `isFallbackAnalysis()` 表达（不改冻结 schema、不加字段）；空消息或 parse 异常即 fallback。id 用模块内计数器 + `Date.now()`（避免依赖 `crypto.randomUUID`，RN/Hermes 不保证）。
- 背景：PRD §11 要求纯 TS、过 Zod、初始化 original/edited、提供 fallback；§11.3 只规定单一 demo case，故不发明第二场景。
- 由：CC

### 2026-06-22 · Step 5 · Web 目录结构与 provider 组织
- 决策：`apps/web/src` 按 `app/`（providers + router）、`features/<domain>/`（组件，PascalCase）、`store/`（Zustand）、`api/`（TanStack Query hooks）、`mock/`（静态 fixtures）、`lib/`（labels/format 工具）分层。Provider 顺序：`QueryClientProvider` > AntD `ConfigProvider` > AntD `App`（用 `App.useApp()` 上下文式反馈，配合 React19 patch）。RR7 用 `createBrowserRouter`，单路由 `/`→`App`→`WorkbenchLayout`；会话选择放 Zustand（§12.2）而非 URL，深链留后续。三栏用 AntD `Layout`（Header + 左右 `Sider` + `Content`）。`@ant-design/v5-patch-for-react-19` 在 `main.tsx` 首行 import。
- 背景：PRD §7.1 规定三栏与 Header 内容、§3.2 钉技术栈、§12 分 server/UI 状态；目录划分 PRD 未规定。无法用 rm 删除占位 `App.tsx`（sandbox 拒绝），故改造为 app 根组件由 router 渲染。
- 由：CC

### 2026-06-22 · Step 7 · ToolApprovalCard 实现取舍
- 决策：卡用 `@xstate/react` 的 `useMachine(approvalMachine)` 绑定（一动作一实例）；**状态只归 XState**，React `useState` 仅持表现数据（params/draft/errors/failedReason/executedAt）。schema 驱动表单靠 `lib/schema-fields.ts` 读 **zod v3 `_def.typeName/checks/values`** 内省（zod v4 改了内省，故又一处依赖 v3）。执行 I/O 放 app 层 `useEffect`（监听 status==='executing'）+ setTimeout，用 cleanup 防 StrictMode 重复，按 `forceNextExecutionFailure` 确定性决定成败并一次性复位（机器保持纯净，不在 shared 里 invoke）。Timeline 写入在各事件 handler 与执行回调里（非 status effect，避免重复写）。`SuggestedActionPreview` 复用为只读 body（无法 rm 删文件，故复用而非废弃）。机器状态不跨重挂载持久化（demo 线性操作，已知简化）。
- 背景：PRD §9/§9.5/§12.3 要求 schema 驱动、状态归状态机、shared 纯净；ADR-0001 红线 React19 hooks 不管业务状态。
- 由：CC

### 2026-06-22 · Step 8 · 会话状态联动（派生而非落库）
- 决策：会话 `status` / `pendingActionCount` **不持久化**，在 `useConversations` 的 `deriveConversation` 里据 `analysisStore`（会话的动作）+ `actionStatusStore`（actionId→当前 status）实时派生：pending = 不在 {success,rejected,rollback} 的动作数；pending>0→waiting_approval，全部 resolved 且有 success→followed_up。卡用 `useActionStatusSync`（effect，每次 status 变化、approved 瞬时跳过）写投影并 invalidate ['conversations']。`conversation_status_updated` Timeline 在 trigger（待审批）与执行成功时写。失败/回滚的确定性由 Step 7 已接的 `forceNextExecutionFailure` 提供。
- 背景：PRD §14 Step 8 要会话状态更新 + §5.1 闭环；派生避免双写真相、与 XState（每卡状态真相）一致。
- 由：CC

### 2026-06-23 · Step 9 · RN 审批端实现取舍
- 决策：`apps/mobile` 用 Expo Router（文件路由 `app/`，entry=`index.ts` 引 `expo-router/entry`；旧 `App.tsx` 改为返回 null 的弃用占位，因 sandbox 不能删文件）。三屏：列表(FlashList v2，无需 estimatedItemSize)/详情/回执。详情绑 shared `approvalMachine`，四裁决映射 §5.2（修改后同意=EDIT→SAVE→APPROVE，执行成功→回执）；执行用 `useEffect(status==='executing')`+setTimeout（RN demo 走 success 分支）。inbox 数据由 `seed.ts` 跑 `mockLLMAdapter` + `requiresMobileApproval` 过滤（只出 send_coupon），体现 shared/mock-ai 复用。`getSchemaFields` 从 web 移入 `packages/shared/src/schema-fields.ts`（纯逻辑、无 UI，web 与 RN 共用；web 旧路径改为再导出）。原生表单 `ParamsEditor` 用 TextInput/Pressable chips，提交时用同一 per-type Zod schema 校验。加 web 平台支持（react-native-web + app.json platforms 含 web + bundler metro）便于浏览器预览验证；真机 iOS 由人类 Expo Go 验收。导航用 `router.push({pathname:'/approval/[id]',params})` 对象式（typed-routes 安全）。
- 背景：PRD §3.3/§8 钉 Expo Router 三屏 + §8.3 原生表单 + §5.2 复用转移；用户只有 iOS 无安卓，故加 web 预览路径。
- 由：CC

### 2026-06-22 · Step 1 · Expo monorepo 解析
- 决策：`.npmrc` 写 `node-linker=hoisted` + `strict-peer-dependencies=false`；同时在 `apps/mobile/metro.config.js` 配 `watchFolders=[workspaceRoot]` 与 `nodeModulesPaths=[本地, 根]`（双保险，二者 PRD 是“或”关系）。mobile 入口用 `index.ts` + `registerRootComponent`；tsconfig `extends expo/tsconfig.base` 并本地重声明 `paths` 指向 shared 源码。
- 背景：PRD §14 Step 1 要求保证 Expo/Metro 能解析 `packages/shared`。
- 由：CC
