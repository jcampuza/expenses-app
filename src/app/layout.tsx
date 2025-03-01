import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/app/components/Header";
import Footer from "~/app/components/Footer";

export const metadata: Metadata = {
  title: "ExpenseMate",
  description: "Simple expense tracking app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <TRPCReactProvider>
            <div className="flex flex-col">
              <div className="flex min-h-screen flex-col">
                <Header />
                <div className="container relative mx-auto flex flex-grow flex-col">
                  {children}
                </div>
                <Footer />
              </div>
            </div>
          </TRPCReactProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
