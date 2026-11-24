import type { Metadata } from "next";
import { salvaScuola, salvaSede } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { getScuola, getSedi } from "@/lib/dati";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Impostazioni" };

export default async function Impostazioni({ searchParams }: { searchParams: Promise<{ salvato?: string; errore?: string }> }) {
  const supabase = await supabaseServer();
  const [scuola, sedi, esito] = await Promise.all([getScuola(supabase), getSedi(supabase), searchParams]);
  return (
    <>
      <h1 className="titolo mb-6 text-[56px] sm:text-[80px]">Impostazioni</h1>
      <Avviso {...esito} />
      <form action={salvaScuola} className="rounded-card bg-rosa p-5 sm:p-8">
        <h2 className="titolo text-[40px]">Contatti della scuola</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <label className="block font-bold">WhatsApp <span className="font-medium">(con 39 davanti)</span>
            <input name="whatsapp" inputMode="tel" defaultValue={scuola.whatsapp} placeholder="393331234567" className={campo} />
          </label>
          <label className="block font-bold">Instagram
            <input name="instagram" defaultValue={scuola.instagram} className={campo} />
          </label>
          <label className="block font-bold">Email
            <input name="email" type="email" defaultValue={scuola.email} className={campo} />
          </label>
        </div>
        <label className="mt-5 flex min-h-[56px] items-center gap-3 rounded-[18px] border-[3px] border-nero bg-white px-4 font-bold">
          <input type="checkbox" name="dati_di_esempio" defaultChecked={scuola.dati_di_esempio} className="h-6 w-6 accent-[#d13583]" />
          Mostra sul sito la striscia &quot;dati di esempio&quot;
        </label>
        <button type="submit" className={classiBottone("nero", "mt-6")}>Salva</button>
      </form>

      <h2 className="titolo mt-10 text-[40px]">Sedi</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {sedi.map((s) => (
          <form key={s.id} action={salvaSede} className="rounded-card bg-giallo p-5">
            <input type="hidden" name="id" value={s.id} />
            <label className="block font-bold">Nome<input name="nome" required defaultValue={s.nome} className={campo} /></label>
            <label className="mt-4 block font-bold">Indirizzo<input name="indirizzo" defaultValue={s.indirizzo} className={campo} /></label>
            <button type="submit" className={classiBottone("nero", "mt-5")}>Salva sede</button>
          </form>
        ))}
      </div>
    </>
  );
}
