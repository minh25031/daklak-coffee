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

export default function AdvanceProcessingProgressForm({ batchId, latestProgress, onSuccess }: Props) {
  const [progressDate, setProgressDate] = useState(new Date().toISOString().split("T")[0]);
  const [outputQuantity, setOutputQuantity] = useState(0);
  const [outputUnit, setOutputUnit] = useState("kg");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [parameterName, setParameterName] = useState("");
  const [parameterValue, setParameterValue] = useState("");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let compressedPhoto: File | undefined;
      if (photoFile) {
        compressedPhoto = await imageCompression(photoFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        });
      }

      await advanceToNextProcessingProgress(batchId, {
        progressDate,
        outputQuantity,
        outputUnit,
        photoFile: compressedPhoto,
        videoFile: videoFile ?? undefined,
        parameterName: parameterName || undefined,
        parameterValue: parameterValue || undefined,
        unit: unit || undefined,
        recordedAt: new Date().toISOString(),
      });

      onSuccess?.();
    } catch (err: any) {
      console.error("❌ Advance error:", err);
      setError("Không thể cập nhật tiến trình.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium">Ngày thực hiện</label>
        <Input type="date" value={progressDate} onChange={(e) => setProgressDate(e.target.value)} required />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block mb-1 text-sm font-medium">Khối lượng đầu ra</label>
          <Input
            type="number"
            value={outputQuantity}
            min={0}
            onChange={(e) => setOutputQuantity(Number(e.target.value))}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-sm font-medium">Đơn vị</label>
          <Input value={outputUnit} onChange={(e) => setOutputUnit(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Ảnh minh hoạ</label>
        <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Video minh hoạ</label>
        <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
      </div>

      {/* Parameters Section */}
      <div>
        <label className="block mb-1 text-sm font-medium">Thông số kỹ thuật (tùy chọn)</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tên thông số</label>
            <Input
              type="text"
              value={parameterName}
              onChange={(e) => setParameterName(e.target.value)}
              placeholder="VD: Nhiệt độ, Độ ẩm..."
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Giá trị</label>
            <Input
              type="text"
              value={parameterValue}
              onChange={(e) => setParameterValue(e.target.value)}
              placeholder="VD: 25, 80%..."
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Đơn vị</label>
            <Input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="VD: °C, %, kg..."
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Xác nhận cập nhật"}
        </Button>
      </div>
    </form>
  );
}