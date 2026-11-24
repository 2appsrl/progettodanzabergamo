import type { Metadata } from "next";
import { GrigliaProdotti } from "@/components/pubblico/GrigliaProdotti";
import { TestataPagina } from "@/components/pubblico/TestataPagina";
import { getProdotti, getScuola } from "@/lib/dati";

export const metadata: Metadata = { title: "Merchandising" };

export default async function Merchandising() {
  const [prodotti, scuola] = await Promise.all([getProdotti(), getScuola()]);
  return (
    <>
      <TestataPagina colore="nero" titolo={<>Il nostro <span className="text-giallo">merch</span></>}>
        Felpe, t-shirt e accessori della scuola. Per taglie e disponibilità scrivici o chiedi in sede.
      </TestataPagina>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {prodotti.length === 0
          ? <p className="rounded-card bg-rosa p-6 text-[18px] font-medium">In arrivo.</p>
          : <GrigliaProdotti prodotti={prodotti} whatsapp={scuola.whatsapp} />}
      </div>
    </>
  );
}
