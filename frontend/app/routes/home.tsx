import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Shopsy" },
    { name: "description", content: "Buy and sell on Shopsy." },
  ];
}

export default function Home() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        Everything you need, in one place.
      </h1>
      <p className="mt-4 max-w-xl text-balance text-muted-foreground">
        Shopsy is a simple marketplace where customers shop and sellers grow.
        Create an account to get started.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button asChild size="lg">
          <Link to="/signup">Get started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/signin">Sign in</Link>
        </Button>
      </div>
    </section>
  );
}
