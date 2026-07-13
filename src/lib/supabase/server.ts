import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

// Voor gebruik in Server Components, Server Actions en Route Handlers.
export async function createSupabaseServerClient() {
  const { url, anonKey } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components mogen geen cookies zetten; de proxy (zie
          // src/proxy.ts) ververst de sessie dan in plaats daarvan.
        }
      },
    },
  });
}
