"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { IconaChiudi, IconaMenu, IconaPersona } from "@/components/ui/Icone";

const voci = [
  { href: "/corsi", testo: "Corsi" },
  { href: "/orari", testo: "Orari" },
  { href: "/chi-siamo", testo: "Chi siamo" },
  { href: "/eventi", testo: "Eventi" },
  { href: "/contatti", testo: "Contatti" },
];

export function Header() {
  const [aperto, setAperto] = useState(false);

  // Quando il menu del telefono è aperto, la pagina sotto non scorre.
  useEffect(() => {
    document.body.style.overflow = aperto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [aperto]);

  return (
    <header className="su-scuro sticky top-0 z-40 bg-magenta text-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Progetto Danza Bergamo, home" onClick={() => setAperto(false)}>
          <Logo misura={52} />
          <span className="hidden font-titolo text-[22px] font-extrabold uppercase leading-[0.95] sm:block">
            Progetto Danza<br />Bergamo
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Menu principale">
          {voci.map((v) => (
            <Link key={v.href} href={v.href} className="rounded-full px-4 py-2.5 font-titolo text-[22px] font-extrabold uppercase hover:bg-magenta-scuro">
              {v.testo}
            </Link>
          ))}
        </nav>

        <Link
          href="/genitori/accedi"
          className="ml-auto inline-flex min-h-[48px] items-center gap-2 rounded-full bg-nero px-5 font-titolo text-[20px] font-extrabold uppercase text-white hover:bg-black lg:ml-2"
        >
          <IconaPersona width={20} height={20} /> Area genitori
        </Link>

        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-nero lg:hidden"
          aria-label={aperto ? "Chiudi il menu" : "Apri il menu"}
          aria-expanded={aperto}
          onClick={() => setAperto(!aperto)}
        >
          {aperto ? <IconaChiudi /> : <IconaMenu />}
        </button>
      </div>

      {aperto && (
        <nav className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-magenta px-4 pb-10 pt-4 lg:hidden" aria-label="Menu principale">
          <ul>
            {voci.map((v) => (
              <li key={v.href} className="border-b-2 border-white/30">
                <Link href={v.href} onClick={() => setAperto(false)} className="titolo block py-4 text-[52px]">
                  {v.testo}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/prenota-una-prova"
            onClick={() => setAperto(false)}
            className="mt-8 flex min-h-[60px] items-center justify-center rounded-full bg-giallo font-titolo text-[26px] font-extrabold uppercase text-nero"
          >
            Prenota una prova
          </Link>
        </nav>
      )}
    </header>
  );
}
