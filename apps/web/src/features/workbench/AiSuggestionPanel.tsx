import { isFallbackAnalysis } from '@ai-agent-desk/mock-ai';
import { Alert, App, Button, Card, Empty, Space, Spin, Tag, Typography } from 'antd';

import { useAnalysis, useTriggerAnalysis } from '../../api/workbench-queries';
import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS, SENTIMENT_LABELS } from '../../lib/labels';
import { SuggestedActionPreview } from './SuggestedActionPreview';

// AI 建议区 (PRD §7.4): triggers analysis and renders intent / sentiment /
// summary / suggestedReply / riskLevel / nextActions. Output comes only from the
// Mock LLM Adapter (never hardcoded in the component — PRD §11.4).
export function AiSuggestionPanel({ conversationId }: { conversationId: string }) {
  const { message } = App.useApp();
  const { data: analysis, isLoading } = useAnalysis(conversationId);
  const trigger = useTriggerAnalysis(conversationId);

  const handleTrigger = () => {
    trigger.mutate(undefined, {
      onSuccess: () => message.success('AI 分析完成'),
      onError: () => message.error('AI 分析失败'),
    });
  };

  const reanalyzeButton = (
    <Button size="small" loading={trigger.isPending} onClick={handleTrigger}>
      重新分析
    </Button>
  );

  if (isLoading) {
    return (
      <Card title="AI 建议与动作审批" style={{ marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card title="AI 建议与动作审批" style={{ marginTop: 16 }}>
        <Empty description="尚未分析。基于最近客户消息生成结构化建议与动作。">
          <Button type="primary" loading={trigger.isPending} onClick={handleTrigger}>
            触发 AI 分析
          </Button>
        </Empty>
      </Card>
    );
  }

  if (isFallbackAnalysis(analysis)) {
    return (
      <Card title="AI 建议与动作审批" style={{ marginTop: 16 }} extra={reanalyzeButton}>
        <Alert type="warning" showIcon message="AI 分析暂不可用" description={analysis.summary} />
      </Card>
    );
  }

  return (
    <Card title="AI 建议与动作审批" style={{ marginTop: 16 }} extra={reanalyzeButton}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap>
          <Tag color="geekblue">意图：{analysis.intent}</Tag>
          <Tag>情绪：{SENTIMENT_LABELS[analysis.sentiment]}</Tag>
          <Tag color={RISK_LEVEL_COLORS[analysis.riskLevel]}>
            {RISK_LEVEL_LABELS[analysis.riskLevel]}
          </Tag>
        </Space>

        <div>
          <Typography.Text type="secondary">分析摘要</Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 0 }}>{analysis.summary}</Typography.Paragraph>
        </div>

        <div>
          <Typography.Text type="secondary">建议回复</Typography.Text>
          <Typography.Paragraph
            style={{ marginBottom: 0, background: '#f5f5f5', padding: 8, borderRadius: 6 }}
          >
            {analysis.suggestedReply}
          </Typography.Paragraph>
        </div>

        <div>
          <Typography.Text strong>建议动作（{analysis.nextActions.length}）</Typography.Text>
          <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 8 }}>
            {analysis.nextActions.map((action) => (
              <SuggestedActionPreview key={action.id} action={action} />
            ))}
          </Space>
        </div>
      </Space>
    </Card>
  );
}
