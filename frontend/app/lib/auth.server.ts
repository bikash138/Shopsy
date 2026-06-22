import { redirect } from "react-router";
import type { AuthSession, Role } from "~/api";

// Absolute backend URL for server-side fetches (loaders run on the server,
// where the relative "/api" proxy isn't available).
const SERVER_API_URL = process.env.API_URL ?? "http://localhost:5000/api";

// Resolve the current session by forwarding the incoming request's cookies
// to the backend's /auth/me. Returns null when unauthenticated.
export async function getSession(request: Request): Promise<AuthSession | null> {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  const res = await fetch(`${SERVER_API_URL}/auth/me`, {
    headers: { cookie },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { user: AuthSession };
  return data.user;
}

// Require any authenticated user, else redirect to sign in (remembering where
// the user was headed).
export async function requireUser(request: Request): Promise<AuthSession> {
  const session = await getSession(request);
  if (!session) {
    const url = new URL(request.url);
    const params = new URLSearchParams({ redirectTo: url.pathname + url.search });
    throw redirect(`/signin?${params.toString()}`);
  }
  return session;
}

// Require a specific role. Wrong role → home; unauthenticated → sign in.
export async function requireRole(request: Request, role: Role): Promise<AuthSession> {
  const session = await requireUser(request);
  if (session.role !== role) {
    throw redirect("/");
  }
  return session;
}

// For auth pages: bounce already-authenticated users away.
export async function requireGuest(request: Request): Promise<void> {
  const session = await getSession(request);
  if (session) {
    throw redirect("/");
  }
}
