// In-memory Timeline store (seeded from fixtures). The ToolApprovalCard appends
// audit events here on key transitions (PRD §6.1.5 / §9); the right panel reads
// it via useTimeline. Real persistence is out of scope (mock only).
import type { TimelineEvent, TimelineEventType } from '@ai-agent-desk/shared';

import { timelineByConversation } from './fixtures';

const store = new Map<string, TimelineEvent[]>();
let seeded = false;

function ensureSeed(): void {
  if (seeded) return;
  for (const [conversationId, events] of Object.entries(timelineByConversation)) {
    store.set(conversationId, [...events]);
  }
  seeded = true;
}

export const timelineStore = {
  get(conversationId: string): TimelineEvent[] {
    ensureSeed();
    return store.get(conversationId) ?? [];
  },
  append(event: TimelineEvent): void {
    ensureSeed();
    const list = store.get(event.conversationId) ?? [];
    store.set(event.conversationId, [...list, event]);
  },
};

let counter = 0;

export function createTimelineEvent(input: {
  conversationId: string;
  actionId?: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  operatorType: 'ai' | 'human' | 'system';
  operatorName: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
}): TimelineEvent {
  counter += 1;
  return {
    id: `tl_${Date.now().toString(36)}_${counter.toString(36)}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
}
