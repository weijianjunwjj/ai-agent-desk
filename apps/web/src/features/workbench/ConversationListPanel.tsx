import { useMemo } from 'react';
import { Badge, Empty, List, Space, Spin, Tag, Typography } from 'antd';

import { useConversations, useCustomers } from '../../api/workbench-queries';
import { formatDateTime } from '../../lib/format';
import {
  CHANNEL_LABELS,
  CONVERSATION_STATUS_COLORS,
  CONVERSATION_STATUS_LABELS,
  RISK_LEVEL_COLORS,
  RISK_LEVEL_LABELS,
} from '../../lib/labels';
import { useWorkbenchStore } from '../../store/workbench-store';

// Conversation list (PRD §7.2). Joins customer name from the customers query;
// filters by the Header's status filter.
export function ConversationListPanel() {
  const { data: conversations = [], isLoading } = useConversations();
  const { data: customers = [] } = useCustomers();
  const statusFilter = useWorkbenchStore((s) => s.statusFilter);
  const selectedId = useWorkbenchStore((s) => s.selectedConversationId);
  const selectConversation = useWorkbenchStore((s) => s.selectConversation);

  const nameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers],
  );

  const visible = useMemo(
    () =>
      statusFilter === 'all'
        ? conversations
        : conversations.filter((c) => c.status === statusFilter),
    [conversations, statusFilter],
  );

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (visible.length === 0) {
    return <Empty style={{ marginTop: 48 }} description="暂无会话" />;
  }

  return (
    <List
      dataSource={visible}
      renderItem={(conversation) => {
        const selected = conversation.id === selectedId;
        return (
          <List.Item
            onClick={() => selectConversation(conversation.id)}
            style={{
              cursor: 'pointer',
              padding: '12px 16px',
              background: selected ? '#e6f4ff' : undefined,
              borderInlineStart: selected ? '3px solid #1677ff' : '3px solid transparent',
            }}
          >
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography.Text strong>
                  {nameById.get(conversation.customerId) ?? conversation.customerId}
                </Typography.Text>
                <Badge count={conversation.pendingActionCount} size="small" />
              </div>
              <Typography.Paragraph
                type="secondary"
                ellipsis={{ rows: 1 }}
                style={{ margin: '4px 0' }}
              >
                {conversation.intent ?? '（暂无意图）'} · {CHANNEL_LABELS[conversation.channel]}
              </Typography.Paragraph>
              <Space size={4} wrap>
                <Tag color={CONVERSATION_STATUS_COLORS[conversation.status]}>
                  {CONVERSATION_STATUS_LABELS[conversation.status]}
                </Tag>
                <Tag color={RISK_LEVEL_COLORS[conversation.riskLevel]}>
                  {RISK_LEVEL_LABELS[conversation.riskLevel]}
                </Tag>
              </Space>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDateTime(conversation.lastMessageAt)}
                </Typography.Text>
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );
}
