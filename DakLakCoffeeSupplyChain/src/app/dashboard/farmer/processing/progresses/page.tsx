"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllProcessingBatchProgresses,
  advanceToNextProcessingProgress,
  ProcessingBatchProgress,
} from "@/lib/api/processingBatchProgress";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Search, Plus, TrendingUp, Package, Calendar, Eye, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import PageTitle from "@/components/ui/PageTitle";

interface BatchProgressGroup {
  batchId: string;
  batchCode: string;
  progresses: ProcessingBatchProgress[];
  totalSteps: number;
  completedSteps: number;
  latestStep: number;
  lastUpdated: string;
  totalOutput: number;
}

export default function ProcessingProgressesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProcessingBatchProgress[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const pageSize = 6; // Hiển thị 6 batch mỗi trang

  const [openModal, setOpenModal] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<ProcessingBatchProgress | null>(null);
  const [progressDate, setProgressDate] = useState(new Date().toISOString().split("T")[0]);
  const [outputQuantity, setOutputQuantity] = useState("");
  const [outputUnit, setOutputUnit] = useState("kg");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [progressRes, batchRes] = await Promise.all([
      getAllProcessingBatchProgresses(),
      getAllProcessingBatches()
    ]);
    setData(progressRes);
    setBatches(batchRes ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const batchCode = searchParams.get("batchCode");
    if (batchCode) setSearch(batchCode);
    fetchData();
  }, []);

  // Nhóm progress theo batch
  const groupProgressesByBatch = (): BatchProgressGroup[] => {
    const grouped: Record<string, BatchProgressGroup> = {};

    data.forEach((progress) => {
      if (!progress.batchId) return;

      if (!grouped[progress.batchId]) {
        grouped[progress.batchId] = {
          batchId: progress.batchId,
          batchCode: progress.batchCode,
          progresses: [],
          totalSteps: 0,
          completedSteps: 0,
          latestStep: 0,
          lastUpdated: progress.progressDate,
          totalOutput: 0,
        };
      }

      const group = grouped[progress.batchId];
      group.progresses.push(progress);
      group.latestStep = Math.max(group.latestStep, progress.stepIndex ?? 0);
      group.completedSteps = group.progresses.length;
      group.lastUpdated = new Date(progress.progressDate) > new Date(group.lastUpdated) 
        ? progress.progressDate 
        : group.lastUpdated;
      group.totalOutput += Number(progress.outputQuantity) || 0;
    });

    // Sắp xếp progresses trong mỗi group theo stepIndex
    Object.values(grouped).forEach(group => {
      group.progresses.sort((a, b) => (a.stepIndex ?? 0) - (b.stepIndex ?? 0));
    });

    return Object.values(grouped);
  };

  const batchGroups = groupProgressesByBatch();
  
  const filtered = batchGroups.filter((group) =>
    group.batchCode.toLowerCase().includes(search.toLowerCase())
  );

  const sortedFiltered = [...filtered].sort((a, b) => {
    // Sắp xếp theo ngày cập nhật mới nhất
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  const totalPages = Math.ceil(sortedFiltered.length / pageSize);
  const paged = showAll ? sortedFiltered : sortedFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdvanceProgress = async () => {
    if (!selectedProgress) {
      toast.error("Không có tiến trình được chọn.");
      return;
    }

    setIsSubmitting(true);

    try {
      await advanceToNextProcessingProgress(selectedProgress.batchId, {
        progressDate,
        outputQuantity: parseFloat(outputQuantity),
        outputUnit,
        photoFile: photoFile ?? undefined,
        videoFile: videoFile ?? undefined,
      });

      toast.success("Đã tạo bước tiếp theo thành công!");
      setOpenModal(false);
      await fetchData();
    } catch (error) {
      console.error("❌ Lỗi khi gọi API advanceToNextProcessingProgress:", error);
      toast.error("Có lỗi khi cập nhật tiến trình.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatWeight = (kg: number): string => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(2)} tấn`;
    if (kg >= 100) return `${(kg / 100).toFixed(1)} tạ`;
    return `${new Intl.NumberFormat("vi-VN").format(kg)} kg`;
  };

  const getProgressStatus = (group: BatchProgressGroup) => {
    const batch = batches.find(b => b.batchId === group.batchId);
    if (!batch) return { label: "Không xác định", color: "bg-gray-100 text-gray-700" };
    
    switch (batch.status) {
      case ProcessingStatus.NotStarted:
        return { label: "Chưa bắt đầu", color: "bg-yellow-100 text-yellow-700" };
      case ProcessingStatus.InProgress:
        return { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" };
      case ProcessingStatus.Completed:
        return { label: "Hoàn thành", color: "bg-green-100 text-green-700" };
      case ProcessingStatus.Cancelled:
        return { label: "Đã hủy", color: "bg-red-100 text-red-700" };
      default:
        return { label: "Không xác định", color: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <PageTitle
            title="Quản lý tiến trình sơ chế"
            subtitle="Theo dõi và cập nhật tiến trình xử lý cà phê"
          />
          <Button
            onClick={() => router.push("/dashboard/farmer/processing/progresses/create")}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm tiến trình
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng lô</p>
                <p className="text-2xl font-bold text-gray-900">{batchGroups.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng tiến trình</p>
                <p className="text-2xl font-bold text-green-600">{data.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Hôm nay</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.filter(p => {
                    const today = new Date().toDateString();
                    const progressDate = new Date(p.progressDate).toDateString();
                    return today === progressDate;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Đã tìm thấy</p>
                <p className="text-2xl font-bold text-orange-600">{filtered.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Search className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-600" />
                  Tìm kiếm
                </h2>
          <div className="relative">
            <Input
              placeholder="Tìm kiếm mã lô..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
                    className="pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Hiển thị</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowAll(false)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      !showAll
                        ? "bg-green-100 border-green-300 text-green-700"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Phân trang</span>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {pageSize}/trang
                      </span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowAll(true)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      showAll
                        ? "bg-green-100 border-green-300 text-green-700"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tất cả</span>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {filtered.length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách tiến trình</h2>
                <p className="text-gray-600 mt-1">
                  Hiển thị {paged.length} trong tổng số {filtered.length} lô
                  {!showAll && ` (${pageSize} lô/trang)`}
                </p>
          </div>

          {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
          ) : paged.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy lô nào</h3>
                  <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm tiến trình mới.</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paged.map((group) => {
                      const statusInfo = getProgressStatus(group);
                      return (
                        <div
                          key={group.batchId}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg group flex flex-col h-full"
                        >
                          <div className="p-6 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">Mã lô : {group.batchCode}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                 
                                </div>
                              </div>
                              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                            
                            <div className="space-y-3 flex-grow">
                              {/* Progress Steps */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Tiến độ:</span>
                                  <span className="font-medium text-gray-900">
                                    {group.completedSteps} bước
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(group.completedSteps / Math.max(group.latestStep, 1)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Latest Step */}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Bước hiện tại:</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  Bước {group.latestStep}
                                </span>
                              </div>

                              {/* Total Output */}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Package className="w-4 h-4 text-green-600" />
                                <span className="font-medium">Tổng sản lượng:</span>
                                <span>{formatWeight(group.totalOutput)}</span>
                              </div>

                              {/* Last Updated */}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">Cập nhật:</span>
                                <span>{new Date(group.lastUpdated).toLocaleDateString('vi-VN')}</span>
                              </div>

                              {/* Status */}
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </div>
                            </div>

                            {/* Progress Steps Preview */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">Các bước đã hoàn thành:</h4>
                                <div className="space-y-1">
                                  {group.progresses.slice(0, 3).map((progress, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                      <button
                                        onClick={() => router.push(`/dashboard/farmer/processing/progresses/${progress.progressId}`)}
                                        className="hover:text-blue-600 hover:underline transition-colors duration-200 text-left"
                                      >
                                        Bước {progress.stepIndex}: {progress.stageName}
                                      </button>
                                    </div>
                                  ))}
                                  {group.progresses.length > 3 && (
                                    <div className="text-xs text-gray-500">
                                      +{group.progresses.length - 3} bước khác
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                                className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                onClick={() => router.push(`/dashboard/farmer/processing/progresses/${group.batchId}`)}
                        >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                        </Button>
                            <Button
                              variant="outline"
                              size="sm"
                                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                              onClick={() => {
                                  const latestProgress = group.progresses[group.progresses.length - 1];
                                  if (latestProgress) {
                                    setSelectedProgress(latestProgress);
                                setOpenModal(true);
                                  }
                              }}
                            >
                                <TrendingUp className="w-4 h-4" />
                                Tiếp tục
                            </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {!showAll && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2"
                      >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
          )}
        </div>
              )}
            </div>
          </div>
        </div>

        {/* Advance Progress Modal */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Cập nhật tiến trình cho lô: {selectedProgress?.batchCode}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày tiến trình
                </label>
                <Input
                  type="date"
                  value={progressDate}
                  onChange={(e) => setProgressDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sản lượng
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={outputQuantity}
                    onChange={(e) => setOutputQuantity(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn vị
                  </label>
                  <select
                    value={outputUnit}
                    onChange={(e) => setOutputUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">kg</option>
                    <option value="tạ">tạ</option>
                    <option value="tấn">tấn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh (tùy chọn)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="w-full"
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video (tùy chọn)
                </label>
                <Input
                  type="file"
                  accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenModal(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAdvanceProgress}
                  disabled={isSubmitting || !outputQuantity}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
