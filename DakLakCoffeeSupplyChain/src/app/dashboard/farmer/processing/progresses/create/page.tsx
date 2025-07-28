"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { ProcessingStatus } from "@/lib/constrant/batchStatus";
import { createProcessingBatchProgressWithMedia } from "@/lib/api/processingBatchProgress";

export default function CreateProcessingProgressPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    batchId: "",
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
      const filtered = (res || []).filter((b) => b.status === ProcessingStatus.NotStarted);
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
      await createProcessingBatchProgressWithMedia(form.batchId, {
        progressDate: form.progressDate,
        outputQuantity: form.outputQuantity,
        outputUnit: form.outputUnit,
        photoFile: form.photoFile || undefined,
        videoFile: form.videoFile || undefined,
      });

      setSuccess("Tạo tiến trình thành công!");
      setTimeout(() => router.push("/dashboard/farmer/processing/progresses"), 1200);
    } catch (err) {
      console.error("❌ Submit error:", err);
      setError("Tạo tiến trình thất bại!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Tạo tiến trình mới</h2>
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
    </div>
  );
}
