import type { Metadata } from "next";
import { esciGenitori, salvaProfilo } from "@/app/genitori/azioni";
import { Notifiche } from "@/components/genitori/Notifiche";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { Pill } from "@/components/ui/Pill";
import { getCorsi } from "@/lib/dati";
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

      <section className="mt-4 rounded-card bg-rosa p-5 sm:p-8">
        <h2 className="titolo text-[36px]">Consensi</h2>
        <p className="mt-2 font-medium">In arrivo: qui potrai dare o togliere il consenso per foto e video.</p>
      </section>

      <form action={esciGenitori} className="mt-8"><button className="min-h-[52px] rounded-full bg-nero px-7 font-titolo text-[22px] font-extrabold uppercase text-white">Esci</button></form>
    </>
  );
}
