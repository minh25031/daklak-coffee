export default function UnauthorizedPage() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="p-6 bg-white rounded-lg shadow-lg text-center">
                <h1 className="text-red-600 text-2xl font-bold mb-4">Bạn không có quyền truy cập trang này</h1>
                <p className="text-gray-600">Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
            </div>
        </div>
    );
}
