"use client";

import UserForm from "@/app/dashboard/admin/users/UserForm";
import { useParams } from "next/navigation";

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string;
  return <UserForm mode="edit" userId={userId} />;
} 