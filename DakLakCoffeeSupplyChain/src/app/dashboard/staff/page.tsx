"use client";

import {
  FiPackage,
  FiClipboard,
  FiTruck,
  FiLayers,
  FiHome,
} from "react-icons/fi";
import Link from "next/link";

export default function StaffDashboard() {
  return (
    <div className="w-full bg-orange-50 min-h-screen">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard
            icon={<FiClipboard className="text-orange-500 text-xl" />}
            title="Yêu cầu nhập kho"
            description="Xem, duyệt hoặc từ chối yêu cầu nhập kho từ nông dân."
            href="/dashboard/staff/inbounds"
          />
          <DashboardCard
            icon={<FiPackage className="text-orange-500 text-xl" />}
            title="Phiếu nhập kho"
            description="Tạo và quản lý các phiếu nhập kho đã duyệt."
            href="/dashboard/staff/receipts"
          />
          <DashboardCard
            icon={<FiTruck className="text-orange-500 text-xl" />}
            title="Tồn kho"
            description="Theo dõi tình trạng hàng hóa hiện tại trong kho."
            href="/dashboard/staff/inventories"
          />
          <DashboardCard
            icon={<FiLayers className="text-orange-500 text-xl" />}
            title="Lô hàng & Mẻ sơ chế"
            description="Xem các batch sản xuất được liên kết với yêu cầu nhập kho."
            href="/dashboard/staff/batches" // nếu chưa có thì bạn có thể tạo sau
          />
          <DashboardCard
            icon={<FiHome className="text-orange-500 text-xl" />}
            title="Kho hàng"
            description="Quản lý danh sách kho, thêm và xoá kho mới."
            href="/dashboard/staff/warehouses"
          />
          <DashboardCard
            icon={<FiTruck className="text-orange-500 text-xl" />}
            title="Yêu cầu xuất kho"
            description="Xem và duyệt các yêu cầu xuất kho do quản lý tạo."
            href="/dashboard/staff/outbounds"
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </Link>
  );
}
