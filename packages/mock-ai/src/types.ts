// Mock LLM Adapter service interfaces (PRD §11.2).
// These are SERVICE/function-signature types, not data models — they reference
// the Zod-derived data types from shared. The Zod-first / no-parallel-interface
// rule (PRD §13.2.13) is about data models, which all live in shared.
import type { AIAnalysis, Customer, Message } from '@ai-agent-desk/shared';

export interface AnalyzeConversationInput {
  conversationId: string;
  latestMessage: string;
  customer: Customer;
  previousMessages: Message[];
}

export interface MockLLMAdapter {
  analyzeConversation(input: AnalyzeConversationInput): Promise<AIAnalysis>;
}
