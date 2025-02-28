"use client";

import { useUser } from "@clerk/nextjs";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { useState } from "react";
import { SkeletonCard } from "~/app/components/SkeletonCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { CATEGORIES } from "~/lib/categories";
import { cn, formatDollars, PAYMENT_TYPES_UI_OPTIONS } from "~/lib/utils";
import { PAYMENT_TYPE } from "~/server/db/schema";
import { api } from "~/trpc/react";

const ConnectionsPageLoading = () => {
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

const ConnectionsPageEmpty = () => {
  return (
    <div className="text-center text-muted-foreground">No expenses found.</div>
  );
};

export function ConnectionsPageContainer({
  participantId,
}: {
  participantId: string;
}) {
  const me = useUser();
  const expensesQuery = api.expense.getExpenses.useQuery({
    userId: participantId,
  });

  const utils = api.useUtils();

  if (expensesQuery.isLoading || !me.isLoaded) {
    return <ConnectionsPageLoading />;
  }

  if (!expensesQuery.data || !me.user) {
    return <ConnectionsPageEmpty />;
  }

  const getBalanceTitle = () => {
    if (expensesQuery.data.totalBalance > 0) {
      return `You owe ${formatDollars(Math.abs(expensesQuery.data.totalBalance))}`;
    }

    if (expensesQuery.data.totalBalance < 0) {
      const theirName = expensesQuery.data.user.name ?? "Them";
      return `${theirName} owes ${formatDollars(Math.abs(expensesQuery.data.totalBalance))}`;
    }

    return "All debts settled";
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {expensesQuery.data.user.name}
          </h1>
          <p
            className={cn(
              expensesQuery.data.totalBalance > 0 && "text-red-500",
              expensesQuery.data.totalBalance < 0 && "text-green-500",
            )}
          >
            {getBalanceTitle()}
          </p>
        </div>
        <AddExpenseDialog
          participantId={participantId}
          onSuccess={async () => {
            await utils.expense.getExpenses.invalidate();
          }}
        />
      </div>

      <Separator className="my-4" />

      {/* Expenses List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expensesQuery.data.items.map((expense) => (
          <EditExpenseDialog
            key={expense.expense.id}
            participantId={participantId}
            expense={expense.expense}
            onSuccess={async () => {
              await utils.expense.getExpenses.invalidate({
                userId: participantId,
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * A dialog component that shows a form to add an expense.
 * Utilizes the custom Dialog components from "~/components/ui/dialog".
 */
function AddExpenseDialog({
  participantId,
  onSuccess,
}: {
  participantId: string;
  onSuccess: () => void;
}) {
  const me = useUser();
  const addExpenseMutation = api.expense.addExpense.useMutation();

  const [name, setName] = useState("");
  const [paymentType, setPaymentType] = useState<PAYMENT_TYPE>(PAYMENT_TYPE[0]);
  const [category, setCategory] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If the paymentType is "paid_by_participant" then we should set the owner to the participant instead of us
    // If the paymentType is anything else, its presumed we are paying for it and thus we own it
    if (!me.user) {
      throw new Error("Tried to add expense while no user is logged in");
    }

    const currentUserId = me.user.id;

    const cost = parseFloat(totalCost);
    if (isNaN(cost)) {
      alert("Total cost must be a number");
      return;
    }

    try {
      await addExpenseMutation.mutateAsync({
        participant: {
          participantId: participantId,
          paymentType: paymentType,
        },
        expense: {
          name,
          totalCost: cost,
          category,
          ownerId: currentUserId,
        },
      });
      setName("");
      setCategory("");
      setTotalCost("");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Fill in the expense details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="expense-name"
              className="mb-1 block text-sm font-medium"
            >
              Name
            </label>
            <input
              id="expense-name"
              type="text"
              required
              className="w-full rounded border p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="expense-category"
              className="mb-1 block text-sm font-medium"
            >
              Category
            </label>
            <select
              id="expense-category"
              required
              className="w-full rounded border p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expense-paymentType" className="mb-1 block">
              Payment Type
            </label>
            <select
              id="expense-paymentType"
              required
              className="w-full rounded border p-2"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PAYMENT_TYPE)}
            >
              {PAYMENT_TYPES_UI_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="expense-totalCost"
              className="mb-1 block text-sm font-medium"
            >
              Total Cost
            </label>
            <input
              id="expense-totalCost"
              type="number"
              step="0.01"
              required
              className="w-full rounded border p-2"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={addExpenseMutation.isPending}
              variant="default"
            >
              {addExpenseMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A dialog component that shows a form to edit an expense.
 * Clicking on an expense card opens this dialog.
 */
function EditExpenseDialog({
  participantId,
  expense,
  onSuccess,
}: {
  participantId: string;
  expense: {
    id: number;
    name: string;
    date: Date;
    category: string | null;
    totalCost: number;
    ownerId: string;
  };
  onSuccess: () => void;
}) {
  const updateExpenseMutation = api.expense.updateExpense.useMutation();
  const deleteExpenseMutation = api.expense.deleteExpense.useMutation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(expense.name);
  const [paymentType, setPaymentType] = useState<PAYMENT_TYPE>(PAYMENT_TYPE[0]);
  const [category, setCategory] = useState(expense.category);
  const [totalCost, setTotalCost] = useState(expense.totalCost.toString());

  const getWhoPaidByOwnerId = () => {
    if (expense.ownerId === participantId) {
      return `They paid ${formatDollars(expense.totalCost)}`;
    }

    return `You paid ${formatDollars(expense.totalCost)}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cost = parseFloat(totalCost);
    if (isNaN(cost)) {
      alert("Total cost must be a number");
      return;
    }

    try {
      await updateExpenseMutation.mutateAsync({
        user: { id: participantId },
        participant: {
          paymentType: paymentType,
        },
        expense: {
          id: expense.id,
          name,
          category,
          totalCost: cost,
        },
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );
    if (!confirmed) return;

    try {
      await deleteExpenseMutation.mutateAsync({ id: expense.id });
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };

  const actionIsInProgress =
    updateExpenseMutation.isPending || deleteExpenseMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:bg-background">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              <div className="">{expense.name}</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Date: {new Date(expense.date).toLocaleDateString()}
            </div>
            <div className="text-sm">{getWhoPaidByOwnerId()}</div>
          </CardContent>
        </Card>
        {/* <div className="cursor-pointer rounded border p-4 hover:bg-gray-100">
        </div> */}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor={`expense-name-${expense.id}`}
              className="mb-1 block text-sm font-medium"
            >
              Name
            </label>
            <input
              id={`expense-name-${expense.id}`}
              type="text"
              required
              className="w-full rounded border p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="expense-category"
              className="mb-1 block text-sm font-medium"
            >
              Category
            </label>
            <select
              id="expense-category"
              required
              className="w-full rounded border p-2"
              value={category ?? ""}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expense-paymentType" className="mb-1 block">
              Payment Type
            </label>
            <select
              id="expense-paymentType"
              required
              className="w-full rounded border p-2"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PAYMENT_TYPE)}
            >
              {PAYMENT_TYPES_UI_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`expense-totalcost-${expense.id}`}
              className="mb-1 block text-sm font-medium"
            >
              Total Cost
            </label>
            <input
              id={`expense-totalcost-${expense.id}`}
              type="number"
              step="0.01"
              required
              className="w-full rounded border p-2"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={actionIsInProgress}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              type="button"
              onClick={handleDelete}
              disabled={actionIsInProgress}
            >
              {deleteExpenseMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
            <Button type="submit" disabled={actionIsInProgress}>
              {updateExpenseMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
