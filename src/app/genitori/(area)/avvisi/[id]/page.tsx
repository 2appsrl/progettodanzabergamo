import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconaGraffetta } from "@/components/ui/Icone";
import { dataOra } from "@/lib/formato";
import { caricaFamiglia } from "@/lib/genitori";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Avviso" };

export default async function AvvisoGenitore({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: avviso } = await supabase.from("avvisi").select("id, titolo, testo, firma, creato_il, allegato_nome, corsi(nome)").eq("id", id).maybeSingle();
  if (!avviso) notFound();

  // Aprendo l'avviso lo segniamo come letto: la maestra lo vede nel suo pannello.
  const { data: { user } } = await supabase.auth.getUser();
  const { famiglie } = await caricaFamiglia(supabase, user!.email!);
  if (famiglie.length) {
    await supabase.from("letture_avvisi").upsert(famiglie.map((f) => ({ avviso_id: id, famiglia_id: f.id })), { onConflict: "avviso_id,famiglia_id", ignoreDuplicates: true });
  }
  const corso = (avviso.corsi as unknown as { nome: string } | null)?.nome;

  return (
    <>
      <Link href="/genitori" className="inline-flex min-h-[44px] items-center font-bold underline underline-offset-4">Torna alla home</Link>
      <article className="mt-2 rounded-card bg-giallo p-5 sm:p-8">
        <p className="text-[15px] font-bold">{dataOra(avviso.creato_il)}{corso ? ` · ${corso}` : ""}</p>
        <h1 className="titolo mt-2 text-[48px] sm:text-[64px]">{avviso.titolo}</h1>
        {avviso.testo && <p className="mt-5 whitespace-pre-line text-[18px] font-medium leading-snug">{avviso.testo}</p>}
        {avviso.firma && <p className="mt-4 text-[18px] font-bold">{avviso.firma}</p>}
        {avviso.allegato_nome && (
          <a href={`/genitori/avvisi/${id}/allegato`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-[56px] max-w-full items-center gap-2 rounded-full bg-nero px-6 font-titolo text-[22px] font-extrabold uppercase text-white">
            <IconaGraffetta className="shrink-0" /><span className="truncate">Apri l&apos;allegato</span>
          </a>
        )}
      </article>
    </>
  );
}
