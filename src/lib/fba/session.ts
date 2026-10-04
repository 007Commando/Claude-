"use client";

/**
 * The signed-in visitor's Firebase ID token, so the calculator's API can tell
 * a plan holder (never counted) from a visitor spending free lookups.
 *
 * The session comes from apex-auth.js, which loads after the page. Its first
 * auth-state callback is the settled answer; asking getCurrentUser() straight
 * away answers before Firebase has restored the session and calls a signed-in
 * customer a visitor. A lookup waits a short while for that answer, then goes
 * ahead without a token rather than holding a visitor up.
 */

let settled: Promise<boolean> | null = null;

const settle = () =>
  new Promise<boolean>((resolve) => {
    const start = Date.now();
    const tick = () => {
      const auth = window.ApexAuth;
      if (auth?.onAuthStateChanged) {
        let done = false;
        Promise.resolve(
          auth.onAuthStateChanged((user) => {
            if (done) return;
            done = true;
            resolve(!!user);
          }),
        ).catch(() => resolve(false));
        return;
      }
      if (Date.now() - start > 8000) return resolve(false);
      setTimeout(tick, 100);
    };
    tick();
  });

/** Starts listening early, so the first lookup rarely has to wait. */
export function warmSession() {
  settled ??= settle();
}

export async function sessionToken(maxWaitMs = 2500): Promise<string | null> {
  settled ??= settle();
  const signedIn = await Promise.race([settled, new Promise<boolean>((r) => setTimeout(() => r(false), maxWaitMs))]);
  if (!signedIn) return null;
  try {
    return (await window.ApexAuth?.getIdToken?.()) ?? null;
  } catch {
    return null;
  }
}
