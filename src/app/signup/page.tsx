import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { signUp, getCurrentProfile } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create an IceTrack account to add and correct entries. Every edit is public and credited to your username.",
  alternates: { canonical: "/signup" },
};

export default async function SignUpPage() {
  if (await getCurrentProfile()) redirect("/");

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="text-center text-3xl font-semibold tracking-tightest sm:text-4xl">
        Join IceTrack
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-center text-[15px] leading-relaxed text-muted">
        Anyone with an account can add entries and fix mistakes. No password —
        we email you a sign-in link.
      </p>

      <div className="mt-8 sm:mt-10">
        <AuthForm action={signUp} mode="signup" />
      </div>

      <p className="mt-8 text-center text-[12px] leading-relaxed text-faint">
        Your username and edits are public. Your email is not.
      </p>
    </div>
  );
}
