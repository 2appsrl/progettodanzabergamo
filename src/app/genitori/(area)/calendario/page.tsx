import type { Metadata } from "next";
import { SelettoreFiglio } from "@/components/genitori/SelettoreFiglio";
import { CopiaLink } from "@/components/maestre/CopiaLink";
import { Settimana } from "@/components/pubblico/Settimana";
import { IconaCalendario, IconaLuogo } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { getCorsi, getSedi } from "@/lib/dati";
import { caricaFamiglia, figliScelti, oggiRoma, riguarda } from "@/lib/genitori";
import { origineSito } from "@/lib/origine";
import { quando } from "@/lib/richieste";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Calendario" };

export default async function CalendarioGenitori({ searchParams }: { searchParams: Promise<{ figlio?: string }> }) {
  const { figlio } = await searchParams;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { famiglie, figli: tutti } = await caricaFamiglia(supabase, user!.email!);
  const figli = figliScelti(tutti, figlio);
  const corsiMiei = new Set(figli.flatMap((f) => f.corsi));

  const [corsi, sedi, { data: eventi }] = await Promise.all([
    getCorsi(supabase), getSedi(supabase),
    supabase.from("eventi").select("id, titolo, tipo, data, ora_inizio, ora_fine, luogo, descrizione, corso_id").gte("data", oggiRoma()).order("data").limit(60),
  ]);
  const prossimi = (eventi ?? []).filter((e) => riguarda(e, corsiMiei, true));
  const origine = await origineSito();
  const feed = `${origine}/cal/${famiglie[0].token_calendario}.ics`;
  const webcal = feed.replace(/^https?:/, "webcal:");

  return (
    <>
      <SelettoreFiglio figli={tutti} scelto={figlio} base="/genitori/calendario" />
      <h1 className="titolo text-[48px] sm:text-[64px]">La <span className="text-magenta">settimana</span></h1>
      <div className="mt-4 rounded-card bg-rosa p-3">
        <Settimana corsi={corsi.filter((c) => corsiMiei.has(c.id))} sedi={sedi} />
      </div>

      <h2 className="titolo mt-10 text-[48px]">In <span className="text-magenta">programma</span></h2>
      {prossimi.length === 0 && <p className="mt-3 rounded-card bg-rosa p-5 font-medium">Nessun evento in calendario per ora.</p>}
      <ul className="mt-3 space-y-3">
        {prossimi.map((e) => (
          <li key={e.id} className="su-scuro rounded-card bg-nero p-5 text-white">
            <Pill className="bg-giallo text-nero" ruota={-2}>{e.tipo}</Pill>
            <h3 className="mt-3 font-titolo text-[32px] font-extrabold uppercase leading-none">{e.titolo}</h3>
            <p className="mt-2 flex items-center gap-2 font-bold"><IconaCalendario width={18} height={18} />{quando({ data_evento: e.data, ora_inizio: e.ora_inizio, ora_fine: e.ora_fine })}</p>
            {e.luogo && <p className="mt-1 flex items-center gap-2 font-bold"><IconaLuogo width={18} height={18} />{e.luogo}</p>}
            {e.descrizione && <p className="mt-2 font-medium opacity-90">{e.descrizione}</p>}
          </li>
        ))}
      </ul>

      <section className="mt-10 rounded-card bg-giallo p-5 sm:p-8">
        <h2 className="titolo text-[40px]">Sul calendario del telefono</h2>
        <p className="mt-2 font-medium">Collega una volta sola: lezioni ed eventi dei tuoi figli compaiono nel tuo calendario e si aggiornano da soli.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={webcal} className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-nero px-6 font-titolo text-[22px] font-extrabold uppercase text-white">iPhone / Apple</a>
          <a href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-nero px-6 font-titolo text-[22px] font-extrabold uppercase text-white">Google Calendar</a>
          <CopiaLink link={feed} className="inline-flex min-h-[56px] items-center justify-center rounded-full border-[3px] border-nero px-6 font-titolo text-[22px] font-extrabold uppercase" />
        </div>
        <p className="mt-4 text-[14px] font-medium">Il link è personale: non condividerlo. Google Calendar può metterci alcune ore ad aggiornarsi.</p>
      </section>
    </>
  );
}
