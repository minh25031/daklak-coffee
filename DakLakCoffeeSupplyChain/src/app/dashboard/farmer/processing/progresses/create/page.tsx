"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import component form đã được sửa
import CreateProcessingProgressForm from "@/components/processing-batches/CreateProcessingProgressForm";

export default function CreateProcessingProgressPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-600" />
              Thêm tiến độ sơ chế
            </h1>
            <p className="text-gray-600 mt-1">Cập nhật tiến độ cho lô sơ chế</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-blue-900">Hướng dẫn thêm tiến độ</h3>
              <p className="text-sm text-blue-700">
                Chọn lô sơ chế và nhập khối lượng đầu ra. Hệ thống sẽ tự động lấy giai đoạn đầu tiên và tạo tiến độ.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Thông tin tiến độ
            </h2>
          </div>
          
          <div className="p-6">
            <CreateProcessingProgressForm 
              onSuccess={() => {
                router.push("/dashboard/farmer/processing/progresses");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
