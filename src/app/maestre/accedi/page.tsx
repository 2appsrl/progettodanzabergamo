import type { Metadata } from "next";
import Link from "next/link";
import { ModuloAccesso } from "@/components/maestre/ModuloAccesso";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Area maestre" };

export default async function AccediMaestre({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const { errore } = await searchParams;
  return (
    <main className="su-scuro flex flex-1 flex-col items-center justify-center bg-magenta px-4 py-14 text-center text-white">
      <Logo misura={96} invertito />
      <h1 className="titolo titolo-sezione mt-6">Area <span className="text-giallo">maestre</span></h1>
      <p className="mb-6 mt-3 max-w-md text-[19px] font-medium">Niente password: scrivi la tua email e ti mandiamo un link per entrare.</p>
      {errore && <p role="alert" className="mb-4 w-full max-w-md rounded-[18px] bg-nero px-4 py-3 font-bold">Il link non è valido o è scaduto. Richiedine uno nuovo.</p>}
      <div className="w-full max-w-md"><ModuloAccesso /></div>
      <Link href="/" className="mt-8 inline-flex min-h-[48px] items-center font-bold underline underline-offset-4">Torna al sito</Link>
    </main>
  );
}
