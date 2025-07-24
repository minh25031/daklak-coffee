"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProcessingBatchProgress } from "@/lib/api/processingBatchProgresses";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { ProcessingStatus } from "@/lib/constrant/batchStatus";

export default function CreateProcessingProgressPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    batchId: "",
    progressDate: "",
    outputQuantity: 0,
    outputUnit: "kg",
    photoUrl: "",
    videoUrl: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      const res = await getAllProcessingBatches();
      // Chỉ lấy các batch có status === NotStarted
      const filtered = (res || []).filter((b) => b.status === ProcessingStatus.NotStarted);
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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  // ✅ Log dữ liệu gửi đi
  console.log("📤 Payload gửi lên BE:", {
    batchId: form.batchId,
    data: {
      progressDate: form.progressDate,
      outputQuantity: form.outputQuantity,
      outputUnit: form.outputUnit,
      photoUrl: form.photoUrl || null,
      videoUrl: form.videoUrl || null,
    },
  });

  try {
    await createProcessingBatchProgress(form.batchId, {
      progressDate: form.progressDate,
      outputQuantity: form.outputQuantity,
      outputUnit: form.outputUnit,
      photoUrl: form.photoUrl || null,
      videoUrl: form.videoUrl || null,
    });

    setSuccess("Tạo tiến trình thành công!");
    setTimeout(() => router.push("/dashboard/farmer/processing/progresses"), 1200);
  } catch (err: any) {
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
          <label className="block font-medium mb-1">Ảnh (URL)</label>
          <Input name="photoUrl" value={form.photoUrl} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium mb-1">Video (URL)</label>
          <Input name="videoUrl" value={form.videoUrl} onChange={handleChange} />
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
