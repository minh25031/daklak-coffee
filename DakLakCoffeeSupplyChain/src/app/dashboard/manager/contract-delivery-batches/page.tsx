"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContractDeliveryBatchStatus,
  ContractDeliveryBatchStatusLabel,
} from "@/lib/constants/contractDeliveryBatchStatus";
import { formatDate, cn } from "@/lib/utils";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import {
  ContractDeliveryBatchViewAllDto,
  getAllContractDeliveryBatches,
} from "@/lib/api/contractDeliveryBatches";
import FilterDeliveryBatchStatusPanel from "@/components/contract-delivery-batches/FilterDeliveryBatchStatusPanel";

export function getDeliveryBatchStatusDisplay(
  status: ContractDeliveryBatchStatus | "ALL"
) {
  switch (status) {
    case "ALL":
      return {
        label: "Tất cả trạng thái",
        icon: <FileText className="w-4 h-4 text-gray-500" />,
        className: "bg-gray-100 text-gray-600",
      };
    case ContractDeliveryBatchStatus.Planned:
      return {
        label: "Chuẩn bị giao",
        icon: <Package className="w-4 h-4 text-purple-500" />,
        className: "bg-purple-100 text-purple-700",
      };
    case ContractDeliveryBatchStatus.InProgress:
      return {
        label: "Đang thực hiện",
        icon: <Truck className="w-4 h-4 text-green-500" />,
        className: "bg-green-100 text-green-700",
      };
    case ContractDeliveryBatchStatus.Fulfilled:
      return {
        label: "Hoàn thành",
        icon: <CheckCircle className="w-4 h-4 text-blue-500" />,
        className: "bg-blue-100 text-blue-700",
      };
    case ContractDeliveryBatchStatus.Cancelled:
      return {
        label: "Đã huỷ",
        icon: <XCircle className="w-4 h-4 text-red-500" />,
        className: "bg-red-100 text-red-700",
      };
    default:
      return {
        label: String(status),
        icon: <FileText className="w-4 h-4 text-gray-500" />,
        className: "bg-gray-100 text-gray-600",
      };
  }
}

export default function ContractDeliveryBatchesPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | ContractDeliveryBatchStatus
  >("ALL");
  const [data, setData] = useState<ContractDeliveryBatchViewAllDto[]>([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const result = await getAllContractDeliveryBatches();
        setData(result);
      } catch (err) {
        console.error("Không thể lấy được lô hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const filteredData = data.filter((batch) => {
    const matchesSearch = batch.deliveryBatchCode
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      selectedStatus === "ALL" || batch.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const statusList: (ContractDeliveryBatchStatus | "ALL")[] = [
    "ALL",
    ContractDeliveryBatchStatus.Planned,
    ContractDeliveryBatchStatus.InProgress,
    ContractDeliveryBatchStatus.Fulfilled,
    ContractDeliveryBatchStatus.Cancelled,
  ];

  const statusCounts: Record<string, number> = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus]);

  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
      {/* Sidebar */}
      <aside className="w-64 space-y-4">
        {/* Tìm kiếm */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">
            Tìm kiếm đợt giao
          </h2>
          <div className="relative">
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Bộ lọc trạng thái */}
        <FilterDeliveryBatchStatusPanel
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusCounts={statusCounts}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          {/* Header */}
          <div className="flex justify-end items-center">
            <Button className="bg-black text-white hover:bg-gray-800">
              + Tạo đợt giao hàng mới
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Mã đợt giao</th>
                  <th className="px-4 py-2 text-left">Mã hợp đồng</th>
                  <th className="px-4 py-2 text-center">Đợt</th>
                  <th className="px-4 py-2 text-center">Ngày dự kiến</th>
                  <th className="px-4 py-2 text-center">SL kế hoạch</th>
                  <th className="px-4 py-2 text-center">Trạng thái</th>
                  <th className="px-4 py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      Không có đợt giao hàng phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((batch) => (
                    <tr
                      key={batch.deliveryBatchId}
                      className="hover:bg-gray-50 border-t"
                    >
                      <td className="px-4 py-2">{batch.deliveryBatchCode}</td>
                      <td className="px-4 py-2">{batch.contractId}</td>
                      <td className="px-4 py-2 text-center">
                        {batch.deliveryRound}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {batch.expectedDeliveryDate
                          ? formatDate(batch.expectedDeliveryDate)
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {batch.totalPlannedQuantity ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                          {ContractDeliveryBatchStatusLabel[batch.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-[2px]">
                          <Button variant="ghost" className="w-7 h-7 p-[2px]">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" className="w-7 h-7 p-[2px]">
                            <Pencil className="w-4 h-4 text-yellow-500" />
                          </Button>
                          <Button variant="ghost" className="w-7 h-7 p-[2px]">
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

        {/* Pagination */}
        {filteredData.length > ITEMS_PER_PAGE && (
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Trước
            </Button>
            <span className="text-sm text-gray-600 px-2 pt-1">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau →
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
