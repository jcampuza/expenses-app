"use client";

import { useRef, useState } from "react";

import { Input, Select } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { CATEGORIES, suggestCategory } from "~/lib/categories";
import { cn, PAYMENT_TYPES_UI_OPTIONS } from "~/lib/utils";
import { PAYMENT_TYPE, PAYMENT_TYPE_LIST } from "~/server/db/schema";

export function AddExpenseForm({
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
