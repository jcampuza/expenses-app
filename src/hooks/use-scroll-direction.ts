"use client";

import { useEffect, useState } from "react";

export type ScrollDirection = "UP" | "DOWN" | "IDLE";

export function useScrollDirection(): { scrollDirection: ScrollDirection } {
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>("IDLE");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Skip if we're at the same position
      if (currentScrollY === lastScrollY) return;

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection("DOWN");
      } else {
        setScrollDirection("UP");
      }

      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return { scrollDirection };
}
