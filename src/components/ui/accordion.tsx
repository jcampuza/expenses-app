import type { ParentProps } from "solid-js";
import { ChevronDown } from "lucide";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";

export function Accordion(props: ParentProps<{ class?: string }>) {
  return <div class={props.class}>{props.children}</div>;
}

export function AccordionItem(
  props: ParentProps<{ value?: string; class?: string }>,
) {
  return (
    <details class={cn("group border-b last:border-b-0", props.class)}>
      {props.children}
    </details>
  );
}

export function AccordionTrigger(props: ParentProps<{ class?: string }>) {
  return (
    <summary
      class={cn(
        "flex flex-1 cursor-pointer list-none items-center justify-between py-4 text-left text-sm font-medium transition-all hover:underline [&::-webkit-details-marker]:hidden",
        props.class,
      )}
    >
      {props.children}
      <Icon
        icon={ChevronDown}
        class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
      />
    </summary>
  );
}

export function AccordionContent(props: ParentProps<{ class?: string }>) {
  return (
    <div class={cn("pt-0 pb-4 text-sm", props.class)}>{props.children}</div>
  );
}
