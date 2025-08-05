'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getWarehouseById } from '@/lib/api/warehouses';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Boxes,
  User,
  CalendarDays,
  RefreshCw,
  Hash
} from 'lucide-react';

export default function WarehouseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [warehouse, setWarehouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const res = await getWarehouseById(id as string);
        if (res.status === 1 && res.data) {
          setWarehouse(res.data);
        } else {
          alert('❌ Không thể lấy dữ liệu kho: ' + res.message);
        }
      } catch (error) {
        alert('❌ Lỗi khi tải chi tiết kho');
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  if (!warehouse) {
    return <div className="p-6 text-red-600">❌ Không tìm thấy kho.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              🏬 Chi tiết kho hàng
            </h1>
            <p className="text-gray-600">Xem thông tin chi tiết của kho</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Detail */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <DetailItem
              icon={<Hash className="text-gray-600" />}
              label="Mã kho (GUID)"
              value={warehouse.warehouseId}
            />
            <DetailItem
              icon={<Building2 className="text-orange-600" />}
              label="Mã kho (Code)"
              value={warehouse.warehouseCode}
            />
            <DetailItem
              icon={<MapPin className="text-blue-600" />}
              label="Vị trí"
              value={warehouse.location}
            />
            <DetailItem
              icon={<Boxes className="text-green-600" />}
              label="Dung lượng"
              value={`${warehouse.capacity?.toLocaleString()} kg`}
            />
            <DetailItem
              icon={<User className="text-indigo-600" />}
              label="Người quản lý"
              value={warehouse.managerName}
            />
            <DetailItem
              icon={<CalendarDays className="text-rose-600" />}
              label="Ngày tạo"
              value={new Date(warehouse.createdAt).toLocaleString('vi-VN')}
            />
            <DetailItem
              icon={<RefreshCw className="text-gray-600" />}
              label="Ngày cập nhật"
              value={new Date(warehouse.updatedAt).toLocaleString('vi-VN')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable detail item component
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="p-2 bg-white rounded-lg shadow">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

