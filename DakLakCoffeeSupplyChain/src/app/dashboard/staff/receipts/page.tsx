'use client';

import { useEffect, useState } from "react";
import { getAllWarehouseReceipts } from "@/lib/api/warehouseReceipt";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

export default function ReceiptListPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pageSize = 10;

  useEffect(() => {
    async function fetchReceipts() {
      try {
        const res = await getAllWarehouseReceipts();
        console.log("📦 Dữ liệu từ BE:", res);

        if (res.status === 1) {
          const result = Array.isArray(res.data) ? res.data : [];
          setReceipts(result);
        } else {
          setError(res.message || "Không thể tải danh sách phiếu nhập kho");
        }
      } catch (err: any) {
        console.error("❌ Lỗi gọi API:", err);
        setError("Lỗi kết nối đến server hoặc token không hợp lệ");
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
    <div className="flex h-screen overflow-y-auto bg-gray-50 p-6 gap-6">
      {/* Sidebar */}
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Search Receipts</h2>
          <div className="relative">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-6 pb-40">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Warehouse Receipts</CardTitle>
            <Link href="/dashboard/staff/receipts/create">
              <Button className="bg-blue-500 text-white">Create Receipt</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : pagedReceipts.length === 0 ? (
              <p className="text-gray-500">Không có phiếu nhập kho nào.</p>
            ) : (
              pagedReceipts.map((receipt) => {
                const note = receipt?.note ?? "";
                const isConfirmed = /\[?confirmed at/i.test(note); // ✅ regex fix

                return (
                  <div
                    key={receipt.receiptId}
                    className="flex justify-between items-center p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-semibold">Code: {receipt.receiptCode || "?"}</p>
                      <p>Warehouse: {receipt.warehouseName || "?"}</p>
                      <p>Batch: {receipt.batchCode || "?"}</p>
                      <p>Received Quantity: {receipt.receivedQuantity ?? "?"}kg</p>
                      <p>
                        Received At:{" "}
                        {receipt.receivedAt
                          ? new Date(receipt.receivedAt).toLocaleDateString()
                          : "?"}
                      </p>
                      <p>Staff: {receipt.staffName || "Không rõ"}</p>
                    </div>
                    <Badge
                      className={`capitalize px-3 py-1 rounded-md font-medium text-sm ${
                        isConfirmed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isConfirmed ? "Đã xác nhận" : "Chưa xác nhận"}
                    </Badge>
                    <Link href={`/dashboard/staff/receipts/${receipt.receiptId}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && filteredReceipts.length > 0 && (
          <div className="flex justify-between items-center">
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
      </main>
    </div>
  );
}
