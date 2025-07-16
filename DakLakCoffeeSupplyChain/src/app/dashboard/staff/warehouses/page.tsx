'use client';

import { useEffect, useState } from 'react';
import { getAllWarehouses } from '@/lib/api/warehouses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';

type Warehouse = {
  warehouseId: string;
  name: string;
  location: string;
  capacity?: number;
};

export default function WarehouseListPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllWarehouses();

        if (Array.isArray(res)) {
          setWarehouses(res);
        } else if (res.status === 1 && Array.isArray(res.data)) {
          setWarehouses(res.data);
        } else {
          alert('❌ Không thể tải danh sách kho');
        }
      } catch (error) {
        alert('❌ Đã xảy ra lỗi khi tải danh sách kho');
      }
    };

    fetchData();
  }, []);

  const filtered = warehouses.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex min-h-screen bg-amber-100/30 p-6 gap-6">
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Tìm kiếm kho</h2>
          <div className="relative">
            <Input
              placeholder="Tên kho..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </aside>

      <main className="flex-1 space-y-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Danh sách kho</CardTitle>
          </CardHeader>

          <CardContent>
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-100 text-gray-700 font-medium">
                <tr>
                  <th className="text-left p-3">Tên kho</th>
                  <th className="text-left p-3">Vị trí</th>
                  <th className="text-left p-3">Dung lượng (kg)</th>
                  <th className="text-left p-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((w) => (
                  <tr key={w.warehouseId} className="border-b hover:bg-gray-50">
                    <td className="p-3">{w.name}</td>
                    <td className="p-3">{w.location}</td>
                    <td className="p-3">{w.capacity?.toLocaleString()} kg</td>
                    <td className="p-3">
                      <Link href={`/dashboard/staff/warehouses/${w.warehouseId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" /> Xem
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-muted-foreground">
                Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} kho
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
                        page === currentPage ? 'bg-black text-white' : 'bg-white text-black border'
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
