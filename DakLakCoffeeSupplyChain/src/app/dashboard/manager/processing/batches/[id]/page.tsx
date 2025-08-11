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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-6">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-lg rounded-lg border border-orange-200 p-6 space-y-6">
        <div className="border-b border-orange-200 pb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Chi tiết lô chế biến
          </h1>
          <p className="text-gray-600 mt-1">Thông tin chi tiết về lô chế biến cà phê</p>
        </div>

        {/* Thông tin chính */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
            Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200">
              <span className="font-medium text-gray-700">Mã lô:</span>{" "}
              <span className="text-gray-800 font-semibold">{batch.batchCode}</span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200">
              <span className="font-medium text-gray-700">Mã hệ thống:</span>{" "}
              <span className="text-gray-800 font-semibold">{batch.systemBatchCode}</span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200">
              <span className="font-medium text-gray-700">Mùa vụ:</span>{" "}
              <span className="text-gray-800 font-semibold">{batch.cropSeasonName}</span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200">
              <span className="font-medium text-gray-700">Nông dân:</span>{" "}
              <span className="text-gray-800 font-semibold">{batch.farmerName}</span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200">
              <span className="font-medium text-gray-700">Phương pháp chế biến:</span>{" "}
              <span className="text-gray-800 font-semibold">{batch.methodName}</span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200">
              <span className="font-medium text-gray-700">Trạng thái:</span>{" "}
              <StatusBadge status={batch.status} />
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200">
              <span className="font-medium text-gray-700">Khối lượng vào:</span>{" "}
              <span className="text-gray-800 font-semibold">{batch.totalInputQuantity} kg</span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200">
              <span className="font-medium text-gray-700">Khối lượng ra:</span>{" "}
              <span className="text-gray-800 font-semibold">{batch.totalOutputQuantity} kg</span>
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-orange-200 md:col-span-2">
              <span className="font-medium text-gray-700">Ngày tạo:</span>{" "}
              <span className="text-gray-800 font-semibold">{new Date(batch.createdAt).toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </div>

        {/* Tiến độ chế biến */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Tiến độ chế biến
          </h2>
          {batch.progresses && batch.progresses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/80 text-gray-700 font-medium rounded-lg">
                  <tr>
                    <th className="px-4 py-3 text-left rounded-l-lg">Tên giai đoạn</th>
                    <th className="px-4 py-3 text-left">Chi tiết giai đoạn</th>
                    <th className="px-4 py-3 text-left rounded-r-lg">Khối lượng đầu ra</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {batch.progresses.map((progress, idx) => (
                    <tr key={idx} className="bg-white/60 rounded-lg border border-blue-100 hover:bg-white/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{progress.stageName}</td>
                      <td className="px-4 py-3 text-gray-700">{progress.stageDescription}</td>
                      <td className="px-4 py-3 text-gray-800 font-semibold">
                        {progress.outputQuantity} {progress.outputUnit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white/60 rounded-lg border border-blue-100">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm">Chưa có tiến độ nào</p>
            </div>
          )}
        </div>

        {/* Sản phẩm */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            Sản phẩm
          </h2>
          {batch.products && batch.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/80 text-gray-700 font-medium rounded-lg">
                  <tr>
                    <th className="px-4 py-3 text-left rounded-l-lg">Tên sản phẩm</th>
                    <th className="px-4 py-3 text-left">Khối lượng</th>
                    <th className="px-4 py-3 text-left rounded-r-lg">Đơn vị</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {batch.products.map((product, idx) => (
                    <tr key={idx} className="bg-white/60 rounded-lg border border-green-100 hover:bg-white/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                      <td className="px-4 py-3 text-gray-800 font-semibold">{product.quantity}</td>
                      <td className="px-4 py-3 text-gray-700">{product.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white/60 rounded-lg border border-green-100">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-sm">Chưa có sản phẩm nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 