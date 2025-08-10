"use client";

import { Button } from "@/components/ui/button";
import { Coffee, Plus } from "lucide-react";

interface ProcessingHeaderProps {
  title: string;
  description?: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;
}

export default function ProcessingHeader({
  title,
  description,
  showCreateButton = true,
  createButtonText = "Tạo mới",
  onCreateClick
}: ProcessingHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Coffee className="w-7 h-7 text-green-600" />
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {showCreateButton && onCreateClick && (
          <Button
            onClick={onCreateClick}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {createButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
