'use client';

import { useEffect, useState } from 'react';
import { CropSeason, getAllCropSeasons } from '@/lib/api/cropSeasons';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CropSeasonCard from '@/components/crop-season/CropSeasonCard';
import FilterBadge from '@/components/crop-season/FilterBadge';
import { CropSeasonStatusMap, CropSeasonStatusValue } from '@/lib/constrant/cropSeasonStatus';

export default function FarmerCropSeasonsPage() {
    const [cropSeasons, setCropSeasons] = useState<CropSeason[]>([]);
    const [search, setSearch] = useState('');
    const statusCounts = cropSeasons.reduce<Record<CropSeasonStatusValue, number>>((acc, season) => {
        const status = season.status as CropSeasonStatusValue;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {
        Active: 0,
        Paused: 0,
        Completed: 0,
        Cancelled: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllCropSeasons();
            setCropSeasons(data);
        };
        fetchData();
    }, []);

    return (
        <div className="flex p-6 gap-6">
            <aside className="w-64 space-y-4">
                <div>
                    <Input
                        placeholder="Search here..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-2"
                    />
                    <Button variant="outline" className="w-full">Search</Button>
                </div>
                <div className="space-y-2">
                    {Object.entries(CropSeasonStatusMap).map(([key, { label, color, icon }]) => (
                        <FilterBadge
                            key={key}
                            icon={icon}
                            label={label}
                            count={statusCounts[key as CropSeasonStatusValue]}
                            color={color}
                            active={false} // bạn có thể thêm state selectedStatus
                            onClick={() => {
                                // lọc dữ liệu khi click
                            }}
                        />
                    ))}
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-800">Mùa vụ của bạn</h1>
                    <Link href="/dashboard/farmer/crop-seasons/create">
                        <Button className="bg-green-600 hover:bg-green-700">
                            + Tạo mùa vụ
                        </Button>
                    </Link>
                </div>

                {/* List of CropSeasons */}
                <div className="space-y-4">
                    {cropSeasons.slice(0, 10).map((season) => (
                        <CropSeasonCard key={season.cropSeasonId} season={season} />
                    ))}
                </div>

                <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">Showing 10 from {cropSeasons.length} data</div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
                        {[1, 2, 3, 4].map((page) => (
                            <Button key={page} variant={page === 1 ? 'default' : 'outline'} size="sm">{page}</Button>
                        ))}
                        <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
