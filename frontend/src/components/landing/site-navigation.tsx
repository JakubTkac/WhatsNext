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
      className="border-t border-border/70 lg:border-0"
    >
      <div className="grid w-full grid-cols-4 px-1 lg:flex lg:px-0">
        {navigationItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-9 items-center justify-center border-b-2 px-1 text-[0.7rem] font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary sm:min-h-10 sm:px-3 sm:text-xs lg:min-h-9 ${
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
