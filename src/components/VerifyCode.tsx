"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The six digits between signing up and getting in.
 *
 * Six separate boxes rather than one field, because that is what tells people
 * how long the code is before they start typing, and it makes a mistyped digit
 * fixable without clearing the lot. Everything else here exists because of how
 * people actually enter these: they paste all six at once, they type without
 * looking, and on a phone the keyboard must be the numeric one or the whole
 * thing is slower than a link.
 */
const LENGTH = 6;

export interface VerifyCodeProps {
  email: string;
  /** Proves this browser is the one that signed up; needed to change address. */
  ticket: string | null;
  onVerified: () => void;
  onChangeEmail: (email: string) => Promise<void>;
  onResend: () => Promise<number>;
  onSubmit: (code: string) => Promise<void>;
  onBack: () => void;
  initialCooldownMs?: number;
}

export default function VerifyCode({
  email,
  ticket,
  onChangeEmail,
  onResend,
  onSubmit,
  onBack,
  initialCooldownMs = 60_000,
}: VerifyCodeProps) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(Math.ceil(initialCooldownMs / 1000));
  const [changing, setChanging] = useState(false);
  const [newEmail, setNewEmail] = useState(email);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // Counted down here rather than asked of the server, because the only thing
  // it governs is whether a button is worth pressing.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submit = async (code: string) => {
    if (checking) return;
    setChecking(true);
    setError(null);
    try {
      await onSubmit(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code was not right");
      // Cleared and refocused: leaving a wrong code in place means the next
      // attempt starts with backspacing six times.
      setDigits(Array(LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setChecking(false);
    }
  };

  const put = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) return;

    const next = [...digits];
    // A paste of the whole code lands in whichever box was focused; spread it
    // across the rest rather than taking only the first character.
    for (let i = 0; i < clean.length && index + i < LENGTH; i += 1) {
      next[index + i] = clean[i];
    }
    setDigits(next);

    const landed = Math.min(index + clean.length, LENGTH - 1);
    inputs.current[landed]?.focus();

    const joined = next.join("");
    if (joined.length === LENGTH && !next.includes("")) submit(joined);
  };

  const onKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        setDigits(next);
        return;
      }
      // Already empty: step back and clear the one before, which is what
      // backspace means to somebody correcting a typo.
      if (index > 0) {
        next[index - 1] = "";
        setDigits(next);
        inputs.current[index - 1]?.focus();
      }
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  if (changing) {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-900">Change your email</h1>
        <p className="mt-3 text-slate-500">
          We&apos;ll send a new code to this address instead.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            try {
              await onChangeEmail(newEmail.trim());
              setChanging(false);
              setDigits(Array(LENGTH).fill(""));
              setCooldown(Math.ceil(initialCooldownMs / 1000));
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "That address did not work",
              );
            }
          }}
        >
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-brand"
            placeholder="your@email.com"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setChanging(false);
                setError(null);
              }}
              className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-bold text-slate-600"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand px-4 py-3 font-bold text-white"
            >
              Send the code
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-slate-900">Confirm your email</h1>
      <p className="mt-3 text-slate-500">
        Your verification code was sent to{" "}
        <span className="font-semibold text-slate-900">{email}</span>
      </p>

      {/* Only offered when we can actually do it: changing the address needs
          the ticket from this browser's own signup. */}
      {ticket && (
        <button
          type="button"
          onClick={() => {
            setChanging(true);
            setNewEmail(email);
          }}
          className="mt-1 text-sm font-semibold text-brand hover:underline"
        >
          Change email
        </button>
      )}

      <div className="mt-8 flex gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            value={digit}
            onChange={(e) => put(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            onFocus={(e) => e.target.select()}
            // inputMode drives the phone keyboard; autoComplete lets iOS and
            // Android offer the code straight from the notification.
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={LENGTH}
            aria-label={`Digit ${index + 1}`}
            disabled={checking}
            className={`h-14 w-full rounded-xl border-2 text-center text-2xl font-bold text-slate-900 outline-none transition-colors ${
              error
                ? "border-red-400"
                : digit
                  ? "border-brand"
                  : "border-slate-200 focus:border-brand"
            }`}
          />
        ))}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          {checking
            ? "Checking…"
            : cooldown > 0
              ? `Code sent. You can resend the code in ${cooldown}s`
              : "Didn't get it? Check spam, or send another."}
        </p>
      )}

      <button
        type="button"
        disabled={cooldown > 0 || checking}
        onClick={async () => {
          setError(null);
          const wait = await onResend();
          setCooldown(Math.ceil(wait / 1000));
        }}
        className="mt-3 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:text-slate-300 hover:underline disabled:hover:no-underline"
      >
        Resend code
      </button>
    </div>
  );
}
