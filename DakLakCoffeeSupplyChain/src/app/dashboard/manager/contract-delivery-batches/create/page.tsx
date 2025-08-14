"use client";

import { useEffect, useState } from "react";
import ContractDeliveryBatchForm, {
  ContractOption,
} from "@/components/contract-delivery-batches/ContractDeliveryBatchForm";
import { getAllContracts } from "@/lib/api/contracts"; // trả [{contractId, contractNumber}]
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateDeliveryBatchPage() {
  const router = useRouter();
  const [options, setOptions] = useState<ContractOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllContracts();
        setOptions(data);
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải danh sách hợp đồng.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Đang tải...</div>;

  return (
    <div className="p-6">
      <ContractDeliveryBatchForm
        onSuccess={() => {
          router.push("/dashboard/manager/contract-delivery-batches");
        }}
        contractOptions={options}
      />
    </div>
  );
}
