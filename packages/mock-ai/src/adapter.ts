// Mock LLM Adapter (PRD §11) — pure TypeScript, no real LLM / LangChain / RAG.
// Produces a structured AIAnalysis from a customer message and validates the
// whole thing through AIAnalysisSchema (PRD §11.4). The nextActions are validated
// per `type` automatically via the discriminated union in shared.
import { AIAnalysisSchema } from '@ai-agent-desk/shared';

import { createFallbackAnalysis } from './fallback';
import type { MockLLMAdapter } from './types';

// 固定 demo 输入（PRD §11.3）。Step 6 的 AI 触发与契约测试复用此常量。
export const DEMO_CUSTOMER_MESSAGE = '你们这个产品多少钱？有没有优惠？我还在考虑竞品。';

let idCounter = 0;
function genId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

// Builds the fixed price-negotiation analysis candidate (PRD §11.3), enriched to
// the full ToolAction shape: status='suggested', originalParams=params,
// editedParams left empty (PRD §11.4). Returned untyped on purpose — it is
// validated by AIAnalysisSchema.parse, which is the real type gate.
function buildPriceNegotiationCandidate(conversationId: string): unknown {
  const analysisId = genId('analysis');
  const now = new Date().toISOString();

  // 模拟「模型原始文本输出」（PRD §11.3 的结构），存入 rawOutput。
  const rawPayload = {
    intent: 'price_negotiation',
    sentiment: 'hesitant',
    riskLevel: 'medium',
    summary: '客户正在比较竞品，对价格敏感，希望获得优惠。',
    suggestedReply:
      '您好，我理解您对价格的顾虑。我们可以为您提供一张限时优惠券，并安排专人帮您对比方案。',
    nextActions: [
      {
        type: 'send_coupon',
        title: '发送优惠券',
        reason: '客户价格敏感，适度优惠有助于提升转化。',
        riskLevel: 'medium',
        params: { discount: 20, validDays: 7 },
        requiresApproval: true,
      },
      {
        type: 'create_followup_task',
        title: '创建跟进任务',
        reason: '客户仍在比较竞品，需要销售在 24 小时内跟进。',
        riskLevel: 'low',
        params: { channel: 'phone', dueInHours: 24 },
        requiresApproval: true,
      },
    ],
  };

  const nextActions = rawPayload.nextActions.map((action) => ({
    id: genId('action'),
    conversationId,
    analysisId,
    type: action.type,
    title: action.title,
    reason: action.reason,
    riskLevel: action.riskLevel,
    status: 'suggested',
    requiresApproval: action.requiresApproval,
    params: { ...action.params },
    originalParams: { ...action.params }, // §11.4：originalParams = params
    // editedParams 留空（§11.4）
    createdAt: now,
    updatedAt: now,
  }));

  return {
    id: analysisId,
    conversationId,
    intent: rawPayload.intent,
    sentiment: rawPayload.sentiment,
    summary: rawPayload.summary,
    suggestedReply: rawPayload.suggestedReply,
    riskLevel: rawPayload.riskLevel,
    nextActions,
    rawOutput: JSON.stringify(rawPayload),
    createdAt: now,
  };
}

export const mockLLMAdapter: MockLLMAdapter = {
  async analyzeConversation(input) {
    try {
      if (!input.latestMessage.trim()) {
        return createFallbackAnalysis(input.conversationId, 'empty latestMessage');
      }
      // 本期为单一固定场景（PRD §11.3）：任意非空消息都走 price_negotiation。
      const candidate = buildPriceNegotiationCandidate(input.conversationId);
      // 必须经过 Zod 校验（PRD §11.4）：校验不通过会 throw，落入 fallback。
      return AIAnalysisSchema.parse(candidate);
    } catch (error) {
      return createFallbackAnalysis(
        input.conversationId,
        error instanceof Error ? error.message : 'unknown error',
      );
    }
  },
};
