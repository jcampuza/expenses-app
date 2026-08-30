import { createMemo, createSignal, For, Show } from "solid-js";
import { Input, Select } from "@/components/ui/input";
import { NumberInput } from "@/components/NumberInput";
import { Label } from "@/components/ui/label";
import { CATEGORIES, suggestCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { createQuery } from "@/lib/convex";

export type ExpenseFormValue = {
  name: string;
  totalCost: number;
  category: string;
  currency: string;
  paidBy: Id<"users">;
  splitEqually: boolean;
};

export function AddExpenseForm(props: {
  initialValues: {
    name: string;
    category: string;
    totalCost: number;
    currency: string;
    paidBy: Id<"users">;
    splitEqually: boolean;
  };
  id: string;
  onSubmit: (event: SubmitEvent, value: ExpenseFormValue) => void;
  ref?: (el: HTMLFormElement) => void;
  isNewExpense?: boolean;
  class?: string;
  currentUserId: Id<"users">;
  otherUserId: Id<"users">;
}) {
  let isManualSelection = false;
  let categorySelect: HTMLSelectElement | undefined;
  const [selectedCurrency, setSelectedCurrency] = createSignal(
    props.initialValues.currency,
  );
  const [totalCost, setTotalCost] = createSignal(
    props.initialValues.totalCost === 0
      ? ""
      : props.initialValues.totalCost.toString(),
  );

  const supportedCurrencies = createQuery(
    api.exchangeRates.getSupportedCurrencies,
  );
  const currencies = createMemo(() => supportedCurrencies() ?? []);
  const exchangeRate = createMemo(() =>
    currencies().find((c) => c.currency === selectedCurrency()),
  );

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = Object.fromEntries(new FormData(form).entries());
    const name = formData["expense-name"];
    const costRaw = formData["expense-totalcost"];
    const category = formData["expense-category"];
    const currency = formData["expense-currency"];
    const paidBy = formData["expense-paidBy"];
    const splitEqually = formData["expense-splitEqually"];

    if (typeof name !== "string" || name.trim() === "") {
      alert("Name must be a non-empty string");
      return;
    }
    const cost = parseFloat(String(costRaw));
    if (isNaN(cost)) {
      alert("Total cost must be a valid number");
      return;
    }
    if (typeof category !== "string" || category.trim() === "") {
      alert("Category must be selected");
      return;
    }
    if (typeof currency !== "string" || currency.trim() === "") {
      alert("Currency must be selected");
      return;
    }
    if (typeof paidBy !== "string" || paidBy.trim() === "") {
      alert("Who paid must be selected");
      return;
    }

    props.onSubmit(event, {
      name: name.trim(),
      totalCost: cost,
      category: category.trim(),
      currency: currency.trim(),
      paidBy: paidBy.trim() as Id<"users">,
      splitEqually: splitEqually === "true",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      class={cn("space-y-4", props.class)}
      id={props.id}
      ref={props.ref}
    >
      <div>
        <Label for={`${props.id}-totalcost`}>Total Cost</Label>
        <NumberInput
          id={`${props.id}-totalcost`}
          name="expense-totalcost"
          allowDecimal={true}
          required
          class="w-full rounded border p-3 text-base sm:p-2 sm:text-sm"
          value={totalCost()}
          onInput={(event) => setTotalCost(event.currentTarget.value)}
        />
        <Show
          when={selectedCurrency() !== "USD" && exchangeRate() && totalCost()}
        >
          <div class="mt-2 text-sm text-muted-foreground">
            ≈ $
            {(parseFloat(totalCost()) / (exchangeRate()?.rate ?? 1)).toFixed(2)}{" "}
            USD
          </div>
        </Show>
      </div>

      <div>
        <Label
          for={`${props.id}-name`}
          class="mb-2 block text-base font-medium sm:mb-1 sm:text-sm"
        >
          Name
        </Label>
        <Input
          id={`${props.id}-name`}
          name="expense-name"
          type="text"
          required
          value={props.initialValues.name}
          onInput={(event) => {
            const newName = event.currentTarget.value;
            if (props.isNewExpense && categorySelect && newName.length >= 3) {
              const currentCategory = categorySelect.value;
              const shouldSuggest =
                !isManualSelection ||
                currentCategory === "None" ||
                !currentCategory;
              if (shouldSuggest) {
                const suggestedCategory = suggestCategory(newName);
                if (suggestedCategory) {
                  categorySelect.value = suggestedCategory;
                }
              }
            }
          }}
        />
      </div>

      <div>
        <Label for={`${props.id}-currency`}>Currency</Label>
        <Show when={supportedCurrencies() != null}>
          <Select
            id={`${props.id}-currency`}
            name="expense-currency"
            required
            value={props.initialValues.currency}
            onChange={(event) => setSelectedCurrency(event.currentTarget.value)}
          >
            <For each={Array.from(currencies())}>
              {(currencyData) => (
                <option value={currencyData.currency}>
                  {currencyData.currency}
                </option>
              )}
            </For>
          </Select>
        </Show>
        <Show when={selectedCurrency() !== "USD" && exchangeRate()}>
          <div class="mt-2 text-sm text-muted-foreground">
            <div>
              {exchangeRate()?.rate.toFixed(2)} {selectedCurrency()} = 1 USD
            </div>
            <div class="text-xs text-muted-foreground">
              (last updated:{" "}
              {new Date(exchangeRate()?.date ?? 0).toLocaleDateString()})
            </div>
          </div>
        </Show>
      </div>

      <div>
        <Label for={`${props.id}-category`}>Category</Label>
        <Select
          id={`${props.id}-category`}
          name="expense-category"
          required
          value={props.initialValues.category}
          ref={(el) => {
            categorySelect = el;
          }}
          onChange={(event) => {
            const selectedCategory = event.currentTarget.value;
            isManualSelection = !(
              selectedCategory === "None" || !selectedCategory
            );
          }}
        >
          <For each={CATEGORIES}>
            {(category) => <option value={category}>{category}</option>}
          </For>
        </Select>
      </div>

      <div>
        <Label for={`${props.id}-paidBy`}>Who Paid?</Label>
        <Select
          id={`${props.id}-paidBy`}
          name="expense-paidBy"
          required
          value={props.initialValues.paidBy}
        >
          <option value={props.currentUserId}>You</option>
          <option value={props.otherUserId}>Them</option>
        </Select>
      </div>

      <div>
        <Label for={`${props.id}-splitEqually`}>Split Type</Label>
        <Select
          id={`${props.id}-splitEqually`}
          name="expense-splitEqually"
          required
          value={props.initialValues.splitEqually ? "true" : "false"}
        >
          <option value="true">Split Equally</option>
          <option value="false">One Person Pays All</option>
        </Select>
      </div>

      <Show when={!props.isNewExpense && selectedCurrency() !== "USD"}>
        <div class="mt-4 rounded-md border border-blue-500/20 bg-blue-500/10 p-3">
          <div class="text-sm text-blue-600">
            <strong>Note:</strong> When editing this expense, we'll use the
            latest exchange rate, not necessarily the exchange rate from when
            the expense was originally added.
          </div>
        </div>
      </Show>
    </form>
  );
}
