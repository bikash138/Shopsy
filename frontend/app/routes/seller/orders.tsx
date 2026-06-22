import type { Route } from "./+types/orders";
import type { SellerOrderStatus } from "~/api";
import { useSellerOrders, useUpdateOrderStatus } from "~/hooks";
import { formatDate, formatPrice } from "~/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "~/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Orders · Seller · Shopsy" }];
}

const STATUS_OPTIONS: SellerOrderStatus[] = ["processing", "shipped", "delivered"];

export default function SellerOrders() {
  const { data: orders, isLoading } = useSellerOrders();
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!orders || orders.length === 0) {
    return (
      <p className="mt-16 text-center text-muted-foreground">No orders yet.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const customer =
              typeof order.customer === "object" ? order.customer : null;
            return (
              <TableRow key={order._id}>
                <TableCell className="font-medium">
                  #{order._id.slice(-6)}
                </TableCell>
                <TableCell>
                  {customer ? (
                    <div>
                      <p>{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(order.totalAmount)}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </TableCell>
                <TableCell>
                  {order.orderStatus === "cancelled" ? (
                    <OrderStatusBadge status="cancelled" />
                  ) : (
                    <Select
                      value={order.orderStatus}
                      onValueChange={(value) =>
                        updateStatus.mutate({
                          id: order._id,
                          status: value as SellerOrderStatus,
                        })
                      }
                    >
                      <SelectTrigger size="sm" className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
