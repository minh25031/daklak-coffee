"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { roleMap } from "@/lib/constrant/role";

export default function DashboardRootPage() {
  const [redirecting, setRedirecting] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const roleId = Number(localStorage.getItem("user_role_id"));
    const role = roleMap[roleId];

    if (role) {
      router.push(`/dashboard/${role}`);
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
