import type { Metadata } from "next";
import Link from "next/link";
import { eliminaEvento, salvaEvento } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { BottoneConferma } from "@/components/maestre/BottoneConferma";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { Pill } from "@/components/ui/Pill";
import { getCorsi } from "@/lib/dati";
import { oggiRoma } from "@/lib/genitori";
import { quando } from "@/lib/richieste";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Calendario" };

type Evento = { id: string; titolo: string; tipo: string; data: string; ora_inizio: string | null; ora_fine: string | null; luogo: string; descrizione: string; corso_id: string | null; pubblicato: boolean };
const TIPI = ["Evento", "Prova", "Saggio", "Stage", "Chiusura"];

function CampiEvento({ e, corsi }: { e?: Evento; corsi: { id: string; nome: string }[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {e && <input type="hidden" name="id" value={e.id} />}
      <label className="block font-bold sm:col-span-2">Titolo<input name="titolo" required minLength={2} maxLength={120} defaultValue={e?.titolo} className={campo} /></label>
      <label className="block font-bold">Tipo
        <select name="tipo" defaultValue={e?.tipo ?? "Evento"} className={campo}>{TIPI.map((t) => <option key={t}>{t}</option>)}</select>
      </label>
      <label className="block font-bold">Per chi
        <select name="destinatari" defaultValue={e?.corso_id ?? "tutti"} className={campo}>
          <option value="tutti">Tutta la scuola</option>
          {corsi.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label className="block font-bold">Giorno<input name="data" type="date" required defaultValue={e?.data} className={campo} /></label>
      <label className="block font-bold">Luogo<input name="luogo" maxLength={120} defaultValue={e?.luogo} className={campo} /></label>
      <label className="block font-bold">Ora di inizio <span className="font-medium">(vuota = tutto il giorno)</span><input name="ora_inizio" type="time" defaultValue={e?.ora_inizio?.slice(0, 5)} className={campo} /></label>
      <label className="block font-bold">Ora di fine<input name="ora_fine" type="time" defaultValue={e?.ora_fine?.slice(0, 5)} className={campo} /></label>
      <label className="block font-bold sm:col-span-2">Note<input name="descrizione" maxLength={300} defaultValue={e?.descrizione} className={campo} /></label>
      <label className="flex min-h-[56px] items-center gap-3 rounded-[18px] border-[3px] border-nero bg-white px-4 font-bold sm:col-span-2">
        <input type="checkbox" name="pubblicato" defaultChecked={e?.pubblicato ?? false} className="h-6 w-6 accent-[#d13583]" />Mostra anche sul sito pubblico (pagina Eventi)
      </label>
    </div>
  );
}

export default async function CalendarioMaestre({ searchParams }: { searchParams: Promise<{ salvato?: string; errore?: string }> }) {
  const supabase = await supabaseServer();
  const [corsi, esito, { data }] = await Promise.all([getCorsi(supabase), searchParams, supabase.from("eventi").select("*").order("data")]);
  const eventi = (data ?? []) as Evento[];
  const oggi = oggiRoma();
  const futuri = eventi.filter((e) => e.data >= oggi);
  const passati = eventi.filter((e) => e.data < oggi).reverse();
  const nomeCorso = new Map(corsi.map((c) => [c.id, c.nome]));

  const riga = (e: Evento) => (
    <li key={e.id}>
      <details className="rounded-card bg-rosa p-5">
        <summary className="min-h-[48px] cursor-pointer">
          <span className="font-titolo text-[30px] font-extrabold uppercase leading-none">{e.titolo}</span>
          <span className="mt-2 flex flex-wrap gap-2">
            <Pill className="bg-nero text-white">{e.tipo}</Pill>
            <Pill className="bg-giallo text-nero">{quando({ data_evento: e.data, ora_inizio: e.ora_inizio, ora_fine: e.ora_fine })} {e.data.slice(0, 4)}</Pill>
            <Pill className="bg-white text-nero">{e.corso_id ? nomeCorso.get(e.corso_id) ?? "Corso" : "Tutta la scuola"}</Pill>
            {e.pubblicato && <Pill className="bg-magenta text-white">Sul sito</Pill>}
          </span>
        </summary>
        <form action={salvaEvento} className="mt-5">
          <CampiEvento e={e} corsi={corsi} />
          <button type="submit" className={classiBottone("nero", "mt-6")}>Salva</button>
        </form>
        <form action={eliminaEvento} className="mt-4">
          <input type="hidden" name="id" value={e.id} />
          <BottoneConferma domanda={`Eliminare "${e.titolo}"? Non si può annullare.`} className="min-h-[48px] rounded-full border-[3px] border-nero px-6 font-bold hover:bg-nero hover:text-white">Elimina</BottoneConferma>
        </form>
      </details>
    </li>
  );

  return (
    <>
      <h1 className="titolo mb-6 text-[56px] sm:text-[80px]">Calendario</h1>
      <Avviso {...esito} />
      <p className="mb-6 rounded-[18px] bg-giallo px-4 py-3 font-medium">Qui metti prove, saggi, stage e chiusure: i genitori li vedono nel loro calendario. Le lezioni di ogni settimana si gestiscono in <Link href="/maestre/corsi" className="font-bold underline">Corsi e orari</Link>.</p>

      <details className="rounded-card border-[3px] border-nero bg-white p-5 sm:p-8" open={futuri.length === 0}>
        <summary className="titolo min-h-[48px] cursor-pointer text-[40px]">Aggiungi un evento</summary>
        <form action={salvaEvento} className="mt-5">
          <CampiEvento corsi={corsi} />
          <button type="submit" className={classiBottone("magenta", "mt-6")}>Aggiungi</button>
        </form>
      </details>

      <h2 className="titolo mt-8 text-[40px]">In programma</h2>
      {futuri.length === 0 && <p className="mt-3 rounded-card bg-rosa p-5 font-medium">Nessun evento in programma.</p>}
      <ul className="mt-3 space-y-3">{futuri.map(riga)}</ul>
      {passati.length > 0 && (
        <details className="mt-8">
          <summary className="titolo min-h-[48px] cursor-pointer text-[40px]">Passati ({passati.length})</summary>
          <ul className="mt-3 space-y-3">{passati.map(riga)}</ul>
        </details>
      )}
    </>
  );
}
