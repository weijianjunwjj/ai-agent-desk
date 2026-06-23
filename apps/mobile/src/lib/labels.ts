import type { RiskLevel, ToolActionType } from '@ai-agent-desk/shared';

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: '#52c41a',
  medium: '#faad14',
  high: '#f5222d',
};

export const TOOL_ACTION_TYPE_LABELS: Record<ToolActionType, string> = {
  send_coupon: '发送优惠券',
  create_followup_task: '创建跟进任务',
  escalate_ticket: '升级工单',
  transfer_to_human: '转人工',
  update_customer_status: '更新客户状态',
};

export const DECISION_LABELS: Record<string, string> = {
  approved: '已同意',
  rejected: '已拒绝',
  edited_approved: '修改后同意',
  delayed: '稍后处理',
};
