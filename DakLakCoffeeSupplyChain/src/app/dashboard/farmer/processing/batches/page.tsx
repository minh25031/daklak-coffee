"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllProcessingBatches,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Package, Calendar, Clock, Eye, Edit, Filter } from "lucide-react";

export default function Batches() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log('=== DEBUG: Starting fetchData ===');
      
      try {
        const [batchesData, coffeeTypesData] = await Promise.all([
          getAllProcessingBatches(),
          getCoffeeTypes()
        ]);
        
        console.log('Batches data:', batchesData);
        console.log('Coffee types data:', coffeeTypesData);
        
        if (batchesData) {
          setBatches(batchesData);
          console.log('Set batches:', batchesData.length);
          // Debug: kiểm tra toàn bộ cấu trúc của batch đầu tiên
          if (batchesData.length > 0) {
            console.log('=== DEBUG: First batch structure ===');
            console.log('First batch:', batchesData[0]);
            console.log('All keys:', Object.keys(batchesData[0]));
            console.log('coffeeTypeId:', batchesData[0].coffeeTypeId);
            console.log('coffeeType:', (batchesData[0] as any).coffeeType);
            console.log('coffeeTypeName:', (batchesData[0] as any).coffeeTypeName);
          }
          // Debug: kiểm tra coffeeTypeId trong batch data
          batchesData.forEach(batch => {
            console.log(`Batch ID: ${batch.batchId}, Coffee Type ID: ${batch.coffeeTypeId}`);
          });
        } else {
          setBatches([]); 
          console.log('No batches data, set empty array');
        }
        
        setCoffeeTypes(coffeeTypesData || []);
        console.log('Set coffee types:', coffeeTypesData?.length || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = batches.filter(
    (b) =>
      (selectedStatus === null || b.status === selectedStatus) &&
      (!search || b.batchCode.toLowerCase().includes(search.toLowerCase()))
  );

  // Đếm số lượng theo trạng thái
  const statusCounts = batches.reduce<Record<number, number>>((acc, batch) => {
    acc[batch.status] = (acc[batch.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700", icon: "⏳" };
      case 1:
        return { label: "Đang xử lý", color: "bg-blue-100 text-blue-700", icon: "🔄" };
      case 2:
        return { label: "Hoàn thành", color: "bg-green-100 text-green-700", icon: "✅" };
      case 3:
        return { label: "Đã hủy", color: "bg-red-100 text-red-700", icon: "❌" };
      default:
        return { label: "Không xác định", color: "bg-gray-100 text-gray-700", icon: "❓" };
    }
  };

  const getCoffeeTypeName = (coffeeTypeId: string) => {
    if (!coffeeTypeId) return "Chưa xác định";
  
    const matched = coffeeTypes.find(
      ct => ct.coffeeTypeId?.trim().toLowerCase() === coffeeTypeId.trim().toLowerCase()
    );
  
    return matched?.typeName || "Không xác định";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Quản lý lô sơ chế
            </h1>
            <p className="text-gray-600">Theo dõi và quản lý các lô sơ chế cà phê</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/farmer/processing/batches/create")}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm lô sơ chế
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Tổng lô</p>
                <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts[0] || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Đang xử lý</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts[1] || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts[2] || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Đã tìm thấy</p>
                <p className="text-2xl font-bold text-purple-600">{filtered.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-600" />
                  Tìm kiếm
                </h2>
                <div className="relative">
                  <Input
                    placeholder="Tìm mã lô..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  Lọc theo trạng thái
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedStatus === null
                        ? "bg-green-100 border-green-300 text-green-700"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tất cả</span>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {batches.length}
                      </span>
                    </div>
                  </button>
                  
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const statusInfo = getStatusInfo(parseInt(status));
                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(parseInt(status))}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          selectedStatus === parseInt(status)
                            ? "bg-green-100 border-green-300 text-green-700"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{statusInfo.label}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách lô sơ chế</h2>
                <p className="text-gray-600 mt-1">Hiển thị {filtered.length} trong tổng số {batches.length} lô</p>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy lô nào</h3>
                  <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm lô mới.</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((batch) => {
                      const statusInfo = getStatusInfo(batch.status);
                      return (
                        <div
                          key={batch.batchId}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg group flex flex-col h-full"
                        >
                          <div className="p-6 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">Mã Lô: {batch.batchCode}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                        
                                </div>
                              </div>
                              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                                <Package className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                            
                            <div className="space-y-3 flex-grow">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Mùa vụ:</span>
                                <span>{batch.cropSeasonName || batch.cropSeasonId}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Phương pháp:</span>
                                <span>{batch.methodName || `ID: ${batch.methodId}`}</span>
                              </div>
                              
                              {batch.coffeeTypeId && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="font-medium">Loại cà phê:</span>
                                  <span>{getCoffeeTypeName(batch.coffeeTypeId)}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {batch.createdAt
                                    ? new Date(batch.createdAt).toLocaleDateString("vi-VN")
                                    : "—"}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                onClick={() => router.push(`/dashboard/farmer/processing/batches/${batch.batchId}`)}
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                onClick={() => router.push(`/dashboard/farmer/processing/batches/${batch.batchId}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                                Sửa
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
