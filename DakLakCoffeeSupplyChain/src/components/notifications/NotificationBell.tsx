"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck, Bell, AlertTriangle, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const PAGE_SIZE = 20;

const ICON_BY_TYPE: Record<string, React.ReactNode> = {
  FarmerReport: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  ExpertAdvice: <Lightbulb className="h-5 w-5 text-blue-500" />,
};

const TYPE_LABEL: Record<string, string> = {
  FarmerReport: "Báo cáo nông dân",
  ExpertAdvice: "Lời khuyên chuyên gia",
};

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,                 // <— thêm trong context nếu chưa có
    totalPages,            // <— thêm trong context nếu có
    loadNotifications,     // nhớ wrap useCallback ở NotificationContext
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [currentPage, setCurrentPage] = useState(1);
  const [optimisticRead, setOptimisticRead] = useState<Record<string, boolean>>({});

  // ✅ Tối ưu: Lazy loading cho notifications
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ✅ Tối ưu: Debounce load notifications để tránh gọi API quá nhiều
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadNotifications(currentPage, PAGE_SIZE);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentPage, loadNotifications]);

  // Fallback unread tính từ client (nếu API chưa sẵn sàng)
  const calculatedUnread = useMemo(
    () =>
      notifications.reduce((acc, n) => {
        const isRead = optimisticRead[n.notificationId] ?? n.isRead;
        return acc + (isRead ? 0 : 1);
      }, 0),
    [notifications, optimisticRead]
  );
  const finalUnreadCount = unreadCount ?? calculatedUnread;

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      // Optimistic
      setOptimisticRead((m) => ({ ...m, [id]: true }));
      try {
        await markAsRead(id);
      } catch {
        // revert nếu fail
        setOptimisticRead((m) => {
          const { [id]: _, ...rest } = m;
          return rest;
        });
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    // Optimistic toàn bộ
    const ids = notifications.map((n) => n.notificationId);
    setOptimisticRead((m) => {
      const next = { ...m };
      ids.forEach((id) => (next[id] = true));
      return next;
    });
    try {
      await markAllAsRead();
    } catch {
      // không revert — không quan trọng, vòng sync sau sẽ sửa
    }
  }, [markAllAsRead, notifications]);

  // ✅ Tối ưu: Lazy load notifications khi scroll
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || typeof totalPages === "number" && currentPage >= totalPages) return;

    setIsLoadingMore(true);
    try {
      await loadNotifications(currentPage + 1, PAGE_SIZE);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error("Lỗi load more notifications:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, currentPage, totalPages, loadNotifications]);

  const getNotificationIcon = (type: string) => ICON_BY_TYPE[type] ?? <Bell className="h-5 w-5 text-gray-500" />;
  const getNotificationTypeLabel = (type: string) => TYPE_LABEL[type] ?? "Thông báo hệ thống";

  const formatDate = (iso: string) => {
    try {
      return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: vi });
    } catch {
      return "Vừa xong";
    }
  };
  const formatFullDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("vi-VN", {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
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
            <p className="text-gray-600 mt-1">Quản lý tất cả thông báo của bạn</p>
            {!!error && <p className="text-sm text-red-600 mt-2">{String(error)}</p>}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo nào</h3>
          <p className="text-gray-600">Bạn sẽ nhận được thông báo khi có sự kiện mới.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => {
            const isRead = optimisticRead[n.notificationId] ?? n.isRead;
            return (
              <article
                key={n.notificationId}
                className={`bg-white border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${!isRead ? "border-orange-200 bg-orange-50" : "border-gray-200"
                  }`}
                aria-live="polite"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(n.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                          <Badge variant={isRead ? "secondary" : "default"} className="text-xs">
                            {getNotificationTypeLabel(n.type)}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{n.message}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Mã: {n.notificationCode}</span>
                          <time dateTime={n.createdAt} title={formatFullDate(n.createdAt)}>
                            {formatFullDate(n.createdAt)}
                          </time>
                        </div>

                        <div className="mt-2 text-xs text-gray-400">{formatDate(n.createdAt)}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isRead ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(n.notificationId)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                            aria-label="Đánh dấu đã đọc"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Đánh dấu đã đọc
                          </Button>
                        ) : (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Đã đọc
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ✅ Tối ưu: Load More button thay vì pagination */}
      {notifications.length > 0 && (
        <div className="mt-8 flex items-center justify-center">
          {typeof totalPages === "number" && currentPage < totalPages ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600" />
                  Đang tải...
                </>
              ) : (
                <>
                  Tải thêm thông báo
                  <span className="text-xs text-gray-500">
                    ({currentPage}/{totalPages})
                  </span>
                </>
              )}
            </Button>
          ) : (
            <span className="text-sm text-gray-500">Đã hiển thị tất cả thông báo</span>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
