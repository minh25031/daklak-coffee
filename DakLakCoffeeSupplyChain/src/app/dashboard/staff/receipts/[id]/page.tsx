'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getWarehouseReceiptById } from "@/lib/api/warehouseReceipt";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReceipt() {
      try {
        const res = await getWarehouseReceiptById(id as string);
        if (res.status === 1) {
          setReceipt(res.data);
        } else {
          alert("Error: " + res.message);
        }
      } catch (error) {
        alert("Failed to fetch receipt detail.");
      } finally {
        setLoading(false);
      }
    }

    fetchReceipt();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!receipt) return <p className="p-4">No receipt found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Receipt Detail</CardTitle>
          <Link href="/dashboard/staff/receipts">
            <Button variant="outline">Back to List</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p><strong>Receipt Code:</strong> {receipt.receiptCode}</p>
            <p><strong>Warehouse:</strong> {receipt.warehouseName}</p>
            <p><strong>Batch Code:</strong> {receipt.batchCode}</p>
            <p><strong>Received Quantity:</strong> {receipt.receivedQuantity}kg</p>
            <p><strong>Received At:</strong> {new Date(receipt.receivedAt).toLocaleString()}</p>
            <p><strong>Note:</strong> {receipt.note || "No note provided."}</p>
          </div>
          <div>
            <Badge
              className={`capitalize px-3 py-1 rounded-md font-medium text-sm ${receipt.status === "Completed"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
              }`}
            >
              {receipt.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
