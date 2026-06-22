// Per-type ToolAction parameter schemas + registry (PRD §10.2).
// This is the single source of truth for: the parameter editor's rendering,
// Zod validation, and Web/RN parameter consistency. Params are typed by action
// `type` — never `Record<string, unknown>` (PRD §13.1.20).
import { z } from 'zod';

import type { ToolActionType } from './enums';

export const SendCouponParamsSchema = z.object({
  discount: z.number().int().min(1).max(100), // 折扣百分比
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
  statusTag: z.string().min(1), // 如 price_sensitive
  note: z.string().optional(),
});

// Registry shared by the parameter editor and Zod validation. `satisfies`
// guarantees every ToolActionType is covered (missing one = compile error).
export const TOOL_ACTION_PARAMS_SCHEMAS = {
  send_coupon: SendCouponParamsSchema,
  create_followup_task: CreateFollowupTaskParamsSchema,
  escalate_ticket: EscalateTicketParamsSchema,
  transfer_to_human: TransferToHumanParamsSchema,
  update_customer_status: UpdateCustomerStatusParamsSchema,
} satisfies Record<ToolActionType, z.ZodTypeAny>;
