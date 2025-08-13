"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ShipmentForm from "@/components/shipments/ShipmentForm";
import { getShipmentDetails } from "@/lib/api/shipments";
import { getAllUserAccounts } from "@/lib/api/userAccounts";

export default function EditShipmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const shipmentId = id as string;

  const [initialData, setInitialData] = useState<any>(null);
  const [orderCode, setOrderCode] = useState<string>("");
  const [staffOptions, setStaffOptions] = useState<
    { deliveryStaffId: string; name: string }[]
  >([]);

  useEffect(() => {
    if (!shipmentId) return;
    getShipmentDetails(shipmentId).then((s) => {
      setInitialData({
        shipmentId: s.shipmentId,
        orderId: s.orderId,
        deliveryStaffId: s.deliveryStaffId,
        shippedQuantity: s.shippedQuantity,
        shippedAt: s.shippedAt,
        deliveryStatus: s.deliveryStatus,
        receivedAt: s.receivedAt,
        shipmentDetails: s.shipmentDetails,
      });
      setOrderCode(s.orderCode);
    });

    getAllUserAccounts()
      .then((rows) =>
        setStaffOptions(
          (rows || [])
            .filter((u) => u.roleName === "DeliveryStaff")
            .map((u) => ({ deliveryStaffId: u.userId, name: u.name }))
        )
      )
      .catch(() => setStaffOptions([]));
  }, [shipmentId]);

  if (!initialData) return null;

  return (
    <ShipmentForm
      initialData={initialData}
      onSuccess={() =>
        router.push(`/dashboard/manager/shipments/${shipmentId}`)
      }
      deliveryStaffOptions={staffOptions}
      orderCodeDisplay={orderCode}
    />
  );
}
