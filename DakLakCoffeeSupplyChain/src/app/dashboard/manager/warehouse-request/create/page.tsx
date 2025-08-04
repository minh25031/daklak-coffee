'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createWarehouseOutboundRequest } from '@/lib/api/warehouseOutboundRequest';
import { getAllWarehouses } from '@/lib/api/warehouses';
import { getInventoriesByWarehouseId } from '@/lib/api/inventory';
import { getAllOrders, getOrderItemsByOrderId } from '@/lib/api/orders';

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
    orderId: '',
    orderItemId: '',
  });

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await getAllWarehouses();
        if (res.status === 1) setWarehouses(res.data || []);
        else toast.error(res.message || 'Không thể tải danh sách kho');
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi tải kho');
      }
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (!form.warehouseId) return setInventories([]);
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getAllOrders();
        setOrders(res || []);
      } catch (err: any) {
        toast.error(err.message || 'Không thể tải danh sách đơn hàng');
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!form.orderId) return setOrderItems([]);
    const fetchOrderItems = async () => {
      try {
        const items = await getOrderItemsByOrderId(form.orderId);
        setOrderItems(items || []);
      } catch (err: any) {
        toast.error(err.message || 'Không thể tải danh sách mục hàng');
      }
    };
    fetchOrderItems();
  }, [form.orderId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'orderId') setForm((prev) => ({ ...prev, orderItemId: '' }));
  };

  const handleSubmit = async () => {
    if (!form.warehouseId || !form.inventoryId || !form.requestedQuantity || !form.unit) {
      toast.error('Vui lòng nhập đầy đủ các trường bắt buộc');
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
    <div className="bg-transparent min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white bg-opacity-80 shadow-lg backdrop-blur-md border border-gray-200 rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Tạo yêu cầu xuất kho</h1>

        <div className="space-y-5">
          <div>
            <Label className="text-red-500 font-semibold">Chọn kho *</Label>
            <select name="warehouseId" value={form.warehouseId} onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white bg-opacity-90">
              <option value="">-- Chọn kho --</option>
              {warehouses.map((w) => (
                <option key={w.warehouseId} value={w.warehouseId}>
                  {w.name} – {w.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-red-500 font-semibold">Chọn tồn kho *</Label>
            <select
              name="inventoryId"
              value={form.inventoryId}
              onChange={handleChange}
              disabled={!form.warehouseId}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white bg-opacity-90"
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
            <Label className="text-red-500 font-semibold">Số lượng yêu cầu *</Label>
            <Input type="number" name="requestedQuantity" value={form.requestedQuantity} onChange={handleChange} className="bg-white bg-opacity-90" />
          </div>

          <div>
            <Label className="text-red-500 font-semibold">Đơn vị *</Label>
            <Input name="unit" value={form.unit} onChange={handleChange} className="bg-white bg-opacity-90" />
          </div>

          {/* Mục đích */}
<div>
  <Label>Mục đích</Label>
  <Textarea
    name="purpose"
    value={form.purpose}
    onChange={handleChange}
    placeholder="Ghi chú thêm (không bắt buộc)"
    className={`bg-white bg-opacity-90 transition-all duration-300 overflow-hidden resize-none
      ${form.purpose ? 'h-28' : 'h-9'} focus:h-28`}
  />
</div>

{/* Lý do */}
<div>
  <Label>Lý do</Label>
  <Textarea
    name="reason"
    value={form.reason}
    onChange={handleChange}
    placeholder="Lý do xuất kho (không bắt buộc)"
    className={`bg-white bg-opacity-90 transition-all duration-300 overflow-hidden resize-none
      ${form.reason ? 'h-28' : 'h-9'} focus:h-28`}
  />
</div>

          <div>
            <Label>Chọn đơn hàng (nếu có)</Label>
            <select
              name="orderId"
              value={form.orderId}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white bg-opacity-90"
            >
              <option value="">-- Không chọn --</option>
              {orders.map((order) => (
                <option key={order.orderId} value={order.orderId}>
                  {order.orderCode} – {order.customerName}
                </option>
              ))}
            </select>
          </div>

          {form.orderId && (
            <div>
              <Label>Chọn mục hàng từ đơn hàng</Label>
              <select
                name="orderItemId"
                value={form.orderItemId}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white bg-opacity-90"
              >
                <option value="">-- Chọn mục hàng --</option>
                {orderItems.map((item) => (
                  <option key={item.orderItemId} value={item.orderItemId}>
                    {item.productName} – {item.quantity} {item.unit}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button onClick={handleSubmit} disabled={loading} className="bg-orange-600 text-white hover:bg-orange-700">
            {loading ? 'Đang gửi...' : 'Tạo yêu cầu'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/manager/warehouse-request')}>
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}
