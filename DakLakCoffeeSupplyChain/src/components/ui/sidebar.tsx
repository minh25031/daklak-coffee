"use client";

import { JSX, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import React from "react";
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
  FiChevronDown,
} from "react-icons/fi";

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

// ===== Sidebar Layout =====
interface SidebarProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  children,
  defaultCollapsed = false,
  onCollapseChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (
      typeof child === "object" &&
      child &&
      "type" in child &&
      (child as any).type.name === "SidebarFooter"
    ) {
      return React.cloneElement(child as React.ReactElement<any>, {
        isCollapsed,
      });
    }
    return child;
  });

  return (
    <aside
      className={cn(
        "h-screen bg-white border-r shadow-sm transition-all duration-300",
        isCollapsed ? "w-[64px]" : "w-[260px]",
        "flex flex-col fixed left-0 top-0 z-50"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2 overflow-hidden">
          {!isCollapsed && (
            <>
              <img src="/logo_bg.png" alt="logo" className="w-7 h-7" />
              <span className="text-xl font-bold text-orange-600 truncate">
                DakLakCoffee
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => {
            const newState = !isCollapsed;
            setIsCollapsed(newState);
            onCollapseChange?.(newState);
          }}
          className="text-orange-600 hover:bg-orange-100 rounded p-1"
        >
          <Menu size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-auto">{childrenWithProps}</div>
    </aside>
  );
}

// ===== Sidebar Header =====
export function SidebarHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="px-4 py-2 border-b font-medium text-sm">{children}</div>
  );
}

// ===== Sidebar Content =====
export function SidebarContent({ children }: { children: ReactNode }) {
  return <nav className="py-4 space-y-1">{children}</nav>;
}

// ===== Sidebar Group (navigation) =====
export function SidebarGroup() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [processingOpen, setProcessingOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("user_role"); // slug: "admin", "expert", ...
    setRole(storedRole);
  }, []);

  const navigationItems: Record<
    string,
    { title: string; href: string; icon: JSX.Element }[]
  > = {
    farmer: [
      {
        title: "Tổng quan",
        href: "/dashboard/farmer",
        icon: iconMap.dashboard,
      },
      {
        title: "Mùa vụ",
        href: "/dashboard/farmer/crop-seasons",
        icon: iconMap.crops,
      },
      {
        title: "Giai đoạn mùa vụ",
        href: "/dashboard/farmer/crop-stages",
        icon: iconMap.crops,
      },
      {
        title: "Tư vấn",
        href: "/dashboard/farmer/request-feedback",
        icon: iconMap.feedback,
      },
      {
        title: "Gửi yêu cầu nhập kho",
        href: "/dashboard/farmer/warehouse-request",
        icon: <FiTruck />,
      },
    ],
    admin: [
      { title: "Tổng quan", href: "/dashboard/admin", icon: iconMap.dashboard },
      {
        title: "Quản lý người dùng",
        href: "/dashboard/admin/users",
        icon: iconMap.users,
      },
      {
        title: "Hợp đồng",
        href: "/dashboard/admin/contracts",
        icon: iconMap.contracts,
      },
      {
        title: "Báo cáo",
        href: "/dashboard/admin/reports",
        icon: iconMap.reports,
      },
      {
        title: "Cài đặt",
        href: "/dashboard/admin/settings",
        icon: iconMap.settings,
      },
    ],
    expert: [
      {
        title: "Tổng quan",
        href: "/dashboard/expert",
        icon: iconMap.dashboard,
      },
      {
        title: "Tư vấn",
        href: "/dashboard/expert/consultations",
        icon: iconMap.consultation,
      },
      {
        title: "Bài viết",
        href: "/dashboard/expert/articles",
        icon: iconMap.articles,
      },
    ],
    staff: [
      {
        title: "Tổng quan",
        href: "/dashboard/staff",
        icon: iconMap.dashboard,
      },
      // {
      //   title: "Yêu cầu nhập kho",
      //   href: "/dashboard/staff/inbounds",
      //   icon: <FiClipboard />,
      // },
      // {
      //   title: "Phiếu nhập kho",
      //   href: "/dashboard/staff/receipts",
      //   icon: <FiFileText />,
      // },
      // {
      //   title: "Tồn kho",
      //   href: "/dashboard/staff/inventories",
      //   icon: <FiPieChart />,
      // },
      {
        title: "Lô hàng",
        href: "/dashboard/staff/batches",
        icon: <FiBookOpen />,
      },
      // {
      //   title: "Kho hàng",
      //   href: "/dashboard/staff/warehouses",
      //   icon: <FiSettings />,
      // },
      // {
      //   title: "Yêu cầu xuất kho",
      //   href: "/dashboard/staff/outbounds",
      //   icon: <FiClipboard />,
      // },

      // {
      //   title: "Phiếu xuất kho",
      //   href: "/dashboard/staff/outbound-receipts",
      //   icon: <FiFileText />,
      // },
    
    ],
    manager: [
      {
        title: "Tổng quan",
        href: "/dashboard/manager",
        icon: iconMap.dashboard,
      },
      {
        title: "Hợp đồng",
        href: "/dashboard/manager/contracts",
        icon: iconMap.contracts,
      },
      {
        title: "Kế hoạch thu mua",
        href: "/dashboard/manager/procurement-plans",
        icon: iconMap.crops,
      },
      {
        title: "Cam kết với nông dân",
        href: "/dashboard/manager/farming-commitments",
        icon: iconMap.contracts,
      },
      {
        title: "Nông dân",
        href: "/dashboard/manager/farmers",
        icon: iconMap.users,
      },
      {
        title: "Lô chế biến",
        href: "/dashboard/manager/processing/batches",
        icon: <FiBookOpen />,
      },
      {
        title: "Báo cáo",
        href: "/dashboard/manager/reports",
        icon: iconMap.reports,
      },
      {
        title: "Kho hàng",
        href: "/dashboard/manager/warehouses",
        icon: <FiSettings />,
      },
      {
        title: "Yêu cầu xuất kho",
        href: "/dashboard/manager/warehouse-request",
        icon: <FiClipboard />,
      },
      
    ],
  };

  if (!role || !navigationItems[role]) {
    return <div className="px-4 text-gray-400 text-sm">Đang tải menu...</div>;
  }

  return (
    <div className="space-y-1 px-2">
      {navigationItems[role].map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            )}
          >
            <span className="shrink-0 w-5 text-center">{item.icon}</span>
            <span className="truncate">{item.title}</span>
          </Link>
        );
      })}
      {role === "farmer" && (
        <div>
          <button
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors",
              pathname.startsWith("/dashboard/farmer/processing")
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            )}
            onClick={() => setProcessingOpen((v) => !v)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 w-5 text-center">
                {iconMap.articles}
              </span>
              <span className="truncate">Sơ chế</span>
            </div>
            <FiChevronDown
              className={cn("transition", processingOpen && "rotate-180")}
            />
          </button>
          {processingOpen && (
            <div className="pl-8 space-y-1">
              <Link
                href="/dashboard/farmer/processing/batches"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/dashboard/farmer/processing"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                Danh sách lô sơ chế
              </Link>
              <Link
                href="/dashboard/farmer/processing/evaluations"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(
                    "/dashboard/farmer/processing/evaluations"
                  )
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                Đánh giá lô sơ chế
              </Link>
              <Link
                href="/dashboard/farmer/processing/progresses"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard/farmer/processing/progresses")
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                Tiến trình lô sơ chế
              </Link>
              <Link
                href="/dashboard/farmer/processing/wastes"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard/farmer/processing/wastes")
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                Chất thải lô sơ chế
              </Link>
              <Link
                href="/dashboard/farmer/processing/methods"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard/farmer/processing/methods")
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                Phương pháp sơ chế
              </Link>
              <Link
                href="/dashboard/farmer/processing/parameters"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard/farmer/processing/parameters")
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                Tham số sơ chế
              </Link>
              <Link
                href="/dashboard/farmer/processing/stages"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard/farmer/processing/stages")
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                Công đoạn sơ chế
              </Link>
              <Link
                href="/dashboard/farmer/processing/waste-disposals"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(
                    "/dashboard/farmer/processing/waste-disposals"
                  )
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                Xử lý chất thải lô sơ chế
              </Link>
            </div>
          )}
        </div>
      )}
     {role === "manager" && (
  <div>
    <button
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors",
        pathname.startsWith("/dashboard/manager/processing")
          ? "bg-orange-100 text-orange-700"
          : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
      )}
      onClick={() => setProcessingOpen((v) => !v)}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="shrink-0 w-5 text-center">
          <FiBookOpen />
        </span>
        <span className="truncate">Chế biến</span>
      </div>
      <FiChevronDown
        className={cn("transition", processingOpen && "rotate-180")}
      />
    </button>
    {processingOpen && (
      <div className="pl-8 space-y-1">
        <Link href="/dashboard/manager/processing/batches" className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname === "/dashboard/manager/processing/batches"
            ? "bg-orange-100 text-orange-700"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        )}>
          Danh sách lô chế biến
        </Link>
        <Link href="/dashboard/manager/processing/evaluations" className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname.startsWith("/dashboard/manager/processing/evaluations")
            ? "bg-orange-100 text-orange-700"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        )}>
          Đánh giá lô chế biến
        </Link>
        <Link href="/dashboard/manager/processing/progresses" className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname.startsWith("/dashboard/manager/processing/progresses")
            ? "bg-orange-100 text-orange-700"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        )}>
          Tiến trình lô chế biến
        </Link>
        <Link href="/dashboard/manager/processing/wastes" className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname.startsWith("/dashboard/manager/processing/wastes")
            ? "bg-orange-100 text-orange-700"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        )}>
          Chất thải lô chế biến
        </Link>
        <Link href="/dashboard/manager/processing/methods" className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname.startsWith("/dashboard/manager/processing/methods")
            ? "bg-orange-100 text-orange-700"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        )}>
          Phương pháp chế biến
        </Link>
        <Link href="/dashboard/manager/processing/parameters" className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname.startsWith("/dashboard/manager/processing/parameters")
            ? "bg-orange-100 text-orange-700"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        )}>
          Tham số chế biến
        </Link>
        <Link href="/dashboard/manager/processing/stages" className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname.startsWith("/dashboard/manager/processing/stages")
            ? "bg-orange-100 text-orange-700"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        )}>
          Công đoạn chế biến
        </Link>
        <Link href="/dashboard/manager/processing/waste-disposals" className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname.startsWith("/dashboard/manager/processing/waste-disposals")
            ? "bg-orange-100 text-orange-700"
            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        )}>
          Xử lý chất thải lô chế biến
        </Link>
      </div>
    )}
  </div>
)}

{/* Dropdown: VẬN HÀNH KHO cho MANAGER */}
{role === "manager" && (
  <>
    {(() => {
      const links = [
        {
          label: "Yêu cầu xuất kho",
          href: "/dashboard/manager/warehouse-request",
          activeMatch: (path: string) => path === "/dashboard/manager/warehouse-request",
        },
        {
          label: "Kho hàng",
          href: "/dashboard/manager/warehouses",
          activeMatch: (path: string) => path === "/dashboard/manager/warehouses",
        },
        {
          label: "Lịch sử tồn kho",
          href: "/dashboard/manager/inventory-logs",
          activeMatch: (path: string) => path === "/dashboard/manager/warehouse-request",
        },

      ];

      const isActive = links.some((item) => item.activeMatch(pathname));

      return (
        <div>
          <button
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors",
              isActive
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            )}
            onClick={() => setProcessingOpen((v) => !v)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 w-5 text-center">
                <FiClipboard />
              </span>
              <span className="truncate">Vận hành kho</span>
            </div>
            <FiChevronDown className={cn("transition", processingOpen && "rotate-180")} />
          </button>

          {processingOpen && (
            <div className="pl-8 space-y-1">
              {links.map(({ label, href, activeMatch }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activeMatch(pathname)
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    })()}
  </>
)}

    {role === "staff" && (
  <>
    {/* --- Dropdown: VẬN HÀNH KHO --- */}
    {(() => {
      const operationLinks = [
        {
          label: "Yêu cầu nhập kho",
          href: "/dashboard/staff/inbounds",
          activeMatch: (path: string) => path === "/dashboard/staff/inbounds",
        },
        {
          label: "Phiếu nhập kho",
          href: "/dashboard/staff/receipts",
          activeMatch: (path: string) => path === "/dashboard/staff/receipts",
        },
        {
          label: "Yêu cầu xuất kho",
          href: "/dashboard/staff/outbounds",
          activeMatch: (path: string) => path === "/dashboard/staff/outbounds",
        },
        {
          label: "Phiếu xuất kho",
          href: "/dashboard/staff/outbound-receipts",
          activeMatch: (path: string) => path === "/dashboard/staff/outbound-receipts",
        },
      ];

      const isOperationActive = operationLinks.some((item) => item.activeMatch(pathname));

      return (
        <div>
          <button
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors",
              isOperationActive
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            )}
            onClick={() => setProcessingOpen((v) => !v)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 w-5 text-center">
                <FiClipboard />
              </span>
              <span className="truncate">Vận hành kho</span>
            </div>
            <FiChevronDown className={cn("transition", processingOpen && "rotate-180")} />
          </button>

          {processingOpen && (
            <div className="pl-8 space-y-1">
              {operationLinks.map(({ label, href, activeMatch }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activeMatch(pathname)
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    })()}

    {/* --- Dropdown: QUẢN LÝ KHO --- */}
    {(() => {
      const warehouseLinks = [
        {
          label: "Tồn kho",
          href: "/dashboard/staff/inventories",
          activeMatch: (path: string) => path === "/dashboard/staff/inventories",
        },
        {
          label: "Nhật ký tồn kho",
          href: "/dashboard/staff/inventory-logs",
          activeMatch: (path: string) => path.startsWith("/dashboard/staff/inventory-logs"),
        },
        {
          label: "Kho hàng",
          href: "/dashboard/staff/warehouses",
          activeMatch: (path: string) => path.startsWith("/dashboard/staff/warehouses"),
        },
      ];

      const isDropdownActive = warehouseLinks.some((item) => item.activeMatch(pathname));

      return (
        <div>
          <button
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium w-full transition-colors",
              isDropdownActive
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            )}
            onClick={() => setProcessingOpen((v) => !v)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 w-5 text-center">
                <FiSettings />
              </span>
              <span className="truncate">Quản lý kho</span>
            </div>
            <FiChevronDown className={cn("transition", processingOpen && "rotate-180")} />
          </button>

          {processingOpen && (
            <div className="pl-8 space-y-1">
              {warehouseLinks.map(({ label, href, activeMatch }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activeMatch(pathname)
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    })()}
  </>
)}



  


      
    </div>
  );
}

// ===== Sidebar Footer =====
interface SidebarFooterProps {
  role?: string | null;
  isCollapsed?: boolean;
}

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    console.log("Stored user name:", storedName);
    setUserName(storedName);
  }, []);

  if (isCollapsed) return null;

  return (
    <div className="border-t px-4 py-3 text-sm text-gray-600">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-400">Xin chào:</span>
        <span className="font-medium text-orange-600">
          {userName ?? "Ẩn danh"}
        </span>
      </div>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/auth/login";
        }}
        className="text-red-600 text-sm hover:underline"
      >
        Đăng xuất
      </button>
    </div>

  );
}
