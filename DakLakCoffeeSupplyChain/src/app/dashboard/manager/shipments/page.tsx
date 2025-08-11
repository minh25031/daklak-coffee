"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Eye, Pencil, Trash2, Search } from "lucide-react";
import {
  ShipmentDeliveryStatusMap,
  ShipmentDeliveryStatusValue,
} from "@/lib/constants/shipmentDeliveryStatus";
import FilterStatusPanel from "@/components/ui/filterStatusPanel";
import { cn } from "@/lib/utils";
import { ShipmentViewAllDto, getAllShipments, softDeleteShipment } from "@/lib/api/shipments";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentViewAllDto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<ShipmentDeliveryStatusValue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<ShipmentViewAllDto | null>(null);

  useEffect(() => {
    getAllShipments().then((data) => {
      if (Array.isArray(data)) setShipments(data);
    });
  }, []);

  const filtered = useMemo(() => {
    return shipments.filter((s) => {
      const matchesStatus =
        !selectedStatus || s.deliveryStatus === selectedStatus;
      const matchesSearch =
        !search ||
        [s.shipmentCode, s.orderCode, s.deliveryStaffName, s.deliveryStatus]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      // Date range filter: shippedAt – receivedAt
      const shipped = s.shippedAt ? new Date(s.shippedAt) : null;
      const received = s.receivedAt ? new Date(s.receivedAt) : null;

      const matchesStartDate =
        !startDate ||
        (shipped && shipped >= startDate) ||
        (received && received >= startDate);

      const matchesEndDate =
        !endDate ||
        (received && received <= endDate) ||
        (shipped && shipped <= endDate);

      return (
        matchesStatus && matchesSearch && matchesStartDate && matchesEndDate
      );
    });
  }, [shipments, search, selectedStatus, startDate, endDate]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedShipments = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusCounts = shipments.reduce<
    Record<ShipmentDeliveryStatusValue, number>
  >(
    (acc, s) => {
      const status = s.deliveryStatus as ShipmentDeliveryStatusValue;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {
      Pending: 0,
      InTransit: 0,
      Delivered: 0,
      Failed: 0,
      Returned: 0,
      Canceled: 0,
    }
  );

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "";
    const date = new Date(iso);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">
            Tìm kiếm lô giao hàng
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <FilterStatusPanel<ShipmentDeliveryStatusValue>
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusCounts={statusCounts}
          statusMap={ShipmentDeliveryStatusMap}
        />
      </aside>

      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex gap-4 items-center">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Từ ngày
                </label>
                <Input
                  type="date"
                  value={startDate ? startDate.toISOString().split("T")[0] : ""}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value ? new Date(e.target.value) : null
                    )
                  }
                  className="w-[150px]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Đến ngày
                </label>
                <Input
                  type="date"
                  value={endDate ? endDate.toISOString().split("T")[0] : ""}
                  onChange={(e) =>
                    setEndDate(e.target.value ? new Date(e.target.value) : null)
                  }
                  className="w-[150px]"
                />
              </div>
            </div>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => router.push("/dashboard/manager/shipments/create")}
            >
              + Tạo lô giao mới
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-sm text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Mã lô giao</th>
                  <th className="px-4 py-2 text-left">Đơn hàng</th>
                  <th className="px-4 py-2 text-left">Nhân viên giao</th>
                  <th className="px-4 py-2 text-center">Trạng thái</th>
                  <th className="px-4 py-2 text-center">
                    Thời gian (Giao – Nhận)
                  </th>
                  <th className="px-4 py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedShipments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-sm text-muted-foreground"
                    >
                      Không tìm thấy lô giao nào
                    </td>
                  </tr>
                ) : (
                  pagedShipments.map((s) => (
                    <tr
                      key={s.shipmentId}
                      className="border-t text-sm hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        {s.shipmentCode}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {s.orderCode}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {s.deliveryStaffName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        {(() => {
                          const meta =
                            ShipmentDeliveryStatusMap[s.deliveryStatus];
                          return (
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                `bg-${meta.color}-100 text-${meta.color}-700`
                              )}
                            >
                              {meta.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex justify-center items-center text-sm font-mono">
                          {s.shippedAt ? (
                            <>
                              <span>{formatDateTime(s.shippedAt)}</span>
                              <span className="mx-1 text-gray-500">–</span>
                              <span>{formatDateTime(s.receivedAt)}</span>
                            </>
                          ) : (
                            ""
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-[2px] justify-center">
                          <Tooltip content="Xem chi tiết">
                            <Button
                              variant="ghost"
                              className="p-[2px] w-7 h-7"
                              onClick={() =>
                                router.push(
                                  `/dashboard/manager/shipments/${s.shipmentId}`
                                )
                              }
                            >
                              <Eye className="w-4 h-4 text-blue-500" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Chỉnh sửa">
                            <Button
                              variant="ghost"
                              className="p-[2px] w-7 h-7"
                              onClick={() =>
                                router.push(
                                  `/dashboard/manager/shipments/${s.shipmentId}/edit`
                                )
                              }
                            >
                              <Pencil className="w-4 h-4 text-yellow-500" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Xoá">
                            <Button
                              variant="ghost"
                              className="p-[2px] w-7 h-7"
                              onClick={() => {
                                setShipmentToDelete(s);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </Tooltip>
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 px-4 py-2 bg-gray-50 border rounded-md text-sm text-gray-700">
            <div className="text-sm text-gray-600">
              Đang hiển thị{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>
              –
              <span className="font-medium">
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              / {filtered.length} lô giao
            </div>
            <div className="flex gap-2 justify-end mt-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Trước
              </Button>
              <span className="flex items-center px-2">
                Trang <span className="mx-1 font-semibold">{currentPage}</span>{" "}
                / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Sau →
              </Button>
            </div>
          </div>
        )}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xoá lô giao?</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xoá lô giao <strong>{shipmentToDelete?.shipmentCode}</strong>? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Huỷ</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!shipmentToDelete) return;
                  try {
                    await softDeleteShipment(shipmentToDelete.shipmentId);
                    setShipments(prev => prev.filter(x => x.shipmentId !== shipmentToDelete.shipmentId));
                  } finally {
                    setShowDeleteDialog(false);
                    setShipmentToDelete(null);
                  }
                }}
              >
                Xoá
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
