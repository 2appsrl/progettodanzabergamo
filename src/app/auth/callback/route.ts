import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Qui arriva chi tocca il link ricevuto via email: creiamo la sessione e lo portiamo dentro.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const prossima = url.searchParams.get("next") ?? "/maestre";
  const destinazione = prossima.startsWith("/") && !prossima.startsWith("//") ? prossima : "/maestre";
  const supabase = await supabaseServer();

  const codice = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (codice) ok = !(await supabase.auth.exchangeCodeForSession(codice)).error;
  else if (token_hash && tipo) ok = !(await supabase.auth.verifyOtp({ token_hash, type: tipo })).error;

  return NextResponse.redirect(new URL(ok ? destinazione : `${destinazione.startsWith("/genitori") ? "/genitori" : "/maestre"}/accedi?errore=link`, url.origin));
}
