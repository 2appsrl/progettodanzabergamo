import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eliminaAllieva, salvaAllieva } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { BottoneConferma } from "@/components/maestre/BottoneConferma";
import { CampiAllieva } from "@/components/maestre/CampiAllieva";
import { classiBottone } from "@/components/ui/Bottone";
import { getCorsi } from "@/lib/dati";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Allieva" };

type Riga = { id: string; nome: string; cognome: string; data_nascita: string | null; attivo: boolean; famiglie: { nome_genitore: string; telefono: string; email: string | null } | null; iscrizioni: { corso_id: string }[] };

export default async function ModificaAllieva({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ errore?: string }> }) {
  const [{ id }, esito] = await Promise.all([params, searchParams]);
  const supabase = await supabaseServer();
  const [corsi, { data }] = await Promise.all([
    getCorsi(supabase),
    supabase.from("allievi").select("id, nome, cognome, data_nascita, attivo, famiglie(nome_genitore, telefono, email), iscrizioni(corso_id)").eq("id", id).maybeSingle(),
  ]);
  const a = data as unknown as Riga | null;
  if (!a) notFound();

  return (
    <>
      <Link href="/maestre/allieve" className="inline-flex min-h-[44px] items-center font-bold underline underline-offset-4">Tutte le allieve</Link>
      <h1 className="titolo mb-6 mt-2 text-[52px] sm:text-[72px]">{a.nome} {a.cognome}</h1>
      <Avviso {...esito} />
      <form action={salvaAllieva} className="rounded-card bg-rosa p-5 sm:p-8">
        <input type="hidden" name="id" value={a.id} />
        <CampiAllieva corsi={corsi} valori={{ nome: a.nome, cognome: a.cognome, data_nascita: a.data_nascita, genitore: a.famiglie?.nome_genitore, telefono: a.famiglie?.telefono, email: a.famiglie?.email, corsi: a.iscrizioni.map((i) => i.corso_id) }} />
        <label className="mt-5 flex min-h-[56px] items-center gap-3 rounded-[18px] border-[3px] border-nero bg-white px-4 font-bold">
          <input type="checkbox" name="attivo" defaultChecked={a.attivo} className="h-6 w-6 accent-[#d13583]" />Frequenta quest&apos;anno
        </label>
        <button type="submit" className={classiBottone("nero", "mt-6 min-h-[60px] text-[24px]")}>Salva</button>
      </form>
      <form action={eliminaAllieva} className="mt-8">
        <input type="hidden" name="id" value={a.id} />
        <BottoneConferma domanda={`Eliminare ${a.nome} ${a.cognome} con tutte le sue risposte? Non si può annullare.`} className="min-h-[48px] rounded-full border-[3px] border-nero px-6 font-bold hover:bg-nero hover:text-white">Elimina questa allieva</BottoneConferma>
      </form>
    </>
  );
}
