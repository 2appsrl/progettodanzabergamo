import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Apre un file privato (certificato o documento) con un link temporaneo di 2 minuti.
// Chi può vederlo lo decide il database: maestre tutto, genitori solo ciò che li riguarda.
const TABELLE = { certificato: { tabella: "certificati", spazio: "certificati" }, documento: { tabella: "documenti", spazio: "documenti" } } as const;

export async function GET(_richiesta: Request, { params }: { params: Promise<{ tipo: string; id: string }> }) {
  const { tipo, id } = await params;
  const dove = TABELLE[tipo as keyof typeof TABELLE];
  if (!dove || !/^[0-9a-f-]{36}$/.test(id)) return new Response("Non trovato", { status: 404 });
  const supabase = await supabaseServer();
  const { data: riga } = await supabase.from(dove.tabella).select("file_path").eq("id", id).maybeSingle();
  if (!riga?.file_path) return new Response("File non trovato", { status: 404 });
  const { data } = await supabase.storage.from(dove.spazio).createSignedUrl(riga.file_path, 120);
  if (!data?.signedUrl) return new Response("File non disponibile", { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
