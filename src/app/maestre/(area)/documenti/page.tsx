import type { Metadata } from "next";
import { creaDocumento, eliminaDocumento } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { BottoneConferma } from "@/components/maestre/BottoneConferma";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { Pill } from "@/components/ui/Pill";
import { getCorsi } from "@/lib/dati";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Documenti" };

type Documento = { id: string; titolo: string; categoria: string; corso_id: string | null; file_nome: string | null; link: string | null };
const CATEGORIE = ["Regolamento", "Moduli", "Costumi", "Musiche", "Altro"];

export default async function DocumentiMaestre({ searchParams }: { searchParams: Promise<{ salvato?: string; errore?: string }> }) {
  const supabase = await supabaseServer();
  const [corsi, esito, { data }] = await Promise.all([getCorsi(supabase), searchParams, supabase.from("documenti").select("*").order("categoria").order("creato_il", { ascending: false })]);
  const documenti = (data ?? []) as Documento[];
  const nomeCorso = new Map(corsi.map((c) => [c.id, c.nome]));
  return (
    <>
      <h1 className="titolo mb-6 text-[56px] sm:text-[80px]">Documenti</h1>
      <Avviso {...esito} />
      <details className="rounded-card bg-rosa p-5 sm:p-8" open={documenti.length === 0}>
        <summary className="titolo min-h-[48px] cursor-pointer text-[40px]">Aggiungi un documento</summary>
        <form action={creaDocumento} className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block font-bold sm:col-span-2">Titolo<input name="titolo" required minLength={2} maxLength={120} placeholder="Es. Regolamento della scuola" className={campo} /></label>
          <label className="block font-bold">Categoria
            <select name="categoria" defaultValue="Regolamento" className={campo}>{CATEGORIE.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="block font-bold">Per chi
            <select name="destinatari" defaultValue="tutti" className={campo}>
              <option value="tutti">Tutta la scuola</option>
              {corsi.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="block font-bold">File <span className="font-medium">(PDF, foto o MP3, max 5 MB)</span>
            <input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,.m4a" className={`${campo} py-3 text-[16px] file:mr-3 file:rounded-full file:border-0 file:bg-nero file:px-4 file:py-2 file:font-bold file:text-white`} />
          </label>
          <label className="block font-bold">Oppure un link <span className="font-medium">(es. Drive, YouTube, Spotify)</span>
            <input name="link" type="url" inputMode="url" maxLength={500} placeholder="https://" className={campo} />
          </label>
          <button type="submit" className={classiBottone("nero", "sm:w-fit")}>Aggiungi</button>
        </form>
      </details>

      <ul className="mt-6 space-y-2">
        {documenti.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 rounded-[22px] border-[3px] border-nero bg-white px-4 py-3">
            <div className="min-w-0 flex-1 basis-[200px]">
              <p className="text-[19px] font-bold">{d.titolo}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Pill className="bg-giallo text-[13px] text-nero">{d.categoria}</Pill>
                <Pill className="bg-rosa text-[13px] text-nero">{d.corso_id ? nomeCorso.get(d.corso_id) ?? "Corso" : "Tutta la scuola"}</Pill>
              </div>
            </div>
            <a href={d.file_nome ? `/file/documento/${d.id}` : d.link!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center rounded-full bg-nero px-5 font-bold text-white">Apri</a>
            <form action={eliminaDocumento}>
              <input type="hidden" name="id" value={d.id} />
              <BottoneConferma domanda={`Eliminare "${d.titolo}"?`} className="min-h-[48px] px-2 text-[15px] font-bold underline underline-offset-4">Elimina</BottoneConferma>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
