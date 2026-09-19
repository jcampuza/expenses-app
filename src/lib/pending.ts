import { createSignal } from "solid-js";

export function createPendingFn<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
) {
  const [isPending, setIsPending] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const mutate = async (
    ...args: Args
  ): Promise<{ ok: true; value: Result } | { ok: false; error: string }> => {
    setIsPending(true);
    setError(null);
    try {
      const result = await fn(...args);
      return { ok: true, value: result };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      return { ok: false, error: message };
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}
