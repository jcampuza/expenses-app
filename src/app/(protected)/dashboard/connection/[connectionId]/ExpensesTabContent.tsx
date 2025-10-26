"use client";

import {
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Fuse from "fuse.js";
import { Plus } from "lucide-react";
import ExpenseCard from "@/components/ExpenseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { CATEGORY } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-mutation";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { LoadingFormComponent } from "@/components/LoadingComponent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddExpenseForm } from "./AddExpenseForm";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/Skeletons";

export function ConnectionExpenseList({
  connectionId,
}: {
  connectionId: Id<"user_connections">;
}) {
  const me = useSuspenseQuery(
    convexQuery(api.user.getCurrentUserAuthenticated, {}),
  );
  const expensesQuery = useSuspenseQuery(
    convexQuery(api.expenses.getSharedExpenses, {
      connectionId: connectionId,
    }),
  );

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isSlash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (isSlash) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fuseSearch = useMemo(() => {
    return new Fuse(expensesQuery.data.items ?? [], {
      keys: ["expense.name", "expense.category"],
      threshold: 0.3,
    });
  }, [expensesQuery.data.items]);

  const searchItemsResponse = useMemo(() => {
    if (deferredSearchTerm) {
      return fuseSearch.search(deferredSearchTerm).map((item) => item.item);
    }

    return expensesQuery.data.items ?? [];
  }, [deferredSearchTerm, expensesQuery.data.items, fuseSearch]);

  return (
    <>
      <div className="relative">
        <Input
          type="text"
          ref={searchInputRef}
          name="search"
          value={searchTerm}
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hidden md:block">
          /
        </kbd>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {searchItemsResponse.map((expenseItem) => {
          const currentUserExpense =
            expenseItem.userAExpense.userId === me.data._id
              ? expenseItem.userAExpense
              : expenseItem.userBExpense;
          const otherUserExpense =
            expenseItem.userAExpense.userId === me.data._id
              ? expenseItem.userBExpense
              : expenseItem.userAExpense;
          const splitEqually =
            currentUserExpense.amountOwed > 0 &&
            otherUserExpense.amountOwed > 0;

          return (
            <EditExpenseDialogButton
              key={expenseItem.expense._id}
              currentUserId={me.data._id}
              connectionId={connectionId}
              id={expenseItem.expense._id}
              name={expenseItem.expense.name}
              date={new Date(expenseItem.expense.date)}
              updatedAt={expenseItem.expense.updatedAt}
              category={expenseItem.expense.category ?? null}
              totalCost={expenseItem.expense.totalCost}
              currency={expenseItem.expense.currency}
              originalCurrency={expenseItem.expense.originalCurrency}
              originalTotalCost={expenseItem.expense.originalTotalCost}
              balance={expenseItem.balance}
              paidBy={expenseItem.expense.paidBy}
              splitEqually={splitEqually}
            />
          );
        })}
      </div>

      <div className="fixed right-6 bottom-6 z-50 md:hidden">
        <AddExpenseDialogButton connectionId={connectionId} variant="mobile" />
      </div>
    </>
  );
}

export function AddExpenseDialogButton({
  connectionId,
  variant = "mobile",
}: {
  connectionId: Id<"user_connections">;
  variant?: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const me = useQuery(convexQuery(api.user.getCurrentUserAuthenticated, {}));
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
      currency: string;
      paidBy: Id<"users">;
      splitEqually: boolean;
    },
  ): Promise<void> => {
    e.preventDefault();

    if (!me.data?._id) {
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
      currency: values.currency,
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
            <DialogTitle>Add Expense</DialogTitle>´
          </DialogHeader>
        </VisuallyHidden>

        <Suspense fallback={<LoadingFormComponent />}>
          <AddExpenseForm
            id="add-expense-form"
            initialValues={{
              name: "",
              category: CATEGORY.None,
              totalCost: 0,
              currency: "USD",
              paidBy: me.data?._id ?? ("" as Id<"users">),
              splitEqually: true,
            }}
            onSubmit={handleSubmit}
            ref={formRef}
            isNewExpense={true}
            connectionId={connectionId}
          />

          <div className="mt-6 flex flex-col justify-end space-y-3 sm:mt-4 sm:flex-row sm:space-y-0 sm:space-x-2">
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
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

function ExpenseDialogButton({
  variant,
  ...rest
}: React.ComponentProps<"button"> & { variant: "desktop" | "mobile" }) {
  const { scrollDirection } = useScrollDirection();
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
        <Plus className="h-6 w-6 shrink-0" />
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
}

function ExpenseItem({
  name,
  date,
  updatedAt,
  category,
  currentUserId,
  paidBy,
  splitEqually,
  totalCost,
  originalCurrency,
  originalTotalCost,
  balance,
}: {
  name: string;
  date: Date;
  updatedAt?: string;
  category: string | null;
  currentUserId: Id<"users">;
  paidBy: Id<"users">;
  splitEqually: boolean;
  totalCost: number;
  originalCurrency?: string;
  originalTotalCost?: number;
  balance: number;
}) {
  const details = getWhoPaidExpenseDetails(currentUserId, paidBy, splitEqually);
  return (
    <ExpenseCard
      name={name}
      date={date.toLocaleDateString()}
      updatedAt={updatedAt}
      category={category ?? CATEGORY.None}
      amount={Math.abs(balance)}
      totalCost={totalCost}
      originalCurrency={originalCurrency}
      originalTotalCost={originalTotalCost}
      whoPaid={details.whoPaid}
      whoOwes={details.whoOwes}
      isSplitEqually={details.isSplitEqually}
    />
  );
}

function getWhoPaidExpenseDetails(
  currentUserId: Id<"users">,
  paidBy: Id<"users">,
  splitEqually: boolean,
): {
  whoPaid: "you" | "they";
  whoOwes: "you" | "they";
  isSplitEqually: boolean;
} {
  const currentUserPaid = paidBy === currentUserId;
  return {
    whoPaid: currentUserPaid ? "you" : "they",
    whoOwes: currentUserPaid ? "they" : "you",
    isSplitEqually: splitEqually,
  };
}

function EditExpenseDialogButton({
  currentUserId,
  connectionId,
  id,
  name,
  date,
  updatedAt,
  category,
  totalCost,
  currency,
  originalCurrency,
  originalTotalCost,
  balance,
  paidBy,
  splitEqually,
}: {
  currentUserId: Id<"users">;
  connectionId: Id<"user_connections">;
  id: Id<"expenses">;
  name: string;
  date: Date;
  updatedAt?: string;
  category: string | null;
  totalCost: number;
  currency: string;
  originalCurrency?: string;
  originalTotalCost?: number;
  balance: number;
  paidBy: Id<"users">;
  splitEqually: boolean;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const updateExpenseMutation = useConvexMutation(api.expenses.updateExpense, {
    onSuccess: () => setOpen(false),
  });
  const deleteExpenseMutation = useConvexMutation(api.expenses.deleteExpense, {
    onSuccess: () => setOpen(false),
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
      currency: string;
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
      totalCost: value.totalCost,
      category: value.category,
      currency: value.currency,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <ExpenseItem
            name={name}
            date={date}
            updatedAt={updatedAt}
            category={category}
            currentUserId={currentUserId}
            paidBy={paidBy}
            splitEqually={splitEqually}
            totalCost={totalCost}
            originalCurrency={originalCurrency}
            originalTotalCost={originalTotalCost}
            balance={balance}
          />
        </div>
      </DialogTrigger>

      <DialogContent>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <Suspense fallback={<LoadingFormComponent />}>
          <AddExpenseForm
            id="edit-expense-form"
            ref={formRef}
            initialValues={{
              name: name,
              category: category ?? CATEGORY.None,
              totalCost: originalTotalCost ?? totalCost,
              currency: originalCurrency ?? currency,
              paidBy: paidBy,
              splitEqually: splitEqually,
            }}
            onSubmit={handleSubmit}
            isNewExpense={false}
            connectionId={connectionId}
          />

          <div className="mt-6 flex flex-col justify-end space-y-3 sm:mt-4 sm:flex-row sm:space-y-0 sm:space-x-2">
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
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

export function ConnectionExpenseListSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-full" />
      <div className="my-4" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    </div>
  );
}
