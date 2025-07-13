"use client";

import { useEffect, useState } from "react";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import { AppToast } from "@/components/ui/AppToast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  CropSeasonDetailStatusMap,
  CropSeasonDetailStatusValue,
  CropSeasonDetailStatusNumberToValue,
  CropSeasonDetailStatusValueToNumber,
} from "@/lib/constrant/cropSeasonDetailStatus";
import {
  getCropSeasonDetailById,
  updateCropSeasonDetail,
} from "@/lib/api/cropSeasonDetail ";

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
    coffeeTypeId: "",
    areaAllocated: "",
    plannedQuality: "",
    expectedHarvestStart: "",
    expectedHarvestEnd: "",
    estimatedYield: "",
    status: "Planned" as CropSeasonDetailStatusValue,
  });

  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, detail] = await Promise.all([
          getCoffeeTypes(),
          getCropSeasonDetailById(detailId),
        ]);

        setCoffeeTypes(types);

        setForm({
          coffeeTypeId: detail.coffeeTypeId,
          areaAllocated: detail.areaAllocated?.toString() || "",
          plannedQuality: detail.plannedQuality || "",
          expectedHarvestStart: detail.expectedHarvestStart,
          expectedHarvestEnd: detail.expectedHarvestEnd,
          estimatedYield: detail.estimatedYield?.toString() || "",
          status: CropSeasonDetailStatusNumberToValue[detail.status],
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
      coffeeTypeId,
      areaAllocated,
      plannedQuality,
      expectedHarvestStart,
      expectedHarvestEnd,
      estimatedYield,
      status,
    } = form;

    const parsedStatus = CropSeasonDetailStatusValueToNumber[status];

    const payload = {
      detailId,
      coffeeTypeId,
      expectedHarvestStart,
      expectedHarvestEnd,
      estimatedYield: parseFloat(estimatedYield || "0"),
      areaAllocated: parseFloat(areaAllocated),
      plannedQuality,
      status: parsedStatus,
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
        <Label>Loại cà phê</Label>
        <select
          name="coffeeTypeId"
          value={form.coffeeTypeId}
          onChange={handleChange}
          className="w-full border rounded px-2 py-2"
        >
          <option value="">-- Chọn loại cà phê --</option>
          {coffeeTypes.map((type) => (
            <option key={type.coffeeTypeId} value={type.coffeeTypeId}>
              {type.typeName}
            </option>
          ))}
        </select>
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
        <Input
          name="plannedQuality"
          value={form.plannedQuality}
          onChange={handleChange}
        />
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

      <div>
        <Label>Năng suất ước tính (tấn)</Label>
        <Input
          type="number"
          name="estimatedYield"
          value={form.estimatedYield}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label>Trạng thái</Label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border rounded px-2 py-2"
        >
          {Object.entries(CropSeasonDetailStatusMap).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
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
