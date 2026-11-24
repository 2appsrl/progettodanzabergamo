import type { Metadata } from "next";
import { TestataPagina } from "@/components/pubblico/TestataPagina";
import { Bottone } from "@/components/ui/Bottone";
import { FotoSegnaposto } from "@/components/ui/FotoSegnaposto";
import { IconaFreccia } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { stileCard } from "@/lib/colori";
import { getCorsi, getMaestre, getScuola } from "@/lib/dati";

export const metadata: Metadata = { title: "Chi siamo" };

export default async function ChiSiamo() {
  const [maestre, corsi, scuola] = await Promise.all([getMaestre(), getCorsi(), getScuola()]);
  return (
    <>
      <TestataPagina titolo={<>Chi <span className="text-giallo">siamo</span></>}>{scuola.motto}</TestataPagina>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6">
        {maestre.map((m, i) => {
          const s = stileCard[m.colore];
          return (
            <article key={m.id} className={`grid overflow-hidden rounded-card md:grid-cols-2 ${s.card} ${s.scuro ? "su-scuro" : ""}`}>
              <FotoSegnaposto colore={i ? "nero" : "rosa"} variante={i + 1} className={`aspect-[4/3] md:aspect-auto md:min-h-[420px] ${i % 2 ? "md:order-2" : ""}`} />
              <div className="p-6 sm:p-10">
                <Pill className={s.pillAccento} ruota={-3}>{m.discipline}</Pill>
                <h2 className="titolo titolo-sezione mt-4">{m.nome}</h2>
                <p className="mt-4 text-[19px] font-medium">{m.bio}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {corsi.filter((c) => c.insegnante === m.nome).map((c) => (
                    <Pill key={c.id} className={s.pill}>{c.nome}</Pill>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
        <Bottone href="/prenota-una-prova" variante="nero" className="min-h-[60px] text-[26px]">Prenota una prova <IconaFreccia /></Bottone>
      </div>
    </>
  );
}
