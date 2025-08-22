"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import OrderForm from "@/components/orders/OrderForm";

export default function OrderCreatePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();

  // cho phép truyền sẵn deliveryBatchId qua URL: ?deliveryBatchId=...
  const deliveryBatchId = typeof searchParams.deliveryBatchId === "string" ? searchParams.deliveryBatchId : undefined;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <OrderForm
        deliveryBatchId={deliveryBatchId}
        onSuccess={() => router.push("/dashboard/manager/orders")}
      />
    </div>
  );
}
