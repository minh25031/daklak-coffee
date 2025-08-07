"use client";

import {
  FiPackage,
  FiClipboard,
  FiTruck,
  FiLayers,
  FiHome,
  FiBarChart2,
} from "react-icons/fi";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { getAllInboundRequests } from "@/lib/api/warehouseInboundRequest";
import { getAllOutboundRequests } from "@/lib/api/warehouseOutboundRequest";
import { getAllOutboundReceipts } from "@/lib/api/warehouseOutboundReceipt";

// Đăng ký Line chart
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function StaffDashboard() {
  const [inboundWaiting, setInboundWaiting] = useState(0);
  const [outboundWaiting, setOutboundWaiting] = useState(0);
  const [inboundPerMonth, setInboundPerMonth] = useState<number[]>([]);
  const [outboundPerMonth, setOutboundPerMonth] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [inboundRes, outboundRes, outboundReceipts] = await Promise.all([
          getAllInboundRequests(),
          getAllOutboundRequests(),
          getAllOutboundReceipts(),
        ]);

        const inboundWaitingList = inboundRes?.data?.filter((r: any) =>
          ["Pending", "Processing"].includes(r.status)
        );
        const outboundWaitingList = outboundRes?.data?.filter((r: any) =>
          ["Pending", "Processing"].includes(r.status)
        );

        setInboundWaiting(inboundWaitingList?.length || 0);
        setOutboundWaiting(outboundWaitingList?.length || 0);

        const inboundByMonth = Array(12).fill(0);
        inboundRes?.data
          ?.filter((req: any) => req.status === "Completed")
          .forEach((req: any) => {
            const month = new Date(req.createdAt).getMonth();
            inboundByMonth[month]++;
          });

        const outboundByMonth = Array(12).fill(0);
        outboundReceipts?.forEach((receipt: any) => {
          const month = new Date(receipt.exportedAt).getMonth();
          outboundByMonth[month]++;
        });

        setInboundPerMonth(inboundByMonth);
        setOutboundPerMonth(outboundByMonth);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu thống kê:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Tổng quan nhân viên kho
          </h1>
          <p className="text-gray-600 text-sm">
            Theo dõi và truy cập nhanh các chức năng quản lý kho
          </p>
        </div>

        {/* Thống kê đang chờ xử lý */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Yêu cầu nhập kho (chờ)"
            value={inboundWaiting.toString()}
            color="from-orange-400 to-pink-500"
            href="/dashboard/staff/inbounds"
          />
          <StatCard
            title="Yêu cầu xuất kho (chờ)"
            value={outboundWaiting.toString()}
            color="from-rose-400 to-red-500"
            href="/dashboard/staff/outbounds"
          />
        </div>

        {/* Biểu đồ + chức năng */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biểu đồ Line */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <FiBarChart2 className="text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Biểu đồ nhập - xuất hàng theo tháng
              </h3>
            </div>
            <Line
              data={{
                labels: Array.from({ length: 12 }, (_, i) => `Th${i + 1}`),
                datasets: [
                  {
                    label: "Nhập kho",
                    data: inboundPerMonth,
                    borderColor: "#FD7622",
                    backgroundColor: "rgba(253, 118, 34, 0.2)",
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: "Xuất kho",
                    data: outboundPerMonth,
                    borderColor: "#3B82F6",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  tooltip: {
                    mode: "index",
                    intersect: false,
                  },
                },
              }}
            />
          </div>

          {/* Danh sách chức năng */}
          <div className="grid grid-cols-2 gap-4 content-start h-full">
            <DashboardCard
              icon={<FiClipboard className="text-white w-6 h-6" />}
              title="Yêu cầu nhập kho"
              description="Xem, duyệt hoặc từ chối yêu cầu nhập kho từ nông dân."
              href="/dashboard/staff/inbounds"
              bgColor="from-orange-400 to-pink-500"
            />
            <DashboardCard
              icon={<FiPackage className="text-white w-6 h-6" />}
              title="Phiếu nhập kho"
              description="Tạo và quản lý các phiếu nhập kho đã duyệt."
              href="/dashboard/staff/receipts"
              bgColor="from-green-400 to-lime-500"
            />
            <DashboardCard
              icon={<FiTruck className="text-white w-6 h-6" />}
              title="Tồn kho"
              description="Theo dõi tình trạng hàng hóa hiện tại trong kho."
              href="/dashboard/staff/inventories"
              bgColor="from-blue-400 to-cyan-500"
            />
            <DashboardCard
              icon={<FiLayers className="text-white w-6 h-6" />}
              title="Lô hàng & Mẻ sơ chế"
              description="Xem các batch sản xuất được liên kết với yêu cầu nhập kho."
              href="/dashboard/staff/batches"
              bgColor="from-purple-500 to-indigo-500"
            />
            <DashboardCard
              icon={<FiHome className="text-white w-6 h-6" />}
              title="Kho hàng"
              description="Quản lý danh sách kho, thêm và xoá kho mới."
              href="/dashboard/staff/warehouses"
              bgColor="from-yellow-400 to-orange-500"
            />
            <DashboardCard
              icon={<FiTruck className="text-white w-6 h-6" />}
              title="Yêu cầu xuất kho"
              description="Xem và duyệt các yêu cầu xuất kho do quản lý tạo."
              href="/dashboard/staff/outbounds"
              bgColor="from-rose-400 to-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components

function DashboardCard({
  icon,
  title,
  description,
  href,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  bgColor: string;
}) {
  return (
    <Link href={href}>
      <div className="group bg-white border border-gray-100 rounded-2xl shadow hover:shadow-xl hover:scale-[1.015] transition-all cursor-pointer p-6 space-y-4">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function StatCard({
  title,
  value,
  color,
  href,
}: {
  title: string;
  value: string;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div
        className={`p-4 rounded-xl text-white bg-gradient-to-r ${color} shadow-md hover:shadow-lg transition cursor-pointer`}
      >
        <p className="text-sm">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </Link>
  );
}
