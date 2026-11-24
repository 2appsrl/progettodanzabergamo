import type { Metadata } from "next";
import { ModuloProva } from "@/components/pubblico/ModuloProva";
import { TestataPagina } from "@/components/pubblico/TestataPagina";
import { getCorsi } from "@/lib/dati";
import { etichettaEta } from "@/lib/formato";

export const metadata: Metadata = { title: "Prenota una prova" };

export default async function PrenotaProva({ searchParams }: { searchParams: Promise<{ corso?: string }> }) {
  const [corsi, { corso }] = await Promise.all([getCorsi(), searchParams]);
  return (
    <>
      <TestataPagina titolo={<>Prenota una <span className="text-giallo">prova</span></>}>Compila il modulo: ti ricontattiamo noi.</TestataPagina>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <ModuloProva
          corsi={corsi.map((c) => ({ slug: c.slug, nome: c.nome, eta: etichettaEta(c) }))}
          corsoIniziale={corsi.some((c) => c.slug === corso) ? corso : undefined}
        />
      </div>
    </>
  );
}
