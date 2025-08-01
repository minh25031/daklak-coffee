"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllContracts, ContractViewAllDto } from "@/lib/api/contracts";
import FilterStatusPanel from "@/components/contracts/FilterContractStatusPanel";
import ContractCard from "@/components/contracts/ContractCard";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { softDeleteContract } from "@/lib/api/contracts";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractViewAllDto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const pageSize = 6;

  useEffect(() => {
    getAllContracts().then((data) => {
      if (Array.isArray(data)) setContracts(data);
    });
  }, []);

  const filtered = contracts.filter(
    (c) =>
      (!selectedStatus || c.status === selectedStatus) &&
      (!search ||
        [c.contractCode, c.contractTitle, c.buyerName]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedContracts = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusCounts = contracts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "NotStarted":
        return {
          label: "Chưa bắt đầu",
          className: "bg-gray-100 text-gray-600",
        };
      case "PreparingDelivery":
        return {
          label: "Chuẩn bị giao",
          className: "bg-purple-100 text-purple-700",
        };
      case "InProgress":
        return {
          label: "Đang thực hiện",
          className: "bg-green-100 text-green-700",
        };
      case "PartialCompleted":
        return {
          label: "Hoàn thành một phần",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "Completed":
        return { label: "Hoàn thành", className: "bg-blue-100 text-blue-700" };
      case "Cancelled":
        return { label: "Đã hủy", className: "bg-red-100 text-red-700" };
      case "Expired":
        return { label: "Quá hạn", className: "bg-orange-100 text-orange-700" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-600" };
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contractToDelete, setContractToDelete] =
    useState<ContractViewAllDto | null>(null);

  async function handleDelete() {
    if (!contractToDelete) return;
    try {
      await softDeleteContract(contractToDelete.contractId);
      setContracts((prev) =>
        prev.filter((c) => c.contractId !== contractToDelete.contractId)
      );
      setShowDeleteDialog(false);
      setContractToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xoá hợp đồng:", error);
    }
  }

  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">
            Tìm kiếm hợp đồng
          </h2>
          <div className="relative">
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
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
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => router.push("/dashboard/manager/contracts/create")}
            >
              + Tạo hợp đồng mới
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-sm text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Tên hợp đồng</th>
                  <th className="px-4 py-2 text-left">Đối tác</th>
                  <th className="px-4 py-2 text-left">Trạng thái</th>
                  <th className="px-4 py-2 text-left">Thời gian</th>
                  <th className="px-4 py-2 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedContracts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-sm text-muted-foreground"
                    >
                      Không tìm thấy hợp đồng nào
                    </td>
                  </tr>
                ) : (
                  pagedContracts.map((contract) => (
                    <tr
                      key={contract.contractId}
                      className="border-t text-sm hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{contract.contractTitle}</td>
                      <td className="px-4 py-2">{contract.buyerName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {(() => {
                          const { label, className } = getStatusDisplay(
                            contract.status
                          );
                          return (
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                className
                              )}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {contract.startDate && contract.endDate
                          ? `${new Date(contract.startDate).toLocaleDateString(
                              "vi-VN"
                            )} – ${new Date(
                              contract.endDate
                            ).toLocaleDateString("vi-VN")}`
                          : ""}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(
                                `/dashboard/manager/contracts/${contract.contractId}`
                              )
                            }
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(
                                `/dashboard/manager/contracts/${contract.contractId}/edit`
                              )
                            }
                          >
                            <Pencil className="w-4 h-4 text-yellow-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setContractToDelete(contract);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} trong{" "}
              {filtered.length} hợp đồng
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
              {[...Array(totalPages)].map((_, i) => {
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa hợp đồng?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa hợp đồng{" "}
              <strong>{contractToDelete?.contractTitle}</strong>? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
