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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <h2 className="mb-4 text-xl font-semibold">Welcome to Your Dashboard!</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Here you can manage your expenses and track your spending with friends
        and family.
      </p>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Start sharing your expenses by going to your settings and sharing a
        verification code.
      </p>

      <Link
        href="/settings?openInvite=true"
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
        className="block transform rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {totalBalance > 0 ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5" />
              </div>
            ) : totalBalance < 0 ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <TrendingDown className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800">
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
                <p className="text-sm text-red-600 dark:text-red-400">
                  You owe {formatDollars(Math.abs(totalBalance))}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All debts settled
                </p>
              )}
            </div>
          </div>

          <ArrowUpRight className="h-5 w-5 text-gray-400" />
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
