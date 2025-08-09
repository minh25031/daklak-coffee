"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ContractDeliveryBatchForm, { ContractOption } from "@/components/contract-delivery-batches/ContractDeliveryBatchForm";
import { getContractDeliveryBatchById } from "@/lib/api/contractDeliveryBatches";
import { getAllContracts } from "@/lib/api/contracts";
import { toast } from "sonner";

export default function EditDeliveryBatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(undefined);
  const [options, setOptions] = useState<ContractOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [detail, contracts] = await Promise.all([
          getContractDeliveryBatchById(params.id),
          getAllContracts(),
        ]);
        setOptions(contracts);

        // map về UpdateDto tối thiểu cho form
        setInitialData({
          deliveryBatchId: detail.deliveryBatchId,
          contractId: detail.contractId,
          deliveryRound: detail.deliveryRound,
          expectedDeliveryDate: detail.expectedDeliveryDate ?? "",
          totalPlannedQuantity: detail.totalPlannedQuantity ?? 0,
          status: detail.status,
          contractDeliveryItems: [], // items chỉnh riêng ở trang chi tiết (nếu muốn)
        });
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải dữ liệu đợt giao.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <div className="p-6 text-gray-500">Đang tải...</div>;
  if (!initialData) return <div className="p-6 text-red-600">Không tìm thấy đợt giao.</div>;

  return (
    <div className="p-6">
      <ContractDeliveryBatchForm
        initialData={initialData}
        contractOptions={options}
        onSuccess={() => {
          router.push("/dashboard/manager/contract-delivery-batches");
        }}
      />
    </div>
  );
}
