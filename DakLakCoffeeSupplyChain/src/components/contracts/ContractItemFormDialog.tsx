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
          <div className="grid gap-1">
            <Label htmlFor="coffeeTypeId">Loại cà phê</Label>
            <Select
              value={formData.coffeeTypeId}
              onValueChange={(value) => {
                console.log("Coffee type selected:", value);
                setFormData((prev) => ({ ...prev, coffeeTypeId: value }));
              }}
            >
              <SelectTrigger id="coffeeTypeId" className="w-full">
                <SelectValue>
                  {coffeeTypes.find(
                    (ct) => ct.coffeeTypeId === formData.coffeeTypeId
                  )?.typeName ?? "Chọn loại cà phê"}
                </SelectValue>
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

          <div className="grid gap-1">
            <Label htmlFor="quantity">Số lượng</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              min={0}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="unitPrice">Đơn giá</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              type="number"
              value={formData.unitPrice}
              onChange={handleChange}
              min={0}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="discountAmount">Chiết khấu</Label>
            <Input
              id="discountAmount"
              name="discountAmount"
              type="number"
              value={formData.discountAmount}
              onChange={handleChange}
              min={0}
            />
          </div>

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
