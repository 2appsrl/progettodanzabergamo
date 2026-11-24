"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconaCalendario, IconaCasa, IconaDocumento, IconaPersona } from "@/components/ui/Icone";

const voci = [
  { href: "/genitori", testo: "Home", Icona: IconaCasa },
  { href: "/genitori/calendario", testo: "Calendario", Icona: IconaCalendario },
  { href: "/genitori/documenti", testo: "Documenti", Icona: IconaDocumento },
  { href: "/genitori/profilo", testo: "Profilo", Icona: IconaPersona },
];

// Navigazione dell'area genitori: barra fissa in basso su telefono, in alto su computer.
export function BarraGenitori() {
  const percorso = usePathname();
  const attiva = (href: string) => (href === "/genitori" ? percorso === href || percorso.startsWith("/genitori/avvisi") : percorso.startsWith(href));
  return (
    <nav
      aria-label="Menu area genitori"
      className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-nero bg-white pb-[env(safe-area-inset-bottom)] md:static md:border-0 md:bg-transparent md:pb-0"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4 md:flex md:max-w-none md:gap-2">
        {voci.map(({ href, testo, Icona }) => (
          <li key={href}>
            <Link
              href={href} aria-current={attiva(href) ? "page" : undefined}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-0.5 text-[13px] font-bold md:min-h-[48px] md:flex-row md:gap-2 md:rounded-full md:px-5 md:font-titolo md:text-[20px] md:font-extrabold md:uppercase ${
                attiva(href) ? "bg-magenta text-white md:bg-nero" : "text-nero md:bg-white md:hover:bg-giallo"
              }`}
            >
              <Icona width={24} height={24} />{testo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
