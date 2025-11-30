"use client";

import { useRef, useState } from "react";

import { Input, Select } from "@/components/ui/input";
import { NumberInput } from "@/components/NumberInput";
import { Label } from "@/components/ui/label";

import { CATEGORIES, suggestCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { SkeletonFormField } from "@/components/Skeletons";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

export function AddExpenseForm({
  initialValues,
  onSubmit,
  id,
  ref,
  isNewExpense = false,
  className,
  connectionId,
}: {
  initialValues: {
    name: string;
    category: string;
    totalCost: number;
    currency: string;
    paidBy: Id<"users">;
    splitEqually: boolean;
  };
  id: string;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    value: {
      name: string;
      totalCost: number;
      category: string;
      currency: string;
      paidBy: Id<"users">;
      splitEqually: boolean;
    },
  ) => void;
  ref?: React.Ref<HTMLFormElement>;
  isNewExpense?: boolean;
  className?: string;
  connectionId: Id<"user_connections">;
}) {
  // Track if category was manually selected
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(
    initialValues.currency,
  );
  const [totalCost, setTotalCost] = useState(
    initialValues.totalCost === 0 ? "" : initialValues.totalCost.toString(),
  );
  const categorySelectRef = useRef<HTMLSelectElement>(null);

  const me = useSuspenseQuery(
    convexQuery(api.user.getCurrentUserAuthenticated, {}),
  );
  const connection = useSuspenseQuery(
    convexQuery(api.connections.getConnectionById, {
      id: connectionId,
    }),
  );

  const supportedCurrencies = useSuspenseQuery(
    convexQuery(api.exchangeRates.getSupportedCurrencies, {}),
  );

  const exchangeRate = supportedCurrencies.data.find((c) => {
    return c.currency === selectedCurrency;
  });

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

  // Handle currency selection change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
  };

  // Handle total cost change
  const handleTotalCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalCost(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = Object.fromEntries(new FormData(form).entries());

    const {
      "expense-name": name,
      "expense-totalcost": totalCost,
      "expense-category": category,
      "expense-currency": currency,
      "expense-paidBy": paidBy,
      "expense-splitEqually": splitEqually,
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

    if (typeof currency !== "string" || currency.trim() === "") {
      alert("Currency must be selected");
      return;
    }

    if (typeof paidBy !== "string" || paidBy.trim() === "") {
      alert("Who paid must be selected");
      return;
    }

    onSubmit(e, {
      name: name.trim(),
      totalCost: cost,
      category: category.trim(),
      currency: currency.trim(),
      paidBy: paidBy.trim() as Id<"users">,
      splitEqually: splitEqually === "true",
    });
  };

  // Get the other user in the connection
  const otherUser =
    connection && me
      ? connection.data?.inviterUserId === me.data?._id
        ? { _id: connection.data?.inviteeUserId, name: "Other User" }
        : { _id: connection.data?.inviterUserId, name: "Other User" }
      : null;

  if (!me || !otherUser) {
    return (
      <div className="space-y-4">
        <SkeletonFormField />
        <SkeletonFormField />
        <SkeletonFormField />
        <SkeletonFormField />
        <SkeletonFormField />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
      id={id}
      ref={ref}
    >
      <div>
        <Label htmlFor={`${id}-totalcost`}>Total Cost</Label>
        <NumberInput
          id={`${id}-totalcost`}
          name="expense-totalcost"
          allowDecimal={true}
          required
          className="w-full rounded border p-3 text-base sm:p-2 sm:text-sm"
          defaultValue={
            initialValues.totalCost === 0 ? "" : initialValues.totalCost
          }
          onChange={handleTotalCostChange}
        />

        {/* USD equivalent display */}
        {selectedCurrency !== "USD" && exchangeRate && totalCost && (
          <div className="mt-2 text-sm text-muted-foreground">
            ≈ ${(parseFloat(totalCost) / exchangeRate.rate).toFixed(2)} USD
          </div>
        )}
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
        <Label htmlFor={`${id}-currency`}>Currency</Label>
        <Select
          id={`${id}-currency`}
          name="expense-currency"
          required
          defaultValue={initialValues.currency}
          onChange={handleCurrencyChange}
        >
          {supportedCurrencies.data?.map((currencyData) => (
            <option key={currencyData.currency} value={currencyData.currency}>
              {currencyData.currency}
            </option>
          ))}
        </Select>

        {/* Exchange rate display */}
        {selectedCurrency !== "USD" && exchangeRate && (
          <div className="mt-2 text-sm text-muted-foreground">
            <div>
              {exchangeRate.rate.toFixed(2)} {selectedCurrency} = 1 USD
            </div>
            <div className="text-xs text-muted-foreground">
              (last updated: {new Date(exchangeRate.date).toLocaleDateString()})
            </div>
          </div>
        )}
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
          {CATEGORIES.map((category: string) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor={`${id}-paidBy`}>Who Paid?</Label>
        <Select
          id={`${id}-paidBy`}
          name="expense-paidBy"
          required
          defaultValue={initialValues.paidBy}
        >
          {me && <option value={me.data?._id}>You</option>}
          {otherUser && <option value={otherUser._id}>Them</option>}
        </Select>
      </div>

      <div>
        <Label htmlFor={`${id}-splitEqually`}>Split Type</Label>
        <Select
          id={`${id}-splitEqually`}
          name="expense-splitEqually"
          required
          defaultValue={initialValues.splitEqually ? "true" : "false"}
        >
          <option value="true">Split Equally</option>
          <option value="false">One Person Pays All</option>
        </Select>
      </div>

      {/* Note for editing expenses */}
      {!isNewExpense && selectedCurrency !== "USD" && (
        <div className="mt-4 rounded-md border border-blue-500/20 bg-blue-500/10 p-3">
          <div className="text-sm text-blue-600">
            <strong>Note:</strong> When editing this expense, we&apos;ll use the
            latest exchange rate, not necessarily the exchange rate from when
            the expense was originally added.
          </div>
        </div>
      )}
    </form>
  );
}
