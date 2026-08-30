import { For, Show, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignInButton } from "@/lib/clerk";
import { usePersistUser } from "@/lib/persist-user";
import { Globe, ReceiptText, ShieldCheck, Users2, Wallet, Zap } from "lucide";
import { PublicLayout } from "@/components/PublicLayout";
import { AuthSpinner } from "@/components/LoadingComponent";
import { Icon } from "@/components/icons";

const CURRENCIES = ["USD", "ARS", "EUR", "GBP", "MXN", "CAD", "JPY", "CNY"];

const STEPS = [
  {
    title: "Create a connection",
    description:
      "Invite the people you share expenses with and keep balances in sync.",
  },
  {
    title: "Add expenses",
    description:
      "Add expenses with payer, amount, and category to track fairly.",
  },
  {
    title: "Settle up",
    description: "See totals instantly and settle up however works best.",
  },
];

export default function PublicHome() {
  const auth = usePersistUser();
  const navigate = useNavigate();

  createEffect(
    () => auth().status,
    (status) => {
      if (status === "ready") {
        queueMicrotask(() => navigate("/dashboard", { replace: true }));
      }
    },
  );

  return (
    <Show when={auth().status === "signedOut"} fallback={<AuthSpinner />}>
      <PublicLayout>
        <div class="flex flex-col">
          <section class="relative mx-auto w-full max-w-6xl px-4 pt-16 sm:pt-24">
            <div class="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl" />
            <div class="flex flex-col items-center text-center">
              <img
                src="/logo.webp"
                alt="ExpenseMate logo"
                width={128}
                height={128}
                class="mb-6 rounded-full shadow"
              />

              <div class="mb-4 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary">
                  Split expenses without spreadsheets
                </Badge>
                <Badge variant="outline">Completely free</Badge>
              </div>

              <h1 class="mb-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
                Track shared expenses and settle up effortlessly
              </h1>
              <p class="mb-8 max-w-2xl text-balance text-muted-foreground">
                ExpenseMate helps you split bills, handle purchases in different
                currencies, and keep a clear running total with the people you
                share costs with. Fast, private, and easy—no spreadsheets
                needed.
              </p>

              <div class="flex flex-col items-center gap-3 sm:flex-row">
                <SignInButton mode="modal">
                  <Button size="lg">Get started free</Button>
                </SignInButton>
                <a
                  href="#features"
                  class={[
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full sm:w-auto",
                  ]}
                >
                  Explore features
                </a>
              </div>

              <div class="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Supports</span>
                <For each={CURRENCIES}>
                  {(currency) => (
                    <Badge variant="outline" class="font-normal">
                      {currency}
                    </Badge>
                  )}
                </For>
              </div>
            </div>
          </section>

          <section id="features" class="mx-auto w-full max-w-6xl px-4 py-16">
            <div class="mx-auto mb-8 max-w-2xl text-center">
              <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
                Everything you need to split fairly
              </h2>
              <p class="mt-2 text-muted-foreground">
                Powerful, simple features designed for everyday life—roommates,
                trips, couples, and more.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader class="flex flex-row items-center gap-3">
                  <div class="grid size-10 place-items-center rounded-md bg-primary/10">
                    <Icon icon={ReceiptText} class="size-5 text-primary" />
                  </div>
                  <CardTitle>Fast expense entry</CardTitle>
                </CardHeader>
                <CardContent class="text-sm text-muted-foreground">
                  Add who paid, what it was for, and split equally in seconds.
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="flex flex-row items-center gap-3">
                  <div class="grid size-10 place-items-center rounded-md bg-primary/10">
                    <Icon icon={Globe} class="size-5 text-primary" />
                  </div>
                  <CardTitle>Multi‑currency aware</CardTitle>
                </CardHeader>
                <CardContent class="text-sm text-muted-foreground">
                  Purchases abroad? We convert using the latest rates so
                  balances stay accurate.
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="flex flex-row items-center gap-3">
                  <div class="grid size-10 place-items-center rounded-md bg-primary/10">
                    <Icon icon={Users2} class="size-5 text-primary" />
                  </div>
                  <CardTitle>Per‑connection balances</CardTitle>
                </CardHeader>
                <CardContent class="text-sm text-muted-foreground">
                  See exactly who owes whom at a glance for each connection.
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="flex flex-row items-center gap-3">
                  <div class="grid size-10 place-items-center rounded-md bg-primary/10">
                    <Icon icon={Zap} class="size-5 text-primary" />
                  </div>
                  <CardTitle>Real‑time & reliable</CardTitle>
                </CardHeader>
                <CardContent class="text-sm text-muted-foreground">
                  Updates instantly across devices so everyone stays in sync.
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="flex flex-row items-center gap-3">
                  <div class="grid size-10 place-items-center rounded-md bg-primary/10">
                    <Icon icon={ShieldCheck} class="size-5 text-primary" />
                  </div>
                  <CardTitle>Secure by default</CardTitle>
                </CardHeader>
                <CardContent class="text-sm text-muted-foreground">
                  Sign in securely and keep your data private.
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="flex flex-row items-center gap-3">
                  <div class="grid size-10 place-items-center rounded-md bg-primary/10">
                    <Icon icon={Wallet} class="size-5 text-primary" />
                  </div>
                  <CardTitle>Settle up easily</CardTitle>
                </CardHeader>
                <CardContent class="text-sm text-muted-foreground">
                  Clear totals help you settle up however you prefer.
                </CardContent>
              </Card>
            </div>
          </section>

          <section class="mx-auto w-full max-w-6xl px-4 py-16">
            <div class="mx-auto mb-8 max-w-2xl text-center">
              <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
                How it works
              </h2>
              <p class="mt-2 text-muted-foreground">
                Three simple steps to stay in sync.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <For each={STEPS}>
                {(step, index) => (
                  <Card>
                    <CardHeader>
                      <Badge variant="secondary" class="w-fit">
                        Step {index() + 1}
                      </Badge>
                      <CardTitle class="mt-2">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </For>
            </div>
          </section>

          <section class="mx-auto w-full max-w-6xl px-4 py-16">
            <div class="mx-auto mb-8 max-w-2xl text-center">
              <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
                Why people choose ExpenseMate
              </h2>
              <p class="mt-2 text-muted-foreground">
                Built for real-world sharing with reliability and clarity at its
                core.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time syncing</CardTitle>
                  <CardDescription>
                    Everyone sees the latest balances instantly—no refresh
                    required.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Fair splits</CardTitle>
                  <CardDescription>
                    Track who paid, split however you like, and keep an
                    auditable history.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Secure by default</CardTitle>
                  <CardDescription>
                    Privacy-focused authentication and data handling from the
                    start.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section class="mx-auto w-full max-w-6xl px-4 py-16">
            <div class="mx-auto mb-8 max-w-2xl text-center">
              <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
                Frequently asked questions
              </h2>
              <p class="mt-2 text-muted-foreground">
                Quick answers to common questions about how ExpenseMate works.
              </p>
            </div>

            <Accordion class="space-y-3">
              <AccordionItem value="privacy">
                <AccordionTrigger>Is my expense data private?</AccordionTrigger>
                <AccordionContent class="text-muted-foreground">
                  Yes. Only people in your connections can see shared expenses,
                  and we use secure authentication to keep your data safe.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="currencies">
                <AccordionTrigger>
                  Do you support multiple currencies?
                </AccordionTrigger>
                <AccordionContent class="text-muted-foreground">
                  Absolutely. Add expenses in different currencies and we handle
                  conversions so balances stay accurate.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="settle">
                <AccordionTrigger>How do settlements work?</AccordionTrigger>
                <AccordionContent class="text-muted-foreground">
                  ExpenseMate shows clear totals for each connection so you can
                  settle up however you prefer—cash, transfers, or otherwise.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="pricing">
                <AccordionTrigger>
                  How much does ExpenseMate cost?
                </AccordionTrigger>
                <AccordionContent class="text-muted-foreground">
                  It's completely free to use.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <Separator class="mx-auto my-10 w-full max-w-6xl" />

          <section class="mx-auto mb-16 w-full max-w-3xl px-4 text-center">
            <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
              Split expenses fairly without spreadsheets
            </h2>
            <p class="mt-3 text-muted-foreground">
              Get started in minutes and keep everyone on the same page.
            </p>
            <div class="mt-6 flex items-center justify-center gap-4">
              <SignInButton mode="modal">
                <Button size="lg">Start now</Button>
              </SignInButton>
              <a
                href="#features"
                class={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Explore features
              </a>
            </div>
          </section>
        </div>
      </PublicLayout>
    </Show>
  );
}
