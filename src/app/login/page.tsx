import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { signIn, getCurrentProfile } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to IceTrack to add and correct entries.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  if (await getCurrentProfile()) redirect("/");

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="text-center text-3xl font-semibold tracking-tightest sm:text-4xl">
        Sign in
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-center text-[15px] leading-relaxed text-muted">
        Enter your email and we will send you a sign-in link.
      </p>

      <div className="mt-8 sm:mt-10">
        <AuthForm action={signIn} mode="login" />
      </div>
    </div>
  );
}
