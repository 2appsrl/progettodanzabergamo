import type { Metadata } from "next";
import { salvaProdotto } from "@/app/maestre/azioni";
import { Avviso } from "@/components/maestre/Avviso";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { getProdotti } from "@/lib/dati";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Merchandising" };

export default async function MerchMaestre({ searchParams }: { searchParams: Promise<{ salvato?: string; errore?: string }> }) {
  const supabase = await supabaseServer();
  const [prodotti, esito] = await Promise.all([getProdotti(supabase), searchParams]);
  return (
    <>
      <h1 className="titolo mb-6 text-[56px] sm:text-[80px]">Merchandising</h1>
      <Avviso {...esito} />
      <ul className="grid gap-4 md:grid-cols-2">
        {prodotti.map((p) => (
          <li key={p.id} className="rounded-card bg-rosa p-5">
            <form action={salvaProdotto} className="grid grid-cols-[96px_1fr] gap-4">
              <input type="hidden" name="id" value={p.id} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.foto ? <img src={p.foto} alt="" className="aspect-[4/5] w-full rounded-[14px] object-cover" /> : <span />}
              <label className="block font-bold">Nome<input name="nome" required maxLength={40} defaultValue={p.nome} className={campo} /></label>
              <label className="col-span-2 block font-bold">Descrizione
                <input name="descrizione" maxLength={160} defaultValue={p.descrizione} className={campo} />
              </label>
              <label className="col-span-2 block font-bold">Prezzo in euro <span className="font-medium">(vuoto = &quot;Chiedi il prezzo&quot;)</span>
                <input name="prezzo" inputMode="decimal" defaultValue={p.prezzo ?? ""} placeholder="25" className={campo} />
              </label>
              <label className="col-span-2 flex min-h-[56px] items-center gap-3 rounded-[18px] border-[3px] border-nero bg-white px-4 font-bold">
                <input type="checkbox" name="pubblicato" defaultChecked={p.pubblicato} className="h-6 w-6 accent-[#d13583]" />Visibile sul sito
              </label>
              <button type="submit" className={classiBottone("nero", "col-span-2")}>Salva</button>
            </form>
          </li>
        ))}
      </ul>
      <p className="mt-6 rounded-card bg-giallo p-5 font-medium">Per aggiungere un prodotto nuovo o cambiare una foto, per ora chiedi a chi gestisce il sito: il caricamento delle foto dal pannello arriva in una fase successiva.</p>
    </>
  );
}
