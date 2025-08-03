import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode } from "react";
import { Button } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | ReactNode;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
      <Dialog.Content className="fixed p-6 bg-white rounded shadow-md top-1/2 left-1/2 
        -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md z-60">
        <Dialog.Title className="text-lg font-medium mb-4">{title}</Dialog.Title>
        <Dialog.Description className="mb-6">{description}</Dialog.Description>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
