import React from "react";

const ManagerProcessingBatchEvaluationsPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 p-6">
        <div className="border-b border-orange-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý Đánh giá Lô Chế Biến</h1>
          <p className="text-gray-600">Theo dõi và quản lý chất lượng các lô chế biến cà phê</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-8 border border-orange-200 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Trang quản lý đánh giá lô chế biến</h2>
          <p className="text-gray-600">Chức năng đánh giá chất lượng các lô chế biến cà phê</p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="bg-white/90 rounded-lg p-4 border border-orange-200">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-gray-700">Thống kê đánh giá</p>
            </div>
            <div className="bg-white/90 rounded-lg p-4 border border-orange-200">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm font-medium text-gray-700">Chất lượng lô</p>
            </div>
            <div className="bg-white/90 rounded-lg p-4 border border-orange-200">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-sm font-medium text-gray-700">Báo cáo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ManagerProcessingBatchEvaluationsPage; 