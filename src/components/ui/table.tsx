import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/utils";

export function Table(props: JSX.HTMLAttributes<HTMLTableElement>) {
  return (
    <div class="relative w-full overflow-auto">
      <table
        {...props}
        class={cn("w-full caption-bottom text-sm", props.class)}
      />
    </div>
  );
}

export function TableHeader(
  props: JSX.HTMLAttributes<HTMLTableSectionElement>,
) {
  return <thead {...props} class={cn("[&_tr]:border-b", props.class)} />;
}

export function TableBody(props: JSX.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody {...props} class={cn("[&_tr:last-child]:border-0", props.class)} />
  );
}

export function TableRow(props: JSX.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      {...props}
      class={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        props.class,
      )}
    />
  );
}

export function TableHead(props: JSX.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...props}
      class={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
        props.class,
      )}
    />
  );
}

export function TableCell(props: JSX.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} class={cn("p-2 align-middle", props.class)} />;
}
