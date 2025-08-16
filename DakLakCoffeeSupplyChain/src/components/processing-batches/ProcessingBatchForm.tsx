"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { createProcessingBatch, getAvailableProcessingData, ProcessingBatch, ProcessingDataResponse, ProcessingInfo, CoffeeType } from "@/lib/api/processingBatches";
import { getAllProcessingMethods, ProcessingMethod } from "@/lib/api/processingMethods";
import { getAllCropSeasons, CropSeasonListItem } from "@/lib/api/cropSeasons";

interface Props {
  onSuccess?: () => void;
}

export default function ProcessingBatchForm({ onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [processingInfo, setProcessingInfo] = useState<ProcessingInfo[]>([]);
  const [processingMethods, setProcessingMethods] = useState<ProcessingMethod[]>([]);
  
  const [form, setForm] = useState({
    cropSeasonId: "",
    coffeeTypeId: "",
    methodId: 0,
    batchCode: "",
  });

  useEffect(() => {
    fetchCropSeasons();
    fetchProcessingMethods();
  }, []);

  useEffect(() => {
    if (form.cropSeasonId) {
      fetchCoffeeTypes();
    } else {
      setCoffeeTypes([]);
      setProcessingInfo([]);
    }
  }, [form.cropSeasonId]);

  // Tự động chọn phương pháp sơ chế từ plan khi chọn loại cà phê
  useEffect(() => {
    if (form.coffeeTypeId && processingInfo.length > 0) {
      const info = processingInfo.find(p => p.coffeeTypeId === form.coffeeTypeId);
      if (info && info.hasPlanProcessingMethod && info.planProcessingMethodId) {
        setForm(prev => ({
          ...prev,
          methodId: info.planProcessingMethodId || 0
        }));
      }
    }
  }, [form.coffeeTypeId, processingInfo]);

  const fetchCropSeasons = async () => {
    try {
      const response = await getAvailableProcessingData();
      setCropSeasons(response.cropSeasons || []);
    } catch (err) {
      console.error("❌ Lỗi fetchCropSeasons:", err);
    }
  };

  const fetchProcessingMethods = async () => {
    try {
      const methods = await getAllProcessingMethods();
      setProcessingMethods(methods || []);
    } catch (err) {
      console.error("❌ Lỗi fetchProcessingMethods:", err);
    }
  };

  const fetchCoffeeTypes = async () => {
    try {
      setLoading(true);
      const response: ProcessingDataResponse = await getAvailableProcessingData(form.cropSeasonId);
      setCoffeeTypes(response.coffeeTypes || []);
      setProcessingInfo(response.processingInfo || []);
    } catch (err) {
      console.error("❌ Lỗi fetchCoffeeTypes:", err);
      setCoffeeTypes([]);
      setProcessingInfo([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    // Kiểm tra xem plan có định nghĩa phương pháp sơ chế không
    const info = processingInfo.find(p => p.coffeeTypeId === form.coffeeTypeId);
    if (!info || !info.hasPlanProcessingMethod || !info.planProcessingMethodId) {
      setError("Loại cà phê này không có yêu cầu sơ chế từ kế hoạch");
      setLoading(false);
      return;
    }

    if (!form.batchCode.trim()) {
      setError("Vui lòng nhập mã lô sơ chế");
      setLoading(false);
      return;
    }

    try {
      // Sử dụng phương pháp sơ chế từ plan
      await createProcessingBatch({
        cropSeasonId: form.cropSeasonId,
        coffeeTypeId: form.coffeeTypeId,
        methodId: info.planProcessingMethodId,
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

  // Lấy thông tin phương pháp sơ chế từ plan cho loại cà phê đang chọn
  const getSelectedCoffeeTypeInfo = () => {
    if (!form.coffeeTypeId) return null;
    return processingInfo.find(p => p.coffeeTypeId === form.coffeeTypeId);
  };

  const selectedCoffeeTypeInfo = getSelectedCoffeeTypeInfo();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo lô sơ chế mới</h2>
        <p className="text-gray-600">Tạo lô sơ chế cho cà phê từ vụ mùa đã hoàn thành (chỉ những loại có yêu cầu sơ chế)</p>
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
          disabled={!form.cropSeasonId || loading}
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
        {loading && (
          <p className="text-sm text-blue-500 mt-1">Đang tải danh sách loại cà phê...</p>
        )}
      </div>

      {/* Hiển thị thông tin phương pháp sơ chế từ plan */}
      {selectedCoffeeTypeInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Thông tin từ kế hoạch:</h4>
          <div className="text-sm text-blue-800">
            <p>✅ <strong>Phương pháp sơ chế:</strong> {selectedCoffeeTypeInfo.planProcessingMethodName} ({selectedCoffeeTypeInfo.planProcessingMethodCode})</p>
            <p className="text-xs text-blue-600 mt-1">Phương pháp này sẽ được áp dụng tự động khi tạo lô sơ chế</p>
          </div>
        </div>
      )}

      {/* Không hiển thị dropdown chọn phương pháp vì đã có từ plan */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Lưu ý:</strong> Chỉ những loại cà phê có yêu cầu sơ chế từ kế hoạch mới được hiển thị ở đây.
        </p>
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
