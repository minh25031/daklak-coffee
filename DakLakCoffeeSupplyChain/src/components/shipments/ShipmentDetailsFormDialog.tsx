"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  createShipmentDetail,
  updateShipmentDetail,
  ShipmentDetailCreateDto,
  ShipmentDetailUpdateDto,
  ShipmentDetailViewDto,
} from "@/lib/api/shipments";
import axios from "axios";
import { toast } from "sonner";

export interface OrderItemOption {
  orderItemId: string;
  label: string;
}

interface ShipmentDetailsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  shipmentId: string;
  orderCode?: string;
  orderItems: OrderItemOption[];
  initialData?: ShipmentDetailViewDto;
  onSuccess?: () => void;
}

export default function ShipmentDetailsFormDialog({
  open,
  onOpenChange,
  mode,
  shipmentId,
  orderCode,
  orderItems,
  initialData,
  onSuccess,
}: ShipmentDetailsFormDialogProps) {
  const [formData, setFormData] = useState<
    ShipmentDetailCreateDto | ShipmentDetailUpdateDto
  >({
    shipmentId,
    orderItemId: "",
    quantity: 0,
    unit: "Kg",
    note: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialData) {
      setFormData({
        shipmentDetailId: initialData.shipmentDetailId,
        shipmentId,
        orderItemId: initialData.orderItemId,
        quantity: initialData.quantity ?? 0,
        unit: String(initialData.unit ?? "Kg"),
        note: initialData.note ?? "",
      } as ShipmentDetailUpdateDto);
    } else {
      setFormData({
        shipmentId,
        orderItemId: "",
        quantity: 0,
        unit: "Kg",
        note: "",
      });
    }
  }, [open, mode, shipmentId, (initialData as any)?.shipmentDetailId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const orderItemOptions = useMemo(() => {
    const seen = new Set<string>();
    return (orderItems ?? []).filter((o) => {
      const id = String(o.orderItemId || "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [orderItems]);

  const handleSubmit = async () => {
    if (!formData.orderItemId) {
      toast.error("Vui lòng chọn mặt hàng đơn hàng (OrderItem).");
      return;
    }
    if ((formData.quantity ?? 0) <= 0) {
      toast.error("Số lượng phải lớn hơn 0.");
      return;
    }
    if (!formData.unit) {
      toast.error("Vui lòng chọn đơn vị.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await createShipmentDetail(formData as ShipmentDetailCreateDto);
        toast.success("Đã thêm sản phẩm giao thành công!");
      } else {
        await updateShipmentDetail(formData as ShipmentDetailUpdateDto);
        toast.success("Cập nhật sản phẩm giao thành công!");
      }

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm sản phẩm giao"
              : "Cập nhật sản phẩm giao"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label>Mã đơn hàng</Label>
            <Input value={orderCode ?? ""} disabled />
          </div>

          <div className="grid gap-1">
            <Label>Mặt hàng đơn hàng</Label>
            <Select
              value={(formData.orderItemId as string) || undefined}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, orderItemId: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Chọn mặt hàng đơn hàng --" />
              </SelectTrigger>
              <SelectContent>
                {orderItemOptions.map((o) => (
                  <SelectItem key={o.orderItemId} value={o.orderItemId}>
                    {o.label || o.orderItemId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <Label>Số lượng</Label>
            <Input
              name="quantity"
              type="number"
              value={formData.quantity ?? 0}
              onChange={handleChange}
              min={0}
              step={1}
              placeholder="vd: 500"
            />
          </div>

          <div className="grid gap-1">
            <Label>Đơn vị</Label>
            <Select
              value={formData.unit || undefined}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, unit: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Chọn đơn vị --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kg">Kg</SelectItem>
                <SelectItem value="Ta">Tạ</SelectItem>
                <SelectItem value="Tan">Tấn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <Label>Ghi chú</Label>
            <Textarea
              name="note"
              value={formData.note ?? ""}
              onChange={handleChange}
              placeholder="Nhập ghi chú (tuỳ chọn)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : mode === "create" ? "Thêm" : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
