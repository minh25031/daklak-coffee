'use client';

import { useEffect, useState } from 'react';
import { getAllWarehouses, deleteWarehouse } from '@/lib/api/warehouses';
import { getInventoriesByWarehouseId } from '@/lib/api/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Trash2, Eye, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

type Warehouse = {
  warehouseId: string;
  name: string;
  location: string;
  capacity?: number;
};

export default function WarehouseListPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [usedCapacities, setUsedCapacities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAllWarehouses();
        const list = Array.isArray(res) ? res : res?.data || [];

        setWarehouses(list);

        const usageMap: Record<string, number> = {};
        for (const warehouse of list) {
          try {
            const inventories = await getInventoriesByWarehouseId(warehouse.warehouseId);
            const totalUsed = inventories.reduce((sum: number, i: any) => sum + i.quantity, 0);
            usageMap[warehouse.warehouseId] = totalUsed;
          } catch {
            usageMap[warehouse.warehouseId] = 0;
          }
        }
        setUsedCapacities(usageMap);
      } catch (error) {
        toast.error('❌ Lỗi khi tải danh sách kho');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filtered = warehouses.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Bạn chắc chắn muốn xoá kho này?')) {
      const res = await deleteWarehouse(id);
      if (res.status === 1) {
        toast.success('✅ Đã xoá kho');
        setWarehouses((prev) => prev.filter((w) => w.warehouseId !== id));
      } else {
        toast.error('❌ ' + res.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-amber-800">📦 Danh sách kho</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Tìm theo tên kho..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Link href="/dashboard/manager/warehouses/create">
            <Button className="bg-amber-900 text-white hover:bg-amber-800">
              <Plus className="w-4 h-4 mr-2" />
              Tạo kho mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Nội dung */}
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 italic">Không có kho phù hợp.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((warehouse) => {
            const used = usedCapacities[warehouse.warehouseId] || 0;
            const total = warehouse.capacity || 0;
            const available = Math.max(0, total - used);
            const usedPercent = total > 0 ? (used / total) * 100 : 0;

            return (
              <Card key={warehouse.warehouseId} className="p-4 rounded-xl border shadow hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24">
                    <Doughnut
                      data={{
                        labels: ['Đã sử dụng', 'Còn trống'],
                        datasets: [
                          {
                            data: [used, available],
                            backgroundColor: ['#FB923C', '#86EFAC'],
                            hoverOffset: 6,
                          },
                        ],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        cutout: '60%',
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {warehouse.name}
                    </h2>
                    <p className="text-sm text-gray-500">{warehouse.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Dung lượng:{' '}
                      <span className="font-medium">
                        {used.toLocaleString()} / {total.toLocaleString()} kg
                      </span>
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        usedPercent > 80 ? 'text-red-500' : 'text-green-600'
                      }`}
                    >
                      {usedPercent.toFixed(1)}% đã sử dụng
                    </p>
                  </div>
                </div>

                {/* Hành động */}
                <div className="mt-4 flex justify-end gap-2">
                  <Link href={`/dashboard/manager/warehouses/${warehouse.warehouseId}`}>
                    <Button size="icon" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(warehouse.warehouseId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
