"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllProcessingBatchProgresses,
  ProcessingBatchProgress,
} from "@/lib/api/processingBatchProgress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Plus, Package, Calendar, Clock, Eye, Edit, Filter, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";

export default function ProcessingProgressesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProcessingBatchProgress[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    // Lấy batchCode từ query string nếu có
    const batchCode = searchParams.get("batchCode");
    if (batchCode) {
      setSearch(batchCode);
    }
    const fetchData = async () => {
      setLoading(true);
      setData(await getAllProcessingBatchProgresses());
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lọc theo batchCode
  const filtered = data.filter((d) =>
    d.batchCode.toLowerCase().includes(search.toLowerCase())
  );

  // Nhóm theo batchId
  const groupedByBatch = filtered.reduce((acc, curr) => {
    if (!curr.batchId) return acc;
    if (!acc[curr.batchId]) {
      acc[curr.batchId] = {
        batchId: curr.batchId,
        batchCode: curr.batchCode,
        progresses: []
      };
    }
    acc[curr.batchId].progresses.push(curr);
    return acc;
  }, {} as Record<string, { batchId: string; batchCode: string; progresses: ProcessingBatchProgress[] }>);

  // Chuyển đổi thành array và sắp xếp
  const batchGroups = Object.values(groupedByBatch).sort((a, b) => 
    a.batchCode.localeCompare(b.batchCode)
  );

  // Phân trang
  const totalPages = Math.ceil(batchGroups.length / pageSize);
  const pagedGroups = showAll ? batchGroups : batchGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Tính toán stats
  const totalBatches = batchGroups.length;
  const totalProgresses = filtered.length;
  const completedProgresses = filtered.filter(p => p.stepIndex && p.stepIndex > 0).length;
  const pendingProgresses = totalProgresses - completedProgresses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <PageTitle
            title="Quản lý tiến trình sơ chế"
            subtitle="Theo dõi và quản lý các tiến trình sơ chế cà phê"
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
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng lô</p>
                <p className="text-2xl font-bold text-gray-900">{totalBatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiến trình</p>
                <p className="text-2xl font-bold text-gray-900">{totalProgresses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang chờ</p>
                <p className="text-2xl font-bold text-gray-900">{pendingProgresses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{completedProgresses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Tìm kiếm</h2>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Tìm kiếm mã lô..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showAll"
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="showAll" className="text-sm text-gray-700">
                    Hiển thị tất cả
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : pagedGroups.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Không có dữ liệu</h3>
                    <p className="text-gray-600">Không tìm thấy tiến trình nào phù hợp</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pagedGroups.map((group) => (
                  <div key={group.batchId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{group.batchCode}</h3>
                          <p className="text-green-100 text-sm">
                            {group.progresses.length} tiến trình
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-white/80" />
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Các bước đã hoàn thành:</h4>
                        <div className="space-y-1">
                          {group.progresses.slice(0, 3).map((progress, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>Bước {progress.stepIndex}: {progress.stageName}</span>
                            </div>
                          ))}
                          {group.progresses.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{group.progresses.length - 3} bước khác
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Cập nhật: {new Date(group.progresses[0]?.updatedAt || '').toLocaleDateString('vi-VN')}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/farmer/processing/progresses/${group.progresses[0]?.progressId}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/farmer/processing/batches/${group.batchId}`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !showAll && totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, batchGroups.length)} trong{" "}
                    {batchGroups.length} lô
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {[...Array(totalPages).keys()].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`${
                            page === currentPage
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
