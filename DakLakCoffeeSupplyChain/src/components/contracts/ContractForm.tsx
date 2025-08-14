"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { DialogFooter } from "@/components/ui/dialog";
import { ContractStatus } from "@/lib/constants/contractStatus";
import {
  ContractCreateDto,
  ContractUpdateDto,
  createContract,
  updateContract,
} from "@/lib/api/contracts";
import {
  getAllBusinessBuyers,
  BusinessBuyerDto,
} from "@/lib/api/businessBuyers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import {
  ContractItemCreateDto,
  ContractItemUpdateDto,
} from "@/lib/api/contractItems";
import { getErrorMessage } from "@/lib/utils";

// Helper: input có suffix đơn vị bên phải
function InputWithSuffix({
  unit,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { unit?: string }) {
  return (
    <div className="relative">
      <Input {...props} className={`pr-14 ${className ?? ""}`} />
      {unit ? (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          {unit}
        </span>
      ) : null}
    </div>
  );
}

type Props = {
  initialData?: ContractUpdateDto;
  onSuccess: () => void;
  buyerOptions?: BusinessBuyerDto[];
};

export default function ContractForm({
  initialData,
  onSuccess,
  buyerOptions,
}: Props) {
  const isEdit = !!initialData;
  const [buyers, setBuyers] = useState<BusinessBuyerDto[]>([]);
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [formData, setFormData] = useState<
    ContractCreateDto | ContractUpdateDto | null
  >(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [businessErrors, setBusinessErrors] = useState<string[]>([]);
  const router = useRouter();

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "NotStarted":
        return {
          label: "Chưa bắt đầu",
          className: "bg-gray-100 text-gray-600",
        };
      case "PreparingDelivery":
        return {
          label: "Chuẩn bị giao",
          className: "bg-purple-100 text-purple-700",
        };
      case "InProgress":
        return {
          label: "Đang thực hiện",
          className: "bg-green-100 text-green-700",
        };
      case "PartialCompleted":
        return {
          label: "Hoàn thành một phần",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "Completed":
        return { label: "Hoàn thành", className: "bg-blue-100 text-blue-700" };
      case "Cancelled":
        return { label: "Đã huỷ", className: "bg-red-100 text-red-700" };
      case "Expired":
        return { label: "Quá hạn", className: "bg-orange-100 text-orange-700" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-600" };
    }
  };

  // Fetch buyers list
  useEffect(() => {
    if (buyerOptions) {
      setBuyers(buyerOptions);
    } else {
      getAllBusinessBuyers().then(setBuyers);
    }
  }, [buyerOptions]);

  useEffect(() => {
    getCoffeeTypes().then(setCoffeeTypes);
  }, []);

  // Sync formData based on initialData
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        contractNumber: "",
        contractTitle: "",
        contractFileUrl: "",
        buyerId: "" as any,
        deliveryRounds: 1,
        totalQuantity: 0,
        totalValue: 0,
        startDate: undefined,
        endDate: undefined,
        signedAt: undefined,
        status: ContractStatus.NotStarted,
        cancelReason: "",
        contractItems: [],
      });
    }
  }, [initialData]);

  // Clear errors when form data changes
  useEffect(() => {
    setFieldErrors({});
    setBusinessErrors([]);
  }, [formData]);

  // Debug logging for errors state
  useEffect(() => {
    console.log("Current businessErrors:", businessErrors);
    console.log("Current fieldErrors:", fieldErrors);
  }, [businessErrors, fieldErrors]);

  // Guard for null formData
  if (!formData) {
    return (
      <div className="text-gray-500 text-center py-10">
        Đang khởi tạo biểu mẫu hợp đồng...
      </div>
    );
  }

  // Type assertion để TypeScript biết formData không null từ đây
  const data = formData;

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({
      ...prev!,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  // Client-side validation for numeric fields
  const validateNumericField = (field: string, value: any): string | null => {
    if (
      field === "deliveryRounds" &&
      (value <= 0 || !Number.isInteger(value))
    ) {
      return "Số đợt giao hàng phải là số nguyên dương";
    }
    if (field === "totalQuantity" && value < 0) {
      return "Tổng khối lượng không được âm";
    }
    if (field === "totalValue" && value < 0) {
      return "Tổng giá trị không được âm";
    }
    return null;
  };

  const handleNumericChange = (field: string, value: any) => {
    // Validate before updating
    const error = validateNumericField(field, value);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      // Clear error if validation passes
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }

    handleChange(field, value);
  };

  function addContractItem() {
    setFormData((prev) => {
      if (!prev) throw new Error("Form chưa khởi tạo");

      const isUpdate = "contractId" in prev && "contractItems" in prev;

      return {
        ...prev,
        contractItems: [
          ...prev.contractItems,
          {
            contractId: isUpdate ? (prev as ContractUpdateDto).contractId : "",
            coffeeTypeId: "",
            quantity: 0,
            unitPrice: 0,
            discountAmount: 0,
            note: "",
            ...(isUpdate && { contractItemId: crypto.randomUUID() }),
          },
        ],
      };
    });
  }

  function updateContractItem(index: number, field: string, value: any) {
    setFormData((prev) => {
      const updatedItems = [...prev!.contractItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return {
        ...prev!,
        contractItems: updatedItems,
      };
    });

    // Clear field error when user starts typing
    const fieldKey = `contractItems.${index}.${field}`;
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }

    // Client-side validation for contract item fields
    if (field === "quantity" && value <= 0) {
      setFieldErrors((prev) => ({
        ...prev,
        [`contractItems.${index}.quantity`]: "Số lượng phải lớn hơn 0",
      }));
    } else if (field === "unitPrice" && value <= 0) {
      setFieldErrors((prev) => ({
        ...prev,
        [`contractItems.${index}.unitPrice`]: "Đơn giá phải lớn hơn 0",
      }));
    } else if (field === "discountAmount" && value < 0) {
      setFieldErrors((prev) => ({
        ...prev,
        [`contractItems.${index}.discountAmount`]: "Chiết khấu không được âm",
      }));
    }
  }

  function removeContractItem(index: number) {
    setFormData((prev) => {
      const updatedItems = [...prev!.contractItems];
      updatedItems.splice(index, 1);
      return {
        ...prev!,
        contractItems: updatedItems,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Clear previous errors
    setFieldErrors({});
    setBusinessErrors([]);

    // Basic client-side validation
    const clientErrors: Record<string, string> = {};

    if (!data.contractNumber?.trim()) {
      clientErrors.contractNumber = "Số hợp đồng là bắt buộc";
    }

    if (!data.contractTitle?.trim()) {
      clientErrors.contractTitle = "Tiêu đề hợp đồng là bắt buộc";
    }

    if (!data.buyerId) {
      clientErrors.buyerId = "Vui lòng chọn đối tác";
    }

    if (!data.startDate) {
      clientErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }

    if (!data.endDate) {
      clientErrors.endDate = "Ngày kết thúc là bắt buộc";
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      clientErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Validate contract items
    if (!data.contractItems || data.contractItems.length === 0) {
      clientErrors.contractItems =
        "Vui lòng thêm ít nhất 1 mặt hàng vào hợp đồng";
    } else {
      data.contractItems.forEach((item, index) => {
        if (!item.coffeeTypeId) {
          clientErrors[`contractItems.${index}.coffeeTypeId`] =
            "Vui lòng chọn loại cà phê";
        }
        if (!item.quantity || item.quantity <= 0) {
          clientErrors[`contractItems.${index}.quantity`] =
            "Số lượng phải lớn hơn 0";
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          clientErrors[`contractItems.${index}.unitPrice`] =
            "Đơn giá phải lớn hơn 0";
        }
        if (item.discountAmount && item.discountAmount < 0) {
          clientErrors[`contractItems.${index}.discountAmount`] =
            "Chiết khấu không được âm";
        }
      });
    }

    // If there are client-side errors, display them and stop
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      toast.error("Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu");
      return;
    }

    try {
      if (isEdit) {
        const dto = data as ContractUpdateDto;

        const normalizedItems: ContractItemUpdateDto[] = dto.contractItems.map(
          (item) => ({
            contractItemId: item.contractItemId,
            contractId: item.contractId, // BẮT BUỘC
            coffeeTypeId: item.coffeeTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount ?? 0,
            note: item.note ?? "",
          })
        );

        await updateContract(dto.contractId, {
          ...dto,
          contractFileUrl:
            dto.contractFileUrl?.trim() === ""
              ? undefined
              : dto.contractFileUrl,
          contractItems: normalizedItems,
        });

        toast.success("Cập nhật hợp đồng thành công!");
      } else {
        const dto = data as ContractCreateDto;

        const normalizedItems: ContractItemCreateDto[] = dto.contractItems.map(
          (item) => ({
            coffeeTypeId: item.coffeeTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount ?? 0,
            note: item.note ?? "",
          })
        );

        await createContract({
          ...dto,
          contractFileUrl:
            dto.contractFileUrl?.trim() === ""
              ? undefined
              : dto.contractFileUrl,
          contractItems: normalizedItems,
        });

        toast.success("Tạo hợp đồng thành công!");
      }

      onSuccess();
    } catch (err) {
      console.error("Lỗi khi submit hợp đồng:", err);
      console.log("Error object type:", typeof err);
      console.log("Error object keys:", Object.keys(err || {}));
      console.log("Full error object:", err);

      // Xử lý lỗi validation từ backend
      if (err && typeof err === "object" && "errors" in err && err.errors) {
        const validationErrors = err.errors as Record<string, string[]>;
        const newFieldErrors: Record<string, string> = {};
        const newBusinessErrors: string[] = [];

        // Phân loại lỗi: field validation vs business logic
        Object.entries(validationErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            const message = messages[0];

            // Lỗi nghiệp vụ thường có đặc điểm:
            // 1. Message dài (>50 ký tự) - giảm từ 80 xuống 50
            // 2. Chứa từ khóa nghiệp vụ
            // 3. Không chỉ định field cụ thể
            // 4. Lỗi về quy tắc nghiệp vụ tổng thể
            const isBusinessError =
              message.length > 50 ||
              message.includes("vượt quá") ||
              message.includes("đã tồn tại") ||
              message.includes("không được") ||
              message.includes("phải") ||
              message.includes("cùng loại") ||
              message.includes("tổng khối lượng") ||
              message.includes("tổng giá trị") ||
              message.includes("tổng trị giá") ||
              message.includes("đã tồn tại trong hệ thống") ||
              message.includes("không có quyền") ||
              message.includes("không tìm thấy") ||
              message.includes("vượt quá tổng") ||
              message.includes("không được có 2 dòng") ||
              message.includes("không được âm") ||
              message.includes("phải lớn hơn") ||
              message.includes("phải nhỏ hơn") ||
              // Thêm các từ khóa cụ thể cho lỗi nghiệp vụ
              message.includes("dòng hợp đồng") ||
              message.includes("hợp đồng đã khai báo") ||
              message.includes("kg) vượt quá") ||
              message.includes("VND) vượt quá") ||
              message.includes("từ các dòng") ||
              message.includes("đã khai báo") ||
              // Thêm các pattern cụ thể hơn
              message.includes("kg) vượt quá") ||
              message.includes("VND) vượt quá") ||
              message.includes("vượt quá tổng khối lượng") ||
              message.includes("vượt quá tổng giá trị") ||
              message.includes("vượt quá tổng trị giá") ||
              message.includes("các dòng hợp đồng") ||
              message.includes("hợp đồng đã khai báo") ||
              message.includes("đã khai báo (") ||
              message.includes(") vượt quá");

            // Xử lý đặc biệt cho một số trường hợp
            if (field === "ContractItems" && message.includes("cùng loại")) {
              // Lỗi trùng loại cà phê - đây là lỗi nghiệp vụ
              newBusinessErrors.push(message);
            } else if (isBusinessError) {
              newBusinessErrors.push(message);
            } else {
              // Xử lý lỗi cho contract items (dạng: ContractItems[0].CoffeeTypeId)
              if (field.startsWith("ContractItems[") && field.includes("].")) {
                const match = field.match(/ContractItems\[(\d+)\]\.(\w+)/);
                if (match) {
                  const index = match[1];
                  const itemField = match[2];
                  newFieldErrors[
                    `contractItems.${index}.${itemField.toLowerCase()}`
                  ] = message;
                }
              } else {
                // Xử lý lỗi cho các field chính
                newFieldErrors[field] = message;
              }
            }
          }
        });

        // Set errors theo loại
        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
        }

        if (newBusinessErrors.length > 0) {
          setBusinessErrors(newBusinessErrors);
          // Hiển thị toast cho lỗi nghiệp vụ
          newBusinessErrors.forEach((error) => {
            toast.error(error);
          });
        }

        // Nếu chỉ có lỗi field validation
        if (
          Object.keys(newFieldErrors).length > 0 &&
          newBusinessErrors.length === 0
        ) {
          toast.error("Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu");
        }
      } else {
        // Xử lý lỗi khác (bao gồm lỗi nghiệp vụ chỉ trả về message)
        let errorMessage = "";
        let isBusinessError = false;

        if (err && typeof err === "object" && "message" in err && err.message) {
          errorMessage = err.message as string;

          // Debug: log để kiểm tra
          console.log("Error message from backend:", errorMessage);
          console.log("Error message length:", errorMessage.length);
          console.log(
            'Contains "vượt quá":',
            errorMessage.includes("vượt quá")
          );
          console.log(
            'Contains "tổng khối lượng":',
            errorMessage.includes("tổng khối lượng")
          );
          console.log(
            'Contains "dòng hợp đồng":',
            errorMessage.includes("dòng hợp đồng")
          );
          console.log(
            'Contains "hợp đồng đã khai báo":',
            errorMessage.includes("hợp đồng đã khai báo")
          );
          console.log(
            'Contains "kg) vượt quá":',
            errorMessage.includes("kg) vượt quá")
          );
          console.log(
            'Contains "đã khai báo (":',
            errorMessage.includes("đã khai báo (")
          );
          console.log(
            'Contains ") vượt quá":',
            errorMessage.includes(") vượt quá")
          );

          // Kiểm tra xem có phải lỗi nghiệp vụ không
          // Lỗi nghiệp vụ thường có đặc điểm:
          // 1. Message dài (>50 ký tự) - giảm từ 80 xuống 50
          // 2. Chứa từ khóa nghiệp vụ cụ thể
          // 3. Mô tả quy tắc nghiệp vụ tổng thể
          isBusinessError =
            errorMessage.length > 50 ||
            errorMessage.includes("vượt quá") ||
            errorMessage.includes("đã tồn tại") ||
            errorMessage.includes("không được") ||
            errorMessage.includes("phải") ||
            errorMessage.includes("cùng loại") ||
            errorMessage.includes("tổng khối lượng") ||
            errorMessage.includes("tổng giá trị") ||
            errorMessage.includes("tổng trị giá") ||
            errorMessage.includes("đã tồn tại trong hệ thống") ||
            errorMessage.includes("không có quyền") ||
            errorMessage.includes("không tìm thấy") ||
            errorMessage.includes("vượt quá tổng") ||
            errorMessage.includes("không được có 2 dòng") ||
            errorMessage.includes("không được âm") ||
            errorMessage.includes("phải lớn hơn") ||
            errorMessage.includes("phải nhỏ hơn") ||
            // Thêm các từ khóa cụ thể cho lỗi nghiệp vụ
            errorMessage.includes("dòng hợp đồng") ||
            errorMessage.includes("hợp đồng đã khai báo") ||
            errorMessage.includes("kg) vượt quá") ||
            errorMessage.includes("VND) vượt quá") ||
            errorMessage.includes("từ các dòng") ||
            errorMessage.includes("đã khai báo") ||
            // Thêm các pattern cụ thể hơn
            errorMessage.includes("kg) vượt quá") ||
            errorMessage.includes("VND) vượt quá") ||
            errorMessage.includes("vượt quá tổng khối lượng") ||
            errorMessage.includes("vượt quá tổng giá trị") ||
            errorMessage.includes("vượt quá tổng trị giá") ||
            errorMessage.includes("các dòng hợp đồng") ||
            errorMessage.includes("hợp đồng đã khai báo") ||
            errorMessage.includes("đã khai báo (") ||
            errorMessage.includes(") vượt quá");

          // Debug: log kết quả phân loại
          console.log("Is business error:", isBusinessError);

          if (isBusinessError) {
            // Đây là lỗi nghiệp vụ, hiển thị trong business errors
            console.log("Setting business error:", errorMessage);
            setBusinessErrors([errorMessage]);
            toast.error(errorMessage);
          } else {
            // Đây là lỗi khác, sử dụng getErrorMessage
            const finalErrorMessage = getErrorMessage(err);
            toast.error(finalErrorMessage);
          }
        } else {
          // Sử dụng getErrorMessage để xử lý lỗi khác
          errorMessage = getErrorMessage(err);
          toast.error(errorMessage);
        }
      }
    }
  }

  // Helper function to calculate totals from contract items
  const calculateTotals = () => {
    if (!data.contractItems || data.contractItems.length === 0) {
      return { totalQuantity: 0, totalValue: 0 };
    }

    const totalQuantity = data.contractItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalValue = data.contractItems.reduce((sum, item) => {
      const itemValue =
        (item.quantity || 0) * (item.unitPrice || 0) -
        (item.discountAmount || 0);
      return sum + itemValue;
    }, 0);

    return { totalQuantity, totalValue };
  };

  // Helper function to get error for a specific field
  const getFieldError = (fieldName: string): string | undefined => {
    return fieldErrors[fieldName];
  };

  // Helper function to check if field has error
  const hasFieldError = (fieldName: string): boolean => {
    return !!fieldErrors[fieldName];
  };

  // Helper function to get display name for a field
  const getFieldDisplayName = (fieldName: string): string => {
    if (fieldName.startsWith("contractItems.")) {
      const match = fieldName.match(/contractItems\.(\d+)\.(.*)/);
      if (match) {
        const index = parseInt(match[1]) + 1;
        const itemField = match[2];
        const fieldMap: Record<string, string> = {
          coffeetypeid: "Loại cà phê",
          quantity: "Số lượng",
          unitprice: "Đơn giá",
          discountamount: "Chiết khấu",
          note: "Ghi chú",
        };
        return `Mặt hàng ${index} - ${fieldMap[itemField] || itemField}`;
      }
    }

    // Map cho các field chính
    const fieldMap: Record<string, string> = {
      buyerid: "Đối tác",
      contractnumber: "Số hợp đồng",
      contracttitle: "Tiêu đề hợp đồng",
      contractfileurl: "File hợp đồng",
      deliveryrounds: "Số đợt giao hàng",
      totalquantity: "Tổng khối lượng",
      totalvalue: "Tổng giá trị",
      startdate: "Ngày bắt đầu",
      enddate: "Ngày kết thúc",
      signedat: "Ngày ký",
      status: "Trạng thái",
      cancelreason: "Lý do hủy",
      contractitems: "Danh sách mặt hàng",
    };

    return (
      fieldMap[fieldName.toLowerCase()] ||
      fieldName.replace(/([A-Z])/g, " $1").trim()
    );
  };

  return (
    <form className="max-w-4xl mx-auto bg-white border rounded-2xl shadow p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isEdit ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
      </h2>

      {/* Hiển thị lỗi nghiệp vụ */}
      {businessErrors.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-orange-800 font-medium">
              Cần tuân thủ quy tắc nghiệp vụ:
            </h3>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
              {businessErrors.length} quy tắc
            </span>
          </div>

          {/* Debug info */}
          <div className="mb-2 p-2 bg-yellow-100 rounded text-yellow-800 text-xs">
            Debug: businessErrors = {JSON.stringify(businessErrors)}
          </div>

          {/* Tóm tắt nhanh */}
          <div className="mb-3 p-2 bg-orange-100 rounded text-orange-800 text-sm">
            <strong>📋 Tóm tắt:</strong>
            {businessErrors.some((err) => err.includes("vượt quá")) &&
              " Cần điều chỉnh tổng khối lượng/giá trị hợp đồng"}
            {businessErrors.some((err) => err.includes("cùng loại")) &&
              " Cần loại bỏ mặt hàng trùng loại"}
            {businessErrors.some((err) => err.includes("đã tồn tại")) &&
              " Cần đổi số hợp đồng"}
            {businessErrors.some((err) => err.includes("không có quyền")) &&
              " Cần liên hệ admin"}
          </div>

          {/* Hướng dẫn giải quyết */}
          <div className="mt-3 pt-3 border-t border-orange-200">
            <p className="text-orange-600 text-sm font-medium mb-2">
              💡 Hướng dẫn:
            </p>
            <ul className="text-orange-600 text-xs space-y-1">
              {businessErrors.some((err) => err.includes("vượt quá")) && (
                <>
                  <li>
                    • Kiểm tra lại tổng khối lượng và giá trị của các mặt hàng
                  </li>
                  <li>
                    • Đảm bảo tổng từ các mặt hàng không vượt quá tổng đã khai
                    báo
                  </li>
                  <li>• Hoặc tăng tổng khối lượng/giá trị hợp đồng lên</li>
                  {(() => {
                    const { totalQuantity, totalValue } = calculateTotals();
                    return (
                      <>
                        <li>
                          • Tổng từ mặt hàng: {totalQuantity.toFixed(1)} kg,{" "}
                          {totalValue.toLocaleString()} VND
                        </li>
                        <li>
                          • Tổng hợp đồng hiện tại: {data.totalQuantity || 0}{" "}
                          kg, {data.totalValue || 0} VND
                        </li>
                        <li className="mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const { totalQuantity, totalValue } =
                                calculateTotals();
                              handleChange("totalQuantity", totalQuantity);
                              handleChange("totalValue", totalValue);
                              toast.success("Đã cập nhật tổng từ mặt hàng");
                            }}
                            className="text-xs h-6 px-2"
                          >
                            Tự động cập nhật tổng
                          </Button>
                        </li>
                      </>
                    );
                  })()}
                </>
              )}
              {businessErrors.some((err) => err.includes("cùng loại")) && (
                <li>• Không được có 2 dòng hợp đồng cùng loại cà phê</li>
              )}
              {businessErrors.some((err) => err.includes("đã tồn tại")) && (
                <li>• Số hợp đồng đã tồn tại, hãy đổi số khác</li>
              )}
              {businessErrors.some((err) => err.includes("không có quyền")) && (
                <li>• Liên hệ admin để được cấp quyền phù hợp</li>
              )}
              {businessErrors.some((err) => err.includes("không được âm")) && (
                <li>• Kiểm tra các giá trị số không được âm</li>
              )}
              {businessErrors.some(
                (err) =>
                  err.includes("phải lớn hơn") || err.includes("phải nhỏ hơn")
              ) && <li>• Kiểm tra các điều kiện về giá trị min/max</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Hiển thị tất cả lỗi cần sửa (bao gồm cả lỗi nghiệp vụ và validation field) */}
      {(Object.keys(fieldErrors).length > 0 || businessErrors.length > 0) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-800 font-medium">Có lỗi cần sửa:</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {Object.keys(fieldErrors).length + businessErrors.length} lỗi
            </span>
          </div>

          <ul className="text-red-700 text-sm space-y-1">
            {/* Hiển thị lỗi nghiệp vụ trước */}
            {businessErrors.map((error, index) => (
              <li key={`business-${index}`} className="flex items-start">
                <span className="text-red-500 mr-2">⚠</span>
                <span className="font-medium">Quy tắc nghiệp vụ:</span>
                <span className="ml-2">{error}</span>
              </li>
            ))}

            {/* Hiển thị lỗi validation field */}
            {Object.entries(fieldErrors).map(([field, message]) => {
              const fieldName = getFieldDisplayName(field);
              return (
                <li key={field} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>
                    <strong>{fieldName}:</strong> {message}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Số hợp đồng</label>
          <Input
            placeholder="VD: CT001"
            value={data.contractNumber}
            onChange={(e) => handleChange("contractNumber", e.target.value)}
            required
            className={hasFieldError("contractNumber") ? "border-red-500" : ""}
          />
          {hasFieldError("contractNumber") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("contractNumber")}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Tiêu đề</label>
          <Input
            placeholder="Tiêu đề hợp đồng"
            value={data.contractTitle}
            onChange={(e) => handleChange("contractTitle", e.target.value)}
            required
            className={hasFieldError("contractTitle") ? "border-red-500" : ""}
          />
          {hasFieldError("contractTitle") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("contractTitle")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">File hợp đồng</label>
        <Input
          placeholder="URL file"
          value={data.contractFileUrl || ""}
          onChange={(e) => handleChange("contractFileUrl", e.target.value)}
          className={hasFieldError("contractFileUrl") ? "border-red-500" : ""}
        />
        {hasFieldError("contractFileUrl") && (
          <p className="text-red-500 text-xs mt-1">
            {getFieldError("contractFileUrl")}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Đối tác</label>
        <select
          value={data.buyerId}
          onChange={(e) => handleChange("buyerId", e.target.value)}
          className={`w-full p-2 border rounded ${
            hasFieldError("buyerId") ? "border-red-500" : ""
          }`}
          required
        >
          <option value="">-- Chọn đối tác --</option>
          {buyers.map((buyer) => (
            <option key={buyer.buyerId} value={buyer.buyerId}>
              {buyer.companyName}
            </option>
          ))}
        </select>
        {hasFieldError("buyerId") && (
          <p className="text-red-500 text-xs mt-1">
            {getFieldError("buyerId")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Số đợt</label>
          <Input
            type="number"
            min={1}
            value={data.deliveryRounds || ""}
            onChange={(e) =>
              handleNumericChange("deliveryRounds", Number(e.target.value))
            }
            className={hasFieldError("deliveryRounds") ? "border-red-500" : ""}
          />
          {hasFieldError("deliveryRounds") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("deliveryRounds")}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Tổng KL (kg)</label>
          <Input
            type="number"
            step={0.1}
            min={0}
            value={data.totalQuantity || ""}
            onChange={(e) =>
              handleNumericChange("totalQuantity", Number(e.target.value))
            }
            className={hasFieldError("totalQuantity") ? "border-red-500" : ""}
          />
          {hasFieldError("totalQuantity") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("totalQuantity")}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Tổng GT (VND)
          </label>
          <Input
            type="number"
            min={0}
            value={data.totalValue || ""}
            onChange={(e) =>
              handleNumericChange("totalValue", Number(e.target.value))
            }
            className={hasFieldError("totalValue") ? "border-red-500" : ""}
          />
          {hasFieldError("totalValue") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("totalValue")}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DatePicker
          label="Ngày bắt đầu"
          value={data.startDate as any}
          onChange={(date) => handleChange("startDate", date)}
          required
          error={hasFieldError("startDate")}
          errorMessage={getFieldError("startDate")}
        />
        <DatePicker
          label="Ngày kết thúc"
          value={data.endDate as any}
          onChange={(date) => handleChange("endDate", date)}
          required
          error={hasFieldError("endDate")}
          errorMessage={getFieldError("endDate")}
        />
        <DatePicker
          label="Ngày ký"
          value={data.signedAt as any}
          onChange={(date) => handleChange("signedAt", date)}
          error={hasFieldError("signedAt")}
          errorMessage={getFieldError("signedAt")}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Trạng thái</label>
        <select
          className={`w-full p-2 border rounded ${
            hasFieldError("status") ? "border-red-500" : ""
          }`}
          value={data.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          {Object.entries(ContractStatus).map(([key, val]) => (
            <option key={val} value={val}>
              {getStatusDisplay(val).label}
            </option>
          ))}
        </select>
        {hasFieldError("status") && (
          <p className="text-red-500 text-xs mt-1">{getFieldError("status")}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Lý do huỷ (nếu có)
        </label>
        <Textarea
          placeholder="Nếu huỷ, ghi lý do..."
          value={data.cancelReason}
          onChange={(e) => handleChange("cancelReason", e.target.value)}
          className={hasFieldError("cancelReason") ? "border-red-500" : ""}
        />
        {hasFieldError("cancelReason") && (
          <p className="text-red-500 text-xs mt-1">
            {getFieldError("cancelReason")}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Danh sách mặt hàng
        </label>

        {/* Hiển thị lỗi tổng quát cho contract items */}
        {hasFieldError("contractItems") && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm font-medium">
              {getFieldError("contractItems")}
            </p>
          </div>
        )}

        {data.contractItems.length > 0 && (
          <>
            {/* Header */}
            <div className="hidden md:grid md:grid-cols-6 gap-2 mb-1 text-xs font-medium text-muted-foreground">
              <span>Loại cà phê</span>
              <span>Số lượng (kg)</span>
              <span>Đơn giá (VND/Kg)</span>
              <span>Chiết khấu (%)</span>
              <span>Ghi chú</span>
              <span></span>
            </div>

            {/* Body */}
            {data.contractItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2"
              >
                {/* Loại cà phê */}
                <select
                  value={item.coffeeTypeId}
                  onChange={(e) =>
                    updateContractItem(index, "coffeeTypeId", e.target.value)
                  }
                  className={`p-2 border rounded ${
                    hasFieldError(`contractItems.${index}.coffeeTypeId`)
                      ? "border-red-500"
                      : ""
                  }`}
                >
                  <option value="">-- Chọn loại cà phê --</option>
                  {coffeeTypes.map((type) => (
                    <option key={type.coffeeTypeId} value={type.coffeeTypeId}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
                {hasFieldError(`contractItems.${index}.coffeeTypeId`) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError(`contractItems.${index}.coffeeTypeId`)}
                  </p>
                )}

                {/* Số lượng */}
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateContractItem(
                      index,
                      "quantity",
                      Number(e.target.value)
                    )
                  }
                  className={
                    hasFieldError(`contractItems.${index}.quantity`)
                      ? "border-red-500"
                      : ""
                  }
                />
                {hasFieldError(`contractItems.${index}.quantity`) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError(`contractItems.${index}.quantity`)}
                  </p>
                )}

                {/* Đơn giá */}
                <Input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateContractItem(
                      index,
                      "unitPrice",
                      Number(e.target.value)
                    )
                  }
                  className={
                    hasFieldError(`contractItems.${index}.unitPrice`)
                      ? "border-red-500"
                      : ""
                  }
                />
                {hasFieldError(`contractItems.${index}.unitPrice`) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError(`contractItems.${index}.unitPrice`)}
                  </p>
                )}

                {/* Chiết khấu */}
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  value={item.discountAmount || ""}
                  onChange={(e) =>
                    updateContractItem(
                      index,
                      "discountAmount",
                      Number(e.target.value)
                    )
                  }
                  className={
                    hasFieldError(`contractItems.${index}.discountAmount`)
                      ? "border-red-500"
                      : ""
                  }
                />
                {hasFieldError(`contractItems.${index}.discountAmount`) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError(`contractItems.${index}.discountAmount`)}
                  </p>
                )}

                {/* Ghi chú */}
                <Input
                  placeholder="Ghi chú"
                  value={item.note || ""}
                  onChange={(e) =>
                    updateContractItem(index, "note", e.target.value)
                  }
                  className={
                    hasFieldError(`contractItems.${index}.note`)
                      ? "border-red-500"
                      : ""
                  }
                />
                {hasFieldError(`contractItems.${index}.note`) && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError(`contractItems.${index}.note`)}
                  </p>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeContractItem(index)}
                >
                  Xoá
                </Button>
              </div>
            ))}
          </>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addContractItem}
          className="mt-2"
        >
          + Thêm mặt hàng
        </Button>
      </div>

      <DialogFooter className="flex justify-between pt-4">
        <Button type="submit" onClick={handleSubmit}>
          <h2>Lưu hợp đồng</h2>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/manager/contracts")}
        >
          Quay lại
        </Button>
      </DialogFooter>
    </form>
  );
}
