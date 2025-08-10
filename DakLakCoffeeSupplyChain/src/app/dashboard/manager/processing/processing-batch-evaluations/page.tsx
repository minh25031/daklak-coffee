"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { 
  getAllProcessingBatchEvaluations, 
  ProcessingBatchEvaluation,
  CreateEvaluationPayload,
  UpdateEvaluationPayload,
  getEvaluationStats,
  EvaluationStats,
  deleteEvaluation,
  createEvaluation,
  updateEvaluation,
  getEvaluationsByScoreRange,
  getEvaluationsByDateRange
} from "@/lib/api/processingBatchEvaluations";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { Star, Plus, Search, Filter, BarChart3, TrendingUp, Eye, Edit, Trash2, Calendar, Award } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function ManagerProcessingBatchEvaluationsPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<ProcessingBatchEvaluation[]>([]);
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editEvaluation, setEditEvaluation] = useState<ProcessingBatchEvaluation | null>(null);
  const [form, setForm] = useState({
    batchId: "",
    evaluatorId: "",
    score: 5,
    note: "",
    evaluationDate: new Date().toISOString().split('T')[0],
  });
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<{min: number, max: number} | null>(null);
  const [dateFilter, setDateFilter] = useState<{start: string, end: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [evaluationData, batchData, statsData] = await Promise.all([
          getAllProcessingBatchEvaluations(),
          getAllProcessingBatches(),
          getEvaluationStats(),
        ]);
        setEvaluations(evaluationData || []);
        setBatches(batchData || []);
        setStats(statsData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Lọc dữ liệu
  const filtered = evaluations.filter((evaluation) => {
    const batch = batches.find(b => b.batchId === evaluation.batchId);
    const matchesSearch = !search || 
      evaluation.batchCode.toLowerCase().includes(search.toLowerCase()) ||
      evaluation.evaluatorName.toLowerCase().includes(search.toLowerCase()) ||
      evaluation.note.toLowerCase().includes(search.toLowerCase());
    
    const matchesScore = !scoreFilter || 
      (evaluation.score >= scoreFilter.min && evaluation.score <= scoreFilter.max);
    
    const matchesDate = !dateFilter || 
      (evaluation.evaluationDate >= dateFilter.start && evaluation.evaluationDate <= dateFilter.end);
    
    return matchesSearch && matchesScore && matchesDate;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [search, scoreFilter, dateFilter]);

  const handleOpenCreate = () => {
    setEditEvaluation(null);
    setForm({
      batchId: batches[0]?.batchId || "",
      evaluatorId: "current-user-id", // Sẽ lấy từ context
      score: 5,
      note: "",
      evaluationDate: new Date().toISOString().split('T')[0],
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (evaluation: ProcessingBatchEvaluation) => {
    setEditEvaluation(evaluation);
    setForm({
      batchId: evaluation.batchId,
      evaluatorId: evaluation.evaluatorId,
      score: evaluation.score,
      note: evaluation.note,
      evaluationDate: evaluation.evaluationDate,
    });
    setOpenDialog(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editEvaluation) {
        const updated = await updateEvaluation(editEvaluation.evaluationId, {
          score: form.score,
          note: form.note,
          evaluationDate: form.evaluationDate,
        });
        if (updated) {
          setEvaluations(prev => prev.map(e => e.evaluationId === editEvaluation.evaluationId ? updated : e));
        }
      } else {
        const created = await createEvaluation({
          batchId: form.batchId,
          evaluatorId: form.evaluatorId,
          score: form.score,
          note: form.note,
          evaluationDate: form.evaluationDate,
        });
        if (created) {
          setEvaluations(prev => [...prev, created]);
        }
      }
      setOpenDialog(false);
    } catch (error) {
      console.error("Lỗi khi lưu đánh giá:", error);
    }
  };

  const handleDelete = async (evaluationId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      const success = await deleteEvaluation(evaluationId);
      if (success) {
        setEvaluations(prev => prev.filter(e => e.evaluationId !== evaluationId));
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600 bg-green-100";
    if (score >= 7) return "text-blue-600 bg-blue-100";
    if (score >= 5) return "text-yellow-600 bg-yellow-100";
    if (score >= 3) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Xuất sắc";
    if (score >= 7) return "Tốt";
    if (score >= 5) return "Trung bình";
    if (score >= 3) return "Kém";
    return "Rất kém";
  };

  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.batchId === batchId);
    return batch?.batchCode || `ID: ${batchId}`;
  };

  // Tạo dữ liệu cho StatsCards
  const statsData = [
    {
      title: "Tổng đánh giá",
      value: stats?.totalEvaluations || 0,
      icon: BarChart3,
      color: "blue"
    },
    {
      title: "Điểm trung bình",
      value: stats?.averageScore?.toFixed(1) || "0.0",
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Xuất sắc (9-10)",
      value: stats?.scoreDistribution?.excellent || 0,
      icon: Award,
      color: "purple"
    },
    {
      title: "Tốt (7-8)",
      value: stats?.scoreDistribution?.good || 0,
      icon: Star,
      color: "yellow"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Đánh giá Lô Chế biến</h1>
              <p className="text-gray-600 mt-1">Theo dõi và quản lý chất lượng các lô chế biến cà phê</p>
            </div>
            <Button
              onClick={handleOpenCreate}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm đánh giá
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã lô, người đánh giá..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số</label>
              <select
                value={scoreFilter ? `${scoreFilter.min}-${scoreFilter.max}` : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    const [min, max] = e.target.value.split('-').map(Number);
                    setScoreFilter({ min, max });
                  } else {
                    setScoreFilter(null);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả điểm</option>
                <option value="9-10">Xuất sắc (9-10)</option>
                <option value="7-8">Tốt (7-8)</option>
                <option value="5-6">Trung bình (5-6)</option>
                <option value="3-4">Kém (3-4)</option>
                <option value="1-2">Rất kém (1-2)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <input
                type="date"
                value={dateFilter?.start || ""}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <input
                type="date"
                value={dateFilter?.end || ""}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách đánh giá</h2>
              <p className="text-sm text-gray-600">
                Hiển thị {filtered.length} trong tổng số {evaluations.length} đánh giá
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đánh giá nào</h3>
              <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc thêm đánh giá mới.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã lô
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm số
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đánh giá
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((evaluation) => (
                    <tr key={evaluation.evaluationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{evaluation.batchCode}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {evaluation.evaluatorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(evaluation.score)}`}>
                          {evaluation.score}/10 - {getScoreLabel(evaluation.score)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs">
                          {evaluation.note || "Không có ghi chú"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(evaluation.evaluationDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(evaluation)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(evaluation.evaluationId)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {startIndex + 1} đến {Math.min(endIndex, filtered.length)} trong tổng số {filtered.length} đánh giá
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog for create/edit */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-md">
            <DialogTitle>
              {editEvaluation ? "Sửa đánh giá" : "Thêm đánh giá mới"}
            </DialogTitle>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lô chế biến
                </label>
                <select
                  name="batchId"
                  value={form.batchId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Chọn lô chế biến</option>
                  {batches.map((batch) => (
                    <option key={batch.batchId} value={batch.batchId}>
                      {batch.batchCode} - {batch.cropSeasonName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm số (1-10)
                </label>
                <input
                  type="number"
                  name="score"
                  min="1"
                  max="10"
                  step="0.1"
                  value={form.score}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập ghi chú đánh giá..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày đánh giá
                </label>
                <input
                  type="date"
                  name="evaluationDate"
                  value={form.evaluationDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {editEvaluation ? "Cập nhật" : "Tạo đánh giá"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  className="flex-1"
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