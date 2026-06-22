// In-memory mock "backend" for generated AIAnalysis (keyed by conversationId).
// Simulates server persistence so TanStack Query can read it and the result
// survives conversation switches. Real persistence is out of scope (mock only).
import type { AIAnalysis } from '@ai-agent-desk/shared';

const store = new Map<string, AIAnalysis>();

export const analysisStore = {
  get(conversationId: string): AIAnalysis | null {
    return store.get(conversationId) ?? null;
  },
  set(analysis: AIAnalysis): void {
    store.set(analysis.conversationId, analysis);
  },
};
