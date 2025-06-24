"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockUserData, UserProfile } from "@/lib/api/users";
import { roleIdToNameMap } from "@/lib/constrant/role";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserFormProps {
  mode: "create" | "edit";
  userId?: string;
}

const emptyUser: Partial<UserProfile> = {
  Username: "",
  Email: "",
  PhoneNumber: "",
  Name: "",
  Gender: "Nam",
  DateOfBirth: "",
  Address: "",
  RoleID: 1,
  Status: "active",
};

export default function UserForm({ mode, userId }: UserFormProps) {
  const router = useRouter();
  const user =
    mode === "edit" ? mockUserData.find((u) => u.user_id === userId) : null;
  const [form, setForm] = useState<Partial<UserProfile>>(
    user ? { ...user } : emptyUser
  );
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!form.Username || !form.Email || !form.Name) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    // TODO: Submit API
    alert("Đã lưu (mock)");
    router.back();
  };

  return (
    <div className="w-full min-h-screen bg-orange-50 p-6 flex justify-center items-start">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Thêm người dùng" : "Chỉnh sửa người dùng"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  name="Username"
                  value={form.Username || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="Email"
                  value={form.Email || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                  type="email"
                />
              </div>
              <div>
                <label className="block mb-1">Số điện thoại</label>
                <input
                  name="PhoneNumber"
                  value={form.PhoneNumber || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="Name"
                  value={form.Name || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Giới tính</label>
                <select
                  name="Gender"
                  value={form.Gender || "Nam"}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Ngày sinh</label>
                <input
                  name="DateOfBirth"
                  value={form.DateOfBirth || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  type="date"
                />
              </div>
              <div>
                <label className="block mb-1">Địa chỉ</label>
                <input
                  name="Address"
                  value={form.Address || ""}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Vai trò</label>
                <select
                  name="RoleID"
                  value={form.RoleID || 1}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                >
                  {Object.entries(roleIdToNameMap).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Trạng thái</label>
                <select
                  name="Status"
                  value={form.Status || "active"}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng</option>
                </select>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Quay lại
              </Button>
              <Button type="submit">Lưu</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
