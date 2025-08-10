## ☕ Tính năng: [Role] – [Tên chức năng ngắn gọn]

### 📌 Mục tiêu
[Mô tả ngắn gọn bạn đang làm gì, thuộc vai trò nào, ở luồng nào?]

---

### ✅ Thay đổi chính
- [Thêm trang UI, chỉnh component, cập nhật routing...]
- [Viết lại layout, responsive, mapping props...]
- [Thêm modal confirm, popup, validate form...]

---

### 📁 File ảnh hưởng
- `[đường dẫn/page.tsx]`
- `[component mới]`
- `[file hook/constants/styling]`

---

### 🧪 Cách kiểm tra
1. Truy cập: `/dashboard/admin/users` (hoặc trang liên quan)
2. Thử nghiệm các chức năng:
   - Tạo mới / Xem chi tiết / Sửa / Xoá
   - Tìm kiếm / Lọc theo role / Phân trang...

---

### 🧪 Test Case
- [x] ✅ Form tạo thành công khi điền đúng
- [x] ❌ Báo lỗi khi thiếu dữ liệu
- [x] ✅ Modal xoá hiển thị và hoạt động đúng

---

### 🔍 Ghi chú
- Dùng component từ `@/components/ui`
- Dữ liệu đang mock, sẽ thay bằng gọi API sau
- Đã có responsive cơ bản

---

### 🔗 Liên quan
- Module: `[User / Admin / Dashboard...]`
- Role: `[Admin / Expert...]`

---

### ☑️ Checklist (trước khi tạo PR)
- [ ] Đã test đầy đủ các case
- [ ] Đã kiểm tra lỗi console / warning
- [ ] Đã dùng ngôn ngữ rõ ràng trong commit & description
