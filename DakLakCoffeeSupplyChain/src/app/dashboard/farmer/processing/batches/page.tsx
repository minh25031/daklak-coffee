"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllProcessingBatches,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import FilterStatusPanel from "@/components/processing-batches/FilterStatusPanel";
import ProcessingBatchCard from "@/components/processing-batches/ProcessingBatchCard";

export default function Batches() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setBatches(await getAllProcessingBatches());
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = batches.filter(
    (b) =>
      (!selectedStatus || b.status === selectedStatus) &&
      (!search || b.batchCode.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedBatches = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Đếm số lượng theo trạng thái
  const statusCounts = batches.reduce<Record<string, number>>((acc, batch) => {
    acc[batch.status] = (acc[batch.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
      {/* Sidebar */}
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">
            Tìm kiếm lô sơ chế
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
        <FilterStatusPanel
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusCounts={statusCounts}
        />
      </aside>
      {/* Main content */}
      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => router.push("/dashboard/farmer/processing/batches/create")}
            >
              + Thêm lô sơ chế
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : pagedBatches.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Không tìm thấy lô nào
            </div>
          ) : (
            <table className="w-full text-sm table-auto">
              <thead className="bg-gray-100 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Mã lô</th>
                  <th className="px-4 py-3 text-left">Mùa vụ</th>
                  <th className="px-4 py-3 text-left">Phương pháp</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedBatches.map((batch) => (
                  <ProcessingBatchCard key={batch.batchId} batch={batch} />
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} lô
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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