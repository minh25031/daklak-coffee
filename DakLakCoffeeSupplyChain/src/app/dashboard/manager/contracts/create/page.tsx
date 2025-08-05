"use client";
import { useRouter } from "next/navigation";
import ContractForm from "@/components/contracts/ContractForm";

export default function CreateContractPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <ContractForm onSuccess={() => {
        router.push("/dashboard/manager/contracts");
      }} />
    </div>
  );
}
