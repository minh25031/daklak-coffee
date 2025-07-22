'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createInventory } from "@/lib/api/inventory";
import { getAllWarehouses } from "@/lib/api/warehouses";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function CreateInventoryPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchWarehouses() {
      const res = await getAllWarehouses();
      if (res && res.status === 1 && Array.isArray(res.data)) {
        setWarehouses(res.data);
      } else {
        console.error("❌ Failed to fetch warehouses:", res?.message || res);
      }
    }

    fetchWarehouses();
  }, []);

  const onSubmit = async (data: any) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await createInventory(data);

      if (res && (res.status === 1 || res.status === 200 || res.status === 201)) {
        setSuccessMessage("✅ Inventory created successfully");
        setTimeout(() => {
          router.push("/dashboard/manager/inventories");
        }, 1500);
      } else {
        const fallbackMessage = typeof res?.message === "string"
          ? res.message
          : "Đã có lỗi xảy ra khi tạo tồn kho.";
        setErrorMessage(`❌ Failed: ${fallbackMessage}`);
      }

    } catch (err: any) {
      console.error("❌ System Error:", err);
      const fallback =
        typeof err === "string"
          ? err
          : typeof err?.message === "string"
          ? err.message
          : "Lỗi không xác định từ hệ thống.";
      setErrorMessage(`❌ System Error: ${fallback}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Inventory</CardTitle>
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
            {/* Warehouse dropdown */}
            <div>
              <Label>Warehouse</Label>
              <select
                {...register("warehouseId", { required: true })}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Select warehouse --</option>
                {warehouses.map((w) => (
                  <option key={w.warehouseId} value={w.warehouseId}>
                    {w.name} - {w.location} ({w.capacity?.toLocaleString()} kg)
                  </option>
                ))}
              </select>
              {errors.warehouseId && (
                <p className="text-red-500 text-sm mt-1">Warehouse is required.</p>
              )}
            </div>

            {/* Batch input (manual) */}
            <div>
              <Label>Batch ID</Label>
              <Input
                {...register("batchId", { required: true })}
                placeholder="Enter batchId manually..."
              />
              {errors.batchId && (
                <p className="text-red-500 text-sm mt-1">Batch ID is required.</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <Label>Quantity</Label>
              <Input
                {...register("quantity", { required: true, min: 1 })}
                type="number"
                placeholder="Enter quantity..."
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">Quantity must be &gt; 0.</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <Label>Unit</Label>
              <Input
                {...register("unit", { required: true })}
                placeholder="e.g., kg, tons..."
              />
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">Unit is required.</p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">Create Inventory</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
