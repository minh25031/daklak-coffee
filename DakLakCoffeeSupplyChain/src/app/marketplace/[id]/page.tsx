"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // hoặc next/router nếu old router
import { differenceInCalendarDays, format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";

import {
  ProcurementPlan,
  getProcurementPlanDetailById,
} from "@/lib/api/procurementPlans";
import {
  createCultivationRegistration,
  CultivationRegistration,
  getCultivationRegistrationsByPlanId,
} from "@/lib/api/cultivationRegistrations";
import { AppToast } from "@/components/ui/AppToast";
import { getErrorMessage } from "@/lib/utils";
import { ParamValue } from "next/dist/server/request/params";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FiTrash2 } from "react-icons/fi";

export default function PlanDetailPage() {
  const params = useParams();
  const { id } = params;

  const [plan, setPlan] = useState<ProcurementPlan | null>(null);
  const [registrations, setRegistrations] = useState<CultivationRegistration[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isFarmer, setIsFarmer] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchPlan(id as string);
    fetchRegistration(id);
  }, [id]);

  const fetchPlan = async (planId: string) => {
    setLoading(true);
    const data = await getProcurementPlanDetailById(planId).catch((error) => {
      //AppToast.error(getErrorMessage(error));
      return null;
    });
    //console.log("Fetched Procurement Plans:", data);
    setPlan(data);
    setLoading(false);
  };

  const fetchRegistration = async (planId: ParamValue) => {
    setLoading(true);
    const data = await getCultivationRegistrationsByPlanId(planId).catch(
      (error) => {
        //AppToast.error(getErrorMessage(error));
        return [];
      }
    );
    setRegistrations(data);
    checkFarmerAccount();
    setLoading(false);
  };

  const checkFarmerAccount = () => {
    const accountRole = localStorage.getItem("user_role");
    if (!accountRole) {
      setIsFarmer(false);
      return;
    }
    try {
      setIsFarmer(accountRole === "farmer");
    } catch (error) {
      setIsFarmer(false);
    }
  };

  function isLoggedIn() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  }

  const [formData, setFormData] = useState({
    planId: id as string,
    registeredArea: 0,
    note: "",
    cultivationRegistrationDetailsCreateViewDto: [
      {
        planDetailId: "",
        estimatedYield: 0,
        wantedPrice: 0,
        expectedHarvestStart: "",
        expectedHarvestEnd: "",
        note: "",
      },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.planId) {
      newErrors.planId = "Vui lòng chọn kế hoạch.";
    }
    if (formData.registeredArea <= 0) {
      newErrors.registeredArea = "Vui lòng nhập diện tích đăng ký hợp lệ.";
    }
    formData.cultivationRegistrationDetailsCreateViewDto.forEach(
      (detail, idx) => {
        if (!detail.planDetailId)
          newErrors[`planDetailId_${idx}`] = "Cần chọn chi tiết kế hoạch.";
        if (detail.estimatedYield <= 0)
          newErrors[`estimatedYield_${idx}`] =
            "Nhập sản lượng ước tính hợp lệ.";
        if (detail.wantedPrice <= 0)
          newErrors[`wantedPrice_${idx}`] = "Nhập giá mong muốn hợp lệ.";
        if (!detail.expectedHarvestStart)
          newErrors[`expectedHarvestStart_${idx}`] = "Chọn ngày bắt đầu.";
        if (!detail.expectedHarvestEnd)
          newErrors[`expectedHarvestEnd_${idx}`] = "Chọn ngày kết thúc.";
      }
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDetail = () => {
    setFormData((prev) => ({
      ...prev,
      cultivationRegistrationDetailsCreateViewDto: [
        ...prev.cultivationRegistrationDetailsCreateViewDto,
        {
          planDetailId: "",
          estimatedYield: 0,
          wantedPrice: 0,
          expectedHarvestStart: "",
          expectedHarvestEnd: "",
          note: "",
        },
      ],
    }));
  };

  const handleRemoveDetail = (index: number) => {
    setFormData((prev) => {
      const details = [...prev.cultivationRegistrationDetailsCreateViewDto];
      details.splice(index, 1);
      return { ...prev, cultivationRegistrationDetailsCreateViewDto: details };
    });
  };

  const handleDetailChange = (
    index: number,
    key: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      const details = [...prev.cultivationRegistrationDetailsCreateViewDto];
      details[index] = { ...details[index], [key]: value };
      return { ...prev, cultivationRegistrationDetailsCreateViewDto: details };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!isLoggedIn()) {
    //   AppToast.error("Bạn cần đăng nhập để đăng ký kế hoạch!");
    //   return;
    // }

    if (!validateForm()) return;

    // Submit the form data
    try {
      await createCultivationRegistration(formData);
      AppToast.success("Đăng ký thành công!");
      fetchRegistration(formData.planId);

      // Reset form after successful submission
      setFormData({
        planId: id as string,
        registeredArea: 0,
        note: "",
        cultivationRegistrationDetailsCreateViewDto: [
          {
            planDetailId: "",
            estimatedYield: 0,
            wantedPrice: 0,
            expectedHarvestStart: "",
            expectedHarvestEnd: "",
            note: "",
          },
        ],
      });
      setErrors({});
    } catch (error) {
      AppToast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return <p className='text-center py-20'>Đang tải dữ liệu...</p>;
  }

  if (!plan) {
    return (
      <p className='text-center py-20 text-red-600'>
        Không tìm thấy kế hoạch này.
      </p>
    );
  }

  const daysRemaining = Math.max(
    differenceInCalendarDays(new Date(plan.endDate), new Date()),
    0
  );

  return (
    <div className='min-h-screen bg-[#fefaf4]'>
      {/* Banner */}
      <div className='h-40 bg-gradient-to-r from-orange-400 to-orange-600 relative'>
        <h1 className='absolute bottom-4 left-8 text-white text-3xl font-bold drop-shadow-lg'>
          Chi tiết kế hoạch
        </h1>
      </div>

      <div className='max-w-7xl mx-auto px-4 md:px-6 -mt-20 mb-12 flex gap-10 items-start'>
        <div className='flex flex-col gap-10 flex-1 max-w-4xl'>
          {/* Card chi tiết kế hoạch */}
          <Card className='flex-1 p-6 shadow-lg relative gap-8 z-10 rounded-xl'>
            <h2 className='text-3xl font-bold text-orange-700 mb-4'>
              {plan.title}
            </h2>
            <p className='text-gray-700 mb-6'>{plan.description}</p>

            <div className='grid grid-cols-3 gap-6 mb-6 text-gray-700 font-medium'>
              <div>
                <p className='text-sm text-gray-500 uppercase'>
                  Sản lượng tổng
                </p>
                <p className='text-xl'>
                  {plan.totalQuantity.toLocaleString()} kg
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500 uppercase'>
                  Thời gian còn lại
                </p>
                <p className='text-xl'>{daysRemaining} ngày</p>
              </div>
              <div>
                <p className='text-sm text-gray-500 uppercase'>
                  Tỷ lệ sản lượng đã được đăng ký
                </p>
                <p className='text-xl'>{plan.progressPercentage.toFixed(2)}%</p>
              </div>
            </div>

            <div>
              <h3 className='text-xl font-semibold mb-3'>Chi tiết kế hoạch</h3>
              <table className='w-full text-left border-collapse border border-gray-300 rounded-md overflow-hidden'>
                <thead className='bg-orange-100 text-orange-800 font-semibold'>
                  <tr>
                    <th className='py-2 px-3 border-r border-orange-200'>
                      Loại cà phê
                    </th>
                    <th className='py-2 px-3 border-r border-orange-200'>
                      Phương pháp sơ chế
                    </th>
                    <th className='py-2 px-3 border-r border-orange-200'>
                      Sản lượng (kg)
                    </th>
                    <th className='py-2 px-3 border-r border-orange-200'>
                      Khu vực thu mua
                    </th>
                    <th className='py-2 px-3 border-r border-orange-200'>
                      Giá (VNĐ/kg)
                    </th>
                    <th className='py-2 px-3'>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.procurementPlansDetails.map((detail) => (
                    <tr
                      key={detail.planDetailsId}
                      className='odd:bg-white even:bg-orange-50 hover:bg-orange-100 transition'
                    >
                      <td className='py-2 px-3 border-r border-orange-200'>
                        {detail.coffeeType?.typeName}
                      </td>
                      <td className='py-2 px-3 border-r border-orange-200'>
                        {detail.processingMethodName}
                      </td>
                      <td className='py-2 px-3 border-r border-orange-200'>
                        {detail.targetQuantity?.toLocaleString()}
                      </td>
                      <td className='py-2 px-3 border-r border-orange-200'>
                        {detail.targetRegion}
                      </td>
                      <td className='py-2 px-3 border-r border-orange-200'>
                        {detail.minPriceRange?.toLocaleString()} -{" "}
                        {detail.maxPriceRange?.toLocaleString()}
                      </td>
                      <td className='py-2 px-3'>{detail.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>ID: {plan.planCode}</p>
            </div>
          </Card>

          {/* Card danh sách đơn đăng ký */}
          <Card className='p-6 rounded-xl shadow-lg'>
            <h3 className='text-2xl font-semibold mb-6 text-orange-700'>
              Danh sách đơn đăng ký
            </h3>
            {registrations.length === 0 && <p>Chưa có đơn đăng ký nào.</p>}

            <div className='space-y-4 max-h-[400px] overflow-y-auto'>
              {registrations.map((reg) => (
                <div
                  key={reg.registrationId}
                  className='border border-gray-300 rounded p-4 bg-white'
                >
                  <p className='font-semibold'>{reg.farmerName}</p>
                  <p className='text-gray-600 mb-2'>{reg.farmerLocation}</p>
                  <p>
                    Diện tích đăng ký: {reg.registeredArea.toLocaleString()} ha
                    - Số đơn chi tiết:{" "}
                    {reg.cultivationRegistrationDetails.length}
                  </p>
                  <p className='text-sm text-gray-500'>
                    Ngày đăng ký:{" "}
                    {format(new Date(reg.registeredAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Form đăng ký nông hộ */}
          <Card className='p-6 rounded-xl shadow-lg'>
            <h3 className='text-2xl font-semibold mb-6 text-orange-700'>
              Đăng ký tham gia kế hoạch
            </h3>

            <form className='space-y-6' onSubmit={handleSubmit}>
              {!isLoggedIn() && (
                <div className='mb-2 text-red-600 text-sm'>
                  * Vui lòng <b>đăng nhập</b> để có thể đăng ký kế hoạch này!
                </div>
              )}

              <Label className='text-sm'>
                Diện tích đăng ký (ha) <span className='text-red-500'>*</span>
              </Label>
              <Input
                type='number'
                min={0}
                value={formData.registeredArea}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registeredArea: Number(e.target.value),
                  })
                }
              />

              <div>
                <Label htmlFor='note' className='text-sm'>
                  Mô tả
                </Label>
                <Textarea
                  id='note'
                  name='note'
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Chi tiết đăng ký */}
              {formData.cultivationRegistrationDetailsCreateViewDto.map(
                (detail, idx) => {
                  // Để loại chi tiết kế hoạch đã chọn ở dòng trước khỏi options dòng này
                  const alreadySelected =
                    formData.cultivationRegistrationDetailsCreateViewDto
                      .map((d, i) => (i === idx ? null : d.planDetailId))
                      .filter(Boolean);

                  const options = plan.procurementPlansDetails.filter(
                    (d) => !alreadySelected.includes(d.planDetailsId ?? null)
                  );

                  return (
                    <div
                      key={idx}
                      className='border rounded-md p-4 bg-orange-50 mb-2 flex flex-col gap-3 relative'
                    >
                      <Label className='text-sm'>
                        Chi tiết kế hoạch{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <select
                        value={detail.planDetailId}
                        className='w-full border rounded p-2 bg-white'
                        onChange={(e) =>
                          handleDetailChange(
                            idx,
                            "planDetailId",
                            e.target.value
                          )
                        }
                      >
                        <option value=''>-- Chọn chi tiết --</option>
                        {options.map((d) => (
                          <option key={d.planDetailsId} value={d.planDetailsId}>
                            {d.coffeeType?.typeName} - {d.processingMethodName}{" "}
                            ({d.targetRegion})
                          </option>
                        ))}
                      </select>
                      {errors[`planDetailId_${idx}`] && (
                        <p className='text-red-500 text-xs'>
                          {errors[`planDetailId_${idx}`]}
                        </p>
                      )}

                      <Label className='text-sm'>
                        Sản lượng ước tính (kg){" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        className='bg-white'
                        type='number'
                        min={0}
                        value={detail.estimatedYield}
                        onChange={(e) =>
                          handleDetailChange(
                            idx,
                            "estimatedYield",
                            Number(e.target.value)
                          )
                        }
                      />
                      {errors[`estimatedYield_${idx}`] && (
                        <p className='text-red-500 text-xs'>
                          {errors[`estimatedYield_${idx}`]}
                        </p>
                      )}

                      <Label className='text-sm'>
                        Giá mong muốn (VNĐ/kg){" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        className='bg-white'
                        type='number'
                        min={0}
                        value={detail.wantedPrice}
                        onChange={(e) =>
                          handleDetailChange(
                            idx,
                            "wantedPrice",
                            Number(e.target.value)
                          )
                        }
                      />
                      {errors[`wantedPrice_${idx}`] && (
                        <p className='text-red-500 text-xs'>
                          {errors[`wantedPrice_${idx}`]}
                        </p>
                      )}

                      <div className='flex gap-3'>
                        <div className='flex-1'>
                          <Label className='text-sm'>
                            Ngày bắt đầu thu hoạch{" "}
                            <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            className='bg-white'
                            type='date'
                            value={detail.expectedHarvestStart}
                            onChange={(e) =>
                              handleDetailChange(
                                idx,
                                "expectedHarvestStart",
                                e.target.value
                              )
                            }
                          />
                          {errors[`expectedHarvestStart_${idx}`] && (
                            <p className='text-red-500 text-xs'>
                              {errors[`expectedHarvestStart_${idx}`]}
                            </p>
                          )}
                        </div>
                        <div className='flex-1'>
                          <Label className='text-sm'>
                            Ngày kết thúc thu hoạch{" "}
                            <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            className='bg-white'
                            type='date'
                            value={detail.expectedHarvestEnd}
                            onChange={(e) =>
                              handleDetailChange(
                                idx,
                                "expectedHarvestEnd",
                                e.target.value
                              )
                            }
                          />
                          {errors[`expectedHarvestEnd_${idx}`] && (
                            <p className='text-red-500 text-xs'>
                              {errors[`expectedHarvestEnd_${idx}`]}
                            </p>
                          )}
                        </div>
                      </div>

                      <Label className='text-sm'>Ghi chú</Label>
                      <Textarea
                        className='bg-white'
                        value={detail.note}
                        onChange={(e) =>
                          handleDetailChange(idx, "note", e.target.value)
                        }
                      />

                      {/* Nút xoá - chỉ hiện nếu có hơn 1 dòng */}
                      {formData.cultivationRegistrationDetailsCreateViewDto
                        .length > 1 && (
                        <Button
                          type='button'
                          onClick={() => handleRemoveDetail(idx)}
                          className='text-red-500 py-1 px-2 text-xs absolute right-2 top-2 hover:bg-red-500 hover:text-white trasition bg-red-100'
                        >
                          <FiTrash2 className='mr-1' />
                          Xóa
                        </Button>
                      )}
                    </div>
                  );
                }
              )}
              {/* Nút thêm chi tiết - disable nếu đã chọn toàn bộ chi tiết kế hoạch */}
              <Tooltip
                content={
                  formData.cultivationRegistrationDetailsCreateViewDto.length >=
                  plan.procurementPlansDetails.length
                    ? `Kế hoạch này chỉ có ${plan.procurementPlansDetails.length} chi tiết kế hoạch`
                    : "Thêm chi tiết kế hoạch"
                }
                side='bottom'
                align='center'
              >
                <Button
                  type='button'
                  variant='default'
                  disabled={
                    formData.cultivationRegistrationDetailsCreateViewDto
                      .length >= plan.procurementPlansDetails.length
                  }
                  onClick={handleAddDetail}
                  //className='px-4 py-2 border border-orange-500 text-orange-700 font-bold hover:bg-orange-500 bg-orange-50 hover:text-white transition'
                >
                  + Thêm chi tiết kế hoạch
                </Button>
              </Tooltip>

              <div className='flex justify-end'>
                <Button
                  disabled={!isFarmer || !isLoggedIn()}
                  type='submit'
                  className='bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 font-semibold transition'
                >
                  Gửi đăng ký
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className='w-90 flex flex-col gap-6 z-10'>
          <Card className='w-full p-6 rounded-xl shadow-lg gap-2'>
            <h3 className='text-xl font-semibold text-orange-700'>
              Thông tin doanh nghiệp
            </h3>
            <p className='font-semibold'>{plan.createdBy.companyName}</p>
            <p className='mb-2 text-gray-600'>
              {plan.createdBy.companyAddress}
            </p>
            <a
              href={plan.createdBy.website}
              target='_blank'
              rel='noreferrer'
              className='text-blue-600 hover:underline mb-1 block'
            >
              Website
            </a>
            <p className='text-gray-700'>
              Email: {plan.createdBy.contactEmail}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
