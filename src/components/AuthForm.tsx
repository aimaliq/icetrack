"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/lib/auth/actions";

type Props = {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "signup" | "login";
};

export function AuthForm({ action, mode }: Props) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );

  if (state?.sent) {
    return (
      <div className="rounded-2xl bg-elevated p-6 text-center sm:p-8">
        <p className="text-[15px] font-semibold tracking-tight">Check your inbox</p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          We sent a sign-in link to <strong className="text-ink">{state.sent}</strong>.
          Open it on this device to finish.
        </p>
        <p className="mt-4 text-[13px] text-faint">
          The link expires in an hour. Nothing arrived? Check spam, or try again.
        </p>
      </div>
    );
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
            className="focus-ring mt-1.5 w-full rounded-xl bg-elevated px-4 py-3
                       text-[15px] outline-none placeholder:text-faint"
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
          className="focus-ring mt-1.5 w-full rounded-xl bg-elevated px-4 py-3
                     text-[15px] outline-none placeholder:text-faint"
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl bg-amber-500/10 px-4 py-3 text-[13px] text-amber-700
                     dark:text-amber-300"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="focus-ring w-full rounded-full bg-ink px-6 py-3 text-[15px]
                   font-medium text-surface transition-opacity duration-150 ease-out-strong hover:opacity-90
                   disabled:opacity-50"
      >
        {pending
          ? "Sending…"
          : mode === "signup"
            ? "Create account"
            : "Send sign-in link"}
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
