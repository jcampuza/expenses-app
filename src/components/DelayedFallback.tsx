import { createSignal, onSettled, type ParentProps } from "solid-js";

/** Keeps fallback space reserved, revealing it only if loading lasts long enough. */
export function DelayedFallback(props: ParentProps<{ delayMs?: number }>) {
  const [visible, setVisible] = createSignal(false);

  onSettled(() => {
    const timer = setTimeout(() => setVisible(true), props.delayMs ?? 150);
    return () => clearTimeout(timer);
  });

  return (
    <div style={{ visibility: visible() ? "visible" : "hidden" }}>
      {props.children}
    </div>
  );
}
