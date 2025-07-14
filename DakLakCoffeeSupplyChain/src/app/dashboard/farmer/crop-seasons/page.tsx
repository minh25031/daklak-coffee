"use client";

import { useEffect, useState } from "react";
import {
  getCropSeasonsForCurrentUser,
  CropSeasonListItem,
} from "@/lib/api/cropSeasons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CropSeasonStatusValue } from "@/lib/constrant/cropSeasonStatus";
import { cn } from "@/lib/utils";
import CropSeasonCard from "@/components/crop-seasons/CropSeasonCard";
import FilterStatusPanel from "@/components/crop-seasons/FilterStatusPanel";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";

export default function FarmerCropSeasonsPage() {
  useAuthGuard(["farmer"]);
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const pageSize = 10;

  const handleSeasonDeleted = (deletedId: string) => {
    setCropSeasons((prev) =>
      prev.filter((season) => season.cropSeasonId !== deletedId)
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getCropSeasonsForCurrentUser({
          search,
          status: selectedStatus ?? undefined,
          page: currentPage,
          pageSize,
        });

        setCropSeasons(data);
      } catch (err) {
        toast.error("Không thể tải danh sách mùa vụ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [search, selectedStatus, currentPage]);

  const filteredSeasons = cropSeasons.filter(
    (season) =>
      (!selectedStatus || season.status === selectedStatus) &&
      (!search ||
        season.seasonName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredSeasons.length / pageSize);
  const pagedSeasons = filteredSeasons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusCounts = cropSeasons.reduce<
    Record<CropSeasonStatusValue, number>
  >(
    (acc, season) => {
      const status = season.status as CropSeasonStatusValue;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {
      Active: 0,
      Paused: 0,
      Completed: 0,
      Cancelled: 0,
    }
  );

  const router = useRouter();
  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Tìm kiếm mùa vụ</h2>
          <div className="relative">
            <Input
              placeholder="Tìm kiếm..."
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

      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() =>
                router.push("/dashboard/farmer/crop-seasons/create")
              }
            >
              + Tạo mùa vụ mới
            </Button>
          </div>
          {isLoading ? (
            <LoadingSpinner />
          ) : pagedSeasons.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              Không tìm thấy mùa vụ nào
            </p>
          ) : (
            <table className="w-full text-sm table-auto">
              <thead className="bg-gray-100 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Tên mùa vụ</th>
                  <th className="px-4 py-3 text-center">Diện tích (ha)</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thời gian</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedSeasons.map((season) => (
                  <CropSeasonCard
                    key={season.cropSeasonId}
                    season={season}
                    onDeleted={handleSeasonDeleted}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredSeasons.length)} trong{" "}
              {filteredSeasons.length} mùa vụ
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
                    className={cn(
                      "rounded-md px-3 py-1 text-sm",
                      page === currentPage
                        ? "bg-black text-white"
                        : "bg-white text-black border"
                    )}
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
