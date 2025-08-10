"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getProcessingBatchById,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import { 
  getEvaluationsByBatchId, 
  ProcessingBatchEvaluation,
  getAverageScoreByBatch,
  createEvaluation,
  CreateEvaluationPayload
} from "@/lib/api/processingBatchEvaluations";
import StatusBadge from "@/components/processing-batches/StatusBadge";
import { Loader, Star, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function ViewProcessingBatchManager() {
  const { id } = useParams();
  const [batch, setBatch] = useState<ProcessingBatch | null>(null);
  const [evaluations, setEvaluations] = useState<ProcessingBatchEvaluation[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [openEvaluationDialog, setOpenEvaluationDialog] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    score: 5,
    note: "",
    evaluationDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (typeof id === "string") {
        setLoading(true);
        try {
          const [batchData, evaluationsData, avgScore] = await Promise.all([
            getProcessingBatchById(id),
            getEvaluationsByBatchId(id),
            getAverageScoreByBatch(id),
          ]);
          setBatch(batchData);
          setEvaluations(evaluationsData || []);
          setAverageScore(avgScore);
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu:", error);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;

    try {
      const payload: CreateEvaluationPayload = {
        batchId: batch.batchId,
        evaluatorId: "current-user-id", // Sẽ lấy từ context
        score: evaluationForm.score,
        note: evaluationForm.note,
        evaluationDate: evaluationForm.evaluationDate,
      };

      const created = await createEvaluation(payload);
      if (created) {
        setEvaluations(prev => [...prev, created]);
        // Cập nhật điểm trung bình
        const newAvg = await getAverageScoreByBatch(batch.batchId);
        setAverageScore(newAvg);
        setOpenEvaluationDialog(false);
        setEvaluationForm({
          score: 5,
          note: "",
          evaluationDate: new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo đánh giá:", error);
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

  const renderStars = (score: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(score) 
            ? "text-yellow-400 fill-current" 
            : i < score 
            ? "text-yellow-400 fill-current opacity-50" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader className="animate-spin mr-2" /> Đang tải dữ liệu...
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center text-gray-500 py-10">
        Không tìm thấy lô chế biến.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">
        Chi tiết lô chế biến
      </h1>

      {/* Thông tin chính */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">Mã lô:</span>{" "}
          {batch.batchCode}
        </div>
        <div>
          <span className="font-medium text-gray-600">Mã hệ thống:</span>{" "}
          {batch.systemBatchCode}
        </div>
        <div>
          <span className="font-medium text-gray-600">Mùa vụ:</span>{" "}
          {batch.cropSeasonName}
        </div>
        <div>
          <span className="font-medium text-gray-600">Nông dân:</span>{" "}
          {batch.farmerName}
        </div>
        <div>
          <span className="font-medium text-gray-600">Phương pháp chế biến:</span>{" "}
          {batch.methodName}
        </div>
        <div>
          <span className="font-medium text-gray-600">Trạng thái:</span>{" "}
          <StatusBadge status={batch.status} />
        </div>
        <div>
          <span className="font-medium text-gray-600">Khối lượng vào:</span>{" "}
          {batch.totalInputQuantity} kg
        </div>
        <div>
          <span className="font-medium text-gray-600">Khối lượng ra:</span>{" "}
          {batch.totalOutputQuantity} kg
        </div>
        <div>
          <span className="font-medium text-gray-600">Ngày tạo:</span>{" "}
          {new Date(batch.createdAt).toLocaleString("vi-VN")}
        </div>
      </div>

      {/* Đánh giá */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Đánh giá chất lượng
          </h2>
          <Button
            onClick={() => setOpenEvaluationDialog(true)}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm đánh giá
          </Button>
        </div>

        {/* Điểm trung bình */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Điểm trung bình</p>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-gray-900 mr-2">
                  {averageScore.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">/ 10</span>
              </div>
            </div>
            <div className="flex">
              {renderStars(averageScore)}
            </div>
          </div>
        </div>

        {/* Danh sách đánh giá */}
        {evaluations.length > 0 ? (
          <div className="space-y-3">
            {evaluations.map((evaluation) => (
              <div key={evaluation.evaluationId} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-3">
                        {renderStars(evaluation.score)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(evaluation.score)}`}>
                        {evaluation.score}/10 - {getScoreLabel(evaluation.score)}
                      </span>
                    </div>
                    {evaluation.note && (
                      <p className="text-sm text-gray-700 mb-2 flex items-start">
                        <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        {evaluation.note}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Đánh giá bởi: {evaluation.evaluatorName}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(evaluation.evaluationDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có đánh giá nào</p>
            <p className="text-sm">Hãy thêm đánh giá đầu tiên cho lô này</p>
          </div>
        )}
      </div>

      {/* Tiến độ chế biến */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Tiến độ chế biến
        </h2>
        {batch.progresses && batch.progresses.length > 0 ? (
          <table className="w-full text-sm table-auto border">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="px-3 py-2 text-left">Tên giai đoạn</th>
                <th className="px-3 py-2 text-left">Chi tiết giai đoạn</th>
                <th className="px-3 py-2 text-left">Khối lượng đầu ra</th>
              </tr>
            </thead>
            <tbody>
              {batch.progresses.map((progress, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{progress.stageName}</td>
                  <td className="px-3 py-2">{progress.stageDescription}</td>
                  <td className="px-3 py-2">
                    {progress.outputQuantity} {progress.outputUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Chưa có tiến độ nào
          </div>
        )}
      </div>

      {/* Sản phẩm */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Sản phẩm</h2>
        {batch.products && batch.products.length > 0 ? (
          <table className="w-full text-sm table-auto border">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="px-3 py-2 text-left">Tên sản phẩm</th>
                <th className="px-3 py-2 text-left">Khối lượng</th>
                <th className="px-3 py-2 text-left">Đơn vị</th>
              </tr>
            </thead>
            <tbody>
              {batch.products.map((product, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{product.name}</td>
                  <td className="px-3 py-2">{product.quantity}</td>
                  <td className="px-3 py-2">{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Chưa có sản phẩm nào
          </div>
        )}
      </div>

      {/* Dialog thêm đánh giá */}
      <Dialog open={openEvaluationDialog} onOpenChange={setOpenEvaluationDialog}>
        <DialogContent className="max-w-md">
          <DialogTitle>Thêm đánh giá mới</DialogTitle>
          <form onSubmit={handleEvaluationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm số (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={evaluationForm.score}
                onChange={(e) => setEvaluationForm(prev => ({ ...prev, score: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={evaluationForm.note}
                onChange={(e) => setEvaluationForm(prev => ({ ...prev, note: e.target.value }))}
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
                value={evaluationForm.evaluationDate}
                onChange={(e) => setEvaluationForm(prev => ({ ...prev, evaluationDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Thêm đánh giá
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEvaluationDialog(false)}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 