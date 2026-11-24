import type { Metadata } from "next";
import Link from "next/link";
import { Bottone } from "@/components/ui/Bottone";
import { IconaFreccia, IconaGraffetta } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { dataOra } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Avvisi" };

type Riga = { id: string; titolo: string; creato_il: string; tutta_la_scuola: boolean; allegato_nome: string | null; corsi: { nome: string } | null; letture_avvisi: { count: number }[] };

export default async function Avvisi() {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("avvisi").select("id, titolo, creato_il, tutta_la_scuola, allegato_nome, corsi(nome), letture_avvisi(count)").order("creato_il", { ascending: false });
  const avvisi = (data ?? []) as unknown as Riga[];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="titolo text-[56px] sm:text-[80px]">Avvisi</h1>
        <Bottone href="/maestre/avvisi/nuovo" variante="magenta">Nuovo avviso</Bottone>
      </div>
      {avvisi.length === 0 && <p className="mt-6 rounded-card bg-rosa p-6 text-[18px] font-medium">Nessun avviso. Scrivine uno: i genitori lo trovano nella loro area e, se vuoi, ricevono una notifica.</p>}
      <ul className="mt-6 space-y-3">
        {avvisi.map((a) => (
          <li key={a.id}>
            <Link href={`/maestre/avvisi/${a.id}`} className="flex items-center gap-4 rounded-card bg-giallo p-5 transition-transform hover:-translate-y-0.5">
              <div className="min-w-0 flex-1">
                <h2 className="font-titolo text-[32px] font-extrabold uppercase leading-none">{a.titolo}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill className="bg-white text-nero">{a.tutta_la_scuola ? "Tutta la scuola" : a.corsi?.nome ?? "Corso eliminato"}</Pill>
                  <Pill className="bg-white text-nero">{dataOra(a.creato_il)}</Pill>
                  <Pill className="bg-nero text-white">Letto da {a.letture_avvisi[0]?.count ?? 0}</Pill>
                  {a.allegato_nome && <Pill className="bg-magenta text-white"><IconaGraffetta width={15} height={15} />allegato</Pill>}
                </div>
              </div>
              <IconaFreccia className="shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
