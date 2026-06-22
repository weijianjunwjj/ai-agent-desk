// Contract tests for approvalMachine (PRD §12 quality gate / §9.3).
// Mandated paths: suggested→approved→executing→success,
// executing→failed→rollback, editing→CANCEL→suggested — plus the other §9.3
// edges and the transient/terminal invariants.
import { createActor } from 'xstate';
import { describe, expect, it } from 'vitest';

import { approvalMachine, type ApprovalEvent } from './approval-machine';

type EventType = ApprovalEvent['type'];

// Drive a fresh actor through a sequence of events; return the resting state value.
function run(...events: EventType[]): string {
  const actor = createActor(approvalMachine).start();
  for (const type of events) {
    actor.send({ type });
  }
  const { value } = actor.getSnapshot();
  return value as string;
}

describe('approvalMachine (PRD §9.3)', () => {
  it('初始态为 suggested', () => {
    expect(run()).toBe('suggested');
  });

  it('suggested → approved → executing → success（approved 瞬时，APPROVE 后直达 executing）', () => {
    expect(run('APPROVE')).toBe('executing');
    expect(run('APPROVE', 'RESOLVE_SUCCESS')).toBe('success');
  });

  it('executing → failed → rollback', () => {
    expect(run('APPROVE', 'RESOLVE_FAILURE')).toBe('failed');
    expect(run('APPROVE', 'RESOLVE_FAILURE', 'ROLLBACK')).toBe('rollback');
  });

  it('editing → CANCEL → suggested', () => {
    expect(run('EDIT')).toBe('editing');
    expect(run('EDIT', 'CANCEL')).toBe('suggested');
  });

  it('editing → SAVE → suggested', () => {
    expect(run('EDIT', 'SAVE')).toBe('suggested');
  });

  it('suggested → REJECT → rejected', () => {
    expect(run('REJECT')).toBe('rejected');
  });

  it('failed → RETRY → executing', () => {
    expect(run('APPROVE', 'RESOLVE_FAILURE', 'RETRY')).toBe('executing');
  });

  it('success → ROLLBACK → rollback', () => {
    expect(run('APPROVE', 'RESOLVE_SUCCESS', 'ROLLBACK')).toBe('rollback');
  });

  it('rejected 是终态：后续事件不再改变状态', () => {
    expect(run('REJECT', 'APPROVE', 'EDIT')).toBe('rejected');
  });

  it('rollback 是终态：后续事件不再改变状态', () => {
    expect(run('APPROVE', 'RESOLVE_FAILURE', 'ROLLBACK', 'RETRY')).toBe('rollback');
  });

  it('非法转移被忽略：suggested 收到 RESOLVE_SUCCESS 不变', () => {
    expect(run('RESOLVE_SUCCESS')).toBe('suggested');
  });
});
