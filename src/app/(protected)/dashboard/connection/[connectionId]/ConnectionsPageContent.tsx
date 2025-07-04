"use client";

import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

import Fuse from "fuse.js";
import { Plus } from "lucide-react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { SkeletonCard } from "~/app/components/SkeletonCard";
import ExpenseCard from "~/components/ExpenseCard";
import { Button } from "~/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

import { AddExpenseForm } from "~/app/(protected)/dashboard/connection/[connectionId]/AddExpenseForm";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { useScrollDirection } from "~/hooks/use-scroll-direction";
import { CATEGORY } from "~/lib/categories";
import { cn, formatDollars } from "~/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useConvexMutation } from "~/hooks/use-convex-mutation";

const getWhoPaidExpenseDetails = (
  currentUserId: Id<"users">,
  paidBy: Id<"users">,
  splitEqually: boolean,
): {
  whoPaid: "you" | "they";
  whoOwes: "you" | "they";
  isSplitEqually: boolean;
} => {
  const currentUserPaid = paidBy === currentUserId;

  return {
    whoPaid: currentUserPaid ? ("you" as const) : ("they" as const),
    whoOwes: currentUserPaid ? ("they" as const) : ("you" as const),
    isSplitEqually: splitEqually,
  };
};

const getBalanceTitle = (totalBalance: number, userName?: string | null) => {
  if (totalBalance > 0) {
    const theirName = userName ?? "They";
    return `${theirName} owes ${formatDollars(Math.abs(totalBalance))}`;
  }

  if (totalBalance < 0) {
    return `You owe ${formatDollars(Math.abs(totalBalance))}`;
  }

  return "All debts settled";
};

export const ConnectionsPageLoading = () => {
  return (
    <div className="p-4">
      <Skeleton className="mb-2 h-6 w-1/3" />
      <Skeleton className="h-6 w-full" />

      <Separator className="my-8" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export function ConnectionsPageContainer({
  connectionId,
}: {
  connectionId: Id<"user_connections">;
}) {
  const me = useQuery(api.user.getCurrentUser);

  const expensesQuery = useQuery(api.expenses.getSharedExpenses, {
    connectionId: connectionId,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const fuseSearch = useMemo(() => {
    return new Fuse(expensesQuery?.items ?? [], {
      keys: ["expense.name", "expense.category"],
      threshold: 0.3,
    });
  }, [expensesQuery?.items]);

  const searchItemsResponse = useMemo(() => {
    if (deferredSearchTerm) {
      return fuseSearch.search(deferredSearchTerm).map((item) => item.item);
    }

    return expensesQuery?.items ?? [];
  }, [deferredSearchTerm, expensesQuery?.items, fuseSearch]);

  if (!expensesQuery || !me) {
    return <ConnectionsPageLoading />;
  }

  return (
    <div className="flex-1 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{expensesQuery.user.name}</h1>
          <p
            className={cn(
              "mb-4",
              expensesQuery.totalBalance > 0 &&
                "text-green-600 dark:text-green-400",
              expensesQuery.totalBalance < 0 &&
                "text-red-600 dark:text-red-400",
            )}
          >
            {getBalanceTitle(
              expensesQuery.totalBalance,
              expensesQuery.user.name,
            )}
          </p>
        </div>
        {/* Desktop Add Expense Button */}
        <div className="hidden md:block">
          <AddExpenseDialogButton
            connectionId={connectionId}
            variant="desktop"
          />
        </div>
      </div>

      <div>
        <Input
          type="text"
          value={searchTerm}
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Separator className="my-4" />

      {/* Expenses List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {searchItemsResponse.map((expenseItem) => {
          // Determine who paid and if it's split equally
          const currentUserExpense =
            expenseItem.userAExpense.userId === me._id
              ? expenseItem.userAExpense
              : expenseItem.userBExpense;
          const otherUserExpense =
            expenseItem.userAExpense.userId === me._id
              ? expenseItem.userBExpense
              : expenseItem.userAExpense;
          const splitEqually =
            currentUserExpense.amountOwed > 0 &&
            otherUserExpense.amountOwed > 0;

          return (
            <EditExpenseDialogButton
              key={expenseItem.expense._id}
              currentUserId={me._id}
              connectionId={connectionId}
              id={expenseItem.expense._id}
              name={expenseItem.expense.name}
              date={new Date(expenseItem.expense.date)}
              category={expenseItem.expense.category ?? null}
              totalCost={expenseItem.expense.totalCost}
              balance={expenseItem.balance}
              paidBy={expenseItem.expense.paidBy}
              splitEqually={splitEqually}
            />
          );
        })}
      </div>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <AddExpenseDialogButton connectionId={connectionId} variant="mobile" />
      </div>
    </div>
  );
}

type ExpenseDialogButtonProps = React.ComponentProps<"button"> & {
  variant: "desktop" | "mobile";
};

const ExpenseDialogButton = ({
  variant,
  ...rest
}: ExpenseDialogButtonProps) => {
  // Scroll-aware state using custom hook
  const { scrollDirection } = useScrollDirection();

  // Compute showText directly based on scroll direction
  const showText =
    scrollDirection === "IDLE" ||
    scrollDirection === "UP" ||
    (scrollDirection === "DOWN" && window.scrollY === 0);

  return variant === "desktop" ? (
    <Button {...rest}>Add Expense</Button>
  ) : (
    <Button
      {...rest}
      className={cn(
        "h-12 rounded-full shadow-lg transition-all duration-200 ease-out hover:shadow-xl",
        showText ? "w-36 px-4" : "w-12 px-0",
      )}
    >
      <div className="flex items-center justify-center">
        <Plus className="h-6 w-6 flex-shrink-0" />

        <span
          className={cn(
            "overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out",
            showText
              ? "ml-2 max-w-[200px] opacity-100"
              : "ml-0 max-w-0 opacity-0",
          )}
        >
          Add Expense
        </span>
      </div>
    </Button>
  );
};

/**
 * A dialog component that shows a form to add an expense.
 * Utilizes the custom Dialog components from "~/components/ui/dialog".
 */
function AddExpenseDialogButton({
  connectionId,
  variant = "mobile",
}: {
  connectionId: Id<"user_connections">;
  variant?: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const me = useQuery(api.user.getCurrentUser);
  const addExpenseMutation = useConvexMutation(api.expenses.addExpense, {
    onSuccess: () => {
      setOpen(false);
    },
  });

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    values: {
      name: string;
      totalCost: number;
      category: string;
      paidBy: Id<"users">;
      splitEqually: boolean;
    },
  ): Promise<void> => {
    e.preventDefault();

    if (!me?._id) {
      throw new Error("Tried to add expense while no user is logged in");
    }

    await addExpenseMutation.mutate({
      connectionId: connectionId,
      paidBy: values.paidBy,
      splitEqually: values.splitEqually,
      name: values.name,
      date: new Date().toISOString(),
      totalCost: values.totalCost,
      category: values.category,
      currency: "USD",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ExpenseDialogButton variant={variant} />
      </DialogTrigger>

      <DialogContent>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Fill in the expense details below.
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <AddExpenseForm
          id="add-expense-form"
          initialValues={{
            name: "",
            category: CATEGORY.None,
            totalCost: 0,
            paidBy: me?._id ?? ("" as Id<"users">),
            splitEqually: true,
          }}
          onSubmit={handleSubmit}
          ref={formRef}
          isNewExpense={true}
          connectionId={connectionId}
        />

        <div className="mt-6 flex flex-col justify-end space-y-3 sm:mt-4 sm:flex-row sm:space-x-2 sm:space-y-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="add-expense-form"
            disabled={addExpenseMutation.isPending}
            variant="default"
            className="w-full sm:w-auto"
          >
            {addExpenseMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A dialog component that shows a form to edit an expense.
 * Clicking on an expense card opens this dialog.
 */
function EditExpenseDialogButton({
  currentUserId,
  connectionId,
  id,
  name,
  date,
  category,
  totalCost,
  balance,
  paidBy,
  splitEqually,
}: {
  currentUserId: Id<"users">;
  connectionId: Id<"user_connections">;
  id: Id<"expenses">;
  name: string;
  date: Date;
  category: string | null;
  totalCost: number;
  balance: number;
  paidBy: Id<"users">;
  splitEqually: boolean;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const updateExpenseMutation = useConvexMutation(api.expenses.updateExpense, {
    onSuccess: () => {
      setOpen(false);
    },
  });

  const deleteExpenseMutation = useConvexMutation(api.expenses.deleteExpense, {
    onSuccess: () => {
      setOpen(false);
    },
  });

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );
    if (!confirmed) return;

    deleteExpenseMutation.mutate({ id: id });
  };

  const actionIsInProgress =
    updateExpenseMutation.isPending || deleteExpenseMutation.isPending;

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    value: {
      name: string;
      totalCost: number;
      category: string;
      paidBy: Id<"users">;
      splitEqually: boolean;
    },
  ): void => {
    e.preventDefault();

    updateExpenseMutation.mutate({
      connectionId: connectionId,
      paidBy: value.paidBy,
      splitEqually: value.splitEqually,
      id: id,
      name: value.name,
      date: new Date().toISOString(),
      totalCost: value.totalCost,
      category: value.category,
      currency: "USD",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <ExpenseItem
            name={name}
            date={date}
            category={category}
            currentUserId={currentUserId}
            paidBy={paidBy}
            splitEqually={splitEqually}
            totalCost={totalCost}
            balance={balance}
          />
        </div>
      </DialogTrigger>

      <DialogContent>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Edit the details of your expense below.
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <AddExpenseForm
          id="edit-expense-form"
          ref={formRef}
          initialValues={{
            name: name,
            category: category ?? CATEGORY.None,
            totalCost: totalCost,
            paidBy: paidBy,
            splitEqually: splitEqually,
          }}
          onSubmit={handleSubmit}
          isNewExpense={false}
          connectionId={connectionId}
        />

        <div className="mt-6 flex flex-col justify-end space-y-3 sm:mt-4 sm:flex-row sm:space-x-2 sm:space-y-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={actionIsInProgress}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            type="button"
            onClick={handleDelete}
            disabled={actionIsInProgress}
            className="w-full sm:w-auto"
          >
            {deleteExpenseMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button
            type="submit"
            form="edit-expense-form"
            disabled={actionIsInProgress}
            className="w-full sm:w-auto"
          >
            {updateExpenseMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseItem({
  name,
  date,
  category,
  currentUserId,
  paidBy,
  splitEqually,
  totalCost,
  balance,
}: {
  name: string;
  date: Date;
  category: string | null;
  currentUserId: Id<"users">;
  paidBy: Id<"users">;
  splitEqually: boolean;
  totalCost: number;
  balance: number;
}) {
  const details = getWhoPaidExpenseDetails(currentUserId, paidBy, splitEqually);
  return (
    <ExpenseCard
      name={name}
      date={date.toLocaleDateString()}
      category={category ?? CATEGORY.None}
      amount={Math.abs(balance)}
      totalCost={totalCost}
      whoPaid={details.whoPaid}
      whoOwes={details.whoOwes}
      isSplitEqually={details.isSplitEqually}
    />
  );
}
