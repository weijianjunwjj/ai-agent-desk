// LLM adapter contract (PRD §11.2) — the framework-agnostic seam between an
// LLM provider and the rest of the system. Lives in shared so every consumer
// (mock-ai's MockLLMAdapter, the server's RealLLMAdapter in v0.2 M2) implements
// the SAME interface and emits an AIAnalysis that passes AIAnalysisSchema.
//
// These are SERVICE / function-signature types, not data models — they reference
// the Zod-derived data types defined in this package. The Zod-first /
// no-parallel-interface rule (PRD §13.2.13) governs data models, all of which
// already live here as schemas. shared stays UI-free AND Node-free (v0.2 §0):
// this file imports only shared's own types.
import type { AIAnalysis } from './ai-analysis';
import type { Customer } from './customer';
import type { Message } from './message';

export interface AnalyzeConversationInput {
  conversationId: string;
  latestMessage: string;
  customer: Customer;
  previousMessages: Message[];
}

export interface LLMAdapter {
  analyzeConversation(input: AnalyzeConversationInput): Promise<AIAnalysis>;
}
