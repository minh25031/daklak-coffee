"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/crop-seasons/StatusBadge";
import {
  CropSeasonDetailStatusEnum,
  CropSeasonDetailStatusMap,
} from "@/lib/constrant/cropSeasonDetailStatus";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { CropSeasonDetail } from "@/lib/api/cropSeasons";
import { Edit, Trash } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import UpdateCropSeasonDetailDialog from "@/app/dashboard/farmer/crop-seasons/[id]/details/edit/page";
import { deleteCropSeasonDetail } from "@/lib/api/cropSeasonDetail ";

interface Props {
  details: CropSeasonDetail[];
  cropSeasonId: string;
  onReload: () => void;
}

export default function CropSeasonDetailTable({
  details,
  cropSeasonId,
  onReload,
}: Props) {
  const { user } = useAuth();
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);

  const formatDate = (date?: string) => {
    if (!date) return "Chưa cập nhật";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Chưa cập nhật" : d.toLocaleDateString("vi-VN");
  };

  const handleDelete = async (detailId: string, name: string) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xoá vùng trồng: ${name}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteCropSeasonDetail(detailId);
      toast.success("Xoá vùng trồng thành công");
      onReload();
    } catch (err: any) {
      toast.error(err.message || "Xoá vùng trồng thất bại");
    }
  };

  if (details.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Không có dữ liệu vùng trồng
      </p>
    );
  }

  return (
    <>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-3 py-2">Loại cà phê</th>
            <th className="text-left px-3 py-2">Diện tích</th>
            <th className="text-left px-3 py-2">Chất lượng</th>
            <th className="text-left px-3 py-2">Năng suất (dự kiến)</th>
            <th className="text-left px-3 py-2">Năng suất thực</th>
            <th className="text-left px-3 py-2">Thời gian thu hoạch</th>
            <th className="text-left px-3 py-2">Trạng thái</th>
            <th className="text-left px-3 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail) => (
            <tr key={detail.detailId} className="border-t">
              <td className="px-3 py-2">{detail.typeName}</td>
              <td className="px-3 py-2">
                {detail.areaAllocated && detail.areaAllocated > 0
                  ? `${detail.areaAllocated} ha`
                  : <span className="italic text-red-500">Chưa nhập</span>}
              </td>
              <td className="px-3 py-2">
                {detail.plannedQuality?.trim()
                  ? detail.plannedQuality
                  : <span className="italic text-muted-foreground">Chưa có</span>}
              </td>
              <td className="px-3 py-2">{detail.estimatedYield ?? "-"} tấn</td>
              <td className="px-3 py-2">
                {detail.actualYield !== null ? (
                  `${detail.actualYield} tấn`
                ) : (
                  <span className="italic text-muted-foreground">
                    Chưa thu hoạch
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                {detail.expectedHarvestStart
                  ? `${formatDate(detail.expectedHarvestStart)} – ${formatDate(
                    detail.expectedHarvestEnd
                  )}`
                  : "-"}
              </td>
              <td className="px-3 py-2">
                <StatusBadge
                  status={detail.status}
                  map={CropSeasonDetailStatusMap}
                />
              </td>
              <td className="px-3 py-2 space-x-1">
                <Dialog
                  open={editingDetailId === detail.detailId}
                  onOpenChange={(open) =>
                    setEditingDetailId(open ? detail.detailId : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent title="Chỉnh sửa vùng trồng">
                    <UpdateCropSeasonDetailDialog
                      detailId={detail.detailId}
                      cropSeasonId={cropSeasonId}
                      onClose={() => setEditingDetailId(null)}
                      onSuccess={onReload}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(detail.detailId, detail.typeName)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
