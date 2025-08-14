"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiCheck } from "react-icons/fi";
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
  updateFarmingCommitmentStatusByFarmer,
} from "@/lib/api/farmingCommitments";
import { FarmingCommitmentStatusMap } from "@/lib/constants/FarmingCommitmentStatus";
import StatusBadge from "@/components/crop-seasons/StatusBadge";
import { RejectionDialog } from "@/components/ui/rejectionDialog";
import { ConfirmDialog } from "@/components/ui/confirmDialog";

export default function FarmingCommitmentDetailPageForFarmer() {
  const { id } = useParams();
  const [commitment, setCommitment] = useState<FarmingCommitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [openRejectionDialog, setOpenRejectionDialog] = useState(false);
  const openRejectDialog = () => setOpenRejectionDialog(true);
  const [error, setError] = useState("");
  const isPending =
    commitment?.status === "Pending" || commitment?.status === null;
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const closeDialog = () => setDialogType(null);

  useEffect(() => {
    fetchCommitment(id as string);
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

  const updateFarmingCommitmentStatus = async (
    status: number,
    rejectionReason: string | undefined
  ) => {
    if (!commitment) return;

    const updatedCommitment = await updateFarmingCommitmentStatusByFarmer(
      { status, rejectionReason },
      commitment.commitmentId
    ).catch((error) => {
      AppToast.error(getErrorMessage(error));
      return null;
    });

    if (updatedCommitment) {
      setCommitment(updatedCommitment);
      AppToast.success("Đã chấp nhận cam kết thành công");
    }
  };

  //#endregion

  //#region Handle functions

  const handleAccept = async () => {
    if (!commitment) return;
    setLoadingConfirm(true);
    await updateFarmingCommitmentStatus(1, undefined);
    closeDialog();
    setLoadingConfirm(false);
  };

  const handleReject = async (rejectReason: string) => {
    await updateFarmingCommitmentStatus(5, rejectReason);
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
              <div className='flex gap-2'>
                {isPending && (
                  <>
                    <Button
                      size='sm'
                      variant='outline'
                      className='bg-green-200 hover:bg-emerald-400 hover:text-white text-green-800 transition'
                      onClick={() => setDialogType("accept")}
                    >
                      <FiCheck className='inline-block' /> Chấp nhận cam kết
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer'
                      onClick={openRejectDialog}
                    >
                      Từ chối cam kết
                    </Button>
                  </>
                )}
              </div>
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
              <strong>Tổng tiền thuế:</strong>{" "}
              {commitment.totalTaxPrice.toLocaleString()} VNĐ
            </div>
            <div>
              <strong>Tổng tiền trả trước:</strong>{" "}
              {commitment.totalAdvancePayment.toLocaleString()} VNĐ
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

            {commitment.note && (
              <div className='col-span-2'>
                <strong>Các điều khoản chung:</strong> {commitment.note}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card chi tiết */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>Chi tiết cam kết</CardTitle>
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
                          <strong>Mã chi tiết:</strong>{" "}
                          {detail.commitmentDetailCode}
                        </div>
                        <div>
                          <strong>Loại cà phê:</strong> {detail.coffeeTypeName}
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
                          <strong>Ngày giao hàng dự kiến:</strong>{" "}
                          {formatDate(detail.estimatedDeliveryStart)} -{" "}
                          {formatDate(detail.estimatedDeliveryEnd)}
                        </div>
                        <div className='col-span-2'>
                          <strong>Các điều khoản cụ thể:</strong> {detail.note}
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

        <ConfirmDialog
          open={dialogType !== null}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          title='Xác nhận cam kết'
          description='Bạn có chắc chắn muốn chấp nhận cam kết này không?'
          confirmText='Chấp nhận'
          cancelText='Hủy'
          loading={loadingConfirm}
          onConfirm={handleAccept}
        />

        <RejectionDialog
          open={openRejectionDialog}
          onOpenChange={setOpenRejectionDialog}
          title='Từ chối cam kết'
          description='Vui lòng nhập lý do từ chối cam kết bên dưới.'
          confirmText='Xác nhận từ chối'
          cancelText='Hủy'
          loading={loading}
          onConfirm={(reason) => {
            handleReject(reason);
            setOpenRejectionDialog(false); // đóng dialog sau khi confirm
          }}
        />
      </div>
    </div>
  );
}
