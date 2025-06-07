"use client";

import { useUser } from "@clerk/nextjs";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useMemo, useRef, useState } from "react";
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
import { Input, Select } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { CATEGORIES, CATEGORY, suggestCategory } from "~/lib/categories";
import { cn, formatDollars, PAYMENT_TYPES_UI_OPTIONS } from "~/lib/utils";
import { PAYMENT_TYPE, PAYMENT_TYPE_LIST } from "~/server/db/schema";
import { useTRPC } from "~/trpc/utils";

const getWhoPaidExpenseDetails = (
  currentUserId: string,
  ownerId: string,
  participantUserId: string,
  paymentType: PAYMENT_TYPE,
  totalCost: number,
) => {
  // Default values
  let whoPaid: "you" | "they" = "they";
  let whoOwes: "you" | "they" = "you";
  let isSplitEqually = false;

  // Current user is the owner
  if (ownerId === currentUserId) {
    switch (paymentType) {
      case "paid_by_owner_split_equally":
        whoPaid = "you";
        whoOwes = "they";
        isSplitEqually = true;
        break;
      case "paid_by_owner_participant_owes":
        whoPaid = "you";
        whoOwes = "they";
        isSplitEqually = false;
        break;
      case "paid_by_participant_split_equally":
        whoPaid = "they";
        whoOwes = "you";
        isSplitEqually = true;
        break;
      case "paid_by_participant_owner_owes":
        whoPaid = "they";
        whoOwes = "you";
        isSplitEqually = false;
        break;
    }
  } else if (participantUserId === currentUserId) {
    switch (paymentType) {
      case "paid_by_owner_split_equally":
        whoPaid = "they";
        whoOwes = "you";
        isSplitEqually = true;
        break;
      case "paid_by_owner_participant_owes":
        whoPaid = "they";
        whoOwes = "you";
        isSplitEqually = false;
        break;
      case "paid_by_participant_split_equally":
        whoPaid = "you";
        whoOwes = "they";
        isSplitEqually = true;
        break;
      case "paid_by_participant_owner_owes":
        whoPaid = "you";
        whoOwes = "they";
        isSplitEqually = false;
        break;
    }
  }
  return { whoPaid, whoOwes, isSplitEqually, amount: totalCost };
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
  connectionId,
}: {
  connectionId: string;
}) {
  const me = useUser();
  const trpc = useTRPC();

  const expensesQuery = useQuery(
    trpc.expense.getExpenses.queryOptions(
      { userId: connectionId },
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
      return fuseSearch.search(searchTerm).map((item) => item.item);
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
        <div className="fixed bottom-4 right-4 z-10 mx-auto flex items-center justify-center bg-background/80 backdrop-blur-sm">
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
        </div>
        <div>
          <AddExpenseDialogButton participantId={connectionId} />
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

      {/* Loading indicator */}

      {/* Expenses List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {searchItemsResponse.map((expense) => {
          return (
            <EditExpenseDialogButton
              key={expense.expense.id}
              currentUserId={me.user.id}
              participantId={expense.participant.participantId}
              id={expense.expense.id}
              name={expense.expense.name}
              date={expense.expense.date}
              category={expense.expense.category}
              totalCost={expense.expense.totalCost}
              balance={expense.balance}
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
        await queryClient.invalidateQueries(
          trpc.expense.getExpenses.queryFilter({
            userId: participantId,
          }),
        );

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
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Fill in the expense details below.
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

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
  participantId,
  id,
  name,
  date,
  category,
  totalCost,
  balance,
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
  balance: number;
  ownerId: string;
  paymentType: PAYMENT_TYPE;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onCompleted = async () => {
    await queryClient.invalidateQueries(trpc.expense.getExpenses.queryFilter());
    setOpen(false);
  };

  const updateExpenseMutation = useMutation(
    trpc.expense.updateExpense.mutationOptions({
      onSuccess: () => {
        onCompleted();
      },
    }),
  );

  const deleteExpenseMutation = useMutation(
    trpc.expense.deleteExpense.mutationOptions({
      onSuccess: () => {
        onCompleted();
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
        <div>
          <ExpenseItem
            name={name}
            date={date}
            category={category}
            currentUserId={currentUserId}
            ownerId={ownerId}
            participantId={participantId}
            paymentType={paymentType}
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
  ownerId,
  participantId,
  paymentType,
  totalCost,
  balance,
}: {
  name: string;
  date: Date;
  category: string | null;
  currentUserId: string;
  ownerId: string;
  participantId: string;
  paymentType: PAYMENT_TYPE;
  totalCost: number;
  balance: number;
}) {
  const details = getWhoPaidExpenseDetails(
    currentUserId,
    ownerId,
    participantId,
    paymentType,
    totalCost,
  );
  return (
    <ExpenseCard
      name={name}
      date={date.toLocaleDateString()}
      category={category ?? CATEGORY.None}
      amount={Math.abs(balance)}
      totalCost={totalCost}
      whoPaid={details.whoPaid}
      whoOwes={balance > 0 ? "they" : "you"}
      isSplitEqually={details.isSplitEqually}
      variant="compact"
    />
  );
}

function ExpenseForm({
  initialValues,
  onSubmit,
  id,
  ref,
  isNewExpense = false,
  className,
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
  className?: string;
}) {
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
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
      id={id}
      ref={ref}
    >
      <div>
        <Label htmlFor={`${id}-totalcost`}>Total Cost</Label>
        <Input
          id={`${id}-totalcost`}
          name="expense-totalcost"
          type="number"
          step="0.01"
          pattern="[0-9]+(\.[0-9][0-9]?)?"
          required
          className="w-full rounded border p-3 text-base sm:p-2 sm:text-sm"
          defaultValue={
            initialValues.totalCost === 0 ? "" : initialValues.totalCost
          }
        />
      </div>

      <div>
        <Label
          htmlFor={`${id}-name`}
          className="mb-2 block text-base font-medium sm:mb-1 sm:text-sm"
        >
          Name
        </Label>
        <Input
          id={`${id}-name`}
          name="expense-name"
          type="text"
          required
          defaultValue={initialValues.name}
          onChange={handleNameChange}
        />
      </div>

      <div>
        <Label htmlFor={`${id}-category`}>Category</Label>
        <Select
          id={`${id}-category`}
          name="expense-category"
          required
          defaultValue={initialValues.category}
          onChange={handleCategoryChange}
          ref={categorySelectRef}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor={`${id}-paymentType`}>Payment Type</Label>
        <Select
          id={`${id}-paymentType`}
          name="expense-paymentType"
          required
          defaultValue={initialValues.paymentType ?? PAYMENT_TYPE_LIST[0]}
        >
          {PAYMENT_TYPES_UI_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>
    </form>
  );
}
