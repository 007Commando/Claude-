import { useEffect, useState } from "react";

type AuthUser = unknown;

export function useSession() {
  const [session, setSession] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | void;
    let done = false;

    const start = Date.now();
    const attach = () => {
      const auth = (
        window as unknown as {
          ApexAuth?: { onAuthStateChanged: (cb: (u: AuthUser) => void) => (() => void) | void | Promise<(() => void) | void> };
        }
      ).ApexAuth;
      if (auth) {
        Promise.resolve(
          auth.onAuthStateChanged((user) => {
            if (cancelled) return;
            setSession(user ?? null);
            setLoading(false);
            done = true;
          })
        ).then((fn) => {
          if (cancelled) {
            if (typeof fn === "function") fn();
          } else {
            unsub = fn;
          }
        });
        return;
      }
      if (Date.now() - start > 8000) {
        if (!cancelled) setLoading(false);
        return;
      }
      setTimeout(attach, 100);
    };
    attach();

    // safety: stop the spinner even if script never loads
    const t = setTimeout(() => {
      if (!done && !cancelled) setLoading(false);
    }, 4000);

    return () => {
      cancelled = true;
      clearTimeout(t);
      if (typeof unsub === "function") unsub();
    };
  }, []);

  return { session, loading };
}
