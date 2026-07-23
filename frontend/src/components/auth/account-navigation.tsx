import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import {
  GhostButton,
  GhostButtonLink,
  PrimaryButtonLink,
} from "@/components/ui/action-button";
import { getCurrentUser } from "@/lib/auth";

export async function AccountNavigation() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <nav className="flex items-center gap-1" aria-label="Account">
        <GhostButtonLink href="/login">
          Log in
        </GhostButtonLink>
        <PrimaryButtonLink href="/register">
          Register
        </PrimaryButtonLink>
      </nav>
    );
  }

  const initial = user.displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2" aria-label="Account">
      <form action={logoutAction}>
        <GhostButton type="submit">
          Log out
        </GhostButton>
      </form>
      <Link
        href="/profile"
        aria-label={`Open ${user.displayName}'s profile`}
        className="group flex min-w-0 items-center gap-2 rounded-lg p-1 transition-colors duration-150 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="hidden max-w-32 truncate text-sm font-semibold text-foreground transition-colors duration-150 group-hover:text-primary xl:block">
          {user.displayName}
        </span>
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-primary"
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
      </Link>
    </div>
  );
}

export function AccountNavigationSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="h-9 w-20 rounded-lg bg-slate-200" />
      <div className="h-9 w-9 rounded-full bg-slate-200" />
    </div>
  );
}
