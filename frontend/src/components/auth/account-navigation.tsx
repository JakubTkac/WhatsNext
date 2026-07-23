import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ensureAvatarRevision } from "@/lib/avatar-url";
import {
  LoggedOutAccountActions,
  LogoutAction,
} from "./account-actions";

export async function AccountNavigation() {
  const user = await getCurrentUser();

  if (!user) {
    return <LoggedOutAccountActions />;
  }

  const initial = user.displayName.trim().charAt(0).toUpperCase();
  const avatarUrl = ensureAvatarRevision(user.avatarUrl, Date.now());

  return (
    <div className="flex items-center gap-1" aria-label="Account">
      <LogoutAction />
      <Link
        href="/profile"
        aria-label={`Open ${user.displayName}'s profile`}
        className="group flex min-w-0 items-center gap-1.5 rounded-md p-0.5 transition-colors duration-150 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
      >
        <span className="hidden max-w-28 truncate text-xs font-semibold text-foreground transition-colors duration-150 group-hover:text-primary xl:block">
          {user.displayName}
        </span>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary"
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
    <div className="flex items-center gap-1" aria-hidden="true">
      <div className="h-8 w-16 rounded-md bg-slate-200" />
      <div className="h-8 w-8 rounded-full bg-slate-200" />
    </div>
  );
}
