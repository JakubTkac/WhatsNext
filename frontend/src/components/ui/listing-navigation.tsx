"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";

type ListingNavigationValue = {
  destination: string | null;
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
  const [destination, setDestination] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const navigate = useCallback(
    (href: string) => {
      setDestination(href);
      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [router],
  );
  const value = useMemo(
    () => ({ destination, pending, navigate }),
    [destination, navigate, pending],
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

export function readListingDestinationPage(
  destination: string | null,
  pageParameter = "page",
): number {
  if (!destination) {
    return 1;
  }

  const page = Number(
    new URL(destination, "http://localhost").searchParams.get(
      pageParameter,
    ) ?? 1,
  );

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function getListingPageItemCount(
  totalItems: number,
  pageSize: number,
  page: number,
): number {
  if (totalItems <= 0 || pageSize <= 0 || page <= 0) {
    return 0;
  }

  const remainingItems = totalItems - (page - 1) * pageSize;
  return Math.max(0, Math.min(pageSize, remainingItems));
}
