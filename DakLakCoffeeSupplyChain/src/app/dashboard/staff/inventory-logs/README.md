# 📋 Nhật ký tồn kho - Staff

## Mô tả
Trang "Nhật ký tồn kho" dành cho nhân viên kho (Staff) để theo dõi mọi thay đổi trong hệ thống tồn kho.

## Tính năng

### 🔍 **Xem danh sách**
- Hiển thị tất cả log thay đổi tồn kho
- Phân trang (10 log/trang)
- Tìm kiếm theo mã kho, loại cà phê, tên kho
- Lọc theo loại thao tác (Nhập kho, Xuất kho, Tất cả)

### 📊 **Thống kê tổng quan**
- **Tổng số log**: Tổng số bản ghi thay đổi
- **Nhập kho hôm nay**: Số log nhập kho trong ngày
- **Lượt nhập kho**: Tổng số lần nhập kho
- **Lượt xuất kho**: Tổng số lần xuất kho

### 📝 **Thông tin chi tiết mỗi log**
- **Loại thao tác**: Nhập kho (📥) hoặc Xuất kho (📤)
- **Thời gian**: Khi nào thay đổi xảy ra
- **Mã tồn kho**: Mã định danh kho hàng
- **Kho hàng**: Tên kho thực hiện thao tác
- **Số lượng thay đổi**: +X kg (nhập) hoặc -X kg (xuất)
- **Loại cà phê**: Tên sản phẩm
- **Người cập nhật**: Ai thực hiện thay đổi
- **Ghi chú**: Thông tin bổ sung (nếu có)

## Quyền hạn
- ✅ **Xem**: Tất cả log tồn kho
- ✅ **Tìm kiếm**: Theo nhiều tiêu chí
- ✅ **Lọc**: Theo loại thao tác
- ❌ **Sửa**: Không có quyền
- ❌ **Xóa**: Không có quyền (chỉ Manager mới có)

## Đường dẫn
- **Danh sách**: `/dashboard/staff/inventory-logs`
- **Chi tiết**: `/dashboard/staff/inventory-logs/[id]`

## Liên kết
- **Từ trang tồn kho**: Có link "Xem nhật ký tồn kho"
- **Từ sidebar**: Menu "Quản lý kho" > "Nhật ký tồn kho"

## Giao diện
- **Màu sắc**: Gradient xanh lá (green-50 → emerald-50)
- **Responsive**: Hỗ trợ mobile và desktop
- **Icons**: Sử dụng Lucide React icons
- **Cards**: Thiết kế card hiện đại với shadow và hover effects

## API sử dụng
- `getAllInventoryLogs()`: Lấy danh sách tất cả log
- `getInventoryLogById(id)`: Lấy chi tiết một log cụ thể

## So sánh với Manager
| Tính năng | Staff | Manager |
|-----------|-------|---------|
| Xem log | ✅ | ✅ |
| Tìm kiếm | ✅ | ✅ |
| Lọc | ✅ | ✅ |
| Xóa log | ❌ | ✅ |
| Sửa log | ❌ | ✅ |
| Thống kê | ✅ | ✅ |
| Giao diện | Xanh lá | Xanh dương |
