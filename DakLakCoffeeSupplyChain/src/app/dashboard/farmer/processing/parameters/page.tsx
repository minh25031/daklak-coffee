"use client";

import { useEffect, useState } from "react";
import {
  getAllProcessingParameters,
  ProcessingParameter,
} from "@/lib/api/processingParameters";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Sliders } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProcessingParametersPage() {
  const [data, setData] = useState<ProcessingParameter[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getAllProcessingParameters();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((param) =>
    param.parameterName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-amber-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Tìm kiếm tham số..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <Button
          onClick={() =>
            router.push("/dashboard/farmer/processing/parameters/create")
          }
          className="flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm tham số
        </Button>
      </div>

      <Card className="shadow-md border border-gray-100">
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-lg font-semibold text-gray-800">
          
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-6 text-center text-sm text-gray-500 italic">
              ⏳ Đang tải dữ liệu...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 italic">
              🚫 Không tìm thấy tham số nào
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 text-gray-700">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left">
                    Tên tham số
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left">Giá trị</TableHead>
                  <TableHead className="px-6 py-3 text-left">Đơn vị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow
                    key={item.parameterId}
                    className="hover:bg-orange-50 transition border-b"
                  >
                    <TableCell className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-orange-400" />
                      {item.parameterName}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-700">
                      {item.value}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">
                      {item.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
