"use client";

import { useEffect, useState } from "react";
import { roleRawToDisplayName } from "@/lib/constants/role";

export default function UserInfoPage() {
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        avatar: "",
    });

    useEffect(() => {
        const rawAvatar = localStorage.getItem("user_avatar")?.trim();
        const name = localStorage.getItem("user_name") || "Ẩn danh";

        setUserInfo({
            name,
            email: localStorage.getItem("email") || "",
            phone: localStorage.getItem("phone") || "Chưa cập nhật",
            role:
                roleRawToDisplayName[localStorage.getItem("user_role_raw") ?? ""] ||
                "Không xác định",
            avatar:
                rawAvatar && rawAvatar !== ""
                    ? rawAvatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FD7622&color=fff`,
        });
    }, []);


    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-orange-700 mb-6">
                Thông tin cá nhân
            </h1>

            <div className="bg-white rounded-lg shadow p-6 flex gap-6 items-start">
                {userInfo.avatar && (
                    <img
                        src={userInfo.avatar}
                        alt="avatar"
                        className="w-32 h-32 rounded-full object-cover border border-gray-300"
                    />
                )}
                <div className="flex-1 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Họ tên</p>
                        <p className="text-lg font-medium text-gray-800">{userInfo.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-base text-gray-700">{userInfo.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="text-base text-gray-700">{userInfo.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Vai trò</p>
                        <p className="text-base text-gray-700">{userInfo.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
