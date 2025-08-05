"use client";

import CreateProcessingProgressForm from "@/components/processing-batches/CreateProcessingProgressForm";
import PageTitle from "@/components/ui/PageTitle";
import React from "react";

export default function CreateProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <PageTitle
          title="Tạo tiến trình mới"
          subtitle="Thêm tiến trình sơ chế mới vào hệ thống"
        />

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-xl font-semibold">Thông tin tiến trình</h2>
          </div>
          <div className="p-6">
            <CreateProcessingProgressForm />
          </div>
        </div>
      </div>
    </div>
  );
}
