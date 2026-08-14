import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "UP" | "DOWN" | "IDLE";

export function useScrollDirection(): {
  scrollDirection: ScrollDirection;
  isAtTop: boolean;
} {
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>("IDLE");
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === lastScrollYRef.current) {
        return;
      }

      setScrollDirection(
        currentScrollY > lastScrollYRef.current ? "DOWN" : "UP",
      );
      setIsAtTop(currentScrollY === 0);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrollDirection, isAtTop };
}
