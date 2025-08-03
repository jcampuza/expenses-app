import type { Metadata } from "next";
import { PublicPageContent } from "./PublicPageContent";

export const metadata: Metadata = {
  title: {
    absolute: "ExpenseMate",
  },
};

export default async function PublicHome() {
  return <PublicPageContent />;
}
