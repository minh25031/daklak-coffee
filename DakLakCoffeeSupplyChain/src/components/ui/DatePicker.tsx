"use client";

import { Input } from "./input";
import { Label } from "./label";

type Props = {
  label?: string;
  value?: string; // yyyy-MM-dd | undefined
  onChange: (value: string | undefined) => void;
  required?: boolean;
  placeholder?: string; // để TS không báo lỗi
  disabled?: boolean;
  className?: string;
  error?: boolean;
  errorMessage?: string;
};

export function DatePicker({
  label,
  value,
  onChange,
  required,
  placeholder = "yyyy-MM-dd",
  disabled,
  className,
  error,
  errorMessage,
}: Props) {
  return (
    <div className="space-y-1">
      {label && <Label className="text-sm">{label}</Label>}
      <Input
        type="date"
        value={value ?? ""} // input date dùng "" khi undefined
        onChange={(e) => onChange(e.target.value || undefined)}
        required={required}
        placeholder={placeholder} // có thể bị browser bỏ qua
        disabled={disabled}
        className={`${className || ""} ${error ? "border-red-500" : ""}`}
      />
      {error && errorMessage && (
        <p className="text-red-500 text-xs mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
