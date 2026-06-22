import { Link } from "react-router";
import type { Route } from "./+types/order-detail";
import { requireRole } from "~/lib/auth.server";
import { useCustomerOrder } from "~/hooks";
import { formatDate, formatPrice } from "~/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "~/components/status-badge";
import { CancelOrderButton } from "~/components/cancel-order-button";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireRole(request, "customer");
  return { id: params.id };
}

export default function OrderDetail({ loaderData }: Route.ComponentProps) {
  const { data: order, isLoading, isError } = useCustomerOrder(loaderData.id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Order #{order._id.slice(-6)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <Card className="mt-6 p-0">
        {order.products.map((item, i) => (
          <div key={`${item.product}-${i}`}>
            {i > 0 && <Separator />}
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between p-4">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
        </div>
      </Card>

      {order.orderStatus === "processing" && (
        <div className="mt-6 flex justify-end">
          <CancelOrderButton orderId={order._id} size="default" />
        </div>
      )}
    </div>
  );
}
