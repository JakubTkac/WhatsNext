"use client";

import { useEffect, useRef, useState } from "react";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
import { SuccessToast } from "@/components/ui/feedback-toast";

const feedbackMessages: Record<string, string> = {
  "review-published": "Review published.",
  "review-deleted": "Review deleted.",
};

export function ActionFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedSearchParams = searchParams.toString();
  const feedback = searchParams.get("feedback");
  const handledLocation = useRef<string | null>(null);
  const [notification, setNotification] = useState<{
    revision: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    const message = feedback ? feedbackMessages[feedback] : undefined;

    if (!message) {
      handledLocation.current = null;
      return;
    }

    const locationKey = `${pathname}?${serializedSearchParams}`;

    if (handledLocation.current === locationKey) {
      return;
    }

    handledLocation.current = locationKey;
    setNotification((current) => ({
      revision: (current?.revision ?? 0) + 1,
      message,
    }));

    const cleanSearchParams = new URLSearchParams(
      serializedSearchParams,
    );
    cleanSearchParams.delete("feedback");
    cleanSearchParams.delete("feedbackRevision");
    const cleanSearch = cleanSearchParams.toString();
    const hash = window.location.hash;

    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}${cleanSearch ? `?${cleanSearch}` : ""}${hash}`,
    );
  }, [
    feedback,
    pathname,
    serializedSearchParams,
  ]);

  return notification ? (
    <SuccessToast
      key={notification.revision}
      message={notification.message}
    />
  ) : null;
}
