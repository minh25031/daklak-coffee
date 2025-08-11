"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { AppToast } from "@/components/ui/AppToast";
import { formatQuantity, getErrorMessage } from "@/lib/utils";
import {
  FarmingCommitment,
  getCommitmentById,
} from "@/lib/api/farmingCommitments";
import { FarmingCommitmentStatusMap } from "@/lib/constants/FarmingCommitmentStatus";
import StatusBadge from "@/components/crop-seasons/StatusBadge";

export default function FarmingCommitmentDetailPageForBusiness() {
  const { id } = useParams();
  const router = useRouter();
  const [commitment, setCommitment] = useState<FarmingCommitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommitment(id as string);
    //fetchRegistration(id);
  }, [id]);

  //#region API calls

  const fetchCommitment = async (commitmentId: string) => {
    setLoading(true);
    const data = await getCommitmentById(commitmentId).catch((error) => {
      AppToast.error(getErrorMessage(error));
      setError(getErrorMessage(error));
      return null;
    });
    setCommitment(data);
    setLoading(false);
  };

  //#endregion

  const formatDate = (date?: string) => {
    if (!date) return "Chưa cập nhật";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Chưa cập nhật" : d.toLocaleDateString("vi-VN");
  };

  if (loading)
    return <div className='text-center py-8'>Đang tải dữ liệu...</div>;
  if (error || !commitment)
    return (
      <div className='text-red-500 p-8'>
        {error || "Không tìm thấy cam kết nào"}
      </div>
    );

  return (
    <div className='w-full p-6 lg:px-20 flex justify-center items-start'>
      <div className='w-full max-w-6xl space-y-6'>
        <div className='flex items-center gap-3 text-2xl font-semibold text-gray-800'>
          <Package className='w-7 h-7 text-orange-600' />
          {commitment.commitmentName}
        </div>

        <Separator />

        {/* Card thông tin chính */}
        <Card>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <CardTitle>Thông tin cam kết kế hoạch thu mua</CardTitle>
              {commitment.status !== "Active" && (
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                    onClick={() =>
                      router.push(
                        `/dashboard/business/farming-commitments/${commitment.commitmentId}/edit`
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
              )}
            </div>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <strong>Mã cam kết:</strong> {commitment.commitmentCode}
            </div>
            <div>
              <strong>Tên nông dân:</strong> {commitment.farmerName}
            </div>
            <div>
              <strong>Tên doanh nghiệp:</strong> {commitment.companyName}
            </div>
            <div>
              <strong>Tên kế hoạch:</strong> {commitment.planTitle}
            </div>
            <div>
              <strong>Tổng chi phí:</strong>{" "}
              {commitment.totalPrice.toLocaleString()} VNĐ
            </div>
            <div>
              <strong>Ngày cam kết được tạo:</strong>{" "}
              {formatDate(commitment.commitmentDate)}
            </div>
            {commitment.approvedAt && (
              <div>
                <strong>Ngày cam kết được đồng thuận từ 2 phía:</strong>{" "}
                {formatDate(commitment.approvedAt)}
              </div>
            )}
            <div>
              <strong>Trạng thái:</strong>{" "}
              <StatusBadge
                status={commitment.status}
                map={FarmingCommitmentStatusMap}
              />
            </div>

            <div>
              <strong>Tiến độ cam kết:</strong>{" "}
              {commitment.progressPercentage}%
            </div>

            {commitment.note && (
              <div className='col-span-2'>
                <strong>Các điều khoản chung:</strong> {commitment.note}
              </div>
            )}

            {commitment.rejectionReason && (
              <div className='col-span-2'>
                <strong>Lý do từ chối:</strong> {commitment.rejectionReason}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card chi tiết */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>Chi tiết cam kết</CardTitle>
            {commitment.status !== "Active" && (
              <Button
                size='sm'
                variant='outline'
                className='bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer'
                onClick={() =>
                  router.push(
                    `/dashboard/manager/farming-commitments/${commitment.commitmentId}/details/create`
                  )
                }
              >
                + Thêm chi tiết cam kết
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {Array.isArray(commitment.farmingCommitmentDetails) &&
            commitment.farmingCommitmentDetails.length > 0 ? (
              <Accordion type='multiple' className='w-full'>
                {commitment.farmingCommitmentDetails.map((detail) => (
                  <AccordionItem
                    key={detail.commitmentDetailId}
                    value={detail.commitmentDetailId ?? ""}
                  >
                    <AccordionTrigger className='text-left font-medium text-base'>
                      {detail.coffeeTypeName} -{" "}
                      {formatQuantity(detail.committedQuantity ?? 0)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='grid grid-cols-2 gap-4 text-sm text-gray-700 py-2'>
                        <div>
                          <strong>Mã chi tiết:</strong> {detail.commitmentDetailCode}
                        </div>
                        <div>
                          <strong>Loại cà phê:</strong>{" "}
                          {detail.coffeeTypeName}
                        </div>
                        <div>
                          <strong>Giá cả thống nhất:</strong>{" "}
                          {detail.confirmedPrice?.toLocaleString()} VNĐ/kg
                        </div>
                        <div>
                          <strong>Sản lượng thu mua:</strong>{" "}
                          {formatQuantity(detail.committedQuantity ?? 0)}
                        </div>
                        <div>
                          <strong>Sản lượng đã giao:</strong>{" "}
                          {formatQuantity(detail.deliveriedQuantity ?? 0)}
                        </div>
                        <div>
                          <strong>Ngày giao hàng dự kiến:</strong>{" "}
                          {formatDate(detail.estimatedDeliveryStart)} -{" "}
                          {formatDate(detail.estimatedDeliveryEnd)}
                        </div>
                        <div>
                          <strong>Tiến độ chi tiết cam kết:</strong>{" "}
                          {detail.progressPercentage}%
                        </div>
                        <div className='col-span-2'>
                          <strong>Các điều khoản cụ thể:</strong>{" "}
                          {detail.note}
                        </div>
                        {commitment.status !== "Active" && (
                          <div className='col-span-2 flex justify-end gap-2 pt-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                              onClick={() =>
                                router.push(
                                  `/dashboard/manager/farming-commitments/${commitment.commitmentId}/details/${detail.commitmentDetailId}/edit`
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
                                  alert(`Đã xoá ${detail.coffeeTypeName}`);
                              }}
                            >
                              Xoá
                            </Button>
                          </div>
                        )}
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
