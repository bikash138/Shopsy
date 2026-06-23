import { Link, useNavigate } from "react-router";
import { Trash2 } from "lucide-react";
import type { Route } from "./+types/cart";
import type { CartItem, Product } from "~/api";
import { requireRole } from "~/lib/auth.server";
import {
  useCart,
  useClearCart,
  usePlaceOrder,
  useRemoveCartItem,
  useUpdateCartItem,
} from "~/hooks";
import { formatPrice } from "~/lib/format";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Cart · Shopsy" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireRole(request, "customer");
  return null;
}

type Line = { item: CartItem; product: Product };

export default function Cart() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const placeOrder = usePlaceOrder();

  const lines: Line[] = (cart?.items ?? [])
    .map((item) => ({
      item,
      product: typeof item.product === "object" ? item.product : null,
    }))
    .filter((l): l is Line => l.product !== null);

  const total = lines.reduce((sum, l) => sum + l.product.price * l.item.quantity, 0);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold">Your cart is empty</h1>
        <Button asChild className="mt-6">
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Your cart</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearCart.mutate()}
          disabled={clearCart.isPending}
        >
          Clear cart
        </Button>
      </div>

      <Card className="mt-6 p-0">
        {lines.map(({ item, product }, i) => (
          <div key={product._id}>
            {i > 0 && <Separator />}
            <div className="flex items-center gap-4 p-4">
              <img
                src={product.image}
                alt={product.name}
                className="size-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${product._id}`}
                  className="font-medium hover:underline"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={updateItem.isPending}
                  onClick={() =>
                    updateItem.mutate({
                      productId: product._id,
                      quantity: item.quantity - 1,
                    })
                  }
                >
                  −
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={updateItem.isPending || item.quantity >= product.stock}
                  onClick={() =>
                    updateItem.mutate({
                      productId: product._id,
                      quantity: item.quantity + 1,
                    })
                  }
                >
                  +
                </Button>
              </div>

              <span className="w-20 text-right font-medium">
                {formatPrice(product.price * item.quantity)}
              </span>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeItem.mutate(product._id)}
                disabled={removeItem.isPending}
                aria-label="Remove"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-semibold">{formatPrice(total)}</span>
      </div>

      <Button
        className="mt-4 w-full"
        size="lg"
        disabled={placeOrder.isPending}
        onClick={() =>
          placeOrder.mutate(undefined, {
            // Land on the new order so the customer can pay right away.
            onSuccess: (order) => navigate(`/orders/${order._id}`),
          })
        }
      >
        {placeOrder.isPending ? "Placing order…" : "Checkout"}
      </Button>
    </div>
  );
}
