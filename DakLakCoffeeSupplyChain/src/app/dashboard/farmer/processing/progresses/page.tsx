"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllProcessingBatchProgresses,
  advanceToNextProcessingProgress,
  ProcessingBatchProgress,
} from "@/lib/api/processingBatchProgresses";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { ProcessingStatus } from "@/lib/constrant/batchStatus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";

export default function ProcessingProgressesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProcessingBatchProgress[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const [openModal, setOpenModal] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<ProcessingBatchProgress | null>(null);
  const [progressDate, setProgressDate] = useState(new Date().toISOString().split("T")[0]);
  const [outputQuantity, setOutputQuantity] = useState("");
  const [outputUnit, setOutputUnit] = useState("kg");
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);

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

  const filtered = data.filter((d) =>
    d.batchCode.toLowerCase().includes(search.toLowerCase())
  );

  const sortedFiltered = [...filtered].sort((a, b) => {
    const batchCompare = a.batchCode.localeCompare(b.batchCode);
    return batchCompare !== 0 ? batchCompare : (a.stepIndex ?? 0) - (b.stepIndex ?? 0);
  });

  const totalPages = Math.ceil(sortedFiltered.length / pageSize);
  const paged = sortedFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAdvanceProgress = async () => {
    if (!selectedProgress) {
      toast.error("Không có tiến trình được chọn.");
      return;
    }

    console.log("✅ Tiến trình hiện tại:", {
      batchId: selectedProgress.batchId,
      stageId: selectedProgress.stageId,
      stageName: selectedProgress.stageName,
      stepIndex: selectedProgress.stepIndex,
    });

    try {
      await advanceToNextProcessingProgress(selectedProgress.batchId, {
        progressDate,
        outputQuantity: parseFloat(outputQuantity),
        outputUnit,
        photoUrl: photoUrl || null,
        videoUrl: videoUrl || null,
      });

      toast.success("Đã tạo bước tiếp theo thành công!");
      setOpenModal(false);
      location.reload();
    } catch (error) {
      console.error("❌ Lỗi khi gọi API advanceToNextProcessingProgress:", error);
      toast.error("Có lỗi khi cập nhật tiến trình.");
    }
  };
const latestStepByBatchId: Record<string, number> = {};
data.forEach((p) => {
  if (!p.batchId) return;
  const step = p.stepIndex ?? 0;
  if (!latestStepByBatchId[p.batchId] || step > latestStepByBatchId[p.batchId]) {
    latestStepByBatchId[p.batchId] = step;
  }
});

const batchStatusMap: Record<string, number> = {};
batches.forEach((b) => {
  batchStatusMap[b.batchId] = b.status;
});
  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Tìm kiếm tiến trình</h2>
          <div className="relative">
            <Input
              placeholder="Tìm kiếm mã lô..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </aside>

      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => router.push("/dashboard/farmer/processing/progresses/create")}>+ Thêm tiến trình</Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Đang tải dữ liệu...</div>
          ) : paged.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Không có tiến trình nào</div>
          ) : (
            <table className="w-full text-sm table-auto">
              <thead className="bg-gray-100 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Mã lô</th>
                  <th className="px-4 py-3 text-left">Công đoạn</th>
                  <th className="px-4 py-3 text-left">Tiến trình</th>
                  <th className="px-4 py-3 text-left">Ngày thực hiện</th>
                  <th className="px-4 py-3 text-left">Người cập nhật</th>
                  <th className="px-4 py-3 text-left">Ngày cập nhật</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>
            <tbody>
  {Object.entries(
    paged.reduce((acc, curr) => {
      if (!curr.batchId) return acc;
      if (!acc[curr.batchId]) acc[curr.batchId] = [];
      acc[curr.batchId].push(curr);
      return acc;
    }, {} as Record<string, ProcessingBatchProgress[]>)
  ).map(([batchId, progressesRaw]) => {
    const progresses = [...progressesRaw].sort((a, b) => (a.stepIndex ?? 0) - (b.stepIndex ?? 0));
    const maxStep = latestStepByBatchId[batchId];

    return progresses.map((item, idx) => (
      <tr key={item.progressId} className="border-t hover:bg-gray-50 transition">
        {idx === 0 && (
          <td className="px-4 py-3" rowSpan={progresses.length}>
            {item.batchCode}
          </td>
        )}
        <td className="px-4 py-3">{item.stageName}</td>
        <td className="px-4 py-3">
          {item.stepIndex ?? <span className="text-gray-400 italic">Chưa có</span>}
        </td>
        <td className="px-4 py-3">
          {new Date(item.progressDate).toLocaleDateString("vi-VN")}
        </td>
        <td className="px-4 py-3">
          {item.updatedByName ?? <span className="text-gray-400 italic">-</span>}
        </td>
        <td className="px-4 py-3">
          {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
        </td>
        <td className="px-4 py-3">
          {item.stepIndex === maxStep &&
            batchStatusMap[item.batchId] !== ProcessingStatus.Completed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedProgress(item);
                  setOpenModal(true);
                }}
              >
                Cập nhật
              </Button>
            )}
        </td>
      </tr>
    ));
  })}
</tbody>


            </table>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedFiltered.length)} trong {sortedFiltered.length} tiến trình
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}><ChevronLeft className="w-4 h-4" /></Button>
              {[...Array(totalPages).keys()].map((_, i) => {
                const page = i + 1;
                return (
                  <Button key={page} onClick={() => setCurrentPage(page)} className={`rounded-md px-3 py-1 text-sm ${page === currentPage ? "bg-black text-white" : "bg-white text-black border"}`}>{page}</Button>
                );
              })}
              <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cập nhật tiến trình kế tiếp</DialogTitle>
              <p className="text-sm text-muted-foreground">Công đoạn hiện tại: <b>{selectedProgress?.stageName}</b></p>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Ngày thực hiện</label>
                <Input type="date" value={progressDate} onChange={(e) => setProgressDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Sản lượng đầu ra</label>
                <Input type="number" value={outputQuantity} onChange={(e) => setOutputQuantity(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Đơn vị</label>
                <Input value={outputUnit} onChange={(e) => setOutputUnit(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Ảnh (URL)</label>
                <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Video (URL)</label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              </div>
              <div className="pt-2 flex justify-end">
                <Button onClick={handleAdvanceProgress}>Xác nhận</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
