"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import OrderForm from "@/components/orders/OrderForm";
import { getOrderDetails, type OrderViewDetailsDto, type OrderUpdateDto } from "@/lib/api/orders";

export default function OrderEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [initialData, setInitialData] = useState<OrderUpdateDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const d: OrderViewDetailsDto = await getOrderDetails(id);

        const mapped: OrderUpdateDto = {
          orderId: d.orderId,
          deliveryBatchId: d.deliveryBatchId,
          deliveryRound: d.deliveryRound ?? null,
          orderDate: d.orderDate ?? null,                   // ISO | null
          actualDeliveryDate: d.actualDeliveryDate ?? null, // yyyy-MM-dd | null
          note: d.note ?? null,
          status: d.status,
          cancelReason: d.cancelReason ?? null,
          orderItems: (d.orderItems ?? []).map((it) => ({
            orderItemId: it.orderItemId,
            orderId: d.orderId,
            contractDeliveryItemId: it.contractDeliveryItemId,
            productId: it.productId,
            quantity: it.quantity ?? 0,
            unitPrice: it.unitPrice ?? 0,
            discountAmount: it.discountAmount ?? 0,
            note: it.note ?? null,
          })),
        };

        if (mounted) setInitialData(mapped);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load order details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="max-w-6xl mx-auto py-10 text-center text-muted-foreground">Loading order...</div>;
  if (!initialData) return <div className="max-w-6xl mx-auto py-10 text-center text-destructive">Order not found.</div>;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <OrderForm initialData={initialData} onSuccess={() => router.push("/dashboard/manager/orders")} />
    </div>
  );
}
