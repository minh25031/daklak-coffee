import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FiTrash2 } from "react-icons/fi";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { LoadingButton } from "@/components/ui/loadingProgress";
import { CoffeeType } from "@/lib/api/coffeeType";
import { ProcessingMethod } from "@/lib/api/processingMethods";

export interface ProcurementPlanDetailFormData {
  planDetailsId?: string; // Optional for new details
  coffeeTypeId: string;
  processMethodId: number;
  targetQuantity: number;
  targetRegion: string;
  minimumRegistrationQuantity: number;
  minPriceRange: number;
  maxPriceRange: number;
  expectedYieldPerHectare: number;
  note: string;
}

export interface ProcurementPlanFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  procurementPlansDetails: ProcurementPlanDetailFormData[];
}

interface Props {
  initialData?: ProcurementPlanFormData;
  availableCoffeeTypes: CoffeeType[];
  availableProcessingMethods: ProcessingMethod[];
  loading: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onChange: (formData: ProcurementPlanFormData) => void;
  onSubmit: () => void;
  onAddDetail: () => void;
  onRemoveDetail: (index: number) => void;
}

export default function ProcurementPlanForm({
  initialData,
  availableCoffeeTypes,
  availableProcessingMethods,
  loading,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onAddDetail,
  onRemoveDetail,
}: Props) {
  const [form, setForm] = useState<ProcurementPlanFormData>(
    initialData || {
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
        },
      ],
    }
  );

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  // Khi giá trị form thay đổi sẽ đẩy lên parent
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    onChange(newForm);
  };

  const handleDetailChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const numberFields = [
      "processMethodId",
      "targetQuantity",
      "minimumRegistrationQuantity",
      "minPriceRange",
      "maxPriceRange",
      "expectedYieldPerHectare",
    ];

    const newDetails = [...form.procurementPlansDetails];

    if (name === "processMethodId") {
      newDetails[index] = {
        ...newDetails[index],
        [name]: Number(value) === 0 ? 0 : Number(value),
      };
    } else {
      newDetails[index] = {
        ...newDetails[index],
        [name]: numberFields.includes(name) ? Number(value) : value,
      };
    }

    const newForm = { ...form, procurementPlansDetails: newDetails };
    setForm(newForm);
    onChange(newForm);
  };

  const handleAddDetail = () => {
    onAddDetail();
  };

  const handleRemoveDetail = (index: number) => {
    onRemoveDetail(index);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className='space-y-4 max-w-2xl mx-auto'>
        <div>
          <Label htmlFor='title'>
            Tên kế hoạch<span className='text-red-500'>*</span>
          </Label>
          <Input
            name='title'
            value={form.title}
            onChange={handleChange}
            required
          />
          {errors["title"] && (
            <p className='text-red-500 text-xs'>{errors["title"]}</p>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='startDate'>
              Ngày bắt đầu mở đăng ký<span className='text-red-500'>*</span>
            </Label>
            <Input
              type='date'
              name='startDate'
              value={form.startDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
            />
            {errors["startDate"] && (
              <p className='text-red-500 text-xs'>{errors["startDate"]}</p>
            )}
          </div>
          <div>
            <Label htmlFor='endDate'>
              Ngày kết thúc đăng ký<span className='text-red-500'>*</span>
            </Label>
            <Input
              type='date'
              name='endDate'
              value={form.endDate}
              onChange={handleChange}
              required
            />
            {errors["endDate"] && (
              <p className='text-red-500 text-xs'>{errors["endDate"]}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor='description'>
            Mô tả<span className='text-red-500'>*</span>
          </Label>
          <Textarea
            name='description'
            value={form.description}
            onChange={handleChange}
          />
          {errors["description"] && (
            <p className='text-red-500 text-xs'>{errors["description"]}</p>
          )}
        </div>

        {form.procurementPlansDetails.map((detail, index) => (
          <Card key={index} className='mb-4 border'>
            <CardHeader className='flex justify-between items-center'>
              <CardTitle>Chi tiết kế hoạch #{index + 1}</CardTitle>
              {form.procurementPlansDetails.length > 1 && (
                <Button
                  variant='destructiveGradient'
                  size='sm'
                  //className='text-red-500 py-1 px-2 text-xs hover:bg-red-500 hover:text-white trasition bg-red-100'
                  onClick={() => handleRemoveDetail(index)}
                  type='button'
                >
                  <FiTrash2 className='mr-1' />
                  Xóa
                </Button>
              )}
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <Label htmlFor={`coffeeTypeId-${index}`}>
                  Loại cà phê<span className='text-red-500'>*</span>
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
                  {/* <span className='text-red-500'>*</span> */}
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
                      // required
                      className='block w-full rounded border border-gray-300 px-3 py-2'
                    >
                      <option value={0}>-- Chọn phương pháp sơ chế --</option>
                      {availableProcessingMethods.map((method) => (
                        <option key={method.methodId} value={method.methodId}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                    {/* {errors[`processMethodId-${index}`] && (
                      <p className='text-red-500 text-xs'>
                        {errors[`processMethodId-${index}`]}
                      </p>
                    )} */}
                  </>
                )}
              </div>

              <div>
                <Label htmlFor={`targetQuantity-${index}`}>
                  Sản lượng mục tiêu (kg)<span className='text-red-500'>*</span>
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
                  {/* <span className='text-red-500'>*</span> */}
                </Label>
                <Input
                  id={`expectedYieldPerHectare-${index}`}
                  type='number'
                  min='0'
                  name='expectedYieldPerHectare'
                  value={detail.expectedYieldPerHectare}
                  onChange={(e) => handleDetailChange(index, e)}
                />
                {/* {errors[`expectedYieldPerHectare-${index}`] && (
                  <p className='text-red-500 text-xs'>
                    {errors[`expectedYieldPerHectare-${index}`]}
                  </p>
                )} */}
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
          <Button
            onClick={handleAddDetail}
            variant='secondaryGradient'
            size='sm'
            type='button'
          >
            + Thêm chi tiết kế hoạch
          </Button>
        </div>

        <div className='flex justify-end'>
          <LoadingButton
            loading={isSubmitting}
            type='submit'
            variant='default'
            disabled={isSubmitting}
          >
            Lưu kế hoạch
          </LoadingButton>
        </div>
      </div>
    </form>
  );
}
