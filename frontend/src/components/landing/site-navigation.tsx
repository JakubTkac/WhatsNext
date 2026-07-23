"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/movies", label: "Movies" },
  { href: "/reviews", label: "Reviews" },
  { href: "/profile", label: "Profile" },
  { href: "/watchlist", label: "Watchlist" },
] as const;

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="border-t border-border/70"
    >
      <div className="mx-auto grid w-full max-w-[92rem] grid-cols-4 px-2 sm:flex sm:px-8 lg:px-12">
        {navigationItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center justify-center border-b-2 px-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 sm:text-sm ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground hover:border-blue-200 hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
