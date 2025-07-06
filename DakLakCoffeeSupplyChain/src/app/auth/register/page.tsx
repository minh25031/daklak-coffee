"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { resendVerificationEmail, signUp } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/utils";

export default function RegisterPage() {
  const [showResendBox, setShowResendBox] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    roleId: 4, // 4 = Farmer, 2 = Business
    companyName: "",
    taxId: "",
    businessLicenseURl: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!formData.name) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!formData.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (formData.roleId === 2) {
      if (!formData.companyName) {
        newErrors.companyName = "Vui lòng nhập tên công ty";
      }
      if (!formData.taxId) {
        newErrors.taxId = "Vui lòng nhập mã số thuế";
      } else if (!/^\d{10,14}$/.test(formData.taxId)) {
        newErrors.taxId = "Mã số thuế phải từ 10 đến 14 chữ số";
      }
      if (!formData.businessLicenseURl) {
        newErrors.businessLicenseURl =
          "Vui lòng nhập đường dẫn giấy phép kinh doanh";
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Bạn phải đồng ý với các điều khoản của nền tảng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      roleId: formData.roleId,
      phone: formData.phone,
      companyName: formData.roleId === 2 ? formData.companyName : "",
      taxId: formData.roleId === 2 ? formData.taxId : "",
      businessLicenseURl:
        formData.roleId === 2 ? formData.businessLicenseURl : "",
    };
    
    try {
      await signUp(payload);
      setTimeout(() => setShowResendBox(true), 10000);
      alert("Bạn hãy kiểm tra email đã được đăng ký để xác thực.");
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "roleId" ? parseInt(value) : value,
    }));
  };

  return (
    <div className='relative flex h-screen w-full bg-muted'>
      <Link
        href='/'
        className='hidden md:flex basis-2/3 bg-cover bg-center'
        style={{ backgroundImage: "url('/logo.jpg')", borderRadius: 20 }}
      >
        <span className='sr-only'>Về trang chủ</span>
      </Link>

      <div className='basis-full md:basis-1/3 flex items-center justify-center px-6 bg-white'>
        <Card className='w-full max-w-md shadow-lg relative overflow-visible'>
          <Link
            href='/'
            className='absolute -top-5 -right-5 bg-white border border-gray-300 shadow-lg rounded-full p-3 hover:bg-amber-100 transition z-20'
          >
            <Home className='w-6 h-6 text-amber-900' />
          </Link>

          <CardHeader>
            <CardTitle className='text-2xl text-center'>
              Đăng ký tài khoản
            </CardTitle>
            <p className='text-sm text-muted-foreground text-center mt-1'>
              Tham gia nền tảng chuỗi cung ứng cà phê Đắk Lắk
            </p>
          </CardHeader>

          <CardContent>
            <form className='space-y-4' onSubmit={handleSubmit}>
              <div className='space-y-2'>
                <Label htmlFor='roleId'>Vai trò</Label>
                <select
                  name='roleId'
                  id='roleId'
                  value={formData.roleId}
                  onChange={handleChange}
                  className='w-full border rounded-md px-3 py-2 text-sm cursor-pointer'
                >
                  <option value={1}>Nông dân</option>
                  <option value={2}>Doanh nghiệp</option>
                </select>
              </div>

              <InputField
                label='Email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <InputField
                label='Mật khẩu'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <InputField
                label='Xác nhận mật khẩu'
                name='confirmPassword'
                type='password'
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
              <InputField
                label='Tên người đại diện'
                name='name'
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />
              <InputField
                label='Số điện thoại'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />

              {formData.roleId === 2 && (
                <>
                  <InputField
                    label='Tên công ty'
                    name='companyName'
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                  />
                  <InputField
                    label='Mã số thuế'
                    name='taxId'
                    value={formData.taxId}
                    onChange={handleChange}
                    error={errors.taxId}
                  />
                  <InputField
                    label='Link giấy phép kinh doanh'
                    name='businessLicenseURl'
                    value={formData.businessLicenseURl}
                    onChange={handleChange}
                    error={errors.businessLicenseURl}
                  />
                </>
              )}
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='acceptTerms'
                  name='acceptTerms'
                  checked={formData.acceptTerms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      acceptTerms: e.target.checked,
                    }))
                  }
                  className='cursor-pointer'
                />
                <Label htmlFor='acceptTerms' className='text-sm'>
                  Tôi đồng ý với các{" "}
                  <Link
                    href='/terms-of-service'
                    target='_blank'
                    className='text-blue-600 underline cursor-pointer'
                  >
                    điều khoản của nền tảng
                  </Link>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.acceptTerms}
                </p>
              )}
              {showResendBox && (
                <div className='mt-4 p-3 rounded bg-green-100 text-green-800 text-sm text-center'>
                  Không nhận được email?{" "}
                  <button
                    type='button'
                    onClick={async () => {
                      const email = localStorage.getItem("pending_email");
                      if (email) {
                        await resendVerificationEmail(email);
                      } else {
                        alert("Không tìm thấy email đã đăng ký.");
                      }
                    }}
                    className='text-green-700 font-semibold underline hover:text-green-900 ml-1 cursor-pointer'
                  >
                    Gửi lại xác thực email
                  </button>
                </div>
              )}

              <Button
                type='submit'
                className='w-full bg-amber-900 hover:bg-amber-800 cursor-pointer'
              >
                Đăng ký
              </Button>

              <div className='text-sm text-center'>
                <span className='text-gray-600'>Đã có tài khoản? </span>
                <Link
                  href='/auth/login'
                  className='text-amber-900 font-semibold hover:underline cursor-pointer'
                >
                  Đăng nhập
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
};
function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
}: InputFieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='text-sm'>
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className='text-sm'
      />
      {error && <p className='text-red-500 text-xs'>{error}</p>}
    </div>
  );
}
