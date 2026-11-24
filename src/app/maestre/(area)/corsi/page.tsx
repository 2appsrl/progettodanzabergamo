import type { Metadata } from "next";
import Link from "next/link";
import { Bottone } from "@/components/ui/Bottone";
import { IconaFreccia } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { stileCard } from "@/lib/colori";
import { getCorsi, getSedi } from "@/lib/dati";
import { etichettaEta, riassuntoLezioni } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Corsi e orari" };

export default async function CorsiMaestre() {
  const supabase = await supabaseServer();
  const [corsi, sedi] = await Promise.all([getCorsi(supabase), getSedi(supabase)]);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="titolo text-[56px] sm:text-[80px]">Corsi e orari</h1>
        <Bottone href="/maestre/corsi/nuovo" variante="magenta">Nuovo corso</Bottone>
      </div>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {corsi.map((c) => {
          const s = stileCard[c.colore];
          return (
            <li key={c.id}>
              <Link href={`/maestre/corsi/${c.id}`} className={`flex h-full items-center gap-4 rounded-card p-5 transition-transform hover:-translate-y-0.5 ${s.card}`}>
                <div className="min-w-0 flex-1">
                  <h2 className="font-titolo text-[30px] font-extrabold uppercase leading-none">{c.nome}</h2>
                  <p className="mt-1 font-semibold">{c.insegnante} · {sedi.find((x) => x.id === c.sede_id)?.nome ?? "Sede da scegliere"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill className={s.pillAccento}>{etichettaEta(c)}</Pill>
                    {riassuntoLezioni(c.lezioni).map((r) => <Pill key={r.giorni + r.orario} className={s.pill}>{r.giorni} {r.orario}</Pill>)}
                    {c.lezioni.length === 0 && <Pill className={s.pill}>Nessun orario</Pill>}
                    {!c.pubblicato && <Pill className="bg-white text-nero">Nascosto dal sito</Pill>}
                  </div>
                </div>
                <IconaFreccia className="shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
