'use client';
import { useParams } from 'next/navigation';

export default function CreateCropSeasonDetailPage() {
    const params = useParams();
    const cropSeasonId = params.id as string;

    return (
        <div>
            <h1>Thêm vùng trồng cho mùa vụ {cropSeasonId}</h1>
            {/* form thêm detail ở đây */}
        </div>
    );
}
