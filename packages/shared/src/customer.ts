// Customer (PRD §10.6).
import { z } from 'zod';

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
