"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const routeTransitionEvent = "whatsnext:route-transition";
const transitionTimeoutMs = 10_000;

export function beginRouteTransition(destination?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  if (destination && isCurrentLocation(destination)) {
    return;
  }

  window.dispatchEvent(new Event(routeTransitionEvent));
}

export function beginFormRouteTransition(form: HTMLFormElement): void {
  const destination = new URL(form.action, window.location.href);
  const formData = new FormData(form);

  destination.search = "";
  formData.forEach((value, name) => {
    if (typeof value === "string" && value) {
      destination.searchParams.append(name, value);
    }
  });

  beginRouteTransition(destination.href);
}

export function RouteTransitionIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [pending, setPending] = useState(false);
  const timeoutIdRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    setPending(false);
  }, []);

  const start = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
    }

    setPending(true);
    timeoutIdRef.current = window.setTimeout(
      stop,
      transitionTimeoutMs,
    );
  }, [stop]);

  useEffect(() => {
    stop();
  }, [routeKey, stop]);

  useEffect(() => {
    const handleRouteTransition = () => {
      start();
    };
    const handleDocumentClick = (event: MouseEvent) => {
      const anchor = findInternalNavigationAnchor(event);

      if (!anchor || isCurrentLocation(anchor.href)) {
        return;
      }

      start();
    };

    window.addEventListener(routeTransitionEvent, handleRouteTransition);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener(
        routeTransitionEvent,
        handleRouteTransition,
      );
      document.removeEventListener("click", handleDocumentClick);

      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, [start]);

  return pending ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-4">
      <LoadingSpinner />
    </div>
  ) : null;
}

function findInternalNavigationAnchor(
  event: MouseEvent,
): HTMLAnchorElement | null {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  ) {
    return null;
  }

  const anchor = event.target.closest("a");

  if (
    !(anchor instanceof HTMLAnchorElement) ||
    anchor.hasAttribute("download") ||
    (anchor.target && anchor.target !== "_self")
  ) {
    return null;
  }

  const destination = new URL(anchor.href, window.location.href);

  return destination.origin === window.location.origin
    ? anchor
    : null;
}

function isCurrentLocation(destination: string): boolean {
  const current = new URL(window.location.href);
  const next = new URL(destination, current);

  return (
    next.origin === current.origin &&
    next.pathname === current.pathname &&
    next.search === current.search
  );
}
