"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { AppToast } from "@/components/ui/AppToast";
import { getErrorMessage } from "@/lib/utils";
import { CoffeeType, getCoffeeTypes } from "@/lib/api/coffeeType";
import {
  getAllProcessingMethods,
  ProcessingMethod,
} from "@/lib/api/processingMethods";
import { createProcurementPlan } from "@/lib/api/procurementPlans";
import ProcurementPlanForm, {
  ProcurementPlanFormData,
} from "@/components/procurement-plan/ProcurementPlanForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateProcurementPlanPage() {
  useAuthGuard(["manager"]);

  const formatDate = (d: string) => new Date(d).toISOString().split("T")[0];
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    procurementPlansDetails: [
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
        //contractItemId: '',
      },
    ],
  });

  const validateForm = (): { isValid: boolean; errorMessages: string[] } => {
    const newErrors: Record<string, string> = {};
    if (!form.title) newErrors.title = "Vui lòng nhập tên kế hoạch.";
    if (!form.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu.";
    if (!form.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc.";
    if (new Date(form.startDate) >= new Date(form.endDate))
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
    if (!form.description) newErrors.description = "Vui lòng nhập mô tả.";
    if (form.procurementPlansDetails.length === 0) {
      newErrors.procurementPlansDetails =
        "Vui lòng thêm ít nhất một chi tiết kế hoạch.";
    } else {
      form.procurementPlansDetails.forEach((detail, index) => {
        if (!detail.coffeeTypeId) {
          newErrors[`coffeeTypeId-${index}`] = "Vui lòng chọn loại cà phê.";
        }
        // if (detail.processMethodId === 0) {
        //   newErrors[`processMethodId-${index}`] =
        //     "Vui lòng chọn phương pháp sơ chế.";
        // }
        if (detail.targetQuantity <= 100) {
          newErrors[`targetQuantity-${index}`] =
            "Sản lượng mục tiêu phải lớn hơn 100 kg.";
        }
        if (detail.minimumRegistrationQuantity < 100) {
          newErrors[`minimumRegistrationQuantity-${index}`] =
            "Số lượng đăng ký tối thiểu không thể nhỏ hơn 100 kg.";
        }
        if (detail.minPriceRange < 1000) {
          newErrors[`minPriceRange-${index}`] =
            "Giá tối thiểu không thể nhỏ hơn 1000 đồng.";
        }
        if (detail.maxPriceRange < detail.minPriceRange) {
          newErrors[`maxPriceRange-${index}`] =
            "Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu.";
        }
        // if (detail.expectedYieldPerHectare <= 0) {
        //   newErrors[`expectedYieldPerHectare-${index}`] =
        //     "Sản lượng dự kiến trên 1 ha phải lớn hơn 0.";
        // }
      });
    }
    setErrors(newErrors);
    //return Object.keys(newErrors).length === 0;
    const errorMessages = Object.values(newErrors);
    return {
      isValid: errorMessages.length === 0,
      errorMessages,
    };
  };

  const [availableCoffeeTypes, setAvailableCoffeeTypes] = useState<
    CoffeeType[]
  >([]);
  const [availableProcessingMethods, setAvailableProcessingMethods] = useState<
    ProcessingMethod[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoffeeTypes();
    fetchProcessingMethods();
  }, []);

  //#region API Calls
  const fetchCoffeeTypes = async () => {
    setLoading(true);
    const data = await getCoffeeTypes().catch((error) => {
      AppToast.error(getErrorMessage(error));
      return [];
    });
    setAvailableCoffeeTypes(data);
    setLoading(false);
  };
  const fetchProcessingMethods = async () => {
    setLoading(true);
    const data = await getAllProcessingMethods().catch((error) => {
      AppToast.error(getErrorMessage(error));
      return [];
    });
    console.log("processData: ", data);
    setAvailableProcessingMethods(data);
    setLoading(false);
  };
  //#endregion

  //#region Form Handlers

  const handleFormChange = (formData: ProcurementPlanFormData) => {
    setForm(formData);
  };

  const handleAddDetail = () => {
    setForm((prev) => ({
      ...prev,
      procurementPlansDetails: [
        ...prev.procurementPlansDetails,
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
          //contractItemId: "",
        },
      ],
    }));
  };

  // Xóa card detail (ngoại trừ card mặc định thứ 0)
  const handleRemoveDetail = (index: number) => {
    if (!form) return;

    // Chỉ cho phép xóa khi số lượng chi tiết >= 2
    if (form.procurementPlansDetails.length <= 1) return;

    setForm({
      ...form,
      procurementPlansDetails: form.procurementPlansDetails.filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const { isValid, errorMessages } = validateForm();
    if (!isValid) {
    setIsSubmitting(false);
    AppToast.error(errorMessages.join('\n')); // show errors from validateForm directly
    return;
  }

    try {
      const formDataToSend = {
        ...form,
        startDate: formatDate(form.startDate),
        endDate: formatDate(form.endDate),
        procurementPlansDetails: form.procurementPlansDetails.map((detail) => {
          const copy = { ...detail } as Partial<typeof detail>;
          // Nếu processMethodId = 0 (hoặc giá trị đại diện cho không chọn), xóa thuộc tính này
          if (!copy.processMethodId || copy.processMethodId === 0) {
            delete copy.processMethodId;
          }
          return copy;
        }),
      };
      await createProcurementPlan(formDataToSend);

      AppToast.success("Tạo kết hoạch thành công!");
      router.push("/dashboard/manager/procurement-plans");
    } catch (err) {
      const message = getErrorMessage(err);
      AppToast.error(message);

      if (message.includes("Ngày bắt đầu phải trước ngày kết thúc")) {
        setForm((prev) => ({ ...prev, startDate: "", endDate: "" }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  //#endregion

  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <Card>
        <CardHeader>
          <CardTitle>Tạo kế hoạch mới</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcurementPlanForm
            initialData={form}
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
