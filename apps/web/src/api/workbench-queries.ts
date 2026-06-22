// TanStack Query hooks over the mock fixtures (PRD §12.1). A small delay
// simulates async fetching so loading states are exercised. Real mutations
// (AI trigger, approval) arrive in Step 6+.
import { DEMO_CUSTOMER_MESSAGE, mockLLMAdapter } from '@ai-agent-desk/mock-ai';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { analysisStore } from '../mock/analysis-store';
import {
  conversations,
  customers,
  messagesByConversation,
  timelineByConversation,
} from '../mock/fixtures';

function resolveLater<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), 120);
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => resolveLater(conversations),
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => resolveLater(customers),
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => resolveLater(messagesByConversation[conversationId ?? ''] ?? []),
    enabled: Boolean(conversationId),
  });
}

export function useTimeline(conversationId: string | null) {
  return useQuery({
    queryKey: ['timeline', conversationId],
    queryFn: () => resolveLater(timelineByConversation[conversationId ?? ''] ?? []),
    enabled: Boolean(conversationId),
  });
}

// Reads the generated AIAnalysis for a conversation (PRD §12.1 aiAnalysis as
// query state). Null until AI analysis has been triggered.
export function useAnalysis(conversationId: string | null) {
  return useQuery({
    queryKey: ['analysis', conversationId],
    queryFn: () => resolveLater(analysisStore.get(conversationId ?? '')),
    enabled: Boolean(conversationId),
  });
}

// Triggers AI analysis on the conversation's latest customer message (PRD §14
// Step 6 / §11): calls the Mock LLM Adapter, persists the AIAnalysis (with its
// nextActions = ToolActions), and primes the query cache.
export function useTriggerAnalysis(conversationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const conversation = conversations.find((c) => c.id === conversationId);
      const customer = customers.find((c) => c.id === conversation?.customerId);
      if (!conversationId || !customer) {
        throw new Error('conversation or customer not found');
      }
      const previousMessages = messagesByConversation[conversationId] ?? [];
      const latestCustomerMessage = [...previousMessages]
        .reverse()
        .find((m) => m.senderType === 'customer');
      const analysis = await mockLLMAdapter.analyzeConversation({
        conversationId,
        latestMessage: latestCustomerMessage?.content ?? DEMO_CUSTOMER_MESSAGE,
        customer,
        previousMessages,
      });
      analysisStore.set(analysis);
      return analysis;
    },
    onSuccess: (analysis) => {
      queryClient.setQueryData(['analysis', conversationId], analysis);
    },
  });
}
