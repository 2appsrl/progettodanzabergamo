import type { Metadata } from "next";
import Link from "next/link";
import { creaAvviso } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { getCorsi } from "@/lib/dati";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nuovo avviso" };

export default async function NuovoAvviso({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const supabase = await supabaseServer();
  const [corsi, esito, { data: { user } }] = await Promise.all([getCorsi(supabase), searchParams, supabase.auth.getUser()]);
  const { data: maestra } = await supabase.from("maestre").select("nome").eq("email", (user?.email ?? "").toLowerCase()).maybeSingle();
  return (
    <>
      <Link href="/maestre/avvisi" className="inline-flex min-h-[44px] items-center font-bold underline underline-offset-4">Tutti gli avvisi</Link>
      <h1 className="titolo mb-6 mt-2 text-[52px] sm:text-[72px]">Nuovo avviso</h1>
      <Avviso {...esito} />
      <form action={creaAvviso} className="rounded-card bg-rosa p-5 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block font-bold sm:col-span-2">Titolo
            <input name="titolo" required minLength={2} maxLength={120} placeholder="Es. Lista costumi per il saggio" className={campo} />
          </label>
          <label className="block font-bold sm:col-span-2">A chi è rivolto
            <select name="destinatari" required defaultValue="" className={campo}>
              <option value="" disabled>Scegli</option>
              <option value="tutti">Tutta la scuola</option>
              {corsi.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="block font-bold sm:col-span-2">Testo
            <textarea name="testo" rows={7} maxLength={4000} placeholder="Care famiglie, …" className={`${campo} py-3`} />
          </label>
          <label className="block font-bold">Allegato <span className="font-medium">(PDF o immagine, max 5 MB)</span>
            <input name="allegato" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className={`${campo} py-3 text-[16px] file:mr-3 file:rounded-full file:border-0 file:bg-nero file:px-4 file:py-2 file:font-bold file:text-white`} />
          </label>
          <label className="block font-bold">Firma
            <input name="firma" maxLength={40} defaultValue={maestra?.nome ?? ""} className={campo} />
          </label>
          <label className="flex min-h-[56px] items-center gap-3 rounded-[18px] border-[3px] border-nero bg-white px-4 font-bold sm:col-span-2">
            <input type="checkbox" name="notifica" defaultChecked className="h-6 w-6 accent-[#d13583]" />Manda una notifica sul telefono dei genitori
          </label>
        </div>
        <button type="submit" className={classiBottone("nero", "mt-7 min-h-[60px] w-full text-[24px] sm:w-auto")}>Pubblica l&apos;avviso</button>
      </form>
    </>
  );
}
