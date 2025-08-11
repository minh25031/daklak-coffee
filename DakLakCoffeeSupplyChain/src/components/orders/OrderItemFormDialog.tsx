"use client";

import { useEffect, useState, useMemo } from "react";
import {
  createOrderItem,
  updateOrderItem,
  OrderItemCreateForOrder,
  OrderItemUpdateDto,
} from "@/lib/api/orderItems";
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
import { toast } from "sonner";
import axios from "axios";

interface ContractDeliveryItemOption {
  contractDeliveryItemId: string;
  label: string;
}

interface ProductOption {
  productId: string;
  name: string;
}

interface OrderItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  orderId: string;
  orderCode?: string;
  contractDeliveryItems: ContractDeliveryItemOption[];
  products: ProductOption[];
  initialData?: OrderItemUpdateDto;
  onSuccess?: () => void;
}

export default function OrderItemFormDialog({
  open,
  onOpenChange,
  mode,
  orderId,
  orderCode,
  contractDeliveryItems,
  products,
  initialData,
  onSuccess,
}: OrderItemFormDialogProps) {
  const [formData, setFormData] = useState<
    OrderItemCreateForOrder | OrderItemUpdateDto
  >({
    orderId,
    contractDeliveryItemId: "",
    productId: "",
    quantity: 0,
    unitPrice: 0,
    discountAmount: 0,
    note: "",
  });

  const [loading, setLoading] = useState(false);

  // helper trong file dialog
  const norm = (s: string | undefined | null) =>
    String(s ?? "")
      .trim()
      .toLowerCase();

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setFormData({
        orderId,
        orderItemId: (initialData as any).orderItemId,
        contractDeliveryItemId: norm(initialData.contractDeliveryItemId),
        productId: String(initialData.productId ?? ""),
        quantity: initialData.quantity ?? 0,
        unitPrice: initialData.unitPrice ?? 0,
        discountAmount: initialData.discountAmount ?? 0,
        note: initialData.note ?? "",
      } as OrderItemUpdateDto);
    } else {
      setFormData({
        orderId,
        contractDeliveryItemId: "",
        productId: "",
        quantity: 0,
        unitPrice: 0,
        discountAmount: 0,
        note: "",
      });
    }
  }, [open, mode, orderId, (initialData as any)?.orderItemId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["quantity", "unitPrice", "discountAmount"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  // dedupe options gốc (đã có)
  const cdiOptions = useMemo(() => {
    const seen = new Set<string>();
    return (contractDeliveryItems ?? [])
      .filter((o) => {
        const id = norm(o.contractDeliveryItemId);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((o) => ({
        ...o,
        contractDeliveryItemId: norm(o.contractDeliveryItemId),
      })); // normalize value lưu trong options luôn
  }, [contractDeliveryItems]);

  const productOptions = useMemo(() => {
    const seen = new Set<string>();
    return (products ?? []).filter((p) => {
      const id = String(p.productId ?? "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [products]);

  const mergedCdiOptions = useMemo(() => {
    const id = norm((formData as any).contractDeliveryItemId);
    const map = new Map(cdiOptions.map((o) => [o.contractDeliveryItemId, o]));
    if (id && !map.has(id)) {
      map.set(id, {
        contractDeliveryItemId: id,
        label: "Mặt hàng đợt giao (hiện tại)",
      });
    }
    return Array.from(map.values());
  }, [cdiOptions, (formData as any).contractDeliveryItemId]);

  const handleSubmit = async () => {
    // Kiểm tra client-side
    if (!formData.contractDeliveryItemId) {
      toast.error("Vui lòng chọn mặt hàng đợt giao (ContractDeliveryItem).");
      return;
    }

    if (!formData.productId) {
      toast.error("Vui lòng chọn sản phẩm (Product).");
      return;
    }

    if ((formData.quantity ?? 0) <= 0) {
      toast.error("Số lượng phải lớn hơn 0.");
      return;
    }

    if ((formData.unitPrice ?? 0) < 0) {
      toast.error("Đơn giá không hợp lệ.");
      return;
    }

    if (
      (formData.discountAmount ?? 0) < 0 ||
      (formData.discountAmount ?? 0) > 100
    ) {
      toast.error("Chiết khấu phải nằm trong khoảng 0–100%.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await createOrderItem(formData as OrderItemCreateForOrder);
        toast.success("Đã thêm mặt hàng đơn hàng thành công!");
      } else {
        await updateOrderItem(formData as OrderItemUpdateDto);
        toast.success("Cập nhật mặt hàng đơn hàng thành công!");
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
              ? "Thêm mặt hàng đơn hàng"
              : "Cập nhật mặt hàng đơn hàng"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* OrderCode: có thể ẩn hoặc hiển thị read-only để người dùng biết họ đang ở đơn hàng nào */}
          <div className="grid gap-1">
            <Label htmlFor="orderCode">Mã đơn hàng</Label>
            <Input id="orderCode" value={orderCode ?? ""} disabled />
          </div>

          {/* Mặt hàng đợt giao */}
          <div className="grid gap-1">
            <Label htmlFor="contractDeliveryItemId">Mặt hàng đợt giao</Label>
            <Select
              value={(formData.contractDeliveryItemId as string) || undefined}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  contractDeliveryItemId: norm(value),
                }));
              }}
            >
              <SelectTrigger id="contractDeliveryItemId" className="w-full">
                <SelectValue placeholder="-- Chọn mặt hàng đợt giao --" />
              </SelectTrigger>
              <SelectContent>
                {mergedCdiOptions.map((it) => (
                  <SelectItem
                    key={it.contractDeliveryItemId}
                    value={it.contractDeliveryItemId}
                  >
                    {it.label || it.contractDeliveryItemId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sản phẩm */}
          <div className="grid gap-1">
            <Label htmlFor="productId">Sản phẩm</Label>
            <Select
              value={formData.productId || undefined}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, productId: value }))
              }
            >
              <SelectTrigger id="productId" className="w-full">
                <SelectValue placeholder="-- Chọn sản phẩm --" />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((p) => (
                  <SelectItem
                    key={String(p.productId)} // key unique
                    value={String(p.productId)} // đảm bảo là string
                  >
                    {p.name || String(p.productId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Số lượng (kg) */}
          <div className="grid gap-1">
            <Label htmlFor="quantity">Số lượng (kg)</Label>
            <div className="relative">
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity ?? 0}
                onChange={handleChange}
                min={0}
                step={1}
                placeholder="vd: 500"
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                kg
              </span>
            </div>
          </div>

          {/* Đơn giá (VNĐ/kg) */}
          <div className="grid gap-1">
            <Label htmlFor="unitPrice">Đơn giá (VNĐ/kg)</Label>
            <div className="relative">
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                value={formData.unitPrice ?? 0}
                onChange={handleChange}
                min={0}
                step={100} // hoặc 1000 tuỳ quy định
                placeholder="vd: 95000"
                className="pr-24"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                VNĐ/kg
              </span>
            </div>
          </div>

          {/* Chiết khấu (%) */}
          <div className="grid gap-1">
            <Label htmlFor="discountAmount">Chiết khấu (%)</Label>
            <div className="relative">
              <Input
                id="discountAmount"
                name="discountAmount"
                type="number"
                value={formData.discountAmount ?? 0}
                onChange={handleChange}
                min={0}
                max={100}
                step={1}
                placeholder="vd: 10"
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                %
              </span>
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
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
