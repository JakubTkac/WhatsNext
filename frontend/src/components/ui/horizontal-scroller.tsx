"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UnstyledButton } from "@/components/ui/action-button";

type HorizontalScrollerProps = {
  children: React.ReactNode;
  flushBottom?: boolean;
  label: string;
  roundedTop?: boolean;
};

const EDGE_TOLERANCE = 2;

export function HorizontalScroller({
  children,
  flushBottom = false,
  label,
  roundedTop = false,
}: HorizontalScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateControls = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const maximumScroll = scroller.scrollWidth - scroller.clientWidth;

    setCanScrollPrevious(scroller.scrollLeft > EDGE_TOLERANCE);
    setCanScrollNext(
      scroller.scrollLeft < maximumScroll - EDGE_TOLERANCE,
    );
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    updateControls();

    const observer = new ResizeObserver(updateControls);
    observer.observe(scroller);

    return () => observer.disconnect();
  }, [updateControls]);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    scroller.scrollBy({
      behavior: reduceMotion ? "auto" : "smooth",
      left: direction * scroller.clientWidth,
    });
  }, []);
  return (
    <div
      className={`relative mt-3 overflow-hidden ${
        roundedTop ? "rounded-t-xl" : ""
      }`}
    >
      <div
        ref={scrollerRef}
        onScroll={updateControls}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={`movie-strip w-full overflow-x-auto overscroll-x-contain scroll-smooth pt-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:scroll-auto ${
          flushBottom ? "pb-0" : "pb-3"
        }`}
      >
        {children}
      </div>

      <UnstyledButton
        onClick={() => scrollByPage(-1)}
        disabled={!canScrollPrevious}
        aria-label="Show previous movies"
        className="absolute left-1.5 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 text-lg text-foreground shadow-[0_6px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition-[background-color,color,opacity,transform] duration-150 hover:-translate-x-0.5 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-0 sm:left-2"
      >
        <span aria-hidden="true">&larr;</span>
      </UnstyledButton>

      <UnstyledButton
        onClick={() => scrollByPage(1)}
        disabled={!canScrollNext}
        aria-label="Show more movies"
        className="absolute right-1.5 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 text-lg text-foreground shadow-[0_6px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition-[background-color,color,opacity,transform] duration-150 hover:translate-x-0.5 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-0 sm:right-2"
      >
        <span aria-hidden="true">&rarr;</span>
      </UnstyledButton>
    </div>
  );
}
