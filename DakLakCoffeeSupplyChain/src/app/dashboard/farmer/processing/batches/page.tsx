"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllProcessingBatches,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import { Package, Clock, Eye, Edit, TrendingUp, BarChart3 } from "lucide-react";
import { ProcessingStatus } from "@/lib/constants/batchStatus";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";
import StatsCards from "@/components/processing/StatsCards";
import SearchBox from "@/components/processing/SearchBox";
import StatusFilter from "@/components/processing/StatusFilter";
import ProcessingTable from "@/components/processing/ProcessingTable";

const ITEMS_PER_PAGE = 10;

export default function Batches() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [batchesData, coffeeTypesData] = await Promise.all([
          getAllProcessingBatches(),
          getCoffeeTypes()
        ]);
        
        setBatches(batchesData || []);
        setCoffeeTypes(coffeeTypesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setBatches([]);
        setCoffeeTypes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = batches.filter(
    (b) =>
      (selectedStatus === null || b.status === selectedStatus) &&
      (!search || (b.batchCode?.toLowerCase() || '').includes(search.toLowerCase()))
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus]);

  // Đếm số lượng theo trạng thái
  const statusCounts = batches.reduce<Record<number, number>>((acc, batch) => {
    acc[batch.status] = (acc[batch.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusInfo = (status: number) => {
    switch (status) {
      case ProcessingStatus.NotStarted:
        return { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700", icon: "⏳" };
      case ProcessingStatus.InProgress:
        return { label: "Đang xử lý", color: "bg-blue-100 text-blue-700", icon: "🔄" };
      case ProcessingStatus.Completed:
        return { label: "Hoàn thành", color: "bg-green-100 text-green-700", icon: "✅" };
      case ProcessingStatus.AwaitingEvaluation:
        return { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700", icon: "⏳" };
      case ProcessingStatus.Cancelled:
        return { label: "Đã hủy", color: "bg-red-100 text-red-700", icon: "❌" };
      default:
        return { label: "Không xác định", color: "bg-gray-100 text-gray-700", icon: "❓" };
    }
  };

  const getCoffeeTypeName = (coffeeTypeId: string) => {
    if (!coffeeTypeId) return "Chưa xác định";
  
    const matched = coffeeTypes.find(
      ct => (ct.coffeeTypeId?.trim().toLowerCase() || '') === (coffeeTypeId?.trim().toLowerCase() || '')
    );
  
    return matched?.typeName || "Không xác định";
  };

  // Tạo dữ liệu cho StatsCards
  const statsData = [
    {
      title: "Tổng lô",
      value: batches.length,
      icon: Package,
      color: "blue"
    },
    {
      title: "Chờ xử lý",
      value: statusCounts[ProcessingStatus.NotStarted] || 0,
      icon: Clock,
      color: "yellow"
    },
    {
      title: "Đang xử lý",
      value: statusCounts[ProcessingStatus.InProgress] || 0,
      icon: TrendingUp,
      color: "blue"
    },
    {
      title: "Hoàn thành",
      value: statusCounts[ProcessingStatus.Completed] || 0,
      icon: BarChart3,
      color: "green"
    },
    {
      title: "Chờ đánh giá",
      value: statusCounts[ProcessingStatus.AwaitingEvaluation] || 0,
      icon: Clock,
      color: "orange"
    }
  ];

  // Cấu hình cột cho table
  const columns = [
    { 
      key: "batchCode", 
      title: "Mã lô",
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    { 
      key: "cropSeasonName", 
      title: "Mùa vụ",
      render: (value: string, item: ProcessingBatch) => value || `ID: ${item.cropSeasonId}`
    },
    { 
      key: "methodName", 
      title: "Phương pháp",
      render: (value: string, item: ProcessingBatch) => value || `ID: ${item.methodId}`
    },
    { 
      key: "coffeeTypeId", 
      title: "Loại cà phê",
      render: (value: string) => getCoffeeTypeName(value)
    },
    { 
      key: "status", 
      title: "Trạng thái",
      render: (value: number) => {
        const statusInfo = getStatusInfo(value);
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
      key: "createdAt", 
      title: "Ngày tạo",
      render: (value: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "—"
    }
  ];

  // Cấu hình actions cho table - FARMER: Chỉ xem và sửa lô của mình
  const actions = [
    {
      label: "Xem",
      icon: <Eye className="w-3 h-3" />,
      onClick: (batch: ProcessingBatch) => router.push(`/dashboard/farmer/processing/batches/${batch.batchId}`),
      className: "hover:bg-green-50 hover:border-green-300"
    },
    {
      label: "Sửa",
      icon: <Edit className="w-3 h-3" />,
      onClick: (batch: ProcessingBatch) => router.push(`/dashboard/farmer/processing/batches/${batch.batchId}/edit`),
      className: "hover:bg-blue-50 hover:border-blue-300"
    }
    // FARMER: Không có quyền xóa lô sơ chế
    // {
    //   label: "Xóa",
    //   icon: <Trash2 className="w-3 h-3" />,
    //   onClick: (batch: ProcessingBatch) => handleDelete(batch.batchId),
    //   className: "hover:bg-red-50 hover:border-red-300"
    // }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
          title="Quản lý lô sơ chế"
          description="Theo dõi và quản lý các lô sơ chế cà phê của bạn"
          createButtonText="Thêm lô sơ chế"
          onCreateClick={() => router.push("/dashboard/farmer/processing/batches/create")}
        />

        {/* Stats Cards */}
        <StatsCards stats={statsData} />

        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchBox
              placeholder="Tìm kiếm mã lô..."
              value={search}
              onChange={setSearch}
            />
            
            <StatusFilter
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              statusCounts={statusCounts}
              statusInfoMap={getStatusInfo}
              totalCount={batches.length}
            />
          </div>
        </div>

        {/* Table với header riêng */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200">
          <div className="p-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Danh sách lô sơ chế</h2>
              <p className="text-sm text-gray-600">Hiển thị {filtered.length} trong tổng số {batches.length} lô</p>
            </div>
          </div>
          <div className="p-0">
            <ProcessingTable
              data={paginatedData}
              columns={columns}
              actions={actions}
              loading={loading}
              emptyMessage="Không tìm thấy lô nào"
              emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc thêm lô mới."
              renderPagination={true}
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
