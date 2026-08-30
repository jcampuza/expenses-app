import { For, Show } from "solid-js";
import { buttonVariants } from "@/components/ui/button";
import { formatDollars } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { createQuery } from "@/lib/convex";
import { SkeletonCard } from "@/components/Skeletons";
import { Icon } from "@/components/icons";

export const ConnectionsEmpty = () => {
  return (
    <div class="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-xl font-semibold">Welcome to Your Dashboard!</h2>
      <p class="mb-4 text-muted-foreground">
        Here you can manage your expenses and track your spending with friends
        and family.
      </p>
      <p class="mb-6 text-muted-foreground">
        Start sharing your expenses by going to your settings and sharing a
        verification code.
      </p>
      <a
        href="/settings"
        class={[
          buttonVariants({ variant: "default", size: "lg" }),
          "group flex items-center gap-2",
        ]}
      >
        Get Started
        <Icon
          icon={ArrowRight}
          class="h-4 w-4 transition-transform group-hover:translate-x-1"
        />
      </a>
    </div>
  );
};

export function ConnectionListItem(props: {
  connectionId: Id<"user_connections">;
  name: string;
  totalBalance: number;
}) {
  return (
    <li>
      <a
        href={`/dashboard/connection/${props.connectionId}`}
        class="block transform rounded-lg border border-border bg-card p-4 shadow-sm transition-[transform,box-shadow] hover:scale-[1.01] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            {props.totalBalance > 0 ? (
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                <Icon icon={TrendingUp} class="h-5 w-5" />
              </div>
            ) : props.totalBalance < 0 ? (
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Icon icon={TrendingDown} class="h-5 w-5" />
              </div>
            ) : (
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon icon={CheckCircle} class="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 class="font-medium">{props.name}</h3>
              {props.totalBalance > 0 ? (
                <p class="text-sm text-success">
                  Owes you {formatDollars(Math.abs(props.totalBalance))}
                </p>
              ) : props.totalBalance < 0 ? (
                <p class="text-sm text-destructive">
                  You owe {formatDollars(Math.abs(props.totalBalance))}
                </p>
              ) : (
                <p class="text-sm text-muted-foreground">All debts settled</p>
              )}
            </div>
          </div>
          <Icon icon={ArrowUpRight} class="h-5 w-5 text-muted-foreground" />
        </div>
      </a>
    </li>
  );
}

export function ConnectedUsersList() {
  const connectedUsers = createQuery(api.connections.getConnectedUsers);

  return (
    <Show
      when={(connectedUsers() ?? []).length > 0}
      fallback={<ConnectionsEmpty />}
    >
      <ul class="space-y-3">
        <For each={connectedUsers() ?? []}>
          {(user) => (
            <ConnectionListItem
              connectionId={user.connectionId}
              name={user.name}
              totalBalance={user.totalBalance}
            />
          )}
        </For>
      </ul>
    </Show>
  );
}

export function ConnectedUsersListSkeleton() {
  return (
    <ul class="space-y-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </ul>
  );
}
