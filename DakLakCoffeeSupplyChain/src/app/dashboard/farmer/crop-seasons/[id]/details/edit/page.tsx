"use client";

import { useEffect, useState } from "react";
import { AppToast } from "@/components/ui/AppToast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getCropSeasonDetailById,
  updateCropSeasonDetail,
} from "@/lib/api/cropSeasonDetail";

interface Props {
  detailId: string;
  cropSeasonId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateCropSeasonDetailDialog({
  detailId,
  cropSeasonId,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    commitmentDetailId: "",
    areaAllocated: "",
    plannedQuality: "",
    expectedHarvestStart: "",
    expectedHarvestEnd: "",
  });

  const [commitmentDetailCode, setCommitmentDetailCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const QUALITY_OPTIONS = [
    { label: "Cà phê đặc sản (SCA 80+)", value: "SCA 80+" },
    { label: "Robusta chất lượng cao (Fine Robusta)", value: "Fine Robusta" },
    { label: "Loại A", value: "Grade A" },
    { label: "Hữu cơ (Organic)", value: "Organic" },
    { label: "Tiêu chuẩn cơ bản", value: "Standard" },
  ];

  const toDateInput = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const detail = await getCropSeasonDetailById(detailId);
        setForm({
          commitmentDetailId: detail.commitmentDetailId,
          areaAllocated: detail.areaAllocated?.toString() || "",
          plannedQuality: detail.plannedQuality || "",
          expectedHarvestStart: toDateInput(detail.expectedHarvestStart),
          expectedHarvestEnd: toDateInput(detail.expectedHarvestEnd),
        });
        setCommitmentDetailCode(detail.commitmentDetailCode || "");
      } catch {
        AppToast.error("Không thể tải dữ liệu vùng trồng");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [detailId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs: string[] = [];
    const area = form.areaAllocated ? parseFloat(form.areaAllocated) : NaN;
    if (form.areaAllocated && (Number.isNaN(area) || area < 0)) {
      errs.push("Diện tích phải là số ≥ 0.");
    }
    if (form.expectedHarvestStart && form.expectedHarvestEnd) {
      const s = new Date(form.expectedHarvestStart).getTime();
      const e = new Date(form.expectedHarvestEnd).getTime();
      if (e < s) errs.push("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
    }
    if (errs.length) AppToast.error(errs.join(" "));
    return errs.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      detailId,
      commitmentDetailId: form.commitmentDetailId || undefined, // nếu không đổi có thể để undefined
      expectedHarvestStart: form.expectedHarvestStart || undefined,
      expectedHarvestEnd: form.expectedHarvestEnd || undefined,
      areaAllocated: form.areaAllocated ? parseFloat(form.areaAllocated) : undefined,
      plannedQuality: form.plannedQuality || undefined,
    };

    setIsSubmitting(true);
    try {
      await updateCropSeasonDetail(detailId, payload);
      AppToast.success("Cập nhật vùng trồng thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      AppToast.error(err?.message || "Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="p-4 text-sm">Đang tải dữ liệu...</p>;

  return (
    <div className="space-y-4">
      {/* Thông tin cam kết vùng trồng */}
      <div className="rounded-md border p-3 bg-muted/30">
        <p className="text-sm font-medium mb-2">Thông tin cam kết vùng trồng</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <Label className="text-xs">Mã dòng cam kết</Label>
            <Input value={commitmentDetailCode || form.commitmentDetailId} disabled readOnly />
          </div>
        </div>
      </div>

      {/* Trường chỉnh sửa */}
      <div>
        <Label>Diện tích (ha)</Label>
        <Input
          type="number"
          name="areaAllocated"
          value={form.areaAllocated}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <Label>Chất lượng dự kiến</Label>
        <select
          name="plannedQuality"
          value={form.plannedQuality}
          onChange={handleChange}
          className="w-full border rounded px-2 py-2"
        >
          <option value="">-- Chọn chất lượng --</option>
          {QUALITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Bắt đầu thu hoạch</Label>
          <Input
            type="date"
            name="expectedHarvestStart"
            value={form.expectedHarvestStart}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Kết thúc thu hoạch</Label>
          <Input
            type="date"
            name="expectedHarvestEnd"
            value={form.expectedHarvestEnd}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Huỷ
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </div>
    </div>
  );
}
