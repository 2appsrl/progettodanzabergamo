import type { Metadata } from "next";
import { aggiornaRichiesta } from "@/app/maestre/azioni";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { IconaWhatsApp } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { dataOra, linkWhatsApp, numeroWhatsApp } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";
import type { RichiestaProva } from "@/lib/tipi";

export const metadata: Metadata = { title: "Richieste di prova" };

const stati = { nuova: ["Nuova", "bg-giallo text-nero"], contattata: ["Contattata", "bg-rosa text-nero"], chiusa: ["Chiusa", "bg-nero text-white"] } as const;

export default async function Prove() {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("richieste_prova").select("*, corsi(nome)").order("creata_il", { ascending: false }).limit(200);
  const richieste = (data ?? []) as (RichiestaProva & { corsi: { nome: string } | null })[];

  return (
    <>
      <h1 className="titolo text-[56px] sm:text-[80px]">Richieste di prova</h1>
      {richieste.length === 0 && <p className="mt-6 rounded-card bg-rosa p-6 text-[18px] font-medium">Ancora nessuna richiesta. Arriveranno qui quando qualcuno compila il modulo sul sito.</p>}
      <ul className="mt-6 space-y-4">
        {richieste.map((r) => (
          <li key={r.id} className="rounded-card border-[3px] border-nero bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-titolo text-[32px] font-extrabold uppercase leading-none">{r.nome_allievo}, {r.eta} anni</h2>
                <p className="mt-1 font-semibold">{r.corsi?.nome ?? "Corso da consigliare"} · genitore: {r.nome_genitore}</p>
                <p className="text-[15px] font-medium text-nero/70">Ricevuta il {dataOra(r.creata_il)}</p>
              </div>
              <Pill className={stati[r.stato][1]}>{stati[r.stato][0]}</Pill>
            </div>
            <a
              href={linkWhatsApp(numeroWhatsApp(r.telefono), `Ciao ${r.nome_genitore}, siamo di Progetto Danza Bergamo: abbiamo ricevuto la richiesta di prova per ${r.nome_allievo}.`)}
              target="_blank" rel="noopener noreferrer" className={classiBottone("magenta", "mt-4 w-full sm:w-auto")}
            >
              <IconaWhatsApp /> Scrivi a {r.telefono}
            </a>
            <form action={aggiornaRichiesta} className="mt-4 grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
              <input type="hidden" name="id" value={r.id} />
              <label className="block font-bold">Stato
                <select name="stato" defaultValue={r.stato} className={campo}>
                  {Object.entries(stati).map(([v, [nome]]) => <option key={v} value={v}>{nome}</option>)}
                </select>
              </label>
              <label className="block font-bold">Note (le vedete solo voi)
                <input name="note_maestre" maxLength={300} defaultValue={r.note_maestre} className={campo} />
              </label>
              <button type="submit" className={classiBottone("nero", "min-h-[56px]")}>Salva</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
