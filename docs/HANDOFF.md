# HANDOFF — AI Agent Desk 接力协议

> 给在本仓库接力工作的 AI Coding Agent（Claude Code / Codex）。
> 规定怎么交接，使 CC 与 Codex 能安全轮换（例如一方 token 用尽，另一方接力）。
> 本文件不改变 frozen spec（`docs/PRD.md`）。

## 为什么可以接力

CC 和 Codex 读同一个 `docs/PRD.md`（唯一事实源，已冻结）与内容一致的入口文件（`CLAUDE.md` / `AGENTS.md`），约束、技术栈、§14 执行顺序完全相同。§14 把工作切成有序、低耦合的 Step 1–11，**每个 Step 边界就是天然接力点**。

## 黄金规则

1. **frozen spec 全程有效**：接力不是重新设计的借口，只修实现 blocker。
2. **每个 Step 收尾必 `commit`**：没提交的代码，下一个 Agent 拉不到。
3. **停止前必更新 `docs/PROGRESS.md`**：这是唯一的进度真相。
4. **优先在 Step 边界换手**：非到不得已不在一个 Step 中途换。
5. **绝不重做已完成 Step**：以 PROGRESS.md 为准。
6. **沿用 `docs/DECISIONS.md` 里的实现级决策**：不要悄悄改风格 / 目录结构 / 库用法。

## 接手流程（你刚被唤起）

1. 依次读：`CLAUDE.md` / `AGENTS.md` → `docs/PROGRESS.md` → `docs/DECISIONS.md` → PROGRESS 指向的 PRD 章节。
2. 核对：跑 `git log --oneline -15` 与 `pnpm -w exec tsc --noEmit`（或等价），确认 PROGRESS 与实际代码一致。
3. 若 PROGRESS 与代码不一致、或工作区残缺：**停下，向人类报告**，不要强行往下盖。
4. 从 PROGRESS 的“下一步”继续。

## 交班流程（你 token 将尽 / 要停）

1. 提交工作：完整 Step 用 `Step N: <内容>`；半成品用 `WIP Step N: <卡在哪>`。
2. 更新 `docs/PROGRESS.md`：当前 Step、子状态、最后 commit、是否有未提交改动、**明确的“下一步”**、卡点。
3. spec 未规定的实现选择写进 `docs/DECISIONS.md`。
4. 确认 `git status` 干净（除非你刻意留 WIP，并已在 PROGRESS 注明）。

## 中途被打断（token 在 Step 内部用尽）

允许，但要干净：

- 用 `WIP Step N: <卡点>` 提交，别留未提交改动。
- 在 PROGRESS 的“下一步”写清：停在 Step N 的哪个子任务、下一步具体做什么、有没有临时 hack 待清理。
- 接手 Agent **继续这个 Step**，不重启项目。

## 固定提示词

**接手（粘给 CC 或 Codex）：**

```
读 CLAUDE.md（或 AGENTS.md）、docs/PRD.md、docs/PROGRESS.md、docs/DECISIONS.md。
从 docs/PROGRESS.md 标注的“下一步”继续，不要重做已完成 Step。
这是 frozen spec，只修 blocker，不扩范围、不改技术路线。
每个 Step 收尾 commit，并更新 PROGRESS.md / DECISIONS.md。
```

**交班（让当前 Agent 收尾）：**

```
现在停止开发。把当前工作 commit（半成品用 WIP Step N），
更新 docs/PROGRESS.md（当前 Step / 卡点 / 下一步 / 未提交改动），
spec 外的实现选择记入 docs/DECISIONS.md。
```

## 一个注意点

CC 与 Codex 对 monorepo / Expo-Metro / XState 的实现习惯略有差异。**按 Step 边界切换几乎无感；在一个 Step 中途换手最容易产生半成品和风格打架。** 能等到 Step 收尾再换就等。

## PROGRESS.md 填写示例（参考格式，非真实状态）

```
- 当前 Step：Step 7（ToolApprovalCard）进行中
- 子状态：in progress — editing 态参数表单已接 Zod，diff 未做
- 最后 commit：WIP Step 7: editing 表单接 schema，待做 diff 与 Timeline 写入
- 是否有未提交改动：否
- 下一步：实现参数 diff（originalParams vs editedParams），并在 SAVE 时写 Timeline（tool_params_edited）
```
