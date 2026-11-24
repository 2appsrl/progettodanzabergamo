import type { Metadata } from "next";
import Link from "next/link";
import { Bottone } from "@/components/ui/Bottone";
import { IconaFreccia } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { quando, scadenzaPassata, type Richiesta } from "@/lib/richieste";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Conferme" };

export default async function Richieste() {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("richieste").select("*, corsi(nome), risposte(count)").order("creata_il", { ascending: false });
  const richieste = (data ?? []) as (Richiesta & { corsi: { nome: string } | null; risposte: { count: number }[] })[];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="titolo text-[56px] sm:text-[80px]">Conferme</h1>
        <Bottone href="/maestre/richieste/nuova" variante="magenta">Nuova richiesta</Bottone>
      </div>
      {richieste.length === 0 && <p className="mt-6 rounded-card bg-rosa p-6 text-[18px] font-medium">Nessuna richiesta. Creane una e condividila nel gruppo WhatsApp: le risposte arrivano qui.</p>}
      <ul className="mt-6 space-y-3">
        {richieste.map((r) => {
          const finita = r.chiusa || scadenzaPassata(r.scadenza);
          return (
            <li key={r.id}>
              <Link href={`/maestre/richieste/${r.id}`} className={`flex items-center gap-4 rounded-card p-5 transition-transform hover:-translate-y-0.5 ${finita ? "bg-rosa text-nero" : "bg-magenta text-white"}`}>
                <div className="min-w-0 flex-1">
                  <h2 className="font-titolo text-[32px] font-extrabold uppercase leading-none">{r.titolo}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill className="bg-white text-nero">{r.tutta_la_scuola ? "Tutta la scuola" : r.corsi?.nome ?? "Corso eliminato"}</Pill>
                    {r.data_evento && <Pill className="bg-giallo text-nero">{quando(r)}</Pill>}
                    <Pill className="bg-nero text-white">{r.risposte[0]?.count ?? 0} risposte</Pill>
                    {finita && <Pill className="bg-white text-nero">Chiusa</Pill>}
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
