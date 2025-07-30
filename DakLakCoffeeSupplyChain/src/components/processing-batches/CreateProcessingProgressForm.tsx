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
  defaultBatchId?: string; // nếu muốn preselect lô (ví dụ khi dùng trong View)
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
    photoFile: null as File | null,
    videoFile: null as File | null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const file = e.target.files?.[0] || null;
      setForm((prev) => ({ ...prev, [name]: file }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "outputQuantity" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let compressedPhoto: File | undefined;
      if (form.photoFile) {
        compressedPhoto = await imageCompression(form.photoFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        });
      }

      await createProcessingBatchProgressWithMedia(form.batchId, {
        progressDate: form.progressDate,
        outputQuantity: form.outputQuantity,
        outputUnit: form.outputUnit,
        photoFile: compressedPhoto || undefined,
        videoFile: form.videoFile || undefined,
      });

      setSuccess("Tạo tiến trình thành công!");
      onSuccess?.();
      setTimeout(() => router.push("/dashboard/farmer/processing/progresses"), 1200);
    } catch (err: any) {
      console.error("❌ Submit error:", err);
      if (err.message === "Network Error" || err.message.includes("Không nhận được phản hồi")) {
        setError("Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau.");
      } else {
        setError(err.message || "Tạo tiến trình thất bại!");
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
        <label className="block font-medium mb-1">Ảnh (upload)</label>
        <Input type="file" name="photoFile" accept="image/*" onChange={handleChange} />
      </div>

      <div>
        <label className="block font-medium mb-1">Video (upload)</label>
        <Input type="file" name="videoFile" accept="video/*" onChange={handleChange} />
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
