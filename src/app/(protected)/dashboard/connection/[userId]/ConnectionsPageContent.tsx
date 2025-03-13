"use client";

import { useUser } from "@clerk/nextjs";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useMemo, useRef, useState } from "react";
import { SkeletonCard } from "~/app/components/SkeletonCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { CATEGORIES, CATEGORY, suggestCategory } from "~/lib/categories";
import { cn, formatDollars, PAYMENT_TYPES_UI_OPTIONS } from "~/lib/utils";
import { PAYMENT_TYPE, PAYMENT_TYPE_LIST } from "~/server/db/schema";
import { useTRPC } from "~/trpc/utils";

interface ExpenseItem {
  expense: {
    id: number;
    name: string;
    category: string | null;
    totalCost: number;
    date: Date;
    ownerId: string;
  };
  participant: {
    paymentType: PAYMENT_TYPE;
  };
}

const getWhoPaidExpense = (
  currentUserId: string,
  ownerId: string,
  participantUserId: string,
  paymentType: PAYMENT_TYPE,
  totalCost: number,
) => {
  // Current user is the owner
  if (ownerId === currentUserId) {
    switch (paymentType) {
      case "paid_by_owner_split_equally": {
        return `You paid ${formatDollars(totalCost)} split equally`;
      }

      case "paid_by_owner_participant_owes": {
        return `You paid ${formatDollars(totalCost)} and they owe you`;
      }

      case "paid_by_participant_split_equally": {
        return `They paid ${formatDollars(totalCost)} split equally`;
      }

      case "paid_by_participant_owner_owes": {
        return `They paid ${formatDollars(totalCost)} and you owe them`;
      }
    }
  }

  // Current user is the participant
  if (participantUserId === currentUserId) {
    switch (paymentType) {
      case "paid_by_owner_split_equally": {
        return `They paid ${formatDollars(totalCost)} split equally`;
      }
      case "paid_by_owner_participant_owes": {
        return `They paid ${formatDollars(totalCost)} and you owe them`;
      }

      case "paid_by_participant_split_equally": {
        return `You paid ${formatDollars(totalCost)} split equally`;
      }

      case "paid_by_participant_owner_owes": {
        return `You paid ${formatDollars(totalCost)}`;
      }
    }
  }

  return "Unknown";
};

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
  const trpc = useTRPC();

  const expensesQuery = useQuery(
    trpc.expense.getExpenses.queryOptions(
      { userId: participantId },
      {
        refetchInterval: 1000 * 60 * 5,
        refetchIntervalInBackground: false,
      },
    ),
  );

  const [searchTerm, setSearchTerm] = useState("");

  const fuseSearch = useMemo(() => {
    return new Fuse(expensesQuery.data?.items ?? [], {
      keys: ["expense.name", "expense.category"],
      threshold: 0.3,
    });
  }, [expensesQuery.data?.items]);

  const searchItemsResponse = useMemo(() => {
    if (searchTerm) {
      return fuseSearch
        .search(searchTerm)
        .map((item) => item.item as ExpenseItem);
    }

    return expensesQuery.data?.items ?? [];
  }, [searchTerm, expensesQuery.data?.items, fuseSearch]);

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
    <div className="flex-1 p-4">
      {expensesQuery.isFetching && (
        <div className="absolute bottom-4 right-4 z-10 mx-auto flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs">
            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="text-primary">Updating...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {expensesQuery.data.user.name}
          </h1>
          <p
            className={cn(
              "mb-4",
              expensesQuery.data.totalBalance > 0 &&
                "text-red-600 dark:bg-red-900/30",
              expensesQuery.data.totalBalance < 0 &&
                "text-green-600 dark:bg-green-900/30",
            )}
          >
            {getBalanceTitle()}
          </p>
          <div>
            <Input
              type="text"
              value={searchTerm}
              placeholder="Search..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <AddExpenseDialogButton participantId={participantId} />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Loading indicator */}

      {/* Expenses List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {searchItemsResponse.map((searchResult) => {
          const expense = searchResult;

          return (
            <EditExpenseDialogButton
              key={expense.expense.id}
              currentUserId={me.user.id}
              participantId={participantId}
              id={expense.expense.id}
              name={expense.expense.name}
              date={expense.expense.date}
              category={expense.expense.category}
              totalCost={expense.expense.totalCost}
              ownerId={expense.expense.ownerId}
              paymentType={expense.participant.paymentType}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * A dialog component that shows a form to add an expense.
 * Utilizes the custom Dialog components from "~/components/ui/dialog".
 */
function AddExpenseDialogButton({ participantId }: { participantId: string }) {
  const me = useUser();
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const queryClient = useQueryClient();
  const addExpenseMutation = useMutation(
    trpc.expense.addExpense.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries(
          trpc.expense.getExpenses.queryFilter({
            userId: participantId,
          }),
        );
        queryClient.invalidateQueries(trpc.expense.getExpenses);

        setOpen(false);
      },
    }),
  );

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    values: {
      name: string;
      totalCost: number;
      category: string;
      paymentType: PAYMENT_TYPE;
    },
  ) => {
    e.preventDefault();

    if (!me.user) {
      throw new Error("Tried to add expense while no user is logged in");
    }

    const currentUserId = me.user.id;

    addExpenseMutation.mutate({
      participant: {
        participantId: participantId,
        paymentType: values.paymentType,
      },
      expense: {
        name: values.name,
        totalCost: values.totalCost,
        category: values.category,
        ownerId: currentUserId,
      },
    });
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

        <ExpenseForm
          id="add-expense-form"
          initialValues={{
            name: "",
            category: CATEGORY.None,
            totalCost: 0,
            paymentType: PAYMENT_TYPE_LIST[0],
          }}
          onSubmit={handleSubmit}
          ref={formRef}
          isNewExpense={true}
        />

        <div className="mt-4 flex justify-end space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="add-expense-form"
            disabled={addExpenseMutation.isPending}
            variant="default"
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
  participantId,
  id,
  name,
  date,
  category,
  totalCost,
  ownerId,
  paymentType,
}: {
  currentUserId: string;
  participantId: string;
  id: number;
  name: string;
  date: Date;
  category: string | null;
  totalCost: number;
  ownerId: string;
  paymentType: PAYMENT_TYPE;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const updateExpenseMutation = useMutation(
    trpc.expense.updateExpense.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries(
          trpc.expense.getExpenses.queryFilter({
            userId: participantId,
          }),
        );

        setOpen(false);
      },
    }),
  );

  const deleteExpenseMutation = useMutation(
    trpc.expense.deleteExpense.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries(
          trpc.expense.getExpenses.queryFilter({
            userId: participantId,
          }),
        );

        setOpen(false);
        formRef.current?.reset();
      },
    }),
  );

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
      paymentType: PAYMENT_TYPE;
    },
  ): void => {
    e.preventDefault();

    updateExpenseMutation.mutate({
      user: { id: participantId },
      participant: {
        paymentType: value.paymentType,
      },
      expense: {
        id: id,
        name: value.name,
        category: value.category,
        totalCost: value.totalCost,
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer transition-[transform,shadow] hover:scale-[1.01] hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              <div className="flex gap-4 align-top">
                <div className="flex-1">{name}</div>
                <div className="flex-shrink-0 text-sm text-muted-foreground">
                  Date: {new Date(date).toLocaleDateString()}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-foreground">Category: {category}</div>

            <div className="text-sm">
              {getWhoPaidExpense(
                currentUserId,
                ownerId,
                participantId,
                paymentType,
                totalCost,
              )}
            </div>
          </CardContent>
        </Card>
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

        <ExpenseForm
          id="edit-expense-form"
          ref={formRef}
          initialValues={{
            name: name,
            category: category ?? CATEGORY.None,
            totalCost: totalCost,
            paymentType: paymentType,
          }}
          onSubmit={handleSubmit}
          isNewExpense={false}
        />

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
          <Button
            type="submit"
            form="edit-expense-form"
            disabled={actionIsInProgress}
          >
            {updateExpenseMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseForm({
  initialValues,
  onSubmit,
  id,
  ref,
  isNewExpense = false,
}: {
  initialValues: {
    name: string;
    category: string;
    totalCost: number;
    paymentType: PAYMENT_TYPE;
  };
  id: string;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    value: {
      name: string;
      totalCost: number;
      category: string;
      paymentType: PAYMENT_TYPE;
    },
  ) => void;
  ref?: React.Ref<HTMLFormElement>;
  isNewExpense?: boolean;
}): JSX.Element {
  // Track if category was manually selected
  const [isManualSelection, setIsManualSelection] = useState(false);
  const categorySelectRef = useRef<HTMLSelectElement>(null);

  // Handle expense name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;

    // Only suggest categories for new expenses
    if (isNewExpense && categorySelectRef.current && newName.length >= 3) {
      // Don't make new suggestions if:
      // 1. User has manually selected a category (isManualSelection is true)
      // 2. The current category is not None
      const currentCategory = categorySelectRef.current.value;
      const shouldSuggest =
        !isManualSelection || currentCategory === "None" || !currentCategory;

      if (shouldSuggest) {
        const suggestedCategory = suggestCategory(newName);
        if (suggestedCategory) {
          categorySelectRef.current.value = suggestedCategory;
        }
      }
    }
  };

  // Handle manual category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    if (selectedCategory === "None" || !selectedCategory) {
      setIsManualSelection(false);
    } else {
      setIsManualSelection(true);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = Object.fromEntries(new FormData(form).entries());

    const {
      "expense-name": name,
      "expense-totalcost": totalCost,
      "expense-category": category,
      "expense-paymentType": paymentType,
    } = formData;

    if (typeof name !== "string" || name.trim() === "") {
      alert("Name must be a non-empty string");
      return;
    }

    const cost = parseFloat(totalCost as string);
    if (isNaN(cost)) {
      alert("Total cost must be a valid number");
      return;
    }

    if (typeof category !== "string" || category.trim() === "") {
      alert("Category must be selected");
      return;
    }

    if (typeof paymentType !== "string" || paymentType.trim() === "") {
      alert("Payment type must be selected");
      return;
    }

    onSubmit(e, {
      name: name.trim(),
      totalCost: cost,
      category: category.trim(),
      paymentType: paymentType.trim() as PAYMENT_TYPE,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4" id={id} ref={ref}>
      <div>
        <label
          htmlFor={`${id}-name`}
          className="mb-1 block text-sm font-medium"
        >
          Name
        </label>
        <input
          id={`${id}-name`}
          name="expense-name"
          type="text"
          required
          className="w-full rounded border p-2"
          defaultValue={initialValues.name}
          onChange={handleNameChange}
        />
      </div>

      <div>
        <label
          htmlFor={`${id}-totalcost`}
          className="mb-1 block text-sm font-medium"
        >
          Total Cost
        </label>
        <input
          id={`${id}-totalcost`}
          name="expense-totalcost"
          type="number"
          step="0.01"
          required
          className="w-full rounded border p-2"
          defaultValue={
            initialValues.totalCost === 0 ? "" : initialValues.totalCost
          }
        />
      </div>

      <div>
        <label
          htmlFor={`${id}-category`}
          className="mb-1 block text-sm font-medium"
        >
          Category
        </label>
        <select
          id={`${id}-category`}
          name="expense-category"
          required
          className="w-full rounded border p-2"
          defaultValue={initialValues.category}
          onChange={handleCategoryChange}
          ref={categorySelectRef}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${id}-paymentType`} className="mb-1 block">
          Payment Type
        </label>
        <select
          id={`${id}-paymentType`}
          name="expense-paymentType"
          required
          className="w-full rounded border p-2"
          defaultValue={initialValues.paymentType ?? PAYMENT_TYPE_LIST[0]}
        >
          {PAYMENT_TYPES_UI_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
