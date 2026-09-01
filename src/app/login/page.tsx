import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { signIn, getCurrentProfile } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to IceTrack to add and correct entries.",
  alternates: { canonical: "/login" },
};

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  if (await getCurrentProfile()) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="text-center text-3xl font-semibold tracking-tightest sm:text-4xl">
        Sign in
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-center text-[15px] leading-relaxed text-muted">
        Enter your email and we will send you a six-digit code.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-amber-500/10 px-4 py-3 text-center text-[13px]
                     text-amber-700 dark:text-amber-300"
        >
          {error === "link_expired"
            ? "That code has expired or was already used. Request a new one below."
            : error}
        </p>
      )}

      <div className="mt-8 sm:mt-10">
        <AuthForm action={signIn} mode="login" />
      </div>
    </div>
  );
}
