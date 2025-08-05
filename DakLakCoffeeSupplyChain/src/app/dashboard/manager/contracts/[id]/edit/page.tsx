"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getContractDetails } from "@/lib/api/contracts";
import { ContractViewDetailsDto, ContractUpdateDto } from "@/lib/api/contracts";
import ContractForm from "@/components/contracts/ContractForm";
import { Loader } from "lucide-react";
import {
  getAllBusinessBuyers,
  BusinessBuyerDto,
} from "@/lib/api/businessBuyers";
import { ContractStatus } from "@/lib/constants/contractStatus";

export default function EditContractPage() {
  const params = useParams();
  const rawId = params.id;
  const router = useRouter();

  const [initialData, setInitialData] = useState<ContractUpdateDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState<BusinessBuyerDto[]>([]);

  useEffect(() => {
  if (!rawId || typeof rawId !== "string") {
    console.warn("Không có contractId hợp lệ");
    setLoading(false);
    return;
  }

  const id: string = rawId;

  async function fetchData() {
    try {
      const [contract, buyerList] = await Promise.all([
        getContractDetails(id),
        getAllBusinessBuyers(),
      ]);

      if (!contract || !contract.contractItems) {
        throw new Error("Hợp đồng không tồn tại hoặc thiếu contractItems");
      }

      setBuyers(buyerList);

      const updateDto: ContractUpdateDto = {
        contractId: contract.contractId,
        contractNumber: contract.contractNumber,
        contractTitle: contract.contractTitle,
        contractFileUrl: contract.contractFileUrl,
        buyerId: contract.buyerId,
        deliveryRounds: contract.deliveryRounds ?? 1,
        totalQuantity: contract.totalQuantity ?? 0,
        totalValue: contract.totalValue ?? 0,
        startDate: contract.startDate,
        endDate: contract.endDate,
        signedAt: contract.signedAt,
        status: contract.status as ContractStatus,
        cancelReason: contract.cancelReason,
        contractItems: contract.contractItems.map((item) => ({
          contractItemId: item.contractItemId,
          contractId: contract.contractId,
          coffeeTypeId: item.coffeeTypeId,
          quantity: item.quantity ?? 0,
          unitPrice: item.unitPrice ?? 0,
          discountAmount: item.discountAmount ?? 0,
          note: item.note ?? "",
        })),
      };

      setInitialData(updateDto);
    } catch (err) {
      console.error("Lỗi khi load dữ liệu hợp đồng:", err);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [rawId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin w-6 h-6" />
        <span className="ml-2">Đang tải dữ liệu hợp đồng...</span>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Không tìm thấy hợp đồng với ID: {rawId}
      </div>
    );
  }

  return (
    <div className="p-6">
      <ContractForm
        initialData={initialData}
        buyerOptions={buyers}
        onSuccess={() => router.push("/dashboard/manager/contracts")}
      />
    </div>
  );
}
