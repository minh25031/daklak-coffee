'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ProcurementPlanStatusValue } from '@/lib/constrant/procurementPlanStatus';
import { cn, getErrorMessage } from '@/lib/utils';
import FilterStatusPanel from '@/components/procurement-plan/FilterStatusPanel';
import { ProcurementPlan, getAllProcurementPlans } from '@/lib/api/procurementPlans';
import ProcurementPlanCard from '@/components/procurement-plan/ProcurementPlanCard';

export default function BusinessProcurementPlansPage() {
    const [procurementPlans, setProcurementPlans] = useState<ProcurementPlan[]>([]);
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllProcurementPlans().catch((error) => {
                alert(getErrorMessage(error));
                return [];
            });
            console.log('Fetched Procurement Plans:', data);
            setProcurementPlans(data);
        };
        fetchData();
    }, []);

    const filteredPlans = procurementPlans.filter(plan =>
        (!selectedStatus || plan.status === selectedStatus) &&
        (!search || plan.title.toLowerCase().includes(search.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredPlans.length / pageSize);
    const pagedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const statusCounts = procurementPlans.reduce<Record<ProcurementPlanStatusValue, number>>((acc, plan) => {
        const status = plan.status as ProcurementPlanStatusValue;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {
        Open: 0,
        Closed: 0,
        Draft: 0,
        Cancelled: 0,
        Delete: 0,
    });

    return (
        <div className="flex bg-amber-200-50 p-6 gap-6">
            {/* Sidebar */}
            <aside className="w-64 space-y-4">
                {/* Search block */}
                <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
                    <h2 className="text-sm font-medium text-gray-700">Tìm kiếm kế hoạch thu mua</h2>
                    <div className="relative">
                        <Input
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex justify-end text-sm">
                        <Button className="w-full bg-[#FD7622] hover:bg-[#d74f0f] text-white font-medium text-sm">
                            Search
                        </Button>

                    </div>
                </div>

                <FilterStatusPanel
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    statusCounts={statusCounts}
                />
            </aside>

            {/* Main content */}
            <main className="flex-1 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <table className="w-full text-sm table-auto">
                        <thead className="bg-gray-100 text-gray-700 font-medium">
                            <tr>
                                <th className="px-4 py-3 text-left">Tên kế hoạch</th>
                                <th className="px-4 py-3 text-left">Tổng sản lượng</th>
                                <th className="px-4 py-3 text-left">Tỷ lệ hoàn thành</th>
                                <th className="px-4 py-3 text-left">Trạng thái</th>
                                <th className="px-4 py-3 text-left">Ngày bắt đầu – kết thúc mở đơn</th>
                                <th className="px-4 py-3 text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedPlans.map((plan) => (
                                <ProcurementPlanCard key={plan.planId} plan={plan} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredPlans.length)} trong {filteredPlans.length} kế hoạch
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {[...Array(totalPages).keys()].map((_, i) => {
                            const page = i + 1;
                            return (
                                <Button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        'rounded-md px-3 py-1 text-sm',
                                        page === currentPage ? 'bg-black text-white' : 'bg-white text-black border'
                                    )}
                                >
                                    {page}
                                </Button>
                            );
                        })}
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
