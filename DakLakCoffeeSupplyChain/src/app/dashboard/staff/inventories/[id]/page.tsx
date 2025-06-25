'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getInventoryById } from "@/lib/api/inventory"; // API call to get inventory by ID
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation"; // For getting URL params
import Link from "next/link";

export default function InventoryDetailPage() {
  const { id } = useParams(); // Get the ID from the URL
  const [inventory, setInventory] = useState<any>(null);

  useEffect(() => {
    // Kiểm tra id trước khi gọi API
    if (id) {
      async function fetchInventory() {
        // Đảm bảo id là string trước khi gọi API
        const res = await getInventoryById(id as string); // ép kiểu id thành string
        if (res.status === 1) {
          setInventory(res.data);
        } else {
          alert("Error: " + res.message);
        }
      }

      fetchInventory();
    } else {
      console.error("Inventory ID is missing or invalid");
    }
  }, [id]);

  if (!inventory) {
    return <div>Loading...</div>; // Show loading state while fetching
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Inventory Code:</strong> {inventory.inventoryCode}</p>
            <p><strong>Warehouse Name:</strong> {inventory.warehouseName}</p>
            <p><strong>Batch Code:</strong> {inventory.batchCode}</p>
            <p><strong>Product Name:</strong> {inventory.productName}</p>
            <p><strong>Coffee Type Name:</strong> {inventory.coffeeTypeName}</p>
            <p><strong>Quantity:</strong> {inventory.quantity} {inventory.unit}</p>
            <p><strong>Created At:</strong> {new Date(inventory.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(inventory.updatedAt).toLocaleString()}</p>
          </div>

          <div className="mt-4 flex justify-between">
            <Link href="/dashboard/staff/inventories">
              <Button variant="outline">Back to Inventory List</Button>
            </Link>
            <Badge className={`px-3 py-1 rounded-md font-medium text-sm ${inventory.status === "Available" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`} >
              {inventory.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
