"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { DialogFooter } from "@/components/ui/dialog";

import {
  createOrder,
  updateOrder,
  getOrderDetails,
  type OrderCreateDto,
  type OrderUpdateDto,
} from "@/lib/api/orders";
import {
  getContractDeliveryBatchById,
  buildCdiOptions,
  type ContractDeliveryBatchViewDetailsDto,
  getAllContractDeliveryBatches,
} from "@/lib/api/contractDeliveryBatches";
import { getProductOptions, type ProductOption } from "@/lib/api/products";
import { OrderStatus, OrderStatusLabel } from "@/lib/constants/orderStatus";

type Props = {
  initialData?: OrderUpdateDto; // nếu có -> Edit; nếu không -> Create
  deliveryBatchId?: string; // có thể truyền sẵn khi tạo từ trang đợt giao
  onSuccess: () => void;
};

/** Dòng sản phẩm trong form */
type OrderItemRow = {
  orderItemId?: string; // chỉ có khi edit
  contractDeliveryItemId: string;
  productId: string;
  quantity: number | "";
  unitPrice: number | "";
  /** UI dùng %; khi submit sẽ convert sang amount */
  discountAmount?: number | ""; // %
  note?: string;
};

type FormState = {
  deliveryBatchId: string;
  deliveryRound?: number | "";
  /** Dùng string để bind với input type="date" */
  orderDate?: string; // yyyy-MM-dd (sẽ convert -> ISO khi submit)
  actualDeliveryDate?: string; // yyyy-MM-dd
  note?: string;
  status: OrderStatus;
  cancelReason?: string;
  orderItems: OrderItemRow[];
};

export default function OrderForm({
  initialData,
  deliveryBatchId,
  onSuccess,
}: Props) {
  const isEdit = !!initialData;
  const router = useRouter();

  // Options
  type DeliveryItemOption = { contractDeliveryItemId: string; name: string };
  const [deliveryItemOptions, setDeliveryItemOptions] = useState<
    DeliveryItemOption[]
  >([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [batchOptions, setBatchOptions] = useState<
    { id: string; label: string }[]
  >([]);

  // UI giảm theo %
  const DISCOUNT_IS_PERCENT = true;

  // Hiển thị code đợt giao
  const [deliveryBatchCode, setDeliveryBatchCode] = useState<string>("");

  // -------------------- form state (không-null để tránh lỗi hooks) --------------------
  const [form, setForm] = useState<FormState>({
    deliveryBatchId: deliveryBatchId ?? "",
    deliveryRound: "",
    orderDate: undefined,
    actualDeliveryDate: undefined,
    note: "",
    status: OrderStatus.Pending,
    cancelReason: "",
    orderItems: [],
  });

  // Map dữ liệu edit -> form
  useEffect(() => {
    if (!initialData) return;

    // orderDate từ BE là ISO -> cắt yyyy-MM-dd cho input date
    const orderDateStr = initialData.orderDate
      ? String(initialData.orderDate).substring(0, 10)
      : undefined;

    setForm({
      deliveryBatchId: initialData.deliveryBatchId,
      deliveryRound: initialData.deliveryRound ?? "",
      orderDate: orderDateStr,
      actualDeliveryDate: initialData.actualDeliveryDate ?? undefined, // đã yyyy-MM-dd
      note: initialData.note ?? "",
      status: initialData.status ?? OrderStatus.Pending,
      cancelReason: initialData.cancelReason ?? "",
      orderItems: (initialData.orderItems ?? []).map(
        (it): OrderItemRow => ({
          orderItemId: it.orderItemId,
          contractDeliveryItemId: it.contractDeliveryItemId,
          productId: it.productId,
          quantity: typeof it.quantity === "number" ? it.quantity : "",
          unitPrice: typeof it.unitPrice === "number" ? it.unitPrice : "",
          // UI hiển thị %: nếu BE lưu amount, bạn có thể để 0 hoặc tính ngược lại tuỳ nhu cầu
          discountAmount: 0,
          note: it.note ?? "",
        })
      ),
    });
  }, [initialData]);

  // Load options theo đợt giao + danh sách sản phẩm
  useEffect(() => {
    (async () => {
      if (!form.deliveryBatchId) {
        // clear khi chưa chọn đợt giao
        setDeliveryItemOptions([]);
        setDeliveryBatchCode("");
        return;
      }
      setLoadingOptions(true);
      try {
        // Lấy viewDetails của đợt giao
        const details = (await getContractDeliveryBatchById(
          form.deliveryBatchId
        )) as ContractDeliveryBatchViewDetailsDto;

        // Set mã đợt giao và gợi ý số đợt nếu form đang trống
        setDeliveryBatchCode(details.deliveryBatchCode || "");
        if (form.deliveryRound === "" || form.deliveryRound === undefined) {
          setField("deliveryRound", details.deliveryRound ?? "");
        }

        // Build options cho dropdown "Mặt hàng đợt giao"
        // viewDetails dùng deliveryItemId -> map sang contractDeliveryItemId cho UI
        const opts = (details.contractDeliveryItems ?? []).map((x) => ({
          contractDeliveryItemId: x.deliveryItemId,
          name: `${x.coffeeTypeName} — KH: ${x.plannedQuantity}`,
        }));
        setDeliveryItemOptions(opts);

        // 4) Product options
        const products = await getProductOptions();
        setProductOptions(products ?? []);
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải chi tiết đợt giao và danh sách sản phẩm.");
      } finally {
        setLoadingOptions(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.deliveryBatchId]);

  // Khi chưa có deliveryBatchId, load danh sách đợt giao để chọn
  useEffect(() => {
    if (form.deliveryBatchId) return;
    (async () => {
      try {
        const all = await getAllContractDeliveryBatches();
        setBatchOptions(
          (all ?? []).map((b) => ({
            id: b.deliveryBatchId,
            label: `${b.deliveryBatchCode} — ${b.contractNumber}`,
          }))
        );
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách đợt giao.");
      }
    })();
  }, [form.deliveryBatchId]);

  // Helpers
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...(prev as FormState), [key]: value }));

  const ensureItems = () =>
    setForm((prev) => ({
      ...(prev as FormState),
      orderItems: Array.isArray(prev?.orderItems) ? prev!.orderItems : [],
    }));

  const addRow = () => {
    ensureItems();
    setForm((prev) => ({
      ...(prev as FormState),
      orderItems: [
        ...((prev as FormState).orderItems || []),
        {
          contractDeliveryItemId: "",
          productId: "",
          quantity: "",
          unitPrice: "",
          discountAmount: 0, // %
          note: "",
        },
      ],
    }));
  };

  const updateRow = <K extends keyof OrderItemRow>(
    idx: number,
    key: K,
    value: OrderItemRow[K]
  ) =>
    setForm((prev) => {
      const base = { ...(prev as FormState) };
      const arr = [...(base.orderItems || [])];
      arr[idx] = {
        ...arr[idx],
        [key]:
          key === "quantity" || key === "unitPrice" || key === "discountAmount"
            ? ((value === "" ? "" : Number(value)) as any)
            : (value as any),
      };
      base.orderItems = arr;
      return base;
    });

  const removeRow = (idx: number) =>
    setForm((prev) => {
      const base = { ...(prev as FormState) };
      const arr = [...(base.orderItems || [])];
      arr.splice(idx, 1);
      base.orderItems = arr;
      return base;
    });

  // Tính tổng
  const items = form.orderItems ?? [];

  const lineTotal = (r: OrderItemRow) => {
    const qty = Number(r.quantity) || 0;
    const price = Number(r.unitPrice) || 0;
    const discPercent = Number(r.discountAmount) || 0;
    return Math.max(qty * price * (1 - discPercent / 100), 0);
  };

  const totalQuantity = useMemo(
    () => items.reduce((s, x) => s + (Number(x.quantity) || 0), 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((s, x) => s + lineTotal(x), 0),
    [items]
  );

  const fmtVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n);

  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const data = form;

    // Validate
    if (!data.deliveryBatchId) return toast.error("Vui lòng chọn đợt giao.");
    if (!data.orderItems.length)
      return toast.error("Cần ít nhất 1 dòng sản phẩm.");
    if (data.orderItems.some((r) => !r.contractDeliveryItemId || !r.productId))
      return toast.error("Vui lòng chọn mặt hàng & sản phẩm cho tất cả dòng.");
    if (data.orderItems.some((r) => !(Number(r.quantity) > 0)))
      return toast.error("Số lượng từng dòng phải > 0.");
    if (data.orderItems.some((r) => !(Number(r.unitPrice) > 0)))
      return toast.error("Đơn giá từng dòng phải > 0.");

    // Convert ngày: yyyy-MM-dd -> ISO (orderDate) và giữ yyyy-MM-dd (actual)
    const orderDateIso = data.orderDate
      ? new Date(`${data.orderDate}T00:00:00`).toISOString()
      : undefined;
    const actualDeliveryDateStr = data.actualDeliveryDate || undefined;

    try {
      setSaving(true);

      if (isEdit && initialData) {
        const payload: OrderUpdateDto = {
          orderId: initialData.orderId,
          deliveryBatchId: data.deliveryBatchId,
          deliveryRound:
            data.deliveryRound === "" || data.deliveryRound === undefined
              ? null
              : Number(data.deliveryRound),
          orderDate: orderDateIso ?? undefined,
          actualDeliveryDate: actualDeliveryDateStr ?? undefined,
          note: data.note?.trim() || undefined,
          status: data.status,
          cancelReason: data.cancelReason?.trim() || undefined,
          orderItems: (data.orderItems || []).map((r) => {
            const qty = Number(r.quantity) || 0;
            const price = Number(r.unitPrice) || 0;
            const discountPercent = Number(r.discountAmount) || 0;
            const discountAmount = DISCOUNT_IS_PERCENT
              ? qty * price * (discountPercent / 100)
              : Number(r.discountAmount || 0);
            return {
              orderItemId: r.orderItemId!, // edit phải có
              orderId: initialData.orderId,
              contractDeliveryItemId: r.contractDeliveryItemId,
              productId: r.productId,
              quantity: qty,
              unitPrice: price,
              discountAmount,
              note: r.note?.trim() || undefined,
            };
          }),
        };

        // Tạo promise gốc
        const req = updateOrder(payload.orderId, payload);
        // Hiển thị toast theo trạng thái promise
        toast.promise(req, {
          loading: "Đang cập nhật đơn hàng...",
          success: "Cập nhật đơn hàng thành công!",
          error: "Cập nhật đơn hàng thất bại.",
        });
        // Quan trọng: chờ promise gốc -> nếu fail sẽ nhảy vào catch, KHÔNG gọi onSuccess
        await req;
      } else {
        const payload: OrderCreateDto = {
          deliveryBatchId: data.deliveryBatchId,
          deliveryRound:
            data.deliveryRound === "" || data.deliveryRound === undefined
              ? null
              : Number(data.deliveryRound),
          orderDate: orderDateIso ?? null,
          actualDeliveryDate: actualDeliveryDateStr ?? null,
          note: data.note?.trim() ?? null,
          status: data.status,
          cancelReason: data.cancelReason?.trim() ?? null,
          orderItems: (data.orderItems || []).map((r) => {
            const qty = Number(r.quantity) || 0;
            const price = Number(r.unitPrice) || 0;
            const discountPercent = Number(r.discountAmount) || 0;
            const discountAmount = DISCOUNT_IS_PERCENT
              ? qty * price * (discountPercent / 100)
              : Number(r.discountAmount || 0);
            return {
              contractDeliveryItemId: r.contractDeliveryItemId,
              productId: r.productId,
              quantity: qty,
              unitPrice: price,
              discountAmount,
              note: r.note?.trim() || undefined,
            };
          }),
        };

        const req = createOrder(payload);
        toast.promise(req, {
          loading: "Đang tạo đơn hàng...",
          success: "Tạo đơn hàng thành công!",
          error: "Tạo đơn hàng thất bại.",
        });
        await req;
      }

      // Chỉ gọi khi request thành công
      onSuccess();
    } catch (err) {
      console.error(err);
      // Ở đây KHÔNG điều hướng, chỉ báo lỗi
      toast.error("Đã xảy ra lỗi khi lưu đơn hàng.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="max-w-5xl mx-auto bg-white border rounded-2xl shadow p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-center">
        {isEdit ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
      </h2>

      {/* DeliveryBatch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Đợt giao (create = select, edit = read-only) */}
        <div>
          <label className="block mb-1 text-sm font-medium">Đợt giao</label>

          {!isEdit ? (
            // CREATE: cho phép chọn
            <select
              className="w-full p-2 border rounded"
              value={form.deliveryBatchId}
              onChange={(e) => {
                const id = e.target.value;
                setField("deliveryBatchId", id);
                // tùy chọn: cập nhật code tức thời từ batchOptions
                const found = batchOptions.find((b) => b.id === id);
                if (found)
                  setDeliveryBatchCode(found.label.split(" — ")[0] || "");
                // effect sau đó sẽ fetch viewDetails và đồng bộ lại mọi thứ
              }}
            >
              <option value="">-- Chọn đợt giao --</option>
              {batchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          ) : (
            // EDIT: chỉ hiển thị code đọc-chỉ để biết đang thuộc đợt nào
            <Input
              value={deliveryBatchCode || "—"}
              readOnly
              className="bg-muted/40"
            />
          )}
        </div>

        {/* Số đợt */}
        <div>
          <label className="block mb-1 text-sm font-medium">Số đợt</label>
          <Input
            type="number"
            value={form.deliveryRound ?? ""}
            onChange={(e) =>
              setField(
                "deliveryRound",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="no-spinner"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key.toLowerCase() === "e")
                e.preventDefault();
            }}
          />
        </div>

        {/* Ngày đặt */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Ngày đặt (OrderDate)
          </label>
          <DatePicker
            value={form.orderDate}
            onChange={(v) => setField("orderDate", v)}
            placeholder="yyyy-MM-dd"
          />
        </div>
      </div>

      {/* ActualDeliveryDate + Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">
            Ngày giao thực tế
          </label>
          <DatePicker
            value={form.actualDeliveryDate}
            onChange={(v) => setField("actualDeliveryDate", v)}
            placeholder="yyyy-MM-dd"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Trạng thái</label>
          <select
            className="w-full p-2 border rounded"
            value={form.status}
            onChange={(e) => setField("status", e.target.value as OrderStatus)}
          >
            {Object.values(OrderStatus).map((s) => (
              <option key={s} value={s}>
                {OrderStatusLabel[s]}
              </option>
            ))}
          </select>
        </div>

        {isEdit && (
          <div>
            <label className="block mb-1 text-sm font-medium">
              Lý do huỷ (tuỳ chọn)
            </label>
            <Input
              value={form.cancelReason ?? ""}
              onChange={(e) => setField("cancelReason", e.target.value)}
              placeholder="Cancel reason"
              disabled={form.status !== OrderStatus.Cancelled}
            />
          </div>
        )}
      </div>

      {/* Note */}
      <div>
        <label className="block mb-1 text-sm font-medium">Ghi chú</label>
        <Textarea
          placeholder="Nhập ghi chú (tuỳ chọn)"
          value={form.note ?? ""}
          onChange={(e) => setField("note", e.target.value)}
        />
      </div>

      {/* Order Items */}
      <div className="space-y-2">
        <label className="block mb-1 text-sm font-medium">
          Danh sách mặt hàng
        </label>

        {(form.orderItems ?? []).length > 0 && (
          <>
            {/* Header giống contract, thêm cột Sản phẩm => 7 cột */}
            <div className="hidden md:grid md:grid-cols-7 gap-2 mb-1 text-xs font-medium text-muted-foreground">
              <span>Mặt hàng đợt giao</span>
              <span>Sản phẩm</span>
              <span>Số lượng (kg)</span>
              <span>Đơn giá (VND/Kg)</span>
              <span>Giảm trừ (%)</span>
              <span>Ghi chú</span>
              <span></span>
            </div>

            {/* Body */}
            {(form.orderItems || []).map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-2"
              >
                {/* Mặt hàng đợt giao */}
                <select
                  value={row.contractDeliveryItemId}
                  onChange={(e) =>
                    updateRow(idx, "contractDeliveryItemId", e.target.value)
                  }
                  className="p-2 border rounded"
                  disabled={loadingOptions}
                >
                  <option value="">-- Chọn mặt hàng --</option>
                  {(deliveryItemOptions ?? []).map((it) => (
                    <option
                      key={it.contractDeliveryItemId}
                      value={it.contractDeliveryItemId}
                    >
                      {it.name}
                    </option>
                  ))}
                </select>

                {/* Sản phẩm */}
                <select
                  value={row.productId}
                  onChange={(e) => updateRow(idx, "productId", e.target.value)}
                  className="p-2 border rounded"
                  disabled={loadingOptions}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {(productOptions ?? []).map((p) => (
                    <option key={p.productId} value={p.productId}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Số lượng */}
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(
                      idx,
                      "quantity",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="no-spinner"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key.toLowerCase() === "e")
                      e.preventDefault();
                  }}
                />

                {/* Đơn giá */}
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  value={row.unitPrice}
                  onChange={(e) =>
                    updateRow(
                      idx,
                      "unitPrice",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="no-spinner"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key.toLowerCase() === "e")
                      e.preventDefault();
                  }}
                />

                {/* Giảm trừ (%) */}
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={row.discountAmount ?? 0}
                  onChange={(e) =>
                    updateRow(
                      idx,
                      "discountAmount",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="no-spinner"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key.toLowerCase() === "e")
                      e.preventDefault();
                  }}
                />

                {/* Ghi chú */}
                <Input
                  placeholder="Ghi chú"
                  value={row.note ?? ""}
                  onChange={(e) => updateRow(idx, "note", e.target.value)}
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
          </>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          disabled={loadingOptions || !form.deliveryBatchId}
        >
          + Thêm mặt hàng
        </Button>

        {/* Tổng */}
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <div>
            Tổng SL: <strong>{totalQuantity.toLocaleString()} kg</strong>
          </div>
          <div>
            Tổng tiền tạm tính: <strong>{fmtVnd(totalAmount)} VNĐ</strong>
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-between pt-4">
        <Button type="submit" onClick={handleSubmit} disabled={saving}>
          {isEdit ? "Lưu thay đổi" : "Tạo đơn hàng"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </DialogFooter>
    </form>
  );
}
