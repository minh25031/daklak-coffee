"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrderForm from "@/components/orders/OrderForm";

export default function OrderCreatePage() {
  const router = useRouter();
  const search = useSearchParams();

  // cho phép truyền sẵn deliveryBatchId qua URL: ?deliveryBatchId=...
  const deliveryBatchId = search.get("deliveryBatchId") ?? undefined;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <OrderForm
        deliveryBatchId={deliveryBatchId}
        onSuccess={() => router.push("/dashboard/manager/orders")}
      />
    </div>
  );
}
