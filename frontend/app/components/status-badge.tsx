import { Badge } from "~/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "~/api";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const orderVariants: Record<OrderStatus, BadgeVariant> = {
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

const paymentVariants: Record<PaymentStatus, BadgeVariant> = {
  pending: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "outline",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={orderVariants[status]} className="capitalize">{status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariants[status]} className="capitalize">{status}</Badge>;
}
