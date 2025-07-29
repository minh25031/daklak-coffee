"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AppToast } from "@/components/ui/AppToast";
import { getErrorMessage } from "@/lib/utils";
import { CoffeeType, getCoffeeTypes } from "@/lib/api/coffeeType";
import {
  getAllProcessingMethods,
  ProcessingMethod,
} from "@/lib/api/processingMethods";
import { createProcurementPlan } from "@/lib/api/procurementPlans";
import { FiTrash2 } from "react-icons/fi";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CreateProcurementPlanPage() {
  useAuthGuard(["manager"]);

  const formatDate = (d: string) => new Date(d).toISOString().split("T")[0];
  const router = useRouter();

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

  const [availableCoffeeTypes, setAvailableCoffeeTypes] = useState<
    CoffeeType[]
  >([]);
  const [availableProcessingMethods, setAvailableProcessingMethods] = useState<
    ProcessingMethod[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCoffeeTypes, setIsLoadingCoffeeTypes] = useState(true);
  const [isLoadingProcessingMethods, setIsLoadingProcessingMethods] =
    useState(true);

  useEffect(() => {
    async function fetchCoffeeTypes() {
      try {
        const data = await getCoffeeTypes();
        setAvailableCoffeeTypes(data);
      } catch (err) {
        AppToast.error(getErrorMessage(err) || "Không thể tải loại cà phê");
      } finally {
        setIsLoadingCoffeeTypes(false);
      }
    }
    async function fetchProcessingMethods() {
      const data = await getAllProcessingMethods().catch((error) => {
        AppToast.error(getErrorMessage(error));
        return [];
      });
      setAvailableProcessingMethods(data);
    }

    fetchCoffeeTypes();
    fetchProcessingMethods();
    setIsLoadingProcessingMethods(false);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const newDetails = [...prev.procurementPlansDetails];
      // Nếu là số thì convert value sang number
      const numberFields = [
        "processMethodId",
        "targetQuantity",
        "minimumRegistrationQuantity",
        "minPriceRange",
        "maxPriceRange",
        "expectedYieldPerHectare",
      ];
      newDetails[index] = {
        ...newDetails[index],
        [name]: numberFields.includes(name) ? Number(value) : value,
      };

      return { ...prev, procurementPlansDetails: newDetails };
    });
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
    if (index === 0) return; // không xóa card mặc định
    setForm((prev) => {
      const newDetails = prev.procurementPlansDetails.filter(
        (_, i) => i !== index
      );
      return { ...prev, procurementPlansDetails: newDetails };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const requiredFields = ["title", "description"];
    const missing = requiredFields.filter(
      (field) => !form[field as keyof typeof form]
    );

    if (missing.length > 0) {
      AppToast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      setIsSubmitting(false);
      return;
    }

    // Kiểm tra điều kiện bắt buộc trong ít nhất 1 card detail - bắt buộc card mặc định
    const isDetailsValid = form.procurementPlansDetails.every((detail) => {
      return (
        detail.coffeeTypeId !== "" &&
        detail.processMethodId !== 0 &&
        detail.targetQuantity > 0
      );
    });

    if (!isDetailsValid) {
      AppToast.error("Vui lòng điền đầy đủ thông tin chi tiết ở các kế hoạch.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createProcurementPlan({
        ...form,
        startDate: formatDate(form.startDate),
        endDate: formatDate(form.endDate),
      });

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

  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <Card>
        <CardHeader>
          <CardTitle>Tạo kế hoạch mới</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='title'>Tên kế hoạch</Label>
            <Input
              name='title'
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='startDate'>Ngày bắt đầu mở đăng ký</Label>
              <Input
                type='date'
                name='startDate'
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor='endDate'>Ngày kết thúc đăng ký</Label>
              <Input
                type='date'
                name='endDate'
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor='description'>Mô tả</Label>
            <Textarea
              id={"description"}
              name='description'
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Phần card chứa thông tin plan detail */}
          {form.procurementPlansDetails.map((detail, index) => (
            <Card key={index} className='mb-4 border'>
              <CardHeader className='flex justify-between items-center'>
                <CardTitle>Chi tiết kế hoạch #{index + 1}</CardTitle>
                {index !== 0 && (
                  <Button
                    variant='destructive'
                    size='sm'
                    className='bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer'
                    onClick={() => handleRemoveDetail(index)}
                  >
                    <FiTrash2 className='mr-1' />
                    Xóa
                  </Button>
                )}
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <Label htmlFor={`coffeeTypeId-${index}`}>Loại cà phê</Label>
                  {isLoadingCoffeeTypes ? (
                    <LoadingSpinner />
                  ) : availableCoffeeTypes.length === 0 ? (
                    <p className='text-red-500 text-sm italic'>
                      Không có loại cà phê nào
                    </p>
                  ) : (
                    <select
                      id={`coffeeTypeId-${index}`}
                      name='coffeeTypeId'
                      value={detail.coffeeTypeId}
                      onChange={(e) => handleDetailChange(index, e)}
                      required
                      className='block w-full rounded border border-gray-300 px-3 py-2 cursor-pointer'
                    >
                      <option value='' className='cursor-pointer'>
                        -- Chọn loại cà phê --
                      </option>
                      {availableCoffeeTypes.map((type) => (
                        <option
                          key={type.coffeeTypeId}
                          value={type.coffeeTypeId}
                          className='cursor-pointer'
                        >
                          {type.typeName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <Label htmlFor={`processMethodId-${index}`}>
                    Phương pháp sơ chế
                  </Label>
                  {isLoadingProcessingMethods ? (
                    <LoadingSpinner />
                  ) : availableProcessingMethods.length === 0 ? (
                    <p className='text-red-500 text-sm italic'>
                      Không có phương pháp sơ chế nào
                    </p>
                  ) : (
                    <select
                      id={`processMethodId-${index}`}
                      name='processMethodId'
                      value={detail.processMethodId}
                      onChange={(e) => handleDetailChange(index, e)}
                      required
                      className='block w-full rounded border border-gray-300 px-3 py-2'
                    >
                      <option value={0}>-- Chọn phương pháp sơ chế --</option>
                      {availableProcessingMethods.map((method) => (
                        <option key={method.methodId} value={method.methodId}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <Label htmlFor={`targetQuantity-${index}`}>
                    Sản lượng mục tiêu (kg)
                  </Label>
                  <Input
                    id={`targetQuantity-${index}`}
                    type='number'
                    min='0'
                    name='targetQuantity'
                    value={detail.targetQuantity}
                    onChange={(e) => handleDetailChange(index, e)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`targetRegion-${index}`}>
                    Khu vực mục tiêu
                  </Label>
                  <Input
                    id={`targetRegion-${index}`}
                    name='targetRegion'
                    value={detail.targetRegion}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                </div>

                <div>
                  <Label htmlFor={`minimumRegistrationQuantity-${index}`}>
                    Số lượng đăng ký tối thiểu (kg)
                  </Label>
                  <Input
                    id={`minimumRegistrationQuantity-${index}`}
                    type='number'
                    min='0'
                    name='minimumRegistrationQuantity'
                    value={detail.minimumRegistrationQuantity}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                </div>

                <div>
                  <Label htmlFor={`minPriceRange-${index}`}>
                    Giá tối thiểu (VNĐ/kg)
                  </Label>
                  <Input
                    id={`minPriceRange-${index}`}
                    type='number'
                    min='0'
                    name='minPriceRange'
                    value={detail.minPriceRange}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                </div>

                <div>
                  <Label htmlFor={`maxPriceRange-${index}`}>
                    Giá tối đa (VNĐ/kg)
                  </Label>
                  <Input
                    id={`maxPriceRange-${index}`}
                    type='number'
                    min='0'
                    name='maxPriceRange'
                    value={detail.maxPriceRange}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                </div>

                <div>
                  <Label htmlFor={`expectedYieldPerHectare-${index}`}>
                    Sản lượng dự kiến trên 1 ha (kg)
                  </Label>
                  <Input
                    id={`expectedYieldPerHectare-${index}`}
                    type='number'
                    min='0'
                    name='expectedYieldPerHectare'
                    value={detail.expectedYieldPerHectare}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                </div>

                <div>
                  <Label htmlFor={`note-${index}`}>Ghi chú</Label>
                  <Textarea
                    id={`note-${index}`}
                    name='note'
                    value={detail.note}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className='flex justify-start mb-6'>
            <Button onClick={handleAddDetail} variant='outline' size='sm'>
              + Thêm chi tiết kế hoạch
            </Button>
          </div>

          <div className='flex justify-end'>
            <Button
              onClick={handleSubmit}
              className='bg-[#FD7622] hover:bg-[#d74f0f] text-white font-medium text-sm'
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo kế hoạch"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
