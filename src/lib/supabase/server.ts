import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or Supabase publishable/anon key");
  }

  return { url, key };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getPublicSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies.
          // src/proxy.ts refreshes and persists sessions for requests.
        }
      },
    },
  });
}



// import "server-only";

// import { createServerClient } from "@supabase/ssr";

// import { cookies } from "next/headers";

// import type { Database } from "@/types/database";

// export async function createClient() {
//   const cookieStore = await cookies();

//   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

//   const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//   if (!url || !anonKey) {
//     throw new Error("Supabase server configuration missing");
//   }

//   return createServerClient<Database>(url, anonKey, {
//     cookies: {
//       getAll() {
//         return cookieStore.getAll();
//       },

//       setAll(cookiesToSet) {
//         try {
//           cookiesToSet.forEach(({ name, value, options }) => {
//             cookieStore.set(name, value, options);
//           });
//         } catch {
//           // Server Components cannot always
//           // write cookies directly.
//         }
//       },
//     },
//   });
// }
