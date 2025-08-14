"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getContractDetails } from "@/lib/api/contracts";
import {
  createContractDeliveryBatch,
  updateContractDeliveryBatch,
  ContractDeliveryBatchCreateDto,
  ContractDeliveryBatchUpdateDto,
  getContractDeliveryBatchById,
} from "@/lib/api/contractDeliveryBatches";
import {
  ContractDeliveryBatchStatus,
  ContractDeliveryBatchStatusLabel,
} from "@/lib/constants/contractDeliveryBatchStatus";
import { toDateOnly, fromDateOnly } from "@/lib/utils";

export type ContractOption = { contractId: string; contractNumber: string };

// Form State
type DeliveryBatchFormState = {
  // Giống create DTO nhưng expectedDeliveryDate có thể undefined
  contractId: string;
  deliveryRound: number;
  expectedDeliveryDate?: Date;
  totalPlannedQuantity: number;
  status: ContractDeliveryBatchStatus;
  contractDeliveryItems: {
    contractItemId: string;
    plannedQuantity: number;
    note?: string;
  }[];
};

type Props = {
  initialData?: ContractDeliveryBatchUpdateDto;
  onSuccess: () => void;
  contractId?: string;
  contractOptions?: ContractOption[];
};

export default function ContractDeliveryBatchForm({
  initialData,
  onSuccess,
  contractId,
  contractOptions = [],
}: Props) {
  const isEdit = !!initialData;
  const router = useRouter();

  // formData
  const [formData, setFormData] = useState<DeliveryBatchFormState | null>(null);

  type ContractItemOption = { contractItemId: string; coffeeTypeName: string };
  const [itemOptions, setItemOptions] = useState<ContractItemOption[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Helpers
  const toDateOnlyString = (d?: Date | string) => {
    if (!d) return "";
    if (d instanceof Date) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    // giả định đã là 'YYYY-MM-DD'
    return d;
  };

  // Khởi tạo form từ initialData (edit) hoặc từ contractId (create)
  useEffect(() => {
    if (initialData) {
      setFormData({
        contractId: initialData.contractId,
        deliveryRound: initialData.deliveryRound,
        expectedDeliveryDate: fromDateOnly(
          initialData.expectedDeliveryDate ?? undefined
        ),
        totalPlannedQuantity: initialData.totalPlannedQuantity,
        status: initialData.status,
        contractDeliveryItems:
          (initialData as any).contractDeliveryItems ??
          (initialData as any).deliveryItems ??
          [],
      });
    } else {
      setFormData({
        contractId: contractId ?? "",
        deliveryRound: 1,
        expectedDeliveryDate: undefined, // để trống DatePicker
        totalPlannedQuantity: 0,
        status: ContractDeliveryBatchStatus.InProgress,
        contractDeliveryItems: [],
      });
    }
  }, [initialData, contractId]);

  // Load danh sách ContractItem theo contractId đang chọn
  useEffect(() => {
    const cid = formData?.contractId;
    if (!cid) {
      setItemOptions([]);
      return;
    }
    (async () => {
      try {
        setLoadingItems(true);
        const detail = await getContractDetails(cid);
        const raw =
          (detail as any).contractItems ??
          (detail as any).contractItemViews ??
          (detail as any).items ??
          [];
        setItemOptions(
          (Array.isArray(raw) ? raw : []).map((x: any) => ({
            contractItemId: x.contractItemId,
            coffeeTypeName: x.coffeeTypeName,
          }))
        );
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải danh sách mặt hàng của hợp đồng.");
      } finally {
        setLoadingItems(false);
      }
    })();
  }, [formData?.contractId]);

  // Khi vào trang EDIT: tải items của ĐỢT GIAO (đúng nguồn)
  useEffect(() => {
    if (!isEdit || !initialData?.deliveryBatchId) return;
    (async () => {
      try {
        const detail = await getContractDeliveryBatchById(
          initialData.deliveryBatchId
        );
        const rows = (detail.contractDeliveryItems ?? []).map((x) => ({
          contractItemId: x.contractItemId,
          plannedQuantity: x.plannedQuantity ?? 0,
          note: x.note ?? "",
        }));

        setFormData((prev) =>
          prev
            ? { ...prev, contractDeliveryItems: rows }
            : {
                contractId: detail.contractId,
                deliveryRound: detail.deliveryRound,
                expectedDeliveryDate: fromDateOnly(detail.expectedDeliveryDate), // sửa đây
                totalPlannedQuantity: detail.totalPlannedQuantity ?? 0,
                status: detail.status,
                contractDeliveryItems: rows,
              }
        );
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách mặt hàng của đợt giao.");
      }
    })();
  }, [isEdit, initialData?.deliveryBatchId]);

  if (!formData) {
    return (
      <div className="text-gray-500 text-center py-10">
        Đang khởi tạo biểu mẫu đợt giao...
      </div>
    );
  }

  // set field
  const handleChange = (field: keyof DeliveryBatchFormState, value: any) =>
    setFormData((prev) => ({
      ...(prev as DeliveryBatchFormState),
      [field]: value,
    }));

  // Items helpers
  const ensureItems = () =>
    setFormData((prev) => ({
      ...(prev as DeliveryBatchFormState),
      contractDeliveryItems: Array.isArray(prev?.contractDeliveryItems)
        ? (prev as DeliveryBatchFormState).contractDeliveryItems
        : [],
    }));

  const addRow = () => {
    ensureItems();
    setFormData((prev) => ({
      ...(prev as DeliveryBatchFormState),
      contractDeliveryItems: [
        ...((prev as DeliveryBatchFormState).contractDeliveryItems || []),
        { contractItemId: "", plannedQuantity: 0, note: "" },
      ],
    }));
  };

  const updateRow = (
    index: number,
    field: "contractItemId" | "plannedQuantity" | "note",
    value: any
  ) =>
    setFormData((prev) => {
      const base = { ...(prev as DeliveryBatchFormState) };
      const arr = [...(base.contractDeliveryItems || [])];
      arr[index] = {
        ...arr[index],
        [field]: field === "plannedQuantity" ? Number(value) : value,
      };
      base.contractDeliveryItems = arr;
      return base;
    });

  const removeRow = (index: number) =>
    setFormData((prev) => {
      const base = { ...(prev as DeliveryBatchFormState) };
      const arr = [...(base.contractDeliveryItems || [])];
      arr.splice(index, 1);
      base.contractDeliveryItems = arr;
      return base;
    });

  const sumPlannedQuantity = () =>
    (formData.contractDeliveryItems || []).reduce(
      (acc, x) => acc + (Number(x.plannedQuantity) || 0),
      0
    );

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Narrow: nếu chưa khởi tạo thì dừng
    const data = formData;
    if (!data) {
      toast.error("Biểu mẫu chưa sẵn sàng, vui lòng thử lại.");
      return;
    }

    // Validate cơ bản
    if (!data.contractId) return toast.error("Vui lòng chọn hợp đồng.");
    if (!data.expectedDeliveryDate)
      return toast.error("Vui lòng chọn ngày dự kiến.");

    const picked = new Date(data.expectedDeliveryDate as any);
    picked.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (picked < today)
      return toast.error("Ngày giao dự kiến không được ở quá khứ.");
    if (!data.expectedDeliveryDate)
      return toast.error("Vui lòng chọn ngày dự kiến.");

    if (data.deliveryRound < 1) return toast.error("Số đợt phải ≥ 1.");

    const items = data.contractDeliveryItems || [];
    if (!items.length)
      return toast.error("Phải có ít nhất 1 dòng sản phẩm giao hàng.");
    if (items.some((it) => !it.contractItemId))
      return toast.error("Vui lòng chọn loại cà phê cho tất cả dòng.");
    if (items.some((it) => !(Number(it.plannedQuantity) > 0)))
      return toast.error("Số lượng từng dòng phải > 0.");

    const total = items.reduce(
      (s, x) => s + (Number(x.plannedQuantity) || 0),
      0
    );
    if (!(total > 0)) return toast.error("Tổng khối lượng dự kiến phải > 0.");

    // Build DTO đúng kiểu cho BE (DateOnly string)
    const expected = toDateOnlyString(data.expectedDeliveryDate);

    try {
      if (isEdit && initialData) {
        const payload: ContractDeliveryBatchUpdateDto = {
          deliveryBatchId: initialData.deliveryBatchId,
          contractId: data.contractId,
          deliveryRound: data.deliveryRound,
          expectedDeliveryDate: expected,
          totalPlannedQuantity: data.totalPlannedQuantity,
          status: data.status,
          contractDeliveryItems: data.contractDeliveryItems as any,
        };

        const result = await updateContractDeliveryBatch(
          payload.deliveryBatchId,
          payload
        );
        toast.success("Cập nhật đợt giao thành công!");
        // Chỉ gọi onSuccess khi update thành công
        onSuccess();
      } else {
        const payload: ContractDeliveryBatchCreateDto = {
          contractId: data.contractId,
          deliveryRound: data.deliveryRound,
          expectedDeliveryDate: expected,
          totalPlannedQuantity: data.totalPlannedQuantity,
          status: data.status,
          contractDeliveryItems: data.contractDeliveryItems as any,
        };

        const result = await createContractDeliveryBatch(payload);
        toast.success("Tạo đợt giao thành công!");
        // Chỉ gọi onSuccess khi create thành công
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi lưu đợt giao.");
      // Không gọi onSuccess khi có lỗi - form sẽ ở lại trang hiện tại
    }
  }

  const dateString = toDateOnly(formData.expectedDeliveryDate);

  // ---------- UI ----------
  return (
    <form className="max-w-4xl mx-auto bg-white border rounded-2xl shadow p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isEdit ? "Chỉnh sửa đợt giao" : "Tạo đợt giao mới"}
      </h2>

      {/* Hợp đồng */}
      {contractId ? (
        <div>
          <label className="block mb-1 text-sm font-medium">Hợp đồng</label>
          <Input value={contractId} disabled />
        </div>
      ) : (
        <div>
          <label className="block mb-1 text-sm font-medium">Hợp đồng</label>
          <select
            value={formData.contractId}
            onChange={(e) => handleChange("contractId", e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Chọn hợp đồng --</option>
            {contractOptions.map((c) => (
              <option key={c.contractId} value={c.contractId}>
                {c.contractNumber}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Fields chính */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Đợt giao</label>
          <Input
            type="number"
            min={1}
            value={formData.deliveryRound}
            onChange={(e) =>
              handleChange("deliveryRound", Number(e.target.value))
            }
            className="no-spinner"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key.toLowerCase() === "e")
                e.preventDefault();
            }}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Ngày dự kiến</label>
          <DatePicker
            value={dateString}
            onChange={(d) =>
              handleChange("expectedDeliveryDate", fromDateOnly(d))
            }
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Khối lượng dự kiến (kg)
          </label>
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={formData.totalPlannedQuantity}
            onChange={(e) =>
              handleChange("totalPlannedQuantity", Number(e.target.value))
            }
            className="no-spinner"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key.toLowerCase() === "e")
                e.preventDefault();
            }}
          />
        </div>
      </div>

      {/* Trạng thái */}
      {isEdit ? (
        <div>
          <label className="block mb-1 text-sm font-medium">Trạng thái</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.status}
            onChange={(e) =>
              handleChange(
                "status",
                e.target.value as ContractDeliveryBatchStatus
              )
            }
          >
            {Object.values(ContractDeliveryBatchStatus).map((s) => (
              <option key={s} value={s}>
                {ContractDeliveryBatchStatusLabel[s]}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block mb-1 text-sm font-medium">Trạng thái</label>
          <div className="p-2 border rounded bg-gray-50">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {
                ContractDeliveryBatchStatusLabel[
                  ContractDeliveryBatchStatus.InProgress
                ]
              }
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Đợt giao mới sẽ có trạng thái "Đang thực hiện" mặc định
          </p>
        </div>
      )}

      {/* Ghi chú */}
      <div>
        <label className="block mb-1 text-sm font-medium">Ghi chú</label>
        <Textarea
          placeholder="Nhập ghi chú (tuỳ chọn)"
          value={(formData as any).note || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...(p as any), note: e.target.value }))
          }
        />
      </div>

      {/* Danh sách mặt hàng */}
      <div>
        <label className="block mb-1 text-sm font-medium">
          Danh sách mặt hàng đợt giao
        </label>

        {(formData.contractDeliveryItems?.length ?? 0) > 0 && (
          <div className="hidden md:grid md:grid-cols-6 gap-2 mb-1 text-xs font-medium text-muted-foreground">
            <span>Loại cà phê</span>
            <span className="text-left">Số lượng (kg)</span>
            <span className="col-span-3">Ghi chú</span>
            <span></span>
          </div>
        )}

        {(formData.contractDeliveryItems || []).map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2">
            <select
              value={row.contractItemId}
              onChange={(e) => updateRow(idx, "contractItemId", e.target.value)}
              className="p-2 border rounded"
              disabled={loadingItems || !itemOptions.length}
            >
              <option value="">-- Chọn loại cà phê --</option>
              {itemOptions.map((opt) => (
                <option key={opt.contractItemId} value={opt.contractItemId}>
                  {opt.coffeeTypeName}
                </option>
              ))}
            </select>

            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={row.plannedQuantity ?? 0}
              onChange={(e) =>
                updateRow(idx, "plannedQuantity", e.target.value)
              }
              className="no-spinner text-left"
              onKeyDown={(e) => {
                if (e.key === "-" || e.key.toLowerCase() === "e")
                  e.preventDefault();
              }}
            />

            <Input
              placeholder="Ghi chú"
              value={row.note || ""}
              onChange={(e) => updateRow(idx, "note", e.target.value)}
              className="md:col-span-3"
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
            disabled={!formData.contractId || loadingItems}
          >
            + Thêm dòng
          </Button>

          <div className="text-sm text-gray-600">
            Tổng khối lượng dòng:{" "}
            <strong>{sumPlannedQuantity().toLocaleString()}</strong> kg
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-between pt-4">
        <Button type="submit" onClick={handleSubmit}>
          <h2>{isEdit ? "Lưu thay đổi" : "Tạo đợt giao"}</h2>
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </DialogFooter>
    </form>
  );
}
