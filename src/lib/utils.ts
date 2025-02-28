import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PaymentTypes } from "~/server/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDollars = (value: number) => {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export const getBalanceTitle = (totalBalance: number, theirName = "They") => {
  if (totalBalance > 0) {
    return `You owe ${formatDollars(Math.abs(totalBalance))}`;
  }

  if (totalBalance < 0) {
    return `${theirName} owes ${formatDollars(Math.abs(totalBalance))}`;
  }

  return "All debts settled";
};

export const PAYMENT_TYPES_UI_OPTIONS = [
  {
    value: PaymentTypes.paid_by_owner_split_equally,
    label: "You paid, split equally",
  },
  {
    value: PaymentTypes.paid_by_owner_participant_owes,
    label: "They owe you the entire amount",
  },
  {
    value: PaymentTypes.paid_by_participant_split_equally,
    label: "They paid, split equally",
  },
  {
    value: PaymentTypes.paid_by_participant_owner_owes,
    label: "You owe them the entire amount",
  },
] as const;
