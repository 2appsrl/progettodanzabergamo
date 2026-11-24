import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { esciGenitori } from "@/app/genitori/azioni";
import { BarraGenitori } from "@/components/genitori/BarraGenitori";
import { Logo } from "@/components/ui/Logo";
import { caricaFamiglia } from "@/lib/genitori";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: { default: "Area genitori", template: "%s · Area genitori" } };

export default async function LayoutGenitori({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/genitori/accedi");
  const { famiglie } = await caricaFamiglia(supabase, user.email);

  if (famiglie.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-giallo px-4 py-16 text-center">
        <h1 className="titolo titolo-sezione">Email non collegata</h1>
        <p className="mt-4 max-w-md text-[19px] font-medium">L&apos;indirizzo {user.email} non è collegato a nessuna allieva. Chiedi alla maestra di aggiungerlo alla scheda di tua figlia o tuo figlio, poi rientra.</p>
        <form action={esciGenitori}><button className="mt-8 min-h-[52px] rounded-full bg-nero px-7 font-titolo text-[22px] font-extrabold uppercase text-white">Esci</button></form>
      </main>
    );
  }

  return (
    <>
      <header className="su-scuro bg-magenta text-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3 md:max-w-5xl">
          <Logo misura={52} invertito />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-titolo text-[24px] font-extrabold uppercase leading-none">Area genitori</p>
            <p className="truncate text-[15px] font-medium">{famiglie[0].nome_genitore ? `Ciao ${famiglie[0].nome_genitore.split(" ")[0]}` : user.email}</p>
          </div>
          <div className="order-last w-full md:order-none md:w-auto"><BarraGenitori /></div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6 md:max-w-5xl md:pb-12">{children}</main>
    </>
  );
}
