"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BusinessBuyerForm from "@/components/business-buyers/BusinessBuyerForm";
import { getBusinessBuyerById } from "@/lib/api/businessBuyers";

export default function EditBusinessBuyerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const d = await getBusinessBuyerById(id as string);
      setInitialData({
        buyerId: d.buyerId,
        companyName: d.companyName,
        contactPerson: d.contactPerson,
        position: d.position,
        companyAddress: d.companyAddress,
        taxId: d.taxId,
        email: d.email,
        phoneNumber: d.phone,
        website: d.website,
      });
    })();
  }, [id]);

  if (!initialData) return null;

  return (
    <BusinessBuyerForm
      initialData={initialData}
      onSuccess={() => router.push(`/dashboard/manager/business-buyers/${id}`)}
    />
  );
}
