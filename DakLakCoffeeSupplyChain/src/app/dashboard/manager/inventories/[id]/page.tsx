'use client';

import { useEffect, useState } from "react";
import { getInventoryById } from "@/lib/api/inventory";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Coffee, Package } from "lucide-react";

export default function InventoryDetailManagerPage() {
  const { id } = useParams();
  const [inventory, setInventory] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      async function fetchInventory() {
        try {
          const res = await getInventoryById(id as string);
          console.log('🔍 Inventory API Response:', res); // Debug log
          
          if (res?.data) {
            setInventory(res.data);
            console.log('🔍 Inventory Data:', res.data); // Debug log
          } else if (res?.inventoryId) {
            setInventory(res);
            console.log('🔍 Inventory Direct:', res); // Debug log
          } else {
            setError(res.message || "Không tìm thấy tồn kho.");
          }
        } catch (err: any) {
          setError(err.message || "Lỗi khi tải dữ liệu tồn kho.");
        }
      }
      fetchInventory();
    }
  }, [id]);

  // Helper function to determine coffee type (giống như Staff và List)
  const getCoffeeType = (inventory: any) => {
    // Cà phê đã sơ chế: có batchId, không có detailId
    if (inventory.batchId && !inventory.detailId) return 'processed';
    // Cà phê tươi: không có batchId, có detailId
    if (!inventory.batchId && inventory.detailId) return 'fresh';
    return 'unknown';
  };

  const getCoffeeTypeLabel = (inventory: any) => {
    const type = getCoffeeType(inventory);
    switch (type) {
      case 'fresh': return 'Cà phê tươi';
      case 'processed': return 'Cà phê đã sơ chế';
      default: return 'Không xác định';
    }
  };

  const getCoffeeTypeIcon = (inventory: any) => {
    const type = getCoffeeType(inventory);
    switch (type) {
      case 'fresh': return <Coffee className="w-4 h-4 text-orange-600" />;
      case 'processed': return <Coffee className="w-4 h-4 text-purple-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCoffeeInfo = (inventory: any) => {
    const type = getCoffeeType(inventory);
    switch (type) {
      case 'fresh':
        return {
          label: 'Mùa vụ',
          value: inventory?.cropSeasonName || inventory?.detailCode || 'N/A',
          color: 'text-orange-700'
        };
      case 'processed':
        return {
          label: 'Lô sơ chế',
          value: inventory?.batchCode ? `${inventory.batchCode} - ${inventory.coffeeTypeName || 'Đã sơ chế'}` : 'N/A',
          color: 'text-purple-700'
        };
      default:
        return {
          label: 'Thông tin',
          value: 'N/A',
          color: 'text-gray-700'
        };
    }
  };

  if (error) return <div className="text-red-500 p-6">{error}</div>;
  if (!inventory) return <div className="p-6">Đang tải dữ liệu tồn kho...</div>;

  // Debug logs
  console.log('🔍 Inventory Object:', inventory);
  console.log('🔍 BatchId:', inventory.batchId);
  console.log('🔍 DetailId:', inventory.detailId);

  const coffeeType = getCoffeeType(inventory);
  const coffeeTypeLabel = getCoffeeTypeLabel(inventory);
  const coffeeTypeIcon = getCoffeeTypeIcon(inventory);
  const coffeeInfo = getCoffeeInfo(inventory);

  console.log('🔍 Coffee Type:', coffeeType);
  console.log('🔍 Coffee Info:', coffeeInfo);

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">
      <Card className="shadow-lg border rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-orange-600 flex items-center gap-2">
            📦 Chi tiết tồn kho <span className="text-sm text-gray-500">(Quản lý)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[15px]">
            <div>
              <p><strong>🔢 Mã tồn kho:</strong> {inventory.inventoryCode}</p>
              <p><strong>🏢 Tên kho:</strong> {inventory.warehouseName}</p>
              <p><strong>📦 {coffeeInfo.label}:</strong> 
                <span className={`ml-2 ${coffeeInfo.color}`}>{coffeeInfo.value}</span>
              </p>
              <p><strong>☕ Loại cà phê:</strong> 
                <span className="ml-2 flex items-center gap-2">
                  {coffeeTypeIcon}
                  <span className={`font-medium ${
                    coffeeType === 'fresh' ? 'text-orange-700' : 
                    coffeeType === 'processed' ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                    {coffeeTypeLabel}
                  </span>
                </span>
              </p>
            </div>

            <div>
              <p><strong>🛒 Sản phẩm:</strong> 
                {coffeeType === 'fresh' 
                  ? (inventory.coffeeTypeNameDetail || inventory.coffeeTypeName || 'Cà phê tươi')
                  : (inventory.productName || 'N/A')
                }
              </p>
              <p><strong>⚖️ Số lượng:</strong> {inventory.quantity} {inventory.unit}</p>
              <p><strong>🗓️ Ngày tạo:</strong> {new Date(inventory.createdAt).toLocaleString()}</p>
              <p><strong>🛠️ Ngày cập nhật:</strong> {new Date(inventory.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/dashboard/manager/inventories">
              <Button variant="outline" className="rounded-md">
                ← Quay lại danh sách
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
