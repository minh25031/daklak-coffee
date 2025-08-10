"use client";

import { Input } from "./input"; // hoặc từ shadcn nếu dùng
import { Label } from "./label";

type Props = {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function DatePicker({ label, value, onChange, required }: Props) {
  return (
    <div className="space-y-1">
      {label && <Label className="text-sm">{label}</Label>}
      <Input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}