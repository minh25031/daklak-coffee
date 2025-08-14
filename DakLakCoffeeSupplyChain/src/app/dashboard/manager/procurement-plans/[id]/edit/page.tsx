"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppToast } from "@/components/ui/AppToast";
import { getErrorMessage } from "@/lib/utils";
import ProcurementPlanForm, {
  ProcurementPlanFormData,
} from "@/components/procurement-plan/ProcurementPlanForm";
import { CoffeeType, getCoffeeTypes } from "@/lib/api/coffeeType";
import {
  getAllProcessingMethods,
  ProcessingMethod,
} from "@/lib/api/processingMethods";
import {
  getProcurementPlanById,
  updateProcurementPlan,
} from "@/lib/api/procurementPlans";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditProcurementPlanPage() {
  useAuthGuard(["manager"]);

  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableCoffeeTypes, setAvailableCoffeeTypes] = useState<
    CoffeeType[]
  >([]);
  const [availableProcessingMethods, setAvailableProcessingMethods] = useState<
    ProcessingMethod[]
  >([]);
  const [initialData, setInitialData] =
    useState<ProcurementPlanFormData | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [coffeeTypes, processingMethods, planData] = await Promise.all([
          getCoffeeTypes(),
          getAllProcessingMethods(),
          getProcurementPlanById(planId),
        ]);

        setAvailableCoffeeTypes(coffeeTypes);
        setAvailableProcessingMethods(processingMethods);

        // Chuyển format dữ liệu planData về đúng cấu trúc của form
        if (planData) {
          const formattedData: ProcurementPlanFormData = {
            title: planData.title,
            description: planData.description,
            startDate: planData.startDate.split("T")[0], // nếu API trả về ISO string
            endDate: planData.endDate.split("T")[0],
            procurementPlansDetails: planData.procurementPlansDetails.map(
              (detail: any) => ({
                planDetailsId: detail.planDetailsId,
                coffeeTypeId: detail.coffeeTypeId,
                processMethodId: detail.processMethodId,
                targetQuantity: detail.targetQuantity,
                targetRegion: detail.targetRegion || "",
                minimumRegistrationQuantity: detail.minimumRegistrationQuantity,
                minPriceRange: detail.minPriceRange,
                maxPriceRange: detail.maxPriceRange,
                expectedYieldPerHectare: detail.expectedYieldPerHectare,
                note: detail.note || "",
                contractItemId: detail.contractItemId || null,
              })
            ),
          };
          //console.log("Formatted Data:", formattedData);
          //console.log("planData:", planData);
          setInitialData(formattedData);
        }
      } catch (error) {
        AppToast.error(
          "Không tải được dữ liệu kế hoạch: " + getErrorMessage(error)
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [planId]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // State để lưu form tạm thời (do form trong component con kiểm soát, cần sync lại ở trang cha)
  const [formData, setFormData] = useState<ProcurementPlanFormData | null>(
    null
  );

  // Cập nhật dữ liệu form khi component con báo về thay đổi
  const handleFormChange = (data: ProcurementPlanFormData) => {
    setFormData(data);
  };

  // Thêm chi tiết kế hoạch
  const handleAddDetail = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      procurementPlansDetails: [
        ...formData.procurementPlansDetails,
        {
          coffeeTypeId: "",
          processMethodId: 0,
          targetQuantity: 0,
          targetRegion: "",
          minimumRegistrationQuantity: 0,
          minPriceRange: 0,
          maxPriceRange: 0,
          expectedYieldPerHectare: 0,
          note: "",
        },
      ],
    });
  };

  // Xóa chi tiết
  const handleRemoveDetail = (index: number) => {
  if (!formData) return;

  // Chỉ cho phép xóa khi số lượng chi tiết >= 2
  if (formData.procurementPlansDetails.length <= 1) return;

  setFormData({
    ...formData,
    procurementPlansDetails: formData.procurementPlansDetails.filter(
      (_, i) => i !== index
    ),
  });
};

  // Validate form (có thể tái sử dụng validateForm từ page create nếu muốn)

  const validateForm = (data: ProcurementPlanFormData) => {
    const newErrors: Record<string, string> = {};
    if (!data.title) newErrors.title = "Vui lòng nhập tên kế hoạch.";
    if (!data.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu.";
    if (!data.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc.";
    if (new Date(data.startDate) >= new Date(data.endDate))
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
    if (!data.description) newErrors.description = "Vui lòng nhập mô tả.";
    if (data.procurementPlansDetails.length === 0) {
      newErrors.procurementPlansDetails =
        "Vui lòng thêm ít nhất một chi tiết kế hoạch.";
    } else {
      data.procurementPlansDetails.forEach((detail, index) => {
        if (!detail.coffeeTypeId)
          newErrors[`coffeeTypeId-${index}`] = "Vui lòng chọn loại cà phê.";
        if (detail.processMethodId === 0)
          newErrors[`processMethodId-${index}`] =
            "Vui lòng chọn phương pháp sơ chế.";
        if (detail.targetQuantity <= 100)
          newErrors[`targetQuantity-${index}`] =
            "Sản lượng mục tiêu phải lớn hơn 100 kg.";
        if (detail.minimumRegistrationQuantity < 100)
          newErrors[`minimumRegistrationQuantity-${index}`] =
            "Số lượng đăng ký tối thiểu không thể nhỏ hơn 100 kg.";
        if (detail.minPriceRange < 1000)
          newErrors[`minPriceRange-${index}`] =
            "Giá tối thiểu không thể nhỏ hơn 1000 đồng.";
        if (detail.maxPriceRange < detail.minPriceRange)
          newErrors[`maxPriceRange-${index}`] =
            "Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu.";
        // if (detail.expectedYieldPerHectare <= 0)
        //   newErrors[`expectedYieldPerHectare-${index}`] =
        //     "Sản lượng dự kiến trên 1 ha phải lớn hơn 0.";
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit cập nhật kế hoạch
  const handleSubmit = async () => {
    if (!formData) {
      AppToast.error(getErrorMessage(errors));
      return;
    }
    setIsSubmitting(true);
    if (!validateForm(formData)) {
      setIsSubmitting(false);
      AppToast.error(getErrorMessage(errors));
      return;
    }

    const detailsUpdateDto = formData.procurementPlansDetails
    .filter((item) => item.planDetailsId && item.planDetailsId.trim() !== "")
    .map((item) => ({
      planDetailsId: item.planDetailsId,
      coffeeTypeId: item.coffeeTypeId,
      processMethodId: item.processMethodId,
      targetQuantity: item.targetQuantity,
      targetRegion: item.targetRegion,
      minimumRegistrationQuantity: item.minimumRegistrationQuantity,
      minPriceRange: item.minPriceRange,
      maxPriceRange: item.maxPriceRange,
      expectedYieldPerHectare: item.expectedYieldPerHectare,
      note: item.note,
      //contractItemId: item.contractItemId ?? null,
    }));

  const detailsCreateDto = formData.procurementPlansDetails
    .filter((item) => !item.planDetailsId || item.planDetailsId.trim() === "")
    .map((item) => ({
      coffeeTypeId: item.coffeeTypeId,
      processMethodId: item.processMethodId,
      targetQuantity: item.targetQuantity,
      targetRegion: item.targetRegion,
      minimumRegistrationQuantity: item.minimumRegistrationQuantity,
      minPriceRange: item.minPriceRange,
      maxPriceRange: item.maxPriceRange,
      expectedYieldPerHectare: item.expectedYieldPerHectare,
      note: item.note,
      //contractItemId: item.contractItemId ?? null,
    }));

    try {
      await updateProcurementPlan(planId, {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        procurementPlansDetailsUpdateDto: detailsUpdateDto,
        procurementPlansDetailsCreateDto: detailsCreateDto,
      });

      AppToast.success("Cập nhật kế hoạch thành công!");
      router.push("/dashboard/manager/procurement-plans");
    } catch (error) {
      AppToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !initialData) {
    return (
      <div className='flex justify-center items-center h-60'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa kế hoạch</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcurementPlanForm
            initialData={formData || initialData}
            availableCoffeeTypes={availableCoffeeTypes}
            availableProcessingMethods={availableProcessingMethods}
            loading={loading}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onAddDetail={handleAddDetail}
            onRemoveDetail={handleRemoveDetail}
          />
        </CardContent>
      </Card>
    </div>
  );
}
