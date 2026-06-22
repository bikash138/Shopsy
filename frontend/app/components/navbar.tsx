import { Link, useRevalidator } from "react-router";
import { ShoppingBag } from "lucide-react";
import type { AuthSession } from "~/api";
import { useSignout } from "~/hooks";
import { Button } from "~/components/ui/button";

export function Navbar({ session }: { session: AuthSession | null }) {
  const signout = useSignout();
  const revalidator = useRevalidator();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <ShoppingBag className="size-5" />
            Shopsy
          </Link>

          <div className="hidden items-center gap-4 text-sm sm:flex">
            <Link to="/products" className="text-muted-foreground hover:text-foreground">
              Shop
            </Link>
            {session?.role === "customer" && (
              <>
                <Link to="/cart" className="text-muted-foreground hover:text-foreground">
                  Cart
                </Link>
                <Link to="/orders" className="text-muted-foreground hover:text-foreground">
                  Orders
                </Link>
              </>
            )}
            {session?.role === "seller" && (
              <Link to="/seller" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">Profile</Link>
              </Button>
              <span className="mr-1 hidden text-sm text-muted-foreground capitalize sm:inline">
                {session.role}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  // Re-run the layout loader so the navbar reflects the logout.
                  signout.mutate(undefined, {
                    onSuccess: () => revalidator.revalidate(),
                  })
                }
                disabled={signout.isPending}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
