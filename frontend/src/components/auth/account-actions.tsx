"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import {
  GhostButton,
  GhostButtonLink,
  PrimaryButtonLink,
} from "@/components/ui/action-button";
import { createAuthHref, normalizeReturnTo } from "@/lib/return-to";

export function LoggedOutAccountActions() {
  const returnTo = useCurrentLocation();

  return (
    <nav className="flex items-center gap-1" aria-label="Account">
      <GhostButtonLink href={createAuthHref("/login", returnTo)}>
        Log in
      </GhostButtonLink>
      <PrimaryButtonLink href={createAuthHref("/register", returnTo)}>
        Register
      </PrimaryButtonLink>
    </nav>
  );
}

export function LogoutAction() {
  const returnTo = useCurrentLocation();

  return (
    <form action={logoutAction}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <GhostButton type="submit">Log out</GhostButton>
    </form>
  );
}

function useCurrentLocation(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/login" || pathname === "/register") {
    return normalizeReturnTo(searchParams.get("returnTo"));
  }

  const search = searchParams.toString();

  return normalizeReturnTo(search ? `${pathname}?${search}` : pathname);
}
