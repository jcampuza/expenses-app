import { cva } from "class-variance-authority";
import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

export function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} class={cn(labelVariants(), props.class)} />;
}
