import { createSignal } from "solid-js";

export function createPendingFn<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
) {
  const [isPending, setIsPending] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const mutate = async (...args: Args): Promise<Result | null> => {
    setIsPending(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}
