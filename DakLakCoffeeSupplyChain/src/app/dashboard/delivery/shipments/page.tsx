"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function DeliveryShipmentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get initial filters from URL params
    const initialStatus = searchParams.get("status") as ShipmentDeliveryStatusValue | null;
    const initialSearch = searchParams.get("search") || "";
    const initialStartDate = searchParams.get("startDate") || "";
    const initialEndDate = searchParams.get("endDate") || "";

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
                matchesStatus && matchesSearch && matchesStartDate && matchesEndDate
            );
        });
    }, [shipments, search, selectedStatus, startDate, endDate]);

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const pagedShipments = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const statusCounts = shipments.reduce<
        Record<ShipmentDeliveryStatusValue, number>
    >(
        (acc, s) => {
            const status = s.deliveryStatus as ShipmentDeliveryStatusValue;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        },
        {
            Pending: 0,
            InTransit: 0,
            Delivered: 0,
            Failed: 0,
            Returned: 0,
            Canceled: 0,
        }
    );

    const formatDateTime = (iso?: string | null) => {
        if (!iso) return "";
        const date = new Date(iso);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

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
                        {(startDate || endDate) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStartDate(null);
                                    setEndDate(null);
                                    setCurrentPage(1);
                                }}
                                className="w-full"
                            >
                                Xóa bộ lọc thời gian
                            </Button>
                        )}
                    </div>
                </div>
            </aside>

            <main className="flex-1 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quản lý lô giao hàng</h1>
                            <p className="text-gray-600 mt-1">
                                Tổng cộng {filtered.length} lô giao hàng
                                {selectedStatus && ` - ${ShipmentDeliveryStatusMap[selectedStatus].label}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-amber-600" />
                            <span className="text-sm text-gray-600">Giao hàng</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Mã lô giao</th>
                                    <th className="px-4 py-3 text-left font-medium">Đơn hàng</th>
                                    <th className="px-4 py-3 text-left font-medium">Nhân viên giao</th>
                                    <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                                    <th className="px-4 py-3 text-center font-medium">Số lượng</th>
                                    <th className="px-4 py-3 text-center font-medium">Thời gian giao</th>
                                    <th className="px-4 py-3 text-center font-medium">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedShipments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12 text-sm text-gray-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="h-8 w-8 text-gray-300" />
                                                <p>Không tìm thấy lô giao hàng nào</p>
                                                {search || selectedStatus || startDate || endDate ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSearch("");
                                                            setSelectedStatus(null);
                                                            setStartDate(null);
                                                            setEndDate(null);
                                                            setCurrentPage(1);
                                                        }}
                                                    >
                                                        Xóa tất cả bộ lọc
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pagedShipments.map((shipment) => (
                                        <tr
                                            key={shipment.shipmentId}
                                            className="border-t text-sm hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-mono font-medium text-gray-900">
                                                    {shipment.shipmentCode}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-mono text-gray-700">
                                                    {shipment.orderCode}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">
                                                        {shipment.deliveryStaffName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-xs font-medium",
                                                        getStatusColor(shipment.deliveryStatus)
                                                    )}
                                                >
                                                    {ShipmentDeliveryStatusMap[shipment.deliveryStatus].label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className="text-gray-700">
                                                    {shipment.shippedQuantity || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <div className="flex flex-col items-center text-xs text-gray-600">
                                                    {shipment.shippedAt ? (
                                                        <>
                                                            <span className="font-medium">Giao: {formatDate(shipment.shippedAt)}</span>
                                                            {shipment.receivedAt && (
                                                                <span className="text-gray-500">
                                                                    Nhận: {formatDate(shipment.receivedAt)}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">Chưa giao</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center">
                                                    <Tooltip content="Xem chi tiết">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 h-8 w-8"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/dashboard/delivery/shipments/${shipment.shipmentId}`
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                                Đang hiển thị{" "}
                                <span className="font-medium">
                                    {(currentPage - 1) * pageSize + 1}
                                </span>
                                –
                                <span className="font-medium">
                                    {Math.min(currentPage * pageSize, filtered.length)}
                                </span>{" "}
                                / {filtered.length} lô giao
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                >
                                    ← Trước
                                </Button>
                                <span className="flex items-center px-3 text-sm text-gray-600">
                                    Trang <span className="mx-1 font-semibold">{currentPage}</span>{" "}
                                    / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                    }
                                >
                                    Sau →
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
