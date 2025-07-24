'use client';

import {
  FiFileText,
  FiUsers,
  FiPackage,
  FiBarChart2,
  FiHome,
  FiTruck,
  FiClock, // 🚚 Biểu tượng phù hợp cho Xuất kho
} from 'react-icons/fi';
import Link from 'next/link';
import React from 'react';

export default function ManagerDashboard() {
  return (
    <div className="w-full bg-orange-50 min-h-screen">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard
            icon={<FiFileText className="text-orange-500 text-xl" />}
            title="Hợp đồng thu mua"
            description="Theo dõi và quản lý các hợp đồng với nông hộ và doanh nghiệp."
          />
          <DashboardCard
            icon={<FiUsers className="text-orange-500 text-xl" />}
            title="Danh sách nông dân"
            description="Xem và tương tác với các nông hộ đang hợp tác."
          />
          <DashboardCard
            icon={<FiPackage className="text-orange-500 text-xl" />}
            title="Mẻ sơ chế"
            description="Quản lý và theo dõi các mẻ sơ chế theo mùa vụ."
          />
          <DashboardCard
            icon={<FiBarChart2 className="text-orange-500 text-xl" />}
            title="Báo cáo sản lượng"
            description="Thống kê về sản lượng, chất lượng và tiến độ."
          />

          {/* ✅ Kho hàng */}
          <Link href="/dashboard/manager/warehouses">
            <DashboardCard
              icon={<FiHome className="text-orange-500 text-xl" />}
              title="Kho hàng"
              description="Quản lý danh sách kho, thêm và xoá kho mới."
              isLink
            />
          </Link>

          {/* ✅ Thêm nút Yêu cầu xuất kho */}
          <Link href="/dashboard/manager/warehouse-request">
            <DashboardCard
              icon={<FiTruck className="text-orange-500 text-xl" />}
              title="Yêu cầu xuất kho"
              description="Gửi yêu cầu và theo dõi các yêu cầu xuất hàng từ kho."
              isLink
            />
          </Link>
          {/* ✅ Tồn kho (Inventory) */}
          <Link href="/dashboard/manager/inventories">
            <DashboardCard
              icon={<FiPackage className="text-orange-500 text-xl" />} // 📦 dùng icon cũ cho nhất quán
              title="Tồn kho"
              description="Xem danh sách hàng tồn trong các kho do bạn quản lý."
              isLink
            />
          </Link>
          {/* ✅ Lịch sử tồn kho */}
          <Link href="/dashboard/manager/inventory-logs">
            <DashboardCard
              icon={<FiClock className="text-orange-500 text-xl" />}
              title="Lịch sử tồn kho"
              description="Xem toàn bộ lịch sử thay đổi tồn kho theo công ty bạn."
              isLink
            />
          </Link>
          {/* ✅ Quản lý nhân viên (BusinessStaffs) */}
          <Link href="/dashboard/manager/business-staffs">
            <DashboardCard
              icon={<FiUsers className="text-orange-500 text-xl" />}
              title="Nhân viên"
              description="Xem, tạo và quản lý danh sách nhân viên thuộc công ty bạn."
              isLink
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  isLink,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLink?: boolean;
}) {
  return (
    <div
      className={`p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition ${
        isLink ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
