import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";
import { createAuthHref, normalizeReturnTo } from "@/lib/return-to";
import { createAuthPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createAuthPageMetadata({
  title: "Create an Account",
  description:
    "Create a WhatsNext account to save movies, build a watchlist, and publish reviews.",
  path: "/register",
});

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const returnTo = normalizeReturnTo(readString(params.returnTo));

  if (await getCurrentUser()) {
    redirect(returnTo);
  }

  return (
    <AuthPageShell
      title="Create your account."
      description="Start building a watchlist and turn upcoming release dates into a plan."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={createAuthHref("/login", returnTo)}
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Log in
          </Link>
        </p>
      }
    >
      <RegisterForm returnTo={returnTo} />
    </AuthPageShell>
  );
}

function readString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
