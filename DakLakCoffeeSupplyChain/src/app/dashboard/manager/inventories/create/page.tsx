'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createInventory } from "@/lib/api/inventory";
import { getAllWarehouses } from "@/lib/api/warehouses";
import { getAllProcessingBatches } from "@/lib/api/processingBatches";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function CreateInventoryPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchInitialData() {
      const [warehouseRes, batchRes] = await Promise.all([
        getAllWarehouses(),
        getAllProcessingBatches()
      ]);

      if (warehouseRes?.status === 1) {
        setWarehouses(warehouseRes.data);
      } else {
        console.error("❌ Không thể tải kho:", warehouseRes?.message || warehouseRes);
      }

      if (Array.isArray(batchRes)) {
        setBatches(batchRes);
      } else {
        console.error("❌ Không thể tải mẻ hàng:", batchRes);
      }
    }

    fetchInitialData();
  }, []);

  const onSubmit = async (data: any) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await createInventory(data);

      if (res && (res.status === 1 || res.status === 200 || res.status === 201)) {
        setSuccessMessage("✅ Tạo tồn kho thành công");
        setTimeout(() => {
          router.push("/dashboard/manager/inventories");
        }, 1500);
      } else {
        const fallbackMessage = typeof res?.message === "string"
          ? res.message
          : "Đã có lỗi xảy ra khi tạo tồn kho.";
        setErrorMessage(`❌ Thất bại: ${fallbackMessage}`);
      }

    } catch (err: any) {
      console.error("❌ Lỗi hệ thống:", err);
      const fallback = typeof err?.message === "string" ? err.message : "Lỗi không xác định từ hệ thống.";
      setErrorMessage(`❌ Lỗi hệ thống: ${fallback}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-600 flex items-center gap-2">
      📦 Tạo tồn kho mới
    </CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Kho */}
            <div>
              <Label>Kho</Label>
              <select
                {...register("warehouseId", { required: true })}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Chọn kho --</option>
                {warehouses.map((w) => (
                  <option key={w.warehouseId} value={w.warehouseId}>
                    {w.name} - {w.location} ({w.capacity?.toLocaleString()} kg)
                  </option>
                ))}
              </select>
              {errors.warehouseId && (
                <p className="text-red-500 text-sm mt-1">Vui lòng chọn kho.</p>
              )}
            </div>

            {/* Mẻ hàng */}
            <div>
              <Label>Mẻ hàng</Label>
              <select
                {...register("batchId", { required: true })}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Chọn mẻ hàng --</option>
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchCode} - {b.methodName} ({b.totalOutputQuantity} kg)
                  </option>
                ))}
              </select>
              {errors.batchId && (
                <p className="text-red-500 text-sm mt-1">Vui lòng chọn mẻ hàng.</p>
              )}
            </div>

            {/* Số lượng */}
            <div>
              <Label>Số lượng</Label>
              <Input
                {...register("quantity", { required: true, min: 1 })}
                type="number"
                placeholder="Nhập số lượng..."
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">Số lượng phải lớn hơn 0.</p>
              )}
            </div>

            {/* Đơn vị */}
            <div>
              <Label>Đơn vị</Label>
              <Input
                {...register("unit", { required: true })}
                placeholder="VD: kg, tấn..."
              />
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">Vui lòng nhập đơn vị.</p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">Tạo tồn kho</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
