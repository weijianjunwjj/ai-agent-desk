// ToolAction discriminated union (PRD §10.3). `params / originalParams /
// editedParams` use the parameter schema for the action's `type`, narrowed by
// the `type` discriminant.
import { z } from 'zod';

import { RiskLevelSchema, ToolActionStatusSchema } from './enums';
import {
  CreateFollowupTaskParamsSchema,
  EscalateTicketParamsSchema,
  SendCouponParamsSchema,
  TransferToHumanParamsSchema,
  UpdateCustomerStatusParamsSchema,
} from './tool-action-params';

const toolActionBaseSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  analysisId: z.string(),
  title: z.string(),
  reason: z.string(), // AI 建议理由
  riskLevel: RiskLevelSchema,
  status: ToolActionStatusSchema,
  requiresApproval: z.boolean(), // 本期恒为 true（无自动执行分支）
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  executedAt: z.string().optional(),
  failedReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// originalParams = AI 原始基线（只读）；params = 当前生效；
// editedParams = 编辑草稿（SAVE 时 draft → params）。
export const ToolActionSchema = z.discriminatedUnion('type', [
  toolActionBaseSchema.extend({
    type: z.literal('send_coupon'),
    params: SendCouponParamsSchema,
    originalParams: SendCouponParamsSchema,
    editedParams: SendCouponParamsSchema.optional(),
  }),
  toolActionBaseSchema.extend({
    type: z.literal('create_followup_task'),
    params: CreateFollowupTaskParamsSchema,
    originalParams: CreateFollowupTaskParamsSchema,
    editedParams: CreateFollowupTaskParamsSchema.optional(),
  }),
  toolActionBaseSchema.extend({
    type: z.literal('escalate_ticket'),
    params: EscalateTicketParamsSchema,
    originalParams: EscalateTicketParamsSchema,
    editedParams: EscalateTicketParamsSchema.optional(),
  }),
  toolActionBaseSchema.extend({
    type: z.literal('transfer_to_human'),
    params: TransferToHumanParamsSchema,
    originalParams: TransferToHumanParamsSchema,
    editedParams: TransferToHumanParamsSchema.optional(),
  }),
  toolActionBaseSchema.extend({
    type: z.literal('update_customer_status'),
    params: UpdateCustomerStatusParamsSchema,
    originalParams: UpdateCustomerStatusParamsSchema,
    editedParams: UpdateCustomerStatusParamsSchema.optional(),
  }),
]);
export type ToolAction = z.infer<typeof ToolActionSchema>;
