import { Suspense } from "react";
import ExpertAdviceUpdateFormWrapper from "./ExpertAdviceUpdateFormWrapper";

export default function EditAnomalyPage({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined>;
}) {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen bg-gray-50 p-6 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        }>
            <ExpertAdviceUpdateFormWrapper searchParams={searchParams} />
        </Suspense>
    );
}
