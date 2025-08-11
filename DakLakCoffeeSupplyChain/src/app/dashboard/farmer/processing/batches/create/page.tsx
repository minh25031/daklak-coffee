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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package, Coffee, Calendar, Info, Loader2, CheckCircle } from "lucide-react";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";

export default function CreateProcessingBatchPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    coffeeTypeId: "",
    cropSeasonId: "",
    batchCode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCoffeeTypes, setLoadingCoffeeTypes] = useState(false);

  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);

  useEffect(() => {
    async function fetchInitial() {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId = payload?.userId || payload?.UserId || payload?.sub;
          if (userId) {
            setForm((prev) => ({ ...prev, farmerId: userId }));
          }
        } catch (err) {
          console.error("❌ Lỗi giải mã token:", err);
        }
      }
    }
    fetchInitial();
  }, []);

  // ✅ Load các dropdown cần thiết
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const cropSeasonsData = await getCropSeasonsForCurrentUser({ page: 1, pageSize: 100 });
        
        console.log('Crop Seasons:', cropSeasonsData);
        
        setCropSeasons(cropSeasonsData);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        AppToast.error("Không thể tải dữ liệu cần thiết");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchCoffeeTypes() {
      if (!form.cropSeasonId) return;
      setLoadingCoffeeTypes(true);
      try {
        const types = await getAvailableCoffeeTypes(form.cropSeasonId);
        console.log('Coffee Types for season:', form.cropSeasonId, types);
        setCoffeeTypes(types);
      } catch (err) {
        console.error("❌ Lỗi load loại cà phê:", err);
        setCoffeeTypes([]);
        AppToast.error("Không thể tải danh sách loại cà phê");
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

    const { coffeeTypeId, cropSeasonId, batchCode } = form;

    const missingFields: string[] = [];
    if (!coffeeTypeId) missingFields.push("Loại cà phê");
    if (!cropSeasonId) missingFields.push("Mùa vụ");
    if (!batchCode.trim()) missingFields.push("Mã lô");

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
        methodId: 1, // Mặc định method ID
        inputQuantity: 0, // Sẽ được cập nhật sau khi có thông tin từ crop season
        inputUnit: "kg" // Đơn vị mặc định
      });

      AppToast.success("Tạo lô sơ chế thành công!");
      router.push("/dashboard/farmer/processing/batches");
    } catch (err: any) {
      console.error("❌ Lỗi tạo batch:", err);
      
      // Xử lý các loại lỗi cụ thể
      let errorMessage = "Tạo lô sơ chế thất bại!";
      
      if (err?.response?.data?.message) {
        // Lấy message từ API response
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        // Lấy message từ Error object
        errorMessage = err.message;
      } else if (err?.response?.status === 400) {
        errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
      } else if (err?.response?.status === 404) {
        errorMessage = "Không tìm thấy thông tin cần thiết. Vui lòng thử lại.";
      } else if (err?.response?.status === 409) {
        errorMessage = "Lô sơ chế đã tồn tại hoặc thông tin bị trùng lặp.";
      } else if (err?.response?.status >= 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau.";
      }
      
      AppToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
              <div className="h-6 bg-white/20 rounded w-48 animate-pulse"></div>
            </div>
            <div className="p-6 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          <div className="text-center space-y-4 mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
            <p className="text-sm text-gray-500">Đang tải danh sách mùa vụ</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
          title="Tạo lô sơ chế mới"
          description="Thêm lô sơ chế mới vào hệ thống"
          showCreateButton={false}
        />
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-blue-900">Hướng dẫn tạo lô sơ chế</h3>
              <p className="text-sm text-blue-700">
                Vui lòng chọn mùa vụ trước, sau đó chọn loại cà phê tương ứng. 
                Nhập mã lô để tạo lô sơ chế mới.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Thông tin lô sơ chế
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Mùa vụ */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                Mùa vụ *
              </label>
              <Select
                value={form.cropSeasonId}
                onValueChange={(v) => handleChange("cropSeasonId", v)}
              >
                <SelectTrigger className="w-full h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
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
              {cropSeasons.length === 0 && (
                <p className="text-sm text-red-600">Không có mùa vụ nào khả dụng</p>
              )}
            </div>

            {/* Loại cà phê */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-orange-600" />
                Loại cà phê *
              </label>
              <Select
                value={form.coffeeTypeId}
                onValueChange={(v) => handleChange("coffeeTypeId", v)}
                disabled={!form.cropSeasonId || loadingCoffeeTypes}
              >
                <SelectTrigger className="w-full h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                  <SelectValue placeholder={loadingCoffeeTypes ? "Đang tải..." : "Chọn loại cà phê"} />
                </SelectTrigger>
                <SelectContent>
                  {coffeeTypes.map((ct) => (
                    <SelectItem key={ct.coffeeTypeId} value={ct.coffeeTypeId}>
                      {ct.typeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingCoffeeTypes && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải danh sách loại cà phê...
                </div>
              )}
              {form.cropSeasonId && !loadingCoffeeTypes && coffeeTypes.length === 0 && (
                <p className="text-sm text-yellow-600 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Không có loại cà phê nào khả dụng trong mùa vụ này.
                </p>
              )}
            </div>

            {/* Mã lô */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                Mã lô *
              </label>
              <Input
                value={form.batchCode}
                onChange={(e) => handleChange("batchCode", e.target.value)}
                placeholder="Nhập mã lô sơ chế"
                className="h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Tạo lô sơ chế
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
