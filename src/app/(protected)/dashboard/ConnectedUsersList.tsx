"use client";

import { buttonVariants } from "@/components/ui/button";
import { formatDollars } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import Link from "next/link";

export type ConnectedUserSummary = {
  connectionId: Id<"user_connections">;
  userId: Id<"users">;
  name: string;
  totalBalance: number;
};

export const ConnectionsEmpty = () => {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Welcome to Your Dashboard!</h2>
      <p className="mb-4 text-muted-foreground">
        Here you can manage your expenses and track your spending with friends
        and family.
      </p>
      <p className="mb-6 text-muted-foreground">
        Start sharing your expenses by going to your settings and sharing a
        verification code.
      </p>

      <Link
        href="/settings"
        className={
          buttonVariants({ variant: "default", size: "lg" }) +
          " group flex items-center gap-2"
        }
      >
        Get Started
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
};

interface ConnectionListItemProps {
  connectionId: Id<"user_connections">;
  name: string;
  totalBalance: number;
}

export const ConnectionListItem = ({
  connectionId,
  name,
  totalBalance,
}: ConnectionListItemProps) => {
  return (
    <li>
      <Link
        href={`/dashboard/connection/${connectionId}`}
        className="block transform rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {totalBalance > 0 ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            ) : totalBalance < 0 ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TrendingDown className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}

            <div>
              <h3 className="font-medium">{name}</h3>
              {totalBalance > 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Owes you {formatDollars(Math.abs(totalBalance))}
                </p>
              ) : totalBalance < 0 ? (
                <p className="text-sm text-destructive">
                  You owe {formatDollars(Math.abs(totalBalance))}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All debts settled
                </p>
              )}
            </div>
          </div>

          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Link>
    </li>
  );
};

export function ConnectedUsersList({
  users,
}: {
  users: ConnectedUserSummary[];
}) {
  return (
    <ul className="space-y-3">
      {users.map((user) => (
        <ConnectionListItem
          key={user.connectionId}
          connectionId={user.connectionId}
          name={user.name}
          totalBalance={user.totalBalance}
        />
      ))}
    </ul>
  );
}
