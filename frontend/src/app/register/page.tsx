import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { SiteHeader } from "@/components/landing/site-header";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <AuthPageShell
        title="Create your account."
        description="Start building a watchlist and turn upcoming release dates into a plan."
        footer={
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Log in
            </Link>
          </p>
        }
      >
        <RegisterForm />
      </AuthPageShell>
    </div>
  );
}
