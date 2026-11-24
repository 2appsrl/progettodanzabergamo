import type { Metadata } from "next";
import { SelettoreEta } from "@/components/pubblico/SelettoreEta";
import { getCorsi, getFasce, getSedi } from "@/lib/dati";

export const metadata: Metadata = { title: "Orari" };

// Stessa esperienza della home: scegli l'età e vedi corsi e settimana.
export default async function Orari() {
  const [fasce, corsi, sedi] = await Promise.all([getFasce(), getCorsi(), getSedi()]);
  return <SelettoreEta fasce={fasce} corsi={corsi} sedi={sedi} />;
}
