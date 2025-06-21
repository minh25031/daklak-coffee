import { CropSeason } from '@/lib/api/cropSeasons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CropSeasonCard({ season }: { season: CropSeason }) {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <Card>
            <CardContent className="p-4 space-y-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                    {season.cropSeasonId}
                </Badge>
                <div className="font-semibold text-base">{season.seasonName}</div>
                <div className="text-sm text-gray-600">👨 Farmer: {season.farmerName}</div>
                <div className="grid grid-cols-4 text-sm mt-2 gap-4">
                    <div><strong>Diện tích:</strong> {season.area} ha</div>
                    <div>
                        <strong>Trạng thái:</strong>
                        <Badge
                            className={cn(
                                "ml-1 px-2 py-0.5 rounded-full border text-xs",
                                season.status === 'Active'
                                    ? 'bg-green-100 text-green-700 border-green-500'
                                    : 'bg-red-100 text-red-700 border-red-500'
                            )}
                        >
                            {season.status === 'Active' ? 'Đang hoạt động' : 'Tạm dừng'}
                        </Badge>
                    </div>
                    <div><strong>Bắt đầu:</strong> {formatDate(season.startDate)}</div>
                    <div><strong>Kết thúc:</strong> {formatDate(season.endDate)}</div>
                </div>
                <div className="text-right mt-2">
                    <Link href={`/dashboard/farmer/crop-seasons/${season.cropSeasonId}`}>
                        <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                            Xem chi tiết
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
