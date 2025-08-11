"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllProcessingWastes, ProcessingWaste } from "@/lib/api/processingBatchWastes";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { Eye, Edit, Trash2, Recycle, Scale, Calendar, AlertTriangle } from "lucide-react";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";
import SearchBox from "@/components/processing/SearchBox";
import ProcessingTable from "@/components/processing/ProcessingTable";

interface WasteWithBatch extends ProcessingWaste {
  batch?: ProcessingBatch;
}

export default function ManagerProcessingWastesPage() {
  const router = useRouter();
  const [wastes, setWastes] = useState<ProcessingWaste[]>([]);
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [wasteData, batchData] = await Promise.all([
          getAllProcessingWastes(),
          getAllProcessingBatches()
        ]);
        setWastes(wasteData || []);
        setBatches(batchData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Kết hợp wastes với batch data
  const wastesWithBatch: WasteWithBatch[] = wastes.map(waste => {
    const batch = batches.find(b => b.batchId === waste.batchId);
    return {
      ...waste,
      batch
    };
  });

  const filtered = wastesWithBatch.filter((waste) =>
    waste.batch?.batchCode?.toLowerCase().includes(search.toLowerCase()) ||
    waste.wasteCode?.toLowerCase().includes(search.toLowerCase()) ||
    waste.wasteType?.toLowerCase().includes(search.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDelete = (id: string) => {
    // MANAGER: Có quyền xóa mềm chất thải
    if (confirm("Bạn có chắc chắn muốn xóa mềm chất thải này? Chất thải sẽ được ẩn khỏi danh sách nhưng không bị xóa hoàn toàn.")) {
      // TODO: Implement soft delete API call
      console.log("Soft delete waste:", id);
    }
  };

  // Cấu hình cột cho table
  const columns = [
    { 
      key: "wasteCode", 
      title: "Mã chất thải",
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    { 
      key: "batchCode", 
      title: "Mã lô",
      render: (value: string, item: WasteWithBatch) => (
        <span className="text-blue-600 font-medium">
          {item.batch?.batchCode || "Không xác định"}
        </span>
      )
    },
    { 
      key: "wasteType", 
      title: "Loại chất thải",
      render: (value: string) => {
        const getWasteTypeColor = (type: string) => {
          if (type.includes("Vỏ")) return "bg-orange-100 text-orange-700";
          if (type.includes("Nước")) return "bg-blue-100 text-blue-700";
          if (type.includes("Bã")) return "bg-brown-100 text-brown-700";
          return "bg-gray-100 text-gray-700";
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWasteTypeColor(value)}`}>
            {value}
          </span>
        );
      }
    },
    { 
      key: "quantity", 
      title: "Số lượng",
      render: (value: number, item: ProcessingWaste) => (
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value || 0}</span>
          <span className="text-sm text-gray-500">{item.unit || "kg"}</span>
        </div>
      )
    },
    { 
      key: "disposalMethod", 
      title: "Phương pháp xử lý",
      render: (value: string) => {
        const getDisposalColor = (method: string) => {
          if (method.includes("Tái chế")) return "text-green-600";
          if (method.includes("Chôn")) return "text-orange-600";
          if (method.includes("Đốt")) return "text-red-600";
          return "text-gray-600";
        };
        
        return (
          <span className={`text-sm font-medium ${getDisposalColor(value)}`}>
            {value || "Chưa xác định"}
          </span>
        );
      }
    },
    { 
      key: "createdAt", 
      title: "Ngày tạo",
      render: (value: string) => {
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
          <div className="flex flex-col">
            <span className="text-sm font-medium">{date.toLocaleDateString("vi-VN")}</span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        );
      }
    }
  ];

  // Cấu hình actions cho table - MANAGER: Xem, sửa, và xóa mềm
  const actions = [
    {
      label: "Xem",
      icon: <Eye className="w-3 h-3" />,
      onClick: (waste: WasteWithBatch) => router.push(`/dashboard/manager/processing/wastes/${waste.wasteId}`),
      className: "hover:bg-green-50 hover:border-green-300"
    },
    {
      label: "Sửa",
      icon: <Edit className="w-3 h-3" />,
      onClick: (waste: WasteWithBatch) => router.push(`/dashboard/manager/processing/wastes/${waste.wasteId}/edit`),
      className: "hover:bg-blue-50 hover:border-blue-300"
    },
    {
      label: "Xóa mềm",
      icon: <Trash2 className="w-3 h-3" />,
      onClick: (waste: WasteWithBatch) => handleDelete(waste.wasteId),
      className: "hover:bg-red-50 hover:border-red-300"
    }
  ];

  // Tính toán thống kê
  const totalWastes = wastes.length;
  const totalQuantity = wastes.reduce((sum, waste) => sum + (waste.quantity || 0), 0);
  const recycledWastes = wastes.filter(w => w.disposalMethod?.includes("Tái chế")).length;
  const hazardousWastes = wastes.filter(w => w.wasteType?.includes("Độc hại")).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
          title="Quản lý chất thải sơ chế"
          description={`Theo dõi và quản lý chất thải từ quá trình sơ chế cà phê • ${totalWastes} loại chất thải • ${totalQuantity.toFixed(1)} kg tổng cộng`}
          createButtonText="Thêm chất thải"
          onCreateClick={() => router.push("/dashboard/manager/processing/wastes/create")}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Recycle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng chất thải</p>
                <p className="text-2xl font-bold text-gray-900">{totalWastes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng khối lượng</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuantity.toFixed(1)} kg</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Recycle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tái chế</p>
                <p className="text-2xl font-bold text-gray-900">{recycledWastes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chất thải độc hại</p>
                <p className="text-2xl font-bold text-gray-900">{hazardousWastes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBox
                placeholder="Tìm kiếm mã chất thải, mã lô hoặc loại chất thải..."
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
                <h2 className="text-lg font-semibold text-gray-900">Danh sách chất thải</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Hiển thị {filtered.length} chất thải • Tổng khối lượng: {totalQuantity.toFixed(1)} kg
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {totalPages > 1 ? `Trang ${currentPage} / ${totalPages}` : "Tất cả chất thải"}
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
              emptyMessage="Không tìm thấy chất thải nào"
              emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc thêm chất thải mới."
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