// approvalMachine — the XState v5 state machine governing one ToolAction's
// lifecycle (PRD §9.3 / §12.3). One ToolAction == one machine instance (one per
// ToolApprovalCard). This definition is framework-free and lives in shared; the
// `@xstate/react` binding lives in each app (PRD §3.4 red line).
//
// 8 states (PRD §9.3): suggested / editing / approved / rejected /
// executing / success / failed / rollback.
//
// Notes baked in from §9.3:
//   - `approved` is a transient state: approving immediately triggers execution
//     (the EXECUTE edge) and never rests — modelled as an `always` transition.
//   - `rejected` and `rollback` are terminal (no outgoing transitions).
//   - Side effects (Timeline writes, mock execution) are NOT in this machine:
//     shared stays pure (§3.4). Apps observe transitions and write the Timeline
//     at the app layer (§12.3).
import { setup } from 'xstate';

export type ApprovalEvent =
  | { type: 'EDIT' } //            suggested → editing
  | { type: 'APPROVE' } //         suggested → approved (→ executing, transient)
  | { type: 'REJECT' } //          suggested → rejected (terminal)
  | { type: 'SAVE' } //            editing → suggested (commit draft)
  | { type: 'CANCEL' } //          editing → suggested (discard draft)
  | { type: 'RESOLVE_SUCCESS' } // executing → success
  | { type: 'RESOLVE_FAILURE' } // executing → failed
  | { type: 'RETRY' } //           failed → executing
  | { type: 'ROLLBACK' }; //       failed → rollback, success → rollback

export const approvalMachine = setup({
  types: {
    events: {} as ApprovalEvent,
  },
}).createMachine({
  id: 'approval',
  initial: 'suggested',
  states: {
    suggested: {
      on: {
        EDIT: 'editing',
        APPROVE: 'approved',
        REJECT: 'rejected',
      },
    },
    editing: {
      on: {
        SAVE: 'suggested', // 草稿校验通过后写回 params（校验在 app 层）
        CANCEL: 'suggested', // 丢弃草稿、还原参数
      },
    },
    approved: {
      // 瞬时态：批准即自动执行（等价于自动派发 EXECUTE），不停留等待（§9.3）
      always: 'executing',
    },
    rejected: {
      // 终态：仅从 suggested 进入，进入后不可再操作（§9.10）
    },
    executing: {
      on: {
        RESOLVE_SUCCESS: 'success',
        RESOLVE_FAILURE: 'failed',
      },
    },
    success: {
      on: {
        ROLLBACK: 'rollback',
      },
    },
    failed: {
      on: {
        RETRY: 'executing',
        ROLLBACK: 'rollback',
      },
    },
    rollback: {
      // 终态：无出向转移（§9.9）
    },
  },
});
