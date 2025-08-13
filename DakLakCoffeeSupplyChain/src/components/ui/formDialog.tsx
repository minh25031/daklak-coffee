"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FormDialogContentProps = React.ComponentProps<typeof Dialog.Content> & {
  size?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
};

function getMaxWidth(size: "sm" | "md" | "lg") {
  switch (size) {
    case "sm":
      return "sm:max-w-md";
    case "lg":
      return "sm:max-w-2xl";
    case "md":
    default:
      return "sm:max-w-lg";
  }
}

function FormDialogContent({
  className,
  size = "md",
  showCloseButton = true,
  children,
  ...props
}: FormDialogContentProps) {
  return (
    <Dialog.Content
      className={cn(
        "bg-white fixed top-[50%] left-[50%] z-50 grid w-[92vw] max-w-[calc(100vw-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-orange-100/50 p-0 shadow-2xl duration-200",
        getMaxWidth(size),
        "max-h-[calc(100vh-2rem)]",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <Dialog.Close className="absolute top-4 right-4 rounded-xl p-2 opacity-70 hover:opacity-100 hover:bg-orange-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 z-10">
          <XIcon className="w-5 h-5 text-gray-600" />
          <span className="sr-only">Đóng</span>
        </Dialog.Close>
      )}
    </Dialog.Content>
  );
}

export const FormDialog = {
  Content: FormDialogContent,
};
