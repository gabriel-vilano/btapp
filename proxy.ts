import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_AFTER_LOGIN, LOGIN_RETURN_PARAM, safeReturnPath } from "@/src/lib/navigation/loginReturn";
import { getSupabasePublicEnv } from "@/src/lib/supabase/env";

const PUBLIC_AUTH_ROUTES = ["/", "/entrar", "/cadastro"];
const ALWAYS_PUBLIC_ROUTES = [
  "/cadastro/verificar",
  "/cadastro/perfil",
  "/recuperar-senha",
  "/recuperar-senha/verificar",
  "/recuperar-senha/nova-senha",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { url, publishableKey } = getSupabasePublicEnv();
  const supabase = createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (user && PUBLIC_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (!user && !PUBLIC_AUTH_ROUTES.includes(pathname) && !ALWAYS_PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(loginRedirectUrl(request));
  }

  return response;
}

// Vai direto para /entrar: passar por "/" perdia o `expired`, porque o
// redirect("/entrar") da página raiz descarta a query string.
function loginRedirectUrl(request: NextRequest): URL {
  const redirectUrl = new URL("/entrar", request.url);
  const hasSessionCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (hasSessionCookie) {
    redirectUrl.searchParams.set("expired", "true");
  }
  const returnPath = safeReturnPath(`${request.nextUrl.pathname}${request.nextUrl.search}`);
  // O feed já é o destino padrão do login: sem o parâmetro, a URL fica limpa
  if (returnPath !== DEFAULT_AFTER_LOGIN) {
    redirectUrl.searchParams.set(LOGIN_RETURN_PARAM, returnPath);
  }
  return redirectUrl;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
