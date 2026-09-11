import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing public Supabase configuration");
  }

  return { url, key };
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getPublicSupabaseConfig();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Validates/refreshes the JWT used by server-rendered routes.
  await supabase.auth.getClaims();
  return response;
}
