// Static skeleton fixtures for the Web workbench (Step 5). These are placeholder
// view data so the three-column layout renders; real AI analysis / ToolActions
// are generated via mockLLMAdapter starting in Step 6. Typed against the shared
// Zod-derived types so they stay schema-consistent.
import type {
  Conversation,
  Customer,
  Message,
  TimelineEvent,
} from '@ai-agent-desk/shared';
import { DEMO_CUSTOMER_MESSAGE } from '@ai-agent-desk/mock-ai';

export const customers: Customer[] = [
  {
    id: 'cust_zhang',
    name: '张女士',
    company: '云图科技',
    level: 'gold',
    tags: ['price_sensitive', 'comparing_competitors'],
    summary: '黄金客户，近期咨询续费与优惠，正在比较竞品。',
    lastContactAt: '2026-06-22T09:10:00.000Z',
  },
  {
    id: 'cust_li',
    name: '李先生',
    company: '远帆贸易',
    level: 'silver',
    tags: ['renewal'],
    summary: '白银客户，续约意向明确，关注交付时间。',
    lastContactAt: '2026-06-21T03:20:00.000Z',
  },
  {
    id: 'cust_wang',
    name: '王女士',
    level: 'normal',
    tags: [],
    summary: '普通客户，问题已解决，会话已关闭。',
    lastContactAt: '2026-06-18T08:00:00.000Z',
  },
];

export const conversations: Conversation[] = [
  {
    id: 'conv_zhang',
    customerId: 'cust_zhang',
    channel: 'web',
    status: 'ai_suggested',
    intent: 'price_negotiation',
    riskLevel: 'medium',
    unreadCount: 1,
    pendingActionCount: 2,
    lastMessageAt: '2026-06-22T09:10:00.000Z',
    createdAt: '2026-06-22T09:00:00.000Z',
    updatedAt: '2026-06-22T09:10:00.000Z',
  },
  {
    id: 'conv_li',
    customerId: 'cust_li',
    channel: 'app',
    status: 'pending_reply',
    intent: 'renewal',
    riskLevel: 'low',
    unreadCount: 2,
    pendingActionCount: 0,
    lastMessageAt: '2026-06-21T03:20:00.000Z',
    createdAt: '2026-06-21T03:00:00.000Z',
    updatedAt: '2026-06-21T03:20:00.000Z',
  },
  {
    id: 'conv_wang',
    customerId: 'cust_wang',
    channel: 'wechat',
    status: 'closed',
    riskLevel: 'low',
    unreadCount: 0,
    pendingActionCount: 0,
    lastMessageAt: '2026-06-18T08:00:00.000Z',
    createdAt: '2026-06-18T07:30:00.000Z',
    updatedAt: '2026-06-18T08:00:00.000Z',
  },
];

export const messagesByConversation: Record<string, Message[]> = {
  conv_zhang: [
    {
      id: 'msg_zhang_1',
      conversationId: 'conv_zhang',
      senderType: 'customer',
      messageType: 'text',
      content: DEMO_CUSTOMER_MESSAGE,
      createdAt: '2026-06-22T09:10:00.000Z',
    },
  ],
  conv_li: [
    {
      id: 'msg_li_1',
      conversationId: 'conv_li',
      senderType: 'customer',
      messageType: 'text',
      content: '我们想续约，但希望确认下新合同的交付时间。',
      createdAt: '2026-06-21T03:18:00.000Z',
    },
    {
      id: 'msg_li_2',
      conversationId: 'conv_li',
      senderType: 'human',
      messageType: 'text',
      content: '好的，我确认后尽快回复您。',
      createdAt: '2026-06-21T03:20:00.000Z',
    },
  ],
  conv_wang: [
    {
      id: 'msg_wang_1',
      conversationId: 'conv_wang',
      senderType: 'customer',
      messageType: 'text',
      content: '问题已经解决了，谢谢！',
      createdAt: '2026-06-18T07:58:00.000Z',
    },
    {
      id: 'msg_wang_2',
      conversationId: 'conv_wang',
      senderType: 'system',
      messageType: 'system_event',
      content: '会话已关闭。',
      createdAt: '2026-06-18T08:00:00.000Z',
    },
  ],
};

export const timelineByConversation: Record<string, TimelineEvent[]> = {
  conv_zhang: [
    {
      id: 'tl_zhang_1',
      conversationId: 'conv_zhang',
      eventType: 'conversation_status_updated',
      title: '会话状态更新',
      description: '客户发起优惠咨询，等待 AI 分析。',
      operatorType: 'system',
      operatorName: '系统',
      createdAt: '2026-06-22T09:10:00.000Z',
    },
  ],
  conv_li: [],
  conv_wang: [
    {
      id: 'tl_wang_1',
      conversationId: 'conv_wang',
      eventType: 'conversation_status_updated',
      title: '会话已关闭',
      description: '问题解决，会话关闭。',
      operatorType: 'human',
      operatorName: '客服小林',
      createdAt: '2026-06-18T08:00:00.000Z',
    },
  ],
};
