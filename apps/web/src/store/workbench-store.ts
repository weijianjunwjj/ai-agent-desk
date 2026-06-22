import type { ConversationStatus } from '@ai-agent-desk/shared';
import { create } from 'zustand';

export type StatusFilter = ConversationStatus | 'all';

// Local UI state only (PRD §12.2). Server/mock data lives in TanStack Query.
interface WorkbenchState {
  selectedConversationId: string | null;
  statusFilter: StatusFilter;
  // Demo control switch (PRD §12.2): force the next execution to fail, for a
  // deterministic failed→rollback demo. Consumed in Step 8 (not random).
  forceNextExecutionFailure: boolean;
  selectConversation: (id: string) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setForceNextExecutionFailure: (value: boolean) => void;
}

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
  selectedConversationId: null,
  statusFilter: 'all',
  forceNextExecutionFailure: false,
  selectConversation: (id) => set({ selectedConversationId: id }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setForceNextExecutionFailure: (value) => set({ forceNextExecutionFailure: value }),
}));
