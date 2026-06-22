import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/product-detail";
import { getSession } from "~/lib/auth.server";
import { useAddToCart, useProduct } from "~/hooks";
import { formatPrice } from "~/lib/format";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export async function loader({ request, params }: Route.LoaderArgs) {
  return { session: await getSession(request), id: params.id };
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { id, session } = loaderData;
  const isCustomer = session?.role === "customer";
  const { data: product, isLoading, isError } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/products">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const sellerName = typeof product.seller === "object" ? product.seller.name : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
      <img
        src={product.image}
        alt={product.name}
        className="aspect-square w-full rounded-xl object-cover ring-1 ring-foreground/10"
      />
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <h1 className="font-heading text-3xl font-semibold">{product.name}</h1>
          {sellerName && (
            <p className="mt-1 text-sm text-muted-foreground">Sold by {sellerName}</p>
          )}
        </div>

        <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
        <p className="text-muted-foreground">{product.description}</p>

        <p className="text-sm">
          {product.stock > 0 ? (
            <span className="text-muted-foreground">{product.stock} in stock</span>
          ) : (
            <span className="text-destructive">Out of stock</span>
          )}
        </p>

        {product.stock > 0 &&
          (isCustomer ? (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </Button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                >
                  +
                </Button>
              </div>
              <Button
                onClick={() =>
                  addToCart.mutate({ productId: product._id, quantity })
                }
                disabled={addToCart.isPending}
              >
                Add to cart
              </Button>
            </div>
          ) : (
            <Button asChild variant="outline" className="mt-2 w-fit">
              <Link to="/signin">Sign in to buy</Link>
            </Button>
          ))}
      </div>
    </div>
  );
}
