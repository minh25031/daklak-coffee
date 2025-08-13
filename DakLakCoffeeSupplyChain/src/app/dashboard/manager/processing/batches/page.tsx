"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import { getAllCropSeasons, CropSeasonListItem } from "@/lib/api/cropSeasons";
import { getAllProcessingMethods, ProcessingMethod } from "@/lib/api/processingMethods";
import { Package, Clock, TrendingUp, BarChart3, Eye, Edit, Trash2 } from "lucide-react";
import { ProcessingStatus } from "@/lib/constants/batchStatus";

// Import các component chung
import ProcessingHeader from "@/components/processing/ProcessingHeader";
import StatsCards from "@/components/processing/StatsCards";
import SearchBox from "@/components/processing/SearchBox";
import StatusFilter from "@/components/processing/StatusFilter";
import ProcessingTable from "@/components/processing/ProcessingTable";

const ITEMS_PER_PAGE = 10;

export default function ManagerProcessingBatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editBatch, setEditBatch] = useState<ProcessingBatch | null>(null);
  const [form, setForm] = useState({
    batchCode: "",
    coffeeTypeId: "",
    cropSeasonId: "",
    methodId: "",
    inputQuantity: 0,
    inputUnit: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [methods, setMethods] = useState<ProcessingMethod[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [batchData, coffeeTypeData, cropSeasonData, methodData] = await Promise.all([
        getAllProcessingBatches(),
        getCoffeeTypes(),
        getAllCropSeasons(),
        getAllProcessingMethods(),
      ]);
      setBatches(batchData || []);
      setCoffeeTypes(coffeeTypeData || []);
      setCropSeasons(cropSeasonData || []);
      setMethods(methodData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Lọc theo trạng thái và tìm kiếm
  const filtered = batches.filter(
    (b) =>
      (selectedStatus === null || (b.status as any) === selectedStatus) &&
      (!search || b.batchCode.toLowerCase().includes(search.toLowerCase()))
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
  const statusCounts = batches.reduce<Record<any, number>>((acc, batch) => {
    acc[batch.status] = (acc[batch.status] || 0) + 1;
    return acc;
  }, {});

  const handleOpenCreate = () => {
    setEditBatch(null);
    setForm({
      batchCode: "",
      coffeeTypeId: coffeeTypes[0]?.coffeeTypeId || "",
      cropSeasonId: cropSeasons[0]?.cropSeasonId || "",
      methodId: methods[0]?.methodId?.toString() || "",
      inputQuantity: 0,
      inputUnit: "kg",
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (batch: ProcessingBatch) => {
    setEditBatch(batch);
    // Tìm cropSeason để lấy coffeeTypeId
    const cropSeason = cropSeasons.find(cs => cs.cropSeasonId === batch.cropSeasonId);
    setForm({
      batchCode: batch.batchCode,
      coffeeTypeId: cropSeason ? (cropSeason as any).coffeeTypeId || "" : "",
      cropSeasonId: batch.cropSeasonId,
      methodId: batch.methodId.toString(),
      inputQuantity: batch.totalInputQuantity,
      inputUnit: "kg",
    });
    setOpenDialog(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setOpenDialog(false);
  };

  const handleViewDetail = (id: string) => {
    router.push(`/dashboard/manager/processing/batches/${id}`);
  };

  const handleDelete = (id: string) => {
    // MANAGER: Có quyền xóa mềm lô sơ chế
    if (confirm("Bạn có chắc chắn muốn xóa mềm lô sơ chế này? Lô sẽ được ẩn khỏi danh sách nhưng không bị xóa hoàn toàn.")) {
      // TODO: Implement soft delete API call
      console.log("Soft delete batch:", id);
    }
  };

  const getStatusInfo = (status: number) => {
    // Debug: Log status để xem giá trị thực tế
    console.log("🔍 Manager getStatusInfo received status:", status, "type:", typeof status);
    
    // Xử lý status có thể là number hoặc string
    let statusString: string;
    if (typeof status === 'number') {
      // Nếu là number, chuyển đổi theo mapping
      switch (status) {
        case 0: statusString = ProcessingStatus.NotStarted; break;
        case 1: statusString = ProcessingStatus.InProgress; break;
        case 2: statusString = ProcessingStatus.Completed; break;
        case 3: statusString = ProcessingStatus.AwaitingEvaluation; break;
        case 4: statusString = ProcessingStatus.Cancelled; break;
        default: statusString = status.toString();
      }
    } else {
      statusString = status;
    }
    
    console.log("🔍 Manager converted statusString:", statusString);
    
    // Kiểm tra xem status có trong enum không
    const isValidStatus = Object.values(ProcessingStatus).includes(statusString as ProcessingStatus);
    
    console.log("🔍 Manager is valid status:", isValidStatus);
    
    if (!isValidStatus) {
      return { label: `Không xác định (${statusString})`, color: "bg-gray-100 text-gray-700 border-gray-200", icon: "❓" };
    }
    
    // Sử dụng statusString để so sánh
    switch (statusString) {
      case ProcessingStatus.NotStarted:
        return { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "⏳" };
      case ProcessingStatus.InProgress:
        return { label: "Đang xử lý", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "🔄" };
      case ProcessingStatus.Completed:
        return { label: "Hoàn thành", color: "bg-green-100 text-green-700 border-green-200", icon: "✅" };
      case ProcessingStatus.AwaitingEvaluation:
        return { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "⏳" };
      case ProcessingStatus.Cancelled:
        return { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", icon: "❌" };
      default:
        return { label: "Không xác định", color: "bg-gray-100 text-gray-700 border-gray-200", icon: "❓" };
    }
  };

  const getCoffeeTypeName = (coffeeTypeId: string) => {
    if (!coffeeTypeId) return "Chưa xác định";
  
    const matched = coffeeTypes.find(
      ct => ct.coffeeTypeId?.trim().toLowerCase() === coffeeTypeId.trim().toLowerCase()
    );
  
    return matched?.typeName || "Không xác định";
  };

  // Tạo dữ liệu cho StatsCards
  const statsData = [
    {
      title: "Tổng lô",
      value: batches.length,
      icon: Package,
      color: "orange"
    },
    {
      title: "Chờ xử lý",
      value: statusCounts[ProcessingStatus.NotStarted] || 0,
      icon: Clock,
      color: "amber"
    },
    {
      title: "Đang xử lý",
      value: statusCounts[ProcessingStatus.InProgress] || 0,
      icon: TrendingUp,
      color: "orange"
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
      render: (value: string) => <span className="font-medium text-gray-800">{value}</span>
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
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
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

  // Cấu hình actions cho table - MANAGER: Xem, sửa, và xóa mềm lô
  const actions = [
    {
      label: "Xem",
      icon: <Eye className="w-3 h-3" />,
      onClick: (batch: ProcessingBatch) => handleViewDetail(batch.batchId),
      className: "hover:bg-green-50 hover:border-green-300 hover:text-green-700"
    },
    {
      label: "Sửa",
      icon: <Edit className="w-3 h-3" />,
      onClick: (batch: ProcessingBatch) => handleOpenEdit(batch),
      className: "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
    },
    {
      label: "Xóa mềm",
      icon: <Trash2 className="w-3 h-3" />,
      onClick: (batch: ProcessingBatch) => handleDelete(batch.batchId),
      className: "hover:bg-red-50 hover:border-red-300 hover:text-red-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ProcessingHeader
          title="Quản lý lô sơ chế"
          description="Theo dõi và quản lý các lô sơ chế cà phê"
          // MANAGER: Không có quyền tạo lô sơ chế
          // createButtonText="Thêm lô sơ chế"
          // onCreateClick={handleOpenCreate}
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

        {/* Dialog for create/edit */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border border-orange-200">
            <DialogTitle className="text-gray-800">{editBatch ? "Sửa lô sơ chế" : "Thêm lô sơ chế"}</DialogTitle>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã lô
                </label>
                <input
                  type="text"
                  name="batchCode"
                  value={form.batchCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại cà phê
                </label>
                <select
                  name="coffeeTypeId"
                  value={form.coffeeTypeId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                >
                  {coffeeTypes.map((type) => (
                    <option key={type.coffeeTypeId} value={type.coffeeTypeId}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mùa vụ
                </label>
                <select
                  name="cropSeasonId"
                  value={form.cropSeasonId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                >
                  {cropSeasons.map((season) => (
                    <option key={season.cropSeasonId} value={season.cropSeasonId}>
                      {season.seasonName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương pháp
                </label>
                <select
                  name="methodId"
                  value={form.methodId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                >
                  {methods.map((method) => (
                    <option key={method.methodId} value={method.methodId}>
                      {method.methodName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng đầu vào (kg)
                </label>
                <input
                  type="number"
                  name="inputQuantity"
                  value={form.inputQuantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-200"
                >
                  {editBatch ? "Cập nhật" : "Tạo"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  className="flex-1 border-orange-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 