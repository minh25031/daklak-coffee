"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllProcessingBatchProgresses,
  ProcessingBatchProgress,
} from "@/lib/api/processingBatchProgress";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import { Eye, Plus } from "lucide-react";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";
import SearchBox from "@/components/processing/SearchBox";
import ProcessingTable from "@/components/processing/ProcessingTable";

const ITEMS_PER_PAGE = 10;

interface GroupedProgress {
  batchId: string;
  batchCode: string;
  batch: ProcessingBatch;
  progresses: ProcessingBatchProgress[];
  totalProgresses: number;
  lastUpdated: string;
  currentStage: string;
}

export default function ProcessingProgressesPage() {
  const router = useRouter();
  const [progresses, setProgresses] = useState<ProcessingBatchProgress[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
      try {
    const [progressRes, batchRes] = await Promise.all([
      getAllProcessingBatchProgresses(),
      getAllProcessingBatches()
    ]);
        setProgresses(progressRes || []);
        setBatches(batchRes || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProgresses([]);
        setBatches([]);
      } finally {
    setLoading(false);
      }
  };
    fetchData();
  }, []);

  // Gộp progress theo batchId
  const groupedProgresses: GroupedProgress[] = batches.map(batch => {
    const batchProgresses = progresses.filter(p => p.batchId === batch.batchId);
    const sortedProgresses = batchProgresses.sort((a, b) => b.stepIndex - a.stepIndex);
    const lastProgress = sortedProgresses[0];
    
    // Xác định giai đoạn hiện tại
    let currentStage = "Chưa bắt đầu";
    if (lastProgress) {
      currentStage = lastProgress.stageName || "Đang xử lý";
    } else if (batch.status === ProcessingStatus.Completed) {
      currentStage = "Hoàn thành";
    } else if (batch.status === ProcessingStatus.InProgress) {
      currentStage = "Đang xử lý";
    } else if (batch.status === ProcessingStatus.NotStarted) {
      currentStage = "Chờ xử lý";
    }
    
    return {
      batchId: batch.batchId,
      batchCode: batch.batchCode,
      batch,
      progresses: batchProgresses,
      totalProgresses: batchProgresses.length,
      lastUpdated: lastProgress?.progressDate || batch.createdAt,
      currentStage: currentStage
    };
  });

  const filtered = groupedProgresses.filter((group) =>
    (group.batchCode?.toLowerCase() || '').includes(search.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Cấu hình cột cho table
  const columns = [
    { 
      key: "batchCode", 
      title: "Mã lô",
      render: (value: string, item: GroupedProgress) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">ID: {item.batchId.slice(-6)}</span>
        </div>
      )
    },
    { 
      key: "currentStage", 
      title: "Giai đoạn hiện tại",
      render: (value: string, item: GroupedProgress) => {
        const getStageColor = (stage: string) => {
          if (stage === "Hoàn thành") return "text-green-700 bg-green-100";
          if (stage === "Đang xử lý") return "text-blue-700 bg-blue-100";
          if (stage === "Chờ xử lý") return "text-yellow-700 bg-yellow-100";
          if (stage === "Chưa bắt đầu") return "text-gray-700 bg-gray-100";
          return "text-purple-700 bg-purple-100";
        };
        
        return (
          <span className={`text-sm px-2 py-1 rounded-full font-medium ${getStageColor(value)}`}>
            {value}
          </span>
        );
      }
    },
    { 
      key: "totalProgresses", 
      title: "Số bước đã thực hiện",
      render: (value: number, item: GroupedProgress) => {
        const totalStages = item.batch.stageCount || 0;
        const progressPercentage = totalStages > 0 ? Math.round((value / totalStages) * 100) : 0;
        
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{value}</span>
              <span className="text-xs text-gray-500">/ {totalStages || "?"}</span>
            </div>
            {totalStages > 0 && (
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        );
      },
      align: "center" as const
    },
    { 
      key: "batchStatus", 
      title: "Trạng thái lô",
      render: (value: any, item: GroupedProgress) => {
        const getStatusInfo = (status: number) => {
          switch (status) {
      case ProcessingStatus.NotStarted:
              return { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" };
      case ProcessingStatus.InProgress:
        return { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" };
      case ProcessingStatus.Completed:
        return { label: "Hoàn thành", color: "bg-green-100 text-green-700" };
      case ProcessingStatus.AwaitingEvaluation:
        return { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700" };
      case ProcessingStatus.Cancelled:
        return { label: "Đã hủy", color: "bg-red-100 text-red-700" };
      default:
        return { label: "Không xác định", color: "bg-gray-100 text-gray-700" };
    }
  };
        
        const statusInfo = getStatusInfo(item.batch.status);
        return (
          <div className="flex items-center justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        );
      },
      align: "center" as const
    },
    { 
      key: "lastUpdated", 
      title: "Cập nhật cuối",
      render: (value: string, item: GroupedProgress) => {
        if (!value) return "—";
        
        const date = new Date(value);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo = "";
        if (diffDays === 1) {
          timeAgo = "Hôm qua";
        } else if (diffDays === 0) {
          timeAgo = "Hôm nay";
        } else if (diffDays < 7) {
          timeAgo = `${diffDays} ngày trước`;
        } else {
          timeAgo = date.toLocaleDateString("vi-VN");
        }
        
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium">{date.toLocaleDateString("vi-VN")}</span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        );
      },
      align: "center" as const
    }
  ];

  // Cấu hình actions cho table - FARMER: Chỉ xem chi tiết, cập nhật trong detail page
  const actions = [
    {
      label: "Xem chi tiết",
      icon: <Eye className="w-3 h-3" />,
      onClick: (group: GroupedProgress) => router.push(`/dashboard/farmer/processing/progresses/${group.batchId}`),
      className: "hover:bg-green-50 hover:border-green-300 text-green-700"
    }
    // FARMER: Không có quyền thêm tiến trình từ list, chỉ cập nhật trong detail page
    // {
    //   label: "Thêm tiến trình",
    //   icon: <Plus className="w-3 h-3" />,
    //   onClick: (group: GroupedProgress) => router.push(`/dashboard/farmer/processing/progresses/create?batchId=${group.batchId}`),
    //   className: "hover:bg-blue-50 hover:border-blue-300 text-blue-700"
    // }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-amber-100 to-orange-300">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
            title="Quản lý tiến trình sơ chế"
          description={`Theo dõi và cập nhật tiến trình xử lý cà phê của bạn • ${batches.length} lô • ${progresses.length} tiến trình`}
          // FARMER: Không có nút tạo mới ở đây, chỉ cập nhật trong detail page
          // createButtonText="Thêm tiến trình"
          // onCreateClick={() => router.push("/dashboard/farmer/processing/progresses/create")}
        />

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBox
                placeholder="Tìm kiếm mã lô..."
                value={search}
                onChange={setSearch}
              />
            </div>
            <div className="text-sm text-gray-600">
              {search && (
                <span className="flex items-center gap-1">
                  <span>🔍</span>
                  <span>Tìm thấy {filtered.length} kết quả</span>
                </span>
              )}
            </div>
            </div>
          </div>
          
        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Danh sách tiến trình theo lô</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Hiển thị {filtered.length} lô • {progresses.length} tiến trình tổng cộng
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {totalPages > 1 ? `Trang ${currentPage} / ${totalPages}` : "Tất cả lô"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-0">
            <ProcessingTable
              data={paginatedData}
              columns={columns}
              actions={actions}
              loading={loading}
              emptyMessage="Không tìm thấy lô nào"
              emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc thêm lô sơ chế mới."
                              renderPagination={filtered.length > ITEMS_PER_PAGE}
                pagination={{
                  currentPage,
                  totalPages,
                  onPageChange: setCurrentPage,
                  itemsPerPage: ITEMS_PER_PAGE,
                  totalItems: filtered.length
                }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}