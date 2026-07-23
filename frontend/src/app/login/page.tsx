import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { createAuthHref, normalizeReturnTo } from "@/lib/return-to";
import { createAuthPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createAuthPageMetadata({
  title: "Log In",
  description:
    "Log in to WhatsNext to manage your movie watchlist, profile, and reviews.",
  path: "/login",
});

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = normalizeReturnTo(readString(params.returnTo));

  if (await getCurrentUser()) {
    redirect(returnTo);
  }

  return (
    <AuthPageShell
      title="Welcome back."
      description="Log in to manage your watchlist and keep track of what is releasing next."
      footer={
        <p>
          New to WhatsNext?{" "}
          <Link
            href={createAuthHref("/register", returnTo)}
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <LoginForm returnTo={returnTo} />
    </AuthPageShell>
  );
}

function readString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
