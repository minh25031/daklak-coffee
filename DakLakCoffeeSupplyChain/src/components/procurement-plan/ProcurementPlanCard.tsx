"use client";

import { ProcurementPlan } from "@/lib/api/procurementPlans";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import {
  ProcurementPlanStatusMap,
  ProcurementPlanStatusValue,
} from "@/lib/constants/procurementPlanStatus";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { FiEdit, FiInfo, FiTrash2, FiXCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function ProcurementPlanCard({
  plan,
  openOpenRegisterDialog,
  openClosedRegisterDialog,
  openCancelDialog,
  openDeleteDialog,
}: {
  plan: ProcurementPlan;
  openOpenRegisterDialog: () => void;
  openClosedRegisterDialog: () => void;
  openCancelDialog?: () => void;
  openDeleteDialog?: () => void;
}) {
  const router = useRouter();

  return (
    <tr key={plan.planId} className='border-t hover:bg-gray-50'>
      <td className='px-4 py-3'>
        <Link href={`/dashboard/manager/procurement-plans/${plan.planId}`}>
          <div className='font-medium'>{plan.title}</div>
          <div className='text-sm text-muted-foreground flex items-center gap-1'>
            {plan.planCode}
          </div>
        </Link>
      </td>

      <td className='px-4 py-3'>{plan.totalQuantity} kg</td>
      <td className='px-4 py-3'>{plan.progressPercentage}%</td>

      <td className='px-4 py-3'>
        <Badge
          className={cn(
            "inline-flex items-center justify-center w-32 h-8 px-2 py-1 text-xs font-medium rounded-full border text-center",
            plan.status === "Open"
              ? "bg-green-100 text-green-700 border-green-500"
              : plan.status === "Closed"
              ? "bg-gray-100 text-gray-700 border-gray-500"
              : plan.status === "Cancelled"
              ? "bg-rose-100 text-rose-700 border-rose-500"
              : plan.status === "Draft"
              ? "bg-blue-100 text-blue-700 border-blue-500"
              : "bg-red-100 text-red-700 border-red-500"
          )}
        >
          {ProcurementPlanStatusMap[plan.status as ProcurementPlanStatusValue]
            ?.label || plan.status}
        </Badge>
      </td>

      <td className='px-4 py-3'>
        {formatDate(plan.startDate)} -- {formatDate(plan.endDate)}
      </td>

      <td className='px-4 py-3 text-center align-middle'>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className='flex items-center gap-2 hover:text-orange-700 transition px-3 py-2 rounded-md bg-white shadow-sm text-sm text-gray-700 hover:bg-[#ccc] '>
            <ChevronDown className='w-4 h-4' />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className='min-w-[100px] bg-white rounded-md shadow-lg p-1 border text-sm z-[100]'>
              <DropdownMenu.Item className='px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center'>
                <FiEdit className='mr-1' /> Chỉnh sửa
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className='px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center'
                onClick={() =>
                  router.push(
                    `/dashboard/manager/procurement-plans/${plan.planId}`
                  )
                }
              >
                <FiInfo className='mr-1' /> Chi tiết
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className='px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center'
                style={{
                  display:
                    plan.status === "Open"
                      ? "none"
                      : plan.status === "Cancelled"
                      ? "none"
                      : plan.status === "Closed"
                      ? "none"
                      : undefined,
                }}
                onClick={openOpenRegisterDialog}
              >
                Mở đăng ký
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className='px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center'
                style={{
                  display:
                    plan.status === "Closed"
                      ? "none"
                      : plan.status === "Cancelled"
                      ? "none"
                      : plan.status === "Draft"
                      ? "none"
                      : undefined,
                }}
                onClick={openClosedRegisterDialog}
              >
                Kết thúc đăng ký
              </DropdownMenu.Item>

              {plan.status !== "Closed" && (
                <DropdownMenu.Separator className='h-px bg-gray-200 my-1' />
              )}

              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span>
                      <DropdownMenu.Item
                        className='px-3 py-2 text-red-600 hover:bg-red-50 rounded cursor-pointer flex items-center'
                        onClick={() => {
                          if (
                            Array.isArray(plan.commitments) &&
                            plan.commitments.length > 0
                          )
                            return;
                          openCancelDialog?.();
                        }}
                        style={{
                          cursor:
                            plan.commitments?.length > 0
                              ? "not-allowed"
                              : "pointer",
                          display:
                            plan.status === "Cancelled"
                              ? "none"
                              : plan.status === "Draft"
                              ? "none"
                              : plan.status === "Closed"
                              ? "none"
                              : undefined,
                        }}
                      >
                        <FiXCircle className='mr-1' />
                        Hủy kế hoạch
                      </DropdownMenu.Item>
                    </span>
                  </Tooltip.Trigger>
                  {plan.commitments?.length > 0 && (
                    <Tooltip.Content
                      side='top'
                      align='center'
                      className='bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg'
                    >
                      Kế hoạch này không thể hủy vì đã có cam kết
                      <Tooltip.Arrow className='fill-gray-900' />
                    </Tooltip.Content>
                  )}
                </Tooltip.Root>
              </Tooltip.Provider>

              <DropdownMenu.Item
                className='px-3 py-2 text-red-600 hover:bg-red-50 rounded cursor-pointer flex items-center'
                style={{
                  display:
                    plan.status === "Open"
                      ? "none"
                      : plan.status === "Closed"
                      ? "none"
                      : undefined,
                }}
                onClick={openDeleteDialog}
              >
                <FiTrash2 className='mr-1' />
                Xóa
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </td>
    </tr>
  );
}
