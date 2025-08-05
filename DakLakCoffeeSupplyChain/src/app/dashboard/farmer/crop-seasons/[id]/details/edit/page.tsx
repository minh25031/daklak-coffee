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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const QUALITY_OPTIONS = [
    { label: "Cà phê đặc sản (SCA 80+)", value: "SCA 80+" },
    { label: "Robusta chất lượng cao (Fine Robusta)", value: "Fine Robusta" },
    { label: "Loại A", value: "Grade A" },
    { label: "Hữu cơ (Organic)", value: "Organic" },
    { label: "Tiêu chuẩn cơ bản", value: "Standard" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const detail = await getCropSeasonDetailById(detailId);

        setForm({
          commitmentDetailId: detail.commitmentDetailId,
          areaAllocated: detail.areaAllocated?.toString() || "",
          plannedQuality: detail.plannedQuality || "",
          expectedHarvestStart: detail.expectedHarvestStart,
          expectedHarvestEnd: detail.expectedHarvestEnd,
        });
      } catch (err) {
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
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const {
      commitmentDetailId,
      areaAllocated,
      plannedQuality,
      expectedHarvestStart,
      expectedHarvestEnd,
    } = form;

    const payload = {
      detailId,
      commitmentDetailId,
      expectedHarvestStart,
      expectedHarvestEnd,
      areaAllocated: parseFloat(areaAllocated),
      plannedQuality,
    };

    setIsSubmitting(true);
    try {
      await updateCropSeasonDetail(detailId, payload);
      AppToast.success("Cập nhật vùng trồng thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      AppToast.error((err as any)?.message || "Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="p-4 text-sm">Đang tải dữ liệu...</p>;

  return (
    <div className="space-y-4">
      <div>
        <Label>ID dòng cam kết (commitmentDetailId)</Label>
        <Input
          name="commitmentDetailId"
          value={form.commitmentDetailId}
          onChange={handleChange}
          placeholder="Nhập ID dòng cam kết"
          required
        />
      </div>

      <div>
        <Label>Diện tích (ha)</Label>
        <Input
          type="number"
          name="areaAllocated"
          value={form.areaAllocated}
          onChange={handleChange}
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
