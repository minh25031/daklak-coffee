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
import { LoadingButton } from "@/components/ui/loadingProgress";

export default function CreateProcurementPlanPage() {
  useAuthGuard(["manager"]);

  const formatDate = (d: string) => new Date(d).toISOString().split("T")[0];
  const today = new Date().toISOString().split('T')[0];
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title) newErrors.title = "Vui lòng nhập tên kế hoạch.";
    if (!form.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu.";
    if (!form.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc.";
    if (new Date(form.startDate) >= new Date(form.endDate))
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu.";
    if (form.procurementPlansDetails.length === 0) {
      newErrors.procurementPlansDetails =
        "Vui lòng thêm ít nhất một chi tiết kế hoạch.";
    } else {
      form.procurementPlansDetails.forEach((detail, index) => {
        if (!detail.coffeeTypeId) {
          newErrors[`coffeeTypeId-${index}`] = "Vui lòng chọn loại cà phê.";
        }
        if (detail.processMethodId === 0) {
          newErrors[`processMethodId-${index}`] =
            "Vui lòng chọn phương pháp sơ chế.";
        }
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
        if (detail.expectedYieldPerHectare <= 0) {
          newErrors[`expectedYieldPerHectare-${index}`] =
            "Sản lượng dự kiến trên 1 ha phải lớn hơn 0.";
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    setAvailableProcessingMethods(data);
    setLoading(false);
  };
  //#endregion

  //#region Form Handlers

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
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

  //#endregion

  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <Card>
        <CardHeader>
          <CardTitle>Tạo kế hoạch mới</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='title'>
              Tên kế hoạch
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              name='title'
              value={form.title}
              onChange={handleChange}
              required
            />
            {errors[`title`] && (
              <p className='text-red-500 text-xs'>{errors[`title`]}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='startDate'>
                Ngày bắt đầu mở đăng ký
                <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='date'
                name='startDate'
                min={today}
                value={form.startDate}
                onChange={handleChange}
                required
              />
              {errors[`startDate`] && (
                <p className='text-red-500 text-xs'>{errors[`startDate`]}</p>
              )}
            </div>
            <div>
              <Label htmlFor='endDate'>
                Ngày kết thúc đăng ký
                <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='date'
                name='endDate'
                value={form.endDate}
                onChange={handleChange}
                required
              />
              {errors[`endDate`] && (
                <p className='text-red-500 text-xs'>{errors[`endDate`]}</p>
              )}
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
                  <Label htmlFor={`coffeeTypeId-${index}`}>Loại cà phê
                    <span className='text-red-500'>*</span>
                  </Label>
                  {loading ? (
                    <LoadingSpinner />
                  ) : availableCoffeeTypes.length === 0 ? (
                    <p className='text-red-500 text-sm italic'>
                      Không có loại cà phê nào
                    </p>
                  ) : (
                    <>
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
                      {errors[`coffeeTypeId-${index}`] && (
                        <p className='text-red-500 text-xs'>
                          {errors[`coffeeTypeId-${index}`]}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <Label htmlFor={`processMethodId-${index}`}>
                    Phương pháp sơ chế
                    <span className='text-red-500'>*</span>
                  </Label>
                  {loading ? (
                    <LoadingSpinner />
                  ) : availableProcessingMethods.length === 0 ? (
                    <p className='text-red-500 text-sm italic'>
                      Không có phương pháp sơ chế nào
                    </p>
                  ) : (
                    <>
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
                      {errors[`processMethodId-${index}`] && (
                        <p className='text-red-500 text-xs'>
                          {errors[`processMethodId-${index}`]}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <Label htmlFor={`targetQuantity-${index}`}>
                    Sản lượng mục tiêu (kg)
                    <span className='text-red-500'>*</span>
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
                  {errors[`targetQuantity-${index}`] && (
                    <p className='text-red-500 text-xs'>
                      {errors[`targetQuantity-${index}`]}
                    </p>
                  )}
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
                    <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id={`minimumRegistrationQuantity-${index}`}
                    type='number'
                    min='0'
                    name='minimumRegistrationQuantity'
                    value={detail.minimumRegistrationQuantity}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                  {errors[`minimumRegistrationQuantity-${index}`] && (
                    <p className='text-red-500 text-xs'>
                      {errors[`minimumRegistrationQuantity-${index}`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`minPriceRange-${index}`}>
                    Giá tối thiểu (VNĐ/kg)
                    <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id={`minPriceRange-${index}`}
                    type='number'
                    min='0'
                    name='minPriceRange'
                    value={detail.minPriceRange}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                  {errors[`minPriceRange-${index}`] && (
                    <p className='text-red-500 text-xs'>
                      {errors[`minPriceRange-${index}`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`maxPriceRange-${index}`}>
                    Giá tối đa (VNĐ/kg)
                    <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id={`maxPriceRange-${index}`}
                    type='number'
                    min='0'
                    name='maxPriceRange'
                    value={detail.maxPriceRange}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                  {errors[`maxPriceRange-${index}`] && (
                    <p className='text-red-500 text-xs'>
                      {errors[`maxPriceRange-${index}`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`expectedYieldPerHectare-${index}`}>
                    Sản lượng dự kiến trên 1 ha (kg)
                    <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id={`expectedYieldPerHectare-${index}`}
                    type='number'
                    min='0'
                    name='expectedYieldPerHectare'
                    value={detail.expectedYieldPerHectare}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                  {errors[`expectedYieldPerHectare-${index}`] && (
                    <p className='text-red-500 text-xs'>
                      {errors[`expectedYieldPerHectare-${index}`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`note-${index}`}>Mô tả</Label>
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
            <LoadingButton
              loading={isSubmitting}
              type="submit"
              onClick={handleSubmit}
              className='bg-[#FD7622] hover:bg-[#d74f0f] text-white font-medium text-sm transition'
              disabled={isSubmitting}
            >
              Tạo kế hoạch
            </LoadingButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
