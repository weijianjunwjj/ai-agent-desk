// Conversation (PRD §10.5).
import { z } from 'zod';

import { ConversationStatusSchema, RiskLevelSchema } from './enums';

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
