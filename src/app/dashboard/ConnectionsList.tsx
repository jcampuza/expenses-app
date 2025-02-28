"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { getBalanceTitle } from "~/lib/utils";
import { useTRPC } from "~/trpc/utils";

export function ConnectionsList() {
  const trpc = useTRPC();
  const connectionsQuery = useQuery(
    trpc.connections.getConnectedUsers.queryOptions(),
  );

  if (connectionsQuery.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (connectionsQuery.data?.users.length === 0) {
    return (
      <>
        <p className="mb-4">
          Welcome to your dashboard! Here you can manage your expenses and track
          your spending.
        </p>
        <p className="mb-4">
          Start sharing your expenses by going to your settings and sharing a
          verification code.
        </p>

        <Link
          href="/settings"
          className={buttonVariants({ variant: "default" })}
        >
          Click here to get started
        </Link>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <ul>
        {connectionsQuery.data?.users.map((user) => (
          <li key={user.userId}>
            <Link href={`/dashboard/connection/${user.userId}`}>
              {getBalanceTitle(user.totalBalance, user.name)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
