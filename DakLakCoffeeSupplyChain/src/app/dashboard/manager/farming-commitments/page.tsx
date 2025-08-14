"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  FarmingCommitment,
  getBusinessCommitments,
} from "@/lib/api/farmingCommitments";
import { toast } from "sonner";
import {
  FarmingCommitmentStatusMap,
  FarmingCommitmentStatusValue,
} from "@/lib/constants/FarmingCommitmentStatus";
import FilterStatusPanel from "@/components/ui/filterStatusPanel";
import FarmingCommitmentCard from "@/components/farming-commitments/FarmingCommitmentCard";

export default function BusinessFarmingCommitmentPage() {
  const [farmingCommitments, setFarmingCommitments] = useState<
    FarmingCommitment[]
  >([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<FarmingCommitmentStatusValue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await getBusinessCommitments().catch((error) => {
      toast.error(getErrorMessage(error));
      return [];
    });
    setFarmingCommitments(data);
    setIsLoading(false);
  };

  const filteredCommitments = farmingCommitments.filter(
    (commitment) =>
      (!selectedStatus || commitment.status === selectedStatus) &&
      (!search ||
        commitment.commitmentName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCommitments.length / pageSize);
  const pagedCommitments = filteredCommitments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusCounts = farmingCommitments.reduce<
    Record<FarmingCommitmentStatusValue, number>
  >(
    (acc, commitment) => {
      const status = commitment.status as FarmingCommitmentStatusValue;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {
      Pending: 0,
      Active: 0,
      Completed: 0,
      Cancelled: 0,
      Breached: 0,
      Rejected: 0,
    }
  );

  return (
    <div className='flex bg-amber-200-50 p-6 gap-6'>
      {/* Sidebar */}
      <aside className='w-64 space-y-4'>
        {/* Search block */}
        <div className='bg-white rounded-xl shadow-sm p-4 space-y-4'>
          <h2 className='text-sm font-medium text-gray-700'>
            Tìm kiếm cam kết
          </h2>
          <div className='relative'>
            <Input
              placeholder='Tìm kiếm...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pr-10'
            />
            <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          </div>
        </div>

        <FilterStatusPanel<FarmingCommitmentStatusValue>
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusCounts={statusCounts}
          statusMap={FarmingCommitmentStatusMap}
        />
      </aside>

      {/* Main content */}
      <main className='flex-1 space-y-6'>
        <div className='bg-white rounded-xl shadow-sm p-4'>
          <table className='w-full text-sm table-auto'>
            <thead className='bg-gray-100 text-gray-700 font-medium'>
              <tr>
                <th className='px-4 py-3 text-left'>Tên cam kết</th>
                <th className='px-4 py-3 text-left'>Tên nông dân</th>
                <th className='px-4 py-3 text-left'>Tổng thành tiền</th>
                <th className='px-4 py-3 text-left'>Trạng thái</th>
                <th className='px-4 py-3 text-left'>Ngày lập cam kết</th>
                <th className='px-4 py-3 text-left'>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pagedCommitments.map((commitment) => (
                <FarmingCommitmentCard
                  key={commitment.commitmentId}
                  commitment={commitment}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className='flex justify-between items-center'>
            <span className='text-sm text-muted-foreground'>
              Hiển thị {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredCommitments.length)} trong{" "}
              {filteredCommitments.length} cam kết
            </span>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='icon'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='w-4 h-4' />
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
                variant='outline'
                size='icon'
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
