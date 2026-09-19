import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";

export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ExpenseMate</title>
        <meta name="description" content="Simple expense tracking app" />
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
