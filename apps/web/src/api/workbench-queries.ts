// TanStack Query hooks over the mock fixtures (PRD §12.1). A small delay
// simulates async fetching so loading states are exercised. Real mutations
// (AI trigger, approval) arrive in Step 6+.
import { useQuery } from '@tanstack/react-query';

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
