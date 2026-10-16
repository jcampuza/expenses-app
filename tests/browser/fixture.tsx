import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { createRouter, useNavigate, useParams } from "@solidjs/router";
import { getFunctionName, type FunctionReference } from "convex/server";
import type { ConvexClient } from "convex/browser";
import type { Id } from "../../convex/_generated/dataModel";
import { ConvexProvider } from "@/lib/convex";
import { CurrentUserProvider } from "@/lib/current-user";
import {
  AddExpenseDialogButton,
  ConnectionExpenseList,
} from "@/components/ExpensesTabContent";
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
const [lastMutation, setLastMutation] = createSignal<unknown>(null);
let currenciesPending = new URLSearchParams(window.location.search).has(
  "pendingCurrencies",
);
if (new URLSearchParams(window.location.search).get("user") === "other") {
  data["user:getCurrentUserAuthenticated"] = { _id: "other", name: "Other" };
  const shared = data["expenses:getSharedExpenses"] as {
    user: { _id: string; name: string };
    totalBalance: number;
    items: { balance: number }[];
  };
  shared.user = { _id: "me", name: "Me" };
  shared.totalBalance = -5;
  shared.items[0]!.balance = -5;
}
// The production backend predates the user._id field expected by the forms.
if (new URLSearchParams(window.location.search).has("legacyUser")) {
  const shared = data["expenses:getSharedExpenses"] as {
    user: { _id?: string; name: string };
  };
  delete shared.user._id;
}
const listeners = new Set<{
  name: string;
  callback: (value: unknown) => void;
}>();
const client = {
  async mutation(mutation: FunctionReference<"mutation">, args: unknown) {
    setLastMutation({ name: getFunctionName(mutation), args });
    return null;
  },
  onUpdate(
    query: FunctionReference<"query">,
    _args: unknown,
    callback: (value: unknown) => void,
  ) {
    const name = getFunctionName(query);
    const listener = { name, callback };
    listeners.add(listener);
    return {
      getCurrentValue: () =>
        name === "exchangeRates:getSupportedCurrencies" && currenciesPending
          ? undefined
          : data[name],
      unsubscribe: () => listeners.delete(listener),
    };
  },
} as unknown as ConvexClient;

window.addEventListener("fixture:resolve-currencies", () => {
  currenciesPending = false;
  for (const listener of listeners) {
    if (listener.name === "exchangeRates:getSupportedCurrencies") {
      listener.callback(data[listener.name]);
    }
  }
});

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
  const navigate = useNavigate();
  return (
    <main class="p-8">
      <a href="/tests/browser/detail/person%20two">Open route</a>
      <button onClick={() => navigate("/tests/browser/detail/three")}>
        Navigate to route
      </button>
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
          <div class="hidden md:block">
            <AddExpenseDialogButton
              connectionId={"connection-1" as Id<"user_connections">}
              variant="desktop"
            />
          </div>
          <ConnectionExpenseList
            connectionId={"connection-1" as Id<"user_connections">}
          />
        </CurrentUserProvider>
      </ConvexProvider>
      <output id="last-mutation">{JSON.stringify(lastMutation())}</output>
    </main>
  );
}

function RouteDetail() {
  const params = useParams();
  return (
    <main>
      <p>Route ID: {params.id}</p>
      <a href="/tests/browser/index.html">Back to fixture</a>
    </main>
  );
}

const Router = createRouter({
  routes: [
    { path: "/tests/browser/index.html", component: Fixture },
    { path: "/tests/browser/detail/:id", component: RouteDetail },
  ],
});
render(() => <Router />, document.getElementById("root")!);
