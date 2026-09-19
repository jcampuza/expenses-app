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
} from "lucide";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";

export interface ExpenseCardProps {
  name: string;
  date: string;
  updatedAt?: string;
  category: string;
  whoPaid: "you" | "they";
  whoOwes: "you" | "they";
  isSplitEqually: boolean;
  amount: number;
  totalCost: number;
  originalCurrency?: string;
  originalTotalCost?: number;
  class?: string;
}

function getCategoryIcon(category: string) {
  const icons: Record<string, typeof Coffee> = {
    Coffee,
    Food: Hamburger,
    Groceries: ShoppingCart,
    Transportation: Car,
    Travel: Plane,
    Entertainment: RollerCoaster,
    Shopping: ShoppingBasket,
    Utilities: Receipt,
    Fun: FerrisWheel,
    Other: Package,
  };
  return icons[category] ?? CreditCard;
}

function getFormattedAmount(amount: number) {
  return amount.toFixed(2);
}

export function ExpenseCardCompact(props: ExpenseCardProps) {
  const formattedAmount = () => getFormattedAmount(props.amount);
  const oweText = () => (props.whoOwes === "you" ? "You owe" : "They owe");
  const paidText = () => (props.whoPaid === "you" ? "You paid" : "They paid");

  return (
    <div
      class={cn(
        "relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-75 hover:shadow-md",
        props.class,
      )}
    >
      <div
        class={cn(
          "absolute top-0 bottom-0 left-0 w-1",
          props.whoOwes === "you" ? "bg-destructive" : "bg-success",
        )}
      />
      <div class="p-3 pl-4">
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <div class="flex items-center">
              <h3 class="truncate font-medium text-foreground">{props.name}</h3>
              <div class="ml-2 flex items-center text-xs text-muted-foreground">
                <Icon icon={Calendar} class="mr-1 h-3 w-3" />
                {props.date}
                {props.updatedAt ? (
                  <span class="ml-2 text-xs text-muted-foreground italic">
                    Edited {new Date(props.updatedAt).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </div>
            <div class="mt-1 flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span
                  class={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    props.whoOwes === "you"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-success/10 text-success",
                  )}
                >
                  {oweText()}
                </span>
                <span class="text-xs text-muted-foreground">{paidText()}</span>
              </div>
              <div class="flex items-center gap-2">
                {props.isSplitEqually ? (
                  <span class="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600">
                    Split equally
                  </span>
                ) : (
                  <span class="rounded bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600">
                    Not split
                  </span>
                )}
                <span class="mx-1 h-1 w-1 rounded-full bg-border" />
                <span class="flex items-center text-xs text-muted-foreground">
                  <Icon
                    icon={getCategoryIcon(props.category)}
                    class="h-4 w-4"
                  />
                  <span class="ml-1">{props.category}</span>
                </span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div
              class={cn(
                "text-sm font-semibold",
                props.whoOwes === "you" ? "text-destructive" : "text-success",
              )}
            >
              ${formattedAmount()}
            </div>
            <div class="text-xs text-muted-foreground">
              {props.originalCurrency && props.originalCurrency !== "USD" ? (
                <div class="flex flex-col">
                  <span>
                    {getFormattedAmount(
                      props.originalTotalCost ?? props.totalCost,
                    )}{" "}
                    {props.originalCurrency}
                  </span>
                  <span>${getFormattedAmount(props.totalCost)} USD</span>
                </div>
              ) : (
                <span>Total: ${getFormattedAmount(props.totalCost)}</span>
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
