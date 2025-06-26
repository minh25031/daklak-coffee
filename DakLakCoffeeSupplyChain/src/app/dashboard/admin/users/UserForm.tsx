"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserById, createUser, updateUser, UserProfileDetails, Gender, UserAccountStatus } from "@/lib/api/users";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserFormProps {
  mode: "create" | "edit";
  userId?: string;
}

const emptyUser: Partial<UserProfileDetails> = {
  userCode: "",
  name: "",
  email: "",
  phoneNumber: "",
  gender: Gender.Unknown,
  dateOfBirth: undefined,
  address: "",
  roleName: "Nông dân",
  status: UserAccountStatus.Active,
};

export default function UserForm({ mode, userId }: UserFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, any>>(emptyUser);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState("");

  // Fetch user data if edit mode
  useEffect(() => {
    if (mode === "edit" && userId) {
      setLoading(true);
      getUserById(userId)
        .then((user) => {
          setForm({
            ...user,
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : ""
          });
        })
        .catch((err) => setError(err.message || "Không lấy được thông tin người dùng"))
        .finally(() => setLoading(false));
    }
  }, [mode, userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userCode || !form.email || !form.name) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    setError("");
    try {
      if (mode === "create") {
        await createUser(form);
      } else if (mode === "edit" && userId) {
        await updateUser(userId, form);
      }
      router.back();
    } catch (err: any) {
      setError(err.message || "Lưu người dùng thất bại");
    }
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
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">
                    Mã người dùng <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="userCode"
                    value={form.userCode || ""}
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
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                    type="email"
                  />
                </div>
                <div>
                  <label className="block mb-1">Số điện thoại</label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber || ""}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Giới tính</label>
                  <select
                    name="gender"
                    value={form.gender || Gender.Unknown}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value={Gender.Male}>Nam</option>
                    <option value={Gender.Female}>Nữ</option>
                    <option value={Gender.Unknown}>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Ngày sinh</label>
                  <input
                    name="dateOfBirth"
                    value={typeof form.dateOfBirth === "string" ? form.dateOfBirth : (form.dateOfBirth ? form.dateOfBirth.toISOString().slice(0, 10) : "")}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                    type="date"
                  />
                </div>
                <div>
                  <label className="block mb-1">Địa chỉ</label>
                  <input
                    name="address"
                    value={form.address || ""}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Vai trò</label>
                  <input
                    name="roleName"
                    value={form.roleName || ""}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Trạng thái</label>
                  <select
                    name="status"
                    value={form.status || UserAccountStatus.Active}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value={UserAccountStatus.Active}>Hoạt động</option>
                    <option value={UserAccountStatus.Inactive}>Ngừng</option>
                    <option value={UserAccountStatus.Suspended}>Tạm khóa</option>
                    <option value={UserAccountStatus.Unknown}>Không xác định</option>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
