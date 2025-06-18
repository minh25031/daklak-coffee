"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRootPage() {
  const [redirecting, setRedirecting] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const roleSlug = localStorage.getItem("user_role");
    if (roleSlug) {
      router.push(`/dashboard/${roleSlug}`);
    } else {
      router.push("/not-found");
    }

    setRedirecting(false);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center text-gray-500">
      {redirecting ? "Đang chuyển hướng đến trang dashboard..." : null}
    </div>
  );
}
