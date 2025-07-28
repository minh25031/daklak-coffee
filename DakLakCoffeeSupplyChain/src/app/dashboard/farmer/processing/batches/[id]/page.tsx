"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getProcessingBatchById,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import StatusBadge from "@/components/processing-batches/StatusBadge";
import { Loader } from "lucide-react";

export default function ViewProcessingBatch() {
  const { id } = useParams();
  const [batch, setBatch] = useState<ProcessingBatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatch = async () => {
      if (typeof id === "string") {
        setLoading(true);
        const data = await getProcessingBatchById(id);
        setBatch(data);
        setLoading(false);
      }
    };
    fetchBatch();
  }, [id]);

  // Format số có dấu phẩy: 1,000
  const formatNumber = (value: number | string | undefined) => {
    const number = Number(value);
    return isNaN(number)
      ? "-"
      : new Intl.NumberFormat("vi-VN").format(number);
  };
const formatWeight = (kg: number | string | undefined): string => {
  const number = Number(kg);
  if (isNaN(number)) return "-";

  if (number >= 1000) {
    return `${(number / 1000).toFixed(2)} tấn`;
  } else if (number >= 100) {
    return `${(number / 100).toFixed(1)} tạ`;
  } else {
    return `${new Intl.NumberFormat("vi-VN").format(number)} kg`;
  }
};
  // Tính tổng khối lượng ra từ progresses
  const totalOutputQuantity =
    batch?.progresses?.reduce((sum, progress) => {
      const quantity = Number(progress.outputQuantity?.toString().replace(/[^\d.]/g, ""));
      return sum + (isNaN(quantity) ? 0 : quantity);
    }, 0) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader className="animate-spin mr-2" /> Đang tải dữ liệu...
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center text-gray-500 py-10">
        Không tìm thấy thông tin lô sơ chế.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">
        Chi tiết lô sơ chế
      </h1>

      {/* Thông tin chính */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">Tên lô:</span>{" "}
          {batch.batchCode}
        </div>
        <div>
          <span className="font-medium text-gray-600">Mã hệ thống:</span>{" "}
          {batch.systemBatchCode}
        </div>
        <div>
          <span className="font-medium text-gray-600">Mùa vụ:</span>{" "}
          {batch.cropSeasonName}
        </div>
        <div>
          <span className="font-medium text-gray-600">Nông dân:</span>{" "}
          {batch.farmerName}
        </div>
        <div>
          <span className="font-medium text-gray-600">Phương pháp sơ chế:</span>{" "}
          {batch.methodName}
        </div>
        <div>
          <span className="font-medium text-gray-600">Trạng thái:</span>{" "}
          <StatusBadge status={batch.status} />
        </div>
        <div>
          <span className="font-medium text-gray-600">Khối lượng vào:</span>{" "}
          {formatNumber(batch.inputQuantity)} {batch.inputUnit}
        </div>
        <div>
          <span className="font-medium text-gray-600">Khối lượng ra:</span>{" "}
            {formatWeight(totalOutputQuantity)}
          
        </div>
        <div>
          <span className="font-medium text-gray-600">Ngày tạo:</span>{" "}
          {new Date(batch.createdAt).toLocaleString("vi-VN")}
        </div>
      </div>

      {/* Tiến độ sơ chế */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Tiến độ sơ chế
        </h2>
        {batch.progresses && batch.progresses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto border">
              <thead className="bg-gray-100 text-gray-700 font-medium">
                <tr>
                  <th className="px-3 py-2 text-left">Tên giai đoạn</th>
                  <th className="px-3 py-2 text-left">Chi tiết giai đoạn</th>
                  <th className="px-3 py-2 text-left">Khối lượng đầu ra</th>
                  <th className="px-3 py-2 text-left">Người cập nhật</th>
                  <th className="px-3 py-2 text-left">Ảnh</th>
                  <th className="px-3 py-2 text-left">Video</th>
                </tr>
              </thead>
              <tbody>
                {batch.progresses.map((progress, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">{progress.stageName}</td>
                    <td className="px-3 py-2">{progress.stageDescription}</td>
                    <td className="px-3 py-2">
                      {formatWeight(progress.outputQuantity)}{" "}
                      
                    </td>
                    <td className="px-3 py-2">{progress.updatedByName}</td>
                    <td className="px-3 py-2">
                      {progress.photoUrl ? (
                        <img
                          src={progress.photoUrl}
                          alt="Ảnh tiến độ"
                          className="h-14 w-auto rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {progress.videoUrl ? (
                        <video controls className="h-16 w-auto">
                          <source src={progress.videoUrl} />
                          Trình duyệt không hỗ trợ video.
                        </video>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Chưa có tiến độ nào
          </div>
        )}
      </div>

      {/* Sản phẩm */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Sản phẩm</h2>
        {batch.products && batch.products.length > 0 ? (
          <table className="w-full text-sm table-auto border">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="px-3 py-2 text-left">Tên sản phẩm</th>
                <th className="px-3 py-2 text-left">Khối lượng</th>
                <th className="px-3 py-2 text-left">Đơn vị</th>
              </tr>
            </thead>
            <tbody>
              {batch.products.map((product, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{product.name}</td>
                  <td className="px-3 py-2">{formatNumber(product.quantity)}</td>
                  <td className="px-3 py-2">{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Chưa có sản phẩm nào
          </div>
        )}
      </div>
    </div>
  );
}
