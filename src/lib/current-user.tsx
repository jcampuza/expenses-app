import {
  createContext,
  useContext,
  Loading,
  Show,
  type Accessor,
  type ParentProps,
} from "solid-js";
import type { Doc } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { createQuery } from "@/lib/convex";
import { AuthSpinner } from "@/components/LoadingComponent";

const CurrentUserContext = createContext<Accessor<Doc<"users">>>();

export function useCurrentUser() {
  const user = useContext(CurrentUserContext);
  if (!user) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return user;
}

export function CurrentUserProvider(props: ParentProps) {
  const me = createQuery(api.user.getCurrentUserAuthenticated);

  return (
    <Loading fallback={<AuthSpinner />}>
      <Show when={me()}>
        {(user) => (
          <CurrentUserContext value={user}>{props.children}</CurrentUserContext>
        )}
      </Show>
    </Loading>
  );
}
