import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { quando } from "@/lib/richieste";
import { leggiRichiesta } from "./dati";

// Immagine di anteprima che WhatsApp mostra quando si condivide il link: logo, titolo e data.
export const alt = "Progetto Danza Bergamo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Immagine({ params }: { params: Promise<{ codice: string }> }) {
  const [r, titoli, testo] = await Promise.all([
    leggiRichiesta((await params).codice),
    readFile(join(process.cwd(), "assets/barlow-condensed-latin-900-normal.woff")),
    readFile(join(process.cwd(), "assets/barlow-latin-600-normal.woff")),
  ]);
  const titolo = (r?.titolo ?? "Progetto Danza Bergamo").toUpperCase();
  const data = r ? quando(r) : "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#d13583", color: "#ffffff", padding: 64, fontFamily: "Barlow" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 132, height: 132, borderRadius: 66, background: "#ffffff", color: "#d13583", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed", fontSize: 25, lineHeight: 0.95 }}>
            <span>PROGETTO</span><span>DANZA</span><span>BERGAMO</span>
          </div>
          <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontSize: 44 }}>PROGETTO DANZA BERGAMO</div>
        </div>
        <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontSize: titolo.length > 34 ? 84 : 112, lineHeight: 0.92 }}>{titolo}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {data ? <div style={{ display: "flex", background: "#ffd23f", color: "#1a1a1a", borderRadius: 999, padding: "14px 30px", fontSize: 31, whiteSpace: "nowrap", flexShrink: 0 }}>{data}</div> : null}
          <div style={{ display: "flex", background: "#1a1a1a", borderRadius: 999, padding: "14px 30px", fontSize: 31, whiteSpace: "nowrap", flexShrink: 0 }}>Rispondi con un tocco</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Barlow Condensed", data: titoli, style: "normal", weight: 900 },
        { name: "Barlow", data: testo, style: "normal", weight: 600 },
      ],
    },
  );
}
