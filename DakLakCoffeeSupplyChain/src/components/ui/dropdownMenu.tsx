import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";

interface BasicDropdownProps {
  triggerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode; // menu items
}

const BasicDropdown: React.FC<BasicDropdownProps> = ({
  triggerClassName = "flex items-center gap-2 hover:text-orange-700 transition px-3 py-2 rounded-md bg-white shadow-sm text-sm text-gray-700 hover:bg-[#ccc]",
  contentClassName = "min-w-[100px] bg-white rounded-md shadow-lg p-1 border text-sm z-[100]",
  children,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={triggerClassName}>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={contentClassName}>
          {children || <DropdownMenu.Item disabled>Chưa có mục</DropdownMenu.Item>}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default BasicDropdown;
