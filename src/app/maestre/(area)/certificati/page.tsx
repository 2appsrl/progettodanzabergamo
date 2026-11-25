import type { Metadata } from "next";
import { eliminaCertificato, salvaCertificato } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { BottoneConferma } from "@/components/maestre/BottoneConferma";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { IconaGraffetta, IconaWhatsApp } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { coloreStato, dataBreve, etichettaStato, giorniAllaScadenza, statoCertificato, ultimoPerAllieva, type Certificato, type StatoCertificato } from "@/lib/certificati";
import { linkWhatsApp, numeroWhatsApp } from "@/lib/formato";
import { origineSito } from "@/lib/origine";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Certificati medici" };

type Allieva = { id: string; nome: string; cognome: string; famiglie: { nome_genitore: string; telefono: string } | null };
const ORDINE: StatoCertificato[] = ["scaduto", "in_scadenza", "mancante", "valido"];

export default async function Certificati({ searchParams }: { searchParams: Promise<{ salvato?: string; errore?: string }> }) {
  const supabase = await supabaseServer();
  const [esito, { data: a }, { data: c }, origine] = await Promise.all([
    searchParams,
    supabase.from("allievi").select("id, nome, cognome, famiglie(nome_genitore, telefono)").eq("attivo", true).order("cognome").order("nome"),
    supabase.from("certificati").select("id, allievo_id, scadenza, file_nome, caricato_il"),
    origineSito(),
  ]);
  const allieve = (a ?? []) as unknown as Allieva[];
  const ultimi = ultimoPerAllieva((c ?? []) as Certificato[]);
  const righe = allieve.map((x) => ({ ...x, cert: ultimi.get(x.id), stato: statoCertificato(ultimi.get(x.id)) }))
    .sort((x, y) => ORDINE.indexOf(x.stato) - ORDINE.indexOf(y.stato) || (x.cert?.scadenza ?? "").localeCompare(y.cert?.scadenza ?? ""));
  const conta = (s: StatoCertificato) => righe.filter((r) => r.stato === s).length;

  const messaggio = (r: (typeof righe)[number]) => {
    const saluto = r.famiglie?.nome_genitore ? `Ciao ${r.famiglie.nome_genitore.split(" ")[0]}` : "Ciao";
    const cosa = r.stato === "mancante" ? `ci manca il certificato medico di ${r.nome}`
      : r.stato === "scaduto" ? `il certificato medico di ${r.nome} è scaduto il ${dataBreve(r.cert!.scadenza)}`
      : `il certificato medico di ${r.nome} scade il ${dataBreve(r.cert!.scadenza)}`;
    return `${saluto}, ${cosa}. Puoi caricare quello nuovo qui:\n${origine}/genitori/documenti\nGrazie!`;
  };

  return (
    <>
      <h1 className="titolo mb-6 text-[52px] sm:text-[80px]">Certificati medici</h1>
      <Avviso {...esito} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ORDINE.map((s) => (
          <div key={s} className={`rounded-card p-4 ${s === "valido" ? "border-[3px] border-nero bg-white" : coloreStato[s]}`}>
            <span className="titolo block text-[64px]">{conta(s)}</span>
            <span className="font-titolo text-[22px] font-extrabold uppercase leading-none">{s === "mancante" ? "Mancanti" : s === "scaduto" ? "Scaduti" : s === "valido" ? "Validi" : "In scadenza"}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[14px] font-medium text-nero/70">&quot;In scadenza&quot; = entro 30 giorni. Il genitore vede l&apos;avviso nella sua area e può caricare da solo il nuovo certificato.</p>

      <details className="mt-6 rounded-card bg-rosa p-5 sm:p-8">
        <summary className="titolo min-h-[48px] cursor-pointer text-[40px]">Registra un certificato</summary>
        <form action={salvaCertificato} className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block font-bold sm:col-span-2">Allieva
            <select name="allievo_id" required defaultValue="" className={campo}>
              <option value="" disabled>Scegli</option>
              {allieve.map((x) => <option key={x.id} value={x.id}>{x.cognome} {x.nome}</option>)}
            </select>
          </label>
          <label className="block font-bold">Scade il<input name="scadenza" type="date" required className={campo} /></label>
          <label className="block font-bold">File <span className="font-medium">(facoltativo, PDF o foto)</span>
            <input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className={`${campo} py-3 text-[16px] file:mr-3 file:rounded-full file:border-0 file:bg-nero file:px-4 file:py-2 file:font-bold file:text-white`} />
          </label>
          <button type="submit" className={classiBottone("nero", "sm:w-fit")}>Salva</button>
        </form>
      </details>

      <ul className="mt-6 space-y-2">
        {righe.map((r) => (
          <li key={r.id} className={`flex flex-wrap items-center gap-3 rounded-[22px] px-4 py-3 ${r.stato === "valido" ? "bg-rosa" : "border-[3px] border-nero bg-white"}`}>
            <div className="min-w-0 flex-1 basis-[200px]">
              <p className="text-[19px] font-bold">{r.cognome} {r.nome}</p>
              <p className="text-[15px] font-medium text-nero/70">
                {r.cert ? `Scadenza ${dataBreve(r.cert.scadenza)}${r.stato === "in_scadenza" ? ` · tra ${giorniAllaScadenza(r.cert.scadenza)} giorni` : ""}` : "Nessun certificato registrato"}
              </p>
            </div>
            <Pill className={`${coloreStato[r.stato]} ${r.stato === "valido" ? "" : ""}`}>{etichettaStato[r.stato]}</Pill>
            {r.cert?.file_nome && (
              <a href={`/file/certificato/${r.cert.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-[3px] border-nero px-4 font-bold hover:bg-nero hover:text-white"><IconaGraffetta width={18} height={18} />Apri</a>
            )}
            {r.stato !== "valido" && r.famiglie?.telefono && (
              <a href={linkWhatsApp(numeroWhatsApp(r.famiglie.telefono), messaggio(r))} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-nero px-5 font-titolo text-[19px] font-extrabold uppercase text-white hover:bg-black">
                <IconaWhatsApp width={20} height={20} className="text-giallo" /> Ricorda
              </a>
            )}
            {r.cert && (
              <form action={eliminaCertificato}>
                <input type="hidden" name="id" value={r.cert.id} />
                <BottoneConferma domanda={`Eliminare il certificato di ${r.nome} ${r.cognome}?`} className="min-h-[48px] px-2 text-[15px] font-bold underline underline-offset-4">Elimina</BottoneConferma>
              </form>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
