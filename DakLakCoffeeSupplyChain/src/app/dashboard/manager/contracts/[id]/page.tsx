"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getContractDetails,
  ContractViewDetailsDto,
} from "@/lib/api/contracts";
import {
  ContractItemCreateDto,
  ContractItemUpdateDto,
  softDeleteContractItem,
} from "@/lib/api/contractItems";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import ContractItemFormDialog from "@/components/contracts/ContractItemFormDialog";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import { formatQuantity, formatDate, formatDiscount } from "@/lib/utils";

const contractStatusMap: Record<string, { label: string; className: string }> =
  {
    NotStarted: {
      label: "Chưa bắt đầu",
      className: "bg-gray-100 text-gray-600",
    },
    PreparingDelivery: {
      label: "Chuẩn bị giao",
      className: "bg-purple-100 text-purple-700",
    },
    InProgress: {
      label: "Đang thực hiện",
      className: "bg-green-100 text-green-700",
    },
    PartialCompleted: {
      label: "Hoàn thành một phần",
      className: "bg-yellow-100 text-yellow-700",
    },
    Completed: {
      label: "Hoàn thành",
      className: "bg-blue-100 text-blue-700",
    },
    Cancelled: {
      label: "Đã huỷ",
      className: "bg-red-100 text-red-700",
    },
    Expired: {
      label: "Quá hạn",
      className: "bg-orange-100 text-orange-700",
    },
  };

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractViewDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [itemToDelete, setItemToDelete] = useState<
    ContractViewDetailsDto["contractItems"][number] | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const [showItemFormDialog, setShowItemFormDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<
    ContractViewDetailsDto["contractItems"][number] | null
  >(null);

  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);

  useEffect(() => {
    getCoffeeTypes().then(setCoffeeTypes).catch(console.error);
  }, []);

  const enrichItems = (items: ContractViewDetailsDto["contractItems"]) => {
    return items.map((item) => {
      return {
        ...item,
        coffeeTypeName:
          coffeeTypes.find((c) => c.coffeeTypeId === item.coffeeTypeId)
            ?.typeName ?? item.coffeeTypeName,
      };
    });
  };

  const reloadContract = () => {
    setLoading(true);
    getContractDetails(contractId)
      .then((data) => {
        console.log("Dữ liệu sau update:", data);
        data.contractItems = enrichItems(data.contractItems);
        setContract(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải chi tiết hợp đồng");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!contractId) return;
    getContractDetails(contractId)
      .then((data) => {
        setContract(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải chi tiết hợp đồng");
        setLoading(false);
      });
  }, [contractId]);

  const handleDelete = async () => {
    if (!itemToDelete?.contractItemId) return;
    try {
      await softDeleteContractItem(itemToDelete.contractItemId);
      setShowDeleteDialog(false);
      reloadContract();
    } catch (error) {
      console.error("Xoá thất bại:", error);
      alert("Không thể xoá mặt hàng. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Lỗi tải hợp đồng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-3">
              {error || "Không tìm thấy hợp đồng"}
            </p>
            <Button onClick={() => router.back()}>← Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = contract.contractItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedItems = contract.contractItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full min-h-screen bg-orange-50 px-4 py-6 lg:px-20 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-800">
            <FileText className="text-orange-600 w-6 h-6" />
            <span>Hợp đồng: {contract.contractNumber}</span>
          </div>
          <Button
            className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
            onClick={() =>
              router.push(
                `/dashboard/manager/contracts/${contract.contractId}/edit`
              )
            }
          >
            ✏️ Chỉnh sửa
          </Button>
        </div>

        <Separator className="border-t border-gray-200 my-2" />

        <Card>
          <CardHeader>
            <CardTitle>Thông tin hợp đồng</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Tiêu đề:</strong> {contract.contractTitle}
            </div>
            <div>
              <strong>Bên bán:</strong> {contract.sellerName}
            </div>
            <div>
              <strong>Bên mua:</strong> {contract.buyerName}
            </div>
            <div>
              <strong>Số vòng giao:</strong> {contract.deliveryRounds ?? "-"}
            </div>
            <div>
              <strong>Tổng khối lượng:</strong>{" "}
              {contract.totalQuantity !== undefined
                ? formatQuantity(contract.totalQuantity)
                : "-"}
            </div>
            <div>
              <strong>Tổng giá trị:</strong>{" "}
              {contract.totalValue !== undefined
                ? `${contract.totalValue.toLocaleString()} VNĐ`
                : "-"}
            </div>
            <div>
              <strong>Ngày bắt đầu:</strong> {formatDate(contract.startDate)}
            </div>
            <div>
              <strong>Ngày kết thúc:</strong> {formatDate(contract.endDate)}
            </div>
            <div>
              <strong>Ngày ký:</strong> {formatDate(contract.signedAt)}
            </div>
            <div>
              <strong>Trạng thái:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                  contractStatusMap[contract.status]?.className
                }`}
              >
                {contractStatusMap[contract.status]?.label || contract.status}
              </span>
            </div>
            {contract.cancelReason && contract.status === "Cancelled" && (
              <div className="col-span-2">
                <strong className="text-red-600">Lý do huỷ:</strong>{" "}
                {contract.cancelReason}
              </div>
            )}
            <div>
              <strong>Ngày tạo:</strong> {formatDate(contract.createdAt)}
            </div>
            <div>
              <strong>Ngày cập nhật:</strong> {formatDate(contract.updatedAt)}
            </div>
            {contract.contractFileUrl && (
              <div className="col-span-2">
                <strong>File hợp đồng:</strong>
                <div className="mt-2 space-y-2">
                  {/* Preview ảnh nếu là file ảnh */}
                  {contract.contractFileUrl.match(
                    /\.(jpg|jpeg|png|gif|webp)$/i
                  ) && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <img
                        src={contract.contractFileUrl}
                        alt="Preview hợp đồng"
                        className="max-w-full h-32 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          // Mở modal xem ảnh lớn
                          const modal = window.open(
                            "",
                            "_blank",
                            "width=800,height=600"
                          );
                          if (modal) {
                            modal.document.write(`
                              <html>
                                <head>
                                  <title>Xem hợp đồng: ${
                                    contract.contractNumber
                                  }</title>
                                  <style>
                                    body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
                                    .container { max-width: 100%; text-align: center; }
                                    img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                                    .close-btn { position: fixed; top: 20px; right: 20px; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 18px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                                    .file-info { margin-top: 15px; color: #666; }
                                  </style>
                                </head>
                                <body>
                                  <button class="close-btn" onclick="window.close()">✕</button>
                                  <div class="container">
                                    <img src="${
                                      contract.contractFileUrl
                                    }" alt="Hợp đồng" />
                                    <div class="file-info">
                                      <strong>File:</strong> ${
                                        contract.contractFileUrl
                                          .split("/")
                                          .pop() || contract.contractFileUrl
                                      }
                                    </div>
                                  </div>
                                </body>
                              </html>
                            `);
                          }
                        }}
                        title="Click để xem ảnh lớn"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Click vào ảnh để xem lớn hơn
                      </p>
                    </div>
                  )}

                  {/* Link tải xuống và xem trực tiếp */}
                  <div className="flex items-center gap-2">
                    <a
                      href={contract.contractFileUrl}
                      download
                      className="text-blue-600 underline hover:text-blue-800 text-sm cursor-pointer"
                      onClick={(e) => {
                        // Nếu là URL từ internet, có thể cần xử lý đặc biệt
                        if (contract.contractFileUrl?.startsWith("http")) {
                          // Tạo link tải xuống
                          const link = document.createElement("a");
                          link.href = contract.contractFileUrl;
                          link.download =
                            contract.contractFileUrl.split("/").pop() ||
                            "contract";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          e.preventDefault();
                        }
                      }}
                    >
                      📥 Tải xuống hợp đồng
                    </a>
                    <span className="text-gray-400">|</span>
                    <a
                      href={contract.contractFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 underline hover:text-green-800 text-sm"
                    >
                      👁️ Xem trực tiếp
                    </a>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danh sách mặt hàng hợp đồng */}
        <div className="rounded-xl border bg-white p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Danh sách mặt hàng</h2>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => {
                setEditingItem(null); // tạo mới
                setShowItemFormDialog(true);
              }}
            >
              + Thêm mặt hàng
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left whitespace-nowrap">
                    Tên loại cà phê
                  </th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">
                    Số lượng
                  </th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">
                    Đơn giá
                  </th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">
                    Chiết khấu
                  </th>
                  <th className="px-4 py-2 text-left">Ghi chú</th>
                  <th className="px-4 py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {contract.contractItems.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-gray-500" colSpan={6}>
                      Không có mặt hàng nào.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.contractItemId}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{item.coffeeTypeName}</td>
                      <td className="px-4 py-2 text-center">
                        {item.quantity !== undefined
                          ? formatQuantity(item.quantity)
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.unitPrice?.toLocaleString()}{" "}
                        <span className="text-gray-500 text-xs">VNĐ/kg</span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.discountAmount !== undefined
                          ? `${item.discountAmount}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-2">{item.note || "—"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex justify-center gap-[2px]">
                          <Tooltip content="Chỉnh sửa">
                            <Button
                              variant="ghost"
                              className="h-7 w-7 p-[2px]"
                              onClick={() => {
                                setEditingItem(item);
                                setShowItemFormDialog(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 text-yellow-500" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Xoá">
                            <Button
                              variant="ghost"
                              className="h-7 w-7 p-[2px]"
                              onClick={() => {
                                setItemToDelete(item);
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

          {/* Pagination */}
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
                / {totalItems} mặt hàng
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
        {/* Footer */}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Quay lại
          </Button>
        </div>

        <ContractItemFormDialog
          open={showItemFormDialog}
          onOpenChange={setShowItemFormDialog}
          contractId={contract.contractId}
          initialData={
            editingItem
              ? ({
                  contractItemId: editingItem.contractItemId,
                  contractId: contract.contractId,
                  coffeeTypeId: editingItem.coffeeTypeId,
                  quantity: editingItem.quantity,
                  unitPrice: editingItem.unitPrice,
                  discountAmount: editingItem.discountAmount,
                  note: editingItem.note,
                } as ContractItemUpdateDto)
              : undefined
          }
          mode={editingItem ? "edit" : "create"}
          onSuccess={() => {
            setShowItemFormDialog(false);
            reloadContract();
          }}
        />
      </div>
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Xoá mặt hàng?"
        description={
          <span>
            Bạn có chắc chắn muốn xoá mặt hàng{" "}
            <strong>{itemToDelete?.coffeeTypeName}</strong> khỏi hợp đồng không?
            Hành động này không thể hoàn tác.
          </span>
        }
        confirmText="Xoá"
        cancelText="Huỷ"
        onConfirm={handleDelete}
      />
    </div>
  );
}
