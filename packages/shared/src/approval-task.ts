// ApprovalTask (PRD §10.9). Created only when requiresMobileApproval(riskLevel)
// is true (PRD §5.2). `delayed` maps to RN's "稍后处理"; the linked ToolAction
// then stays `suggested`.
import { z } from 'zod';

import { RiskLevelSchema } from './enums';

export const ApprovalTaskStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'delayed',
]);
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
