// AIAnalysis (PRD §10.4). The whole structure is validated against this schema;
// its nextActions[] are validated per `type` via the ToolAction discriminated
// union (PRD §11.4).
import { z } from 'zod';

import { RiskLevelSchema, SentimentSchema } from './enums';
import { ToolActionSchema } from './tool-action';

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
