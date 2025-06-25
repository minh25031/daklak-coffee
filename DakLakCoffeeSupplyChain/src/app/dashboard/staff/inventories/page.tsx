'use client';

import { useEffect, useState } from "react";
import { getAllInventories } from "@/lib/api/inventory"; // Assuming this function will fetch data from your API
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function InventoryListPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const res = await getAllInventories();
      if (res.status === 1) {
        setInventories(res.data);
      } else {
        alert("Error: " + res.message);
      }
    }

    fetchData();
  }, []);

  // Updated search filter to check for null/undefined values
  const filteredInventories = inventories.filter((inv) =>
    (inv.inventoryCode && inv.inventoryCode.toLowerCase().includes(search.toLowerCase())) ||
    (inv.warehouseName && inv.warehouseName.toLowerCase().includes(search.toLowerCase())) ||
    (inv.productName && inv.productName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredInventories.length / pageSize);
  const pagedInventories = filteredInventories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex min-h-screen bg-gray-50 p-6 gap-6">
      {/* Sidebar */}
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Search Inventory</h2>
          <div className="relative">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pagedInventories.map((inv) => (
              <div
                key={inv.inventoryId}
                className="flex justify-between items-center p-3 border rounded-md"
              >
                <div>
                  <p className="font-semibold">Code: {inv.inventoryCode}</p>
                  <p>Warehouse: {inv.warehouseName}</p>
                  <p>Product: {inv.productName}</p>
                </div>
                <Badge
                  className={`capitalize px-3 py-1 rounded-md font-medium text-sm ${inv.status === "Available"
                    ? "bg-green-100 text-green-800"
                    : inv.status === "OutOfStock"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {inv.status}
                </Badge>
                <Link href={`/dashboard/staff/inventories/${inv.inventoryId}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Displaying {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredInventories.length)} of {filteredInventories.length} inventories
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(totalPages).keys()].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-md px-3 py-1 text-sm ${page === currentPage ? 'bg-black text-white' : 'bg-white text-black border'}`}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
