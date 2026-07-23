"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UnstyledButton } from "@/components/ui/action-button";

type HorizontalScrollerProps = {
  children: React.ReactNode;
  label: string;
};

const EDGE_TOLERANCE = 2;

export function HorizontalScroller({
  children,
  label,
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
    <div className="relative mt-8">
      <div
        ref={scrollerRef}
        onScroll={updateControls}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="movie-strip -mx-3 overflow-x-auto overscroll-x-contain scroll-smooth px-3 pb-8 pt-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:scroll-auto"
      >
        {children}
      </div>

      <UnstyledButton
        onClick={() => scrollByPage(-1)}
        disabled={!canScrollPrevious}
        aria-label="Show previous movies"
        className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 text-2xl text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md transition-[background-color,color,opacity,transform] duration-150 hover:-translate-x-0.5 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-0 sm:left-3"
      >
        <span aria-hidden="true">&larr;</span>
      </UnstyledButton>

      <UnstyledButton
        onClick={() => scrollByPage(1)}
        disabled={!canScrollNext}
        aria-label="Show more movies"
        className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 text-2xl text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md transition-[background-color,color,opacity,transform] duration-150 hover:translate-x-0.5 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-0 sm:right-3"
      >
        <span aria-hidden="true">&rarr;</span>
      </UnstyledButton>
    </div>
  );
}
