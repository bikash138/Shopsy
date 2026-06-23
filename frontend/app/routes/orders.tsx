import { Link } from "react-router";
import type { Route } from "./+types/orders";
import { requireRole } from "~/lib/auth.server";
import { useCustomerOrders } from "~/hooks";
import { formatDate, formatPrice } from "~/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "~/components/status-badge";
import { CancelOrderButton } from "~/components/cancel-order-button";
import { PayButton } from "~/components/pay-button";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Orders · Shopsy" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireRole(request, "customer");
  return null;
}

export default function Orders() {
  const { data: orders, isLoading } = useCustomerOrders();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-6 h-28 w-full rounded-xl" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold">No orders yet</h1>
        <Button asChild className="mt-6">
          <Link to="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold">Your orders</h1>

      <div className="mt-6 flex flex-col gap-4">
        {orders.map((order) => (
          <Card key={order._id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link
                  to={`/orders/${order._id}`}
                  className="font-medium hover:underline"
                >
                  Order #{order._id.slice(-6)}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt)} · {order.products.length} item
                  {order.products.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.orderStatus} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/orders/${order._id}`}>View</Link>
                </Button>
                {order.paymentStatus === "pending" &&
                  order.orderStatus !== "cancelled" && (
                    <PayButton orderId={order._id} />
                  )}
                {order.orderStatus === "processing" && (
                  <CancelOrderButton orderId={order._id} />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
