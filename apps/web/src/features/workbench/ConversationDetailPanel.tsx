import type { Message, SenderType } from '@ai-agent-desk/shared';
import { Alert, Card, Empty, Spin, Tag, Typography } from 'antd';

import { useConversations, useMessages } from '../../api/workbench-queries';
import { formatDateTime } from '../../lib/format';
import { useWorkbenchStore } from '../../store/workbench-store';

const SENDER_LABELS: Record<SenderType, string> = {
  customer: '客户',
  human: '人工',
  ai: 'AI',
  system: '系统',
};

const SENDER_COLORS: Record<SenderType, string> = {
  customer: 'blue',
  human: 'green',
  ai: 'purple',
  system: 'default',
};

function MessageBubble({ message }: { message: Message }) {
  const mine = message.senderType !== 'customer';
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{ maxWidth: '70%' }}>
        <div style={{ marginBottom: 4, textAlign: mine ? 'right' : 'left' }}>
          <Tag color={SENDER_COLORS[message.senderType]}>{SENDER_LABELS[message.senderType]}</Tag>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {formatDateTime(message.createdAt)}
          </Typography.Text>
        </div>
        <Card size="small" styles={{ body: { padding: '8px 12px' } }}>
          {message.content}
        </Card>
      </div>
    </div>
  );
}

// Center column (PRD §7.3 消息流 + §7.4 AI 建议). Skeleton: renders the message
// stream; the AI suggestion / ToolApprovalCard area is wired in Step 6 / Step 7.
export function ConversationDetailPanel() {
  const selectedId = useWorkbenchStore((s) => s.selectedConversationId);
  const { data: conversations = [] } = useConversations();
  const { data: messages = [], isLoading } = useMessages(selectedId);

  if (!selectedId) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <Empty description="请选择左侧会话查看消息流" />
      </div>
    );
  }

  const conversation = conversations.find((c) => c.id === selectedId);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        会话消息流
        {conversation?.intent ? (
          <Typography.Text type="secondary" style={{ fontSize: 14, marginLeft: 8 }}>
            · {conversation.intent}
          </Typography.Text>
        ) : null}
      </Typography.Title>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : messages.length === 0 ? (
        <Empty description="暂无消息" />
      ) : (
        messages.map((message) => <MessageBubble key={message.id} message={message} />)
      )}

      <Card title="AI 建议与动作审批" style={{ marginTop: 16 }}>
        <Alert
          type="info"
          showIcon
          message="AI 建议区（骨架）"
          description="选择会话后触发 AI 分析，将在此生成结构化建议回复与 ToolApprovalCard（Step 6 接入触发、Step 7 接入审批卡）。"
        />
      </Card>
    </div>
  );
}
