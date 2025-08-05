"use client";

import { useEffect, useState } from "react";
import {
  getAllProcessingMethods,
  ProcessingMethod,
} from "@/lib/api/processingMethods";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Coffee, Layers, Eye, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/ui/PageTitle";

export default function ProcessingMethodsPage() {
  const router = useRouter();
  const [data, setData] = useState<ProcessingMethod[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const result = await getAllProcessingMethods();
    console.log("Fetched data:", result);
    setData(result);
    setLoading(false);
  };
  fetchData();
}, []);

  const filtered = data.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <PageTitle
            title="Quản lý phương pháp sơ chế"
            subtitle="Thiết lập và quản lý các phương pháp sơ chế cà phê"
          />
          <Button
            onClick={() => router.push("/dashboard/farmer/processing/processing-methods/create")}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm phương pháp
          </Button>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng phương pháp</p>
              <p className="text-3xl font-bold text-gray-900">{data.length}</p>
              <p className="text-sm text-gray-600 mt-1">Phương pháp sơ chế</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
              <Coffee className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-600" />
                Tìm kiếm
              </h2>
              <div className="relative">
                <Input
                  placeholder="Tìm kiếm phương pháp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Thống kê</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Tất cả</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {data.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Đã tìm thấy</span>
                    <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      {filtered.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách phương pháp sơ chế</h2>
                <p className="text-gray-600 mt-1">Hiển thị {filtered.length} phương pháp</p>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coffee className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy phương pháp nào</h3>
                  <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm phương pháp mới.</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((method) => (
                      <div
                        key={method.methodId}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg group flex flex-col h-full"
                      >
                        <div className="p-6 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg mb-2">{method.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Layers className="w-4 h-4" />
                                <span>ID: {method.methodId}</span>
                              </div>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-200">
                              <Coffee className="w-5 h-5 text-orange-600" />
                            </div>
                          </div>
                          
                          <div className="space-y-3 flex-grow">
                            <div className="flex items-start gap-2">
                              <Coffee className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {method.description || "Chưa có mô tả cho phương pháp này."}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                              onClick={() => router.push(`/dashboard/farmer/processing/processing-methods/${method.methodId}`)}
                            >
                              <Eye className="w-4 h-4" />
                              Xem chi tiết
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                              onClick={() => router.push(`/dashboard/farmer/processing/processing-methods/${method.methodId}/edit`)}
                            >
                              <Edit className="w-4 h-4" />
                              Sửa
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
