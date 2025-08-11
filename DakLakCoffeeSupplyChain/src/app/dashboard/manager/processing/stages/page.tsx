"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllProcessingStagess, ProcessingStages } from "@/lib/api/processingStages";
import { Eye, Edit, Trash2, Plus, Settings, Clock, CheckCircle } from "lucide-react";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";
import SearchBox from "@/components/processing/SearchBox";
import ProcessingTable from "@/components/processing/ProcessingTable";

export default function ManagerProcessingStagesPage() {
  const router = useRouter();
  const [stages, setStages] = useState<ProcessingStages[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const stageData = await getAllProcessingStagess();
        setStages(stageData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = stages.filter((stage) =>
    stage.stageName?.toLowerCase().includes(search.toLowerCase()) ||
    stage.stageCode?.toLowerCase().includes(search.toLowerCase()) ||
    stage.description?.toLowerCase().includes(search.toLowerCase())
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
    // MANAGER: Có quyền xóa mềm giai đoạn
    if (confirm("Bạn có chắc chắn muốn xóa mềm giai đoạn này? Giai đoạn sẽ được ẩn khỏi danh sách nhưng không bị xóa hoàn toàn.")) {
      // TODO: Implement soft delete API call
      console.log("Soft delete stage:", id);
    }
  };

  // Cấu hình cột cho table
  const columns = [
    { 
      key: "stageCode", 
      title: "Mã giai đoạn",
      render: (value: string) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    { 
      key: "stageName", 
      title: "Tên giai đoạn",
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    { 
      key: "description", 
      title: "Mô tả",
      render: (value: string) => (
        <span className="text-sm text-gray-600 line-clamp-2">
          {value || "Không có mô tả"}
        </span>
      )
    },
    { 
      key: "estimatedDuration", 
      title: "Thời gian ước tính",
      render: (value: number) => {
        if (!value) return "—";
        
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        
        if (hours > 0) {
          return (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">
                {hours}h {minutes > 0 ? `${minutes}m` : ""}
              </span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{minutes}m</span>
            </div>
          );
        }
      }
    },
    { 
      key: "sequenceOrder", 
      title: "Thứ tự",
      render: (value: number) => (
        <div className="flex items-center justify-center">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {value}
          </span>
        </div>
      ),
      align: "center" as const
    },
    { 
      key: "isActive", 
      title: "Trạng thái",
      render: (value: boolean) => {
        return (
          <div className="flex items-center justify-center">
            {value ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle className="w-3 h-3" />
                Hoạt động
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                <Settings className="w-3 h-3" />
                Không hoạt động
              </span>
            )}
          </div>
        );
      },
      align: "center" as const
    },
    { 
      key: "createdAt", 
      title: "Ngày tạo",
      render: (value: string) => {
        if (!value) return "—";
        
        const date = new Date(value);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{date.toLocaleDateString("vi-VN")}</span>
            <span className="text-xs text-gray-500">{date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
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
      onClick: (stage: ProcessingStages) => router.push(`/dashboard/manager/processing/stages/${stage.stageId}`),
      className: "hover:bg-green-50 hover:border-green-300"
    },
    {
      label: "Sửa",
      icon: <Edit className="w-3 h-3" />,
      onClick: (stage: ProcessingStages) => router.push(`/dashboard/manager/processing/stages/${stage.stageId}/edit`),
      className: "hover:bg-blue-50 hover:border-blue-300"
    },
    {
      label: "Xóa mềm",
      icon: <Trash2 className="w-3 h-3" />,
      onClick: (stage: ProcessingStages) => handleDelete(stage.stageId),
      className: "hover:bg-red-50 hover:border-red-300"
    }
  ];

  // Tính toán thống kê
  const totalStages = stages.length;
  const activeStages = stages.filter(s => s.isActive).length;
  const inactiveStages = stages.filter(s => !s.isActive).length;
  const totalDuration = stages.reduce((sum, stage) => sum + (stage.estimatedDuration || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
          title="Quản lý giai đoạn sơ chế"
          description={`Quản lý các giai đoạn trong quy trình sơ chế cà phê • ${totalStages} giai đoạn • ${activeStages} đang hoạt động`}
          createButtonText="Thêm giai đoạn"
          onCreateClick={() => router.push("/dashboard/manager/processing/stages/create")}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng giai đoạn</p>
                <p className="text-2xl font-bold text-gray-900">{totalStages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{activeStages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveStages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng thời gian</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBox
                placeholder="Tìm kiếm tên giai đoạn, mã giai đoạn hoặc mô tả..."
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
                <h2 className="text-lg font-semibold text-gray-900">Danh sách giai đoạn</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Hiển thị {filtered.length} giai đoạn • {activeStages} đang hoạt động
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {totalPages > 1 ? `Trang ${currentPage} / ${totalPages}` : "Tất cả giai đoạn"}
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
              emptyMessage="Không tìm thấy giai đoạn nào"
              emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc thêm giai đoạn mới."
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