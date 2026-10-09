"use client";

import { CALL_OUTCOME_LABELS, CALL_OUTCOME_TONES, type SalesCall } from "../../../lib/leads/calls";

/** The outcome of a call as a small chip; calls the AI has not read yet get a plain status instead. */
export function OutcomeChip({ call }: { call: SalesCall }) {
  const outcome = call.summary?.outcome;
  if (outcome) {
    return (
      <span className="ld-calls-chip" data-tone={CALL_OUTCOME_TONES[outcome]}>
        {CALL_OUTCOME_LABELS[outcome]}
      </span>
    );
  }
  return (
    <span className="ld-calls-chip" data-tone="quiet">
      {call.connected ? "Connected" : "Not connected"}
    </span>
  );
}
