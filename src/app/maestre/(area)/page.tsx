import Link from "next/link";
import { IconaFreccia } from "@/components/ui/Icone";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Riepilogo() {
  const supabase = await supabaseServer();
  const [nuove, corsi, aperte, allieve] = await Promise.all([
    supabase.from("richieste_prova").select("id", { count: "exact", head: true }).eq("stato", "nuova"),
    supabase.from("corsi").select("id", { count: "exact", head: true }),
    supabase.from("richieste").select("id", { count: "exact", head: true }).eq("chiusa", false),
    supabase.from("allievi").select("id", { count: "exact", head: true }).eq("attivo", true),
  ]);
  const card = [
    { href: "/maestre/richieste", numero: aperte.count ?? 0, titolo: "Conferme aperte", stile: "bg-magenta text-white" },
    { href: "/maestre/allieve", numero: allieve.count ?? 0, titolo: "Allieve", stile: "bg-rosa text-nero" },
    { href: "/maestre/prove", numero: nuove.count ?? 0, titolo: "Richieste di prova nuove", stile: "bg-giallo text-nero" },
    { href: "/maestre/corsi", numero: corsi.count ?? 0, titolo: "Corsi", stile: "bg-nero text-white" },
  ];
  return (
    <>
      <h1 className="titolo text-[56px] sm:text-[80px]">Riepilogo</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {card.map((c) => (
          <Link key={c.href} href={c.href} className={`rounded-card p-6 transition-transform hover:-translate-y-1 ${c.stile}`}>
            <span className="titolo block text-[96px]">{c.numero}</span>
            <span className="mt-1 flex items-center justify-between gap-3 font-titolo text-[26px] font-extrabold uppercase leading-none">{c.titolo}<IconaFreccia /></span>
          </Link>
        ))}
      </div>
      <p className="mt-8 rounded-card bg-rosa p-5 font-medium">In arrivo nella prossima fase: certificati medici, documenti e consensi privacy.</p>
    </>
  );
}
