'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWarehouseById } from '@/lib/api/warehouses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WarehouseDetailPage() {
  const { id } = useParams();
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

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;
  if (!warehouse) return <p className="p-4">Không tìm thấy kho.</p>;

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Chi tiết kho</CardTitle>
          <Link href="/dashboard/staff/warehouses">
            <Button variant="outline">← Quay lại danh sách</Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-gray-700">
          <p><strong>Mã kho (GUID):</strong> {warehouse.warehouseId}</p>
          <p><strong>Mã kho:</strong> {warehouse.warehouseCode}</p>
          <p><strong>Tên kho:</strong> {warehouse.name}</p>
          <p><strong>Vị trí:</strong> {warehouse.location}</p>
          <p><strong>Dung lượng:</strong> {warehouse.capacity?.toLocaleString()} kg</p>
          <p><strong>Người quản lý:</strong> {warehouse.managerName}</p>
          <p><strong>Ngày tạo:</strong> {new Date(warehouse.createdAt).toLocaleString()}</p>
          <p><strong>Ngày cập nhật:</strong> {new Date(warehouse.updatedAt).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
