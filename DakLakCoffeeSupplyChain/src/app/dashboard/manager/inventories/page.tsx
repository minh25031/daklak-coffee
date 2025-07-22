'use client';

import { useEffect, useState } from "react";
import { getAllInventories, softDeleteInventory } from "@/lib/api/inventory";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Plus, History as HistoryIcon } from "lucide-react"; // 👈 Đổi tên tránh xung đột

export default function ManagerInventoryListPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAllInventories();

        if (Array.isArray(res?.data)) {
          setInventories(res.data);
        } else if (Array.isArray(res)) {
          setInventories(res);
        } else {
          alert(`❌ Error: ${res.message || "Failed to fetch inventory data."}`);
        }
      } catch (err: any) {
        alert(`❌ System error: ${err.message}`);
      }
    }

    fetchData();
  }, []);

  const filtered = inventories.filter((inv) =>
    inv.inventoryCode?.toLowerCase().includes(search.toLowerCase()) ||
    inv.warehouseName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.productName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSoftDelete = async (id: string) => {
    const confirmDelete = confirm("Bạn có chắc muốn xoá tồn kho này?");
    if (!confirmDelete) return;

    try {
      const res = await softDeleteInventory(id);
      if (res.status === 200) {
        alert("✅ Đã xoá tồn kho.");
        setInventories((prev) => prev.filter(i => i.inventoryId !== id));
      } else {
        alert(`❌ Lỗi: ${res.message || "Không thể xoá tồn kho."}`);
      }
    } catch (err: any) {
      alert(`❌ Lỗi hệ thống: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-6 gap-6">
      {/* Sidebar */}
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Search Inventory</h2>
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

        <Link href="/dashboard/manager/inventories/create">
          <Button className="w-full" variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Tạo tồn kho mới
          </Button>
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paged.map((inv) => (
              <div key={inv.inventoryId} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-semibold">Code: {inv.inventoryCode}</p>
                  <p>Warehouse: {inv.warehouseName}</p>
                  <p>Product: {inv.productName}</p>
                  <p>Coffee Type: <span className="text-green-700 font-medium">{inv.coffeeTypeName}</span></p>
                </div>

                <Badge className="capitalize px-3 py-1 rounded-md font-medium text-sm bg-gray-100 text-gray-800">
                  {inv.quantity > 0 ? "Available" : "Empty"}
                </Badge>

                <div className="flex gap-2">
                  <Link href={`/dashboard/manager/inventories/${inv.inventoryId}`}>
                    <Button variant="outline">Xem</Button>
                  </Link>

                  <Link href={`/dashboard/manager/inventories/${inv.inventoryId}/logs`}>
                    <Button variant="secondary">
                      <HistoryIcon className="w-4 h-4 mr-1" />
                      Lịch sử
                    </Button>
                  </Link>

                  <Button variant="destructive" onClick={() => handleSoftDelete(inv.inventoryId)}>
                    Xoá
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} items
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`rounded-md px-3 py-1 text-sm ${i + 1 === currentPage ? 'bg-black text-white' : 'bg-white text-black border'}`}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
