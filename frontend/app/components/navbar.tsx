import { Link } from "react-router";
import { ShoppingBag } from "lucide-react";
import { useMe, useSignout } from "~/hooks";
import { Button } from "~/components/ui/button";

export function Navbar() {
  const { data: session, isLoading } = useMe();
  const signout = useSignout();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <ShoppingBag className="size-5" />
          Shopsy
        </Link>

        <div className="flex items-center gap-2">
          {isLoading ? null : session ? (
            <>
              <span className="mr-1 hidden text-sm text-muted-foreground capitalize sm:inline">
                {session.role}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signout.mutate()}
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
