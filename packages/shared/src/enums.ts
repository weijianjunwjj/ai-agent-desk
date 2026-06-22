// Enums & primitive schemas (PRD §10.1). Zod-first: every type is derived via
// z.infer — no parallel interface is written anywhere.
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
  'suggested',
  'editing',
  'approved',
  'rejected',
  'executing',
  'success',
  'failed',
  'rollback',
]);
export type ToolActionStatus = z.infer<typeof ToolActionStatusSchema>;

export const ConversationStatusSchema = z.enum([
  'pending_reply',
  'ai_suggested',
  'waiting_approval',
  'followed_up',
  'closed',
]);
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

export const SenderTypeSchema = z.enum(['customer', 'human', 'ai', 'system']);
export type SenderType = z.infer<typeof SenderTypeSchema>;

export const MessageTypeSchema = z.enum([
  'text',
  'ai_suggestion',
  'system_event',
  'tool_event',
]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const SentimentSchema = z.enum(['positive', 'neutral', 'hesitant', 'angry']);
export type Sentiment = z.infer<typeof SentimentSchema>;
