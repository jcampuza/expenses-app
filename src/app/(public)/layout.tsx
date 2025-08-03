import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="relative container mx-auto flex grow flex-col">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}
