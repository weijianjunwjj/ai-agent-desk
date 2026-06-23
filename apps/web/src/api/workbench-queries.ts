// TanStack Query hooks over the mock fixtures (PRD §12.1). A small delay
// simulates async fetching so loading states are exercised. Real mutations
// (AI trigger, approval) arrive in Step 6+.
import type { Conversation, TimelineEvent, ToolActionStatus } from '@ai-agent-desk/shared';
import { DEMO_CUSTOMER_MESSAGE, isFallbackAnalysis, mockLLMAdapter } from '@ai-agent-desk/mock-ai';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { actionStatusStore } from '../mock/action-status-store';
import { analysisStore } from '../mock/analysis-store';
import { conversations, customers, messagesByConversation } from '../mock/fixtures';
import { createTimelineEvent, timelineStore } from '../mock/timeline-store';

// A ToolAction is "resolved" once it leaves the decision/execution phase.
const RESOLVED_STATUSES: ToolActionStatus[] = ['success', 'rejected', 'rollback'];

// Derives conversation status + pendingActionCount from its actions' live
// statuses (PRD §14 Step 8 会话状态更新). Conversations without analysis are
// returned unchanged.
function deriveConversation(conversation: Conversation): Conversation {
  const analysis = analysisStore.get(conversation.id);
  if (!analysis || isFallbackAnalysis(analysis) || analysis.nextActions.length === 0) {
    return conversation;
  }
  const statuses = analysis.nextActions.map(
    (action) => actionStatusStore.get(action.id) ?? 'suggested',
  );
  const pendingActionCount = statuses.filter((s) => !RESOLVED_STATUSES.includes(s)).length;
  let status = conversation.status;
  if (pendingActionCount > 0) {
    status = 'waiting_approval';
  } else if (statuses.includes('success')) {
    status = 'followed_up';
  }
  return { ...conversation, status, pendingActionCount };
}

function resolveLater<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), 120);
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => resolveLater(conversations.map(deriveConversation)),
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
    queryFn: () => resolveLater(timelineStore.get(conversationId ?? '')),
    enabled: Boolean(conversationId),
  });
}

// Appends a Timeline event and refreshes the timeline query (PRD §6.1.5).
// Used by ToolApprovalCard on key transitions.
export function useTimelineWriter() {
  const queryClient = useQueryClient();
  return useCallback(
    (event: TimelineEvent) => {
      timelineStore.append(event);
      void queryClient.invalidateQueries({ queryKey: ['timeline', event.conversationId] });
    },
    [queryClient],
  );
}

// Projects a ToolAction's live status so the conversation list / context panel
// re-derive status + pendingActionCount (PRD §14 Step 8).
export function useActionStatusSync() {
  const queryClient = useQueryClient();
  return useCallback(
    (actionId: string, status: ToolActionStatus) => {
      actionStatusStore.set(actionId, status);
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    [queryClient],
  );
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
      if (!isFallbackAnalysis(analysis)) {
        timelineStore.append(
          createTimelineEvent({
            conversationId: analysis.conversationId,
            eventType: 'ai_analysis_created',
            title: 'AI 分析完成',
            description: analysis.summary,
            operatorType: 'ai',
            operatorName: 'Mock LLM',
          }),
        );
        for (const action of analysis.nextActions) {
          timelineStore.append(
            createTimelineEvent({
              conversationId: analysis.conversationId,
              actionId: action.id,
              eventType: 'tool_action_suggested',
              title: `AI 建议：${action.title}`,
              description: action.reason,
              operatorType: 'ai',
              operatorName: 'Mock LLM',
            }),
          );
        }
        timelineStore.append(
          createTimelineEvent({
            conversationId: analysis.conversationId,
            eventType: 'conversation_status_updated',
            title: '会话进入待审批',
            description: 'AI 已生成建议动作，等待人工审批。',
            operatorType: 'system',
            operatorName: '系统',
          }),
        );
      }
      void queryClient.invalidateQueries({ queryKey: ['timeline', conversationId] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
