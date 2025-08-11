"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBoxProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchBox({ 
  placeholder = "Tìm kiếm...", 
  value, 
  onChange, 
  className = "" 
}: SearchBoxProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
      />
    </div>
  );
}
