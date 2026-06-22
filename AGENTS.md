# AGENTS.md — AI Agent Desk

> 本文件是给 AI Coding Agent（Codex / Claude Code 等）的执行入口。
> 与本仓库的 `CLAUDE.md` 内容一致；两者任一改动须同步另一个。

## 0. 唯一事实源

- **`docs/PRD.md`（AI Agent Desk — PRD + Agent Guardrails v0.3.1，FROZEN）是唯一事实源。**
- 动手写代码前，先完整读 `docs/PRD.md`。本文件出现的所有 `§x` 均指向该文档对应章节。
- 本文件只是把最关键的硬约束前置，方便你在每一步快速自检；细节一律以 PRD 为准。

## 1. 冻结规则（最高优先级）

本 spec 已冻结。你**只允许修复实现层 blocker**。禁止：

- 新增需求 / 新增业务模块 / 扩展 MVP 范围
- 调整已定技术路线
- 把 Web 改成 Next.js
- 自作主张“优化”架构或替换技术选型

如果你认为 spec 本身有错或缺信息：**停下来，向人类报告，等待裁决**，不要单方面改方向或补需求。

## 2. 这个项目是什么（一句话）

面向企业客服 / 销售 / 运营场景的**多端 AI 动作治理工作台**：AI 负责提速，人类负责裁决，系统负责留痕。
承重墙是 **ToolApprovalCard**（AI 建议动作的状态机可视化载体）。把这一条链路做深，比铺十个浅页面重要：

```
AI 建议动作 → 人工确认 → 可编辑 → 可执行 → 可回滚 → 可留痕 → 可移动审批
```

## 3. 硬约束（来自 §13 / §6.2，违反即返工）

### 禁止做（§13.1）

1. 重新定义项目方向
2. 登录 / 注册 / 权限 / RBAC / 多租户（§6.2 Out of Scope）
3. 完整 CRM / 完整客服系统 / 工单系统 / 支付订单
4. 真实 LLM 接入 / LangChain / RAG / 向量数据库
5. 真实 WebSocket
6. 复杂图表大屏 / 国际化 / 主题系统 / 暗黑模式 / 复杂动画
7. 同时引入 AntD 和 shadcn/ui（只用 AntD v5）
8. 将 Web 改为 Next.js
9. 将 RN 做成完整移动工作台（RN 只做审批收件箱）
10. 用普通 if-else 分散实现核心状态机（必须用 XState）
11. 把 AI 输出直接写死在 UI 组件里（必须经 Mock LLM Adapter）
12. 牺牲 ToolApprovalCard 深度去堆页面数量
13. **在 `packages/shared` 中引入 `react` / `react-native` / 任何 UI**
14. **把 ToolAction 参数退回 `Record<string, unknown>`**（必须按 type 用 Zod 定型）

### 必须做（§13.2）

1. monorepo（pnpm workspaces）
2. Web 用 Vite + React + TypeScript
3. Mobile 用 Expo React Native
4. `shared` 放：类型 / Zod schema / XState 状态机 / 审批分流策略（**不含 React / UI**）
5. `mock-ai` 放 Mock LLM Adapter（纯 TS module）
6. ToolApprovalCard 作为核心模块深做
7. 每个关键动作写入 Timeline
8. AI 输出整体过 Zod 校验（`AIAnalysisSchema`）
9. Web / RN 共享 `ToolAction` 类型
10. RN 只做审批收件箱（三屏 + 推送）
11. 保留 Expo Notifications
12. 数据模型一律 **Zod-first**（`z.infer` 派生 types，不写平行 interface）
13. README 中说明技术 tradeoff（含为什么不用 Next.js）

### 冲突时的裁决优先级（§13.3）

```
ToolApprovalCard 深度 > Web 核心闭环 > Timeline 留痕 > Shared 状态机
> RN 三屏审批 > Expo Notifications > UI 美化 > 数据看板 > 其他外围能力
```

## 4. 冻结技术栈（§3）

| 层 | 技术 |
|---|---|
| Web | Vite · React · TypeScript · React Router · TanStack Query · Zustand · AntD v5 |
| Mobile | Expo RN · Expo Router · FlashList · TanStack Query · Zustand · Expo Notifications |
| Shared | TS types · Zod schema · XState v5 状态机 · 常量 · 审批分流策略（无 React/UI） |
| Mock AI | 纯 TS module（不接真实 LLM） |

## 5. 审批分流（§5.2，写死规则）

- `MOBILE_APPROVAL_RISK_THRESHOLD = 'medium'`，函数 `requiresMobileApproval(riskLevel)` 放 `packages/shared`。
- `requiresMobileApproval === true`（medium / high）→ **RN 审批**；否则（low）→ **Web 审批**。
- **一个 ToolAction 只有一个审批方**，禁止 Web + RN 双重审批（由 UI / 路由构造性保证）。
- RN 裁决 → 状态机映射只复用现有转移，不新增（见 §5.2 / §9.3）。

## 6. 状态机（§9.3，必须闭合）

8 态：`suggested / editing / approved / rejected / executing / success / failed / rollback`。

- `approved` 瞬时态（批准即触发 EXECUTE，不停留）；`rejected` 终态，仅从 `suggested` 进入。
- 必须实现全部转移，含 `editing --CANCEL--> suggested`。
- **一个 ToolAction 一个 XState machine 实例**（每张 ToolApprovalCard 一台），machine 定义放 `shared`，`@xstate/react` 绑定放各 app。

## 7. 仓库结构（§3.1）

```
ai-agent-desk/
├── apps/
│   ├── web/        # Vite + React Web 工作台
│   └── mobile/     # Expo React Native 审批端
├── packages/
│   ├── shared/     # 类型、Zod schema、XState 状态机、审批分流策略（无 React）
│   └── mock-ai/    # Mock LLM Adapter
├── docs/
│   ├── PRD.md            # ← 唯一事实源（已冻结）
│   ├── PROGRESS.md       # ← 接力进度（每步收尾更新；接手先读）
│   ├── HANDOFF.md        # ← 接力协议（读法 / 提交纪律 / 接手提示词）
│   ├── DECISIONS.md      # ← 实现级决策日志（防多 Agent 漂移）
│   ├── STATE_MACHINE.md  # ← 你在 Step 3 / Step 11 产出
│   └── DEMO_SCRIPT.md    # ← 你在 Step 11 产出
├── CLAUDE.md
├── AGENTS.md
├── README.md   # ← 你在 Step 11 产出
├── .github/
│   └── workflows/
│       └── ci.yml   # ← 最简 CI：install + pnpm -w check（Step 1 建立，见 §12）
└── pnpm-workspace.yaml
```

## 8. 执行顺序（§14，严格按序）

1. monorepo 基础（含 `.npmrc` `node-linker=hoisted` 或 metro `watchFolders`+`nodeModulesPaths`；shared/mock-ai 用 `exports` 指向 `./src/index.ts`；配 tsconfig path/references；建立 `pnpm -w check` 脚本与最简 CI，见 §12）
2. shared 类型与 schema（Zod-first；含参数 schema 注册表 `TOOL_ACTION_PARAMS_SCHEMAS` 与分流策略）
3. XState `approvalMachine`（实现 §9.3 全部转移）
4. Mock LLM Adapter（固定 demo input、结构化 output、过 `AIAnalysisSchema`、fallback）
5. Web 工作台三栏骨架
6. AI 分析触发（生成 AIAnalysis + ToolAction）
7. ToolApprovalCard（schema 驱动参数表单、diff、Timeline 写入）
8. 打通 Web 闭环（含 failed → rollback，用 §12.2 “强制失败”开关做确定性演示）
9. RN 审批端（Expo Router 三屏，复用 shared 类型/状态机）
10. Expo Notifications 模拟推送链路
11. 产出 README.md / docs/STATE_MACHINE.md / docs/DEMO_SCRIPT.md

**节奏要求**：每个 Step 完成 = `pnpm -w check` 全绿（见 §12）。Step 2–3 完成后先让 check 全绿，再进 UI；不要一口气铺到 RN。

## 9. 完成标准（§15）

功能、技术、求职展示三类验收以 PRD §15 为准。关键技术验收：Zod-first、参数按 type 定型（非 `Record<string,unknown>`）、状态机不散落在 `useState`、`packages/shared` 不含 React、Timeline 记录关键事件、README 解释为什么不用 Next.js。

**每个 Step 的“完成”以质量闸门为准**：`pnpm -w check`（tsc + lint + 契约测试）全绿才算完成，再 commit + 更新 PROGRESS（见 §12）。

## 10. 开工前自检

- [ ] 已完整读 `docs/PRD.md`
- [ ] 理解“只修 blocker、不扩范围、不改技术路线”
- [ ] 第一步只做 monorepo + shared 契约，不写业务页面
- [ ] 任何想偏离 spec 的地方 → 先问人类

## 11. 接力 / Relay（多 Agent 协作）

Claude Code 与 Codex 可交替接力（如一方 token 用尽换另一方）。两者读同一 `docs/PRD.md` 与内容一致的入口文件，约束一致，接力安全。完整协议见 `docs/HANDOFF.md`，要点如下。

**接手时（你刚被唤起）依次读：**

1. `CLAUDE.md` / `AGENTS.md`（本文件）
2. `docs/PROGRESS.md`（当前进度、卡点、下一步）
3. `docs/DECISIONS.md`（前一个 Agent 的实现级决策，必须沿用）
4. PROGRESS 指向的 PRD 章节

然后**从 PROGRESS 标注的“下一步”继续，绝不重做已完成 Step**。

**每个 Step 收尾（或停止前）必须：**

1. `git commit`，信息格式 `Step N: <做了什么>`（半成品用 `WIP Step N: <卡在哪>`）
2. 更新 `docs/PROGRESS.md`：勾掉完成项、写当前卡点、写明下一步入口、标注是否有未提交改动
3. 把 spec 未规定的实现选择（目录组织、库的具体用法等）追加到 `docs/DECISIONS.md`

**纪律：**

- 优先在 **Step 边界**换手；非到不得已不要在一个 Step 中途换。
- 任何改动必须已 `commit`，下一个 Agent 才拉得到。
- frozen spec 仍然全程有效——接力不是重新设计的借口。

## 12. 质量闸门 / Quality Gate（实现约束）

> 这是验收手段，**不改变 PRD 范围**。每个 Step 的“完成”以本闸门为准，用机器把关替代人工逐行复审。

**Step 1 顺手建立统一校验与最简 CI：**

- 根 `package.json` 加脚本：`"check": "pnpm -w exec tsc --noEmit && pnpm -w lint && pnpm -w test"`（按实际包结构调整命令）。
- `.github/workflows/ci.yml`：在 push / PR 上跑 `pnpm install` + `pnpm -w check`。

**每个 Step 收尾，`pnpm -w check` 必须全绿，才算该 Step 完成**——然后才 commit + 更新 `docs/PROGRESS.md`。check 不绿 = 这步没做完。

**ESLint 边界规则（把架构红线自动化）：**

- 禁止 `packages/shared` 内 import `react` / `react-native` / 任何 UI 库（用 `no-restricted-imports` 或等价规则）。违反即 lint 失败。

**契约级测试（只测承重墙，不追求覆盖率），随对应 Step 一起补：**

- 状态机关键转移（Step 3）：`suggested→approved→executing→success`、`executing→failed→rollback`、`editing→CANCEL→suggested`。
- Mock 输出（Step 4）：`AIAnalysisSchema` 能解析 §11.3 的 demo 数据；非法 `params` 被拒。
- 分流（Step 2）：`requiresMobileApproval` —— low→Web、medium/high→RN。

**不要把它扩成大测试套件。** 上面几条够守住地基与刀尖，其余正确性交给 `tsc` 与 §15.1 的 demo 链路。
