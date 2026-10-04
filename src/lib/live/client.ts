/**
 * Live View, browser side: what the heartbeat knows about this visitor beyond
 * the page they are on.
 *
 * The qualifier tells it the email the moment step 1 is saved and which step
 * is open, so Lead Desk's Live tab can show "Maria · step 2" rather than an
 * anonymous dot. Anything set here triggers a beat straight away instead of
 * waiting out the fifteen-second interval.
 */

type Listener = () => void;

const state: { email?: string; name?: string; step?: number; account?: boolean } = {};
const listeners = new Set<Listener>();

export function liveState() {
  return state;
}

export function onLiveChange(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function changed() {
  listeners.forEach((listener) => listener());
}

export function liveIdentify(email: string, name?: string) {
  if (!email) return;
  state.email = email;
  if (name) state.name = name;
  changed();
}

export function liveStep(step: number) {
  if (state.step === step) return;
  state.step = step;
  changed();
}

/**
 * The visitor just created an Apex account. Live View records it once per
 * visit, with the site page that sent them to sign-up, for "accounts created
 * from" (Stefano, 2026-10-04).
 */
export function liveAccount(email?: string) {
  if (email && !state.email) state.email = email;
  if (state.account) return;
  state.account = true;
  changed();
}
