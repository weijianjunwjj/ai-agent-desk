// Fallback AIAnalysis (PRD §11.4): when generation or Zod validation fails, the
// adapter still resolves to a schema-valid AIAnalysis flagged as fallback, so the
// UI can render a "分析暂不可用" state instead of crashing. The fallback is
// detected by its sentinel intent (the frozen AIAnalysisSchema has no extra flag).
import { AIAnalysisSchema, type AIAnalysis } from '@ai-agent-desk/shared';

export const FALLBACK_INTENT = 'analysis_unavailable';

export function createFallbackAnalysis(conversationId: string, reason: string): AIAnalysis {
  const now = new Date().toISOString();
  return AIAnalysisSchema.parse({
    id: `analysis_fallback_${Date.now().toString(36)}`,
    conversationId,
    intent: FALLBACK_INTENT,
    sentiment: 'neutral',
    summary: 'AI 分析暂不可用，请人工处理。',
    suggestedReply: '',
    riskLevel: 'low',
    nextActions: [],
    rawOutput: JSON.stringify({ error: reason }),
    createdAt: now,
  });
}

export function isFallbackAnalysis(analysis: AIAnalysis): boolean {
  return analysis.intent === FALLBACK_INTENT;
}
