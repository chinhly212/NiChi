import { jsonError } from "./response.js";

export async function requireUser(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { error: jsonError("Missing Bearer token", 401, "UNAUTHORIZED") };
  }

  const token = authHeader.slice(7).trim();
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return { error: jsonError("Invalid or expired session", 401, "INVALID_TOKEN") };
  }

  const user = await res.json();
  return { user };
}
