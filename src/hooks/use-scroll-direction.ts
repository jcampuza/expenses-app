import { createSignal, onSettled } from "solid-js";

export type ScrollDirection = "UP" | "DOWN" | "IDLE";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] =
    createSignal<ScrollDirection>("IDLE");
  const [isAtTop, setIsAtTop] = createSignal(true);
  let lastScrollY = 0;

  onSettled(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === lastScrollY) return;
      setScrollDirection(currentScrollY > lastScrollY ? "DOWN" : "UP");
      setIsAtTop(currentScrollY === 0);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return { scrollDirection, isAtTop };
}
