"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { getProductById, ProductViewDetailsDto } from "@/lib/api/products";
import ProductForm from "@/components/products/ProductForm";

export default function EditProductPage() {
  useAuthGuard(["manager"]);
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductViewDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getProductById(id as string);
        setProduct(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSuccess = () => {
    router.push(`/dashboard/manager/products/${id}`);
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (!product) return <div className="p-6 text-red-500">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="w-full min-h-screen bg-amber-50 px-4 py-6 lg:px-20">
      <div className="w-full max-w-6xl mx-auto">
        <ProductForm initialData={product} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
