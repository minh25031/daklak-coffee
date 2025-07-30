"use client";

import { useEffect, useState } from "react";
import { getAllWarehouseReceipts } from "@/lib/api/warehouseReceipt";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ReceiptListPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 10;

  useEffect(() => {
    async function fetchReceipts() {
      try {
        const res = await getAllWarehouseReceipts();
        if (res.status === 1) {
          setReceipts(Array.isArray(res.data) ? res.data : []);
        } else {
          toast.error(res.message || "Không thể tải danh sách phiếu nhập kho");
        }
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu từ server.");
      } finally {
        setLoading(false);
      }
    }

    fetchReceipts();
  }, []);

  const filteredReceipts = receipts.filter((r) =>
    r.receiptCode?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReceipts.length / pageSize);
  const pagedReceipts = filteredReceipts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Danh sách phiếu nhập kho</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm theo mã phiếu..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64 pr-10"
          />
          <Search className="absolute right-5 top-[40px] h-4 w-4 text-gray-400" />
          <Link href="/dashboard/staff/receipts/create">
            <Button className="bg-blue-500 text-white">+ Tạo mới</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Mã phiếu</th>
                <th className="px-4 py-2 text-left">Kho</th>
                <th className="px-4 py-2 text-left">Lô hàng</th>
                <th className="px-4 py-2 text-left">Số lượng (kg)</th>
                <th className="px-4 py-2 text-left">Ngày nhập</th>
                <th className="px-4 py-2 text-left">Nhân viên</th>
                <th className="px-4 py-2 text-center">Trạng thái</th>
                <th className="px-4 py-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pagedReceipts.map((receipt) => {
                const note = receipt?.note ?? "";
                const isConfirmed = /\[?confirmed at/i.test(note);

                return (
                  <tr key={receipt.receiptId} className="border-t">
                    <td className="px-4 py-2">{receipt.receiptCode || "?"}</td>
                    <td className="px-4 py-2">{receipt.warehouseName || "?"}</td>
                    <td className="px-4 py-2">{receipt.batchCode || "?"}</td>
                    <td className="px-4 py-2">{receipt.receivedQuantity ?? "?"}</td>
                    <td className="px-4 py-2">
                      {receipt.receivedAt
                        ? new Date(receipt.receivedAt).toLocaleDateString()
                        : "?"}
                    </td>
                    <td className="px-4 py-2">{receipt.staffName || "Không rõ"}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge
                        className={`capitalize px-3 py-1 rounded-md font-medium text-sm text-center ${
                          isConfirmed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {isConfirmed ? "Đã xác nhận" : "Chưa xác nhận"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Link href={`/dashboard/staff/receipts/${receipt.receiptId}`}>
                        <Button variant="outline" size="sm">
                          Xem
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {pagedReceipts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Không có phiếu nhập kho nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredReceipts.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredReceipts.length)} trong {filteredReceipts.length} phiếu
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
                    page === currentPage ? "bg-black text-white" : "bg-white text-black border"
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
    </Card>
  );
}
