import type { Metadata } from "next";
import Link from "next/link";
import { esciGenitori, registraConsenso, salvaProfilo } from "@/app/genitori/azioni";
import { Notifiche } from "@/components/genitori/Notifiche";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { Pill } from "@/components/ui/Pill";
import { getCorsi } from "@/lib/dati";
import { dataOra } from "@/lib/formato";
import { caricaFamiglia } from "@/lib/genitori";
import { VAPID_PUBBLICA } from "@/lib/push";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profilo" };

export default async function ProfiloGenitori({ searchParams }: { searchParams: Promise<{ salvato?: string; errore?: string }> }) {
  const esito = await searchParams;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ famiglie, figli }, corsi] = await Promise.all([caricaFamiglia(supabase, user!.email!), getCorsi(supabase)]);
  const famiglia = famiglie[0];
  // Per ogni figlio vale l'ultima scelta registrata.
  const { data: storico } = await supabase.from("consensi").select("allievo_id, concesso, registrato_il").in("allievo_id", figli.map((f) => f.id)).order("registrato_il", { ascending: false });
  const consenso = new Map<string, { concesso: boolean; registrato_il: string }>();
  for (const riga of storico ?? []) if (!consenso.has(riga.allievo_id)) consenso.set(riga.allievo_id, riga);
  const nomeCorso = new Map(corsi.map((c) => [c.id, c.nome]));

  return (
    <>
      <h1 className="titolo text-[48px] sm:text-[64px]">Profilo</h1>
      {esito.errore && <p role="alert" className="mt-4 rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{esito.errore}</p>}
      {esito.salvato && <p role="status" className="mt-4 rounded-[18px] bg-giallo px-4 py-3 font-bold">Salvato.</p>}

      <section className="mt-5 rounded-card bg-rosa p-5 sm:p-8">
        <h2 className="titolo text-[36px]">I tuoi dati</h2>
        <form action={salvaProfilo} className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="block font-bold">Nome e cognome<input name="nome" required maxLength={80} autoComplete="name" defaultValue={famiglia.nome_genitore} className={campo} /></label>
          <label className="block font-bold">Telefono<input name="telefono" type="tel" inputMode="tel" maxLength={20} autoComplete="tel" defaultValue={famiglia.telefono} className={campo} /></label>
          <p className="font-medium sm:col-span-2">Email di accesso: <strong className="break-all">{famiglia.email}</strong>. Per cambiarla chiedi alla maestra.</p>
          <button type="submit" className={classiBottone("nero", "sm:col-span-2 sm:w-fit")}>Salva</button>
        </form>
      </section>

      <section className="mt-4 rounded-card border-[3px] border-nero bg-white p-5 sm:p-8">
        <h2 className="titolo text-[36px]">Figlie e figli</h2>
        <ul className="mt-3 space-y-3">
          {figli.map((f) => (
            <li key={f.id}>
              <p className="text-[20px] font-bold">{f.nome} {f.cognome}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {f.corsi.map((c) => <Pill key={c} className="bg-rosa text-nero">{nomeCorso.get(c) ?? "Corso"}</Pill>)}
                {f.corsi.length === 0 && <Pill className="bg-giallo text-nero">Nessun corso</Pill>}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[15px] font-medium">Manca qualcuno o un corso è sbagliato? Scrivi alla maestra.</p>
      </section>

      <section className="mt-4 rounded-card bg-giallo p-5 sm:p-8">
        <h2 className="titolo text-[36px]">Notifiche</h2>
        <div className="mt-3"><Notifiche chiavePubblica={VAPID_PUBBLICA} /></div>
      </section>

      <section id="consensi" className="mt-4 scroll-mt-4 rounded-card bg-rosa p-5 sm:p-8">
        <h2 className="titolo text-[36px]">Foto e video</h2>
        <p className="mt-2 font-medium">Durante lezioni, saggi ed eventi la scuola scatta foto e video. Possono essere pubblicati sul sito e sui canali social della scuola solo con il tuo consenso. Puoi cambiarlo quando vuoi. Dettagli nell&apos;<Link href="/privacy" className="font-bold underline">informativa privacy</Link>.</p>
        <ul className="mt-4 space-y-4">
          {figli.map((f) => {
            const c = consenso.get(f.id);
            const scelta = (si: boolean) => `min-h-[56px] flex-1 rounded-full border-[3px] border-nero px-4 font-titolo text-[20px] font-extrabold uppercase ${c?.concesso === si ? "bg-nero text-white" : "bg-white text-nero"}`;
            return (
              <li key={f.id} className="rounded-[22px] bg-white p-4">
                <p className="text-[20px] font-bold">{f.nome} {f.cognome}</p>
                <p className="text-[15px] font-medium text-nero/70">{c ? `${c.concesso ? "Consenso dato" : "Consenso negato"} il ${dataOra(c.registrato_il)}` : "Non hai ancora scelto: senza una scelta non pubblichiamo nulla."}</p>
                <form action={registraConsenso} className="mt-3 flex gap-2">
                  <input type="hidden" name="allievo_id" value={f.id} />
                  <button type="submit" name="concesso" value="si" aria-pressed={c?.concesso === true} className={scelta(true)}>Acconsento</button>
                  <button type="submit" name="concesso" value="no" aria-pressed={c?.concesso === false} className={scelta(false)}>Non acconsento</button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <form action={esciGenitori} className="mt-8"><button className="min-h-[52px] rounded-full bg-nero px-7 font-titolo text-[22px] font-extrabold uppercase text-white">Esci</button></form>
    </>
  );
}
