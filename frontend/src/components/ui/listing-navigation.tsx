"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useTransition,
} from "react";
import { beginRouteTransition } from "@/components/ui/route-transition-indicator";

type ListingNavigationValue = {
  pending: boolean;
  navigate: (href: string) => void;
};

const ListingNavigationContext =
  createContext<ListingNavigationValue | null>(null);

export function ListingNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const navigate = useCallback(
    (href: string) => {
      beginRouteTransition(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );
  const value = useMemo(
    () => ({ pending, navigate }),
    [navigate, pending],
  );

  return (
    <ListingNavigationContext value={value}>
      {children}
    </ListingNavigationContext>
  );
}

export function ListingPendingContent({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const navigation = useListingNavigation();

  return navigation?.pending ? fallback : children;
}

export function useListingNavigation(): ListingNavigationValue | null {
  return useContext(ListingNavigationContext);
}
