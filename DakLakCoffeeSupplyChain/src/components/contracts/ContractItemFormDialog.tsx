"use client";

import { useEffect, useState } from "react";
import {
  ContractItemCreateDto,
  ContractItemUpdateDto,
  createContractItem,
  updateContractItem,
} from "@/lib/api/contractItems";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";

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

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  loading?: boolean;
  contractId: string;
  coffeeTypes: CoffeeType[];
  formData: {
    contractId: string;
    coffeeTypeId: string;
    quantity: number | string;
    unitPrice: number | string;
    discountAmount: number | string;
    note?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<Props["formData"]>>;
  handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  handleSubmit: () => void;
}

interface ContractItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  contractId: string;
  initialData?: ContractItemUpdateDto;
  onSuccess?: () => void;
}

export default function ContractItemFormDialog({
  open,
  onOpenChange,
  mode,
  contractId,
  initialData,
  onSuccess,
}: ContractItemFormDialogProps) {
  const [formData, setFormData] = useState<
    ContractItemCreateDto | ContractItemUpdateDto
  >({
    contractId,
    coffeeTypeId: "",
    quantity: 0,
    unitPrice: 0,
    discountAmount: 0,
    note: "",
  });

  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCoffeeTypes = async () => {
      try {
        const data = await getCoffeeTypes();
        setCoffeeTypes(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách loại cà phê:", error);
      }
    };

    fetchCoffeeTypes();
  }, []);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          contractId,
          coffeeTypeId: "",
          quantity: 0,
          unitPrice: 0,
          discountAmount: 0,
          note: "",
        });
      }
    }
  }, [open, JSON.stringify(initialData)]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "unitPrice" || name === "discountAmount"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    //  Thêm log ở đây
    console.log("Dữ liệu gửi update:", formData);
    try {
      if (mode === "create") {
        await createContractItem(formData as ContractItemCreateDto);
      } else {
        await updateContractItem(formData as ContractItemUpdateDto);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving contract item:", error);
      alert("Đã xảy ra lỗi khi lưu mặt hàng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm mặt hàng" : "Cập nhật mặt hàng"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Loại cà phê */}
          <div className="grid gap-1">
            <Label htmlFor="coffeeTypeId">Loại cà phê</Label>
            <Select
              // Nếu state rỗng => truyền undefined để hiện placeholder
              value={formData.coffeeTypeId || undefined}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, coffeeTypeId: value }))
              }
            >
              <SelectTrigger id="coffeeTypeId" className="w-full">
                <SelectValue placeholder="-- Chọn loại cà phê --" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {coffeeTypes.map((type) => (
                  <SelectItem key={type.coffeeTypeId} value={type.coffeeTypeId}>
                    {type.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Số lượng (kg) */}
          <div className="grid gap-1">
            <Label htmlFor="quantity">Số lượng (Kg)</Label>
            <InputWithSuffix
              id="quantity"
              name="quantity"
              type="number"
              inputMode="decimal"
              step={0.1}
              min={0}
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          {/* Đơn giá (VND/Kg) */}
          <div className="grid gap-1">
            <Label htmlFor="unitPrice">Đơn giá (VNĐ/Kg)</Label>
            <InputWithSuffix
              id="unitPrice"
              name="unitPrice"
              type="number"
              inputMode="numeric"
              min={0}
              value={formData.unitPrice}
              onChange={handleChange}
            />
          </div>

          {/* Chiết khấu (%) */}
          <div className="grid gap-1">
            <Label htmlFor="discountAmount">Chiết khấu (%)</Label>
            <InputWithSuffix
              id="discountAmount"
              name="discountAmount"
              type="number"
              inputMode="decimal"
              step={0.1}
              min={0}
              value={formData.discountAmount}
              onChange={handleChange}
            />
          </div>

          {/* Ghi chú */}
          <div className="grid gap-1">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Nhập ghi chú (tuỳ chọn)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : mode === "create" ? "Thêm" : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
