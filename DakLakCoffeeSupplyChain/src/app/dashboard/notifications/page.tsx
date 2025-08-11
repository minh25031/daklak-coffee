"use client";

import React, { useState, useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck, Bell, AlertTriangle, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, loading, loadNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Fallback calculation for unreadCount if API doesn't work
  const calculatedUnreadCount = notifications.filter(n => {
    // Handle cases where isRead might be undefined, null, or not boolean
    if (n.isRead === undefined || n.isRead === null) {
      return true; // Treat as unread if status is unknown
    }
    return n.isRead === false; // Only count as unread if explicitly false
  }).length;
  
  const finalUnreadCount = unreadCount > 0 ? unreadCount : calculatedUnreadCount;

  useEffect(() => {
    loadNotifications(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "FarmerReport":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "ExpertAdvice":
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "FarmerReport":
        return "Báo cáo nông dân";
      case "ExpertAdvice":
        return "Lời khuyên chuyên gia";
      default:
        return "Thông báo hệ thống";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch {
      return "Vừa xong";
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Không xác định";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            <p className="text-gray-600 mt-1">
              Quản lý tất cả thông báo của bạn
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {finalUnreadCount} chưa đọc
            </Badge>
            {finalUnreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có thông báo nào
          </h3>
          <p className="text-gray-600">
            Bạn sẽ nhận được thông báo khi có sự kiện mới.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.notificationId}
              className={`bg-white border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                !notification.isRead 
                  ? "border-orange-200 bg-orange-50" 
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <Badge 
                          variant={notification.isRead ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Mã: {notification.notificationCode}</span>
                        <span>{formatFullDate(notification.createdAt)}</span>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.notificationId)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Đánh dấu đã đọc
                        </Button>
                      )}
                      {notification.isRead && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Đã đọc
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {notifications.length > 0 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            
            <span className="px-3 py-2 text-sm text-gray-600">
              Trang {currentPage}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={notifications.length < pageSize}
            >
              Tiếp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

