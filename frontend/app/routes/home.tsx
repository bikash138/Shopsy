import { Link } from "react-router";
import {
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Truck,
} from "lucide-react";
import type { Route } from "./+types/home";
import { useProducts } from "~/hooks";
import { ProductCard } from "~/components/product-card";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Shopsy — a marketplace for everyone" },
    { name: "description", content: "Discover products from independent sellers, or open your own store in minutes." },
  ];
}

const features = [
  {
    icon: Tag,
    title: "Curated catalog",
    desc: "Browse thousands of products across every category, with search and filters built in.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & simple",
    desc: "Protected sessions and a streamlined checkout that just works — no friction.",
  },
  {
    icon: Store,
    title: "Sell in minutes",
    desc: "List products, manage stock, and fulfil orders from one clean dashboard.",
  },
];

const steps = [
  {
    icon: ShoppingBag,
    title: "Create an account",
    desc: "Sign up as a customer to shop, or as a seller to start listing.",
  },
  {
    icon: PackageCheck,
    title: "Shop or list",
    desc: "Add items to your cart, or publish products to your storefront.",
  },
  {
    icon: Truck,
    title: "Checkout & track",
    desc: "Place orders and follow them all the way through to delivery.",
  },
];

function FeaturedProducts() {
  const { data, isLoading } = useProducts({ limit: 4 });
  const featured = data?.items ?? [];

  // Hide the section entirely when there's nothing to show (e.g. unseeded DB).
  if (!isLoading && featured.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
      <div className="flex items-end justify-between">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Featured products
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/products">
            View all <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))
          : featured.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-20%] h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,var(--background))]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:py-32">
          <Badge variant="secondary" className="mb-5">
            <Sparkles className="size-3" /> Buy and sell, all in one place
          </Badge>

          <h1 className="mx-auto max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            The marketplace where <span className="text-primary">everyone</span> wins.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-balance text-muted-foreground">
            Discover great products from independent sellers — or open your own
            store and start selling in minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-11 px-6 text-base">
              <Link to="/products">
                Start shopping <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-6 text-base">
              <Link to="/signup">Become a seller</Link>
            </Button>
          </div>
        </div>
      </section>

      <FeaturedProducts />

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            From first visit to delivered order in three simple steps.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="relative flex flex-col items-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background">
                <Icon className="size-5" />
              </div>
              <span className="mt-4 text-xs font-medium tracking-widest text-muted-foreground">
                STEP {i + 1}
              </span>
              <h3 className="mt-1 font-medium">{title}</h3>
              <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <Card className="relative overflow-hidden bg-primary p-10 text-center text-primary-foreground ring-0 sm:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-size-[20px_20px]" />
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Ready to grow your business?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Open your store on Shopsy and reach customers everywhere. No setup
            fees, no hassle.
          </p>
          <Button asChild variant="secondary" className="mt-6 h-11 px-6 text-base">
            <Link to="/signup">
              Open your store <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-heading font-semibold text-foreground">
            <ShoppingBag className="size-4" /> Shopsy
          </div>
          <div className="flex items-center gap-5">
            <Link to="/products" className="hover:text-foreground">Shop</Link>
            <Link to="/signin" className="hover:text-foreground">Sign in</Link>
            <Link to="/signup" className="hover:text-foreground">Sign up</Link>
          </div>
          <p>© {new Date().getFullYear()} Shopsy</p>
        </div>
      </footer>
    </div>
  );
}
