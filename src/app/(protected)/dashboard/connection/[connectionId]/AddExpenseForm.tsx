"use client";

import { useRef, useState } from "react";

import { Input, Select } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { CATEGORIES, suggestCategory } from "~/lib/categories";
import { cn } from "~/lib/utils";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

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
  const categorySelectRef = useRef<HTMLSelectElement>(null);

  const me = useQuery(api.user.getCurrentUser);
  const connection = useQuery(api.connections.getConnectionById, {
    id: connectionId,
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = Object.fromEntries(new FormData(form).entries());

    const {
      "expense-name": name,
      "expense-totalcost": totalCost,
      "expense-category": category,
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

    if (typeof paidBy !== "string" || paidBy.trim() === "") {
      alert("Who paid must be selected");
      return;
    }

    onSubmit(e, {
      name: name.trim(),
      totalCost: cost,
      category: category.trim(),
      paidBy: paidBy.trim() as Id<"users">,
      splitEqually: splitEqually === "true",
    });
  };

  // Get the other user in the connection
  const otherUser =
    connection && me
      ? connection.inviterUserId === me._id
        ? { _id: connection.inviteeUserId, name: "Other User" }
        : { _id: connection.inviterUserId, name: "Other User" }
      : null;

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
        <Label htmlFor={`${id}-paidBy`}>Who Paid?</Label>
        <Select
          id={`${id}-paidBy`}
          name="expense-paidBy"
          required
          defaultValue={initialValues.paidBy}
        >
          {me && <option value={me._id}>You</option>}
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
    </form>
  );
}
