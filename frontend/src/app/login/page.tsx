import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/landing/site-header";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <AuthPageShell
        title="Welcome back."
        description="Log in to manage your watchlist and keep track of what is releasing next."
        footer={
          <p>
            New to WhatsNext?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Create an account
            </Link>
          </p>
        }
      >
        <LoginForm />
      </AuthPageShell>
    </div>
  );
}
