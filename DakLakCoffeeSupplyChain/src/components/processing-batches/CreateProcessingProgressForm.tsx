"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { createProcessingBatchProgressWithMedia } from "@/lib/api/processingBatchProgress";
import { getProcessingStagesByMethodId, ProcessingStage } from "@/lib/api/processingStages";
import imageCompression from "browser-image-compression";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import MediaUploadSection from "./MediaUploadSection";
import { AlertCircle, Plus, X, Calendar, Scale, Settings, Package, PlayCircle } from "lucide-react";

type Props = {
  defaultBatchId?: string; 
  defaultBatchData?: ProcessingBatch; // Thêm prop để truyền thông tin batch
  onSuccess?: () => void;
};

export default function CreateProcessingProgressForm({ 
  defaultBatchId = "", 
  defaultBatchData,
  onSuccess 
}: Props) {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [stages, setStages] = useState<ProcessingStage[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ProcessingBatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [form, setForm] = useState({
    batchId: defaultBatchId,
    progressDate: new Date().toISOString().split("T")[0], // Mặc định hôm nay
    outputQuantity: 0,
    outputUnit: "kg",
    photoFiles: [] as File[],
    videoFiles: [] as File[],
    parameters: [{ name: "", value: "", unit: "" }] as Array<{ name: string; value: string; unit: string }>,
    recordedAt: new Date().toISOString(),
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        console.log("🔍 DEBUG: Fetching batches for create progress form...");
        const res = await getAllProcessingBatches();
        console.log("🔍 DEBUG: All batches:", res);
        
        const filtered = (res || []).filter((b) => 
          b.status === ProcessingStatus.NotStarted || 
          b.status === ProcessingStatus.InProgress || 
          b.status === ProcessingStatus.AwaitingEvaluation
        );
        
        console.log("🔍 DEBUG: Filtered batches:", filtered);
        console.log("🔍 DEBUG: Available statuses:", filtered.map(b => ({ batchCode: b.batchCode, status: b.status })));
        
        setBatches(filtered);

        // Nếu có defaultBatchId, tự động select và load stage
        if (defaultBatchId) {
          console.log("🔍 DEBUG: Auto-selecting batch:", defaultBatchId);
          const targetBatch = filtered.find((b: ProcessingBatch) => b.batchId === defaultBatchId);
          if (targetBatch) {
            console.log("🔍 DEBUG: Found target batch:", targetBatch);
            setSelectedBatch(targetBatch);
            setForm(prev => ({ ...prev, batchId: defaultBatchId }));
            fetchStagesForBatch(targetBatch.methodId);
          } else {
            console.log("🔍 DEBUG: Target batch not found in filtered batches, using defaultBatchData");
            // Sử dụng defaultBatchData nếu có, hoặc tạo từ context
            if (defaultBatchData) {
              console.log("🔍 DEBUG: Using defaultBatchData:", defaultBatchData);
              setSelectedBatch(defaultBatchData);
              setForm(prev => ({ ...prev, batchId: defaultBatchId }));
              fetchStagesForBatch(defaultBatchData.methodId);
            } else {
              console.log("🔍 DEBUG: No defaultBatchData, creating from context");
              const contextBatch = {
                batchId: defaultBatchId,
                batchCode: `BATCH-${defaultBatchId}`,
                status: ProcessingStatus.NotStarted,
                methodId: 1, // Default method ID
                methodName: "Sơ chế Khô" // Default method name
              } as ProcessingBatch;
              setSelectedBatch(contextBatch);
              setForm(prev => ({ ...prev, batchId: defaultBatchId }));
              fetchStagesForBatch(contextBatch.methodId);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error fetching batches:", error);
        setError("Không thể tải danh sách lô chế biến");
      }
    };
    fetchBatches();
  }, [defaultBatchId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "outputQuantity" ? Number(value) : value,
    }));

    // Nếu chọn batch, lấy thông tin stage
    if (name === "batchId") {
      if (value) {
        const selectedBatch = batches.find(b => b.batchId === value);
        if (selectedBatch) {
          setSelectedBatch(selectedBatch);
          fetchStagesForBatch(selectedBatch.methodId);
        }
      } else {
        // Nếu không chọn lô nào, reset
        setSelectedBatch(null);
        setStages([]);
      }
    }
  };

  const fetchStagesForBatch = async (methodId: number) => {
    try {
      setLoadingStages(true);
      console.log("🔍 DEBUG: Fetching stages for methodId:", methodId);
      const stagesData = await getProcessingStagesByMethodId(methodId);
      console.log("🔍 DEBUG: Stages data:", stagesData);
      setStages(stagesData || []);
    } catch (error) {
      console.error("❌ Error fetching stages:", error);
      setError("Không thể tải thông tin bước chế biến");
      setStages([]);
    } finally {
      setLoadingStages(false);
    }
  };

  const handleParameterChange = (index: number, field: 'name' | 'value' | 'unit', value: string) => {
    const newParameters = [...form.parameters];
    newParameters[index][field] = value;
    setForm(prev => ({ ...prev, parameters: newParameters }));
  };

  const addParameter = () => {
    setForm(prev => ({
      ...prev,
      parameters: [...prev.parameters, { name: "", value: "", unit: "" }]
    }));
  };

  const removeParameter = (index: number) => {
    if (form.parameters.length > 1) {
      const newParameters = form.parameters.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, parameters: newParameters }));
    }
  };

  const handlePhotoFilesChange = (files: File[]) => {
    setForm(prev => ({ ...prev, photoFiles: files }));
  };

  const handleVideoFilesChange = (files: File[]) => {
    setForm(prev => ({ ...prev, videoFiles: files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("DEBUG: Form submitted");
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!form.batchId) {
      setError("Vui lòng chọn lô chế biến");
      setLoading(false);
      return;
    }

    if (!form.progressDate) {
      setError("Vui lòng chọn ngày thực hiện");
      setLoading(false);
      return;
    }

    // Validate date không được trong tương lai
    const selectedDate = new Date(form.progressDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    if (selectedDate > today) {
      setError("Ngày thực hiện không được trong tương lai");
      setLoading(false);
      return;
    }

    if (form.outputQuantity <= 0) {
      setError("Khối lượng đầu ra phải lớn hơn 0");
      setLoading(false);
      return;
    }

    // Validate khối lượng không được quá lớn (ví dụ: 100,000 kg)
    if (form.outputQuantity > 100000) {
      setError("Khối lượng đầu ra không được vượt quá 100,000");
      setLoading(false);
      return;
    }

    if (!form.outputUnit.trim()) {
      setError("Vui lòng nhập đơn vị");
      setLoading(false);
      return;
    }

    // File validation
    if (form.photoFiles.some(file => file.size > 10 * 1024 * 1024)) { // 10MB
      setError("Ảnh không được lớn hơn 10MB");
      setLoading(false);
      return;
    }

    if (form.videoFiles.some(file => file.size > 100 * 1024 * 1024)) { // 100MB
      setError("Video không được lớn hơn 100MB");
      setLoading(false);
      return;
    }

    // Tính tổng kích thước
    const totalPhotoSize = form.photoFiles.reduce((sum, file) => sum + file.size, 0);
    const totalVideoSize = form.videoFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSize = totalPhotoSize + totalVideoSize;
    const totalSizeMB = totalSize / 1024 / 1024;

    console.log("📊 File size analysis:");
    console.log("  Photos:", form.photoFiles.length, "files,", (totalPhotoSize / 1024 / 1024).toFixed(2), "MB");
    console.log("  Videos:", form.videoFiles.length, "files,", (totalVideoSize / 1024 / 1024).toFixed(2), "MB");
    console.log("  Total:", totalSizeMB.toFixed(2), "MB");

    // Giới hạn tổng kích thước (50MB)
    if (totalSizeMB > 50) {
      setError(`Tổng kích thước files (${totalSizeMB.toFixed(2)}MB) vượt quá giới hạn 50MB`);
      setLoading(false);
      return;
    }

    // Giới hạn số lượng files (10 files)
    const totalFiles = form.photoFiles.length + form.videoFiles.length;
    if (totalFiles > 10) {
      setError(`Số lượng files (${totalFiles}) vượt quá giới hạn 10 files`);
      setLoading(false);
      return;
    }

    try {
      let compressedPhotos: File[] = [];
      if (form.photoFiles.length > 0) {
        console.log("📷 Compressing", form.photoFiles.length, "photos...");
        for (const photo of form.photoFiles) {
          console.log("📷 Kích thước ảnh gốc:", photo.size / 1024 / 1024, "MB");
          const compressedPhoto = await imageCompression(photo, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1000,
            useWebWorker: true,
          });
          console.log("📷 Kích thước ảnh sau nén:", compressedPhoto.size / 1024 / 1024, "MB");
          
          // Tạo file mới với tên gốc
          const compressedFile = new File([compressedPhoto], photo.name, {
            type: compressedPhoto.type,
            lastModified: Date.now(),
          });
          compressedPhotos.push(compressedFile);
        }
      }

      // Lấy thông số kỹ thuật đầu tiên (nếu có)
      const firstParameter = form.parameters[0];
      const parameterName = firstParameter.name.trim();
      const parameterValue = firstParameter.value.trim();
      const unit = firstParameter.unit.trim();

      console.log("🚀 Submitting with data:", {
        batchId: form.batchId,
        progressDate: form.progressDate,
        outputQuantity: form.outputQuantity,
        outputUnit: form.outputUnit,
        photoCount: compressedPhotos.length,
        hasVideo: !!form.videoFiles.length,
        parameterName,
        parameterValue,
        unit
      });

      // Tạo array tất cả files để gửi
      const allFiles = [...compressedPhotos];
      if (form.videoFiles.length > 0) {
        allFiles.push(...form.videoFiles);
      }

      await createProcessingBatchProgressWithMedia(form.batchId, {
        stageId: undefined, // Để Backend tự động xác định stage đầu tiên
        progressDate: form.progressDate,
        outputQuantity: form.outputQuantity,
        outputUnit: form.outputUnit,
        photoFiles: compressedPhotos,
        videoFiles: form.videoFiles,
        parameterName: parameterName || undefined,
        parameterValue: parameterValue || undefined,
        unit: unit || undefined,
        recordedAt: form.recordedAt || undefined,
      });

      setSuccess("Tạo tiến trình thành công!");
      onSuccess?.();
      setTimeout(() => router.push("/dashboard/farmer/processing/progresses"), 1200);
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      console.error("❌ Error type:", typeof err);
      console.error("❌ Error message:", err?.message);
      console.error("❌ Error response:", err?.response);
      console.error("❌ Error stack:", err?.stack);
      
      if (err.message === "Network Error" || (err.message && err.message.includes("Không nhận được phản hồi"))) {
        setError("Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.");
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || "Tạo tiến trình thất bại!";
        setError(errorMessage);
      }
    }
    setLoading(false);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo tiến trình đầu tiên</h2>
        <p className="text-sm text-gray-600">Bắt đầu quy trình chế biến cà phê</p>
      </div>

             <form onSubmit={handleSubmit} className="space-y-6">
         {/* Batch Selection - Chỉ hiển thị khi không có defaultBatchId */}
         {!defaultBatchId && (
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-blue-100 rounded-lg">
                 <Package className="w-5 h-5 text-blue-600" />
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-gray-900">Chọn lô chế biến</h3>
                 <p className="text-sm text-gray-600">Lựa chọn lô cà phê để bắt đầu chế biến</p>
               </div>
             </div>

             {batches.length === 0 ? (
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                 <div className="flex items-start gap-3">
                   <div className="flex-shrink-0">
                     <AlertCircle className="w-5 h-5 text-yellow-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-yellow-800">Không có lô chế biến khả dụng</p>
                     <p className="text-xs text-yellow-700 mt-1">
                       Chỉ hiển thị lô có trạng thái: Chưa bắt đầu, Đang xử lý, hoặc Chờ đánh giá
                     </p>
                   </div>
                 </div>
               </div>
             ) : (
               <div>
                 <select
                   name="batchId"
                   value={form.batchId}
                   onChange={handleChange}
                   required
                   className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-blue-300 transition-all duration-200 shadow-sm"
                 >
                   <option value="">-- Chọn lô chế biến --</option>
                   {batches.map((b) => (
                     <option key={b.batchId} value={b.batchId}>
                       {b.batchCode} - {b.status}
                     </option>
                   ))}
                 </select>
               </div>
             )}
           </div>
         )}

        {/* Stage Information */}
        {selectedBatch && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thông tin bước chế biến</h3>
                <p className="text-sm text-gray-600">Bước đầu tiên trong quy trình</p>
              </div>
            </div>
            
            {loadingStages ? (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600">Đang tải thông tin bước chế biến...</span>
                </div>
              </div>
            ) : stages.length > 0 ? (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-lg">
                      Bước {stages[0]?.orderIndex || 1}: {stages[0]?.stageName || "Bước đầu tiên"}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      của phương pháp <span className="font-medium text-gray-800">{selectedBatch.methodName || "Chế biến"}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Bước {stages[0]?.orderIndex || 1}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-center py-4">
                  <p className="text-gray-600">Không tìm thấy thông tin bước chế biến</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date and Quantity */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thông tin tiến trình</h3>
              <p className="text-sm text-gray-600">Ngày thực hiện và khối lượng đầu ra</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                Ngày thực hiện
              </label>
              <Input
                type="date"
                name="progressDate"
                value={form.progressDate}
                onChange={handleChange}
                required
                className="border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 transition-all duration-200 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-orange-600" />
                Khối lượng đầu ra
              </label>
              <div className="relative">
                <Input
                  type="number"
                  name="outputQuantity"
                  value={form.outputQuantity}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  required
                  className="border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12 hover:border-purple-300 transition-all duration-200 shadow-sm"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-sm font-medium">{form.outputUnit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Parameters Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Settings className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thông số kỹ thuật</h3>
                <p className="text-sm text-gray-600">Các thông số đo lường trong quá trình chế biến</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addParameter}
              className="flex items-center gap-1 text-xs bg-white hover:bg-amber-50 border-amber-300 text-amber-700"
            >
              <Plus className="w-3 h-3" />
              Thêm thông số
            </Button>
          </div>
          
          <div className="space-y-4">
            {form.parameters.map((param, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tên thông số</label>
                    <Input
                      type="text"
                      value={param.name}
                      onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                      placeholder="VD: Nhiệt độ, Độ ẩm..."
                      className="text-sm border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Giá trị</label>
                    <Input
                      type="text"
                      value={param.value}
                      onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                      placeholder="VD: 25, 80%..."
                      className="text-sm border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Đơn vị</label>
                      <Input
                        type="text"
                        value={param.unit}
                        onChange={(e) => handleParameterChange(index, 'unit', e.target.value)}
                        placeholder="VD: °C, %, kg..."
                        className="text-sm border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300 transition-all duration-200"
                      />
                    </div>
                    {form.parameters.length > 1 && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeParameter(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Upload Section */}
        <MediaUploadSection
          photoFiles={form.photoFiles}
          videoFiles={form.videoFiles}
          onPhotoFilesChange={handlePhotoFilesChange}
          onVideoFilesChange={handleVideoFilesChange}
        />

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              console.log("DEBUG: Cancel button clicked");
              onSuccess?.();
            }}
            className="px-8 py-3 hover:bg-gray-50 border-gray-300 text-gray-700 font-medium transition-all duration-200"
          >
            Huỷ
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? "Đang lưu..." : "Tạo tiến trình"}
          </Button>
        </div>
      </form>
    </div>
  );
}
