import {
  createMemo,
  createSignal,
  For,
  Loading,
  Repeat,
  onSettled,
  Show,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";
import type { FunctionReturnType } from "convex/server";
import Fuse from "fuse.js";
import { Plus } from "lucide";
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
import { createMutation, createQuery } from "@/lib/convex";
import { useCurrentUser } from "@/lib/current-user";
import { createPendingFn } from "@/lib/pending";
import { useToast } from "@/hooks/use-toast";
import { LoadingFormComponent } from "@/components/LoadingComponent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddExpenseForm, type ExpenseFormValue } from "./AddExpenseForm";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/Skeletons";
import { Icon } from "@/components/icons";

const PAYER_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "mine", label: "You paid" },
  { value: "theirs", label: "They paid" },
] as const;

type PayerFilter = (typeof PAYER_FILTER_OPTIONS)[number]["value"];
type SharedExpenses = FunctionReturnType<typeof api.expenses.getSharedExpenses>;
type SharedExpenseItem = SharedExpenses["items"][number];

function PayerFilterButton(props: {
  option: (typeof PAYER_FILTER_OPTIONS)[number];
  payerFilter: Accessor<PayerFilter>;
  onSelect: (value: PayerFilter) => void;
}) {
  const selected = () => props.payerFilter() === props.option.value;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={selected() ? "true" : "false"}
      onClick={() => {
        props.onSelect(props.option.value);
      }}
      class={cn(
        "h-7 rounded-sm px-3 shadow-none hover:bg-background/80 hover:text-foreground",
        selected() && "bg-background text-foreground shadow-sm",
      )}
    >
      {props.option.label}
    </Button>
  );
}

function SharedExpenseCard(props: {
  item: SharedExpenseItem;
  connectionId: Id<"user_connections">;
  otherUserId: Accessor<Id<"users">>;
}) {
  const me = useCurrentUser();
  const currentUserId = () => me()._id;
  const currentUserExpense = () =>
    props.item.userAExpense.userId === currentUserId()
      ? props.item.userAExpense
      : props.item.userBExpense;
  const otherUserExpense = () =>
    props.item.userAExpense.userId === currentUserId()
      ? props.item.userBExpense
      : props.item.userAExpense;
  const splitEqually = () =>
    currentUserExpense().amountOwed > 0 && otherUserExpense().amountOwed > 0;

  return (
    <EditExpenseDialogButton
      otherUserId={props.otherUserId()}
      connectionId={props.connectionId}
      id={props.item.expense._id}
      name={props.item.expense.name}
      date={new Date(props.item.expense.date)}
      updatedAt={props.item.expense.updatedAt}
      category={props.item.expense.category ?? null}
      totalCost={props.item.expense.totalCost}
      currency={props.item.expense.currency}
      originalCurrency={props.item.expense.originalCurrency}
      originalTotalCost={props.item.expense.originalTotalCost}
      balance={props.item.balance}
      paidBy={props.item.expense.paidBy}
      splitEqually={splitEqually()}
    />
  );
}

export function ConnectionExpenseList(props: {
  connectionId: Id<"user_connections">;
}) {
  const me = useCurrentUser();
  const expensesQuery = createQuery(api.expenses.getSharedExpenses, () => ({
    connectionId: props.connectionId,
  }));

  const [searchTerm, setSearchTerm] = createSignal("");
  const [payerFilter, setPayerFilter] = createSignal<PayerFilter>("all");
  let searchInput: HTMLInputElement | undefined;

  onSettled(() => {
    const onKey = (event: KeyboardEvent) => {
      const isSlash =
        event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!isSlash) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest(
          "input, textarea, select, [contenteditable='true'], [role='dialog']",
        )
      ) {
        return;
      }

      event.preventDefault();
      searchInput?.focus();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const payerFiltered = createMemo(
    () => {
      const items = expensesQuery()?.items ?? [];
      const currentUserId = me()._id;
      const filter = payerFilter();
      return filter === "mine"
        ? items.filter((item) => item.expense.paidBy === currentUserId)
        : filter === "theirs"
          ? items.filter((item) => item.expense.paidBy !== currentUserId)
          : items;
    },
    { name: "payerFilteredExpenses" },
  );
  const searchIndex = createMemo(
    () =>
      new Fuse(payerFiltered(), {
        keys: ["expense.name", "expense.category"],
        threshold: 0.3,
      }),
    { name: "expenseSearchIndex" },
  );
  const searchItemsResponse = createMemo(
    () => {
      const term = searchTerm().trim();
      return term
        ? searchIndex()
            .search(term)
            .map((result) => result.item)
        : payerFiltered();
    },
    { name: "visibleExpenses" },
  );

  return (
    <>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative min-w-0 flex-1">
          <Input
            type="text"
            ref={(el) => {
              searchInput = el;
            }}
            name="search"
            value={searchTerm()}
            placeholder="Search..."
            aria-label="Search expenses"
            onInput={(event) => setSearchTerm(event.currentTarget.value)}
          />
          <kbd class="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground md:block">
            /
          </kbd>
        </div>

        <div class="grid grid-cols-3 rounded-md bg-muted p-1 text-muted-foreground sm:w-auto">
          <For each={PAYER_FILTER_OPTIONS}>
            {(option) => (
              <PayerFilterButton
                option={option}
                payerFilter={payerFilter}
                onSelect={setPayerFilter}
              />
            )}
          </For>
        </div>
      </div>

      <Separator class="my-4" />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <For each={searchItemsResponse()} keyed={(item) => item.expense._id}>
          {(expenseItem) => (
            <SharedExpenseCard
              item={expenseItem()}
              connectionId={props.connectionId}
              otherUserId={() => expensesQuery()!.user._id}
            />
          )}
        </For>
      </div>

      <Show when={searchItemsResponse().length === 0}>
        <div
          role="status"
          class="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground"
        >
          No expenses match this view.
        </div>
      </Show>

      <div class="fixed right-6 bottom-6 z-50 md:hidden">
        <AddExpenseDialogButton
          connectionId={props.connectionId}
          variant="mobile"
        />
      </div>
    </>
  );
}

export function AddExpenseDialogButton(props: {
  connectionId: Id<"user_connections">;
  variant?: "desktop" | "mobile";
}) {
  const [open, setOpen] = createSignal(false);
  const { toast } = useToast();
  const addExpense = createPendingFn(createMutation(api.expenses.addExpense));

  const handleSubmit = async (
    _event: SubmitEvent,
    values: ExpenseFormValue,
  ) => {
    const result = await addExpense.mutate({
      connectionId: props.connectionId,
      paidBy: values.paidBy,
      splitEqually: values.splitEqually,
      name: values.name,
      date: new Date().toISOString(),
      totalCost: values.totalCost,
      category: values.category,
      currency: values.currency,
    });
    if (result.ok) {
      setOpen(false);
      return;
    }
    toast({
      title: "Couldn't add expense",
      description: addExpense.error() ?? "An unknown error occurred",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger>
        <ExpenseDialogButton variant={props.variant ?? "mobile"} />
      </DialogTrigger>

      <DialogContent>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <Loading fallback={<LoadingFormComponent />}>
          <ConnectionAddExpenseForm
            connectionId={props.connectionId}
            onSubmit={handleSubmit}
          />

          <div class="flex flex-col justify-end gap-3 sm:flex-row sm:gap-2">
            <DialogClose>
              <Button type="button" variant="outline" class="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="add-expense-form"
              disabled={addExpense.isPending()}
              variant="default"
              class="w-full sm:w-auto"
            >
              {addExpense.isPending() ? "Submitting..." : "Add expense"}
            </Button>
          </div>
        </Loading>
      </DialogContent>
    </Dialog>
  );
}

function ConnectionAddExpenseForm(props: {
  connectionId: Id<"user_connections">;
  onSubmit: (event: SubmitEvent, value: ExpenseFormValue) => void;
}) {
  const me = useCurrentUser();
  const expenses = createQuery(api.expenses.getSharedExpenses, () => ({
    connectionId: props.connectionId,
  }));

  return (
    <Show when={expenses()}>
      {(shared) => (
        <AddExpenseForm
          id="add-expense-form"
          initialValues={{
            name: "",
            category: CATEGORY.None,
            totalCost: 0,
            currency: "USD",
            paidBy: me()._id,
            splitEqually: true,
          }}
          onSubmit={props.onSubmit}
          isNewExpense={true}
          currentUserId={me()._id}
          otherUserId={shared().user._id}
        />
      )}
    </Show>
  );
}

function ExpenseDialogButton(props: { variant: "desktop" | "mobile" }) {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const showText = () =>
    scrollDirection() === "IDLE" ||
    scrollDirection() === "UP" ||
    (scrollDirection() === "DOWN" && isAtTop());

  return (
    <Show
      when={props.variant === "desktop"}
      fallback={
        <Button
          class={cn(
            "h-12 rounded-full shadow-lg transition-[width,padding,box-shadow] duration-75 ease-out hover:shadow-xl motion-reduce:transition-none",
            showText() ? "w-36 px-4" : "w-12 px-0",
          )}
        >
          <div class="flex items-center justify-center">
            <Icon icon={Plus} class="h-6 w-6 shrink-0" />
            <span
              class={cn(
                "overflow-hidden whitespace-nowrap transition-[max-width,margin,opacity] duration-75 ease-in-out motion-reduce:transition-none",
                showText()
                  ? "ml-2 max-w-[200px] opacity-100"
                  : "ml-0 max-w-0 opacity-0",
              )}
            >
              Add Expense
            </span>
          </div>
        </Button>
      }
    >
      <Button>Add Expense</Button>
    </Show>
  );
}

function ExpenseItem(props: {
  name: string;
  date: Date;
  updatedAt?: string;
  category: string | null;
  paidBy: Id<"users">;
  splitEqually: boolean;
  totalCost: number;
  originalCurrency?: string;
  originalTotalCost?: number;
  balance: number;
}) {
  const me = useCurrentUser();
  const details = () =>
    getWhoPaidExpenseDetails(
      me()._id,
      props.paidBy,
      props.splitEqually,
      props.balance,
    );
  return (
    <ExpenseCard
      name={props.name}
      date={props.date.toLocaleDateString()}
      updatedAt={props.updatedAt}
      category={props.category ?? CATEGORY.None}
      amount={Math.abs(props.balance)}
      totalCost={props.totalCost}
      originalCurrency={props.originalCurrency}
      originalTotalCost={props.originalTotalCost}
      whoPaid={details().whoPaid}
      whoOwes={details().whoOwes}
      isSplitEqually={details().isSplitEqually}
    />
  );
}

function getWhoPaidExpenseDetails(
  currentUserId: Id<"users">,
  paidBy: Id<"users">,
  splitEqually: boolean,
  balance: number,
): {
  whoPaid: "you" | "they";
  whoOwes: "you" | "they";
  isSplitEqually: boolean;
} {
  const currentUserPaid = paidBy === currentUserId;
  return {
    whoPaid: currentUserPaid ? "you" : "they",
    // Balance is computed server-side for the current user: positive means
    // they owe you, negative means you owe them. Prefer it over paidBy so a
    // briefly stale user id cannot invert the You owe / They owe tags.
    whoOwes:
      balance < 0
        ? "you"
        : balance > 0
          ? "they"
          : currentUserPaid
            ? "they"
            : "you",
    isSplitEqually: splitEqually,
  };
}

type EditExpenseDialogButtonProps = {
  otherUserId: Id<"users">;
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
};

function EditExpenseDialogButton(props: EditExpenseDialogButtonProps) {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <button
        type="button"
        class="w-full text-left"
        onClick={() => setOpen(true)}
      >
        <ExpenseItem
          name={props.name}
          date={props.date}
          updatedAt={props.updatedAt}
          category={props.category}
          paidBy={props.paidBy}
          splitEqually={props.splitEqually}
          totalCost={props.totalCost}
          originalCurrency={props.originalCurrency}
          originalTotalCost={props.originalTotalCost}
          balance={props.balance}
        />
      </button>
      <Show when={open()}>
        <EditExpenseDialog {...props} open={open()} onOpenChange={setOpen} />
      </Show>
    </>
  );
}

function EditExpenseDialog(
  props: EditExpenseDialogButtonProps & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  },
) {
  // Capture the draft once when opening; live snapshots must not overwrite edits.
  const initialValues = untrack(() => ({
    name: props.name,
    category: props.category ?? CATEGORY.None,
    totalCost: props.originalTotalCost ?? props.totalCost,
    currency: props.originalCurrency ?? props.currency,
    paidBy: props.paidBy,
    splitEqually: props.splitEqually,
  }));
  const me = useCurrentUser();
  const { toast } = useToast();
  const formId = () => `edit-expense-form-${props.id}`;
  const updateExpense = createPendingFn(
    createMutation(api.expenses.updateExpense),
  );
  const deleteExpense = createPendingFn(
    createMutation(api.expenses.deleteExpense),
  );

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );
    if (!confirmed) return;
    void (async () => {
      const result = await deleteExpense.mutate({ id: props.id });
      if (result.ok) {
        props.onOpenChange(false);
        return;
      }
      toast({
        title: "Couldn't delete expense",
        description: deleteExpense.error() ?? "An unknown error occurred",
        variant: "destructive",
      });
    })();
  };

  const actionIsInProgress = () =>
    updateExpense.isPending() || deleteExpense.isPending();

  const handleSubmit = (_event: SubmitEvent, value: ExpenseFormValue) => {
    void (async () => {
      const result = await updateExpense.mutate({
        connectionId: props.connectionId,
        paidBy: value.paidBy,
        splitEqually: value.splitEqually,
        id: props.id,
        name: value.name,
        totalCost: value.totalCost,
        category: value.category,
        currency: value.currency,
      });
      if (result.ok) {
        props.onOpenChange(false);
        return;
      }
      toast({
        title: "Couldn't save expense",
        description: updateExpense.error() ?? "An unknown error occurred",
        variant: "destructive",
      });
    })();
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <Loading fallback={<LoadingFormComponent />}>
          <AddExpenseForm
            id={formId()}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isNewExpense={false}
            currentUserId={me()._id}
            otherUserId={props.otherUserId}
          />

          <div class="flex flex-col justify-end gap-3 sm:flex-row sm:gap-2">
            <DialogClose>
              <Button
                type="button"
                variant="outline"
                disabled={actionIsInProgress()}
                class="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              type="button"
              onClick={handleDelete}
              disabled={actionIsInProgress()}
              class="w-full sm:w-auto"
            >
              {deleteExpense.isPending() ? "Deleting..." : "Delete"}
            </Button>
            <Button
              type="submit"
              form={formId()}
              disabled={actionIsInProgress()}
              class="w-full sm:w-auto"
            >
              {updateExpense.isPending() ? "Saving..." : "Save"}
            </Button>
          </div>
        </Loading>
      </DialogContent>
    </Dialog>
  );
}

export function ConnectionExpenseListSkeleton() {
  return (
    <div>
      <Skeleton class="h-9 w-full" />
      <div class="my-4" />
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Repeat count={6}>{() => <SkeletonCard />}</Repeat>
      </div>
    </div>
  );
}
