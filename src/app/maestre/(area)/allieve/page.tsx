import type { Metadata } from "next";
import Link from "next/link";
import { importaAllieve, salvaAllieva } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { CampiAllieva } from "@/components/maestre/CampiAllieva";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { IconaFreccia } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { getCorsi } from "@/lib/dati";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Allieve e famiglie" };

type Riga = { id: string; nome: string; cognome: string; attivo: boolean; famiglie: { nome_genitore: string; telefono: string } | null; iscrizioni: { corso_id: string }[]; consensi: { concesso: boolean; registrato_il: string }[] };

export default async function Allieve({ searchParams }: { searchParams: Promise<{ salvato?: string; errore?: string; messaggio?: string }> }) {
  const supabase = await supabaseServer();
  const [corsi, esito, { data }] = await Promise.all([
    getCorsi(supabase), searchParams,
    supabase.from("allievi").select("id, nome, cognome, attivo, famiglie(nome_genitore, telefono), iscrizioni(corso_id), consensi(concesso, registrato_il)").order("cognome").order("nome"),
  ]);
  const allieve = (data ?? []) as unknown as Riga[];
  const nomeCorso = new Map(corsi.map((c) => [c.id, c.nome]));

  return (
    <>
      <h1 className="titolo mb-6 text-[52px] sm:text-[80px]">Allieve e famiglie</h1>
      <Avviso {...esito} />
      {esito.messaggio && <p role="status" className="mb-5 rounded-[18px] bg-giallo px-4 py-3 font-bold">{esito.messaggio}</p>}

      <p className="mb-3 font-bold">{allieve.length} in elenco</p>
      <ul className="grid gap-2 md:grid-cols-2">
        {allieve.map((a) => (
          <li key={a.id}>
            <Link href={`/maestre/allieve/${a.id}`} className="flex h-full items-center gap-3 rounded-[22px] border-[3px] border-nero bg-white px-4 py-3 hover:bg-rosa">
              <div className="min-w-0 flex-1">
                <p className="text-[19px] font-bold">{a.cognome} {a.nome}</p>
                <p className="text-[15px] font-medium text-nero/70">{a.famiglie?.nome_genitore || "Genitore non indicato"}{a.famiglie?.telefono ? ` · ${a.famiglie.telefono}` : ""}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.iscrizioni.map((i) => <Pill key={i.corso_id} className="bg-rosa text-[13px] text-nero">{nomeCorso.get(i.corso_id) ?? "Corso"}</Pill>)}
                  {a.iscrizioni.length === 0 && <Pill className="bg-giallo text-[13px] text-nero">Nessun corso</Pill>}
                  {(() => {
                    const ultimo = [...a.consensi].sort((x, y) => y.registrato_il.localeCompare(x.registrato_il))[0];
                    return <Pill className={`text-[13px] ${ultimo?.concesso ? "bg-nero text-white" : "bg-white text-nero border-2 border-nero"}`}>Foto: {ultimo ? (ultimo.concesso ? "sì" : "no") : "non scelto"}</Pill>;
                  })()}
                  {!a.attivo && <Pill className="bg-nero text-[13px] text-white">Non attiva</Pill>}
                </div>
              </div>
              <IconaFreccia className="shrink-0" />
            </Link>
          </li>
        ))}
      </ul>

      <details className="mt-8 rounded-card bg-rosa p-5 sm:p-8" open={allieve.length === 0}>
        <summary className="titolo min-h-[48px] cursor-pointer text-[40px]">Aggiungi un&apos;allieva</summary>
        <form action={salvaAllieva} className="mt-5">
          <CampiAllieva corsi={corsi} />
          <button type="submit" className={classiBottone("nero", "mt-6")}>Aggiungi</button>
        </form>
      </details>

      <details className="mt-4 rounded-card bg-giallo p-5 sm:p-8">
        <summary className="titolo min-h-[48px] cursor-pointer text-[40px]">Importa un elenco</summary>
        <form action={importaAllieve} className="mt-4">
          <p className="font-medium">Incolla qui l&apos;elenco copiato da Excel o scritto a mano: una riga per allieva, con le colonne in quest&apos;ordine separate da punto e virgola.</p>
          <p className="mt-2 rounded-[14px] bg-white px-3 py-2 font-mono text-[14px]">nome ; cognome ; genitore ; telefono ; corsi separati da | ; email</p>
          <label className="mt-4 block font-bold">Elenco
            <textarea name="elenco" rows={6} required placeholder={"Giulia;Rossi;Maria Rossi;3331234567;Classica 1|Hip hop junior;maria@email.it"} className={`${campo} py-3 font-mono text-[15px]`} />
          </label>
          <p className="mt-2 text-[15px] font-medium">Chi ha lo stesso telefono finisce nella stessa famiglia. I nomi dei corsi devono essere scritti come nel sito.</p>
          <button type="submit" className={classiBottone("nero", "mt-5")}>Importa</button>
        </form>
      </details>
    </>
  );
}
