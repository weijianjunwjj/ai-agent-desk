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

### 2026-06-22 · Step 1 · 包命名与版本基线
- 决策：workspace 包统一用 scope `@ai-agent-desk/*`（`shared` / `mock-ai` / `web` / `mobile`），互相依赖用 `workspace:*`。工具链基线：TypeScript ^5.7、ESLint 9（flat config）+ typescript-eslint 8、Vitest 2、Vite 6 + React 18.3、Expo SDK 52 + RN 0.76.5（React 18.3.1）。pnpm 经 `packageManager` 钉在 9.15.2。
- 背景：PRD 未规定包名前缀与具体版本。React 在 web(^18.3.1) 与 mobile(18.3.1, Expo 钉版) 同主版本，配合 `node-linker=hoisted` 单实例 hoist。
- 由：CC

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

### 2026-06-22 · Step 1 · Expo monorepo 解析
- 决策：`.npmrc` 写 `node-linker=hoisted` + `strict-peer-dependencies=false`；同时在 `apps/mobile/metro.config.js` 配 `watchFolders=[workspaceRoot]` 与 `nodeModulesPaths=[本地, 根]`（双保险，二者 PRD 是“或”关系）。mobile 入口用 `index.ts` + `registerRootComponent`；tsconfig `extends expo/tsconfig.base` 并本地重声明 `paths` 指向 shared 源码。
- 背景：PRD §14 Step 1 要求保证 Expo/Metro 能解析 `packages/shared`。
- 由：CC
