import { NavLink, Outlet } from "react-router";
import type { Route } from "./+types/seller-layout";
import { requireRole } from "~/lib/auth.server";
import { cn } from "~/lib/utils";

export async function loader({ request }: Route.LoaderArgs) {
  await requireRole(request, "seller");
  return null;
}

function tabClass({ isActive }: { isActive: boolean }) {
  return cn(
    "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "border-primary text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground"
  );
}

export default function SellerLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold">Seller dashboard</h1>

      <nav className="mt-4 flex gap-1 border-b border-border">
        <NavLink to="/seller" end className={tabClass}>
          Products
        </NavLink>
        <NavLink to="/seller/orders" className={tabClass}>
          Orders
        </NavLink>
      </nav>

      <div className="py-6">
        <Outlet />
      </div>
    </div>
  );
}
