# ADR-0001：采用 React 19（替代当前 React 18.3.1）

- 状态：**Accepted（有条件通过）** — 人类批准 + Claude / GPT 评审。采用方案 A；目标 Expo SDK 锁定 **SDK 54**（不采用 SDK 56）
- 日期：2026-06-22
- 影响 Step：Step 1（工程基线）→ 决定后回填 `docs/DECISIONS.md`，影响 Step 5+ 的 Web UI 写法
- 关联：`docs/PRD.md` §3.2 / §3.3 / §3.6 / §13；`docs/DECISIONS.md`「Step 1 · 包命名与版本基线」

---

## 1. 背景与诉求

- 现状：Step 1 把 React 钉在 `18.3.1`。原因不是 spec 要求，而是 **Expo SDK 52 把 React 锁定在 18.3.1**，而 `.npmrc` 用 `node-linker=hoisted` 要求 Web/RN 共用单一 React 实例，于是 Web 被动对齐到 18.3.1。
- 诉求：React 19 stable 已发布约 18 个月（19.0 = 2024-12，当前 stable `19.2.7`），希望在本项目体验并展示 React 19 新特性（求职展示价值，PRD §15.3）。

## 2. 是否违反 frozen spec？（先过护栏）

**结论：不违反。这是实现层版本选择，不是技术路线变更。**

- PRD §3.2 只写「React」，§3.3 只写「Expo React Native」，**均未钉 React 主版本**。
- 不触碰任何 §13.1 禁止项：不改技术路线、不引入 Next.js、不新增模块、不动 shared 的无 UI 红线、不引第二套 UI 库。
- 唯一需要小心的红线：PRD §3.6 / §13.1.13 规定 **只用 AntD v5、禁止混用两套 UI**。因此**继续用 AntD v5**（详见风险 R1），**不升级到 AntD v6**——升 v6 才会构成 spec 偏离。

> 若评审认为「React 主版本」属于已冻结技术路线，则本 ADR 降级为「请求人类裁决变更冻结基线」。我判断它属于 §3 未规定的实现细节，按 DECISIONS 流程记录即可。

## 3. 关键约束：mobile 的 React 版本由 Expo SDK 决定

RN 侧 React 版本不是自由选择项，而是随 Expo SDK 的 `bundledNativeModules` 绑定：

| Expo SDK | React | React Native | 备注 |
|---|---|---|---|
| 52（现状） | 18.3.1 | 0.76 | 当前基线 |
| 53 | 19.0 | 0.79 | 首个 React 19 SDK |
| 54 | 19.1 | 0.81 | **← 本 ADR 选定** |
| 56（当前 latest） | 19.2 | 0.85 | npm `expo@latest` = 56.0.12；**本 ADR 不采用** |

→ **「上 React 19」在本 monorepo 实质等于「把 Expo SDK 从 52 升到 53+」**，Web 再对齐到同一条 React 19.x。RN/React 的精确版本应由 `npx expo install --fix` 从目标 SDK 推导，**不手钉**。

## 4. 方案选项

### 方案 A（推荐）：升 Expo SDK，两端统一 React 19
- mobile：Expo SDK 52 → **SDK 54**，`react` / `react-native` 由 `expo install` 锁定到该 SDK 配套（React 19.1）。
- web：`react` / `react-dom` **精确对齐** mobile 经 `expo install` 推导出的 React 版本（不用 `^19.x` 浮动范围），`@types/react(-dom)` 对齐同一主版本；hoisted 下保证全仓单一 React 实例。
- 保持 `node-linker=hoisted`，hoist 出单一 React 19 实例。
- 优点：符合「Web/RN 共享单实例 React」初衷；版本一致、心智负担低。

### 方案 B（不推荐）：仅 Web 上 React 19，mobile 留 18.3.1
- 两端 React 主版本分叉，hoisted 下会冲突，需 nohoist / 手工 peer 处理。
- 收益低、风险高，违背单实例原则。**排除。**

### 方案 C：维持现状（React 18.3.1）
- 零风险，但放弃 React 19 展示价值。作为兜底。

## 5. 落地改动清单（方案 A）

- `apps/mobile/package.json`：`expo` → `~54`；`react` / `react-native` 由 `expo install` 对齐到 SDK 54 配套；`@types/react` 对齐同一主版本。
- `apps/web/package.json`：`react` / `react-dom` **精确钉到** mobile 经 `expo install` 推导出的 React 版本（保持 hoisted 单实例，不用浮动范围）；`@types/react` / `@types/react-dom` 对齐同一主版本；`@vitejs/plugin-react` 取支持 React 19 的版本。
- `apps/web` AntD 接入时（Step 5）：加 `@ant-design/v5-patch-for-react-19@^1.0.3`，并在 `apps/web` 入口 `import '@ant-design/v5-patch-for-react-19';` 作为**首选**兼容方式（不默认用 `unstableSetRender`，见 R1）。
- `docs/DECISIONS.md`：覆盖原「React 18.3.1」基线记录，说明改为 React 19 + 目标 SDK。
- 复跑 `pnpm install` + `pnpm -w check` 必须全绿才算完成。
- `packages/shared` / `packages/mock-ai`：**无改动**（本就不含 React）。

## 6. 评审裁决（已定）

1. **目标 Expo SDK = SDK 54**（React 19.1 / RN 0.81）；明确**不采用** SDK 56。
2. **坚持 AntD v5 + `@ant-design/v5-patch-for-react-19`**（入口 import），不升级到 AntD v6。
3. React 主版本按 §3 未规定的实现细节处理；人类已批准本变更，记入 `docs/DECISIONS.md`。

## 7. 风险与对策

- **R1 · AntD v5 × React 19（最高优先级）**：AntD v5 peer 实际支持 React 19，但 `message` / `notification` / `Modal.confirm` 等**静态方法**在 React 19 下需官方补丁 `@ant-design/v5-patch-for-react-19`（latest 1.0.3）。对策：**首选**在 `apps/web` 入口 `import '@ant-design/v5-patch-for-react-19';`（官方补丁）；`unstableSetRender` 仅作兜底、不默认采用。ToolApprovalCard 的反馈尽量走 `App` 组件上下文式 API（`App.useApp()`）而非静态方法。
- **R2 · Expo SDK 大版本跳跃（52→54/56）**：带来 RN 0.76→0.81/0.86、babel/metro 配置变化。对策：**现在做最便宜**——mobile 仍是骨架（仅 `App.tsx` + `index.ts`），几乎零迁移成本；越往后（Step 9 RN 三屏）越贵。
- **R3 · 周边库 React 19 兼容**：TanStack Query / Zustand / XState `@xstate/react` 现行版本均支持 React 19；落地时核对 peer 范围即可。
- **R4 · React 19 破坏性变更**：移除 string refs、`propTypes`、`ReactDOM.render` 等遗留 API。本项目是全新代码，影响极小；新写法（ref 作普通 prop、`<Context>` 直接作 Provider）反而更简洁。

## 8. React 19 在本项目可展示的特性（与承重墙结合）

- `useActionState` / `useFormStatus`：ToolApprovalCard 的「改参 → 确认执行」表单提交态（pending/error），与 §9.5 编辑态天然契合。
- `useOptimistic`：审批/执行状态切换的乐观 UI，配合 XState 状态机做即时反馈再对齐真实结果。
- `use()`：读取 mock 异步资源（AIAnalysis）。
- ref 作为 prop（免 `forwardRef`）、`<Context>` 直接当 Provider、文档元数据内联：整体降低样板。

> 这些都强化 PRD §15.3「高级前端状态建模」叙事，且**不扩需求**——只是用更新的 React 能力实现既定闭环。
>
> **红线（必须遵守）**：`useActionState` / `useOptimistic` / `use` **仅用于 UI 表现层**（表单提交 pending/error、乐观渲染等）。**ToolAction 的状态流转仍只由 `packages/shared` 的 XState machine 驱动**，不得用这些 hook 管理业务状态或绕过状态机（PRD §12.3）。

## 9. 建议

采用**方案 A**，目标 **Expo SDK 54**（React 19.1 / RN 0.81），在 **Step 1 边界（现在）** 落地。理由：此刻 mobile 仅骨架、迁移成本接近零，是最廉价的切换窗口；拖到 Step 5/Step 9 后再换，成本与回归风险显著上升。

## 10. 回滚

现在回滚 = 还原各 `package.json` 版本 + `pnpm install`，成本极低（无业务代码依赖具体 React 版本）。这也是「现在做」的另一论据。

## 11. 完成标准（Step 1 落地验收）

全部满足才算落地完成：

- [ ] `pnpm install` 成功（lockfile 更新）。
- [ ] `pnpm -w check` 全绿（typecheck + lint + test）。
- [ ] `pnpm why react` 确认全仓**单一 React 实例**（web / mobile hoist 到同一精确版本）。
- [ ] web 可启动 / 可构建、mobile（Metro / Expo）可启动。
- [ ] `packages/shared`、`packages/mock-ai` 仍不引入 React / react-native / 任何 UI。
- [ ] `docs/DECISIONS.md` 已记录（覆盖原 React 18.3.1 基线条目）。
