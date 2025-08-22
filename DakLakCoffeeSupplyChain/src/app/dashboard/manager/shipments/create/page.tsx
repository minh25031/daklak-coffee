"use client";

import ShipmentForm from "@/components/shipments/ShipmentForm";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAllUserAccounts } from "@/lib/api/userAccounts";

export default function CreateShipmentPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const orderId = typeof searchParams.orderId === "string" ? searchParams.orderId : undefined;

  const [staffOptions, setStaffOptions] = useState<
    { deliveryStaffId: string; name: string }[]
  >([]);

  useEffect(() => {
    getAllUserAccounts()
      .then((rows) =>
        setStaffOptions(
          (rows || [])
            .filter((u) => u.roleName === "DeliveryStaff")
            .map((u) => ({ deliveryStaffId: u.userId, name: u.name }))
        )
      )
      .catch(() => setStaffOptions([]));
  }, []);

  return (
    <ShipmentForm
      onSuccess={() => router.push("/dashboard/manager/shipments")}
      orderId={orderId}
      deliveryStaffOptions={staffOptions}
    />
  );
}
