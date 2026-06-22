// Message (PRD §10.7).
import { z } from 'zod';

import { MessageTypeSchema, SenderTypeSchema } from './enums';

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderType: SenderTypeSchema,
  messageType: MessageTypeSchema,
  content: z.string(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;
