"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getContractDetails } from "@/lib/api/contracts";
import {
  createContractDeliveryBatch,
  updateContractDeliveryBatch,
  ContractDeliveryBatchCreateDto,
  ContractDeliveryBatchUpdateDto,
  getContractDeliveryBatchById,
} from "@/lib/api/contractDeliveryBatches";
import {
  ContractDeliveryBatchStatus,
  ContractDeliveryBatchStatusLabel,
} from "@/lib/constants/contractDeliveryBatchStatus";
import { toDateOnly, fromDateOnly, getErrorMessage } from "@/lib/utils";

export type ContractOption = { contractId: string; contractNumber: string };

// Form State
type DeliveryBatchFormState = {
  // Giống create DTO nhưng expectedDeliveryDate có thể undefined
  contractId: string;
  deliveryRound: number;
  expectedDeliveryDate?: Date;
  totalPlannedQuantity: number;
  status: ContractDeliveryBatchStatus;
  contractDeliveryItems: {
    contractItemId: string;
    plannedQuantity: number;
    note?: string;
  }[];
};

type Props = {
  initialData?: ContractDeliveryBatchUpdateDto;
  onSuccess: () => void;
  contractId?: string;
  contractOptions?: ContractOption[];
};

export default function ContractDeliveryBatchForm({
  initialData,
  onSuccess,
  contractId,
  contractOptions = [],
}: Props) {
  const isEdit = !!initialData;
  const router = useRouter();

  // formData
  const [formData, setFormData] = useState<DeliveryBatchFormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [businessErrors, setBusinessErrors] = useState<string[]>([]);

  type ContractItemOption = { contractItemId: string; coffeeTypeName: string };
  const [itemOptions, setItemOptions] = useState<ContractItemOption[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Helpers
  const toDateOnlyString = (d?: Date | string) => {
    if (!d) return "";
    if (d instanceof Date) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    // giả định đã là 'YYYY-MM-DD'
    return d;
  };

  // Khởi tạo form từ initialData (edit) hoặc từ contractId (create)
  useEffect(() => {
    if (initialData) {
      setFormData({
        contractId: initialData.contractId,
        deliveryRound: initialData.deliveryRound,
        expectedDeliveryDate: fromDateOnly(
          initialData.expectedDeliveryDate ?? undefined
        ),
        totalPlannedQuantity: initialData.totalPlannedQuantity,
        status: initialData.status,
        contractDeliveryItems:
          (initialData as any).contractDeliveryItems ??
          (initialData as any).deliveryItems ??
          [],
      });
    } else {
      setFormData({
        contractId: contractId ?? "",
        deliveryRound: 1,
        expectedDeliveryDate: undefined, // để trống DatePicker
        totalPlannedQuantity: 0,
        status: ContractDeliveryBatchStatus.InProgress,
        contractDeliveryItems: [],
      });
    }
  }, [initialData, contractId]);

  // Load danh sách ContractItem theo contractId đang chọn
  useEffect(() => {
    const cid = formData?.contractId;
    if (!cid) {
      setItemOptions([]);
      return;
    }
    (async () => {
      try {
        setLoadingItems(true);
        const detail = await getContractDetails(cid);
        const raw =
          (detail as any).contractItems ??
          (detail as any).contractItemViews ??
          (detail as any).items ??
          [];
        setItemOptions(
          (Array.isArray(raw) ? raw : []).map((x: any) => ({
            contractItemId: x.contractItemId,
            coffeeTypeName: x.coffeeTypeName,
          }))
        );
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải danh sách mặt hàng của hợp đồng.");
      } finally {
        setLoadingItems(false);
      }
    })();
  }, [formData?.contractId]);

  // Khi vào trang EDIT: tải items của ĐỢT GIAO (đúng nguồn)
  useEffect(() => {
    if (!isEdit || !initialData?.deliveryBatchId) return;
    (async () => {
      try {
        const detail = await getContractDeliveryBatchById(
          initialData.deliveryBatchId
        );
        const rows = (detail.contractDeliveryItems ?? []).map((x) => ({
          contractItemId: x.contractItemId,
          plannedQuantity: x.plannedQuantity ?? 0,
          note: x.note ?? "",
        }));

        setFormData((prev) =>
          prev
            ? { ...prev, contractDeliveryItems: rows }
            : {
                contractId: detail.contractId,
                deliveryRound: detail.deliveryRound,
                expectedDeliveryDate: fromDateOnly(detail.expectedDeliveryDate), // sửa đây
                totalPlannedQuantity: detail.totalPlannedQuantity ?? 0,
                status: detail.status,
                contractDeliveryItems: rows,
              }
        );
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách mặt hàng của đợt giao.");
      }
    })();
  }, [isEdit, initialData?.deliveryBatchId]);

  if (!formData) {
    return (
      <div className="text-gray-500 text-center py-10">
        Đang khởi tạo biểu mẫu đợt giao...
      </div>
    );
  }

  // set field
  const handleChange = (field: keyof DeliveryBatchFormState, value: any) => {
    setFormData((prev) => ({
      ...(prev as DeliveryBatchFormState),
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

    // Clear business errors when user makes any change
    if (businessErrors.length > 0) {
      setBusinessErrors([]);
    }
  };

  // Helper function to get error for a specific field
  const getFieldError = (fieldName: string): string | undefined => {
    return fieldErrors[fieldName];
  };

  // Helper function to check if field has error
  const hasFieldError = (fieldName: string): boolean => {
    return !!fieldErrors[fieldName];
  };

  // Items helpers
  const ensureItems = () =>
    setFormData((prev) => ({
      ...(prev as DeliveryBatchFormState),
      contractDeliveryItems: Array.isArray(prev?.contractDeliveryItems)
        ? (prev as DeliveryBatchFormState).contractDeliveryItems
        : [],
    }));

  const addRow = () => {
    ensureItems();
    setFormData((prev) => ({
      ...(prev as DeliveryBatchFormState),
      contractDeliveryItems: [
        ...((prev as DeliveryBatchFormState).contractDeliveryItems || []),
        { contractItemId: "", plannedQuantity: 0, note: "" },
      ],
    }));
  };

  const updateRow = (
    index: number,
    field: "contractItemId" | "plannedQuantity" | "note",
    value: any
  ) => {
    setFormData((prev) => {
      const base = { ...(prev as DeliveryBatchFormState) };
      const arr = [...(base.contractDeliveryItems || [])];
      arr[index] = {
        ...arr[index],
        [field]: field === "plannedQuantity" ? Number(value) : value,
      };
      base.contractDeliveryItems = arr;
      return base;
    });

    // Clear field error when user starts typing
    const fieldKey = `contractDeliveryItems.${index}.${field}`;
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }

    // Clear business errors when user makes any change
    if (businessErrors.length > 0) {
      setBusinessErrors([]);
    }

    // Client-side validation for contract delivery item fields
    if (field === "plannedQuantity" && value <= 0) {
      setFieldErrors((prev) => ({
        ...prev,
        [`contractDeliveryItems.${index}.plannedQuantity`]:
          "Số lượng phải lớn hơn 0",
      }));
    } else if (field === "contractItemId" && !value) {
      setFieldErrors((prev) => ({
        ...prev,
        [`contractDeliveryItems.${index}.contractItemId`]:
          "Vui lòng chọn loại cà phê",
      }));
    }
  };

  const removeRow = (index: number) =>
    setFormData((prev) => {
      const base = { ...(prev as DeliveryBatchFormState) };
      const arr = [...(base.contractDeliveryItems || [])];
      arr.splice(index, 1);
      base.contractDeliveryItems = arr;
      return base;
    });

  const sumPlannedQuantity = () =>
    (formData.contractDeliveryItems || []).reduce(
      (acc, x) => acc + (Number(x.plannedQuantity) || 0),
      0
    );

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({});
    setBusinessErrors([]);

    // Narrow: nếu chưa khởi tạo thì dừng
    const data = formData;
    if (!data) {
      toast.error("Biểu mẫu chưa sẵn sàng, vui lòng thử lại.");
      return;
    }

    // Validate cơ bản
    const clientErrors: Record<string, string> = {};

    if (!data.contractId) {
      clientErrors.contractId = "Vui lòng chọn hợp đồng.";
    }

    if (!data.expectedDeliveryDate) {
      clientErrors.expectedDeliveryDate = "Vui lòng chọn ngày dự kiến.";
    } else {
      const picked = new Date(data.expectedDeliveryDate as any);
      picked.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (picked < today) {
        clientErrors.expectedDeliveryDate =
          "Ngày giao dự kiến không được ở quá khứ.";
      }
    }

    if (data.deliveryRound < 1) {
      clientErrors.deliveryRound = "Số đợt phải ≥ 1.";
    }

    const items = data.contractDeliveryItems || [];
    if (!items.length) {
      clientErrors.contractDeliveryItems =
        "Phải có ít nhất 1 dòng sản phẩm giao hàng.";
    } else {
      items.forEach((item, index) => {
        if (!item.contractItemId) {
          clientErrors[`contractDeliveryItems.${index}.contractItemId`] =
            "Vui lòng chọn loại cà phê";
        }
        if (!(Number(item.plannedQuantity) > 0)) {
          clientErrors[`contractDeliveryItems.${index}.plannedQuantity`] =
            "Số lượng phải lớn hơn 0";
        }
      });
    }

    const total = items.reduce(
      (s, x) => s + (Number(x.plannedQuantity) || 0),
      0
    );
    if (!(total > 0)) {
      clientErrors.totalPlannedQuantity = "Tổng khối lượng dự kiến phải > 0.";
    }

    // If there are client-side errors, display them and stop
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      toast.error("Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu");
      return;
    }

    // Build DTO đúng kiểu cho BE (DateOnly string)
    const expected = toDateOnlyString(data.expectedDeliveryDate);

    try {
      if (isEdit && initialData) {
        const payload: ContractDeliveryBatchUpdateDto = {
          deliveryBatchId: initialData.deliveryBatchId,
          contractId: data.contractId,
          deliveryRound: data.deliveryRound,
          expectedDeliveryDate: expected,
          totalPlannedQuantity: data.totalPlannedQuantity,
          status: data.status,
          contractDeliveryItems: data.contractDeliveryItems as any,
        };

        const result = await updateContractDeliveryBatch(
          payload.deliveryBatchId,
          payload
        );
        toast.success("Cập nhật đợt giao thành công!");
        // Chỉ gọi onSuccess khi update thành công
        onSuccess();
      } else {
        const payload: ContractDeliveryBatchCreateDto = {
          contractId: data.contractId,
          deliveryRound: data.deliveryRound,
          expectedDeliveryDate: expected,
          totalPlannedQuantity: data.totalPlannedQuantity,
          status: data.status,
          contractDeliveryItems: data.contractDeliveryItems as any,
        };

        const result = await createContractDeliveryBatch(payload);
        toast.success("Tạo đợt giao thành công!");
        // Chỉ gọi onSuccess khi create thành công
        onSuccess();
      }
    } catch (err) {
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
            // 1. Message dài (>50 ký tự)
            // 2. Chứa từ khóa nghiệp vụ
            // 3. Lỗi về quy tắc nghiệp vụ tổng thể
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
              message.includes(") vượt quá") ||
              // Thêm các từ khóa mới từ backend
              message.includes("quản lý doanh nghiệp") ||
              message.includes("thông tin bên mua") ||
              message.includes("Số hợp đồng") ||
              message.includes("đã tồn tại trong hệ thống") ||
              message.includes("khối lượng từ các dòng") ||
              message.includes("trị giá từ các dòng") ||
              message.includes("vượt quá tổng khối lượng") ||
              message.includes("vượt quá tổng giá trị") ||
              message.includes("vượt quá tổng trị giá") ||
              // Thêm các từ khóa cụ thể hơn cho lỗi tổng khối lượng
              message.includes("kg) vượt quá") ||
              message.includes("VND) vượt quá") ||
              message.includes("hiện có") ||
              message.includes("thêm") ||
              message.includes("từ các dòng hợp đồng") ||
              message.includes("hợp đồng đã khai báo") ||
              // Thêm các pattern cụ thể hơn
              message.includes("Tổng khối lượng từ các dòng") ||
              message.includes("Tổng trị giá từ các dòng") ||
              message.includes("vượt quá tổng khối lượng hợp đồng") ||
              message.includes("vượt quá tổng giá trị hợp đồng") ||
              message.includes("vượt quá tổng trị giá hợp đồng") ||
              // Thêm các pattern cụ thể hơn nữa
              message.includes("Tổng khối lượng từ các dòng hợp đồng") ||
              message.includes("Tổng trị giá từ các dòng hợp đồng") ||
              message.includes(
                "vượt quá tổng khối lượng hợp đồng đã khai báo"
              ) ||
              message.includes("vượt quá tổng giá trị hợp đồng đã khai báo") ||
              message.includes("vượt quá tổng trị giá hợp đồng đã khai báo") ||
              // Thêm các từ khóa cụ thể hơn
              message.includes("kg) vượt quá") ||
              message.includes("VND) vượt quá") ||
              message.includes("hiện có") ||
              message.includes("thêm") ||
              // Thêm các từ khóa cụ thể hơn nữa
              message.includes("Tổng khối lượng từ các dòng hợp đồng (") ||
              message.includes("Tổng trị giá từ các dòng hợp đồng (") ||
              message.includes(
                "vượt quá tổng khối lượng hợp đồng đã khai báo ("
              ) ||
              message.includes(
                "vượt quá tổng giá trị hợp đồng đã khai báo ("
              ) ||
              message.includes(
                "vượt quá tổng trị giá hợp đồng đã khai báo ("
              ) ||
              // Thêm các từ khóa cụ thể hơn nữa
              message.includes("kg) vượt quá tổng khối lượng") ||
              message.includes("VND) vượt quá tổng giá trị") ||
              message.includes(
                "vượt quá tổng khối lượng hợp đồng đã khai báo"
              ) ||
              message.includes("vượt quá tổng giá trị hợp đồng đã khai báo") ||
              message.includes("vượt quá tổng trị giá hợp đồng đã khai báo") ||
              // Thêm các từ khóa cụ thể hơn nữa
              message.includes("Tổng khối lượng từ các dòng hợp đồng") ||
              message.includes("Tổng trị giá từ các dòng hợp đồng") ||
              message.includes(
                "vượt quá tổng khối lượng hợp đồng đã khai báo"
              ) ||
              message.includes("vượt quá tổng giá trị hợp đồng đã khai báo") ||
              message.includes("vượt quá tổng trị giá hợp đồng đã khai báo") ||
              // Thêm các từ khóa cụ thể hơn nữa
              message.includes("kg) vượt quá") ||
              message.includes("VND) vượt quá") ||
              message.includes("hiện có") ||
              message.includes("thêm") ||
              // Thêm các từ khóa cụ thể hơn nữa
              message.includes("từ các dòng hợp đồng") ||
              message.includes("hợp đồng đã khai báo") ||
              message.includes("vượt quá tổng khối lượng") ||
              message.includes("vượt quá tổng giá trị") ||
              message.includes("vượt quá tổng trị giá");

            if (isBusinessError) {
              newBusinessErrors.push(message);
            } else {
              // Xử lý lỗi cho contract delivery items (dạng: ContractDeliveryItems[0].PlannedQuantity)
              if (
                field.startsWith("ContractDeliveryItems[") &&
                field.includes("].")
              ) {
                const match = field.match(
                  /ContractDeliveryItems\[(\d+)\]\.(\w+)/
                );
                if (match) {
                  const index = match[1];
                  const itemField = match[2];
                  newFieldErrors[
                    `contractDeliveryItems.${index}.${itemField.toLowerCase()}`
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
          // Không hiển thị toast cho lỗi nghiệp vụ, chỉ hiển thị trong form
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

          // Kiểm tra xem có phải lỗi nghiệp vụ không
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
            errorMessage.includes(") vượt quá") ||
            // Thêm các từ khóa mới từ backend
            errorMessage.includes("quản lý doanh nghiệp") ||
            errorMessage.includes("thông tin bên mua") ||
            errorMessage.includes("Số hợp đồng") ||
            errorMessage.includes("đã tồn tại trong hệ thống") ||
            errorMessage.includes("khối lượng từ các dòng") ||
            errorMessage.includes("trị giá từ các dòng") ||
            errorMessage.includes("vượt quá tổng khối lượng") ||
            errorMessage.includes("vượt quá tổng giá trị") ||
            errorMessage.includes("vượt quá tổng trị giá") ||
            // Thêm các từ khóa cụ thể hơn cho lỗi tổng khối lượng
            errorMessage.includes("kg) vượt quá") ||
            errorMessage.includes("VND) vượt quá") ||
            errorMessage.includes("hiện có") ||
            errorMessage.includes("thêm") ||
            errorMessage.includes("từ các dòng hợp đồng") ||
            errorMessage.includes("đã khai báo") ||
            // Thêm các pattern cụ thể hơn
            errorMessage.includes("Tổng khối lượng từ các dòng") ||
            errorMessage.includes("Tổng trị giá từ các dòng") ||
            errorMessage.includes("vượt quá tổng khối lượng hợp đồng") ||
            errorMessage.includes("vượt quá tổng giá trị hợp đồng") ||
            errorMessage.includes("vượt quá tổng trị giá hợp đồng") ||
            // Thêm các pattern cụ thể hơn nữa
            errorMessage.includes("Tổng khối lượng từ các dòng hợp đồng") ||
            errorMessage.includes("Tổng trị giá từ các dòng hợp đồng") ||
            errorMessage.includes(
              "vượt quá tổng khối lượng hợp đồng đã khai báo"
            ) ||
            errorMessage.includes(
              "vượt quá tổng giá trị hợp đồng đã khai báo"
            ) ||
            errorMessage.includes(
              "vượt quá tổng trị giá hợp đồng đã khai báo"
            ) ||
            // Thêm các từ khóa cụ thể hơn
            errorMessage.includes("kg) vượt quá") ||
            errorMessage.includes("VND) vượt quá") ||
            errorMessage.includes("hiện có") ||
            errorMessage.includes("thêm") ||
            // Thêm các từ khóa cụ thể hơn nữa
            errorMessage.includes("Tổng khối lượng từ các dòng hợp đồng (") ||
            errorMessage.includes("Tổng trị giá từ các dòng hợp đồng (") ||
            errorMessage.includes(
              "vượt quá tổng khối lượng hợp đồng đã khai báo ("
            ) ||
            errorMessage.includes(
              "vượt quá tổng giá trị hợp đồng đã khai báo ("
            ) ||
            errorMessage.includes(
              "vượt quá tổng trị giá hợp đồng đã khai báo ("
            ) ||
            // Thêm các từ khóa cụ thể hơn nữa
            errorMessage.includes("kg) vượt quá tổng khối lượng") ||
            errorMessage.includes("VND) vượt quá tổng giá trị") ||
            errorMessage.includes(
              "vượt quá tổng khối lượng hợp đồng đã khai báo"
            ) ||
            errorMessage.includes(
              "vượt quá tổng giá trị hợp đồng đã khai báo"
            ) ||
            errorMessage.includes(
              "vượt quá tổng trị giá hợp đồng đã khai báo"
            ) ||
            // Thêm các từ khóa cụ thể hơn nữa
            errorMessage.includes("Tổng khối lượng từ các dòng hợp đồng") ||
            errorMessage.includes(
              "vượt quá tổng khối lượng hợp đồng đã khai báo"
            ) ||
            errorMessage.includes(
              "vượt quá tổng giá trị hợp đồng đã khai báo"
            ) ||
            errorMessage.includes(
              "vượt quá tổng trị giá hợp đồng đã khai báo"
            ) ||
            // Thêm các từ khóa cụ thể hơn nữa
            errorMessage.includes("kg) vượt quá") ||
            errorMessage.includes("VND) vượt quá") ||
            errorMessage.includes("hiện có") ||
            errorMessage.includes("thêm") ||
            // Thêm các từ khóa cụ thể hơn nữa
            errorMessage.includes("từ các dòng hợp đồng") ||
            errorMessage.includes("hợp đồng đã khai báo") ||
            errorMessage.includes("vượt quá tổng khối lượng") ||
            errorMessage.includes("vượt quá tổng giá trị") ||
            errorMessage.includes("vượt quá tổng trị giá");

          if (isBusinessError) {
            // Đây là lỗi nghiệp vụ, hiển thị trong business errors
            setBusinessErrors([errorMessage]);
            // Không hiển thị toast cho lỗi nghiệp vụ, chỉ hiển thị trong form
          } else {
            // Đây là lỗi khác, hiển thị toast
            toast.error(errorMessage || "Đã xảy ra lỗi khi lưu đợt giao.");
          }
        } else {
          // Sử dụng getErrorMessage để xử lý lỗi khác
          const errorMessage = getErrorMessage(err);
          toast.error(errorMessage || "Đã xảy ra lỗi khi lưu đợt giao.");
        }
      }
      // Không gọi onSuccess khi có lỗi - form sẽ ở lại trang hiện tại
    }
  }

  const dateString = toDateOnly(formData.expectedDeliveryDate);

  // ---------- UI ----------
  return (
    <form className="max-w-4xl mx-auto bg-white border rounded-2xl shadow p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isEdit ? "Chỉnh sửa đợt giao" : "Tạo đợt giao mới"}
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

          {/* Tóm tắt nhanh */}
          <div className="mb-3 p-2 bg-orange-100 rounded text-orange-800 text-sm">
            <strong>📋 Tóm tắt:</strong>
            {businessErrors.some((err) => err.includes("vượt quá")) &&
              " Cần điều chỉnh tổng khối lượng/giá trị đợt giao"}
            {businessErrors.some((err) => err.includes("cùng loại")) &&
              " Cần loại bỏ mặt hàng trùng loại"}
            {businessErrors.some((err) => err.includes("đã tồn tại")) &&
              " Cần đổi thông tin đợt giao"}
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
                  <li>• Kiểm tra lại tổng khối lượng của các mặt hàng</li>
                  <li>
                    • Đảm bảo tổng từ các mặt hàng không vượt quá tổng đã khai
                    báo
                  </li>
                  <li>• Hoặc tăng tổng khối lượng đợt giao lên</li>
                  {(() => {
                    const total = sumPlannedQuantity();
                    return (
                      <>
                        <li>• Tổng từ mặt hàng: {total.toFixed(1)} kg</li>
                        <li>
                          • Tổng đợt giao hiện tại:{" "}
                          {formData?.totalPlannedQuantity || 0} kg
                        </li>
                        <li className="mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const total = sumPlannedQuantity();
                              handleChange("totalPlannedQuantity", total);
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
                <li>• Không được có 2 dòng đợt giao cùng loại cà phê</li>
              )}
              {businessErrors.some((err) => err.includes("đã tồn tại")) && (
                <li>• Thông tin đợt giao đã tồn tại, hãy đổi thông tin khác</li>
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

      {/* Hợp đồng */}
      {contractId ? (
        <div>
          <label className="block mb-1 text-sm font-medium">Hợp đồng</label>
          <Input value={contractId} disabled />
        </div>
      ) : (
        <div>
          <label className="block mb-1 text-sm font-medium">Hợp đồng</label>
          <select
            value={formData.contractId}
            onChange={(e) => handleChange("contractId", e.target.value)}
            className={`w-full p-2 border rounded ${
              hasFieldError("contractId") ? "border-red-500" : ""
            }`}
            required
          >
            <option value="">-- Chọn hợp đồng --</option>
            {contractOptions.map((c) => (
              <option key={c.contractId} value={c.contractId}>
                {c.contractNumber}
              </option>
            ))}
          </select>
          {hasFieldError("contractId") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("contractId")}
            </p>
          )}
        </div>
      )}

      {/* Fields chính */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Đợt giao</label>
          <Input
            type="number"
            min={1}
            value={formData.deliveryRound}
            onChange={(e) =>
              handleChange("deliveryRound", Number(e.target.value))
            }
            className={`no-spinner ${
              hasFieldError("deliveryRound") ? "border-red-500" : ""
            }`}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key.toLowerCase() === "e")
                e.preventDefault();
            }}
          />
          {hasFieldError("deliveryRound") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("deliveryRound")}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Ngày dự kiến</label>
          <DatePicker
            value={dateString}
            onChange={(d) =>
              handleChange("expectedDeliveryDate", fromDateOnly(d))
            }
            error={hasFieldError("expectedDeliveryDate")}
            errorMessage={getFieldError("expectedDeliveryDate")}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Khối lượng dự kiến (kg)
          </label>
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={formData.totalPlannedQuantity}
            onChange={(e) =>
              handleChange("totalPlannedQuantity", Number(e.target.value))
            }
            className={`no-spinner ${
              hasFieldError("totalPlannedQuantity") ? "border-red-500" : ""
            }`}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key.toLowerCase() === "e")
                e.preventDefault();
            }}
          />
          {hasFieldError("totalPlannedQuantity") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("totalPlannedQuantity")}
            </p>
          )}
        </div>
      </div>

      {/* Trạng thái */}
      {isEdit ? (
        <div>
          <label className="block mb-1 text-sm font-medium">Trạng thái</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.status}
            onChange={(e) =>
              handleChange(
                "status",
                e.target.value as ContractDeliveryBatchStatus
              )
            }
          >
            {Object.values(ContractDeliveryBatchStatus).map((s) => (
              <option key={s} value={s}>
                {ContractDeliveryBatchStatusLabel[s]}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block mb-1 text-sm font-medium">Trạng thái</label>
          <div className="p-2 border rounded bg-gray-50">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {
                ContractDeliveryBatchStatusLabel[
                  ContractDeliveryBatchStatus.InProgress
                ]
              }
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Đợt giao mới sẽ có trạng thái "Đang thực hiện" mặc định
          </p>
        </div>
      )}

      {/* Ghi chú */}
      <div>
        <label className="block mb-1 text-sm font-medium">Ghi chú</label>
        <Textarea
          placeholder="Nhập ghi chú (tuỳ chọn)"
          value={(formData as any).note || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...(p as any), note: e.target.value }))
          }
        />
      </div>

      {/* Danh sách mặt hàng */}
      <div>
        <label className="block mb-1 text-sm font-medium">
          Danh sách mặt hàng đợt giao
        </label>

        {/* Hiển thị lỗi tổng quát cho contract delivery items */}
        {hasFieldError("contractDeliveryItems") && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm font-medium">
              {getFieldError("contractDeliveryItems")}
            </p>
          </div>
        )}

        {(formData.contractDeliveryItems?.length ?? 0) > 0 && (
          <div className="hidden md:grid md:grid-cols-6 gap-2 mb-1 text-xs font-medium text-muted-foreground">
            <span>Loại cà phê</span>
            <span className="text-left">Số lượng (kg)</span>
            <span className="col-span-3">Ghi chú</span>
            <span></span>
          </div>
        )}

        {(formData.contractDeliveryItems || []).map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2">
            <select
              value={row.contractItemId}
              onChange={(e) => updateRow(idx, "contractItemId", e.target.value)}
              className={`p-2 border rounded ${
                hasFieldError(`contractDeliveryItems.${idx}.contractItemId`)
                  ? "border-red-500"
                  : ""
              }`}
              disabled={loadingItems || !itemOptions.length}
            >
              <option value="">-- Chọn loại cà phê --</option>
              {itemOptions.map((opt) => (
                <option key={opt.contractItemId} value={opt.contractItemId}>
                  {opt.coffeeTypeName}
                </option>
              ))}
            </select>
            {hasFieldError(`contractDeliveryItems.${idx}.contractItemId`) && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError(`contractDeliveryItems.${idx}.contractItemId`)}
              </p>
            )}

            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={row.plannedQuantity ?? 0}
              onChange={(e) =>
                updateRow(idx, "plannedQuantity", e.target.value)
              }
              className={`no-spinner text-left ${
                hasFieldError(`contractDeliveryItems.${idx}.plannedQuantity`)
                  ? "border-red-500"
                  : ""
              }`}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key.toLowerCase() === "e")
                  e.preventDefault();
              }}
            />
            {hasFieldError(`contractDeliveryItems.${idx}.plannedQuantity`) && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError(`contractDeliveryItems.${idx}.plannedQuantity`)}
              </p>
            )}

            <Input
              placeholder="Ghi chú"
              value={row.note || ""}
              onChange={(e) => updateRow(idx, "note", e.target.value)}
              className="md:col-span-3"
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => removeRow(idx)}
            >
              Xoá
            </Button>
          </div>
        ))}

        <div className="flex items-center justify-between mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            disabled={!formData.contractId || loadingItems}
          >
            + Thêm dòng
          </Button>

          <div className="text-sm text-gray-600">
            Tổng khối lượng dòng:{" "}
            <strong>{sumPlannedQuantity().toLocaleString()}</strong> kg
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-between pt-4">
        <Button type="submit" onClick={handleSubmit}>
          <h2>{isEdit ? "Lưu thay đổi" : "Tạo đợt giao"}</h2>
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </DialogFooter>
    </form>
  );
}
