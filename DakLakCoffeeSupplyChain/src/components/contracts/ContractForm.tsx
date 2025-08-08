"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { DialogFooter } from "@/components/ui/dialog";
import { ContractStatus } from "@/lib/constants/contractStatus";
import {
  ContractCreateDto,
  ContractUpdateDto,
  createContract,
  updateContract,
} from "@/lib/api/contracts";
import {
  getAllBusinessBuyers,
  BusinessBuyerDto,
} from "@/lib/api/businessBuyers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import {
  ContractItemCreateDto,
  ContractItemUpdateDto,
} from "@/lib/api/contractItems";

// Helper: input có suffix đơn vị bên phải
function InputWithSuffix({
  unit,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { unit?: string }) {
  return (
    <div className="relative">
      <Input {...props} className={`pr-14 ${className ?? ""}`} />
      {unit ? (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          {unit}
        </span>
      ) : null}
    </div>
  );
}

type Props = {
  initialData?: ContractUpdateDto;
  onSuccess: () => void;
  buyerOptions?: BusinessBuyerDto[];
};

export default function ContractForm({
  initialData,
  onSuccess,
  buyerOptions,
}: Props) {
  const isEdit = !!initialData;
  const [buyers, setBuyers] = useState<BusinessBuyerDto[]>([]);
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [formData, setFormData] = useState<
    ContractCreateDto | ContractUpdateDto | null
  >(null);
  const router = useRouter();

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "NotStarted":
        return {
          label: "Chưa bắt đầu",
          className: "bg-gray-100 text-gray-600",
        };
      case "PreparingDelivery":
        return {
          label: "Chuẩn bị giao",
          className: "bg-purple-100 text-purple-700",
        };
      case "InProgress":
        return {
          label: "Đang thực hiện",
          className: "bg-green-100 text-green-700",
        };
      case "PartialCompleted":
        return {
          label: "Hoàn thành một phần",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "Completed":
        return { label: "Hoàn thành", className: "bg-blue-100 text-blue-700" };
      case "Cancelled":
        return { label: "Đã huỷ", className: "bg-red-100 text-red-700" };
      case "Expired":
        return { label: "Quá hạn", className: "bg-orange-100 text-orange-700" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-600" };
    }
  };

  // Fetch buyers list
  useEffect(() => {
    if (buyerOptions) {
      setBuyers(buyerOptions);
    } else {
      getAllBusinessBuyers().then(setBuyers);
    }
  }, [buyerOptions]);

  useEffect(() => {
    getCoffeeTypes().then(setCoffeeTypes);
  }, []);

  // Sync formData based on initialData
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        contractNumber: "",
        contractTitle: "",
        contractFileUrl: "",
        buyerId: "" as any,
        deliveryRounds: 1,
        totalQuantity: 0,
        totalValue: 0,
        startDate: undefined,
        endDate: undefined,
        signedAt: undefined,
        status: ContractStatus.NotStarted,
        cancelReason: "",
        contractItems: [],
      });
    }
  }, [initialData]);

  // Guard for null formData
  if (!formData) {
    return (
      <div className="text-gray-500 text-center py-10">
        Đang khởi tạo biểu mẫu hợp đồng...
      </div>
    );
  }

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  }

  function addContractItem() {
    setFormData((prev) => {
      if (!prev) throw new Error("Form chưa khởi tạo");

      const isUpdate = "contractId" in prev && "contractItems" in prev;

      return {
        ...prev,
        contractItems: [
          ...prev.contractItems,
          {
            contractId: isUpdate ? (prev as ContractUpdateDto).contractId : "",
            coffeeTypeId: "",
            quantity: 0,
            unitPrice: 0,
            discountAmount: 0,
            note: "",
            ...(isUpdate && { contractItemId: crypto.randomUUID() }),
          },
        ],
      };
    });
  }

  function updateContractItem(index: number, field: string, value: any) {
    setFormData((prev) => {
      const updatedItems = [...prev!.contractItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return {
        ...prev!,
        contractItems: updatedItems,
      };
    });
  }

  function removeContractItem(index: number) {
    setFormData((prev) => {
      const updatedItems = [...prev!.contractItems];
      updatedItems.splice(index, 1);
      return {
        ...prev!,
        contractItems: updatedItems,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      if (!formData) {
        toast.error("Dữ liệu chưa sẵn sàng");
        return;
      }

      const { contractItems, ...rest } = formData;
      console.log(formData);
      if (!contractItems || contractItems.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 mặt hàng vào hợp đồng.");
        return;
      }

      if (isEdit) {
        const dto = formData as ContractUpdateDto;

        const normalizedItems: ContractItemUpdateDto[] = dto.contractItems.map(
          (item) => ({
            contractItemId: item.contractItemId,
            contractId: item.contractId, // BẮT BUỘC
            coffeeTypeId: item.coffeeTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount ?? 0,
            note: item.note ?? "",
          })
        );

        await updateContract(dto.contractId, {
          ...dto,
          contractFileUrl:
            dto.contractFileUrl?.trim() === ""
              ? undefined
              : dto.contractFileUrl,
          contractItems: normalizedItems,
        });

        toast.success("Cập nhật hợp đồng thành công!");
      } else {
        const dto = formData as ContractCreateDto;

        const normalizedItems: ContractItemCreateDto[] = dto.contractItems.map(
          (item) => ({
            coffeeTypeId: item.coffeeTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount ?? 0,
            note: item.note ?? "",
          })
        );

        await createContract({
          ...dto,
          contractFileUrl:
            dto.contractFileUrl?.trim() === ""
              ? undefined
              : dto.contractFileUrl,
          contractItems: normalizedItems,
        });

        toast.success("Tạo hợp đồng thành công!");
      }

      onSuccess();
    } catch (err) {
      console.error("Lỗi khi submit hợp đồng:", err);
      toast.error("Đã xảy ra lỗi khi lưu hợp đồng");
    }
  }

  return (
    <form className="max-w-4xl mx-auto bg-white border rounded-2xl shadow p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isEdit ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Số hợp đồng</label>
          <Input
            placeholder="VD: CT001"
            value={formData.contractNumber}
            onChange={(e) => handleChange("contractNumber", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Tiêu đề</label>
          <Input
            placeholder="Tiêu đề hợp đồng"
            value={formData.contractTitle}
            onChange={(e) => handleChange("contractTitle", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">File hợp đồng</label>
        <Input
          placeholder="URL file"
          value={formData.contractFileUrl || ""}
          onChange={(e) => handleChange("contractFileUrl", e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Đối tác</label>
        <select
          value={formData.buyerId}
          onChange={(e) => handleChange("buyerId", e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">-- Chọn đối tác --</option>
          {buyers.map((buyer) => (
            <option key={buyer.buyerId} value={buyer.buyerId}>
              {buyer.companyName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Số đợt</label>
          <Input
            type="number"
            min={1}
            value={formData.deliveryRounds || ""}
            onChange={(e) =>
              handleChange("deliveryRounds", Number(e.target.value))
            }
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Tổng KL (kg)</label>
          <Input
            type="number"
            step={0.1}
            min={0}
            value={formData.totalQuantity || ""}
            onChange={(e) =>
              handleChange("totalQuantity", Number(e.target.value))
            }
            className="no-spinner"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Tổng GT (VND)
          </label>
          <Input
            type="number"
            min={0}
            value={formData.totalValue || ""}
            onChange={(e) => handleChange("totalValue", Number(e.target.value))}
            className="no-spinner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DatePicker
          label="Ngày bắt đầu"
          value={formData.startDate as any}
          onChange={(date) => handleChange("startDate", date)}
          required
        />
        <DatePicker
          label="Ngày kết thúc"
          value={formData.endDate as any}
          onChange={(date) => handleChange("endDate", date)}
          required
        />
        <DatePicker
          label="Ngày ký"
          value={formData.signedAt as any}
          onChange={(date) => handleChange("signedAt", date)}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Trạng thái</label>
        <select
          className="w-full p-2 border rounded"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          {Object.entries(ContractStatus).map(([key, val]) => (
            <option key={val} value={val}>
              {getStatusDisplay(val).label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Lý do huỷ (nếu có)
        </label>
        <Textarea
          placeholder="Nếu huỷ, ghi lý do..."
          value={formData.cancelReason}
          onChange={(e) => handleChange("cancelReason", e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Danh sách mặt hàng
        </label>

        {formData.contractItems.length > 0 && (
          <>
            {/* Header */}
            <div className="hidden md:grid md:grid-cols-6 gap-2 mb-1 text-xs font-medium text-muted-foreground">
              <span>Loại cà phê</span>
              <span>Số lượng (kg)</span>
              <span>Đơn giá (VND/Kg)</span>
              <span>Chiết khấu (%)</span>
              <span>Ghi chú</span>
              <span></span>
            </div>

            {/* Body */}
            {formData.contractItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2"
              >
                {/* Loại cà phê */}
                <select
                  value={item.coffeeTypeId}
                  onChange={(e) =>
                    updateContractItem(index, "coffeeTypeId", e.target.value)
                  }
                  className="p-2 border rounded"
                >
                  <option value="">-- Chọn loại cà phê --</option>
                  {coffeeTypes.map((type) => (
                    <option key={type.coffeeTypeId} value={type.coffeeTypeId}>
                      {type.typeName}
                    </option>
                  ))}
                </select>

                {/* Số lượng */}
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateContractItem(
                      index,
                      "quantity",
                      Number(e.target.value)
                    )
                  }
                  className="no-spinner"
                />

                {/* Đơn giá */}
                <Input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateContractItem(
                      index,
                      "unitPrice",
                      Number(e.target.value)
                    )
                  }
                  className="no-spinner"
                />

                {/* Chiết khấu */}
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  value={item.discountAmount || ""}
                  onChange={(e) =>
                    updateContractItem(
                      index,
                      "discountAmount",
                      Number(e.target.value)
                    )
                  }
                  className="no-spinner"
                />

                {/* Ghi chú */}
                <Input
                  placeholder="Ghi chú"
                  value={item.note || ""}
                  onChange={(e) =>
                    updateContractItem(index, "note", e.target.value)
                  }
                />

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeContractItem(index)}
                >
                  Xoá
                </Button>
              </div>
            ))}
          </>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addContractItem}
          className="mt-2"
        >
          + Thêm mặt hàng
        </Button>
      </div>

      <DialogFooter className="flex justify-between pt-4">
        <Button type="submit" onClick={handleSubmit}>
          <h2>Lưu hợp đồng</h2>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/manager/contracts")}
        >
          Quay lại
        </Button>
      </DialogFooter>
    </form>
  );
}
