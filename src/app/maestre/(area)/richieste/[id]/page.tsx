import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chiudiRiapriRichiesta, eliminaRichiesta } from "@/app/maestre/azioni";
import { AggiornaDaSolo } from "@/components/maestre/AggiornaDaSolo";
import { BottoneConferma } from "@/components/maestre/BottoneConferma";
import { CopiaLink } from "@/components/maestre/CopiaLink";
import { classiBottone } from "@/components/ui/Bottone";
import { IconaWhatsApp } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { dataOra, linkWhatsApp, numeroWhatsApp } from "@/lib/formato";
import { origineSito } from "@/lib/origine";
import { giornoEsteso, messaggioGruppo, messaggioSollecito, quando, scadenzaPassata } from "@/lib/richieste";
import { supabaseServer } from "@/lib/supabase/server";
import { caricaDettaglio } from "../dettaglio";

export const metadata: Metadata = { title: "Riepilogo conferme" };

const coloriOpzione = ["bg-magenta text-white", "bg-nero text-white", "bg-giallo text-nero", "bg-rosa text-nero"];
const secondario = "inline-flex min-h-[52px] items-center justify-center rounded-full border-[3px] border-nero px-6 font-titolo text-[20px] font-extrabold uppercase hover:bg-nero hover:text-white";

export default async function DettaglioRichiesta({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ creata?: string }> }) {
  const [{ id }, { creata }] = await Promise.all([params, searchParams]);
  const supabase = await supabaseServer();
  const dettaglio = await caricaDettaglio(supabase, id);
  if (!dettaglio) notFound();
  const { richiesta: r, righe } = dettaglio;

  const link = `${await origineSito()}/r/${r.codice}`;
  const finita = r.chiusa || scadenzaPassata(r.scadenza);
  const senza = righe.filter((x) => !x.scelta);
  const con = righe.filter((x) => x.scelta).sort((a, b) => (b.risposta_il ?? "").localeCompare(a.risposta_il ?? ""));
  // Anche eventuali risposte con un'opzione che non esiste più vengono contate.
  const opzioni = [...new Set([...r.opzioni, ...con.map((x) => x.scelta!)])];
  const colore = (scelta: string) => coloriOpzione[opzioni.indexOf(scelta) % coloriOpzione.length];

  return (
    <>
      <AggiornaDaSolo secondi={10} />
      <Link href="/maestre/richieste" className="inline-flex min-h-[44px] items-center font-bold underline underline-offset-4">Tutte le conferme</Link>
      <h1 className="titolo mt-2 text-[48px] sm:text-[72px]">{r.titolo}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill className="bg-nero text-white">{r.tutta_la_scuola ? "Tutta la scuola" : r.corsi?.nome ?? "Corso eliminato"}</Pill>
        {r.data_evento && <Pill className="bg-giallo text-nero">{quando(r)}</Pill>}
        {r.luogo && <Pill className="bg-rosa text-nero">{r.luogo}</Pill>}
        {r.scadenza && <Pill className="bg-rosa text-nero">Risposte entro {giornoEsteso(r.scadenza)}</Pill>}
        {finita && <Pill className="bg-nero text-white" ruota={-2}>Chiusa</Pill>}
      </div>

      {creata && <p role="status" className="mt-5 rounded-[18px] bg-giallo px-4 py-3 font-bold">Richiesta creata. Ora condividila nel gruppo WhatsApp.</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a href={`https://wa.me/?text=${encodeURIComponent(messaggioGruppo(r, link))}`} target="_blank" rel="noopener noreferrer" className={classiBottone("magenta", "min-h-[60px] text-[24px]")}>
          <IconaWhatsApp /> Condividi su WhatsApp
        </a>
        <CopiaLink link={link} className={secondario} />
        <a href={`/r/${r.codice}`} target="_blank" rel="noopener noreferrer" className={secondario}>Vedi come la vedono i genitori</a>
        <a href={`/maestre/richieste/${r.id}/csv`} className={secondario}>Esporta elenco (CSV)</a>
      </div>

      <section aria-label="Riepilogo risposte" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {opzioni.map((o) => (
          <div key={o} className={`rounded-card p-4 ${colore(o)}`}>
            <span className="titolo block text-[72px]">{con.filter((x) => x.scelta === o).length}</span>
            <span className="font-titolo text-[22px] font-extrabold uppercase leading-none">{o}</span>
          </div>
        ))}
        <div className="rounded-card border-[3px] border-nero bg-white p-4">
          <span className="titolo block text-[72px]">{senza.length}</span>
          <span className="font-titolo text-[22px] font-extrabold uppercase leading-none">Senza risposta</span>
        </div>
      </section>
      <p className="mt-2 text-[14px] font-medium text-nero/70">Si aggiorna da solo ogni 10 secondi. {righe.length} allieve in elenco.</p>

      {righe.length === 0 && (
        <p className="mt-6 rounded-card bg-rosa p-6 font-medium">Nessuna allieva in elenco per questa richiesta. Aggiungi le allieve (e i loro corsi) nella sezione <Link href="/maestre/allieve" className="font-bold underline">Allieve</Link>.</p>
      )}

      {senza.length > 0 && (
        <section className="mt-8">
          <h2 className="titolo text-[40px]">Senza risposta</h2>
          <ul className="mt-3 space-y-2">
            {senza.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-[22px] border-[3px] border-nero bg-white px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[19px] font-bold">{a.nome} {a.cognome}</p>
                  <p className="text-[15px] font-medium text-nero/70">{a.genitore || "Genitore non indicato"}</p>
                </div>
                {a.telefono ? (
                  <a
                    href={linkWhatsApp(numeroWhatsApp(a.telefono), messaggioSollecito(a.genitore, a.nome, r.titolo, link))}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-nero px-5 font-titolo text-[19px] font-extrabold uppercase text-white hover:bg-black"
                  >
                    <IconaWhatsApp width={20} height={20} className="text-giallo" /> Sollecita
                  </a>
                ) : <Pill className="bg-rosa text-nero">Manca il telefono</Pill>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {con.length > 0 && (
        <section className="mt-8">
          <h2 className="titolo text-[40px]">Hanno risposto</h2>
          <ul className="mt-3 space-y-2">
            {con.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-[22px] bg-rosa px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[19px] font-bold">{a.nome} {a.cognome}</p>
                  <p className="text-[15px] font-medium text-nero/70">{dataOra(a.risposta_il!)}</p>
                </div>
                <Pill className={`text-[16px] ${colore(a.scelta!)}`}>{a.scelta}</Pill>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-3 border-t-[3px] border-nero pt-6">
        <form action={chiudiRiapriRichiesta}>
          <input type="hidden" name="id" value={r.id} /><input type="hidden" name="chiusa" value={r.chiusa ? "no" : "si"} />
          <button type="submit" className={secondario}>{r.chiusa ? "Riapri le risposte" : "Chiudi le risposte"}</button>
        </form>
        <form action={eliminaRichiesta}>
          <input type="hidden" name="id" value={r.id} />
          <BottoneConferma domanda={`Eliminare "${r.titolo}" con tutte le risposte ricevute? Non si può annullare.`} className={secondario}>Elimina</BottoneConferma>
        </form>
      </div>
    </>
  );
}
