// The Mock LLM Adapter implements the shared LLMAdapter contract (PRD §11.2).
// The interface itself now lives in @ai-agent-desk/shared so every consumer —
// mock-ai here, the v0.2 server's RealLLMAdapter — shares one definition and
// there is no parallel rule in the server (v0.2 §0).
import type { AnalyzeConversationInput, LLMAdapter } from '@ai-agent-desk/shared';

// Re-exported for back-compat: existing imports (adapter.ts, adapter.test.ts)
// keep referencing these from './types'.
export type { AnalyzeConversationInput };
export type MockLLMAdapter = LLMAdapter;
