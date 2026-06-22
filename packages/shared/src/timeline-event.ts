// TimelineEvent (PRD §10.8) — the audit trail record for every key action.
import { z } from 'zod';

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
  // beforeSnapshot / afterSnapshot 是异构审计数据（参数 diff、状态快照等）。
  // 这是全文唯一允许的 unknown 记录，其余一律定型（PRD §10.8）。
  beforeSnapshot: z.record(z.unknown()).optional(),
  afterSnapshot: z.record(z.unknown()).optional(),
  createdAt: z.string(),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
