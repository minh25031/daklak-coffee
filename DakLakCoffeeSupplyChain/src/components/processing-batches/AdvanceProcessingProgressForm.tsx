// AdvanceProcessingProgressForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import imageCompression from "browser-image-compression";
import { advanceToNextProcessingProgress } from "@/lib/api/processingBatchProgress";
import { getProcessingBatchById } from "@/lib/api/processingBatches";
import { getProcessingStagesByMethodId, ProcessingStage } from "@/lib/api/processingStages";

import { ProcessingBatchProgress } from "@/lib/api/processingBatchProgress";
import { ProcessingStatus } from "@/lib/constants/batchStatus";

interface Props {
  batchId: string;
  latestProgress: ProcessingBatchProgress;
  batchStatus?: string; // Thêm batch status
  onSuccess?: () => void;
}

export default function AdvanceProcessingProgressForm({
  batchId,
  latestProgress,
  batchStatus,
  onSuccess,
}: Props) {
  const [progressDate, setProgressDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [outputQuantity, setOutputQuantity] = useState<number>(0);
  const [outputUnit, setOutputUnit] = useState("kg");
  const [stageDescription, setStageDescription] = useState(""); // Thêm state cho description
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [parameterName, setParameterName] = useState("");
  const [parameterValue, setParameterValue] = useState("");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State cho stage selection
  const [availableStages, setAvailableStages] = useState<ProcessingStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const [loadingStages, setLoadingStages] = useState(false);

  // Tính toán button text dựa trên batch status
  const getButtonText = () => {
    if (loading) return "Đang lưu...";
    
    if (batchStatus === ProcessingStatus.InProgress) {
      return "Cập nhật lại bước không đạt";
    }
    
    return "Xác nhận cập nhật";
  };

  // Load available stages khi component mount
  useEffect(() => {
    const loadStages = async () => {
      try {
        setLoadingStages(true);
        const batch = await getProcessingBatchById(batchId);
                 if (batch && batch.methodId) {
           let availableStages: ProcessingStage[] = [];
           
           try {
             // Thử lấy stages thực tế từ API
             const stages = await getProcessingStagesByMethodId(batch.methodId);
             availableStages = stages
               .filter(stage => !stage.isDeleted)
               .sort((a, b) => a.orderIndex - b.orderIndex);
           } catch (err) {
             console.log("API chưa có, sử dụng mock data");
             // Fallback: Sử dụng mock data khi API chưa có
             availableStages = [
               { stageId: "stage_1", stageName: "Thu hoạch", orderIndex: 1, methodId: batch.methodId, isRequired: true, isDeleted: false },
               { stageId: "stage_2", stageName: "Làm sạch", orderIndex: 2, methodId: batch.methodId, isRequired: true, isDeleted: false },
               { stageId: "stage_3", stageName: "Phân loại", orderIndex: 3, methodId: batch.methodId, isRequired: true, isDeleted: false },
               { stageId: "stage_4", stageName: "Phơi", orderIndex: 4, methodId: batch.methodId, isRequired: true, isDeleted: false },
               { stageId: "stage_5", stageName: "Rang", orderIndex: 5, methodId: batch.methodId, isRequired: true, isDeleted: false },
               { stageId: "stage_6", stageName: "Đóng gói", orderIndex: 6, methodId: batch.methodId, isRequired: true, isDeleted: false }
             ];
           }
           
           setAvailableStages(availableStages);
           
           // Tự động chọn stage tiếp theo
           const currentStageIndex = availableStages.findIndex(s => s.stageId === latestProgress.stageId);
           if (currentStageIndex >= 0 && currentStageIndex < availableStages.length - 1) {
             setSelectedStageId(availableStages[currentStageIndex + 1].stageId);
           } else {
             setSelectedStageId(availableStages[currentStageIndex]?.stageId || "");
           }
        }
      } catch (err) {
        console.error("Error loading stages:", err);
      } finally {
        setLoadingStages(false);
      }
    };

    loadStages();
  }, [batchId, latestProgress.stageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedStageId) {
      setError("Vui lòng chọn công đoạn thực hiện");
      setLoading(false);
      return;
    }
    if (!progressDate) {
      setError("Vui lòng chọn ngày thực hiện");
      setLoading(false);
      return;
    }
    if (outputQuantity <= 0) {
      setError("Khối lượng đầu ra phải lớn hơn 0");
      setLoading(false);
      return;
    }
    if (!outputUnit.trim()) {
      setError("Vui lòng nhập đơn vị");
      setLoading(false);
      return;
    }

    try {
      let compressedPhotos: File[] = [];
      if (photoFiles.length > 0) {
        for (const photo of photoFiles) {
          const compressed = await imageCompression(photo, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1000,
            useWebWorker: true,
          });
          compressedPhotos.push(
            new File([compressed], photo.name, {
              type: compressed.type,
              lastModified: Date.now(),
            })
          );
        }
      }

      await advanceToNextProcessingProgress(batchId, {
        stageId: selectedStageId, // Stage được chọn từ dropdown
        currentStageId: latestProgress.stageId, // Stage hiện tại để backend validate
        progressDate,
        outputQuantity,
        outputUnit,
        stageDescription: stageDescription || undefined, // Thêm description
        photoFiles: compressedPhotos.length ? compressedPhotos : undefined,
        videoFiles: videoFiles.length ? videoFiles : undefined,
        parameterName: parameterName || undefined,
        parameterValue: parameterValue || undefined,
        unit: unit || undefined,
        recordedAt: new Date().toISOString(),
      });

      onSuccess?.();
         } catch (err: any) {
       // Xử lý lỗi chi tiết hơn
       let errorMessage = "Không thể cập nhật tiến trình.";
       
       if (err?.response?.data?.message) {
         errorMessage = err.response.data.message;
       } else if (err?.response?.data?.error) {
         errorMessage = err.response.data.error;
       } else if (err?.message === "Network Error") {
         errorMessage = "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối.";
       } else if (err?.message) {
         errorMessage = err.message;
       }

       // Thêm thông tin về stage hiện tại và stage được chọn
       const selectedStage = availableStages.find(s => s.stageId === selectedStageId);
       const currentStage = availableStages.find(s => s.stageId === latestProgress.stageId);
       
       if (selectedStage && currentStage) {
         errorMessage += `\n\nThông tin chi tiết:`;
         errorMessage += `\n• Stage hiện tại: ${currentStage.stageName} (ID: ${currentStage.stageId})`;
         errorMessage += `\n• Stage được chọn: ${selectedStage.stageName} (ID: ${selectedStage.stageId})`;
         errorMessage += `\n• Thứ tự hiện tại: Bước ${currentStage.orderIndex}`;
         errorMessage += `\n• Thứ tự được chọn: Bước ${selectedStage.orderIndex}`;
       }
       
       setError(errorMessage);
     } finally {
      setLoading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideoFiles(videoFiles.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-7xl mx-auto overflow-hidden"
    >
      {/* Header - Orange gradient */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 p-4 flex items-center gap-4">
        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">
            Cập nhật tiến trình sơ chế
          </h2>
          <p className="text-orange-100 text-xs">
            Bước tiếp theo: {latestProgress.stageName}
          </p>
        </div>
      </div>

      {/* Content - Horizontal layout */}
      <div className="p-6">
        {/* Info row */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Thông tin bước hiện tại:</span>
            <span><strong>{latestProgress.stageName}</strong> (Bước {latestProgress.stepIndex})</span>
            <span className="ml-4">Ngày trước: {new Date(latestProgress.progressDate).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>

        {/* Main form - 3 columns horizontal layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          {/* Column 1 - Basic Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Thông tin cơ bản
            </h3>

            <div className="space-y-3">
              {/* Stage Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Công đoạn thực hiện
                </label>
                {loadingStages ? (
                  <div className="w-full h-10 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">
                    Đang tải danh sách công đoạn...
                  </div>
                ) : (
                  <select
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="w-full h-10 text-sm border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Chọn công đoạn...</option>
                    {availableStages.map((stage) => (
                      <option key={stage.stageId} value={stage.stageId}>
                        Bước {stage.orderIndex}: {stage.stageName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ngày thực hiện
                </label>
                <Input
                  type="date"
                  value={progressDate}
                  onChange={(e) => setProgressDate(e.target.value)}
                  required
                  className="w-full h-10 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Khối lượng đầu ra
                </label>
                <Input
                  type="number"
                  value={Number.isNaN(outputQuantity) ? 0 : outputQuantity}
                  min={0}
                  step="any"
                  onChange={(e) => setOutputQuantity(parseFloat(e.target.value))}
                  required
                  className="w-full h-10 text-sm"
                  placeholder="Nhập khối lượng..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Đơn vị
                </label>
                <Input
                  value={outputUnit}
                  onChange={(e) => setOutputUnit(e.target.value)}
                  required
                  className="w-full h-10 text-sm"
                  placeholder="kg, g, tấn..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Mô tả công đoạn
                </label>
                <Textarea
                  value={stageDescription}
                  onChange={(e) => setStageDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về công đoạn thực hiện, phương pháp, điều kiện môi trường..."
                  className="w-full min-h-[80px] text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Column 2 - Parameters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Thông số kỹ thuật
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tên thông số
                </label>
                <Input
                  type="text"
                  value={parameterName}
                  onChange={(e) => setParameterName(e.target.value)}
                  placeholder="VD: Nhiệt độ, Độ ẩm..."
                  className="w-full h-10 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Giá trị
                </label>
                <Input
                  type="text"
                  value={parameterValue}
                  onChange={(e) => setParameterValue(e.target.value)}
                  placeholder="VD: 25, 80%..."
                  className="w-full h-10 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Đơn vị thông số
                </label>
                <Input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="VD: °C, %, kg..."
                  className="w-full h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Column 3 - Media Upload */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-100 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Tài liệu minh họa
            </h3>

            <div className="space-y-3">
              {/* Photo upload */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ảnh minh hoạ
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-pink-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setPhotoFiles(files);
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="text-xs text-gray-600 cursor-pointer hover:text-pink-600 flex flex-col items-center gap-1"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {photoFiles.length > 0 ? `${photoFiles.length} ảnh` : 'Chọn ảnh'}
                  </label>
                </div>
              </div>

              {/* Video upload */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Video minh hoạ
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-teal-400 transition-colors bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setVideoFiles(files);
                    }}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="text-xs text-gray-600 cursor-pointer hover:text-teal-600 flex flex-col items-center gap-1"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {videoFiles.length > 0 ? `${videoFiles.length} video` : 'Chọn video'}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media previews - Horizontal layout */}
        {(photoFiles.length > 0 || videoFiles.length > 0) && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Xem trước tài liệu:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {photoFiles.map((file, index) => (
                <div key={`photo-${index}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              {videoFiles.map((file, index) => (
                <div key={`video-${index}`} className="relative group">
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit button and info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tối đa 10 files, 50MB</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ảnh tự động nén</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang lưu...
              </div>
            ) : (
              getButtonText()
            )}
          </Button>
        </div>

                 {error && (
           <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
             <div className="flex items-start gap-2">
               <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <div className="flex-1">
                 <div className="font-medium mb-2">Lỗi cập nhật tiến trình:</div>
                 <div className="whitespace-pre-line text-xs leading-relaxed">
                   {error}
                 </div>
               </div>
             </div>
           </div>
         )}
      </div>
    </form>
  );
}
