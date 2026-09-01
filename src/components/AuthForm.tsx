"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { verifyCode, type AuthState } from "@/lib/auth/actions";

type Props = {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "signup" | "login";
};

const input =
  "focus-ring mt-1.5 w-full rounded-xl bg-elevated px-4 py-3 text-[15px] outline-none placeholder:text-faint";

const button =
  "focus-ring w-full rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-surface transition-opacity duration-150 ease-out-strong hover:opacity-90 disabled:opacity-50";

export function AuthForm({ action, mode }: Props) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );

  // Once a code is on its way, swap the email form for the code form.
  if (state?.sent) {
    return <CodeStep email={state.sent} initialError={state.error} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label htmlFor="username" className="text-[13px] font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_]+"
            autoComplete="username"
            placeholder="jane_doe"
            className={input}
          />
          <p className="mt-1.5 text-[12px] text-faint">
            Shown publicly on every edit you make. 3–24 characters.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="text-[13px] font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={input}
        />
      </div>

      {state?.error && <ErrorNote>{state.error}</ErrorNote>}

      <button type="submit" disabled={pending} className={button}>
        {pending
          ? "Sending…"
          : mode === "signup"
            ? "Create account"
            : "Send code"}
      </button>

      <p className="text-center text-[13px] text-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account yet?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

/** Step two: the six digits from the email. */
function CodeStep({
  email,
  initialError,
}: {
  email: string;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    verifyCode,
    initialError ? { error: initialError, sent: email } : null,
  );
  const [code, setCode] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="email" value={email} />

      <div className="text-center">
        <p className="text-[15px] font-semibold tracking-tight">
          Check your inbox
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
          We sent a six-digit code to{" "}
          <strong className="text-ink">{email}</strong>.
        </p>
      </div>

      <div>
        <label htmlFor="token" className="sr-only">
          Six-digit code
        </label>
        <input
          id="token"
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          // Lets a phone offer the code straight from the notification.
          autoFocus
          maxLength={7}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={`${input} text-center text-[24px] font-semibold tabular-nums tracking-[0.4em]`}
        />
      </div>

      {state?.error && <ErrorNote>{state.error}</ErrorNote>}

      <button
        type="submit"
        disabled={pending || code.length !== 6}
        className={button}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-[13px] text-muted">
        No code yet? Check spam, or{" "}
        <Link href="/login" className="text-accent hover:underline">
          request another
        </Link>
        .
      </p>
    </form>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-xl bg-amber-500/10 px-4 py-3 text-center text-[13px]
                 text-amber-700 dark:text-amber-300"
    >
      {children}
    </p>
  );
}
