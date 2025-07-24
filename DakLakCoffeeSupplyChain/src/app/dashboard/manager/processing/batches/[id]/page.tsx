"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getProcessingBatchById,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import StatusBadge from "@/components/processing-batches/StatusBadge";
import { Loader } from "lucide-react";

export default function ViewProcessingBatchManager() {
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
        Không tìm thấy lô chế biến.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">
        Chi tiết lô chế biến
      </h1>

      {/* Thông tin chính */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">Mã lô:</span>{" "}
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
          <span className="font-medium text-gray-600">Phương pháp chế biến:</span>{" "}
          {batch.methodName}
        </div>
        <div>
          <span className="font-medium text-gray-600">Trạng thái:</span>{" "}
          <StatusBadge status={batch.status} />
        </div>
        <div>
          <span className="font-medium text-gray-600">Khối lượng vào:</span>{" "}
          {batch.inputQuantity} {batch.inputUnit}
        </div>
        <div>
          <span className="font-medium text-gray-600">Khối lượng ra:</span>{" "}
          {batch.totalOutputQuantity} {batch.inputUnit}
        </div>
        <div>
          <span className="font-medium text-gray-600">Ngày tạo:</span>{" "}
          {new Date(batch.createdAt).toLocaleString("vi-VN")}
        </div>
      </div>

      {/* Tiến độ chế biến */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Tiến độ chế biến
        </h2>
        {batch.progresses && batch.progresses.length > 0 ? (
          <table className="w-full text-sm table-auto border">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="px-3 py-2 text-left">Tên giai đoạn</th>
                <th className="px-3 py-2 text-left">Chi tiết giai đoạn</th>
                <th className="px-3 py-2 text-left">Khối lượng đầu ra</th>
              </tr>
            </thead>
            <tbody>
              {batch.progresses.map((progress, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{progress.stageName}</td>
                  <td className="px-3 py-2">{progress.stageDescription}</td>
                  <td className="px-3 py-2">
                    {progress.outputQuantity} {progress.outputUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <td className="px-3 py-2">{product.quantity}</td>
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