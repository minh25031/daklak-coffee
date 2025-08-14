"use client";

import { useRouter } from "next/navigation";
import BusinessBuyerForm from "@/components/business-buyers/BusinessBuyerForm";

export default function CreateBusinessBuyerPage() {
  const router = useRouter();
  return (
    <BusinessBuyerForm
      onSuccess={() => router.push("/dashboard/manager/business-buyers")}
    />
  );
}
