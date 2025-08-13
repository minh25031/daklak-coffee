// AdvanceProcessingProgressForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import imageCompression from "browser-image-compression";
import { advanceToNextProcessingProgress } from "@/lib/api/processingBatchProgress";

interface Props {
  batchId: string;
  latestProgress: {
    stageName: string;
    stepIndex: number;
    progressDate: string;
  };
  onSuccess?: () => void;
}

export default function AdvanceProcessingProgressForm({
  batchId,
  latestProgress,
  onSuccess,
}: Props) {
  const [progressDate, setProgressDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [outputQuantity, setOutputQuantity] = useState<number>(0);
  const [outputUnit, setOutputUnit] = useState("kg");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [parameterName, setParameterName] = useState("");
  const [parameterValue, setParameterValue] = useState("");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        progressDate,
        outputQuantity,
        outputUnit,
        photoFiles: compressedPhotos.length ? compressedPhotos : undefined,
        videoFiles: videoFiles.length ? videoFiles : undefined,
        parameterName: parameterName || undefined,
        parameterValue: parameterValue || undefined,
        unit: unit || undefined,
        recordedAt: new Date().toISOString(),
      });

      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (err?.message === "Network Error"
            ? "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối."
            : err?.message || "Không thể cập nhật tiến trình.")
      );
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
              "Xác nhận cập nhật"
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Lỗi:</span>
              {error}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
