import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "UP" | "DOWN" | "IDLE";

export function useScrollDirection(): { scrollDirection: ScrollDirection } {
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>("IDLE");
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      // Skip if we're at the same position
      if (currentScrollY === lastScrollY) return;

      // Determine scroll direction
      const scrollDirection = currentScrollY > lastScrollY ? "DOWN" : "UP";
      setScrollDirection(scrollDirection);
      lastScrollYRef.current = currentScrollY;
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrollDirection };
}
