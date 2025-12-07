import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignInButton } from "@clerk/clerk-react";
import {
  Globe,
  ReceiptText,
  ShieldCheck,
  Users2,
  Wallet,
  Zap,
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/_public/")({
  component: PublicHome,
  beforeLoad: async ({ context }) => {
    if (context.auth.isAuthenticated) {
      redirect({ to: "/dashboard", replace: true, throw: true });
    }
  },
});

function PublicHome() {
  return (
    <PublicLayout>
      <div className="flex flex-col">
        <section className="relative mx-auto w-full max-w-6xl px-4 pt-16 sm:pt-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl" />
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo.webp"
              alt="ExpenseMate logo"
              width={128}
              height={128}
              className="mb-6 rounded-full shadow"
            />

            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">
                Split expenses without spreadsheets
              </Badge>
              <Badge variant="outline">Completely free</Badge>
            </div>

            <h1 className="mb-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Track shared expenses and settle up effortlessly
            </h1>
            <p className="text-muted-foreground mb-8 max-w-2xl text-balance">
              ExpenseMate helps you split bills, handle purchases in different
              currencies, and keep a clear running total with the people you
              share costs with. Fast, private, and easy—no spreadsheets needed.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <SignInButton>
                <Button size="lg">Get started free</Button>
              </SignInButton>
              <a href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Learn more
                </Button>
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Supports</span>
              {["USD", "ARS", "EUR", "GBP", "MXN", "CAD", "JPY", "CNY"].map(
                (c) => (
                  <Badge key={c} variant="outline" className="font-normal">
                    {c}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything you need to split fairly
            </h2>
            <p className="text-muted-foreground mt-2">
              Powerful, simple features designed for everyday life—roommates,
              trips, couples, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10">
                  <ReceiptText className="size-5 text-primary" />
                </div>
                <CardTitle>Fast expense entry</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Add who paid, what it was for, and split equally in seconds.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10">
                  <Globe className="size-5 text-primary" />
                </div>
                <CardTitle>Multi‑currency aware</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Purchases abroad? We convert using the latest rates so balances
                stay accurate.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10">
                  <Users2 className="size-5 text-primary" />
                </div>
                <CardTitle>Per‑connection balances</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                See exactly who owes whom at a glance for each connection.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10">
                  <Zap className="size-5 text-primary" />
                </div>
                <CardTitle>Real‑time & reliable</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Updates instantly across devices so everyone stays in sync.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10">
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <CardTitle>Secure by default</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Sign in securely and keep your data private.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10">
                  <Wallet className="size-5 text-primary" />
                </div>
                <CardTitle>Settle up easily</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Clear totals help you settle up however you prefer.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="text-muted-foreground mt-2">
              Three simple steps to stay in sync.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {["Create a connection", "Add expenses", "Settle up"].map(
              (title, index) => (
                <Card key={title}>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">
                      Step {index + 1}
                    </Badge>
                    <CardTitle className="mt-2">{title}</CardTitle>
                    <CardDescription>
                      {index === 0 &&
                        "Invite the people you share expenses with and keep balances in sync."}
                      {index === 1 &&
                        "Add expenses with payer, amount, and category to track fairly."}
                      {index === 2 &&
                        "See totals instantly and settle up however works best."}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ),
            )}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why people choose ExpenseMate
            </h2>
            <p className="text-muted-foreground mt-2">
              Built for real-world sharing with reliability and clarity at its
              core.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  Track who paid, split however you like, and keep an auditable
                  history.
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

        <section className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground mt-2">
              Quick answers to common questions about how ExpenseMate works.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="privacy">
              <AccordionTrigger>Is my expense data private?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Only people in your connections can see shared expenses,
                and we use secure authentication to keep your data safe.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="currencies">
              <AccordionTrigger>
                Do you support multiple currencies?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely. Add expenses in different currencies and we handle
                conversions so balances stay accurate.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="settle">
              <AccordionTrigger>How do settlements work?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                ExpenseMate shows clear totals for each connection so you can
                settle up however you prefer—cash, transfers, or otherwise.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pricing">
              <AccordionTrigger>
                How much does ExpenseMate cost?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It&apos;s completely free to use.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator className="mx-auto my-10 w-full max-w-6xl" />

        <section className="mx-auto mb-16 w-full max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Split expenses fairly without spreadsheets
          </h2>
          <p className="text-muted-foreground mt-3">
            Get started in minutes and keep everyone on the same page.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <SignInButton>
              <Button size="lg">Start now</Button>
            </SignInButton>
            <a href="#features">
              <Button variant="outline" size="lg">
                Explore features
              </Button>
            </a>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
