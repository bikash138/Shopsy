import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";
import type { CartItem, Product } from "~/api";
import { useCart } from "~/hooks";
import { formatPrice } from "~/lib/format";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

type Line = { item: CartItem; product: Product };

export function CartNav() {
  const { data: cart } = useCart();

  const lines: Line[] = (cart?.items ?? [])
    .map((item) => ({
      item,
      product: typeof item.product === "object" ? item.product : null,
    }))
    .filter((l): l is Line => l.product !== null);

  const count = lines.reduce((n, l) => n + l.item.quantity, 0);
  const total = lines.reduce((n, l) => n + l.product.price * l.item.quantity, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="Cart">
          <ShoppingCart className="size-4" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          Your cart{count > 0 ? ` (${count})` : ""}
        </div>

        {lines.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Your cart is empty.
          </div>
        ) : (
          <>
            <ul className="max-h-72 divide-y divide-border overflow-y-auto">
              {lines.map(({ item, product }) => (
                <li key={product._id} className="flex items-center gap-3 px-4 py-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-10 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(product.price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>

            <div className="px-4 pb-4">
              <Button asChild className="w-full">
                <Link to="/cart">View cart</Link>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
