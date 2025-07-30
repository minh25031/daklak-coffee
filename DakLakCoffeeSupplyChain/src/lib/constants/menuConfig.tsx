// ===== menuConfig.ts =====

import {
  FiPieChart,
  FiUsers,
  FiFileText,
  FiSettings,
  FiBarChart2,
  FiMessageCircle,
  FiBookOpen,
  FiClipboard,
  FiFeather,
  FiTruck,
} from "react-icons/fi";
import { JSX } from "react";

const iconMap = {
  dashboard: <FiPieChart />,
  users: <FiUsers />,
  contracts: <FiFileText />,
  reports: <FiBarChart2 />,
  settings: <FiSettings />,
  feedback: <FiMessageCircle />,
  articles: <FiBookOpen />,
  consultation: <FiFeather />,
  crops: <FiClipboard />,
};

export type MenuItem =
  | {
    type: "link";
    title: string;
    href: string;
    icon: JSX.Element;
  }
  | {
    type: "group";
    title: string;
    icon: JSX.Element;
    children: MenuItem[];
  };

export const navigationItems: Record<string, MenuItem[]> = {
  farmer: [
    {
      type: "link",
      title: "Tổng quan",
      href: "/dashboard/farmer",
      icon: iconMap.dashboard,
    },
    {
      type: "group",
      title: "Mùa vụ",
      icon: iconMap.crops,
      children: [
        {
          type: "link",
          title: "Tất cả mùa vụ",
          href: "/dashboard/farmer/crop-seasons",
          icon: iconMap.crops,
        },
        {
          type: "link",
          title: "Giai đoạn sinh trưởng",
          href: "/dashboard/farmer/crop-stages",
          icon: iconMap.crops,
        },
        {
          type: "link",
          title: "Tiến độ mùa vụ",
          href: "/dashboard/farmer/crop-progress",
          icon: iconMap.crops,
        },
      ],
    },
    {
      type: "link",
      title: "Tư vấn",
      href: "/dashboard/farmer/request-feedback",
      icon: iconMap.feedback,
    },
    {
      type: "link",
      title: "Gửi yêu cầu nhập kho",
      href: "/dashboard/farmer/warehouse-request",
      icon: iconMap.crops,
    },
  ],

  admin: [
    {
      type: "link",
      title: "Tổng quan",
      href: "/dashboard/admin",
      icon: iconMap.dashboard,
    },
    {
      type: "link",
      title: "Quản lý người dùng",
      href: "/dashboard/admin/users",
      icon: iconMap.users,
    },
    {
      type: "link",
      title: "Hợp đồng",
      href: "/dashboard/admin/contracts",
      icon: iconMap.contracts,
    },
    {
      type: "link",
      title: "Báo cáo",
      href: "/dashboard/admin/reports",
      icon: iconMap.reports,
    },
    {
      type: "link",
      title: "Cài đặt",
      href: "/dashboard/admin/settings",
      icon: iconMap.settings,
    },
  ],

  expert: [
    {
      type: "link",
      title: "Tổng quan",
      href: "/dashboard/expert",
      icon: iconMap.dashboard,
    },
    {
      type: "link",
      title: "Tư vấn",
      href: "/dashboard/expert/consultations",
      icon: iconMap.consultation,
    },
    {
      type: "link",
      title: "Bài viết",
      href: "/dashboard/expert/articles",
      icon: iconMap.articles,
    },
  ],

  staff: [
    {
      type: "link",
      title: "Yêu cầu nhập kho",
      href: "/dashboard/staff/inbounds",
      icon: iconMap.crops,
    },
    {
      type: "link",
      title: "Phiếu nhập kho",
      href: "/dashboard/staff/receipts",
      icon: iconMap.contracts,
    },
    {
      type: "link",
      title: "Tồn kho",
      href: "/dashboard/staff/inventories",
      icon: iconMap.dashboard,
    },
    {
      type: "link",
      title: "Lô hàng",
      href: "/dashboard/staff/batches",
      icon: iconMap.articles,
    },
    {
      type: "link",
      title: "Kho hàng",
      href: "/dashboard/staff/warehouses",
      icon: iconMap.settings,
    },
  ],

  manager: [
    {
      type: "link",
      title: "Tổng quan",
      href: "/dashboard/manager",
      icon: iconMap.dashboard,
    },
    {
      type: "link",
      title: "Hợp đồng",
      href: "/dashboard/manager/contracts",
      icon: iconMap.contracts,
    },
    {
      type: "link",
      title: "Kế hoạch thu mua",
      href: "/dashboard/manager/procurement-plans",
      icon: iconMap.crops,
    },
    {
      type: "link",
      title: "Cam kết với nông dân",
      href: "/dashboard/manager/farming-commitments",
      icon: iconMap.contracts,
    },
    {
      type: "link",
      title: "Nông dân",
      href: "/dashboard/manager/farmers",
      icon: iconMap.users,
    },
    {
      type: "link",
      title: "Lô chế biến",
      href: "/dashboard/manager/processing/batches",
      icon: iconMap.articles,
    },
    {
      type: "link",
      title: "Báo cáo",
      href: "/dashboard/manager/reports",
      icon: iconMap.reports,
    },
  ],
};
