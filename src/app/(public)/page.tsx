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
import { SignInButton } from "@clerk/nextjs";
import {
  Globe,
  ReceiptText,
  ShieldCheck,
  Users2,
  Wallet,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "ExpenseMate",
  },
};

export default async function PublicHome() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pt-16 sm:pt-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl" />
        <div className="flex flex-col items-center text-center">
          <Image
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
            currencies, and keep a clear running total with the people you share
            costs with. Fast, private, and easy—no spreadsheets needed.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <SignInButton>
              <Button size="lg">Get started free</Button>
            </SignInButton>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                Learn more
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Supports</span>
            {["USD", "ARS", "EUR", "GBP", "MXN", "CAD", "JPY", "CNY"].map((c) => (
              <Badge key={c} variant="outline" className="font-normal">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
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

      {/* How it works */}
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
                      "Invite a friend or partner to pair with you."}
                    {index === 1 &&
                      "Log what was paid, by whom, and we track the rest."}
                    {index === 2 &&
                      "When it’s time to square up, your totals are clear."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ),
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Loved by tidy spenders
          </h2>
          <p className="text-muted-foreground mt-2">
            Real stories from real people who split without stress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              quote:
                "The cleanest way we’ve found to keep our roommate costs fair.",
              author: "Maya & Jordan",
            },
            {
              quote:
                "We traveled across Europe and never touched a spreadsheet.",
              author: "Alex & Priya",
            },
          ].map((t) => (
            <Card key={t.author}>
              <CardHeader>
                <CardDescription className="text-base">
                  “{t.quote}”
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm font-medium">
                {t.author}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mt-2">
            Quick answers about using ExpenseMate.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible>
            <AccordionItem value="free">
              <AccordionTrigger>Is it free?</AccordionTrigger>
              <AccordionContent>
                ExpenseMate is currently free. If that changes in the future,
                we&apos;ll give you a clear heads-up first. There will always be
                a free tier.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="split">
              <AccordionTrigger>How do we split expenses?</AccordionTrigger>
              <AccordionContent>
                Create a connection with the other person, add an expense, and
                split equally by default. Balances update instantly so you both
                see who owes what.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="currencies">
              <AccordionTrigger>
                Does it work with different currencies?
              </AccordionTrigger>
              <AccordionContent>
                Yes. If an expense is in another currency, we convert using the
                latest available rates so totals stay fair. We support USD, ARS,
                EUR, GBP, MXN, CAD, JPY, and CNY.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="accounts">
              <AccordionTrigger>
                Do both people need an account?
              </AccordionTrigger>
              <AccordionContent>
                Yes. Each person signs in and you connect with each other to
                share a running balance.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="rounded-2xl border bg-card/50 p-6 text-center sm:p-10">
          <h3 className="mb-2 text-2xl font-bold sm:text-3xl">
            Ready to split fairly?
          </h3>
          <p className="text-muted-foreground mb-6">
            Create your first connection and add an expense in under a minute.
          </p>
          <SignInButton>
            <Button size="lg">Create your account</Button>
          </SignInButton>
        </div>
      </section>
    </div>
  );
}
