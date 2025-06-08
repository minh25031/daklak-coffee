Dưới đây là bản README đề xuất cho **Frontend Repository** của hệ thống **DakLakCoffeeSupplyChain\_FE**, nhất quán với phần backend mà bạn đã trình bày:

---

# ☕ DakLakCoffeeSupplyChain\_FE

**Frontend Dashboard for Dak Lak Coffee Supply Chain Management**
📅 **Duration:** May 2025 – August 2025
🎓 **Capstone Project** – FPT University | Software Engineering

---

## 🧑‍💻 Team Members

* Lê Hoàng Phúc – SE173083 *(Frontend Lead)*
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
| **Trader**           | Explore products, place B2B orders                 |
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
src/
├── app/
│   ├── dashboard/
│   │   ├── farmer/
│   │   ├── manager/
│   │   ├── expert/
│   │   ├── admin/
│   ├── auth/         # login, register
│   └── layout.tsx
├── lib/
│   ├── api/          # mock API calls
│   └── components/   # UI wrappers (input, card, button...)
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

Bạn có muốn mình tạo file `README.md` hoàn chỉnh để bạn dán vào repo luôn không?
