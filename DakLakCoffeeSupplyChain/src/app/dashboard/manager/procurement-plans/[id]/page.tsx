"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getProcurementPlanById,
  ProcurementPlan,
} from "@/lib/api/procurementPlans";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";
import StatusBadge from "@/components/crop-seasons/StatusBadge";
import { ProcurementPlanStatusMap } from "@/lib/constants/procurementPlanStatus";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function ProcurementPlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<ProcurementPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProcurementPlanById(id as string)
      .then(setPlan)
      .catch((err) => setError(err.message || "Không thể tải dữ liệu kế hoạch"))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (date?: string) => {
    if (!date) return "Chưa cập nhật";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Chưa cập nhật" : d.toLocaleDateString("vi-VN");
  };

  if (loading)
    return <div className='text-center py-8'>Đang tải dữ liệu kế hoạch...</div>;
  if (error || !plan)
    return (
      <div className='text-red-500 p-8'>
        {error || "Không tìm thấy kế hoạch"}
      </div>
    );

  return (
    <div className='w-full p-6 lg:px-20 flex justify-center items-start'>
      <div className='w-full max-w-6xl space-y-6'>
        <div className='flex items-center gap-3 text-2xl font-semibold text-gray-800'>
          <Package className='w-7 h-7 text-orange-600' />
          Kế hoạch: {plan.title}
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <CardTitle>Thông tin kế hoạch thu mua</CardTitle>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  className='bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                  onClick={() =>
                    router.push(
                      `/dashboard/business/procurement-plans/${plan.planId}/edit`
                    )
                  }
                >
                  <FiEdit className='mr-1' /> Chỉnh sửa
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  className='bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer'
                  onClick={() => alert("Xoá chưa được hỗ trợ")}
                >
                  <FiTrash2 className='mr-1' /> Xoá
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <strong>Mã kế hoạch:</strong> {plan.planCode}
            </div>
            <div>
              <strong>Tổng sản lượng:</strong> {plan.totalQuantity} kg
            </div>
            <div>
              <strong>Tỷ lệ hoàn thành:</strong> {plan.progressPercentage}%
            </div>
            <div>
              <strong>Trạng thái:</strong>{" "}
              <StatusBadge
                status={plan.status}
                map={ProcurementPlanStatusMap}
              />
            </div>
            <div>
              <strong>Thời gian mở đơn:</strong> {formatDate(plan.startDate)} –{" "}
              {formatDate(plan.endDate)}
            </div>
            {plan.description && (
              <div className='col-span-2'>
                <strong>Ghi chú:</strong> {plan.description}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>Chi tiết kế hoạch</CardTitle>
            <Button
              size='sm'
              variant='outline'
              className='bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer'
              onClick={() =>
                router.push(
                  `/dashboard/manager/procurement-plans/${plan.planId}/details/create`
                )
              }
            >
              + Thêm chi tiết kế hoạch
            </Button>
          </CardHeader>
          <CardContent>
            {Array.isArray(plan.procurementPlansDetails) &&
              plan.procurementPlansDetails.length > 0 ? (
              <Accordion type='multiple' className='w-full'>
                {plan.procurementPlansDetails.map((detail) => (
                  <AccordionItem
                    key={detail.planDetailsId}
                    value={detail.planDetailsId}
                  >
                    <AccordionTrigger className='text-left font-medium text-base'>
                      {detail.coffeeType?.typeName}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='grid grid-cols-2 gap-4 text-sm text-gray-700 py-2'>
                        <div>
                          <strong>Mã chi tiết:</strong> {detail.planDetailCode}
                        </div>
                        <div>
                          <strong>Loại cà phê:</strong>{" "}
                          {detail.coffeeType?.botanicalName}
                        </div>
                        <div>
                          <strong>Phân loại:</strong>{" "}
                          {detail.coffeeType?.specialtyLevel}
                        </div>
                        <div>
                          <strong>Vùng đặc trưng:</strong>{" "}
                          {detail.coffeeType?.typicalRegion}
                        </div>
                        <div>
                          <strong>Phương pháp chế biến:</strong>{" "}
                          {detail.processingMethodName}
                        </div>
                        <div>
                          <strong>Sản lượng mục tiêu:</strong>{" "}
                          {detail.targetQuantity} kg
                        </div>
                        <div>
                          <strong>Đăng ký tối thiểu:</strong>{" "}
                          {detail.minimumRegistrationQuantity} kg
                        </div>
                        <div>
                          <strong>Giá cả thương lượng:</strong> {detail.minPriceRange} –{" "}
                          {detail.maxPriceRange} VNĐ/kg
                        </div>
                        <div>
                          <strong>Trạng thái:</strong> {detail.status}
                        </div>
                        <div className='col-span-2'>
                          <strong>Mô tả:</strong>{" "}
                          {detail.coffeeType?.description}
                        </div>
                        <div className='col-span-2'>
                          <strong>Ghi chú:</strong> {detail.note}
                        </div>
                        <div className='col-span-2 flex justify-end gap-2 pt-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                            onClick={() =>
                              router.push(
                                `/dashboard/manager/procurement-plans/${plan.planId}/details/${detail.planDetailsId}/edit`
                              )
                            }
                          >
                            Chỉnh sửa
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            className='bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer'
                            onClick={() => {
                              const confirmDelete = window.confirm(
                                "Bạn có chắc muốn xoá chi tiết này không?"
                              );
                              if (confirmDelete)
                                alert(`Đã xoá ${detail.coffeeType?.typeName}`);
                            }}
                          >
                            Xoá
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Không có chi tiết kế hoạch nào.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
