import { Outlet } from "react-router";
import type { Route } from "./+types/main-layout";
import { getSession } from "~/lib/auth.server";
import { Navbar } from "~/components/navbar";

export async function loader({ request }: Route.LoaderArgs) {
  // Resolve auth on the server so the navbar renders correctly on first paint.
  return { session: await getSession(request) };
}

export default function MainLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar session={loaderData.session} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
