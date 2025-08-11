"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllProcessingParameters, ProcessingParameter } from "@/lib/api/processingParameters";
import { Eye, Edit, Trash2, Plus, Settings, Gauge, AlertCircle } from "lucide-react";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";
import SearchBox from "@/components/processing/SearchBox";
import ProcessingTable from "@/components/processing/ProcessingTable";

export default function ManagerProcessingParametersPage() {
  const router = useRouter();
  const [parameters, setParameters] = useState<ProcessingParameter[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const parameterData = await getAllProcessingParameters();
        setParameters(parameterData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = parameters.filter((parameter) =>
    parameter.parameterName?.toLowerCase().includes(search.toLowerCase()) ||
    parameter.parameterCode?.toLowerCase().includes(search.toLowerCase()) ||
    parameter.description?.toLowerCase().includes(search.toLowerCase())
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
    // MANAGER: Có quyền xóa mềm tham số
    if (confirm("Bạn có chắc chắn muốn xóa mềm tham số này? Tham số sẽ được ẩn khỏi danh sách nhưng không bị xóa hoàn toàn.")) {
      // TODO: Implement soft delete API call
      console.log("Soft delete parameter:", id);
    }
  };

  // Cấu hình cột cho table
  const columns = [
    { 
      key: "parameterCode", 
      title: "Mã tham số",
      render: (value: string) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    { 
      key: "parameterName", 
      title: "Tên tham số",
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
      key: "unit", 
      title: "Đơn vị",
      render: (value: string) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
          {value || "—"}
        </span>
      )
    },
    { 
      key: "minValue", 
      title: "Giá trị min",
      render: (value: number) => (
        <span className="text-sm font-medium text-red-600">
          {value !== null && value !== undefined ? value : "—"}
        </span>
      )
    },
    { 
      key: "maxValue", 
      title: "Giá trị max",
      render: (value: number) => (
        <span className="text-sm font-medium text-green-600">
          {value !== null && value !== undefined ? value : "—"}
        </span>
      )
    },
    { 
      key: "targetValue", 
      title: "Giá trị mục tiêu",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-600">
            {value !== null && value !== undefined ? value : "—"}
          </span>
        </div>
      )
    },
    { 
      key: "isRequired", 
      title: "Bắt buộc",
      render: (value: boolean) => {
        return (
          <div className="flex items-center justify-center">
            {value ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <AlertCircle className="w-3 h-3" />
                Bắt buộc
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                <Settings className="w-3 h-3" />
                Tùy chọn
              </span>
            )}
          </div>
        );
      },
      align: "center" as const
    },
    { 
      key: "isActive", 
      title: "Trạng thái",
      render: (value: boolean) => {
        return (
          <div className="flex items-center justify-center">
            {value ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Hoạt động
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Không hoạt động
              </span>
            )}
          </div>
        );
      },
      align: "center" as const
    }
  ];

  // Cấu hình actions cho table - MANAGER: Xem, sửa, và xóa mềm
  const actions = [
    {
      label: "Xem",
      icon: <Eye className="w-3 h-3" />,
      onClick: (parameter: ProcessingParameter) => router.push(`/dashboard/manager/processing/parameters/${parameter.parameterId}`),
      className: "hover:bg-green-50 hover:border-green-300"
    },
    {
      label: "Sửa",
      icon: <Edit className="w-3 h-3" />,
      onClick: (parameter: ProcessingParameter) => router.push(`/dashboard/manager/processing/parameters/${parameter.parameterId}/edit`),
      className: "hover:bg-blue-50 hover:border-blue-300"
    },
    {
      label: "Xóa mềm",
      icon: <Trash2 className="w-3 h-3" />,
      onClick: (parameter: ProcessingParameter) => handleDelete(parameter.parameterId),
      className: "hover:bg-red-50 hover:border-red-300"
    }
  ];

  // Tính toán thống kê
  const totalParameters = parameters.length;
  const activeParameters = parameters.filter(p => p.isActive).length;
  const requiredParameters = parameters.filter(p => p.isRequired).length;
  const optionalParameters = parameters.filter(p => !p.isRequired).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
          title="Quản lý tham số sơ chế"
          description={`Quản lý các tham số kỹ thuật trong quy trình sơ chế cà phê • ${totalParameters} tham số • ${activeParameters} đang hoạt động`}
          createButtonText="Thêm tham số"
          onCreateClick={() => router.push("/dashboard/manager/processing/parameters/create")}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng tham số</p>
                <p className="text-2xl font-bold text-gray-900">{totalParameters}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{activeParameters}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bắt buộc</p>
                <p className="text-2xl font-bold text-gray-900">{requiredParameters}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tùy chọn</p>
                <p className="text-2xl font-bold text-gray-900">{optionalParameters}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <SearchBox
                placeholder="Tìm kiếm tên tham số, mã tham số hoặc mô tả..."
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
                <h2 className="text-lg font-semibold text-gray-900">Danh sách tham số</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Hiển thị {filtered.length} tham số • {activeParameters} đang hoạt động
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {totalPages > 1 ? `Trang ${currentPage} / ${totalPages}` : "Tất cả tham số"}
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
              emptyMessage="Không tìm thấy tham số nào"
              emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc thêm tham số mới."
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