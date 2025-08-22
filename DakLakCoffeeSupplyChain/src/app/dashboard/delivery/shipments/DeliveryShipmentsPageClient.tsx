"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Eye, Search, Calendar, MapPin, Package } from "lucide-react";
import {
    ShipmentDeliveryStatusMap,
    ShipmentDeliveryStatusValue,
} from "@/lib/constants/shipmentDeliveryStatus";
import FilterStatusPanel from "@/components/ui/filterStatusPanel";
import { cn } from "@/lib/utils";
import {
    ShipmentViewAllDto,
    getAllShipments,
} from "@/lib/api/shipments";

interface DeliveryShipmentsPageClientProps {
    searchParams: Record<string, string | string[] | undefined>;
}

export default function DeliveryShipmentsPageClient({
    searchParams,
}: DeliveryShipmentsPageClientProps) {
    const router = useRouter();

    // Get initial filters from URL params
    const initialStatus = typeof searchParams.status === "string" ? searchParams.status as ShipmentDeliveryStatusValue : null;
    const initialSearch = typeof searchParams.search === "string" ? searchParams.search : "";
    const initialStartDate = typeof searchParams.startDate === "string" ? searchParams.startDate : "";
    const initialEndDate = typeof searchParams.endDate === "string" ? searchParams.endDate : "";

    const [shipments, setShipments] = useState<ShipmentViewAllDto[]>([]);
    const [search, setSearch] = useState(initialSearch);
    const [selectedStatus, setSelectedStatus] = useState<ShipmentDeliveryStatusValue | null>(initialStatus);
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState<Date | null>(
        initialStartDate ? new Date(initialStartDate) : null
    );
    const [endDate, setEndDate] = useState<Date | null>(
        initialEndDate ? new Date(initialEndDate) : null
    );
    const [isLoading, setIsLoading] = useState(true);

    const pageSize = 10;

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                setIsLoading(true);
                const data = await getAllShipments();
                if (Array.isArray(data)) {
                    setShipments(data);
                }
            } catch (error) {
                console.error("Failed to fetch shipments:", error);
                setShipments([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShipments();
    }, []);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedStatus) params.set("status", selectedStatus);
        if (search) params.set("search", search);
        if (startDate) params.set("startDate", startDate.toISOString().split("T")[0]);
        if (endDate) params.set("endDate", endDate.toISOString().split("T")[0]);

        const newUrl = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/dashboard/delivery/shipments${newUrl}`, { scroll: false });
    }, [selectedStatus, search, startDate, endDate, router]);

    const filtered = useMemo(() => {
        return shipments.filter((s) => {
            const matchesStatus =
                !selectedStatus || s.deliveryStatus === selectedStatus;
            const matchesSearch =
                !search ||
                [s.shipmentCode, s.orderCode, s.deliveryStaffName, s.deliveryStatus]
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase());

            // Date range filter: shippedAt – receivedAt
            const shipped = s.shippedAt ? new Date(s.shippedAt) : null;
            const received = s.receivedAt ? new Date(s.receivedAt) : null;

            const matchesStartDate =
                !startDate ||
                (shipped && shipped >= startDate) ||
                (received && received >= startDate);

            const matchesEndDate =
                !endDate ||
                (received && received <= endDate) ||
                (shipped && shipped <= endDate);

            return (
                matchesStatus &&
                matchesSearch &&
                matchesStartDate &&
                matchesEndDate
            );
        });
    }, [shipments, selectedStatus, search, startDate, endDate]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage]);

    const totalPages = Math.ceil(filtered.length / pageSize);

    const statusCounts = useMemo(() => {
        const counts: Record<ShipmentDeliveryStatusValue, number> = {} as Record<ShipmentDeliveryStatusValue, number>;
        Object.keys(ShipmentDeliveryStatusMap).forEach((status) => {
            counts[status as ShipmentDeliveryStatusValue] = 0;
        });
        shipments.forEach((s) => {
            counts[s.deliveryStatus]++;
        });
        return counts;
    }, [shipments]);

    const formatDate = (iso?: string | null) => {
        if (!iso) return "";
        const date = new Date(iso);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    };

    const getStatusColor = (status: ShipmentDeliveryStatusValue) => {
        const meta = ShipmentDeliveryStatusMap[status];
        return `bg-${meta.color}-100 text-${meta.color}-700`;
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-amber-50 p-6 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
            <aside className="w-64 space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
                    <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Tìm kiếm lô giao hàng
                    </h2>
                    <div className="relative">
                        <Input
                            placeholder="Tìm kiếm mã lô, đơn hàng..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                <FilterStatusPanel<ShipmentDeliveryStatusValue>
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    statusCounts={statusCounts}
                    statusMap={ShipmentDeliveryStatusMap}
                />

                <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
                    <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Lọc theo thời gian
                    </h2>
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <label className="text-xs font-medium text-gray-600 mb-1">
                                Từ ngày
                            </label>
                            <Input
                                type="date"
                                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                                onChange={(e) => {
                                    setStartDate(e.target.value ? new Date(e.target.value) : null);
                                    setCurrentPage(1);
                                }}
                                className="text-sm"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-medium text-gray-600 mb-1">
                                Đến ngày
                            </label>
                            <Input
                                type="date"
                                value={endDate ? endDate.toISOString().split("T")[0] : ""}
                                onChange={(e) => {
                                    setEndDate(e.target.value ? new Date(e.target.value) : null);
                                    setCurrentPage(1);
                                }}
                                className="text-sm"
                            />
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý lô giao hàng</h1>
                            <p className="text-gray-600 mt-1">
                                Tổng cộng {filtered.length} lô giao hàng
                                {selectedStatus && ` - ${ShipmentDeliveryStatusMap[selectedStatus].label}`}
                            </p>
                        </div>
                    </div>

                    {paginated.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Không tìm thấy lô giao hàng nào</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paginated.map((shipment) => (
                                <div
                                    key={shipment.id}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-amber-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-amber-600" />
                                                    <span className="font-medium text-gray-900">
                                                        {shipment.shipmentCode}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    Đơn hàng: {shipment.orderCode}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">
                                                        {shipment.deliveryAddress}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">
                                                        Giao: {formatDate(shipment.shippedAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-gray-600">
                                                    Nhân viên: {shipment.deliveryStaffName}
                                                </span>
                                                <span className="text-gray-600">
                                                    Số lượng: {shipment.quantity} kg
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-medium",
                                                    getStatusColor(shipment.deliveryStatus)
                                                )}
                                            >
                                                {ShipmentDeliveryStatusMap[shipment.deliveryStatus].label}
                                            </span>
                                            <Tooltip content="Xem chi tiết">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/dashboard/delivery/shipments/${shipment.id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </Button>
                            <span className="text-sm text-gray-600">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
