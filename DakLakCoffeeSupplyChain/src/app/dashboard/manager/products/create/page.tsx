"use client";

import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import ProductForm from "@/components/products/ProductForm";

export default function CreateProductPage() {
  useAuthGuard(["manager"]);
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/manager/products");
  };

  return (
    <div className="w-full min-h-screen bg-amber-50 px-4 py-6 lg:px-20">
      <div className="w-full max-w-6xl mx-auto">
        <ProductForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

