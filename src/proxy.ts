import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// Gira prima delle pagine dell'area maestre: tiene viva la sessione
// e rimanda al login chi non è entrato.
export async function proxy(request: NextRequest) {
  let risposta = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        risposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => risposta.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();

  const percorso = request.nextUrl.pathname;
  if (!data.user && percorso !== "/maestre/accedi") {
    const url = request.nextUrl.clone();
    url.pathname = "/maestre/accedi";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return risposta;
}

export const config = { matcher: ["/maestre/:path*"] };
