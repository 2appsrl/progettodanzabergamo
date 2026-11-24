import type { Metadata } from "next";
import Link from "next/link";
import { creaRichiesta } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { getCorsi } from "@/lib/dati";
import { OPZIONI_PREDEFINITE } from "@/lib/richieste";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nuova richiesta" };

export default async function NuovaRichiesta({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const supabase = await supabaseServer();
  const [corsi, esito, { data: { user } }] = await Promise.all([getCorsi(supabase), searchParams, supabase.auth.getUser()]);
  const { data: maestra } = await supabase.from("maestre").select("nome").eq("email", (user?.email ?? "").toLowerCase()).maybeSingle();

  return (
    <>
      <Link href="/maestre/richieste" className="inline-flex min-h-[44px] items-center font-bold underline underline-offset-4">Tutte le conferme</Link>
      <h1 className="titolo mb-6 mt-2 text-[52px] sm:text-[72px]">Nuova richiesta</h1>
      <Avviso {...esito} />
      <form action={creaRichiesta} className="rounded-card bg-rosa p-5 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block font-bold sm:col-span-2">Titolo
            <input name="titolo" required minLength={2} maxLength={120} placeholder="Es. Progetto natalizio a Monterosso" className={campo} />
          </label>
          <label className="block font-bold sm:col-span-2">A chi è rivolta
            <select name="destinatari" required defaultValue="" className={campo}>
              <option value="" disabled>Scegli</option>
              <option value="tutti">Tutta la scuola</option>
              {corsi.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="block font-bold sm:col-span-2">Messaggio per le famiglie
            <textarea name="messaggio" rows={7} maxLength={3000} placeholder="Care famiglie, …" className={`${campo} py-3`} />
          </label>
          <label className="block font-bold">Giorno dell&apos;evento
            <input name="data_evento" type="date" className={campo} />
          </label>
          <label className="block font-bold">Luogo
            <input name="luogo" maxLength={120} className={campo} />
          </label>
          <label className="block font-bold">Ora di inizio<input name="ora_inizio" type="time" className={campo} /></label>
          <label className="block font-bold">Ora di fine<input name="ora_fine" type="time" className={campo} /></label>
          <label className="block font-bold">Risposte possibili <span className="font-medium">(una per riga)</span>
            <textarea name="opzioni" rows={3} required defaultValue={OPZIONI_PREDEFINITE.join("\n")} className={`${campo} py-3`} />
          </label>
          <div className="space-y-5">
            <label className="block font-bold">Rispondere entro il <span className="font-medium">(facoltativo)</span>
              <input name="scadenza" type="date" className={campo} />
            </label>
            <label className="block font-bold">Firma
              <input name="firma" maxLength={40} defaultValue={maestra?.nome ?? ""} className={campo} />
            </label>
          </div>
        </div>
        <button type="submit" className={classiBottone("nero", "mt-7 min-h-[60px] w-full text-[24px] sm:w-auto")}>Crea la richiesta</button>
      </form>
    </>
  );
}
