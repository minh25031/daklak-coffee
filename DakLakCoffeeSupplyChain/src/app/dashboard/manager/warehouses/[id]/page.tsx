'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getWarehouseById, deleteWarehouse } from '@/lib/api/warehouses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';

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

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xoá kho này không?')) {
      const res = await deleteWarehouse(id as string);
      if (res.status === 1) {
        alert('✅ Xoá thành công');
        router.push('/dashboard/manager/warehouses');
      } else {
        alert('❌ ' + res.message);
      }
    }
  };

  if (loading) return <p className="p-6 text-gray-500">⏳ Đang tải dữ liệu...</p>;
  if (!warehouse) return <p className="p-6 text-red-500">❌ Không tìm thấy kho.</p>;

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex justify-between items-center border-b">
          <CardTitle className="text-xl text-orange-700 font-bold">
            📦 Chi tiết kho hàng
          </CardTitle>
          <div className="flex gap-2">
            <Link href="/dashboard/manager/warehouses">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại
              </Button>
            </Link>
            <Link href={`/dashboard/manager/warehouses/${warehouse.warehouseId}/edit`}>
              <Button variant="default" size="sm">
                <Pencil className="w-4 h-4 mr-1" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Xoá
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-gray-800 p-6">
          <DetailItem label="🆔 Mã kho (GUID)" value={warehouse.warehouseId} />
          <DetailItem label="🏷️ Mã kho" value={warehouse.warehouseCode} />
          <DetailItem label="📍 Tên kho" value={warehouse.name} />
          <DetailItem label="📌 Vị trí" value={warehouse.location} />
          <DetailItem
            label="📦 Dung lượng"
            value={`${warehouse.capacity?.toLocaleString()} kg`}
          />
          <DetailItem label="👤 Người quản lý" value={warehouse.managerName} />
          <DetailItem
            label="🕒 Ngày tạo"
            value={new Date(warehouse.createdAt).toLocaleString('vi-VN')}
          />
          <DetailItem
            label="🛠️ Ngày cập nhật"
            value={new Date(warehouse.updatedAt).toLocaleString('vi-VN')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-2">
      <span className="font-semibold text-gray-600 min-w-[150px]">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
