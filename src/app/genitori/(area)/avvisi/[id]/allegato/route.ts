import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Apre l'allegato di un avviso con un link temporaneo (valido 2 minuti).
// Funziona solo per chi può vedere quell'avviso: lo decide il database.
export async function GET(_richiesta: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: avviso } = await supabase.from("avvisi").select("allegato_path").eq("id", id).maybeSingle();
  if (!avviso?.allegato_path) return new Response("Allegato non trovato", { status: 404 });
  const { data } = await supabase.storage.from("allegati").createSignedUrl(avviso.allegato_path, 120);
  if (!data?.signedUrl) return new Response("Allegato non disponibile", { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
