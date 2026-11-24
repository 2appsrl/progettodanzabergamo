import type { Metadata } from "next";
import { Bottone } from "@/components/ui/Bottone";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Area genitori" };

// Segnaposto: l'area genitori vera arriva nella Fase 4.
export default function AccediGenitori() {
  return (
    <main className="su-scuro flex flex-1 flex-col items-center justify-center bg-magenta px-4 py-16 text-center text-white">
      <Logo misura={96} />
      <h1 className="titolo titolo-sezione mt-6">Area <span className="text-giallo">genitori</span></h1>
      <p className="mt-4 max-w-md text-[19px] font-medium">In arrivo: avvisi, calendario e documenti dei tuoi figli, tutto in un posto solo.</p>
      <Bottone href="/" variante="nero" className="mt-8">Torna al sito</Bottone>
    </main>
  );
}
