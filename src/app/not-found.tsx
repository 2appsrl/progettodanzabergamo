import { Bottone } from "@/components/ui/Bottone";

export default function NonTrovata() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-giallo px-4 py-20 text-center">
      <h1 className="titolo titolo-hero">Ops!</h1>
      <p className="mt-4 text-[20px] font-bold">Questa pagina non esiste.</p>
      <Bottone href="/" variante="nero" className="mt-8">Torna alla home</Bottone>
    </main>
  );
}
