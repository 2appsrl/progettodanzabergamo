import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { IconaInstagram, IconaLuogo } from "@/components/ui/Icone";
import { getScuola, getSedi } from "@/lib/dati";

export async function Footer() {
  const [scuola, sedi] = await Promise.all([getScuola(), getSedi()]);
  return (
    <footer className="su-scuro bg-nero text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo misura={84} />
          <p className="titolo mt-5 text-[40px] text-giallo">{scuola.motto}</p>
        </div>
        <div>
          <h2 className="font-titolo text-[26px] font-extrabold uppercase">Le sedi</h2>
          <ul className="mt-3 space-y-3">
            {sedi.map((s) => (
              <li key={s.id} className="flex gap-2">
                <IconaLuogo className="mt-0.5 shrink-0 text-magenta" />
                <span><strong>{s.nome}</strong><br /><span className="text-white/70">{s.indirizzo}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-titolo text-[26px] font-extrabold uppercase">Link utili</h2>
          <ul className="mt-3 space-y-1">
            {[
              ["/corsi", "Corsi"], ["/orari", "Orari"], ["/merchandising", "Merchandising"], ["/prenota-una-prova", "Prenota una prova"],
              ["/privacy", "Privacy"], ["/cookie", "Cookie"],
            ].map(([href, testo]) => (
              <li key={href}><Link href={href} className="inline-block py-1.5 underline-offset-4 hover:underline">{testo}</Link></li>
            ))}
          </ul>
          <a
            href={`https://www.instagram.com/${scuola.instagram}/`} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[48px] max-w-full items-center gap-2 rounded-full bg-white px-5 text-[15px] font-bold text-nero hover:bg-rosa"
          >
            <IconaInstagram /> @{scuola.instagram}
          </a>
        </div>
      </div>
      <p className="border-t border-white/20 px-4 py-5 text-center text-sm text-white/60">
        © {new Date().getFullYear()} {scuola.nome}
      </p>
    </footer>
  );
}
