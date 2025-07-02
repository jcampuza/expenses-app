import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import "~/styles/globals.css";

import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/app/components/Header";
import Footer from "~/app/components/Footer";
import ConvexClientProvider from "~/components/ConvextAuthProvider";
import { ClerkProvider } from "@clerk/nextjs";

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
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ClerkProvider>
          <ConvexClientProvider>
            <div className="flex flex-col">
              <div className="flex min-h-screen flex-col">
                <Header />
                <div className="container relative mx-auto flex flex-grow flex-col">
                  {children}
                </div>
                <Footer />
              </div>
            </div>

            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
