Dưới đây là bản README đề xuất cho **Frontend Repository** của hệ thống **DakLakCoffeeSupplyChain\_FE**, nhất quán với phần backend mà bạn đã trình bày:

---

# ☕ DakLakCoffeeSupplyChain\_FE

**Frontend Dashboard for Dak Lak Coffee Supply Chain Management**
📅 **Duration:** May 2025 – August 2025
🎓 **Capstone Project** – FPT University | Software Engineering

---

## 🧑‍💻 Team Members

* Lê Hoàng Phúc – SE173083 *(Project Lead)*
* Nguyễn Nhật Minh – SE161013
* Lê Hoàng Thiên Vũ – SE160593
* Phạm Huỳnh Xuân Đăng – SE161782
* Phạm Trường Nam – SE150442

---

## ⚙️ Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Framework  | **Next.js 14 (App Router)**       |
| Styling    | **Tailwind CSS**, shadcn/ui       |
| Auth       | JWT (localStorage), NextAuth      |
| Routing    | Role-based, App Router dynamic    |
| State Mgmt | React Hooks, Context API          |
| API Access | RESTful (via Axios/Fetch)         |
| Mock Data  | JSON Server, Faker.js (local dev) |

---

## 🎭 User Roles Supported

| Role                 | Dashboard Views & Features                         |
| -------------------- | -------------------------------------------------- |
| **Farmer**           | Register crop plans, track progress, send harvest  |
| **Business Manager** | Plan procurement, manage inventory, confirm orders |
| **Expert**           | View anomalies, give feedback to farmers           |
| **Admin**            | View system statistics, manage accounts & data     |
| **Delivery Staff**   | Update delivery statuses                           |

---

## 🧩 Main Functional Modules

1. **Authentication & Role Routing**
   → Login/Register with role-based redirects and access control.

2. **Dashboard Views per Role**
   → Pages like `/dashboard/farmer/crop-seasons`, `/dashboard/manager/inventory`.

3. **Data Visualization & Interaction**
   → Using charts, tables, and filters per feature (e.g., progress logs, product ratings).

4. **Mock API Integration**
   → During development, mock endpoints are defined via `/lib/api/*.ts`.

5. **Dynamic Sidebar and Layouts**
   → Auto-adjusted based on user role.

> 📁 *Page structure inside `src/app/dashboard/{role}/{feature}/page.tsx`*

---

## 📦 Project Structure

```bash
📦 daklak-supplychain

src/
├── app/                            # App Router của Next.js (routing chính)
│
│   ├── auth/                       # Trang xác thực (login, register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│
│   ├── profile/                    # Hồ sơ người dùng (xem & sửa)
│   │   ├── layout.tsx
│   │   └── page.tsx
│
│   ├── dashboard/                  # Dashboard chính chia theo role
│   │
│   │   ├── admin/                  # 🧑‍💻 Admin hệ thống
│   │   │   └── page.tsx            # Trang thống kê tổng quan (biểu đồ)
│
│   │   ├── manager/                # 🧑‍💼 Business Manager
│   │   │   ├── page.tsx
│   │   │
│   │   │   ├── procurement-plans/      # 📋 Kế hoạch thu mua
│   │   │   │   ├── page.tsx            # Danh sách
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [id]/               # Chi tiết / Sửa
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │
│   │   │   ├── cultivation-registrations/  # 🧾 Đăng ký trồng
│   │   │   ├── farming-commitments/        # 🤝 Cam kết trồng
│   │   │   ├── processing-methods/         # ⚙️ Phương pháp sơ chế
│   │   │   ├── expert-feedbacks/           # 🧠 Phản hồi từ chuyên gia
│   │   │   ├── contracts/                  # 📄 Hợp đồng thu mua
│   │   │   ├── orders/                     # 📦 Đơn hàng
│   │   │   ├── shipments/                  # 🚚 Giao hàng
│   │   │   ├── warehouses/                 # 🏢 Kho lưu trữ
│   │   │   └── inventories/                # 📊 Tồn kho

│   │   │   # Mỗi module CRUD gồm: page.tsx, create/page.tsx, [id]/page.tsx, [id]/edit/page.tsx

│   │   ├── farmer/                  # 👨‍🌾 Nông dân
│   │   │   ├── page.tsx             # Dashboard tổng quan
│   │   │
│   │   │   ├── crop-seasons/        # 🌾 Mùa vụ
│   │   │   ├── batches/             # ⚒️ Mẻ sơ chế
│   │   │   ├── waste/               # ♻️ Phế phẩm
│   │   │   └── request-feedback/    # 📬 Gửi phản hồi cho chuyên gia

│   │   │   # Mỗi module CRUD gồm: page.tsx, create/page.tsx, [id]/page.tsx, [id]/edit/page.tsx

│   │   ├── expert/                  # 🧠 Chuyên gia nông nghiệp
│   │   │   ├── page.tsx
│   │   │   ├── evaluations/         # 📋 Đánh giá mùa vụ, mẻ
│   │   │   ├── qna/                 # ❓ Q&A với nông dân
│   │   │   └── anomalies/           # 🚨 Cảnh báo mùa vụ

│   │   ├── staff/                   # 👷 Nhân viên kho
│   │   │   ├── inbounds/            # Danh sách yêu cầu nhập kho
│   │   │   ├── receipts/            # Tạo phiếu nhập/xuất kho
│   │   │   └── inventories/         # Danh sách tồn kho thực tế

│   │   ├── delivery/                # 🚚 Nhân viên giao hàng
│   │   │   └── shipments/           # Cập nhật trạng thái giao hàng

│   ├── marketplace/                 # 🏬 Marketplace công khai
│   │   ├── page.tsx                 # Danh sách sản phẩm
│   │   └── [id]/page.tsx            # Chi tiết sản phẩm
│
├── components/                     # Các thành phần giao diện
│   ├── ui/                         # Component shadcn/ui (button, input, ...)
│   ├── layout/                     # Header, Footer, SidebarDashboard
│   └── shared/                     # Alert, badge, loading,...
│
├── lib/                            # Thư viện logic phụ trợ
│   ├── api/                        # Gọi API (REST hoặc mock)
│   ├── constant/                   # Hằng số toàn cục
│   └── utils.ts                    # Hàm tiện ích: formatDate, slugify, removeDiacritics,...
│
├── public/                         # Ảnh, favicon, logo dùng public
│   ├── logo.jpg
│   └── banner.jpg
│
├── styles/
│   └── globals.css                 # Custom CSS (ngoài Tailwind)
│
├── .env.local                      # Biến môi trường chạy dev (API_URL,...)
├── .gitignore                      # Đã bao gồm `.env*` để tránh đẩy file nhạy cảm
├── tailwind.config.js             # Cấu hình TailwindCSS
├── tsconfig.json                  # Cấu hình TypeScript
├── next.config.js                 # Config Next.js
├── package.json                   # Danh sách dependencies
└── README.md                      # Hướng dẫn setup và phát triển

```

---

## 🔐 Authentication Flow

* Login/Register: `src/app/auth/login.tsx`, `register.tsx`
* After login, user is redirected to role-specific dashboard
* Auth info (token, role) is stored in `localStorage` (or `sessionStorage`)

---

## 🛠 Development Guide

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Connect to backend via .env or mock API (json-server)
```

> 🔧 Environment variables (.env.local) include:
> `NEXT_PUBLIC_API_URL=http://localhost:8080`

---

## 📄 Resources

* 📘 Backend Repo: [`/DakLakCoffeeSupplyChain_BE`](https://github.com/your-org/DakLakCoffeeSupplyChain_BE)
* 📘 Diagrams (ERD, Activity Flows): `/docs/diagrams/`
* 📘 Mock API Project (Optional): `/mock-api/` – using json-server

---

## 💡 Notes

* Fully responsive design (for tablet, desktop use)
* Modular components with Tailwind + shadcn/ui
* Each role's layout and route structure is separated
* Real Google Login supported via NextAuth (optional)

---


