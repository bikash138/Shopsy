import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/products";
import { getSession } from "~/lib/auth.server";
import { useAddToCart, useCategories, useProducts } from "~/hooks";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { ProductCard } from "~/components/product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Shop · Shopsy" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  return { session: await getSession(request) };
}

export default function Products({ loaderData }: Route.ComponentProps) {
  const isCustomer = loaderData.session?.role === "customer";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({
    search: search || undefined,
    category,
    page,
    limit: 12,
  });
  const { data: categories } = useCategories();
  const addToCart = useAddToCart();

  const products = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold">Shop</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="sm:w-56"
          />
          <Select
            value={category ?? "all"}
            onValueChange={(v) => {
              setCategory(v === "all" ? undefined : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">No products found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              action={
                p.stock === 0 ? (
                  <span className="text-xs text-destructive">Out of stock</span>
                ) : isCustomer ? (
                  <Button
                    size="sm"
                    onClick={() => addToCart.mutate({ productId: p._id })}
                    disabled={
                      addToCart.isPending &&
                      addToCart.variables?.productId === p._id
                    }
                  >
                    Add
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/signin">Sign in</Link>
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
