"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppToast } from "@/components/ui/AppToast";
import {
  createProcessingBatch,
  getAvailableCoffeeTypes,
  CoffeeType,
} from "@/lib/api/processingBatches";
import {
  getCropSeasonsForCurrentUser,
  CropSeasonListItem,
} from "@/lib/api/cropSeasons";
import {
  getAllProcessingMethods,
  ProcessingMethod,
} from "@/lib/api/processingMethods";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function CreateProcessingBatchPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    coffeeTypeId: "",
    cropSeasonId: "",
    batchCode: "",
    methodId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCoffeeTypes, setLoadingCoffeeTypes] = useState(false);

  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [methods, setMethods] = useState<ProcessingMethod[]>([]);

  useEffect(() => {
    async function fetchInitial() {
      try {
        const [cropSeasons, methods] = await Promise.all([
          getCropSeasonsForCurrentUser({ page: 1, pageSize: 100 }),
          getAllProcessingMethods(),
        ]);
        setCropSeasons(cropSeasons);
        setMethods(methods);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInitial();
  }, []);

  useEffect(() => {
    async function fetchCoffeeTypes() {
      if (!form.cropSeasonId) return;
      setLoadingCoffeeTypes(true);
      try {
        const types = await getAvailableCoffeeTypes(form.cropSeasonId);
        setCoffeeTypes(types);
      } catch (err) {
        console.error("❌ Lỗi load loại cà phê:", err);
        setCoffeeTypes([]);
      } finally {
        setLoadingCoffeeTypes(false);
      }
    }

    fetchCoffeeTypes();
  }, [form.cropSeasonId]);

  const handleChange = (name: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const { coffeeTypeId, cropSeasonId, batchCode, methodId } = form;

    const missingFields: string[] = [];
    if (!coffeeTypeId) missingFields.push("Loại cà phê");
    if (!cropSeasonId) missingFields.push("Mùa vụ");
    if (!batchCode.trim()) missingFields.push("Mã lô");
    if (Number(methodId) <= 0) missingFields.push("Phương pháp sơ chế");

    if (missingFields.length > 0) {
      AppToast.error("Vui lòng nhập: " + missingFields.join(", "));
      setIsSubmitting(false);
      return;
    }

    try {
      await createProcessingBatch({
        coffeeTypeId,
        cropSeasonId,
        batchCode: batchCode.trim(),
        methodId: Number(methodId)
      });

      AppToast.success("Tạo lô sơ chế thành công!");
      router.push("/dashboard/farmer/processing/batches");
    } catch (err: any) {
      console.error("❌ Lỗi tạo batch:", err);
      const errorMessage =
        err?.response?.data?.message || "Tạo lô sơ chế thất bại!";
      AppToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Tạo lô sơ chế mới</h1>
      <div className="space-y-4 bg-white rounded-xl shadow p-6">
        {/* Mùa vụ */}
        <div>
          <label className="block mb-1 font-medium">Mùa vụ *</label>
          <Select
            value={form.cropSeasonId}
            onValueChange={(v) => handleChange("cropSeasonId", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn mùa vụ" />
            </SelectTrigger>
            <SelectContent>
              {cropSeasons.map((cs) => (
                <SelectItem key={cs.cropSeasonId} value={cs.cropSeasonId}>
                  {cs.seasonName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loại cà phê */}
        <div>
          <label className="block mb-1 font-medium">Loại cà phê *</label>
          <Select
            value={form.coffeeTypeId}
            onValueChange={(v) => handleChange("coffeeTypeId", v)}
            disabled={!form.cropSeasonId || loadingCoffeeTypes}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn loại cà phê" />
            </SelectTrigger>
            <SelectContent>
              {coffeeTypes.map((ct) => (
                <SelectItem key={ct.coffeeTypeId} value={ct.coffeeTypeId}>
                  {ct.typeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.cropSeasonId && coffeeTypes.length === 0 && (
            <p className="text-sm text-yellow-600 mt-2">
              Không có loại cà phê nào khả dụng trong mùa vụ này.
            </p>
          )}
        </div>

        {/* Mã lô */}
        <div>
          <label className="block mb-1 font-medium">Mã lô *</label>
          <Input
            value={form.batchCode}
            onChange={(e) => handleChange("batchCode", e.target.value)}
          />
        </div>

        {/* Phương pháp */}
        <div>
          <label className="block mb-1 font-medium">Phương pháp sơ chế *</label>
          <Select
            value={form.methodId}
            onValueChange={(v) => handleChange("methodId", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn phương pháp" />
            </SelectTrigger>
            <SelectContent>
              {methods.map((m) => (
                <SelectItem key={m.methodId.toString()} value={m.methodId.toString()}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo..." : "Tạo lô sơ chế"}
          </Button>
        </div>
      </div>
    </div>
  );
}
