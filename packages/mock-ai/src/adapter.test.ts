// Contract tests for the Mock LLM Adapter (PRD §12 quality gate / §11.3 / §11.4):
// AIAnalysisSchema parses the §11.3 demo output; illegal params are rejected.
import { AIAnalysisSchema, requiresMobileApproval } from '@ai-agent-desk/shared';
import { describe, expect, it } from 'vitest';

import { DEMO_CUSTOMER_MESSAGE, mockLLMAdapter } from './adapter';
import { isFallbackAnalysis } from './fallback';
import type { AnalyzeConversationInput } from './types';

const demoInput: AnalyzeConversationInput = {
  conversationId: 'conv_demo_1',
  latestMessage: DEMO_CUSTOMER_MESSAGE,
  customer: {
    id: 'cust_1',
    name: '张女士',
    level: 'gold',
    tags: ['price_sensitive'],
    summary: '比较竞品中，对价格敏感。',
    lastContactAt: new Date().toISOString(),
  },
  previousMessages: [],
};

describe('mockLLMAdapter.analyzeConversation (PRD §11.3 / §11.4)', () => {
  it('输出整体通过 AIAnalysisSchema', async () => {
    const result = await mockLLMAdapter.analyzeConversation(demoInput);
    expect(AIAnalysisSchema.safeParse(result).success).toBe(true);
  });

  it('匹配 §11.3 固定 demo 字段与参数', async () => {
    const r = await mockLLMAdapter.analyzeConversation(demoInput);
    expect(r.intent).toBe('price_negotiation');
    expect(r.sentiment).toBe('hesitant');
    expect(r.riskLevel).toBe('medium');
    expect(r.nextActions).toHaveLength(2);

    const [coupon, followup] = r.nextActions;
    expect(coupon.type).toBe('send_coupon');
    expect(coupon.riskLevel).toBe('medium');
    if (coupon.type === 'send_coupon') {
      expect(coupon.params).toEqual({ discount: 20, validDays: 7 });
    }
    expect(followup.type).toBe('create_followup_task');
    expect(followup.riskLevel).toBe('low');
    if (followup.type === 'create_followup_task') {
      expect(followup.params).toEqual({ channel: 'phone', dueInHours: 24 });
    }
  });

  it('初始化 originalParams = params，editedParams 留空，status=suggested（§11.4）', async () => {
    const r = await mockLLMAdapter.analyzeConversation(demoInput);
    for (const action of r.nextActions) {
      expect(action.originalParams).toEqual(action.params);
      expect(action.editedParams).toBeUndefined();
      expect(action.status).toBe('suggested');
    }
  });

  it('§11.3 分流天然覆盖两支：send_coupon(medium)→RN、create_followup_task(low)→Web', async () => {
    const r = await mockLLMAdapter.analyzeConversation(demoInput);
    const [coupon, followup] = r.nextActions;
    expect(requiresMobileApproval(coupon.riskLevel)).toBe(true);
    expect(requiresMobileApproval(followup.riskLevel)).toBe(false);
  });

  it('非法 params 被 AIAnalysisSchema 拒绝（discount 超界）', async () => {
    const r = await mockLLMAdapter.analyzeConversation(demoInput);
    // JSON 往返得到无类型对象，注入非法值后用 schema 验证拒绝。
    const bad = JSON.parse(JSON.stringify(r));
    bad.nextActions[0].params.discount = 200; // SendCouponParamsSchema: max 100
    expect(AIAnalysisSchema.safeParse(bad).success).toBe(false);
  });

  it('空消息 → fallback（§11.4），fallback 仍通过 schema 且无 nextActions', async () => {
    const r = await mockLLMAdapter.analyzeConversation({ ...demoInput, latestMessage: '   ' });
    expect(isFallbackAnalysis(r)).toBe(true);
    expect(AIAnalysisSchema.safeParse(r).success).toBe(true);
    expect(r.nextActions).toHaveLength(0);
  });
});
