# AI Agent Desk — PRD + Agent Guardrails v0.3.1

> 面向 Claude Code / Codex / 其他 AI Coding Agent 的项目需求、技术选型与开发护栏文档。
> 本文档用于指导实现，不用于重新讨论产品方向。
> **禁止扩需求，禁止炫技，禁止把 MVP 做成完整企业系统。**
> **本版为最终 frozen spec。后续仅允许修复实现 blocker，不新增需求、不调整技术路线、不扩展模块。**

---

## 0. 文档定位

本文档不是普通产品 PRD，也不是开放式头脑风暴材料。

它的准确定位是：

- 中文：**项目需求与 Agent 开发护栏**
- English：**PRD + Agent Guardrails**
- 备选英文：**Implementation Brief + Coding Agent Constraints**
- 面向对象：Claude Code / Codex / AI Coding Agent
- 目标：让 AI Coding Agent 按既定边界实现项目，而不是重新定义项目

### 0.1 本文档解决什么问题

本项目是求职补强项目，目标不是上线商用系统，而是构建一个能展示高级前端能力的 React + RN + AI 应用工程化原型。

AI Coding Agent 在执行时常见问题：

1. 自动扩展登录、权限、多租户
2. 自动补完整 CRM / 客服系统
3. 自动接入真实大模型、RAG、WebSocket
4. 自动引入过重框架或多余技术
5. 把核心组件做浅，把外围页面做多
6. 把项目做成 broad-but-shallow demo-ware

本文档的作用就是防止这些问题。

### 0.2 最高优先级原则

按照优先级从高到低：

1. **AI 动作治理闭环优先**
2. **ToolApprovalCard 深度优先**
3. **Web 核心工作台优先**
4. **共享状态机 / schema / 类型优先**
5. **RN 只做移动审批，不重建 Web 工作台**
6. **稳定可演示优先于架构宏大**
7. **禁止 broad-but-shallow**
8. **禁止为了技术标签强上技术栈**

---

## 1. 项目背景

候选人背景：

- 7 年前端工程师
- 主栈：Vue / TypeScript / 复杂中后台 / 配置化平台 / 数据可视化 / AI 应用工程化
- 求职目标：高级前端 / AI 应用方向 / 复杂 B 端 / 企业 SaaS / 数据平台 / 长三角岗位
- 当前短板：React / React Native 项目经验不足

已有项目：

- OfferFlow：Vue + AI 求职机会管理与决策系统
- 已覆盖：
  - JD 分析
  - AI 结构化解析
  - 机会评分
  - 风险标签
  - 求职状态管理
  - 配置化评分

新项目不能做成 React 版 OfferFlow，否则业务重复，简历说服力下降。

---

## 2. 项目定位

项目名称：

```txt
AI Agent Desk
```

完整定位：

```txt
AI Agent Desk 是一个面向企业客服 / 销售 / 运营场景的多端 AI 动作治理工作台。
```

一句话价值主张：

```txt
AI 负责提速，人类负责裁决，系统负责留痕。
```

更具体地说：

```txt
当 AI 在客户会话中建议“发券 / 创建跟进任务 / 升级工单 / 转人工 / 更新客户状态”时，系统不会让 AI 直接执行，而是将建议动作转化为可编辑、可审批、可回滚、可追踪的业务卡片，由人工确认后再执行。
```

### 2.1 项目不是做什么

本项目不是：

- 普通客服后台
- 完整 CRM
- 完整工单系统
- 完整 SaaS 平台
- 真实 AI Agent 平台
- RAG 知识库系统
- React / RN 练手 Demo
- React 版 OfferFlow

### 2.2 项目真正证明什么

本项目真正要证明：

```txt
我能把 AI 从“聊天框里的文本生成器”，推进到“企业系统里的可治理业务动作”。
```

技术上体现为：

- AI 结构化输出消费
- Tool Calling 动作治理
- Human-in-the-loop 人工确认
- ToolApprovalCard 状态机
- 参数编辑
- 执行成功 / 失败
- 状态回滚
- Timeline 操作留痕
- Web + RN 移动审批闭环

---

## 3. 技术选型最终裁决

### 3.1 总体架构

采用 monorepo：

```txt
ai-agent-desk/
├── apps/
│   ├── web/                  # Vite + React Web 工作台
│   └── mobile/               # Expo React Native 审批端
├── packages/
│   ├── shared/               # 类型、Zod schema、XState 状态机、审批分流策略
│   └── mock-ai/              # Mock LLM Adapter
├── docs/
│   ├── PRD.md
│   ├── STATE_MACHINE.md
│   └── DEMO_SCRIPT.md
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### 3.2 Web 技术栈

```txt
Vite
React
TypeScript
React Router
TanStack Query
Zustand
AntD v5
```

#### 为什么不用 Next.js

本项目是内部 AI 动作治理工作台，不依赖：

- SSR
- SEO
- SSG
- ISR
- RSC
- 内容站首屏优化

Web 端是典型 SPA 工作台：

- 会话列表
- 消息流
- AI 建议
- ToolApprovalCard
- Timeline
- 客户上下文
- 状态机驱动交互

这些全是客户端复杂交互，用 Vite + React 更简单、更稳定、更贴合项目形态。

Next.js 不作为 MVP 强约束，仅作为后续可选增强。

只有在以下情况出现时，才考虑 Next.js：

1. 明确需要 RSC Generative UI
2. 明确需要 Next.js 作为岗位关键词
3. 需要把 Web UI 与 BFF/API Route 强绑定
4. 项目后续要包装为完整 AI SaaS 产品原型

当前 MVP 不需要 Next.js。

#### 面试口径

```txt
这个项目是内部 AI 工作台，不依赖 SSR / SEO。我选择 Vite + React，是因为项目核心是复杂客户端状态建模、AI 动作审批流与多端共享状态机。Next.js 的强项不在这里，强上反而会引入 Server/Client 边界与 RSC 心智负担。后续如需 RSC Generative UI 或岗位关键词，可平滑迁移 Web 层，但核心 shared 类型、schema、状态机不会浪费。
```

### 3.3 Mobile 技术栈

```txt
Expo React Native
Expo Router
TypeScript
FlashList
TanStack Query
Zustand
Expo Notifications
```

RN 端只做移动审批，不做完整移动工作台。

RN 端必须包含：

- 待审批列表
- 审批详情
- 状态回执
- Expo Notifications 推送入口

### 3.4 Shared 技术栈

```txt
TypeScript types
Zod schemas
XState v5 approval state machine
Shared constants
Shared mock protocol
审批分流策略（MOBILE_APPROVAL_RISK_THRESHOLD + requiresMobileApproval）
```

> **架构红线**：`packages/shared` 只放纯逻辑——Zod schema、XState machine、types、策略常量。**不得引入 `react` / `react-native` / 任何 UI**。`@xstate/react` 绑定放各 app（web / mobile），否则 web 与 RN 的 React 版本会冲突。这是本分层最值钱、也最易被破坏的红线。

#### 为什么加入 XState v5

本项目的核心不是普通 UI，而是 AI 建议动作的状态治理。

核心状态机：

```txt
suggested
→ editing
→ executing
→ success / failed
→ rollback
```

XState v5 的价值：

- 框架无关
- 可放入 packages/shared
- Web / RN 共享同一套状态定义
- 避免两端重复 if-else
- 可视化状态机，方便写文档和面试讲解
- 强化“高级前端状态建模”叙事

如遇实现复杂度超出预期，可以降级为手写 typed discriminated-union reducer，但首选 XState v5。

### 3.5 Mock AI 技术栈

第一版使用：

```txt
Mock LLM Adapter = 纯 TypeScript module
```

不接真实 OpenAI / Claude / LangChain / RAG / 向量库。

后续如果需要 Web / RN 共用真实接口，可增加：

```txt
Hono + Vercel AI SDK / streamText
```

Hono 作为未来薄服务层候选，不作为 MVP 必做项。

### 3.6 UI 方案

首选：

```txt
AntD v5
```

原因：

- 更贴合 B 端工作台
- 国内面试语境认可度高
- Timeline / Card / List / Tag / Form / Modal / Drawer 可直接复用
- 交付稳定
- 减少重复造基础组件

注意：

- 不要同时引入 shadcn/ui
- 不要混用两套 UI 体系
- AntD 只作为基础组件库
- ToolApprovalCard 必须自定义打磨，不要做成普通 AntD Card

ToolApprovalCard 视觉要体现：

- AI 建议态
- 风险等级
- 参数 diff
- 状态 stepper
- 执行 loading
- 成功 / 失败态
- 回滚提示
- Timeline 联动

---

## 4. 用户与典型场景

### 4.1 目标用户

1. 客服人员
   - 处理客户咨询
   - 使用 AI 生成回复建议
   - 审批关键动作

2. 销售人员
   - 跟进潜在客户
   - 审批发券 / 跟进任务
   - 移动端及时处理高优先级客户

3. 运营人员
   - 处理用户反馈
   - 追踪 AI 建议采纳情况
   - 监控高风险动作

4. 主管 / 管理者
   - 查看操作留痕
   - 判断 AI 是否被正确治理
   - 防止 AI 黑箱执行

### 4.2 典型场景

客户发来消息：

```txt
你们这个产品多少钱？有没有优惠？我还在考虑竞品。
```

系统通过 Mock LLM Adapter 输出：

- intent：price_negotiation
- sentiment：hesitant
- riskLevel：medium
- suggestedReply：解释价格价值并提供优惠
- nextActions：
  - send_coupon
  - create_followup_task
  - update_customer_status

系统不会直接执行 AI 动作，而是进入 ToolApprovalCard，由人类审批。

---

## 5. 核心闭环

MVP 只围绕一条闭环：

```txt
Web 创建客户会话
↓ 客户发消息
↓ Mock LLM Adapter 生成意图 + 摘要 + 建议回复 + nextActions
↓ ToolApprovalCard 渲染 AI 建议动作（suggested 态）
↓ 按 requiresMobileApproval(action.riskLevel) 分流：
   · low（低于阈值）：Web 人工确认/改参/拒绝 → approved → executing → success/failed →（rollback）
   · medium / high（达到阈值）：Web 仅可查看/改参，不可在 Web 审批；生成 ApprovalTask 并触发 Expo Notifications 推送 RN
↓ RN 在审批详情裁决：同意 / 拒绝 / 修改后同意 / 稍后处理
↓ RN 裁决驱动同一套 ToolAction 状态机，Web 同步状态与 Timeline 留痕
```

### 5.1 闭环验收标准

默认 demo 必须同时演示两条分流分支（见 §5.2）。

**低风险分支（Web 审批）：**

1. 用户选择一个客户会话，客户消息触发 AI 分析
2. AI 生成结构化建议动作，ToolApprovalCard 渲染动作卡片
3. Web 人工修改参数 → 确认执行 → executing → success / failed
4. 失败可回滚（failed → rollback）
5. 每一步写入 Timeline

**高风险分支（RN 审批）：**

6. 达到阈值的动作在 Web 端保持 suggested，不可在 Web 审批；生成 ApprovalTask 并触发 Expo Notifications 推送
7. RN 收到推送 → 审批详情 → 同意 / 拒绝 / 修改后同意 / 稍后处理
8. RN 裁决驱动同一套状态机，Web 同步审批结果与 Timeline（含 rn_action_* 事件）

### 5.2 Web 与 RN 审批权责（必须遵守）

分流策略放 `packages/shared`，作为单一事实来源：

```ts
import type { RiskLevel } from './types';

// 风险达到该阈值的 ToolAction 由 RN 审批；低于阈值在 Web 审批。
export const MOBILE_APPROVAL_RISK_THRESHOLD: RiskLevel = 'medium';

const RISK_ORDER: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };
export function requiresMobileApproval(risk: RiskLevel): boolean {
  return RISK_ORDER[risk] >= RISK_ORDER[MOBILE_APPROVAL_RISK_THRESHOLD];
}
```

规则：

- 分流规则：`requiresMobileApproval(action.riskLevel) === true` 的 ToolAction 由 RN 审批，其余在 Web 审批。
- **一个 ToolAction 只有一个审批方，不存在 Web + RN 双重审批。**
- 走 RN 的动作在 Web 端保持 `suggested`（可看、可改参数、不可批），同时创建 ApprovalTask。
- ApprovalTask 仅在 `requiresMobileApproval(action.riskLevel)` 为 true 时创建。

RN 裁决 → ToolAction 状态机映射（**全部复用现有转移，不新增**）：

```txt
RN 同意      → APPROVE → approved → EXECUTE → executing → success/failed
RN 拒绝      → REJECT  → rejected
RN 修改后同意 → EDIT → editing → SAVE → suggested → APPROVE →（同“RN 同意”）
RN 稍后处理   → ApprovalTask.status = 'delayed'，ToolAction 保持 suggested
```

---

## 6. 功能范围

## 6.1 In Scope

### P0 必须实现

#### 1. Web 会话工作台

包含：

- 会话列表
- 消息流
- AI 建议回复
- ToolApprovalCard
- 客户上下文
- Timeline 留痕

#### 2. Mock LLM Adapter

包含：

- 固定 demo 输入
- 结构化 AIAnalysis 输出
- nextActions 生成
- Zod schema 校验
- 不依赖真实 LLM

#### 3. ToolApprovalCard

包含：

- AI 建议态
- 参数编辑态
- 执行中
- 成功
- 失败
- 拒绝
- 回滚
- Timeline 联动

#### 4. XState 审批状态机

包含：

- shared 状态定义
- shared event 定义
- shared transition 定义
- Web / RN 复用

#### 5. Timeline 操作留痕

包含：

- AI 建议
- 人工修改
- 审批通过
- 审批拒绝
- 执行成功
- 执行失败
- 回滚
- RN 审批

#### 6. RN 最小审批端

包含：

- 待审批列表
- 审批详情
- 状态回执
- Expo Notifications

---

## 6.2 Out of Scope

禁止在 MVP 中实现：

- 登录注册
- 完整权限
- RBAC
- 多租户
- 完整 CRM
- 完整客服系统
- 多渠道真实接入
- 真实 WebSocket
- 真实 LLM 接入
- LangChain
- RAG
- 向量数据库
- 复杂知识库
- 图表大屏
- 移动端完整会话
- 移动端客户画像
- 支付 / 订单系统
- 国际化
- 主题系统
- 暗黑模式
- 复杂动画

---

## 7. Web 端需求

> UI 标签为 status 与 riskLevel 的**组合展示**，枚举以 §10 数据模型为准：“高风险”是 `riskLevel` 而非 `ConversationStatus`；`tool_event` 是 `MessageType` 而非 `SenderType`。

### 7.1 页面结构

Web 工作台采用三栏布局：

```txt
┌───────────────────────────────────────────────┐
│ Header：工作台标题 / 状态筛选 / Demo 操作入口  │
├──────────────┬────────────────┬───────────────┤
│ 会话列表      │ 消息流 + AI 建议 │ 客户上下文 + 时间线 │
└──────────────┴────────────────┴───────────────┘
```

### 7.2 会话列表

字段：

- customerName
- topic
- channel
- lastMessagePreview
- lastMessageAt
- status
- riskLevel
- pendingActionCount

状态标签：

- 待回复
- AI 已建议
- 待审批
- 高风险
- 已跟进
- 已关闭

### 7.3 消息流

消息类型：

- customer
- human
- ai
- system
- tool_event

展示内容：

- 客户消息
- AI 分析摘要
- AI 建议回复
- 人工回复
- 系统事件
- 工具动作事件

### 7.4 AI 建议回复

AIAnalysis 展示：

- intent
- sentiment
- summary
- suggestedReply
- riskLevel
- nextActions

### 7.5 客户上下文

只展示当前判断所需信息，不做完整 CRM：

- 客户等级
- 最近交互
- 历史摘要
- 当前意图
- 风险提醒
- 待处理动作

### 7.6 Timeline

展示每个 TimelineEvent：

- 事件标题
- 事件描述
- 操作人
- 操作时间
- beforeSnapshot
- afterSnapshot

---

## 8. RN 端需求

### 8.1 RN 定位

RN 是移动审批收件箱，不是移动版完整 Web 工作台。

RN 只负责：

- 接收推送
- 查看待审批动作
- 查看审批详情
- 同意 / 拒绝 / 修改后同意
- 查看状态回执

### 8.2 屏幕 1：待审批列表

使用 FlashList。

字段：

- customerName
- actionTitle
- riskLevel
- createdAt
- status
- summary

### 8.3 屏幕 2：审批详情

字段：

- 动作类型
- 动作参数
- 风险等级
- AI 建议理由
- 客户摘要
- 最近消息摘要

操作：

- 同意
- 拒绝
- 修改后同意
- 稍后处理

> “修改后同意”复用 `packages/shared` 的 per-type 参数 Zod schema 做校验（见 §10），但表单 UI 用**原生 RN 组件**最小实现（AntD 不在 RN 运行，shared 只放 types/schema/状态机/策略，不放组件）。

### 8.4 屏幕 3：状态回执

字段：

- 审批结果
- 最终参数
- 操作时间
- 同步状态
- 返回入口

### 8.5 Expo Notifications

必须提供模拟推送链路：

```txt
Web 生成需移动审批的 ToolAction（requiresMobileApproval = true）
↓
触发 Expo Notifications
↓
RN 收到推送
↓
点击进入审批详情
↓
完成审批
↓
Web 同步状态
```

---

## 9. 核心模块：ToolApprovalCard

### 9.1 模块定位

ToolApprovalCard 是项目承重墙。

它不是普通 UI 卡片，而是 AI 动作治理状态机的可视化载体。

### 9.2 支持动作类型

```txt
send_coupon
create_followup_task
escalate_ticket
transfer_to_human
update_customer_status
```

### 9.3 状态机

核心状态：

```txt
suggested
editing
approved
rejected
executing
success
failed
rollback
```

推荐转移：

```txt
suggested --EDIT--> editing
suggested --APPROVE--> approved
suggested --REJECT--> rejected
editing --SAVE--> suggested
editing --CANCEL--> suggested
approved --EXECUTE--> executing
executing --RESOLVE_SUCCESS--> success
executing --RESOLVE_FAILURE--> failed
failed --RETRY--> executing
failed --ROLLBACK--> rollback
success --ROLLBACK--> rollback
```

注记（必须遵守）：

- `approved` 为**瞬时态**：批准后立即触发 `EXECUTE`，不停留等待。
- `rejected` 为**终态**，仅可从 `suggested` 进入（无 `approved → rejected`，故无需新增转移）。
- `editing --CANCEL--> suggested` 表示丢弃草稿、还原参数。
- 走 RN 的动作，其 `APPROVE / REJECT / EDIT` 由 RN 触发；低风险动作由 Web 触发。详见 §5.2。

### 9.4 suggested｜AI 建议态

展示：

- 动作名称
- AI 建议理由
- 风险等级
- 参数预览
- 是否需要人工确认

操作：

- 修改参数
- 确认执行
- 拒绝

### 9.5 editing｜参数编辑态

要求：

- 表单由 shared 的 per-type 参数 Zod schema **驱动渲染**：按 `action.type` 取 `TOOL_ACTION_PARAMS_SCHEMAS[type]`，不在组件里硬编码各动作字段
- 编辑写入 `editedParams`（草稿），不直接改 `params`
- 支持 `originalParams` 与当前编辑值的前后对比（diff）
- SAVE 时：用对应 Zod schema 校验草稿 → 通过则 `editedParams` 写入 `params` → 写入 Timeline（`tool_params_edited`，含 before/after snapshot）
- 校验失败：展示 schema 错误，停留在 editing

### 9.6 executing｜执行中

要求：

- 展示 loading
- 禁止重复点击
- 保留执行参数快照

### 9.7 success｜执行成功

要求：

- 展示成功状态
- 展示执行人
- 展示执行时间
- 展示最终参数
- 写入 Timeline

### 9.8 failed｜执行失败

要求：

- 展示失败原因
- 支持重试
- 支持回滚
- 写入 Timeline

### 9.9 rollback｜状态回滚

要求：

- 展示回滚前状态
- 展示回滚后状态
- 展示回滚原因
- 写入 Timeline

### 9.10 rejected｜拒绝态

要求：

- 终态，进入后不可再操作
- 展示拒绝原因与拒绝人
- 展示拒绝时间
- 写入 Timeline（tool_action_rejected / rn_action_rejected）

---

## 10. 数据模型（Zod-first）

> 本节全部 **schema-first**：先定义 Zod schema，types 一律由 `z.infer` 派生，**禁止再写一份平行 `interface`**。schema 与 types 都放 `packages/shared`，shared 不引 React。下文按依赖顺序给出（枚举 → 参数 schema → ToolAction → AIAnalysis → 其余）。

### 10.1 枚举与基础类型

```ts
import { z } from 'zod';

export const RiskLevelSchema = z.enum(['low', 'medium', 'high']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const ToolActionTypeSchema = z.enum([
  'send_coupon',
  'create_followup_task',
  'escalate_ticket',
  'transfer_to_human',
  'update_customer_status',
]);
export type ToolActionType = z.infer<typeof ToolActionTypeSchema>;

export const ToolActionStatusSchema = z.enum([
  'suggested', 'editing', 'approved', 'rejected',
  'executing', 'success', 'failed', 'rollback',
]);
export type ToolActionStatus = z.infer<typeof ToolActionStatusSchema>;

export const ConversationStatusSchema = z.enum([
  'pending_reply', 'ai_suggested', 'waiting_approval', 'followed_up', 'closed',
]);
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

export const SenderTypeSchema = z.enum(['customer', 'human', 'ai', 'system']);
export type SenderType = z.infer<typeof SenderTypeSchema>;

export const MessageTypeSchema = z.enum(['text', 'ai_suggestion', 'system_event', 'tool_event']);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const SentimentSchema = z.enum(['positive', 'neutral', 'hesitant', 'angry']);
export type Sentiment = z.infer<typeof SentimentSchema>;
```

### 10.2 ToolAction 参数 schema（按 type 定型）

每个动作类型有自己的参数形状。这是参数编辑器渲染、Zod 校验、Web/RN 参数一致性的**唯一真相**。

```ts
export const SendCouponParamsSchema = z.object({
  discount: z.number().int().min(1).max(100),   // 折扣百分比
  validDays: z.number().int().min(1),
  couponName: z.string().optional(),
});

export const CreateFollowupTaskParamsSchema = z.object({
  channel: z.enum(['phone', 'email', 'wechat', 'app']),
  dueInHours: z.number().int().min(1),
  note: z.string().optional(),
});

export const EscalateTicketParamsSchema = z.object({
  priority: z.enum(['normal', 'high', 'urgent']),
  note: z.string().optional(),
});

export const TransferToHumanParamsSchema = z.object({
  targetTeam: z.enum(['sales', 'support', 'billing', 'tech']),
  note: z.string().optional(),
});

export const UpdateCustomerStatusParamsSchema = z.object({
  statusTag: z.string().min(1),   // 如 price_sensitive
  note: z.string().optional(),
});

// 注册表：参数编辑器与 Zod 校验共用。satisfies 保证覆盖全部 ToolActionType（漏一个则编译报错）
export const TOOL_ACTION_PARAMS_SCHEMAS = {
  send_coupon: SendCouponParamsSchema,
  create_followup_task: CreateFollowupTaskParamsSchema,
  escalate_ticket: EscalateTicketParamsSchema,
  transfer_to_human: TransferToHumanParamsSchema,
  update_customer_status: UpdateCustomerStatusParamsSchema,
} satisfies Record<ToolActionType, z.ZodTypeAny>;
```

> 本期 demo 仅经过 `send_coupon` + `create_followup_task` 两条路径；其余 3 类已声明支持并给出最小参数 schema，编辑器据此自动渲染，**不属于新增范围**。

### 10.3 ToolAction（判别联合）

`params / originalParams / editedParams` 均用该动作类型对应的参数 schema，由 `type` 判别收窄。

```ts
const toolActionBaseSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  analysisId: z.string(),
  title: z.string(),
  reason: z.string(),                 // AI 建议理由
  riskLevel: RiskLevelSchema,
  status: ToolActionStatusSchema,
  requiresApproval: z.boolean(),      // 本期恒为 true（无自动执行分支）
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  executedAt: z.string().optional(),
  failedReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// originalParams = AI 原始基线（只读）；params = 当前生效；editedParams = 编辑草稿（SAVE 时 draft → params）
export const ToolActionSchema = z.discriminatedUnion('type', [
  toolActionBaseSchema.extend({ type: z.literal('send_coupon'),           params: SendCouponParamsSchema,            originalParams: SendCouponParamsSchema,            editedParams: SendCouponParamsSchema.optional() }),
  toolActionBaseSchema.extend({ type: z.literal('create_followup_task'),  params: CreateFollowupTaskParamsSchema,     originalParams: CreateFollowupTaskParamsSchema,     editedParams: CreateFollowupTaskParamsSchema.optional() }),
  toolActionBaseSchema.extend({ type: z.literal('escalate_ticket'),       params: EscalateTicketParamsSchema,        originalParams: EscalateTicketParamsSchema,        editedParams: EscalateTicketParamsSchema.optional() }),
  toolActionBaseSchema.extend({ type: z.literal('transfer_to_human'),     params: TransferToHumanParamsSchema,       originalParams: TransferToHumanParamsSchema,       editedParams: TransferToHumanParamsSchema.optional() }),
  toolActionBaseSchema.extend({ type: z.literal('update_customer_status'),params: UpdateCustomerStatusParamsSchema,  originalParams: UpdateCustomerStatusParamsSchema,  editedParams: UpdateCustomerStatusParamsSchema.optional() }),
]);
export type ToolAction = z.infer<typeof ToolActionSchema>;
```

### 10.4 AIAnalysis

```ts
export const AIAnalysisSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  intent: z.string(),
  sentiment: SentimentSchema,
  summary: z.string(),
  suggestedReply: z.string(),
  riskLevel: RiskLevelSchema,
  nextActions: z.array(ToolActionSchema),
  rawOutput: z.string(),
  createdAt: z.string(),
});
export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;
```

### 10.5 Conversation

```ts
export const ConversationSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  channel: z.enum(['web', 'email', 'wechat', 'app', 'manual']),
  status: ConversationStatusSchema,
  intent: z.string().optional(),
  riskLevel: RiskLevelSchema,
  unreadCount: z.number().int().nonnegative(),
  pendingActionCount: z.number().int().nonnegative(),
  lastMessageAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Conversation = z.infer<typeof ConversationSchema>;
```

### 10.6 Customer

```ts
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string().optional(),
  level: z.enum(['normal', 'silver', 'gold', 'vip']),
  tags: z.array(z.string()),
  summary: z.string(),
  lastContactAt: z.string(),
});
export type Customer = z.infer<typeof CustomerSchema>;
```

### 10.7 Message

```ts
export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderType: SenderTypeSchema,
  messageType: MessageTypeSchema,
  content: z.string(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;
```

### 10.8 TimelineEvent

```ts
export const TimelineEventTypeSchema = z.enum([
  'ai_analysis_created',
  'tool_action_suggested',
  'tool_params_edited',
  'tool_action_approved',
  'tool_action_rejected',
  'tool_action_executing',
  'tool_action_success',
  'tool_action_failed',
  'tool_action_rollback',
  'rn_push_sent',
  'rn_action_approved',
  'rn_action_rejected',
  'conversation_status_updated',
]);
export type TimelineEventType = z.infer<typeof TimelineEventTypeSchema>;

export const TimelineEventSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  actionId: z.string().optional(),
  eventType: TimelineEventTypeSchema,
  title: z.string(),
  description: z.string(),
  operatorType: z.enum(['ai', 'human', 'system']),
  operatorName: z.string(),
  beforeSnapshot: z.record(z.unknown()).optional(),  // 异构审计快照
  afterSnapshot: z.record(z.unknown()).optional(),   // 异构审计快照
  createdAt: z.string(),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
```

> `beforeSnapshot / afterSnapshot` 是异构审计数据（参数 diff、状态快照等），保留 `z.record(z.unknown())`。这是全文**唯一**允许的 `unknown` 记录，其余一律定型。

### 10.9 ApprovalTask

```ts
export const ApprovalTaskStatusSchema = z.enum(['pending', 'approved', 'rejected', 'delayed']);
export type ApprovalTaskStatus = z.infer<typeof ApprovalTaskStatusSchema>;

export const ApprovalTaskSchema = z.object({
  id: z.string(),
  actionId: z.string(),
  conversationId: z.string(),
  customerName: z.string(),
  actionTitle: z.string(),
  riskLevel: RiskLevelSchema,
  status: ApprovalTaskStatusSchema,
  pushedAt: z.string().optional(),
  handledAt: z.string().optional(),
});
export type ApprovalTask = z.infer<typeof ApprovalTaskSchema>;
```

> ApprovalTask 仅在 `requiresMobileApproval(action.riskLevel)` 为 true 时创建（见 §5.2）。`delayed` 对应 RN 的“稍后处理”，此时关联 ToolAction 保持 `suggested`。

---

## 11. Mock LLM Adapter 设计

### 11.1 目标

将客户消息转成结构化 AIAnalysis。

### 11.2 接口建议

```ts
interface AnalyzeConversationInput {
  conversationId: string;
  latestMessage: string;
  customer: Customer;
  previousMessages: Message[];
}

interface MockLLMAdapter {
  analyzeConversation(input: AnalyzeConversationInput): Promise<AIAnalysis>;
}
```

### 11.3 固定 Demo Case

输入：

```txt
你们这个产品多少钱？有没有优惠？我还在考虑竞品。
```

输出：

```json
{
  "intent": "price_negotiation",
  "sentiment": "hesitant",
  "riskLevel": "medium",
  "summary": "客户正在比较竞品，对价格敏感，希望获得优惠。",
  "suggestedReply": "您好，我理解您对价格的顾虑。我们可以为您提供一张限时优惠券，并安排专人帮您对比方案。",
  "nextActions": [
    {
      "type": "send_coupon",
      "title": "发送优惠券",
      "reason": "客户价格敏感，适度优惠有助于提升转化。",
      "riskLevel": "medium",
      "params": {
        "discount": 20,
        "validDays": 7
      },
      "requiresApproval": true
    },
    {
      "type": "create_followup_task",
      "title": "创建跟进任务",
      "reason": "客户仍在比较竞品，需要销售在 24 小时内跟进。",
      "riskLevel": "low",
      "params": {
        "channel": "phone",
        "dueInHours": 24
      },
      "requiresApproval": true
    }
  ]
}
```

> 与 §5.2 一致：`send_coupon`（medium）→ 走 RN 审批；`create_followup_task`（low）→ 走 Web 审批。默认 demo 天然覆盖两条分支。两条 `params` 分别满足 `SendCouponParamsSchema` / `CreateFollowupTaskParamsSchema`。

### 11.4 约束

- 不允许直接在 UI 组件里写死 AI 输出
- 必须经过 Adapter
- **必须经过 Zod 校验**：整体过 `AIAnalysisSchema`，其 `nextActions[]` 因判别联合自动按 `type` 校验对应参数 schema（见 §10）。mock 产出的 `params` 必须满足对应 `TOOL_ACTION_PARAMS_SCHEMAS[type]`，否则视为 mock bug
- mock 输出时初始化 `originalParams = params`、`editedParams` 留空
- 输出失败 / 校验不通过时需要展示 fallback 状态

---

## 12. 状态管理边界

### 12.1 TanStack Query

用于服务端 / mock API 状态：

- conversations
- messages
- aiAnalysis
- toolActions
- timelineEvents
- approvalTasks

### 12.2 Zustand

用于本地 UI 状态：

- 当前选中 conversationId
- 当前编辑的 ToolAction
- 局部面板展开状态
- demo 控制开关
- RN 本地交互态

> demo 控制开关须包含“强制下一次执行失败”，用于**确定性**演示 `failed → rollback`，不要用随机数。

### 12.3 XState

用于核心业务状态：

- ToolAction 生命周期
- approval flow
- rollback flow

禁止用纯 scattered useState 管理 ToolApprovalCard 复杂状态。

> **实例粒度**：一个 ToolAction 一个 machine 实例（每张 ToolApprovalCard 一台），不是每会话一台。machine 定义放 `packages/shared`，`@xstate/react` 绑定放各 app。

---

## 13. Agent 开发护栏

### 13.1 禁止事项

Claude Code / Codex 执行时禁止：

1. 重新定义项目方向
2. 新增登录注册
3. 新增权限系统
4. 新增多租户
5. 新增完整 CRM
6. 新增完整客服系统
7. 新增真实 LLM 接入
8. 新增 RAG
9. 新增 WebSocket
10. 新增复杂图表大屏
11. 新增暗黑模式
12. 新增主题系统
13. 同时引入 AntD 和 shadcn/ui
14. 将 Web 改为 Next.js
15. 将 RN 做成完整移动工作台
16. 用普通 if-else 分散实现核心状态机
17. 把 AI 输出直接写死在 UI 组件里
18. 牺牲 ToolApprovalCard 深度去堆页面数量
19. 在 packages/shared 中引入 React / react-native / 任何 UI
20. 把 ToolAction 参数退回 `Record<string, unknown>`（必须按 type 用 Zod 定型）

### 13.2 必须事项

必须做到：

1. 使用 monorepo
2. Web 使用 Vite + React + TS
3. Mobile 使用 Expo RN
4. shared 中定义类型 / schema / 状态机 / 审批分流策略
5. mock-ai 中定义 Mock LLM Adapter
6. ToolApprovalCard 作为核心模块深做
7. 每个关键动作写入 Timeline
8. AI 输出通过 Zod 校验
9. Web / RN 共享 ToolAction 类型
10. RN 只做审批收件箱
11. 保留 Expo Notifications
12. README 中说明技术 tradeoff
13. 数据模型一律 Zod-first（`z.infer` 派生 types），不写平行 interface

### 13.3 如果遇到冲突

按以下优先级裁决：

```txt
ToolApprovalCard 深度
> Web 核心闭环
> Timeline 留痕
> Shared 状态机
> RN 三屏审批
> Expo Notifications
> UI 美化
> 数据看板
> 其他外围能力
```

---

## 14. 推荐开发步骤

> 注意：本节是步骤顺序，不是时间计划。

### Step 1：建立 monorepo 基础

目标：

- pnpm workspaces
- apps/web
- apps/mobile
- packages/shared
- packages/mock-ai

> 工程落地：
> - 根 `.npmrc` 写 `node-linker=hoisted`，或在 `apps/mobile/metro.config.js` 配 `watchFolders` + `nodeModulesPaths`，否则 Expo / Metro 解析不到 `packages/shared`。
> - `packages/shared`、`packages/mock-ai` 用 `exports` 直接指向 `./src/index.ts` 源码，让 Vite（esbuild）与 Metro 都直接吃 TS 源码、免构建步。
> - 配 workspace 的 **tsconfig path/references**，让两端 `tsc` / IDE 能解析 shared 的 TS 源码（运行时由 metro / esbuild 处理，类型检查需要这一步）。

### Step 2：定义 shared 类型与 schema

目标：

- 枚举与 RiskLevel / ToolActionType / ToolActionStatus 等
- ToolAction 参数 schema + `TOOL_ACTION_PARAMS_SCHEMAS` 注册表
- ToolAction（判别联合）
- AIAnalysis
- Conversation / Customer / Message
- TimelineEvent
- ApprovalTask

> 一律 **Zod-first**，types 由 `z.infer` 派生，不写平行 interface（见 §10）。同时定义审批分流策略：`MOBILE_APPROVAL_RISK_THRESHOLD` + `requiresMobileApproval`（见 §5.2）。

### Step 3：定义 XState 状态机

目标：

- suggested
- editing
- approved
- rejected
- executing
- success
- failed
- rollback

产出：

- approvalMachine
- events
- guards
- actions
- STATE_MACHINE.md

> `approvalMachine` 须实现 §9.3 的全部转移（含 `editing --CANCEL--> suggested`）。一个 ToolAction 一个实例。

### Step 4：实现 Mock LLM Adapter

目标：

- 固定 demo input
- 结构化 output
- Zod 校验（整体过 AIAnalysisSchema）
- fallback output
- 不依赖 UI

### Step 5：搭建 Web 工作台

目标：

- Vite React
- 三栏布局
- 会话列表
- 消息流
- 客户上下文
- Timeline 区域

### Step 6：实现 AI 分析触发

目标：

- 选择客户会话
- 输入 / 触发客户消息
- 调用 Mock LLM Adapter
- 生成 AIAnalysis
- 生成 ToolAction

### Step 7：实现 ToolApprovalCard

目标：

- suggested
- editing
- executing
- success
- failed
- rejected
- rollback
- 参数编辑（schema 驱动表单，见 §9.5）
- 参数 diff
- Timeline 写入

> 失败态由 §12.2 的“强制失败”开关触发，保证演示确定性。

### Step 8：打通 Web 闭环

目标：

- AI 建议
- 人工修改
- 审批执行
- 失败回滚
- Timeline 记录
- 会话状态更新

### Step 9：搭建 RN 审批端

目标：

- Expo Router
- 待审批列表
- 审批详情
- 状态回执
- 共享类型
- 共享状态机

### Step 10：接入 Expo Notifications

目标：

- 模拟推送
- 点击通知进入审批详情
- RN 审批后状态同步
- Web 显示同步结果

### Step 11：完善文档与演示材料

目标：

- README.md
- STATE_MACHINE.md
- DEMO_SCRIPT.md
- 技术 tradeoff
- 简历描述
- 截图说明

---

## 15. 验收标准

### 15.1 功能验收

必须能演示：

```txt
客户消息（张女士 · 优惠咨询）
→ AI 分析（intent=price_negotiation, risk=medium）
→ 生成建议回复 + 两个动作：send_coupon(medium) / create_followup_task(low)
→ ToolApprovalCard 渲染两张卡（均 suggested）
→ create_followup_task(low)：Web 改参 → 确认 → executing → success（演示 failed→rollback 走这张）→ Timeline
→ send_coupon(medium ≥ 阈值)：Web 不可批 → 生成 ApprovalTask → Expo 推送 RN
→ RN 审批详情：改参（20%/7天 → 15%/3天）→ 修改后同意
→ RN 裁决驱动状态机：editing → suggested → approved → executing → success
→ Web 同步该动作状态与 Timeline（含 rn_action_approved 事件）
```

### 15.2 技术验收

必须满足：

- Web 使用 Vite + React
- RN 使用 Expo
- shared 中有 Zod schema（Zod-first，types 由 z.infer 派生）
- shared 中有 XState 状态机
- ToolAction 参数按 type 用 Zod 定型，非 `Record<string, unknown>`
- ToolAction 生命周期不散落在组件 useState 中
- packages/shared 不含 React / UI
- Mock LLM Adapter 与 UI 解耦
- Timeline 记录关键事件
- RN 不复制 Web 工作台
- README 解释为什么不用 Next.js

### 15.3 求职展示验收

项目必须能讲清：

1. 为什么这是 AI 动作治理，不是普通客服系统
2. 为什么 AI 不能直接执行动作
3. 如何用 schema 约束 AI 输出
4. 如何用状态机治理 ToolAction
5. 如何实现 human-in-the-loop
6. 如何做参数编辑与回滚
7. 如何做 Timeline 审计留痕
8. 为什么 Web 用 Vite React 而不是 Next.js
9. 为什么 RN 端是审批收件箱而不是完整移动工作台
10. 后续如何扩展真实 LLM / Hono / streaming

---

## 16. README 简历描述草稿

```txt
AI Agent Desk｜React + React Native 多端 AI 动作治理工作台

面向企业客服 / 销售协同场景，自研 React + RN 多端 AI 动作治理原型。Web 端基于 Vite / React / TypeScript / AntD 实现会话工作台、AI 回复建议、工具调用审批与操作留痕；移动端基于 Expo React Native 实现待审批收件箱、AI 动作审批与推送回执。项目通过 Mock LLM Adapter 模拟结构化输出，将 AI 建议沉淀为可编辑、可确认、可回滚、可追踪的业务动作，并基于 XState 抽象 ToolApprovalCard 状态机、以 Zod 判别联合定型工具动作参数，实现 Web / RN 共享类型、schema 与审批流转规则。
```

---

## 17. 最终提醒给 AI Coding Agent

请严格记住：

```txt
不要造小型 Salesforce。
不要造完整客服系统。
不要为了 Next.js 而 Next.js。
不要为了真实 AI 而拖慢核心闭环。
不要把 ToolApprovalCard 做浅。
不要让外围功能抢走核心承重墙。
不要把 ToolAction 参数退回 Record<string, unknown>。
不要把 React 带进 packages/shared。
```

本项目的刀尖只有一个：

```txt
AI 建议动作 → 人工确认 → 可编辑 → 可执行 → 可回滚 → 可留痕 → 可移动审批
```

把这条链路做深，比做十个浅页面更重要。
