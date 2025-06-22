"use client";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { CropSeason } from "@/lib/api/cropSeasons";
import { Button } from "@/components/ui/button";

export default function CropSeasonDetailDialog({ season }: { season: CropSeason }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#FD7622] hover:bg-orange-50 hover:text-[#d74f0f] font-medium transition px-2 py-1 rounded-md"
                >
                    Xem chi tiết
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{season.seasonName}</DialogTitle>
                    <DialogDescription>Thông tin chi tiết mùa vụ</DialogDescription>
                </DialogHeader>

                <div className="space-y-2 text-sm">
                    <p><strong>Nông dân:</strong> {season.farmerName}</p>
                    <p><strong>Diện tích:</strong> {season.area} ha</p>
                    <p><strong>Trạng thái:</strong> {season.status}</p>
                    <p><strong>Thời gian:</strong>
                        {new Date(season.startDate).toLocaleDateString('vi-VN')} – {new Date(season.endDate).toLocaleDateString('vi-VN')}
                    </p>
                </div>

                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Đóng</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
