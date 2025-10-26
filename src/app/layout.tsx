import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toaster";
import { RootProviders } from "@/app/RootProviders";
import "@/styles/globals.css";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/LoadingComponent";
import { ThemeProvider } from "@/hooks/use-theme";

export const metadata: Metadata = {
  title: {
    template: "%s | ExpenseMate",
    default: "ExpenseMate",
  },
  description: "Simple expense tracking app",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <html lang="en">
        <body>
          <Suspense fallback={<LoadingComponent />}>
            <RootProviders>
              {children}
              <Toaster />
            </RootProviders>
          </Suspense>
        </body>
      </html>
    </ThemeProvider>
  );
}
