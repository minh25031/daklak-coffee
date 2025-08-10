"use client";

import { useEffect, useState } from "react";
import {
  getAllProcessingBatchEvaluations,
  ProcessingBatchEvaluation,
} from "@/lib/api/processingBatchEvaluations";
import { Star, Calendar, Eye, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";
import SearchBox from "@/components/processing/SearchBox";
import ProcessingTable from "@/components/processing/ProcessingTable";

export default function ProcessingBatchEvaluationsPage() {
  const [data, setData] = useState<ProcessingBatchEvaluation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getAllProcessingBatchEvaluations();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((evaluation) =>
    evaluation.batchCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Cấu hình cột cho table
  const columns = [
    { key: "batchCode", title: "Mã lô" },
    { 
      key: "evaluationScore", 
      title: "Điểm đánh giá",
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{value || "—"}/10</span>
        </div>
      )
    },
    { key: "qualityGrade", title: "Cấp chất lượng" },
    { key: "evaluatorName", title: "Người đánh giá" },
    { 
      key: "evaluationDate", 
      title: "Ngày đánh giá",
      render: (value: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "—"
    }
  ];

  // Cấu hình actions cho table - FARMER: Chỉ xem đánh giá, không được sửa
  const actions = [
    {
      label: "Xem",
      icon: <Eye className="w-3 h-3" />,
      onClick: (evaluation: ProcessingBatchEvaluation) => router.push(`/dashboard/farmer/processing/evaluations/${evaluation.evaluationId}`),
      className: "hover:bg-green-50 hover:border-green-300"
    }
    // FARMER: Không có quyền sửa đánh giá
    // {
    //   label: "Sửa",
    //   icon: <Edit className="w-3 h-3" />,
    //   onClick: (evaluation: ProcessingBatchEvaluation) => router.push(`/dashboard/farmer/processing/evaluations/${evaluation.evaluationId}/edit`),
    //   className: "hover:bg-blue-50 hover:border-blue-300"
    // }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
          title="Đánh giá lô sơ chế"
          description="Theo dõi đánh giá chất lượng của các lô sơ chế của bạn"
          // FARMER: Không có quyền tạo đánh giá
          // createButtonText="Thêm đánh giá"
          // onCreateClick={() => router.push("/dashboard/farmer/processing/evaluations/create")}
        />

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <SearchBox
            placeholder="Tìm kiếm mã lô..."
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách đánh giá</h2>
              <p className="text-sm text-gray-600">Hiển thị {filtered.length} trong tổng số {data.length} đánh giá</p>
            </div>
          </div>
          <div className="p-0">
            <ProcessingTable
              data={filtered}
              columns={columns}
              actions={actions}
              loading={loading}
              emptyMessage="Chưa có đánh giá nào"
              emptyDescription="Thêm đánh giá chất lượng đầu tiên để bắt đầu."
            />
          </div>
        </div>
      </div>
    </div>
  );
}