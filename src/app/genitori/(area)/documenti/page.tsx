import type { Metadata } from "next";
import { caricaCertificato } from "@/app/genitori/azioni";
import { classiBottone } from "@/components/ui/Bottone";
import { campo } from "@/components/ui/campi";
import { IconaDocumento, IconaFreccia } from "@/components/ui/Icone";
import { Pill } from "@/components/ui/Pill";
import { coloreStato, dataBreve, etichettaStato, statoCertificato, ultimoPerAllieva, type Certificato } from "@/lib/certificati";
import { caricaFamiglia, riguarda } from "@/lib/genitori";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Documenti" };

type Documento = { id: string; titolo: string; categoria: string; corso_id: string | null; file_nome: string | null; link: string | null };

export default async function DocumentiGenitori({ searchParams }: { searchParams: Promise<{ salvato?: string; errore?: string }> }) {
  const esito = await searchParams;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { figli } = await caricaFamiglia(supabase, user!.email!);
  const corsiMiei = new Set(figli.flatMap((f) => f.corsi));
  const [{ data: c }, { data: d }] = await Promise.all([
    supabase.from("certificati").select("id, allievo_id, scadenza, file_nome, caricato_il").in("allievo_id", figli.map((f) => f.id)),
    supabase.from("documenti").select("id, titolo, categoria, corso_id, file_nome, link").order("categoria").order("creato_il", { ascending: false }),
  ]);
  const ultimi = ultimoPerAllieva((c ?? []) as Certificato[]);
  const documenti = ((d ?? []) as Documento[]).filter((x) => riguarda(x, corsiMiei, true));
  const categorie = [...new Set(documenti.map((x) => x.categoria))];

  return (
    <>
      <h1 className="titolo text-[48px] sm:text-[64px]">Documenti</h1>
      {esito.errore && <p role="alert" className="mt-4 rounded-[18px] bg-nero px-4 py-3 font-bold text-white">{esito.errore}</p>}
      {esito.salvato && <p role="status" className="mt-4 rounded-[18px] bg-giallo px-4 py-3 font-bold">Certificato caricato. Grazie!</p>}

      <section className="mt-5">
        <h2 className="titolo text-[40px]">Certificato <span className="text-magenta">medico</span></h2>
        <ul className="mt-3 space-y-3">
          {figli.map((f) => {
            const cert = ultimi.get(f.id);
            const stato = statoCertificato(cert);
            return (
              <li key={f.id} className={`rounded-card p-5 ${stato === "valido" ? "bg-rosa" : "border-[3px] border-nero bg-white"}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="min-w-0 flex-1 font-titolo text-[32px] font-extrabold uppercase leading-none">{f.nome}</h3>
                  <Pill className={coloreStato[stato]}>{etichettaStato[stato]}</Pill>
                </div>
                <p className="mt-2 font-medium">{cert ? `Scadenza: ${dataBreve(cert.scadenza)}` : "Non abbiamo ancora il certificato."}</p>
                {cert?.file_nome && <a href={`/file/certificato/${cert.id}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-[44px] items-center font-bold underline underline-offset-4">Apri il certificato caricato</a>}
                <details className="mt-3" open={stato !== "valido"}>
                  <summary className="min-h-[44px] cursor-pointer font-bold underline underline-offset-4">Carica un nuovo certificato</summary>
                  <form action={caricaCertificato} className="mt-3 grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="allievo_id" value={f.id} />
                    <label className="block font-bold">Scade il<input name="scadenza" type="date" required className={campo} /></label>
                    <label className="block font-bold">Foto o PDF
                      <input name="file" type="file" required accept="application/pdf,image/jpeg,image/png,image/webp" className={`${campo} py-3 text-[16px] file:mr-3 file:rounded-full file:border-0 file:bg-nero file:px-4 file:py-2 file:font-bold file:text-white`} />
                    </label>
                    <button type="submit" className={classiBottone("magenta", "sm:w-fit")}>Carica</button>
                  </form>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="titolo text-[40px]">Dalla <span className="text-magenta">scuola</span></h2>
        {documenti.length === 0 && <p className="mt-3 rounded-card bg-rosa p-5 font-medium">Nessun documento per ora. Qui troverai regolamento, moduli, liste costumi e musiche.</p>}
        {categorie.map((cat) => (
          <div key={cat} className="mt-4">
            <h3 className="font-titolo text-[26px] font-extrabold uppercase">{cat}</h3>
            <ul className="mt-2 space-y-2">
              {documenti.filter((x) => x.categoria === cat).map((x) => (
                <li key={x.id}>
                  <a href={x.file_nome ? `/file/documento/${x.id}` : x.link!} target="_blank" rel="noopener noreferrer" className="flex min-h-[60px] items-center gap-3 rounded-[22px] bg-giallo px-4 py-3">
                    <IconaDocumento className="shrink-0" /><span className="min-w-0 flex-1 text-[18px] font-bold leading-tight">{x.titolo}</span><IconaFreccia className="shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}
