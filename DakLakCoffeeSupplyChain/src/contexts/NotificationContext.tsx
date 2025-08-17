"use client";

import React, {
  createContext, useContext, useState, useEffect, ReactNode,
  useCallback, useMemo, useRef
} from "react";
import axios from "axios";
import notificationService, {
  Notification,
  NotificationResponse,
} from "@/lib/api/notifications";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error?: unknown;

  page: number;
  pageSize: number;
  totalPages?: number;
  totalCount?: number;

  loadNotifications: (page?: number, pageSize?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(undefined);

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  // Guards
  const didInit = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0); // chỉ cho phép request mới nhất cập nhật state

  // ✅ Tối ưu: Cache notifications để tránh gọi API lại
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 2 * 60 * 1000; // 2 phút cache

  const loadNotifications = useCallback(async (p: number = page, ps: number = pageSize) => {
    const myId = ++reqIdRef.current;

    // ✅ Tối ưu: Kiểm tra cache trước khi gọi API
    const now = Date.now();
    if (now - lastFetchTime < CACHE_DURATION && notifications.length > 0 && p === page) {
      console.log("📨 Using cached notifications");
      return;
    }

    setLoading(true);
    setError(undefined);

    // Huỷ request trước đó (nếu có)
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      console.log("🔍 Loading notifications...");
      const res: NotificationResponse = await notificationService.getUserNotifications(p, ps, ac.signal);
      console.log("📨 Notifications response:", res);

      if (reqIdRef.current === myId) {
        setNotifications(res.data ?? []);
        setPage(res.page ?? p);
        setPageSize(res.pageSize ?? ps);
        setTotalPages(res.totalPages);
        setTotalCount(res.totalCount);

        // ✅ Tối ưu: Cập nhật thời gian cache
        setLastFetchTime(now);
      }
    } catch (err: any) {
      // Bỏ qua lỗi do cancel (HMR/đổi trang)
      if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        return;
      }
      console.error("❌ Error loading notifications:", err);
      setError(err);
    } finally {
      if (reqIdRef.current === myId) setLoading(false);
    }
  }, [page, pageSize, lastFetchTime, notifications.length, CACHE_DURATION]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(err);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    const myId = ++reqIdRef.current;

    // ✅ Tối ưu: Debounce refresh để tránh gọi API quá nhiều
    const now = Date.now();
    if (now - lastFetchTime < 30000) { // 30 giây debounce
      console.log("🔢 Skipping refresh (debounced)");
      return;
    }

    try {
      console.log("🔢 Refreshing unread count...");
      const count = await notificationService.getUnreadCount();
      if (reqIdRef.current === myId) {
        console.log("🔢 Unread count response:", count);
        setUnreadCount(typeof count === "number" ? count : 0);
      }
    } catch (err: any) {
      if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        return;
      }
      console.error("❌ Error refreshing unread count:", err);
      setError(err);
    }
  }, [lastFetchTime]);

  // Init 1 lần (dev StrictMode không bị double-run nhờ didInit)
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    console.log("🚀 NotificationContext mounted, loading initial data...");
    loadNotifications(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
    refreshUnreadCount();

    return () => {
      abortRef.current?.abort();
    };
  }, [loadNotifications, refreshUnreadCount]);

  // Optional: refresh unread khi tab visible lại
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "visible") refreshUnreadCount(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshUnreadCount]);

  const value = useMemo<NotificationContextType>(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    page,
    pageSize,
    totalPages,
    totalCount,

    loadNotifications,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  }), [
    notifications, unreadCount, loading, error,
    page, pageSize, totalPages, totalCount,
    loadNotifications, markAsRead, markAllAsRead, refreshUnreadCount
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
