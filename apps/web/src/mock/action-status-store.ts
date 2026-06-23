// Tracks the live status of each ToolAction (keyed by actionId), updated by
// ToolApprovalCard on every transition. Conversation status / pendingActionCount
// are derived from this (see deriveConversation in workbench-queries). The XState
// machine remains the per-card source of truth (PRD §12.3); this is just a shared
// projection so the list and context panel can react (mock only).
import type { ToolActionStatus } from '@ai-agent-desk/shared';

const statusByActionId = new Map<string, ToolActionStatus>();

export const actionStatusStore = {
  set(actionId: string, status: ToolActionStatus): void {
    statusByActionId.set(actionId, status);
  },
  get(actionId: string): ToolActionStatus | undefined {
    return statusByActionId.get(actionId);
  },
};
