# DEMO_SCRIPT — AI Agent Desk 演示脚本

> 对应 PRD §15.1 功能验收链路。一个固定场景（**张女士 · 优惠咨询**）天然覆盖
> **两条审批分流分支**：低风险走 Web、中风险走 RN。

## 0. 启动

```bash
pnpm install
pnpm -w check                                   # 确认全绿（21 个契约测试）

pnpm --filter @ai-agent-desk/web dev            # Web：http://localhost:5173
pnpm --filter @ai-agent-desk/mobile start       # RN：Expo Go 扫码（或加 --web 浏览器预览）
```

场景：客户张女士发来「**你们这个产品多少钱？有没有优惠？我还在考虑竞品。**」

---

## Part A — Web 工作台（低风险分支 + 失败回滚演示）

### A1. 触发 AI 分析

1. 左栏会话列表点 **张女士**（状态 `AI 已建议`，风险 `中风险`）。
2. 中栏消息流显示客户消息；点 **「触发 AI 分析」**。
3. 「AI 建议与动作审批」区出现结构化分析（经 Mock LLM Adapter，过 `AIAnalysisSchema`）：
   - 意图 `price_negotiation`、情绪 `犹豫`、`中风险`
   - 分析摘要 + 建议回复
   - **建议动作（2）**，各带分流徽标：
     - **发送优惠券** · `中风险` · **移动端审批 · RN**
     - **创建跟进任务** · `低风险` · **Web 审批**
4. 右栏 Timeline 出现 `会话状态更新 / AI 分析完成 / AI 建议×2`；会话状态联动为 `待审批`。

> 讲解：AI 没有直接执行，而是沉淀为可治理的 ToolAction；分流由 `requiresMobileApproval(riskLevel)` 决定。

### A2. 低风险动作走 Web 审批（成功路径）

在 **创建跟进任务**（Web 审批）卡上：

1. 点 **「修改参数」** → 进入 `editing`：表单由 `CreateFollowupTaskParamsSchema` **驱动渲染**（`channel` 下拉、`dueInHours` 数字、`note` 可选），下方有「与 AI 原始参数对比」**diff**。
2. 改 `dueInHours` 24 → 12，点 **「保存」** → Zod 校验通过 → 写回 `params` → Timeline 记 `tool_params_edited`（含 before/after 快照）。
3. 点 **「确认执行」** → `executing`（loading）→ `success` → 显示执行时间 → Timeline 记 `tool_action_approved / executing / success / 会话状态更新`。

> 讲解：schema 驱动表单（不硬编码字段）+ 参数 diff + 每步 Timeline 留痕。

### A3. 失败 → 回滚（确定性演示）

1. Header 打开 **「强制执行失败」** 开关（PRD §12.2，确定性、非随机）。
2. 点卡片右上 **「重新分析」** 重置动作卡。
3. 对 **创建跟进任务** 点 **「确认执行」** → `executing` → **`failed`**（显示失败原因）→ Timeline 记 `tool_action_failed`。
4. 点 **「回滚」** → **`rollback`**（终态）→ Timeline 记 `tool_action_rollback`。
5. （可选）失败态也可点 **「重试」** 回到 `executing`。
6. 演示完关掉「强制执行失败」开关。

> 讲解：`failed → rollback` 是状态机闭合转移；用开关保证演示确定性。

### A4. 中风险动作在 Web 不可批

观察 **发送优惠券**（移动端审批·RN）卡：**「确认执行」「拒绝」按钮置灰**，附说明「该动作为中风险，需在移动端审批；Web 可改参不可批（§5.2）」。Web 只能查看/改参 —— 它的裁决在 RN。

---

## Part B — RN 审批端（中风险分支 + 模拟推送）

### B1. 待审批列表

RN 启动进 **待审批收件箱**。列表里**只有「张女士 · 发送优惠券」**（中风险）—— 低风险的「创建跟进任务」不会进 RN，这正是分流策略 `requiresMobileApproval` 的复用结果。

### B2. 模拟推送 → 审批详情

点卡片底部 **「📲 模拟收到推送」**：

- **iPhone Expo Go（真机）**：弹出本地系统通知「待审批动作 · 张女士 · 发送优惠券」→ 点通知 → 进入审批详情。
- **浏览器 `--web` 预览**：系统通知不支持，降级为直接进入审批详情（等价 tap-through）。

### B3. 审批详情 · 修改后同意

审批详情显示：动作类型、动作参数（discount 20 / validDays 7）、风险等级、AI 建议理由、客户摘要、最近消息。四个操作：**同意 / 修改后同意 / 拒绝 / 稍后处理**。

1. 点 **「修改后同意」** → 出现**原生 RN 表单**（同一份 `SendCouponParamsSchema` 校验）。
2. 改 `discount` 20 → 15、`validDays` 7 → 3。
3. 点 **「提交（修改后同意）」** → Zod 校验通过 → 驱动**共享状态机**：`EDIT → SAVE → APPROVE → executing → success`（全部复用现有转移，PRD §5.2）。

### B4. 状态回执

自动跳转 **状态回执**：
- 审批结果 `修改后同意`、最终状态 `success`
- 最终参数 `discount: 15 / validDays: 3`
- 操作时间、同步状态「已同步至 Web（含 rn_action_approved 留痕）」
- 「返回待审批列表」入口

> 讲解：RN 用原生组件 + 共享 schema 校验 + 共享状态机；四种裁决全部映射到既有转移，不新增状态。

---

## 一句话总结

```
AI 建议动作 → 人工确认 → 可编辑 → 可执行 → 可回滚 → 可留痕 → 可移动审批
```

- **承重墙** ToolApprovalCard：一个 ToolAction 一台 XState 实例，8 态闭合（见 `docs/STATE_MACHINE.md`）。
- **Zod-first**：AI 输出过 `AIAnalysisSchema`，参数按 type 判别联合定型，表单 schema 驱动。
- **多端共享**：Web 与 RN 复用同一套 `packages/shared`（类型 / schema / 状态机 / 分流策略），框架无关、不含 UI。
