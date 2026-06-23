import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerApi } from "~/api";
import { loadRazorpay } from "~/lib/razorpay";
import { queryKeys } from "~/lib/query-keys";
import { Button } from "~/components/ui/button";

export function PayButton({
  orderId,
  size = "sm",
}: {
  orderId: string;
  size?: "sm" | "default";
}) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    try {
      const ready = await loadRazorpay();
      if (!ready) {
        toast.error("Couldn't load the payment gateway. Check your connection.");
        return;
      }

      // Create the Razorpay order on the backend.
      const data = await customerApi.createPayment(orderId);

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Shopsy",
        description: `Order #${orderId.slice(-6)}`,
        handler: async (response) => {
          try {
            await customerApi.verifyPayment(orderId, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful");
            qc.invalidateQueries({ queryKey: queryKeys.customerOrders.all });
            qc.invalidateQueries({
              queryKey: queryKeys.customerOrders.detail(orderId),
            });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Verification failed");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.on("payment.failed", () => toast.error("Payment failed. Please try again."));
      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment");
    } finally {
      // The modal is open by now; re-enable the button.
      setLoading(false);
    }
  }

  return (
    <Button size={size} onClick={pay} disabled={loading}>
      {loading ? "Starting…" : "Pay now"}
    </Button>
  );
}
