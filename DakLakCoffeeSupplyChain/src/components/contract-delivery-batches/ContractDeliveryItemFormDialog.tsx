"use client";

import { useEffect, useState } from "react";
import {
  createContractDeliveryItem,
  updateContractDeliveryItem,
  ContractDeliveryItemCreateDto,
  ContractDeliveryItemUpdateDto,
} from "@/lib/api/contractDeliveryItems";
import * as BaseDialog from "@/components/ui/dialog";
import { FormDialog } from "@/components/ui/formDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ContractItemViewDto } from "@/lib/api/contractItems";
import { toast } from "sonner";
import axios from "axios";

interface ContractDeliveryItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  deliveryBatchId: string;
  contractItems: ContractItemViewDto[];
  initialData?: ContractDeliveryItemUpdateDto;
  onSuccess?: () => void;
}

export default function ContractDeliveryItemFormDialog({
  open,
  onOpenChange,
  mode,
  deliveryBatchId,
  contractItems,
  initialData,
  onSuccess,
}: ContractDeliveryItemFormDialogProps) {
  const [formData, setFormData] = useState<
    ContractDeliveryItemCreateDto | ContractDeliveryItemUpdateDto
  >({
    deliveryBatchId,
    contractItemId: "",
    plannedQuantity: 0,
    note: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          deliveryBatchId,
          contractItemId: "",
          plannedQuantity: 0,
          note: "",
        });
      }
    }
  }, [open, JSON.stringify(initialData)]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "plannedQuantity" || name === "fulfilledQuantity"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    // Kiểm tra client-side trước
    if (!formData.contractItemId) {
      toast.error("Vui lòng chọn loại cà phê.");
      return;
    }

    if (formData.plannedQuantity <= 0) {
      toast.error("Khối lượng cần giao phải lớn hơn 0.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "create") {
        await createContractDeliveryItem(
          formData as ContractDeliveryItemCreateDto
        );
      } else {
        await updateContractDeliveryItem(
          formData as ContractDeliveryItemUpdateDto
        );
      }

      toast.success(
        mode === "create"
          ? "Đã thêm mặt hàng vào đợt giao thành công!"
          : "Cập nhật mặt hàng thành công!"
      );

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      let message = "Đã xảy ra lỗi không xác định.";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ??
          `Lỗi từ máy chủ: ${error.response?.status}`;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog.Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialog.Content size="sm">
        <BaseDialog.DialogHeader className="px-5 pt-5 pb-0">
          <BaseDialog.DialogTitle>
            {mode === "create"
              ? "Thêm mặt hàng đợt giao"
              : "Cập nhật mặt hàng đợt giao"}
          </BaseDialog.DialogTitle>
        </BaseDialog.DialogHeader>

        <div className="grid gap-2 px-5 py-4">
          <div className="grid gap-1">
            <Label htmlFor="contractItemId">Loại cà phê</Label>
            <Select
              value={formData.contractItemId || undefined} // Khi rỗng -> undefined để hiện placeholder
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, contractItemId: value }))
              }
            >
              <SelectTrigger id="contractItemId" className="w-full">
                <SelectValue placeholder="-- Chọn loại cà phê --" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {contractItems.map((item) => (
                  <SelectItem
                    key={item.contractItemId}
                    value={item.contractItemId}
                  >
                    {item.coffeeTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="plannedQuantity">Khối lượng cần giao (kg)</Label>
            <Input
              id="plannedQuantity"
              name="plannedQuantity"
              type="number"
              value={formData.plannedQuantity}
              onChange={handleChange}
              min={0}
            />
          </div>

          {mode === "edit" && "fulfilledQuantity" in formData && (
            <div className="grid gap-1">
              <Label htmlFor="fulfilledQuantity">Khối lượng đã giao (kg)</Label>
              <Input
                id="fulfilledQuantity"
                name="fulfilledQuantity"
                type="number"
                value={
                  (formData as ContractDeliveryItemUpdateDto)
                    .fulfilledQuantity ?? 0
                }
                onChange={handleChange}
                min={0}
              />
            </div>
          )}

          <div className="grid gap-1">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Nhập ghi chú (tuỳ chọn)"
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Huỷ
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : mode === "create" ? "Thêm" : "Cập nhật"}
          </Button>
        </div>
      </FormDialog.Content>
    </BaseDialog.Dialog>
  );
}
