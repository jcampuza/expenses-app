"use client";

import { useMutation } from "convex/react";
import { FunctionReference, OptionalRestArgs } from "convex/server";
import { useState } from "react";

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

  const mutationFn = useMutation(mutation);

  const mutate = async (
    ...args: Mutation["_args"] extends Record<string, never> // Handles mutations with no arguments
      ? []
      : [Mutation["_args"]]
  ): Promise<Mutation["_returnType"] | null> => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);

    try {
      const result = await mutationFn(
        ...(args as OptionalRestArgs<Mutation["_args"]>),
      );
      setIsSuccess(true);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      // We return null on error to provide a consistent return type.
      // The error state should be checked to handle failures.
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, isSuccess, error };
};
