"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProcessingBatchProgress } from "@/lib/api/processingBatchProgresses";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";

export default function CreateProcessingProgressPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    batchId: "",
    stepIndex: 1, // mặc định là 1
    stageId: 1,   // mặc định là 1
    progressDate: "",
    outputQuantity: 0,
    outputUnit: "kg",
    photoUrl: "",
    videoUrl: "",
  });
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      const data = await getAllProcessingBatches();
      setBatches(data || []);
    };
    fetchBatches();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "outputQuantity" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createProcessingBatchProgress(form);
      setSuccess("Tạo tiến trình thành công!");
      setTimeout(() => router.push("/dashboard/farmer/processing/progresses"), 1200);
    } catch (err: any) {
      setError("Tạo tiến trình thất bại!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h1 className="text-2xl font-bold mb-6">Tạo tiến trình mới</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Chọn lô chế biến</label>
          <select
            name="batchId"
            value={form.batchId}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Chọn lô --</option>
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>{b.batchCode}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Ngày thực hiện</label>
          <Input type="date" name="progressDate" value={form.progressDate} onChange={handleChange} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Khối lượng đầu ra</label>
          <Input type="number" name="outputQuantity" value={form.outputQuantity} onChange={handleChange} min={0} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Đơn vị</label>
          <Input name="outputUnit" value={form.outputUnit} onChange={handleChange} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Ảnh (URL)</label>
          <Input name="photoUrl" value={form.photoUrl} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Video (URL)</label>
          <Input name="videoUrl" value={form.videoUrl} onChange={handleChange} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Huỷ
          </Button>
          <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</Button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </form>
    </div>
  );
} 