"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";

import { createProcessingBatchProgressWithMedia } from "@/lib/api/processingBatchProgress";
import imageCompression from "browser-image-compression";
import { ProcessingStatus } from "@/lib/constants/batchStatus";


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
    progressDate: "",
    outputQuantity: 0,
    outputUnit: "kg",
    photoFiles: [] as File[],
    videoFiles: [] as File[],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      const res = await getAllProcessingBatches();
      const filtered = (res || []).filter((b) => b.status === ProcessingStatus.NotStarted || b.status === ProcessingStatus.InProgress);
      setBatches(filtered);
    };
    fetchBatches();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      if (name === "photoFiles" || name === "videoFiles") {
        const files = Array.from(e.target.files || []);
        setForm((prev) => ({ ...prev, [name]: files }));
      } else {
        const file = e.target.files?.[0] || null;
        setForm((prev) => ({ ...prev, [name]: file }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "outputQuantity" ? Number(value) : value,
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'photo' | 'video') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));

    if (type === 'photo' && imageFiles.length > 0) {
      setForm(prev => ({ ...prev, photoFiles: [...prev.photoFiles, ...imageFiles] }));
    }
    if (type === 'video' && videoFiles.length > 0) {
      setForm(prev => ({ ...prev, videoFiles: [...prev.videoFiles, ...videoFiles] }));
    }
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

    if (form.outputQuantity <= 0) {
      setError("Khối lượng đầu ra phải lớn hơn 0");
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
        progressDate: form.progressDate,
        outputQuantity: form.outputQuantity,
        outputUnit: form.outputUnit,
        photoFiles: compressedPhotos,
        videoFiles: form.videoFiles || undefined,
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

      <div>
        <label className="block font-medium mb-1">Ảnh (upload) - Kéo thả hoặc click chọn nhiều ảnh</label>
        <p className="text-sm text-gray-500 mb-2">Giới hạn: 10MB/file, tối đa 10 files, tổng 50MB</p>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'photo')}
        >
          <div className="space-y-2">
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2">Kéo thả ảnh vào đây hoặc</p>
            </div>
            <Input 
              type="file" 
              name="photoFiles" 
              accept="image/*" 
              onChange={handleChange} 
              multiple 
              className="hidden"
              id="photo-input"
            />
            <label htmlFor="photo-input" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Chọn ảnh
            </label>
          </div>
        </div>
        {form.photoFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Đã chọn {form.photoFiles.length} ảnh:</p>
            <ul className="list-disc list-inside">
              {form.photoFiles.map((file, index) => (
                <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Video (upload) - Kéo thả hoặc click chọn nhiều video</label>
        <p className="text-sm text-gray-500 mb-2">Giới hạn: 100MB/file, tối đa 10 files, tổng 50MB</p>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, 'video')}
        >
          <div className="space-y-2">
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2">Kéo thả video vào đây hoặc</p>
            </div>
            <Input 
              type="file" 
              name="videoFiles" 
              accept="video/*" 
              onChange={handleChange} 
              multiple 
              className="hidden"
              id="video-input"
            />
            <label htmlFor="video-input" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Chọn video
            </label>
          </div>
        </div>
        {form.videoFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Đã chọn {form.videoFiles.length} video:</p>
            <ul className="list-disc list-inside">
              {form.videoFiles.map((file, index) => (
                <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
