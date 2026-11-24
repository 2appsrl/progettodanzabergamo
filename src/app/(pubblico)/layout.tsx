import { BannerEsempio } from "@/components/pubblico/BannerEsempio";
import { BottoneWhatsApp } from "@/components/pubblico/BottoneWhatsApp";
import { Footer } from "@/components/pubblico/Footer";
import { Header } from "@/components/pubblico/Header";

// Cornice comune a tutte le pagine pubbliche: avviso demo, header, footer, WhatsApp.
export default function LayoutPubblico({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BannerEsempio />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottoneWhatsApp />
    </>
  );
}
