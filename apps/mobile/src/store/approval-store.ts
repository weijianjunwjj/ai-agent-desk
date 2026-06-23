import type { ToolActionStatus } from '@ai-agent-desk/shared';
import { create } from 'zustand';

import { seedInbox, type TaskDetail } from '../mock/seed';

export type DecisionKind = 'approved' | 'rejected' | 'edited_approved' | 'delayed';

export interface DecisionResult {
  decision: DecisionKind;
  finalStatus: ToolActionStatus | 'delayed';
  finalParams?: Record<string, unknown>;
  handledAt: string;
  syncStatus: string;
}

interface ApprovalState {
  loaded: boolean;
  order: string[];
  details: Record<string, TaskDetail>;
  results: Record<string, DecisionResult>;
  pushedTaskIds: string[];
  load: () => Promise<void>;
  recordResult: (taskId: string, result: DecisionResult) => void;
  markDelayed: (taskId: string) => void;
  markPushed: (taskId: string) => void;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  loaded: false,
  order: [],
  details: {},
  results: {},
  pushedTaskIds: [],
  load: async () => {
    if (get().loaded) return;
    const tasks = await seedInbox();
    const details: Record<string, TaskDetail> = {};
    const order: string[] = [];
    for (const detail of tasks) {
      details[detail.task.id] = detail;
      order.push(detail.task.id);
    }
    set({ loaded: true, details, order });
  },
  recordResult: (taskId, result) =>
    set((state) => ({ results: { ...state.results, [taskId]: result } })),
  markDelayed: (taskId) =>
    set((state) => ({
      results: {
        ...state.results,
        [taskId]: {
          decision: 'delayed',
          finalStatus: 'delayed',
          handledAt: new Date().toISOString(),
          syncStatus: '已置为稍后处理，ToolAction 保持 suggested',
        },
      },
    })),
  markPushed: (taskId) =>
    set((state) =>
      state.pushedTaskIds.includes(taskId)
        ? state
        : { pushedTaskIds: [...state.pushedTaskIds, taskId] },
    ),
}));
