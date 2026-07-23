"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function useDebouncedFormSubmit(delayMs = 500) {
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutIdRef = useRef<number | null>(null);
  const [changeRevision, setChangeRevision] = useState(0);

  const cancelScheduledSubmit = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const scheduleSubmit = useCallback(() => {
    setChangeRevision((revision) => revision + 1);
  }, []);

  useEffect(() => {
    if (changeRevision === 0) {
      return;
    }

    cancelScheduledSubmit();
    timeoutIdRef.current = window.setTimeout(() => {
      timeoutIdRef.current = null;
      formRef.current?.requestSubmit();
    }, delayMs);

    return cancelScheduledSubmit;
  }, [cancelScheduledSubmit, changeRevision, delayMs]);

  return {
    formRef,
    scheduleSubmit,
    cancelScheduledSubmit,
  };
}
