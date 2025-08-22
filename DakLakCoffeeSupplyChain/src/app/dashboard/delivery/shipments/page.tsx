import { Suspense } from "react";
import DeliveryShipmentsPageClient from "./DeliveryShipmentsPageClient";

export default function DeliveryShipmentsPage({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined>;
}) {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen bg-amber-50 p-6 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        }>
            <DeliveryShipmentsPageClient searchParams={searchParams} />
        </Suspense>
    );
}
