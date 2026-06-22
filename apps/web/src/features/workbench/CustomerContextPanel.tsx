import { Card, Descriptions, Empty, Space, Tag, Timeline, Typography } from 'antd';

import { useConversations, useCustomers, useTimeline } from '../../api/workbench-queries';
import { formatDateTime } from '../../lib/format';
import { CUSTOMER_LEVEL_LABELS } from '../../lib/labels';
import { useWorkbenchStore } from '../../store/workbench-store';

// Right column (PRD §7.5 客户上下文 + §7.6 Timeline). Shows only what's needed
// to judge the current action — not a full CRM.
export function CustomerContextPanel() {
  const selectedId = useWorkbenchStore((s) => s.selectedConversationId);
  const { data: conversations = [] } = useConversations();
  const { data: customers = [] } = useCustomers();
  const { data: timeline = [] } = useTimeline(selectedId);

  if (!selectedId) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <Empty description="请选择会话" />
      </div>
    );
  }

  const conversation = conversations.find((c) => c.id === selectedId);
  const customer = customers.find((c) => c.id === conversation?.customerId);

  return (
    <div style={{ padding: 16 }}>
      <Card title="客户上下文" size="small" style={{ marginBottom: 16 }}>
        {customer ? (
          <Descriptions
            column={1}
            size="small"
            items={[
              { key: 'name', label: '客户', children: customer.name },
              {
                key: 'level',
                label: '等级',
                children: CUSTOMER_LEVEL_LABELS[customer.level] ?? customer.level,
              },
              { key: 'company', label: '公司', children: customer.company ?? '—' },
              {
                key: 'tags',
                label: '标签',
                children:
                  customer.tags.length > 0 ? (
                    <Space size={4} wrap>
                      {customer.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  ) : (
                    '—'
                  ),
              },
              { key: 'summary', label: '历史摘要', children: customer.summary },
              {
                key: 'pending',
                label: '待处理动作',
                children: conversation?.pendingActionCount ?? 0,
              },
              {
                key: 'lastContact',
                label: '最近联系',
                children: formatDateTime(customer.lastContactAt),
              },
            ]}
          />
        ) : (
          <Empty description="无客户信息" />
        )}
      </Card>

      <Card title="时间线 / 操作留痕" size="small">
        {timeline.length === 0 ? (
          <Empty description="暂无留痕" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Timeline
            items={timeline.map((event) => ({
              children: (
                <div>
                  <Typography.Text strong>{event.title}</Typography.Text>
                  <div>
                    <Typography.Text>{event.description}</Typography.Text>
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {event.operatorName} · {formatDateTime(event.createdAt)}
                  </Typography.Text>
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
