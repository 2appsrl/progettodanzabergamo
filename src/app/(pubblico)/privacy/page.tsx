import type { Metadata } from "next";
import { TestataPagina } from "@/components/pubblico/TestataPagina";

export const metadata: Metadata = { title: "Privacy" };

export default function Pagina() {
  return (
    <>
      <TestataPagina colore="rosa" titolo="Privacy" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-[18px] font-medium sm:px-6">
        <p className="rounded-card bg-giallo p-6 font-bold">Testo in preparazione: l&apos;informativa completa verrà inserita nella Fase 5, insieme ai consensi.</p>
      </div>
    </>
  );
}
