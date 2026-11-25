import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { esci } from "@/app/maestre/azioni";
import { Logo } from "@/components/ui/Logo";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: { default: "Area maestre", template: "%s · Area maestre" } };

const voci = [
  ["/maestre", "Riepilogo"], ["/maestre/richieste", "Conferme"], ["/maestre/avvisi", "Avvisi"], ["/maestre/calendario", "Calendario"],
  ["/maestre/allieve", "Allieve"], ["/maestre/certificati", "Certificati"], ["/maestre/documenti", "Documenti"],
  ["/maestre/prove", "Richieste di prova"],
  ["/maestre/corsi", "Corsi e orari"], ["/maestre/merch", "Merchandising"], ["/maestre/impostazioni", "Impostazioni"],
];

export default async function LayoutMaestre({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/maestre/accedi");

  // L'elenco maestre è visibile solo alle maestre: se torna vuoto, chi è entrato non lo è.
  const { data: maestra } = await supabase.from("maestre").select("nome").eq("email", (user.email ?? "").toLowerCase()).maybeSingle();

  if (!maestra) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-giallo px-4 py-16 text-center">
        <h1 className="titolo titolo-sezione">Accesso non abilitato</h1>
        <p className="mt-4 max-w-md text-[19px] font-medium">L&apos;indirizzo {user.email} non è tra quelli delle maestre.</p>
        <form action={esci}><button className="mt-8 min-h-[52px] rounded-full bg-nero px-7 font-titolo text-[22px] font-extrabold uppercase text-white">Esci</button></form>
      </main>
    );
  }

  return (
    <>
      <header className="su-scuro bg-magenta text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Logo misura={56} invertito />
          <div className="min-w-0 leading-tight">
            <p className="font-titolo text-[26px] font-extrabold uppercase leading-none">Area maestre</p>
            <p className="truncate text-[15px] font-medium">Ciao {maestra.nome}</p>
          </div>
          <form action={esci} className="ml-auto">
            <button className="min-h-[48px] rounded-full bg-nero px-5 font-titolo text-[20px] font-extrabold uppercase text-white hover:bg-black">Esci</button>
          </form>
        </div>
        <nav aria-label="Menu area maestre" className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {voci.map(([href, nome]) => (
            <Link key={href} href={href} className="inline-flex min-h-[48px] shrink-0 items-center rounded-full bg-white px-5 font-titolo text-[20px] font-extrabold uppercase text-nero hover:bg-giallo">
              {nome}
            </Link>
          ))}
          <Link href="/" className="inline-flex min-h-[48px] shrink-0 items-center rounded-full border-[3px] border-white px-5 font-titolo text-[20px] font-extrabold uppercase hover:bg-magenta-scuro">Vedi il sito</Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
