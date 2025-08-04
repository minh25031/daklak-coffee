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
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import ContractItemFormDialog from "@/components/contracts/ContractItemFormDialog";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import {
  formatQuantity,
  formatUnitPriceByQuantity,
  formatDiscount,
} from "@/lib/utils";

const contractStatusMap: Record<string, { label: string; className: string }> =
  {
    NotStarted: {
      label: "Chưa bắt đầu",
      className: "bg-gray-200 text-gray-700",
    },
    PreparingDelivery: {
      label: "Chuẩn bị giao",
      className: "bg-blue-100 text-blue-700",
    },
    InProgress: {
      label: "Đang thực hiện",
      className: "bg-yellow-100 text-yellow-800",
    },
    Completed: {
      label: "Hoàn thành",
      className: "bg-green-100 text-green-700",
    },
    Cancelled: { label: "Đã huỷ", className: "bg-red-100 text-red-700" },
  };

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN");
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
              router.push(`/dashboard/manager/contracts/edit/${contractId}`)
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
              {contract.totalQuantity?.toLocaleString() ?? "-"}
            </div>
            <div>
              <strong>Tổng giá trị:</strong>{" "}
              {contract.totalValue?.toLocaleString() ?? "-"}
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
                <strong>File hợp đồng:</strong>{" "}
                <a
                  href={contract.contractFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Tải xuống hợp đồng
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách mặt hàng</CardTitle>
            <Button
              onClick={() => {
                setEditingItem(null); // create mode
                setShowItemFormDialog(true);
              }}
            >
              + Thêm mặt hàng
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded border bg-white">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên loại cà phê</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Đơn giá</TableHead>
                    <TableHead>Chiết khấu</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.contractItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Không có mặt hàng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((item) => (
                      <TableRow key={item.contractItemId}>
                        <TableCell>{item.coffeeTypeName}</TableCell>
                        <TableCell>
                          {item.quantity !== undefined
                            ? formatQuantity(item.quantity)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {item.unitPrice?.toLocaleString()}{" "}
                          <span className="text-muted-foreground">VNĐ/kg</span>
                        </TableCell>
                        <TableCell>
                          {item.discountAmount !== undefined
                            ? `${item.discountAmount}%`
                            : "-"}
                        </TableCell>
                        <TableCell>{item.note}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Tooltip content="Chỉnh sửa">
                              <Button
                                variant="ghost"
                                className="w-8 h-8"
                                onClick={() => {
                                  setEditingItem(item); // edit mode
                                  setShowItemFormDialog(true);
                                }}
                              >
                                <Pencil className="w-4 h-4 text-yellow-500" />
                              </Button>
                            </Tooltip>

                            <Tooltip content="Xoá">
                              <Button
                                variant="ghost"
                                className="w-8 h-8"
                                onClick={() => {
                                  setItemToDelete(item);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 px-4 py-2 bg-gray-50 border-t rounded-b-md text-sm text-gray-700">
                  <div className="mb-2 sm:mb-0">
                    Đang hiển thị{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                    </span>{" "}
                    / <span className="font-medium">{totalItems}</span> mặt hàng
                  </div>
                  <div className="flex gap-2 justify-end">
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
                      <span className="mx-1 font-semibold">{currentPage}</span>{" "}
                      / {totalPages}
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá mặt hàng?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá mặt hàng{" "}
              <strong>{itemToDelete?.coffeeTypeName}</strong> khỏi hợp đồng
              không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
