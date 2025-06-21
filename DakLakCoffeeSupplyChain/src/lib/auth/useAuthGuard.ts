"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard(allowedRoles: string[] = []) {
  // const router = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const role = localStorage.getItem("user_role");

  //   if (!token) {
  //     router.push("/auth/login");
  //     return;
  //   }

  //   if (allowedRoles.length > 0 && !allowedRoles.includes(role ?? "")) {
  //     router.push("/unauthorized");
  //   }
  // }, []);
}
