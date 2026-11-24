import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eliminaAvviso } from "@/app/maestre/azioni";
import { AggiornaDaSolo } from "@/components/maestre/AggiornaDaSolo";
import { BottoneConferma } from "@/components/maestre/BottoneConferma";
import { CopiaLink } from "@/components/maestre/CopiaLink";
import { classiBottone } from "@/components/ui/Bottone";
import { IconaGraffetta, IconaWhatsApp } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { dataOra } from "@/lib/formato";
import { origineSito } from "@/lib/origine";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Avviso" };

const secondario = "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-[3px] border-nero px-6 font-titolo text-[20px] font-extrabold uppercase hover:bg-nero hover:text-white";

type Allieva = { nome: string; cognome: string; famiglia_id: string; famiglie: { nome_genitore: string; email: string | null } | null; iscrizioni: { corso_id: string }[] };

export default async function DettaglioAvviso({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ creato?: string; notifiche?: string }> }) {
  const [{ id }, esito] = await Promise.all([params, searchParams]);
  const supabase = await supabaseServer();
  const { data: a } = await supabase.from("avvisi").select("*, corsi(nome)").eq("id", id).maybeSingle();
  if (!a) notFound();
  const [{ data: allieve }, { data: letture }] = await Promise.all([
    supabase.from("allievi").select("nome, cognome, famiglia_id, famiglie(nome_genitore, email), iscrizioni(corso_id)").eq("attivo", true).order("cognome"),
    supabase.from("letture_avvisi").select("famiglia_id, letto_il").eq("avviso_id", id),
  ]);

  // Una riga per famiglia destinataria, con i nomi delle figlie e se ha letto.
  const lettoIl = new Map((letture ?? []).map((l) => [l.famiglia_id as string, l.letto_il as string]));
  const famiglie = new Map<string, { genitore: string; email: string | null; figlie: string[] }>();
  for (const x of (allieve ?? []) as unknown as Allieva[]) {
    if (!a.tutta_la_scuola && !x.iscrizioni.some((i) => i.corso_id === a.corso_id)) continue;
    const f = famiglie.get(x.famiglia_id) ?? { genitore: x.famiglie?.nome_genitore ?? "", email: x.famiglie?.email ?? null, figlie: [] };
    f.figlie.push(`${x.nome} ${x.cognome}`);
    famiglie.set(x.famiglia_id, f);
  }
  const righe = [...famiglie.entries()].map(([fid, f]) => ({ fid, ...f, letto: lettoIl.get(fid) }));
  const letti = righe.filter((r) => r.letto);
  const link = `${await origineSito()}/genitori/avvisi/${a.id}`;
  const messaggio = `*${String(a.titolo).toUpperCase()}*\nNuovo avviso della scuola. Leggilo qui:\n${link}`;

  return (
    <>
      <AggiornaDaSolo secondi={15} />
      <Link href="/maestre/avvisi" className="inline-flex min-h-[44px] items-center font-bold underline underline-offset-4">Tutti gli avvisi</Link>
      {esito.creato && (
        <p role="status" className="mt-3 rounded-[18px] bg-giallo px-4 py-3 font-bold">
          Avviso pubblicato.{" "}
          {esito.notifiche === "spente" ? "Le notifiche non sono ancora configurate, quindi non ne è partita nessuna." : esito.notifiche !== undefined ? `Notifiche inviate a ${esito.notifiche} telefoni.` : ""}
        </p>
      )}
      <article className="mt-3 rounded-card bg-giallo p-5 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Pill className="bg-nero text-white">{a.tutta_la_scuola ? "Tutta la scuola" : a.corsi?.nome ?? "Corso eliminato"}</Pill>
          <Pill className="bg-white text-nero">{dataOra(a.creato_il)}</Pill>
        </div>
        <h1 className="titolo mt-4 text-[48px] sm:text-[64px]">{a.titolo}</h1>
        {a.testo && <p className="mt-4 whitespace-pre-line text-[18px] font-medium leading-snug">{a.testo}</p>}
        {a.firma && <p className="mt-3 text-[18px] font-bold">{a.firma}</p>}
        {a.allegato_nome && (
          <a href={`/genitori/avvisi/${a.id}/allegato`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-[48px] max-w-full items-center gap-2 rounded-full bg-nero px-5 font-bold text-white">
            <IconaGraffetta className="shrink-0" /><span className="truncate">{a.allegato_nome}</span>
          </a>
        )}
      </article>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a href={`https://wa.me/?text=${encodeURIComponent(messaggio)}`} target="_blank" rel="noopener noreferrer" className={classiBottone("magenta", "min-h-[60px] text-[24px]")}>
          <IconaWhatsApp /> Condividi su WhatsApp
        </a>
        <CopiaLink link={link} className={secondario} />
      </div>
      <p className="mt-2 text-[14px] font-medium text-nero/70">Il link porta all&apos;area genitori: per leggere l&apos;avviso il genitore entra con la sua email.</p>

      <section className="mt-8">
        <h2 className="titolo text-[40px]">Chi l&apos;ha letto <span className="text-magenta">{letti.length}/{righe.length}</span></h2>
        {righe.length === 0 && <p className="mt-3 rounded-card bg-rosa p-5 font-medium">Nessuna famiglia in elenco per questo avviso.</p>}
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {righe.sort((x, y) => Number(Boolean(x.letto)) - Number(Boolean(y.letto))).map((r) => (
            <li key={r.fid} className={`flex items-center gap-3 rounded-[22px] px-4 py-3 ${r.letto ? "bg-rosa" : "border-[3px] border-nero bg-white"}`}>
              <div className="min-w-0 flex-1">
                <p className="text-[18px] font-bold leading-tight">{r.figlie.join(", ")}</p>
                <p className="text-[14px] font-medium text-nero/70">{r.genitore || "Genitore non indicato"}{!r.email ? " · senza email, non può entrare" : ""}</p>
              </div>
              {r.letto ? <Pill className="bg-nero text-white">Letto {dataOra(r.letto)}</Pill> : <Pill className="bg-giallo text-nero">Non letto</Pill>}
            </li>
          ))}
        </ul>
      </section>

      <form action={eliminaAvviso} className="mt-10 border-t-[3px] border-nero pt-6">
        <input type="hidden" name="id" value={a.id} />
        <BottoneConferma domanda={`Eliminare l'avviso "${a.titolo}"? Non si può annullare.`} className={secondario}>Elimina</BottoneConferma>
      </form>
    </>
  );
}
