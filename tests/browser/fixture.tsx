import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { getFunctionName, type FunctionReference } from "convex/server";
import type { ConvexClient } from "convex/browser";
import type { Id } from "../../convex/_generated/dataModel";
import { ConvexProvider } from "@/lib/convex";
import { CurrentUserProvider } from "@/lib/current-user";
import { ConnectionExpenseList } from "@/components/ExpensesTabContent";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import "@/styles/globals.css";

const data: Record<string, unknown> = {
  "user:getCurrentUserAuthenticated": { _id: "me", name: "Me" },
  "exchangeRates:getSupportedCurrencies": [
    { currency: "USD", rate: 1, date: "2026-09-01" },
  ],
  "expenses:getSharedExpenses": {
    user: { _id: "other", name: "Other" },
    totalBalance: 5,
    items: [
      {
        expense: {
          _id: "expense-1",
          name: "Coffee",
          totalCost: 10,
          currency: "USD",
          date: "2026-09-01",
          paidBy: "me",
          category: "Coffee",
        },
        userAExpense: { userId: "me", amountOwed: 5 },
        userBExpense: { userId: "other", amountOwed: 5 },
        balance: 5,
      },
    ],
  },
};
const listeners = new Set<{
  name: string;
  callback: (value: unknown) => void;
}>();
const client = {
  onUpdate(
    query: FunctionReference<"query">,
    _args: unknown,
    callback: (value: unknown) => void,
  ) {
    const name = getFunctionName(query);
    const listener = { name, callback };
    listeners.add(listener);
    return {
      getCurrentValue: () => data[name],
      unsubscribe: () => listeners.delete(listener),
    };
  },
} as unknown as ConvexClient;

// Deliver a fresh server-shaped object graph without touching the open form.
window.addEventListener("fixture:refresh", () => {
  const shared = structuredClone(data["expenses:getSharedExpenses"]) as {
    items: { expense: { name: string } }[];
  };
  shared.items[0]!.expense.name = "Updated coffee";
  data["expenses:getSharedExpenses"] = shared;
  for (const listener of listeners) {
    if (listener.name === "expenses:getSharedExpenses")
      listener.callback(shared);
  }
});

function Fixture() {
  const [alertOpen, setAlertOpen] = createSignal(false);
  return (
    <main class="p-8">
      <button id="background">Background control</button>
      <Dialog>
        <DialogTrigger>
          <button>Open dialog</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test dialog</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
          <label>
            Draft
            <input />
          </label>
          <DialogClose>
            <button>Done</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <button onClick={() => setAlertOpen(true)}>Open alert</button>
      <AlertDialog open={alertOpen()} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm action</AlertDialogTitle>
          <AlertDialogDescription>
            This needs confirmation.
          </AlertDialogDescription>
          <AlertDialogCancel>Cancel action</AlertDialogCancel>
          <AlertDialogAction onClick={() => setAlertOpen(false)}>
            Confirm
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
      <ConvexProvider client={client}>
        <CurrentUserProvider>
          <ConnectionExpenseList
            connectionId={"connection-1" as Id<"user_connections">}
          />
        </CurrentUserProvider>
      </ConvexProvider>
    </main>
  );
}
render(() => <Fixture />, document.getElementById("root")!);
