import type { JSX } from "@solidjs/web";
import { cn } from "@/lib/utils";

export function Card(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      class={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        props.class,
      )}
    />
  );
}

export function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} class={cn("flex flex-col space-y-1.5 p-4", props.class)} />
  );
}

export function CardTitle(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      class={cn("leading-none font-semibold tracking-tight", props.class)}
    />
  );
}

export function CardDescription(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} class={cn("text-sm text-muted-foreground", props.class)} />
  );
}

export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} class={cn("p-4 pt-0", props.class)} />;
}

export function CardFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} class={cn("flex items-center p-6 pt-0", props.class)} />
  );
}
