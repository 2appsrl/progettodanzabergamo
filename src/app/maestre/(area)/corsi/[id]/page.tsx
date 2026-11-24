import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aggiungiLezione, eliminaCorso, eliminaLezione, salvaCorso } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { BottoneConferma } from "@/components/maestre/BottoneConferma";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { getCorsoPerId, getSedi } from "@/lib/dati";
import { GIORNI } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Corso" };

const colori = [["magenta", "bg-magenta"], ["giallo", "bg-giallo"], ["nero", "bg-nero"], ["rosa", "bg-rosa"]];
const spunta = "flex min-h-[56px] items-center gap-3 rounded-[18px] border-[3px] border-nero bg-white px-4 font-bold";

export default async function ModificaCorso({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ salvato?: string; errore?: string }>;
}) {
  const [{ id }, esito] = await Promise.all([params, searchParams]);
  const supabase = await supabaseServer();
  const nuovo = id === "nuovo";
  const [corso, sedi] = await Promise.all([nuovo ? null : getCorsoPerId(supabase, id), getSedi(supabase)]);
  if (!nuovo && !corso) notFound();

  return (
    <>
      <Link href="/maestre/corsi" className="inline-flex min-h-[44px] items-center font-bold underline underline-offset-4">Tutti i corsi</Link>
      <h1 className="titolo mb-6 mt-2 text-[52px] sm:text-[72px]">{corso?.nome ?? "Nuovo corso"}</h1>
      <Avviso {...esito} />

      <form action={salvaCorso} className="rounded-card bg-rosa p-5 sm:p-8">
        <input type="hidden" name="id" value={corso?.id ?? ""} />
        <input type="hidden" name="slug" value={corso?.slug ?? ""} />
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block font-bold">Nome del corso
            <input name="nome" required maxLength={60} defaultValue={corso?.nome} className={campo} />
          </label>
          <label className="block font-bold">Disciplina
            <input name="disciplina" required maxLength={40} defaultValue={corso?.disciplina} placeholder="Danza classica, Hip hop…" className={campo} />
          </label>
          <label className="block font-bold">Insegnante
            <input name="insegnante" maxLength={60} defaultValue={corso?.insegnante} className={campo} />
          </label>
          <label className="block font-bold">Sede
            <select name="sede_id" defaultValue={corso?.sede_id ?? ""} className={campo}>
              <option value="">Da scegliere</option>
              {sedi.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </label>
          <label className="block font-bold">Età minima
            <input name="eta_min" type="number" inputMode="numeric" required min={0} max={99} defaultValue={corso?.eta_min ?? 3} className={campo} />
          </label>
          <label className="block font-bold">Età massima <span className="font-medium">(vuoto = senza limite)</span>
            <input name="eta_max" type="number" inputMode="numeric" min={0} max={99} defaultValue={corso?.eta_max ?? ""} className={campo} />
          </label>
          <label className="block font-bold sm:col-span-2">Descrizione breve
            <textarea name="descrizione" rows={3} maxLength={400} defaultValue={corso?.descrizione} className={`${campo} py-3`} />
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="font-bold">Colore della card</legend>
            <div className="mt-1.5 flex flex-wrap gap-3">
              {colori.map(([nome, classe]) => (
                <label key={nome} className="flex min-h-[56px] cursor-pointer items-center gap-2 rounded-[18px] border-[3px] border-nero bg-white px-4 font-bold capitalize has-[:checked]:bg-nero has-[:checked]:text-white">
                  <input type="radio" name="colore" value={nome} defaultChecked={(corso?.colore ?? "magenta") === nome} className="sr-only" />
                  <span className={`h-7 w-7 rounded-full border-2 border-white ${classe}`} />{nome}
                </label>
              ))}
            </div>
          </fieldset>
          <label className={spunta}>
            <input type="checkbox" name="pubblicato" defaultChecked={corso?.pubblicato ?? true} className="h-6 w-6 accent-[#d13583]" />Visibile sul sito
          </label>
          <label className={spunta}>
            <input type="checkbox" name="da_confermare" defaultChecked={corso?.da_confermare ?? false} className="h-6 w-6 accent-[#d13583]" />Mostra il badge &quot;Da confermare&quot;
          </label>
        </div>
        <button type="submit" className={classiBottone("nero", "mt-7 min-h-[60px] w-full text-[24px] sm:w-auto")}>{nuovo ? "Crea il corso" : "Salva le modifiche"}</button>
      </form>

      {corso && (
        <>
          <section className="mt-8 rounded-card bg-giallo p-5 sm:p-8">
            <h2 className="titolo text-[44px]">Giorni e orari</h2>
            <ul className="mt-4 space-y-2">
              {corso.lezioni.length === 0 && <li className="font-medium">Nessun orario inserito.</li>}
              {corso.lezioni.map((l) => (
                <li key={l.id} className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-2">
                  <span className="flex-1 text-[18px] font-bold">{GIORNI[l.giorno]} <span className="tabular-nums">{l.inizio}–{l.fine}</span></span>
                  <form action={eliminaLezione}>
                    <input type="hidden" name="id" value={l.id} /><input type="hidden" name="corso_id" value={corso.id} />
                    <BottoneConferma domanda={`Togliere la lezione di ${GIORNI[l.giorno]} ${l.inizio}?`} className="min-h-[44px] rounded-full border-[3px] border-nero px-4 font-bold hover:bg-nero hover:text-white">Togli</BottoneConferma>
                  </form>
                </li>
              ))}
            </ul>
            <form action={aggiungiLezione} className="mt-5 grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
              <input type="hidden" name="corso_id" value={corso.id} />
              <label className="block font-bold">Giorno
                <select name="giorno" className={campo}>{[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{GIORNI[g]}</option>)}</select>
              </label>
              <label className="block font-bold">Inizio<input name="ora_inizio" type="time" required className={campo} /></label>
              <label className="block font-bold">Fine<input name="ora_fine" type="time" required className={campo} /></label>
              <button type="submit" className={classiBottone("nero", "min-h-[56px]")}>Aggiungi</button>
            </form>
          </section>

          <form action={eliminaCorso} className="mt-8">
            <input type="hidden" name="id" value={corso.id} />
            <BottoneConferma domanda={`Eliminare definitivamente il corso "${corso.nome}" con i suoi orari? Non si può annullare.`} className="min-h-[48px] rounded-full border-[3px] border-nero px-6 font-bold hover:bg-nero hover:text-white">
              Elimina questo corso
            </BottoneConferma>
          </form>
        </>
      )}
    </>
  );
}
