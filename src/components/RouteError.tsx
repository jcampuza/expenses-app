import { Button } from "@/components/ui/button";

export function RouteError(props: { error: unknown; reset: () => void }) {
  const message = () =>
    props.error instanceof Error ? props.error.message : "Something went wrong";

  return (
    <div class="mx-auto flex max-w-md grow flex-col items-center justify-center gap-3 p-8 text-center">
      <p class="text-sm font-medium text-foreground">Something went wrong.</p>
      <p class="text-sm text-muted-foreground">{message()}</p>
      <div class="flex gap-2">
        <Button type="button" variant="outline" onClick={props.reset}>
          Try again
        </Button>
        <a href="/dashboard">
          <Button type="button">Back to dashboard</Button>
        </a>
      </div>
    </div>
  );
}
