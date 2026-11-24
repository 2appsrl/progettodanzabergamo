import { BannerEsempio } from "@/components/pubblico/BannerEsempio";
import { BottoneWhatsApp } from "@/components/pubblico/BottoneWhatsApp";
import { Footer } from "@/components/pubblico/Footer";
import { Header } from "@/components/pubblico/Header";

// I contenuti vengono riletti dal database al massimo ogni 5 minuti
// (e subito quando una maestra salva una modifica).
export const revalidate = 300;

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
