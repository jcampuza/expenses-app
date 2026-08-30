import type { ParentProps } from "solid-js";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";

export function PublicLayout(props: ParentProps) {
  return (
    <div class="flex flex-col">
      <div class="flex min-h-screen flex-col">
        <Header />
        <div class="relative container mx-auto flex grow flex-col">
          {props.children}
        </div>
        <Footer />
      </div>
    </div>
  );
}
