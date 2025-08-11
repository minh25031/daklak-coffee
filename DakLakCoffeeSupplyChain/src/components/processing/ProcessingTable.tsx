"use client";

import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import Pagination from "./Pagination";

interface Column {
  key: string;
  title: string;
  align?: "left" | "center" | "right";
  render?: (value: any, item: any) => React.ReactNode;
}

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: (item: any) => void;
  variant?: "default" | "outline" | "destructive" | "ghost";
  className?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems: number;
}

interface ProcessingTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  pagination?: PaginationProps;
  renderPagination?: boolean;
}

export default function ProcessingTable({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "Không có dữ liệu",
  emptyDescription = "Không tìm thấy mục nào phù hợp.",
  pagination,
  renderPagination = false
}: ProcessingTableProps) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
          <Package className="w-6 h-6 text-orange-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">{emptyMessage}</h3>
        <p className="text-gray-600">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-sm font-medium text-gray-700 border-b border-orange-200 ${
                    column.align === "center" ? "text-center" : 
                    column.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {column.title}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-orange-200">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-orange-50/50 transition-all duration-200">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-gray-700 ${
                      column.align === "center" ? "text-center" : 
                      column.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || "outline"}
                          size="sm"
                          className={`flex items-center gap-1 border-orange-200 hover:bg-orange-50 transition-all duration-200 ${action.className || ""}`}
                          onClick={() => action.onClick(item)}
                        >
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {renderPagination && pagination && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
          />
        </div>
      )}
    </div>
  );
}
