"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import FilterStatusPanel from "@/components/ui/filterStatusPanel";
import { cn, formatDate, formatQuantity } from "@/lib/utils";
import {
  ProductStatusMap,
  ProductStatusValue,
} from "@/lib/constants/productStatus";
import {
  ProductViewAllDto,
  getAllProducts,
  softDeleteProduct,
} from "@/lib/api/products";
import { ConfirmDialog } from "@/components/ui/confirmDialog";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductViewAllDto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<ProductStatusValue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] =
    useState<ProductViewAllDto | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllProducts()
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesStatus = !selectedStatus || p.status === selectedStatus;
      const matchesSearch =
        !search ||
        [
          p.productCode,
          p.productName,
          p.coffeeTypeName,
          p.inventoryLocation,
          p.batchCode,
          p.originRegion,
          p.evaluatedQuality,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

      const created = p.createdAt ? new Date(p.createdAt) : null;
      const matchesStartDate = !startDate || (created && created >= startDate);
      const matchesEndDate = !endDate || (created && created <= endDate);

      return (
        matchesStatus && matchesSearch && matchesStartDate && matchesEndDate
      );
    });
  }, [products, search, selectedStatus, startDate, endDate]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedProducts = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusCounts = products.reduce<Record<ProductStatusValue, number>>(
    (acc, s) => {
      const status = s.status as ProductStatusValue;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {
      Draft: 0,
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      InStock: 0,
      OutOfStock: 0,
      Archived: 0,
    }
  );

  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">
            Tìm kiếm sản phẩm
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

        <FilterStatusPanel<ProductStatusValue>
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusCounts={statusCounts}
          statusMap={ProductStatusMap}
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
              onClick={() => router.push("/dashboard/manager/products/create")}
            >
              + Tạo sản phẩm mới
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <div className="flex items-center justify-end gap-2 pb-2">
              <span className="text-sm text-gray-600">Hiển thị</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={pageSize}
                onChange={(e) => {
                  const v = Number(e.target.value) || 10;
                  setPageSize(v);
                  setCurrentPage(1);
                }}
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">dòng</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              <table className="min-w-full table-auto text-sm border border-gray-200">
                <thead className="bg-gray-100 text-sm text-gray-600">
                  <tr>
                    <th className="px-2 py-2 w-8"></th>
                    <th className="px-4 py-2 text-left">Mã SP</th>
                    <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                    <th className="px-4 py-2 text-left">Loại cà phê</th>
                    <th className="px-4 py-2 text-left">Kho</th>
                    <th className="px-4 py-2 text-center whitespace-nowrap">
                      SL có sẵn
                    </th>
                    <th className="px-4 py-2 text-center whitespace-nowrap">
                      Trạng thái
                    </th>
                    <th className="px-4 py-2 text-center whitespace-nowrap">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-2 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : pagedProducts.length === 0 ? (
                    <tr>
                      {/* chỉnh 8 -> 9 */}
                      <td
                        colSpan={9}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        Không tìm thấy sản phẩm
                      </td>
                    </tr>
                  ) : (
                    pagedProducts.flatMap((p) => [
                      <tr
                        key={p.productId}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-2 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              setExpandedId((cur) =>
                                cur === p.productId ? null : p.productId
                              )
                            }
                            aria-label={
                              expandedId === p.productId ? "Thu gọn" : "Mở rộng"
                            }
                          >
                            {expandedId === p.productId ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </Button>
                        </td>
                        <td className="px-4 py-2" title={p.productCode}>
                          {p.productCode}
                        </td>
                        <td className="px-4 py-2" title={p.productName}>
                          {p.productName}
                        </td>
                        <td
                          className="px-4 py-2 whitespace-nowrap"
                          title={p.coffeeTypeName}
                        >
                          {p.coffeeTypeName}
                        </td>
                        <td className="px-4 py-2" title={p.inventoryLocation}>
                          {p.inventoryLocation}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {p.quantityAvailable != null
                            ? formatQuantity(p.quantityAvailable)
                            : "—"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          {(() => {
                            const meta = ProductStatusMap[p.status];
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
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-[2px] justify-center">
                            <Tooltip content="Xem chi tiết">
                              <Button
                                variant="ghost"
                                className="p-[2px] w-7 h-7"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/manager/products/${p.productId}`
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
                                    `/dashboard/manager/products/${p.productId}/edit`
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
                                  setProductToDelete(p);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>,
                      expandedId === p.productId ? (
                        <tr
                          key={`${p.productId}-expanded`}
                          className="bg-gray-50 border-b"
                        >
                          <td colSpan={9} className="px-6 py-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                              <div>
                                <div className="text-gray-500">Đơn giá</div>
                                <div className="font-medium">
                                  {p.unitPrice != null
                                    ? `${p.unitPrice.toLocaleString()} VND/kg`
                                    : "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Chất lượng</div>
                                <div className="font-medium">
                                  {p.evaluatedQuality || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">
                                  Điểm đánh giá
                                </div>
                                <div className="font-medium">
                                  {p.evaluationScore != null
                                    ? p.evaluationScore
                                    : "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Nguồn gốc</div>
                                <div className="font-medium">
                                  {p.originRegion || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Lô chế biến</div>
                                <div className="font-medium">
                                  {p.batchCode || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Đơn vị</div>
                                <div className="font-medium">
                                  {p.unit || "—"}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null,
                    ])
                  )}
                </tbody>
              </table>
            </div>
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
              / {filtered.length} sản phẩm
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

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Xoá sản phẩm?"
          description={
            <span>
              Bạn có chắc chắn muốn xoá sản phẩm{" "}
              <strong>{productToDelete?.productCode}</strong>? Hành động này
              không thể hoàn tác.
            </span>
          }
          confirmText="Xoá"
          cancelText="Huỷ"
          onConfirm={async () => {
            if (!productToDelete) return;
            try {
              await softDeleteProduct(productToDelete.productId);
              setProducts((prev) =>
                prev.filter((x) => x.productId !== productToDelete.productId)
              );
            } finally {
              setShowDeleteDialog(false);
              setProductToDelete(null);
            }
          }}
        />
      </main>
    </div>
  );
}
