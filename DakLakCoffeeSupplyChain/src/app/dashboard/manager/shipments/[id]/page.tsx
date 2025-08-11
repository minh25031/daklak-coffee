"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Tooltip } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2 } from "lucide-react";
import { FiTruck } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as ShipmentsApi from "@/lib/api/shipments";
import type {
  ShipmentDetailViewDto,
  ShipmentViewDetailsDto,
} from "@/lib/api/shipments";
import { formatDate, formatQuantity } from "@/lib/utils";
import { ShipmentDeliveryStatusMap } from "@/lib/constants/shipmentDeliveryStatus";

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<ShipmentViewDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [detailToDelete, setDetailToDelete] =
    useState<ShipmentDetailViewDto | null>(null);

  useEffect(() => {
    if (!shipmentId) return;
    setLoading(true);
    ShipmentsApi.getShipmentDetails(shipmentId)
      .then((data) => {
        setShipment(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          typeof err === "string" ? err : "Không thể tải chi tiết lô giao"
        );
        setLoading(false);
      });
  }, [shipmentId]);

  // Prepare data for table consistently across renders
  const details = shipment?.shipmentDetails ?? [];
  const totalItems = details.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(
    () =>
      details.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [details, currentPage]
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Lỗi tải lô giao hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-3">
              {error || "Không tìm thấy lô giao"}
            </p>
            <Button onClick={() => router.back()}>← Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusMeta = ShipmentDeliveryStatusMap[shipment.deliveryStatus];

  return (
    <div className="w-full min-h-screen bg-orange-50 px-4 py-6 lg:px-20 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-800">
            <FiTruck className="text-orange-600 w-6 h-6" />
            <span>Lô giao: {shipment.shipmentCode}</span>
          </div>
          <Button
            className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
            onClick={() =>
              router.push(
                `/dashboard/manager/shipments/${shipment.shipmentId}/edit`
              )
            }
          >
            ✏️ Chỉnh sửa
          </Button>
        </div>

        <Separator className="border-t border-gray-200 my-2" />

        <Card>
          <CardHeader>
            <CardTitle>Thông tin lô giao</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Mã lô giao:</strong> {shipment.shipmentCode}
            </div>
            <div>
              <strong>Đơn hàng:</strong> {shipment.orderCode}
            </div>
            <div>
              <strong>Nhân viên giao:</strong> {shipment.deliveryStaffName}
            </div>
            <div>
              <strong>Khối lượng giao:</strong>{" "}
              {shipment.shippedQuantity !== undefined &&
              shipment.shippedQuantity !== null
                ? formatQuantity(shipment.shippedQuantity)
                : "-"}
            </div>
            <div>
              <strong>Ngày giao:</strong>{" "}
              {formatDate(shipment.shippedAt as any)}
            </div>
            <div>
              <strong>Ngày nhận:</strong>{" "}
              {formatDate(shipment.receivedAt as any)}
            </div>
            <div className="col-span-2">
              <strong>Trạng thái:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs font-semibold bg-${statusMeta.color}-100 text-${statusMeta.color}-700`}
              >
                {statusMeta.label}
              </span>
            </div>
            <div>
              <strong>Ngày tạo:</strong> {formatDate(shipment.createdAt)}
            </div>
            <div>
              <strong>Tạo bởi:</strong> {shipment.createdByName}
            </div>
          </CardContent>
        </Card>

        {/* Danh sách mặt hàng trong lô giao */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Danh sách sản phẩm giao</h2>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() =>
                router.push(
                  `/dashboard/manager/shipments/${shipment.shipmentId}/edit`
                )
              }
            >
              + Thêm sản phẩm giao
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left whitespace-nowrap">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">
                    Số lượng
                  </th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">
                    Đơn vị
                  </th>
                  <th className="px-4 py-2 text-left">Ghi chú</th>
                  <th className="px-4 py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {(shipment.shipmentDetails ?? []).length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-gray-500" colSpan={5}>
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.shipmentDetailId}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{item.productName}</td>
                      <td className="px-4 py-2 text-center">
                        {item.quantity !== undefined && item.quantity !== null
                          ? Number(item.quantity).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-center">{item.unit}</td>
                      <td className="px-4 py-2">{item.note || "—"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex justify-center gap-[2px]">
                          <Tooltip content="Chỉnh sửa lô giao">
                            <Button
                              variant="ghost"
                              className="h-7 w-7 p-[2px]"
                              onClick={() =>
                                router.push(
                                  `/dashboard/manager/shipments/${shipment.shipmentId}/edit`
                                )
                              }
                            >
                              <Pencil className="h-4 w-4 text-yellow-500" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Xoá khỏi lô giao">
                            <Button
                              variant="ghost"
                              className="h-7 w-7 p-[2px]"
                              onClick={() => {
                                setDetailToDelete(item);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 px-4 py-2 bg-gray-50 border rounded-md text-sm text-gray-700">
              <div className="text-sm text-gray-600">
                Đang hiển thị{" "}
                <span className="font-medium">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>
                –
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                </span>{" "}
                / {totalItems} sản phẩm
              </div>
              <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  ← Trước
                </Button>
                <span className="flex items-center px-2">
                  Trang{" "}
                  <span className="mx-1 font-semibold">{currentPage}</span> /{" "}
                  {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Sau →
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Quay lại
          </Button>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xoá sản phẩm khỏi lô giao?</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xoá{" "}
                <strong>{detailToDelete?.productName}</strong> khỏi lô giao
                không? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Huỷ
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!detailToDelete) return;
                  try {
                    await ShipmentsApi.softDeleteShipmentDetail(
                      detailToDelete.shipmentDetailId
                    );
                    setShipment((prev) =>
                      prev
                        ? {
                            ...prev,
                            shipmentDetails: (
                              prev.shipmentDetails || []
                            ).filter(
                              (d) =>
                                d.shipmentDetailId !==
                                detailToDelete.shipmentDetailId
                            ),
                          }
                        : prev
                    );
                  } catch (err) {
                    console.error(err);
                    alert("Không thể xoá sản phẩm khỏi lô giao.");
                  } finally {
                    setShowDeleteDialog(false);
                    setDetailToDelete(null);
                  }
                }}
              >
                Xoá
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
