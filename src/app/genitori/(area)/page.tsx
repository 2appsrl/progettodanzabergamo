import Link from "next/link";
import { SelettoreFiglio } from "@/components/genitori/SelettoreFiglio";
import { IconaCalendario, IconaCampana, IconaFreccia, IconaGraffetta, IconaLuogo } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { dataBreve, statoCertificato, ultimoPerAllieva, type Certificato } from "@/lib/certificati";
import { getCorsi, getSedi } from "@/lib/dati";
import { dataOra } from "@/lib/formato";
import { aggiungiGiorni, caricaFamiglia, figliScelti, giornoSettimana, oggiRoma, riguarda } from "@/lib/genitori";
import { giornoEsteso, quando, scadenzaPassata } from "@/lib/richieste";
import { supabaseServer } from "@/lib/supabase/server";

type Appuntamento = { chiave: string; data: string; ora: string; titolo: string; dettaglio: string; tipo: string };

export default async function HomeGenitori({ searchParams }: { searchParams: Promise<{ figlio?: string }> }) {
  const { figlio } = await searchParams;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { famiglie, figli: tutti } = await caricaFamiglia(supabase, user!.email!);
  const figli = figliScelti(tutti, figlio);
  const corsiMiei = new Set(figli.flatMap((f) => f.corsi));
  const oggi = oggiRoma();

  const [corsi, sedi, { data: richieste }, { data: risposte }, { data: avvisi }, { data: letture }, { data: eventi }, { data: certificati }] = await Promise.all([
    getCorsi(supabase), getSedi(supabase),
    supabase.from("richieste").select("id, codice, titolo, data_evento, ora_inizio, ora_fine, scadenza, chiusa, tutta_la_scuola, corso_id").eq("chiusa", false).order("creata_il", { ascending: false }).limit(30),
    supabase.from("risposte").select("richiesta_id, allievo_id, scelta").in("allievo_id", tutti.map((f) => f.id)),
    supabase.from("avvisi").select("id, titolo, creato_il, tutta_la_scuola, corso_id, allegato_nome").order("creato_il", { ascending: false }).limit(30),
    supabase.from("letture_avvisi").select("avviso_id").in("famiglia_id", famiglie.map((f) => f.id)),
    supabase.from("eventi").select("id, titolo, tipo, data, ora_inizio, ora_fine, luogo, corso_id").gte("data", oggi).order("data").limit(30),
    supabase.from("certificati").select("id, allievo_id, scadenza, file_nome, caricato_il").in("allievo_id", tutti.map((f) => f.id)),
  ]);

  // Certificati medici scaduti o che scadono entro 30 giorni.
  const ultimi = ultimoPerAllieva((certificati ?? []) as Certificato[]);
  const daRinnovare = figli.map((f) => ({ f, cert: ultimi.get(f.id), stato: statoCertificato(ultimi.get(f.id)) })).filter((x) => x.stato === "scaduto" || x.stato === "in_scadenza");

  // Richieste di conferma ancora aperte, con lo stato della risposta per ogni figlio.
  const aperte = (richieste ?? []).filter((r) => riguarda(r, corsiMiei) && !scadenzaPassata(r.scadenza)).map((r) => {
    const destinatari = figli.filter((f) => r.tutta_la_scuola || f.corsi.includes(r.corso_id));
    const stato = destinatari.map((f) => ({ nome: f.nome, scelta: (risposte ?? []).find((x) => x.richiesta_id === r.id && x.allievo_id === f.id)?.scelta as string | undefined }));
    return { ...r, stato, daRispondere: stato.some((s) => !s.scelta) };
  }).filter((r) => r.stato.length > 0);

  const letti = new Set((letture ?? []).map((l) => l.avviso_id));
  const bacheca = (avvisi ?? []).filter((a) => riguarda(a, corsiMiei)).slice(0, 6);

  // Prossimi appuntamenti: lezioni dei prossimi 7 giorni + eventi in calendario.
  const nomeSede = (id: string | null) => sedi.find((s) => s.id === id)?.nome ?? "";
  const lezioni: Appuntamento[] = [];
  for (let i = 0; i < 7; i++) {
    const data = aggiungiGiorni(oggi, i);
    for (const c of corsi.filter((c) => corsiMiei.has(c.id))) {
      for (const l of c.lezioni.filter((l) => l.giorno === giornoSettimana(data))) {
        const chi = figli.filter((f) => f.corsi.includes(c.id)).map((f) => f.nome).join(", ");
        lezioni.push({ chiave: `${c.id}-${data}-${l.inizio}`, data, ora: `${l.inizio}–${l.fine}`, titolo: c.nome, dettaglio: [chi, nomeSede(c.sede_id)].filter(Boolean).join(" · "), tipo: "Lezione" });
      }
    }
  }
  const appuntamenti = [
    ...lezioni,
    ...(eventi ?? []).filter((e) => riguarda(e, corsiMiei, true)).map((e): Appuntamento => ({
      chiave: e.id, data: e.data, ora: e.ora_inizio ? `${e.ora_inizio.slice(0, 5)}${e.ora_fine ? `–${e.ora_fine.slice(0, 5)}` : ""}` : "",
      titolo: e.titolo, dettaglio: e.luogo, tipo: e.tipo,
    })),
  ].sort((a, b) => (a.data + a.ora).localeCompare(b.data + b.ora)).slice(0, 6);

  return (
    <>
      <SelettoreFiglio figli={tutti} scelto={figlio} base="/genitori" />

      {daRinnovare.map(({ f, cert, stato }) => (
        <Link key={f.id} href="/genitori/documenti" className="su-scuro mb-4 flex items-center gap-4 rounded-card bg-nero p-5 text-white">
          <div className="min-w-0 flex-1">
            <p className="font-titolo text-[28px] font-extrabold uppercase leading-none text-giallo">Certificato medico {stato === "scaduto" ? "scaduto" : "in scadenza"}</p>
            <p className="mt-2 font-medium">Quello di {f.nome} {stato === "scaduto" ? "è scaduto" : "scade"} il {dataBreve(cert!.scadenza)}. Tocca per caricare il nuovo.</p>
          </div>
          <IconaFreccia className="shrink-0" />
        </Link>
      ))}

      {aperte.length > 0 && (
        <section aria-labelledby="t-conferme" className="mb-8">
          <h1 id="t-conferme" className="titolo text-[48px]">Da <span className="text-magenta">confermare</span></h1>
          <ul className="mt-3 space-y-3">
            {aperte.map((r) => (
              <li key={r.id}>
                <Link href={`/r/${r.codice}`} className={`flex items-center gap-4 rounded-card p-5 ${r.daRispondere ? "su-scuro bg-magenta text-white" : "bg-rosa text-nero"}`}>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-titolo text-[30px] font-extrabold uppercase leading-none">{r.titolo}</h2>
                    {r.data_evento && <p className="mt-2 flex items-center gap-2 font-bold"><IconaCalendario width={18} height={18} />{quando(r)}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.stato.map((s) => (
                        <Pill key={s.nome} className={s.scelta ? "bg-white text-nero" : "bg-giallo text-nero"}>{s.nome}: {s.scelta ?? "da rispondere"}</Pill>
                      ))}
                      {r.scadenza && r.daRispondere && <Pill className="bg-nero text-white">entro {giornoEsteso(r.scadenza)}</Pill>}
                    </div>
                  </div>
                  <IconaFreccia className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="t-avvisi" className="mb-8">
        <h2 id="t-avvisi" className="titolo text-[48px]">Avvisi</h2>
        {bacheca.length === 0 && <p className="mt-3 rounded-card bg-rosa p-5 font-medium">Nessun avviso per ora.</p>}
        <ul className="mt-3 space-y-2">
          {bacheca.map((a) => {
            const nuovo = !letti.has(a.id);
            return (
              <li key={a.id}>
                <Link href={`/genitori/avvisi/${a.id}`} className={`flex items-center gap-3 rounded-[22px] border-[3px] border-nero px-4 py-3 ${nuovo ? "bg-giallo" : "bg-white"}`}>
                  <IconaCampana className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[19px] font-bold leading-tight">{a.titolo}</p>
                    <p className="flex items-center gap-2 text-[14px] font-medium text-nero/70">{dataOra(a.creato_il)}{a.allegato_nome && <><IconaGraffetta width={15} height={15} />allegato</>}</p>
                  </div>
                  {nuovo && <Pill className="bg-magenta text-white" ruota={-3}>Nuovo</Pill>}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="t-app">
        <h2 id="t-app" className="titolo text-[48px]">Prossimi <span className="text-magenta">appuntamenti</span></h2>
        {appuntamenti.length === 0 && <p className="mt-3 rounded-card bg-rosa p-5 font-medium">Niente in programma nei prossimi giorni.</p>}
        <ul className="mt-3 space-y-2">
          {appuntamenti.map((a) => (
            <li key={a.chiave} className={`flex items-center gap-4 rounded-[22px] px-4 py-3 ${a.tipo === "Lezione" ? "bg-rosa" : "su-scuro bg-nero text-white"}`}>
              <div className="w-[92px] shrink-0">
                <p className="font-titolo text-[22px] font-extrabold uppercase leading-none">{a.data === oggi ? "Oggi" : giornoEsteso(a.data).split(" ").slice(0, 2).join(" ")}</p>
                <p className="text-[14px] font-bold tabular-nums">{a.ora}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[18px] font-bold leading-tight">{a.titolo}</p>
                {a.dettaglio && <p className="flex items-center gap-1.5 text-[14px] font-medium opacity-80"><IconaLuogo width={14} height={14} />{a.dettaglio}</p>}
              </div>
              {a.tipo !== "Lezione" && <Pill className="bg-giallo text-nero">{a.tipo}</Pill>}
            </li>
          ))}
        </ul>
        <Link href="/genitori/calendario" className="mt-4 inline-flex min-h-[48px] items-center gap-2 font-bold underline underline-offset-4">Tutto il calendario <IconaFreccia width={18} height={18} /></Link>
      </section>
    </>
  );
}
