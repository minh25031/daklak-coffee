'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createWarehouseOutboundRequest } from '@/lib/api/warehouseOutboundRequest';
import { getAllWarehouses } from '@/lib/api/warehouses';
import { getInventoriesByWarehouseId } from '@/lib/api/inventory';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CreateOutboundRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    warehouseId: '',
    inventoryId: '',
    requestedQuantity: '',
    unit: '',
    purpose: '',
    reason: '',
    orderItemId: '',
  });

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isValidGuid = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);

  // 🚚 Load danh sách kho
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await getAllWarehouses();
        if (res.status === 1) {
          setWarehouses(res.data || []);
        } else {
          toast.error(res.message || 'Không thể tải danh sách kho');
        }
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi tải kho');
      }
    };
    fetchWarehouses();
  }, []);

  // 📦 Load tồn kho khi chọn kho
  useEffect(() => {
    if (!form.warehouseId) {
      setInventories([]);
      return;
    }

    const fetchInventories = async () => {
      try {
        const data = await getInventoriesByWarehouseId(form.warehouseId);
        setInventories(data || []);
      } catch (err: any) {
        toast.error(err.message || 'Không thể tải tồn kho');
      }
    };

    fetchInventories();
  }, [form.warehouseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.warehouseId || !form.inventoryId || !form.requestedQuantity || !form.unit) {
      toast.error('Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }

    if (form.orderItemId && !isValidGuid(form.orderItemId)) {
      toast.error('Order Item ID không hợp lệ (phải là GUID)');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        warehouseId: form.warehouseId,
        inventoryId: form.inventoryId,
        requestedQuantity: Number(form.requestedQuantity),
        unit: form.unit,
        purpose: form.purpose || undefined,
        reason: form.reason || undefined,
        orderItemId: form.orderItemId || undefined,
      };

      const message = await createWarehouseOutboundRequest(payload);
      toast.success(message || 'Tạo yêu cầu thành công');
      router.push('/dashboard/manager/warehouse-request');
    } catch (err: any) {
      toast.error(err.message || 'Tạo yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Tạo yêu cầu xuất kho</h1>

      <div className="space-y-4">
        <div>
          <Label>Chọn kho *</Label>
          <select
            name="warehouseId"
            value={form.warehouseId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Chọn kho --</option>
            {warehouses.map((w) => (
              <option key={w.warehouseId} value={w.warehouseId}>
                {w.name} – {w.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Chọn tồn kho *</Label>
          <select
            name="inventoryId"
            value={form.inventoryId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={!form.warehouseId}
          >
            <option value="">-- Chọn tồn kho --</option>
            {inventories.map((inv) => (
              <option key={inv.inventoryId} value={inv.inventoryId}>
                {inv.inventoryCode} – {inv.quantity} {inv.unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Số lượng yêu cầu *</Label>
          <Input
            type="number"
            name="requestedQuantity"
            value={form.requestedQuantity}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Đơn vị *</Label>
          <Input name="unit" value={form.unit} onChange={handleChange} />
        </div>

        <div>
          <Label>Mục đích</Label>
          <Textarea name="purpose" value={form.purpose} onChange={handleChange} />
        </div>

        <div>
          <Label>Lý do</Label>
          <Textarea name="reason" value={form.reason} onChange={handleChange} />
        </div>

        <div>
          <Label>Order Item ID (test thủ công, phải là GUID)</Label>
          <Input
            name="orderItemId"
            value={form.orderItemId}
            onChange={handleChange}
            placeholder="Nhập GUID nếu có"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={handleSubmit} disabled={loading} className="bg-orange-600 text-white">
          {loading ? 'Đang gửi...' : 'Tạo yêu cầu'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/manager/warehouse-request')}>
          Hủy
        </Button>
      </div>
    </div>
  );
}
