"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProcessingBatch, getAvailableCoffeeTypes, ProcessingBatch } from "@/lib/api/processingBatches";
import { getAllCropSeasons, CropSeasonListItem } from "@/lib/api/cropSeasons";
import { getAllProcessingMethods, ProcessingMethod } from "@/lib/api/processingMethods";

interface Props {
  onSuccess?: () => void;
}

interface CoffeeType {
  coffeeTypeId: string;
  typeCode: string;
  typeName: string;
  botanicalName: string;
  description: string;
  typicalRegion: string;
  specialtyLevel: string;
}

export default function ProcessingBatchForm({ onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [processingMethods, setProcessingMethods] = useState<ProcessingMethod[]>([]);
  
  const [form, setForm] = useState({
    cropSeasonId: "",
    coffeeTypeId: "",
    methodId: 0,
    batchCode: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch crop seasons
        const seasons = await getAllCropSeasons();
        const availableSeasons = (seasons || []).filter(s => s.status === "Active" || s.status === "InProgress");
        setCropSeasons(availableSeasons);

        // Fetch processing methods
        const methods = await getAllProcessingMethods();
        setProcessingMethods(methods || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu cần thiết");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCoffeeTypes = async () => {
      if (form.cropSeasonId) {
        try {
          const types = await getAvailableCoffeeTypes(form.cropSeasonId);
          setCoffeeTypes(types || []);
        } catch (err) {
          console.error("Error fetching coffee types:", err);
          setCoffeeTypes([]);
        }
      } else {
        setCoffeeTypes([]);
      }
    };
    fetchCoffeeTypes();
  }, [form.cropSeasonId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "methodId" ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!form.cropSeasonId) {
      setError("Vui lòng chọn vụ mùa");
      setLoading(false);
      return;
    }

    if (!form.coffeeTypeId) {
      setError("Vui lòng chọn loại cà phê");
      setLoading(false);
      return;
    }

    if (!form.methodId) {
      setError("Vui lòng chọn phương pháp sơ chế");
      setLoading(false);
      return;
    }

    if (!form.batchCode.trim()) {
      setError("Vui lòng nhập mã lô sơ chế");
      setLoading(false);
      return;
    }

    try {
      await createProcessingBatch({
        cropSeasonId: form.cropSeasonId,
        coffeeTypeId: form.coffeeTypeId,
        methodId: form.methodId,
        batchCode: form.batchCode.trim(),
        inputQuantity: 0, // Sẽ được backend tính toán tự động
        inputUnit: "kg", // Đơn vị mặc định
      });

      setSuccess("Tạo lô sơ chế thành công!");
      onSuccess?.();
      setTimeout(() => router.push("/dashboard/farmer/processing/batches"), 1200);
    } catch (err: any) {
      console.error("❌ Create batch error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Tạo lô sơ chế thất bại!";
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Thông tin lô sơ chế mới</h3>
        <p className="text-blue-700">Tạo lô sơ chế từ cà phê đã thu hoạch</p>
      </div>

      <div>
        <label className="block font-medium mb-2">Vụ mùa *</label>
        <select
          name="cropSeasonId"
          value={form.cropSeasonId}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn vụ mùa --</option>
          {cropSeasons.map((season) => (
            <option key={season.cropSeasonId} value={season.cropSeasonId}>
              {season.seasonName} ({new Date(season.startDate).getFullYear()})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-2">Loại cà phê *</label>
        <select
          name="coffeeTypeId"
          value={form.coffeeTypeId}
          onChange={handleChange}
          required
          disabled={!form.cropSeasonId}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">
            {!form.cropSeasonId ? "-- Vui lòng chọn vụ mùa trước --" : "-- Chọn loại cà phê --"}
          </option>
          {coffeeTypes.map((type) => (
            <option key={type.coffeeTypeId} value={type.coffeeTypeId}>
              {type.typeName} ({type.typeCode})
            </option>
          ))}
        </select>
        {!form.cropSeasonId && (
          <p className="text-sm text-gray-500 mt-1">Chọn vụ mùa để xem các loại cà phê có sẵn</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-2">Phương pháp sơ chế *</label>
        <select
          name="methodId"
          value={form.methodId}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={0}>-- Chọn phương pháp --</option>
          {processingMethods.map((method) => (
            <option key={method.methodId} value={method.methodId}>
              {method.methodName} ({method.methodCode}) - {method.steps} bước
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-2">Mã lô sơ chế *</label>
        <Input
          type="text"
          name="batchCode"
          value={form.batchCode}
          onChange={handleChange}
          placeholder="VD: BATCH-2024-001"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Nhập mã lô để dễ dàng quản lý và theo dõi</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Huỷ
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Đang tạo..." : "Tạo lô sơ chế"}
        </Button>
      </div>
    </form>
  );
}
