'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWarehouseReceipt } from "@/lib/api/warehouseReceipt"; // Import API for creating receipt
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"; // Import Select for dropdowns

export default function CreateReceiptPage() {
  const [warehouseId, setWarehouseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [receivedQuantity, setReceivedQuantity] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();

  // Handle form submit to create warehouse receipt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouseId || !batchId || receivedQuantity <= 0) {
      setError('Please fill all fields and ensure the quantity is positive');
      return;
    }

    const receiptData = {
      warehouseId,
      batchId,
      receivedQuantity,
      note,
    };

    try {
      const result = await createWarehouseReceipt(receiptData); // Call the API to create receipt
      alert('Receipt created successfully');
      router.push('/dashboard/staff/receipts');
    } catch (err) {
      setError('Failed to create receipt. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Warehouse Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Warehouse</label>
              <Select value={warehouseId} onValueChange={(value) => setWarehouseId(value)}>
                <SelectTrigger className="mt-1">
                  <span>Select Warehouse</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Warehouse 1</SelectItem>
                  <SelectItem value="2">Warehouse 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Batch</label>
              <Select value={batchId} onValueChange={(value) => setBatchId(value)}>
                <SelectTrigger className="mt-1">
                  <span>Select Batch</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batch1">Batch 1</SelectItem>
                  <SelectItem value="batch2">Batch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Received Quantity (kg)</label>
              <Input 
                type="number" 
                value={receivedQuantity} 
                onChange={(e) => setReceivedQuantity(Number(e.target.value))} 
                className="mt-1"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Note</label>
              <Textarea 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                className="mt-1"
                placeholder="Add any additional notes here"
              />
            </div>

            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-green-500 text-white">
                Create Receipt
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
