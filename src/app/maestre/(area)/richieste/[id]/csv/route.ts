import { supabaseServer } from "@/lib/supabase/server";
import { caricaDettaglio } from "../../dettaglio";

// Elenco scaricabile, apribile con Excel (separatore ";", come si usa in Italia).
const cella = (v: string) => `"${v.replace(/"/g, '""')}"`;

export async function GET(_richiesta: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const dettaglio = await caricaDettaglio(supabase, id);
  if (!dettaglio) return new Response("Non trovata", { status: 404 });

  const quando = (iso: string | null) =>
    iso ? new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Rome" }).format(new Date(iso)) : "";
  const righe = [
    ["Cognome", "Nome", "Risposta", "Data e ora", "Genitore", "Telefono"],
    ...dettaglio.righe.map((a) => [a.cognome, a.nome, a.scelta ?? "Senza risposta", quando(a.risposta_il), a.genitore, a.telefono]),
  ];
  const csv = "﻿" + righe.map((r) => r.map(cella).join(";")).join("\r\n") + "\r\n";
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="conferme-${dettaglio.richiesta.codice}.csv"` },
  });
}
