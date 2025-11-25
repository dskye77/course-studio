"use client";

import { useState, useEffect } from "react";

// Tailwind default breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook to check if the current window width is above/below Tailwind breakpoints
 */
export default function useBreakpoint() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize(); // initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAbove = (bp) => width >= (breakpoints[bp] ?? 0);
  const isBelow = (bp) => width < (breakpoints[bp] ?? Infinity);

  return { width, isAbove, isBelow };
}
