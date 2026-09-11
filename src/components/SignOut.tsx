"use client";

import { useEffect } from "react";

/**
 * The first stop of a two-step, race-free sign-out.
 *
 * Signing out used to happen in the app first, which meant the instant the
 * session died, the app's own auth guard raced the logout's redirect — and
 * when the guard won, this domain's still-alive session handed the user
 * straight back in. Clearing IN ORDER removes the race entirely:
 *
 *   1. This page clears the marketing-domain session (nothing can race it —
 *      the app's session is still alive, so no guard fires anywhere).
 *   2. It forwards to the app's /auth/logout, which clears the app session
 *      and local storage.
 *   3. That page returns to /auth?switch=1 — the form, with both sessions
 *      dead. The ?switch flag makes the form re-clear defensively in case
 *      step 1 was blocked (an ad-blocker eating the bridge script).
 *
 * Any other open app tab that notices the dying session and bounces to the
 * login form arrives after step 1, finds no session here, and simply shows
 * the form — instead of resurrecting the account as it used to.
 */
const APP_LOGOUT_URL =
  "https://app.apexapplications.io/auth/logout?return_url=" +
  encodeURIComponent("https://www.apexapplications.io/auth?switch=1");

export default function SignOut() {
  useEffect(() => {
    let done = false;
    const proceed = () => {
      if (done) return;
      done = true;
      window.location.replace(APP_LOGOUT_URL);
    };

    // If the bridge never loads, still finish the walk — the ?switch=1
    // landing gives this domain's session a second clearing chance.
    const failsafe = setTimeout(proceed, 4000);

    const start = Date.now();
    const tick = () => {
      if (done) return;
      if (window.ApexAuth?.signOut) {
        Promise.resolve(window.ApexAuth.signOut({ clearApp: false }))
          .catch(() => undefined)
          .then(() => {
            clearTimeout(failsafe);
            proceed();
          });
        return;
      }
      if (Date.now() - start < 3500) setTimeout(tick, 100);
    };
    tick();

    return () => clearTimeout(failsafe);
  }, []);

  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-white">
      <p className="text-slate-500 text-sm font-medium">Signing you out…</p>
    </main>
  );
}
