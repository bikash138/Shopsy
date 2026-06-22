import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Product } from "~/api";
import { formatPrice } from "~/lib/format";
import { Card } from "~/components/ui/card";

export function ProductCard({
  product,
  action,
}: {
  product: Product;
  action?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <Link to={`/products/${product._id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover transition-opacity hover:opacity-90"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          to={`/products/${product._id}`}
          className="font-medium hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {action}
        </div>
      </div>
    </Card>
  );
}
