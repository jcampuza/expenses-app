import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import SuperJSON from "superjson";

export const createQueryClient = ({
  onUnauthorizedError,
}: {
  onUnauthorizedError: () => void;
}) => {
  const handleError = (error: Error) => {
    if (error instanceof TRPCClientError) {
      if (error.data.code === "UNAUTHORIZED") {
        return onUnauthorizedError();
      }
    }
  };

  const queryCache = new QueryCache({
    onError: handleError,
  });

  const mutationCache = new MutationCache({
    onError: handleError,
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 10 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
};
