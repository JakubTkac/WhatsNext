"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

const navigationRecoveryDelay = 8_000;

type ListingNavigationValue = {
  destination: string | null;
  pending: boolean;
  navigate: (href: string) => void;
};

type ActiveListingNavigation = {
  destination: string;
  startLocation: string;
};

const ListingNavigationContext =
  createContext<ListingNavigationValue | null>(null);

export function ListingNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const committedSearch = searchParams.toString();
  const activeNavigation = useRef<ActiveListingNavigation | null>(
    null,
  );
  const recoveryTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [destination, setDestination] = useState<string | null>(null);
  const [transitionPending, startTransition] = useTransition();

  const clearRecoveryTimer = useCallback(() => {
    if (recoveryTimer.current !== null) {
      clearTimeout(recoveryTimer.current);
      recoveryTimer.current = null;
    }
  }, []);

  const completeNavigation = useCallback(() => {
    clearRecoveryTimer();
    activeNavigation.current = null;
    setDestination(null);
  }, [clearRecoveryTimer]);

  const navigate = useCallback(
    (href: string) => {
      if (activeNavigation.current !== null) {
        return;
      }

      const navigation = {
        destination: href,
        startLocation: window.location.href,
      };

      activeNavigation.current = navigation;
      setDestination(href);
      startTransition(() => {
        router.push(href, { scroll: false });
      });

      recoveryTimer.current = setTimeout(() => {
        if (activeNavigation.current !== navigation) {
          return;
        }

        const currentUrl = new URL(window.location.href);
        const startUrl = new URL(
          navigation.startLocation,
          currentUrl,
        );
        const destinationUrl = new URL(
          navigation.destination,
          currentUrl,
        );
        const recoveryUrl =
          createLocationKey(currentUrl) !==
          createLocationKey(startUrl)
            ? currentUrl
            : destinationUrl;

        if (recoveryUrl.href === currentUrl.href) {
          window.location.reload();
          return;
        }

        window.location.replace(recoveryUrl.href);
      }, navigationRecoveryDelay);
    },
    [router],
  );

  useEffect(() => {
    const navigation = activeNavigation.current;

    if (!navigation || transitionPending) {
      return;
    }

    const target = new URL(
      navigation.destination,
      window.location.href,
    );
    const committedLocation = `${pathname}${committedSearch ? `?${committedSearch}` : ""}`;
    const targetLocation = `${target.pathname}${target.search}`;

    if (committedLocation === targetLocation) {
      completeNavigation();
    }
  }, [
    committedSearch,
    completeNavigation,
    destination,
    pathname,
    transitionPending,
  ]);

  useEffect(() => clearRecoveryTimer, [clearRecoveryTimer]);

  const pending = destination !== null;
  const value = useMemo(
    () => ({
      destination,
      pending,
      navigate,
    }),
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

function createLocationKey(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}
