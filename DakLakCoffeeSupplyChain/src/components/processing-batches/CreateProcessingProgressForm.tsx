"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { createProcessingBatchProgressWithMedia } from "@/lib/api/processingBatchProgress";
import imageCompression from "browser-image-compression";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import MediaUploadSection from "./MediaUploadSection";


type Props = {
  defaultBatchId?: string; 
  onSuccess?: () => void;
};

export default function CreateProcessingProgressForm({ defaultBatchId = "", onSuccess }: Props) {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    batchId: defaultBatchId,
    progressDate: new Date().toISOString().split("T")[0], // Mặc định hôm nay
    outputQuantity: 0,
    outputUnit: "kg",
    photoFiles: [] as File[],
    videoFiles: [] as File[],
    parameterName: "",
    parameterValue: "",
    unit: "",
    recordedAt: new Date().toISOString(),
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  useEffect(() => {
    const fetchBatches = async () => {
      const res = await getAllProcessingBatches();
      const filtered = (res || []).filter((b) => b.status === ProcessingStatus.NotStarted || b.status === ProcessingStatus.InProgress || b.status === ProcessingStatus.AwaitingEvaluation);
      setBatches(filtered);
    };
    fetchBatches();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "outputQuantity" ? Number(value) : value,
    }));
  };

  const handlePhotoFilesChange = (files: File[]) => {
    setForm(prev => ({ ...prev, photoFiles: files }));
  };

  const handleVideoFilesChange = (files: File[]) => {
    setForm(prev => ({ ...prev, videoFiles: files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      console.log("🚀 Submitting with data:", {
        batchId: form.batchId,
        progressDate: form.progressDate,
        outputQuantity: form.outputQuantity,
        outputUnit: form.outputUnit,
        photoCount: compressedPhotos.length,
        hasVideo: !!form.videoFiles.length
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
        videoFiles: form.videoFiles || undefined,
        parameterName: form.parameterName || undefined,
        parameterValue: form.parameterValue || undefined,
        unit: form.unit || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Chọn lô chế biến</label>
        {batches.length === 0 ? (
          <p className="text-sm italic text-gray-500">Không có lô chế biến khả dụng</p>
        ) : (
          <select
            name="batchId"
            value={form.batchId}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Chọn lô --</option>
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.batchCode}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Ngày thực hiện</label>
        <Input
          type="date"
          name="progressDate"
          value={form.progressDate}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Khối lượng đầu ra</label>
        <Input
          type="number"
          name="outputQuantity"
          value={form.outputQuantity}
          onChange={handleChange}
          min={0}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Đơn vị</label>
        <Input name="outputUnit" value={form.outputUnit} onChange={handleChange} required />
      </div>

      {/* Parameters Section */}
      <div>
        <label className="block font-medium mb-1">Thông số kỹ thuật (tùy chọn)</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tên thông số</label>
            <Input
              type="text"
              name="parameterName"
              value={form.parameterName}
              onChange={handleChange}
              placeholder="VD: Nhiệt độ, Độ ẩm..."
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Giá trị</label>
            <Input
              type="text"
              name="parameterValue"
              value={form.parameterValue}
              onChange={handleChange}
              placeholder="VD: 25, 80%..."
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Đơn vị</label>
            <Input
              type="text"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="VD: °C, %, kg..."
              className="text-sm"
            />
          </div>
        </div>
      </div>

      <MediaUploadSection
        photoFiles={form.photoFiles}
        videoFiles={form.videoFiles}
        onPhotoFilesChange={handlePhotoFilesChange}
        onVideoFilesChange={handleVideoFilesChange}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Huỷ
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  );
}
