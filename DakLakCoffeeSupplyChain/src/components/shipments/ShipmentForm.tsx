"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/DatePicker";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getOrderDetails, getAllOrders } from "@/lib/api/orders";
import {
  ShipmentCreateDto,
  ShipmentUpdateDto,
  createShipment,
  updateShipment,
} from "@/lib/api/shipments";
import {
  ShipmentDeliveryStatusMap,
  ShipmentDeliveryStatusValue,
} from "@/lib/constants/shipmentDeliveryStatus";
import { fromDateOnly, toDateOnly } from "@/lib/utils";

type Props = {
  initialData?: ShipmentUpdateDto;
  onSuccess: () => void;
  orderId?: string; // nếu tạo theo một đơn hàng có sẵn
  deliveryStaffOptions?: { deliveryStaffId: string; name: string }[];
  orderCodeDisplay?: string; // dùng cho trang edit để hiển thị code thay vì GUID
};

type FormState = {
  orderId: string;
  deliveryStaffId: string;
  shippedQuantity?: number | null;
  shippedAt?: Date | undefined;
  deliveryStatus: ShipmentDeliveryStatusValue;
  receivedAt?: Date | undefined;
  shipmentDetails: {
    shipmentDetailId?: string;
    orderItemId: string;
    quantity: number;
    unit: string;
    note?: string;
  }[];
};

export default function ShipmentForm({
  initialData,
  onSuccess,
  orderId,
  deliveryStaffOptions = [],
  orderCodeDisplay,
}: Props) {
  const isEdit = !!initialData?.shipmentId;
  const router = useRouter();

  const [formData, setFormData] = useState<FormState | null>(null);
  const [orderItems, setOrderItems] = useState<
    { orderItemId: string; productName: string }[]
  >([]);
  const [orderOptions, setOrderOptions] = useState<
    { orderId: string; orderCode: string }[]
  >([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        orderId: initialData.orderId,
        deliveryStaffId: initialData.deliveryStaffId,
        shippedQuantity: initialData.shippedQuantity ?? null,
        shippedAt: initialData.shippedAt
          ? new Date(initialData.shippedAt)
          : undefined,
        deliveryStatus: initialData.deliveryStatus,
        receivedAt: initialData.receivedAt
          ? new Date(initialData.receivedAt)
          : undefined,
        shipmentDetails: (initialData.shipmentDetails || []).map((d: any) => ({
          shipmentDetailId: d.shipmentDetailId,
          orderItemId: d.orderItemId,
          quantity: d.quantity ?? 0,
          unit: String(d.unit ?? "Kg"),
          note: d.note ?? "",
        })),
      });
    } else {
      setFormData({
        orderId: orderId ?? "",
        deliveryStaffId: "",
        shippedQuantity: null,
        shippedAt: undefined,
        deliveryStatus: "Pending",
        receivedAt: undefined,
        shipmentDetails: [],
      });
    }
  }, [initialData, orderId]);

  // load order items for selected orderId
  useEffect(() => {
    const oid = formData?.orderId;
    if (!oid) {
      setOrderItems([]);
      return;
    }
    (async () => {
      try {
        const detail = await getOrderDetails(oid);
        setOrderItems(detail.orderItems || []);
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải danh sách mặt hàng đơn hàng.");
      }
    })();
  }, [formData?.orderId]);

  // load order list for dropdown when creating
  useEffect(() => {
    if (isEdit) return; // edit: giữ nguyên orderId
    (async () => {
      try {
        const list = await getAllOrders();
        setOrderOptions(
          (list || []).map((o) => ({
            orderId: o.orderId,
            orderCode: o.orderCode,
          }))
        );
      } catch {
        setOrderOptions([]);
      }
    })();
  }, [isEdit]);

  if (!formData) {
    return (
      <div className="text-gray-500 text-center py-10">
        Đang khởi tạo biểu mẫu chuyến giao...
      </div>
    );
  }

  const handleChange = (field: keyof FormState, value: any) =>
    setFormData((prev) => ({ ...(prev as FormState), [field]: value }));

  const ensureDetails = () =>
    setFormData((prev) => ({
      ...(prev as FormState),
      shipmentDetails: Array.isArray(prev?.shipmentDetails)
        ? (prev as FormState).shipmentDetails
        : [],
    }));

  const addRow = () => {
    ensureDetails();
    setFormData((prev) => ({
      ...(prev as FormState),
      shipmentDetails: [
        ...((prev as FormState).shipmentDetails || []),
        { orderItemId: "", quantity: 0, unit: "Kg", note: "" },
      ],
    }));
  };

  const updateRow = (
    index: number,
    field: "orderItemId" | "quantity" | "unit" | "note",
    value: any
  ) =>
    setFormData((prev) => {
      const base = { ...(prev as FormState) };
      const arr = [...(base.shipmentDetails || [])];
      arr[index] = {
        ...arr[index],
        [field]: field === "quantity" ? Number(value) : value,
      };
      base.shipmentDetails = arr;
      return base;
    });

  const removeRow = (index: number) =>
    setFormData((prev) => {
      const base = { ...(prev as FormState) };
      const arr = [...(base.shipmentDetails || [])];
      arr.splice(index, 1);
      base.shipmentDetails = arr;
      return base;
    });

  const sumQuantity = () =>
    (formData.shipmentDetails || []).reduce(
      (acc, x) => acc + (Number(x.quantity) || 0),
      0
    );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData) {
      toast.error("Biểu mẫu chưa sẵn sàng, vui lòng thử lại.");
      return;
    }
    const data: FormState = formData;
    if (!data.orderId) return toast.error("Vui lòng chọn đơn hàng.");
    if (!data.deliveryStaffId)
      return toast.error("Vui lòng chọn nhân viên giao.");

    const shippedAtStr = data.shippedAt
      ? toDateOnly(data.shippedAt)
      : undefined;
    const receivedAtStr = data.receivedAt
      ? toDateOnly(data.receivedAt)
      : undefined;

    try {
      if (isEdit && initialData) {
        const payload: ShipmentUpdateDto = {
          shipmentId: (initialData as any).shipmentId,
          orderId: data.orderId,
          deliveryStaffId: data.deliveryStaffId,
          shippedQuantity: data.shippedQuantity ?? null,
          shippedAt: shippedAtStr as any,
          deliveryStatus: data.deliveryStatus,
          receivedAt: receivedAtStr as any,
          shipmentDetails: (data.shipmentDetails || []).map((d) => ({
            shipmentDetailId: d.shipmentDetailId as string,
            shipmentId: (initialData as any).shipmentId,
            orderItemId: d.orderItemId,
            quantity: d.quantity,
            unit: d.unit,
            note: d.note || "",
          })) as any,
        };
        console.log("[ShipmentForm] Update payload:", payload);
        await updateShipment(payload.shipmentId, payload);
        toast.success("Cập nhật lô giao thành công!");
        console.log("[ShipmentForm] Update success");
      } else {
        const payload: ShipmentCreateDto = {
          orderId: data.orderId,
          deliveryStaffId: data.deliveryStaffId,
          shippedQuantity: data.shippedQuantity ?? null,
          shippedAt: shippedAtStr as any,
          deliveryStatus: data.deliveryStatus,
          receivedAt: receivedAtStr as any,
          shipmentDetails: (data.shipmentDetails || []).map((d) => ({
            orderItemId: d.orderItemId,
            quantity: d.quantity,
            unit: d.unit,
            note: d.note || "",
          })) as any,
        };
        console.log("[ShipmentForm] Create payload:", payload);
        const newId = await createShipment(payload);
        toast.success("Tạo lô giao thành công!");
        console.log("[ShipmentForm] Create success id=", newId);
      }
      onSuccess();
    } catch (err: any) {
      console.error("[ShipmentForm] Error:", err);
      if (err?.response) {
        console.error("[ShipmentForm] Error response:", err.response?.data);
      }
      toast.error("Đã xảy ra lỗi khi lưu chuyến giao.");
    }
  }

  const shippedStr = toDateOnly(formData.shippedAt);
  const receivedStr = toDateOnly(formData.receivedAt);

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white border rounded-2xl shadow p-8 space-y-8"
    >
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isEdit ? "Chỉnh sửa lô giao" : "Tạo lô giao mới"}
      </h2>

      {/* Đơn hàng + Nhân viên giao */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Đơn hàng</label>
          {isEdit ? (
            <Input
              value={orderCodeDisplay || formData.orderId}
              disabled
              className="h-10"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                className="w-full p-2 border rounded h-10"
                value={formData.orderId}
                onChange={(e) => handleChange("orderId", e.target.value)}
              >
                <option value="">-- Chọn đơn hàng --</option>
                {orderOptions.map((o) => (
                  <option key={o.orderId} value={o.orderId}>
                    {o.orderCode}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Hoặc nhập OrderCode"
                className="h-10"
                onChange={(e) => {
                  const code = e.target.value.trim().toLowerCase();
                  const found = orderOptions.find(
                    (o) => o.orderCode.toLowerCase() === code
                  );
                  if (found) handleChange("orderId", found.orderId);
                }}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Nhân viên giao</label>
          <select
            className="w-full p-2 border rounded h-10"
            value={formData.deliveryStaffId}
            onChange={(e) => handleChange("deliveryStaffId", e.target.value)}
          >
            <option value="">-- Chọn nhân viên giao --</option>
            {deliveryStaffOptions.map((s) => (
              <option key={s.deliveryStaffId} value={s.deliveryStaffId}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thông tin giao hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Số lượng đã giao (kg)</label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={formData.shippedQuantity ?? 0}
            onChange={(e) =>
              handleChange("shippedQuantity", Number(e.target.value))
            }
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Trạng thái</label>
          <select
            className="w-full p-2 border rounded h-10"
            value={formData.deliveryStatus}
            onChange={(e) =>
              handleChange(
                "deliveryStatus",
                e.target.value as ShipmentDeliveryStatusValue
              )
            }
          >
            {/* Chỉ cho phép chọn các trạng thái hợp lệ khi tạo/sửa */}
            <option value="Pending">Đang chờ</option>
            <option value="InTransit">Đang giao</option>
            <option value="Delivered">Đã giao</option>
          </select>
        </div>
      </div>

      {/* Date pickers nhóm cuối bên trái */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Ngày bắt đầu giao</label>
          <DatePicker
            className="h-10"
            value={shippedStr}
            onChange={(d) => handleChange("shippedAt", fromDateOnly(d))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Ngày nhận (nếu có)</label>
          <DatePicker
            className="h-10"
            value={receivedStr}
            onChange={(d) => handleChange("receivedAt", fromDateOnly(d))}
          />
        </div>
      </div>

      {/* Danh sách sản phẩm giao */}
      <div>
        <label className="block mb-1 text-sm font-medium">
          Danh sách sản phẩm giao
        </label>
        {(formData.shipmentDetails?.length ?? 0) > 0 && (
          <div className="hidden md:grid md:grid-cols-6 gap-3 mb-1 text-xs font-medium text-muted-foreground">
            <span>Mặt hàng đơn hàng</span>
            <span className="text-left">Số lượng</span>
            <span>Đơn vị</span>
            <span className="col-span-3">Ghi chú</span>
            <span></span>
          </div>
        )}

        {(formData.shipmentDetails || []).map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-2">
            <select
              value={row.orderItemId}
              onChange={(e) => updateRow(idx, "orderItemId", e.target.value)}
              className="p-2 border rounded h-10"
            >
              <option value="">-- Chọn order item --</option>
              {orderItems.map((opt) => (
                <option key={opt.orderItemId} value={opt.orderItemId}>
                  {opt.productName}
                </option>
              ))}
            </select>

            <Input
              type="number"
              min={0}
              step={0.1}
              value={row.quantity ?? 0}
              onChange={(e) => updateRow(idx, "quantity", e.target.value)}
              className="no-spinner text-left h-10"
            />

            <select
              value={row.unit}
              onChange={(e) => updateRow(idx, "unit", e.target.value)}
              className="p-2 border rounded h-10"
            >
              <option value="Kg">Kg</option>
              <option value="Ta">Tạ</option>
              <option value="Tan">Tấn</option>
            </select>

            <Input
              placeholder="Ghi chú"
              value={row.note || ""}
              onChange={(e) => updateRow(idx, "note", e.target.value)}
              className="md:col-span-3 h-10"
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => removeRow(idx)}
            >
              Xoá
            </Button>
          </div>
        ))}

        <div className="flex items-center justify-between mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            disabled={!formData.orderId}
          >
            + Thêm dòng
          </Button>
          <div className="text-sm text-gray-600">
            Tổng khối lượng dòng:{" "}
            <strong>{sumQuantity().toLocaleString()}</strong> kg
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-between pt-4">
        <Button type="submit">
          <h2>{isEdit ? "Lưu thay đổi" : "Tạo lô giao"}</h2>
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </DialogFooter>
    </form>
  );
}
