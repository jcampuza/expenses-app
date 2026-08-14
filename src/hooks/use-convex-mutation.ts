import { useMutation } from "convex/react";
import { FunctionReference, OptionalRestArgs } from "convex/server";
import { useRef, useState } from "react";

type UseConvexMutationOptions<
  Mutation extends FunctionReference<"mutation", "public">,
> = {
  onSuccess?: (data: Mutation["_returnType"]) => void;
  onError?: (error: string) => void;
};

/**
 * A hook to simplify Convex mutations by automatically managing loading, success, and error states.
 * @param mutation The Convex mutation function reference (e.g., `api.myModule.myMutation`).
 * @param options Optional callbacks for success and error handling.
 * @returns An object with the `mutate` function and the mutation's state (`isPending`, `isSuccess`, `error`).
 */
export const useConvexMutation = <
  Mutation extends FunctionReference<"mutation", "public">,
>(
  mutation: Mutation,
  options?: UseConvexMutationOptions<Mutation>,
) => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingCountRef = useRef(0);

  const mutationFn = useMutation(mutation);

  const mutate = async (
    ...args: Mutation["_args"] extends Record<string, never> // Handles mutations with no arguments
      ? []
      : [Mutation["_args"]]
  ): Promise<Mutation["_returnType"] | null> => {
    pendingCountRef.current += 1;
    setIsPending(true);
    setIsSuccess(false);
    setError(null);

    try {
      const result = await mutationFn(
        ...(args as OptionalRestArgs<Mutation["_args"]>),
      );
      pendingCountRef.current -= 1;
      if (pendingCountRef.current === 0) {
        setIsPending(false);
      }
      setIsSuccess(true);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      pendingCountRef.current -= 1;
      if (pendingCountRef.current === 0) {
        setIsPending(false);
      }
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return null;
    }
  };

  return { mutate, isPending, isSuccess, error };
};
