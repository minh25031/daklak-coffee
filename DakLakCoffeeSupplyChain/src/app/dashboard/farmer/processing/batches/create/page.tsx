"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppToast } from "@/components/ui/AppToast";
import { createProcessingBatch } from "@/lib/api/processingBatches";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
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
    inputQuantity: 0,
    inputUnit: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [methods, setMethods] = useState<ProcessingMethod[]>([]);

  // ✅ Lấy userId từ access_token và set farmerId một lần duy nhất
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload?.userId || payload?.UserId || payload?.sub;

        console.log("✅ User ID lấy từ token:", userId);

        if (userId) {
          setForm((prev) => ({ ...prev, farmerId: userId }));
        }
      } catch (err) {
        console.error("❌ Lỗi giải mã token:", err);
      }
    }
  }, []);

  // ✅ Load các dropdown cần thiết
  useEffect(() => {
    async function fetchData() {
      try {
        const [coffeeTypes, cropSeasons, methods] = await Promise.all([
          getCoffeeTypes(),
          getCropSeasonsForCurrentUser({ page: 1, pageSize: 100 }),
          getAllProcessingMethods(),
        ]);
        setCoffeeTypes(coffeeTypes);
        setCropSeasons(cropSeasons);
        setMethods(methods);
      } catch (err) {
        console.error("❌ Lỗi fetchData:", err);
        setError("Lỗi tải dữ liệu. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (name: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log("🚀 Dữ liệu form gửi lên:", form);

    const {
      coffeeTypeId,
      cropSeasonId,
      batchCode,
      methodId,
      inputQuantity,
      inputUnit,
    } = form;

    if (
      !coffeeTypeId ||
      !cropSeasonId ||
      !batchCode.trim() ||
      Number(methodId) <= 0 ||
      Number(inputQuantity) <= 0 ||
      !inputUnit.trim()
    ) {
      AppToast.error("Vui lòng điền đầy đủ thông tin!");
      setIsSubmitting(false);
      return;
    }

    try {
      await createProcessingBatch({
        coffeeTypeId,
        cropSeasonId,
        batchCode: batchCode.trim(),
        methodId: Number(methodId),
        inputQuantity: Number(inputQuantity),
        inputUnit: inputUnit.trim(),
      });
      AppToast.success("Tạo lô sơ chế thành công!");
      router.push("/dashboard/farmer/processing/batches");
    } catch (err) {
      console.error("❌ Lỗi tạo batch:", err);
      AppToast.error("Tạo lô sơ chế thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Tạo lô sơ chế mới</h1>
      <div className="space-y-4 bg-white rounded-xl shadow p-6">
        <div>
          <label className="block mb-1 font-medium">Loại cà phê *</label>
          <Select
            value={form.coffeeTypeId}
            onValueChange={(v) => handleChange("coffeeTypeId", v)}
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
        </div>
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
        <div>
          <label className="block mb-1 font-medium">Mã lô *</label>
          <Input
            name="batchCode"
            value={form.batchCode}
            onChange={(e) => handleChange("batchCode", e.target.value)}
            required
          />
        </div>
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
                <SelectItem
                  key={m.methodId.toString()}
                  value={m.methodId.toString()}
                >
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Số lượng đầu vào *</label>
          <Input
            name="inputQuantity"
            type="number"
            value={form.inputQuantity}
            onChange={(e) => handleChange("inputQuantity", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Đơn vị đầu vào *</label>
          <Input
            name="inputUnit"
            value={form.inputUnit}
            onChange={(e) => handleChange("inputUnit", e.target.value)}
            required
          />
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
