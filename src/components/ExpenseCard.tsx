import type React from "react";

import {
  Calendar,
  Coffee,
  CreditCard,
  Hamburger,
  ShoppingCart,
  Car,
  RollerCoaster,
  ShoppingBasket,
  Receipt,
  FerrisWheel,
  Plane,
  Package,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Define the props for the expense card
export interface ExpenseCardProps {
  name: string;
  date: string;
  category: string;
  whoPaid: "you" | "they";
  whoOwes: "you" | "they";
  isSplitEqually: boolean;
  amount: number;
  totalCost: number;
  originalCurrency?: string;
  originalTotalCost?: number;
  className?: string;
}

// Map of category names to icons
export const categoryIcons: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="h-4 w-4" />,
  Food: <Hamburger className="h-4 w-4" />,
  Groceries: <ShoppingCart className="h-4 w-4" />,
  Transportation: <Car className="h-4 w-4" />,
  Travel: <Plane className="h-4 w-4" />,
  Entertainment: <RollerCoaster className="h-4 w-4" />,
  Shopping: <ShoppingBasket className="h-4 w-4" />,
  Utilities: <Receipt className="h-4 w-4" />,
  Fun: <FerrisWheel className="h-4 w-4" />,
  Other: <Package className="h-4 w-4" />,
  None: <div className="h-4 w-4" />,
};

function getCategoryIcon(category: string) {
  return categoryIcons[category] || <CreditCard className="h-4 w-4" />;
}

function getFormattedAmount(amount: number) {
  return amount.toFixed(2);
}

export function ExpenseCardCompact({
  name,
  date,
  category,
  whoPaid,
  whoOwes,
  isSplitEqually,
  amount,
  totalCost,
  originalCurrency,
  originalTotalCost,
  className,
}: ExpenseCardProps) {
  const formattedAmount = getFormattedAmount(amount);
  const categoryIcon = getCategoryIcon(category);

  const oweText = whoOwes === "you" ? "You owe" : "They owe";
  const paidText = whoPaid === "you" ? "You paid" : "They paid";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md",
        className,
      )}
    >
      {/* Accent color strip on the left */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-[hsl(262.1,83.3%,57.8%)]" />

      <div className="p-3 pl-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <h3 className="truncate font-medium text-gray-900">{name}</h3>
              <div className="ml-2 flex items-center text-xs text-gray-500">
                <Calendar className="mr-1 h-3 w-3" />
                {date}
              </div>
            </div>

            {/* Improved layout for badges/info */}
            <div className="mt-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    whoOwes === "you"
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700",
                  )}
                >
                  {oweText}
                </span>
                <span className="text-xs text-gray-500">{paidText}</span>
              </div>
              <div className="flex items-center gap-2">
                {isSplitEqually ? (
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    Split equally
                  </span>
                ) : (
                  <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                    Not split
                  </span>
                )}
                <span className="mx-1 h-1 w-1 rounded-full bg-gray-300" />
                <span className="flex items-center text-xs text-gray-500">
                  {categoryIcon}
                  <span className="ml-1">{category}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div
              className={cn(
                "text-sm font-semibold",
                whoOwes === "you" ? "text-red-500" : "text-green-500",
              )}
            >
              ${formattedAmount}
            </div>
            <div className="text-xs text-gray-500">
              {originalCurrency && originalCurrency !== "USD" ? (
                <div className="flex flex-col">
                  <span>
                    {getFormattedAmount(originalTotalCost ?? totalCost)}{" "}
                    {originalCurrency}
                  </span>
                  <span>${getFormattedAmount(totalCost)} USD</span>
                </div>
              ) : (
                <span>Total: ${getFormattedAmount(totalCost)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseCard(props: ExpenseCardProps) {
  return <ExpenseCardCompact {...props} />;
}
