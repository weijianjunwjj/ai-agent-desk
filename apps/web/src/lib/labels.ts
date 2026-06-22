// UI label / color maps for status & risk (PRD §7.2). Per the §7 caveat:
// "高风险" is a riskLevel, not a ConversationStatus; the two are shown as
// separate tags.
import type {
  ConversationStatus,
  RiskLevel,
  Sentiment,
  ToolActionType,
} from '@ai-agent-desk/shared';

export const CONVERSATION_STATUS_LABELS: Record<ConversationStatus, string> = {
  pending_reply: '待回复',
  ai_suggested: 'AI 已建议',
  waiting_approval: '待审批',
  followed_up: '已跟进',
  closed: '已关闭',
};

export const CONVERSATION_STATUS_COLORS: Record<ConversationStatus, string> = {
  pending_reply: 'blue',
  ai_suggested: 'geekblue',
  waiting_approval: 'orange',
  followed_up: 'green',
  closed: 'default',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'green',
  medium: 'gold',
  high: 'red',
};

export const CHANNEL_LABELS: Record<string, string> = {
  web: '网页',
  email: '邮件',
  wechat: '微信',
  app: 'App',
  manual: '人工',
};

export const CUSTOMER_LEVEL_LABELS: Record<string, string> = {
  normal: '普通',
  silver: '白银',
  gold: '黄金',
  vip: 'VIP',
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: '积极',
  neutral: '中性',
  hesitant: '犹豫',
  angry: '愤怒',
};

export const TOOL_ACTION_TYPE_LABELS: Record<ToolActionType, string> = {
  send_coupon: '发送优惠券',
  create_followup_task: '创建跟进任务',
  escalate_ticket: '升级工单',
  transfer_to_human: '转人工',
  update_customer_status: '更新客户状态',
};
