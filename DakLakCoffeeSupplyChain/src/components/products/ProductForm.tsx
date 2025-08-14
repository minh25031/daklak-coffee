"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

import {
  createProduct,
  updateProduct,
  getProductById,
  type ProductCreateDto,
  type ProductUpdateDto,
  type ProductViewDetailsDto,
  ProductUnit,
  ProductUnitLabel,
  getProcessingBatchOptions,
  getInventoryOptions,
  type ProcessingBatchOption,
  type InventoryOption,
} from "@/lib/api/products";
import { getCoffeeTypes, type CoffeeType } from "@/lib/api/coffeeType";
import {
  ProductStatus,
  ProductStatusLabel,
} from "@/lib/constants/productStatus";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { useAuth } from "@/lib/hooks/useAuth";

type Props = {
  initialData?: ProductUpdateDto | ProductViewDetailsDto; // nếu có -> Edit; nếu không -> Create
  onSuccess: () => void;
};

type FormState = {
  productName: string;
  description: string;
  unitPrice: number | "";
  quantityAvailable: number | "";
  unit: ProductUnit;
  batchId: string;
  inventoryId: string;
  coffeeTypeId: string;
  originRegion: string;
  originFarmLocation: string;
  geographicalIndicationCode: string;
  certificationUrl: string;
  evaluatedQuality: string;
  evaluationScore: number | "";
  status: ProductStatus;
  approvalNote: string;
};

export default function ProductForm({ initialData, onSuccess }: Props) {
  const isEdit = !!initialData;
  const router = useRouter();
  const { user } = useAuth(); // Lấy thông tin user hiện tại

  // Options
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [batchOptions, setBatchOptions] = useState<ProcessingBatchOption[]>([]);
  const [inventoryOptions, setInventoryOptions] = useState<InventoryOption[]>(
    []
  );
  const [loadingOptions, setLoadingOptions] = useState(false);

  // -------------------- form state --------------------
  const [form, setForm] = useState<FormState>({
    productName: "",
    description: "",
    unitPrice: "",
    quantityAvailable: "",
    unit: ProductUnit.Kg,
    batchId: "",
    inventoryId: "",
    coffeeTypeId: "",
    originRegion: "",
    originFarmLocation: "",
    geographicalIndicationCode: "",
    certificationUrl: "",
    evaluatedQuality: "",
    evaluationScore: "",
    status: ProductStatus.Approved, // Always Approved for new products
    approvalNote: "",
  });

  // Map dữ liệu edit -> form
  useEffect(() => {
    if (!initialData) return;

    // Ưu tiên sử dụng ID trực tiếp nếu có
    let batchId = (initialData as any).batchId || "";
    let inventoryId = (initialData as any).inventoryId || "";
    let coffeeTypeId = (initialData as any).coffeeTypeId || "";

    // Nếu không có ID trực tiếp, tìm từ tên
    if (!batchId && (initialData as any).batchCode) {
      const matchingBatch = batchOptions.find(
        (batch) => batch.batchCode === (initialData as any).batchCode
      );
      batchId = matchingBatch?.batchId || "";
    }

    // Tìm inventoryId từ inventoryCode (ưu tiên) hoặc warehouseName
    if (!inventoryId) {
      if ((initialData as any).inventoryCode) {
        // Tìm theo inventoryCode trước
        const matchingInventory = inventoryOptions.find(
          (inv) => inv.inventoryCode === (initialData as any).inventoryCode
        );
        inventoryId = matchingInventory?.inventoryId || "";

        if (!inventoryId) {
          console.log(
            "Không tìm thấy inventory với code:",
            (initialData as any).inventoryCode
          );
        }
      } else if ((initialData as any).inventoryLocation) {
        // Fallback: tìm theo inventoryLocation
        const matchingInventory = inventoryOptions.find(
          (inv) =>
            inv.warehouseName.includes(
              (initialData as any).inventoryLocation
            ) || inv.location.includes((initialData as any).inventoryLocation)
        );
        inventoryId = matchingInventory?.inventoryId || "";
      }
    }

    if (!coffeeTypeId && (initialData as any).coffeeTypeName) {
      const matchingCoffeeType = coffeeTypes.find(
        (type) => type.typeName === (initialData as any).coffeeTypeName
      );
      coffeeTypeId = matchingCoffeeType?.coffeeTypeId || "";
    }

    console.log("Mapping edit data:", {
      initialData,
      foundBatchId: batchId,
      foundInventoryId: inventoryId,
      foundCoffeeTypeId: coffeeTypeId,
      inventoryCode: (initialData as any).inventoryCode,
      warehouseName: (initialData as any).warehouseName,
    });

    setForm({
      productName: initialData.productName || "",
      description: initialData.description || "",
      unitPrice: initialData.unitPrice || "",
      quantityAvailable: initialData.quantityAvailable || "",
      unit: (initialData.unit as ProductUnit) || ProductUnit.Kg,
      batchId,
      inventoryId,
      coffeeTypeId,
      originRegion: initialData.originRegion || "",
      originFarmLocation: initialData.originFarmLocation || "",
      geographicalIndicationCode: initialData.geographicalIndicationCode || "",
      certificationUrl: initialData.certificationUrl || "",
      evaluatedQuality: initialData.evaluatedQuality || "",
      evaluationScore: initialData.evaluationScore || "",
      status: (initialData.status as ProductStatus) || ProductStatus.Pending,
      approvalNote: initialData.approvalNote || "",
    });
  }, [initialData, batchOptions, inventoryOptions, coffeeTypes]);

  // Load options
  useEffect(() => {
    (async () => {
      setLoadingOptions(true);
      try {
        console.log("Loading options...");
        const [types, batches, inventories] = await Promise.all([
          getCoffeeTypes(),
          getProcessingBatchOptions(),
          getInventoryOptions(),
        ]);
        console.log("Coffee types:", types);
        console.log("Processing batches:", batches);
        console.log("Inventories:", inventories);
        console.log("Inventories length:", inventories?.length);
        console.log("First inventory item:", inventories?.[0]);

        // Sử dụng dữ liệu từ API hoặc fallback data
        setCoffeeTypes(
          types && types.length > 0
            ? types
            : [
                { coffeeTypeId: "1", typeCode: "ARAB", typeName: "Arabica" },
                { coffeeTypeId: "2", typeCode: "ROBU", typeName: "Robusta" },
                { coffeeTypeId: "3", typeCode: "CULI", typeName: "Culi" },
              ]
        );

        setBatchOptions(
          batches && batches.length > 0
            ? batches
            : [
                { batchId: "1", batchCode: "BATCH-001" },
                { batchId: "2", batchCode: "BATCH-002" },
                { batchId: "3", batchCode: "BATCH-003" },
              ]
        );

        if (inventories && inventories.length > 0) {
          console.log(
            "Using API data for inventories:",
            inventories.length,
            "items"
          );
          setInventoryOptions(inventories);
        } else {
          console.log("Using fallback data for inventories");
          setInventoryOptions([
            {
              inventoryId: "1",
              location: "Kho chính",
              inventoryCode: "INV-001",
              warehouseCode: "INV-001",
              warehouseName: "Kho chính",
              warehouseCapacity: undefined,
            },
            {
              inventoryId: "2",
              location: "Kho phụ",
              inventoryCode: "INV-002",
              warehouseCode: "INV-002",
              warehouseName: "Kho phụ",
              warehouseCapacity: undefined,
            },
            {
              inventoryId: "3",
              location: "Kho lưu trữ",
              inventoryCode: "INV-003",
              warehouseCode: "INV-003",
              warehouseName: "Kho lưu trữ",
              warehouseCapacity: undefined,
            },
          ]);
        }
      } catch (e) {
        console.error("Error loading options:", e);
        toast.error("Không thể tải danh sách tùy chọn.");

        // Fallback data khi có lỗi
        console.log("Setting fallback coffee types due to error");
        setCoffeeTypes([
          { coffeeTypeId: "1", typeCode: "ARAB", typeName: "Arabica" },
          { coffeeTypeId: "2", typeCode: "ROBU", typeName: "Robusta" },
          { coffeeTypeId: "3", typeCode: "CULI", typeName: "Culi" },
        ]);

        console.log("Setting fallback batch options due to error");
        setBatchOptions([
          { batchId: "1", batchCode: "BATCH-001" },
          { batchId: "2", batchCode: "BATCH-002" },
          { batchId: "3", batchCode: "BATCH-003" },
        ]);

        console.log("Setting fallback inventory options due to error");
        setInventoryOptions([
          {
            inventoryId: "1",
            location: "Kho chính",
            inventoryCode: "INV-001",
            warehouseCode: "INV-001",
            warehouseName: "Kho chính",
            warehouseCapacity: undefined,
          },
          {
            inventoryId: "2",
            location: "Kho phụ",
            inventoryCode: "INV-002",
            warehouseCode: "INV-002",
            warehouseName: "Kho phụ",
            warehouseCapacity: undefined,
          },
          {
            inventoryId: "3",
            location: "Kho lưu trữ",
            inventoryCode: "INV-003",
            warehouseCode: "INV-003",
            warehouseName: "Kho lưu trữ",
            warehouseCapacity: undefined,
          },
        ]);
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, []);

  // Helpers
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const data = form;

    // Validate
    if (!data.productName.trim())
      return toast.error("Vui lòng nhập tên sản phẩm.");
    if (data.productName.length > 100)
      return toast.error("Tên sản phẩm không được vượt quá 100 ký tự.");
    if (data.description.length > 500)
      return toast.error("Mô tả sản phẩm không được vượt quá 500 ký tự.");
    if (!(Number(data.unitPrice) > 0))
      return toast.error("Giá bán phải lớn hơn 0.");
    if (!(Number(data.quantityAvailable) >= 0))
      return toast.error("Số lượng phải lớn hơn hoặc bằng 0.");
    if (!data.batchId) return toast.error("Vui lòng chọn mã mẻ sơ chế.");
    if (!data.inventoryId) return toast.error("Vui lòng chọn mã kho.");
    if (!data.coffeeTypeId) return toast.error("Vui lòng chọn loại cà phê.");
    if (data.originRegion.length > 100)
      return toast.error("Vùng sản xuất không được vượt quá 100 ký tự.");
    if (data.originFarmLocation.length > 200)
      return toast.error("Vị trí nông trại không được vượt quá 200 ký tự.");
    if (data.geographicalIndicationCode.length > 50)
      return toast.error("Mã chỉ dẫn địa lý không được vượt quá 50 ký tự.");
    if (data.evaluatedQuality.length > 50)
      return toast.error("Chất lượng đánh giá không được vượt quá 50 ký tự.");
    if (
      data.evaluationScore !== "" &&
      (Number(data.evaluationScore) < 0 || Number(data.evaluationScore) > 100)
    ) {
      return toast.error("Điểm đánh giá phải trong khoảng từ 0 đến 100.");
    }
    if (data.approvalNote.length > 50)
      return toast.error("Ghi chú duyệt không được vượt quá 50 ký tự.");

    try {
      setSaving(true);

      if (isEdit && initialData) {
        const payload: ProductUpdateDto = {
          productId: initialData.productId,
          productName: data.productName.trim(),
          description: data.description.trim(),
          unitPrice: Number(data.unitPrice),
          quantityAvailable: Number(data.quantityAvailable),
          unit: data.unit,
          batchId: data.batchId,
          inventoryId: data.inventoryId,
          coffeeTypeId: data.coffeeTypeId,
          originRegion: data.originRegion.trim(),
          originFarmLocation: data.originFarmLocation.trim(),
          geographicalIndicationCode: data.geographicalIndicationCode.trim(),
          certificationUrl: data.certificationUrl.trim() || undefined,
          evaluatedQuality: data.evaluatedQuality.trim(),
          evaluationScore:
            data.evaluationScore !== ""
              ? Number(data.evaluationScore)
              : undefined,
          status: data.status,
          approvalNote: data.approvalNote.trim(),
          // Tự động điền thông tin người duyệt nếu status = Approved
          approvedBy:
            data.status === ProductStatus.Approved ? user?.id : undefined,
          approvedAt:
            data.status === ProductStatus.Approved
              ? new Date().toISOString()
              : undefined,
        };

        const req = updateProduct(payload.productId, payload);
        toast.promise(req, {
          loading: "Đang cập nhật sản phẩm...",
          success: "Cập nhật sản phẩm thành công!",
          error: "Cập nhật sản phẩm thất bại.",
        });
        await req;
      } else {
        const payload: ProductCreateDto = {
          productName: data.productName.trim(),
          description: data.description.trim(),
          unitPrice: Number(data.unitPrice),
          quantityAvailable: Number(data.quantityAvailable),
          unit: data.unit,
          batchId: data.batchId,
          inventoryId: data.inventoryId,
          coffeeTypeId: data.coffeeTypeId,
          originRegion: data.originRegion.trim(),
          originFarmLocation: data.originFarmLocation.trim(),
          geographicalIndicationCode: data.geographicalIndicationCode.trim(),
          certificationUrl: data.certificationUrl.trim() || undefined,
          evaluatedQuality: data.evaluatedQuality.trim(),
          evaluationScore:
            data.evaluationScore !== ""
              ? Number(data.evaluationScore)
              : undefined,
          status: ProductStatus.Approved, // Always Approved when creating new products
          approvalNote: data.approvalNote.trim(),
        };

        const req = createProduct(payload);
        toast.promise(req, {
          loading: "Đang tạo sản phẩm...",
          success: "Tạo sản phẩm thành công!",
          error: "Tạo sản phẩm thất bại.",
        });
        await req;
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="max-w-4xl mx-auto bg-white border rounded-2xl shadow p-8 space-y-6">
      <h2 className="text-2xl font-semibold text-center">
        {isEdit ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
      </h2>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>

        <div
          className={`grid grid-cols-1 ${
            isEdit ? "md:grid-cols-2" : "md:grid-cols-1"
          } gap-4`}
        >
          <div>
            <label className="block mb-1 text-sm font-medium">
              Tên sản phẩm *
            </label>
            <Input
              value={form.productName}
              onChange={(e) => setField("productName", e.target.value)}
              placeholder="Nhập tên sản phẩm"
              maxLength={100}
            />
          </div>

          {/* Chỉ hiển thị trạng thái khi edit */}
          {isEdit && (
            <div>
              <label className="block mb-1 text-sm font-medium">
                Trạng thái *
              </label>
              <select
                className="w-full p-2 border rounded"
                value={form.status}
                onChange={(e) =>
                  setField("status", e.target.value as ProductStatus)
                }
              >
                {Object.values(ProductStatus).map((s) => (
                  <option key={s} value={s}>
                    {ProductStatusLabel[s]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Mô tả</label>
          <Textarea
            placeholder="Nhập mô tả sản phẩm (tối đa 500 ký tự)"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            maxLength={500}
            rows={3}
          />
        </div>
      </div>

      {/* Pricing & Quantity */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Giá cả & Số lượng</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Giá bán (VND/kg) *
            </label>
            <Input
              type="number"
              min={0}
              step={1000}
              value={form.unitPrice}
              onChange={(e) =>
                setField(
                  "unitPrice",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="0"
              className="no-spinner"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Số lượng *</label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={form.quantityAvailable}
              onChange={(e) =>
                setField(
                  "quantityAvailable",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="0"
              className="no-spinner"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Đơn vị *</label>
            <select
              className="w-full p-2 border rounded"
              value={form.unit}
              onChange={(e) => setField("unit", e.target.value as ProductUnit)}
            >
              {Object.values(ProductUnit).map((unit) => (
                <option key={unit} value={unit}>
                  {ProductUnitLabel[unit]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* References */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Thông tin liên kết
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Mã mẻ sơ chế *
            </label>
            <select
              className="w-full p-2 border rounded"
              value={form.batchId}
              onChange={(e) => setField("batchId", e.target.value)}
              disabled={loadingOptions}
            >
              <option value="">-- Chọn mẻ sơ chế --</option>
              {batchOptions.map((batch) => (
                <option key={batch.batchId} value={batch.batchId}>
                  {batch.batchCode}
                </option>
              ))}
            </select>
            {/* Debug info */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Có {batchOptions.length} batch, Selected: {form.batchId || 'none'}
              </div>
            )} */}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Mã kho *</label>
            <select
              className="w-full p-2 border rounded"
              value={form.inventoryId}
              onChange={(e) => setField("inventoryId", e.target.value)}
              disabled={loadingOptions}
            >
              <option value="">-- Chọn kho --</option>
              {inventoryOptions.map((inventory) => (
                <option
                  key={inventory.inventoryId}
                  value={inventory.inventoryId}
                >
                  {inventory.inventoryCode} - {inventory.warehouseName}
                </option>
              ))}
            </select>
            {/* Debug info */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Có {inventoryOptions.length} kho, loading: {loadingOptions ? 'true' : 'false'}
                <br />
                Selected: {form.inventoryId || 'none'}
                <br />
                Options: {inventoryOptions.map(inv => `${inv.inventoryCode}(${inv.inventoryId})`).join(', ')}
              </div>
            )} */}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Loại cà phê *
            </label>
            <select
              className="w-full p-2 border rounded"
              value={form.coffeeTypeId}
              onChange={(e) => setField("coffeeTypeId", e.target.value)}
              disabled={loadingOptions}
            >
              <option value="">-- Chọn loại cà phê --</option>
              {coffeeTypes.map((type) => (
                <option key={type.coffeeTypeId} value={type.coffeeTypeId}>
                  {type.typeName}
                </option>
              ))}
            </select>
            {/* Debug info
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Có {coffeeTypes.length} loại cà phê, Selected: {form.coffeeTypeId || 'none'}
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Origin Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Thông tin nguồn gốc
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Vùng sản xuất
            </label>
            <Input
              value={form.originRegion}
              onChange={(e) => setField("originRegion", e.target.value)}
              placeholder="Nhập vùng sản xuất"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Vị trí nông trại
            </label>
            <Input
              value={form.originFarmLocation}
              onChange={(e) => setField("originFarmLocation", e.target.value)}
              placeholder="Nhập vị trí nông trại"
              maxLength={200}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Mã chỉ dẫn địa lý
            </label>
            <Input
              value={form.geographicalIndicationCode}
              onChange={(e) =>
                setField("geographicalIndicationCode", e.target.value)
              }
              placeholder="Nhập mã chỉ dẫn địa lý"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Đường dẫn chứng nhận
            </label>
            <Input
              type="url"
              value={form.certificationUrl}
              onChange={(e) => setField("certificationUrl", e.target.value)}
              placeholder="https://example.com/certification"
            />
          </div>
        </div>
      </div>

      {/* Quality Assessment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Đánh giá chất lượng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Chất lượng đánh giá
            </label>
            <Input
              value={form.evaluatedQuality}
              onChange={(e) => setField("evaluatedQuality", e.target.value)}
              placeholder="Nhập chất lượng đánh giá"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Điểm đánh giá (0-100)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={form.evaluationScore}
              onChange={(e) =>
                setField(
                  "evaluationScore",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="0-100"
              className="no-spinner"
            />
          </div>
        </div>
      </div>

      {/* Approval */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Phê duyệt</h3>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Ghi chú duyệt
          </label>
          <Textarea
            placeholder="Nhập ghi chú duyệt (tối đa 50 ký tự)"
            value={form.approvalNote}
            onChange={(e) => setField("approvalNote", e.target.value)}
            maxLength={50}
            rows={2}
          />
        </div>
      </div>

      <DialogFooter className="flex justify-between pt-4">
        <Button type="submit" onClick={handleSubmit} disabled={saving}>
          {isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </DialogFooter>
    </form>
  );
}
