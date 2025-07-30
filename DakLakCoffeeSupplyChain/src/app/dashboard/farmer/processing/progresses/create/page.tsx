"use client";

import CreateProcessingProgressForm from "@/components/processing-batches/CreateProcessingProgressForm";
import React, { useEffect, useState } from "react";

export default function CreateProgressPage() {
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Tạo tiến trình mới</h2>
      <CreateProcessingProgressForm />
    </div>
  );
}
