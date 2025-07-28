"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllProcessingBatchProgresses,
  ProcessingBatchProgress,
} from "@/lib/api/processingBatchProgress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function ProcessingProgressesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProcessingBatchProgress[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

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
  // Sắp xếp theo batchCode, rồi đến stepIndex tăng dần
  const sortedFiltered = [...filtered].sort((a, b) => {
    const batchCompare = a.batchCode.localeCompare(b.batchCode);
    if (batchCompare !== 0) return batchCompare;
    return (a.stepIndex ?? 0) - (b.stepIndex ?? 0);
  });
  const totalPages = Math.ceil(sortedFiltered.length / pageSize);
  const paged = sortedFiltered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6"> 
      {/* Sidebar */}
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">
            Tìm kiếm tiến trình
          </h2>
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

      {/* Main content */}
      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() =>
                router.push("/dashboard/farmer/processing/progresses/create")
              }
            >
              + Thêm tiến trình
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Không có tiến trình nào
            </div>
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
                </tr>
              </thead>
              <tbody>
              {Object.entries(  
                paged.reduce((acc, curr) => {
                  if (!curr.batchId) return acc; // Bỏ qua nếu thiếu batchId
                  if (!acc[curr.batchId]) acc[curr.batchId] = [];
                  acc[curr.batchId].push(curr);
                  return acc;
                }, {} as Record<string, ProcessingBatchProgress[]>)
              ).map(([batchId, progresses]) =>
                progresses.map((item, idx) => (
                  <tr key={item.progressId} className="border-t hover:bg-gray-50 transition">
                    {/* Hiển thị batchCode ở dòng đầu tiên của mỗi nhóm */}
                    {idx === 0 ? (
                      <td className="px-4 py-3" rowSpan={progresses.length}>
                        {item.batchCode}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">{item.stageName}</td>
                    <td className="px-4 py-3">
                      <div>
                        {item.stepIndex ?? (
                          <span className="text-gray-400 italic">Chưa có</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.progressDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      {item.updatedByName ?? (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
             </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, sortedFiltered.length)} trong{" "}
              {sortedFiltered.length} tiến trình
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
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
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md px-3 py-1 text-sm ${
                      page === currentPage
                        ? "bg-black text-white"
                        : "bg-white text-black border"
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
