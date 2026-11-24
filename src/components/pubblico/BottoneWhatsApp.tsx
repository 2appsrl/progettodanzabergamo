import { IconaWhatsApp } from "@/components/ui/Icone";
import { getScuola } from "@/lib/dati";
import { linkWhatsApp } from "@/lib/formato";

// Pulsante fisso in basso a destra: apre la chat WhatsApp della scuola.
export async function BottoneWhatsApp() {
  const scuola = await getScuola();
  return (
    <a
      href={linkWhatsApp(scuola.whatsapp, "Ciao! Vorrei informazioni sui corsi.")}
      target="_blank" rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-30 inline-flex h-[60px] items-center gap-2 rounded-full border-[3px] border-white bg-nero px-5 font-titolo text-[20px] font-extrabold uppercase text-white shadow-[0_6px_0_rgba(26,26,26,0.25)] hover:bg-black"
      aria-label="Scrivici su WhatsApp"
    >
      <IconaWhatsApp width={26} height={26} className="text-giallo" />
      <span className="hidden sm:inline">Scrivici</span>
    </a>
  );
}
