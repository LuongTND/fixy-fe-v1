'use client';

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationApi } from '@/apis/notification.api';
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { App } from 'antd';

export const NotificationContext = createContext(null);

// Relative time formatter helper
function getRelativeTime(dateString) {
  if (!dateString) return '';
  
  let normalizedDate = dateString;
  if (typeof dateString === 'string' && dateString.includes('T') && !dateString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateString)) {
    normalizedDate = dateString + 'Z';
  }

  const date = new Date(normalizedDate);
  const now = new Date();
  const diffMs = now - date;
  
  if (isNaN(diffMs)) return '';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHr < 24) return `${diffHr} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Extractor helper to map API items
function getItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

// Extract properties helper
function mapNotificationToUI(notif) {
  if (!notif) return null;

  const id = notif.id;
  const unread = !notif.isRead;
  const title = notif.title || 'Thông báo mới';
  const body = notif.content || notif.body || notif.message || '';
  const time = getRelativeTime(notif.createdDate || notif.createdAt);
  
  // Categorize based on title/body or type
  const typeLower = String(notif.type || notif.category || '').toLowerCase();
  let filter = 'system';
  if (typeLower.includes('order') || typeLower.includes('booking') || /đơn hàng|lịch hẹn|thợ/i.test(title + ' ' + body)) {
    filter = 'order';
  } else if (typeLower.includes('promo') || typeLower.includes('voucher') || /khuyến mãi|voucher|giảm giá/i.test(title + ' ' + body)) {
    filter = 'promo';
  }

  // Determine icons and styling
  let icon = 'notifications';
  let iconBg = 'bg-gray-lighter';
  let iconColor = 'text-gray';
  let actions = [];
  let voucher = null;

  if (filter === 'order') {
    if (/đang di chuyển|đường đến/i.test(title + ' ' + body)) {
      icon = 'local_shipping';
      iconBg = 'bg-[#7CDFFE]/20';
      iconColor = 'text-primary';
      actions = [{ label: 'Theo dõi vị trí', variant: 'primary', type: 'track' }];
    } else if (/lịch hẹn|nhắc nhở/i.test(title + ' ' + body)) {
      icon = 'schedule';
      iconBg = 'bg-[#DEC0B1]/20';
      iconColor = 'text-[#818A91]';
    } else if (/hoàn thành|hoàn tất/i.test(title + ' ' + body)) {
      icon = 'check_circle';
      iconBg = 'bg-[#39B54A]/10';
      iconColor = 'text-[#39B54A]';
      actions = [{ label: 'Đánh giá ngay', variant: 'outline-primary', type: 'rate' }];
    } else {
      icon = 'assignment_turned_in';
      iconBg = 'bg-[#7CDFFE]/10';
      iconColor = 'text-[#818A91]';
    }
  } else if (filter === 'promo') {
    icon = 'confirmation_number';
    iconBg = 'bg-primary/10';
    iconColor = 'text-primary';
    
    // Attempt to extract voucher code
    const voucherMatch = body.match(/[A-Z0-9]{4,10}/);
    if (voucherMatch) {
      voucher = voucherMatch[0];
    }
  }

  // Attempt to extract Booking ID
  const bookingMatch = body.match(/#VT\d+/i) || title.match(/#VT\d+/i);
  const bookingId = bookingMatch ? bookingMatch[0] : null;

  return {
    id,
    filter,
    unread,
    icon,
    iconBg,
    iconColor,
    title,
    time,
    body,
    actions,
    voucher,
    bookingId,
    raw: notif,
  };
}

function isExpectedNotificationFailure(error) {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    error?.message === 'Network Error' ||
    !error?.response
  );
}

function logNotificationFailure(message, error) {
  if (process.env.NODE_ENV !== 'development') return;

  if (isExpectedNotificationFailure(error)) {
    console.warn(`[Notifications] ${message}: ${error?.message || 'Network unavailable'}`);
    return;
  }

  console.warn(`[Notifications] ${message}:`, error);
}

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { notification } = App.useApp();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const connectionRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [settings, setSettings] = useState({
    newBooking: true,
    payment: true,
    statusUpdate: true,
    promotions: true,
    viaPush: true,
    viaInApp: true,
  });

  const loadingRef = useRef(false);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return 0;
    try {
      const response = await notificationApi.getUnreadCount();
      // Handle response structures: directly a number, or nested under data
      const count = typeof response === 'number' 
        ? response 
        : typeof response?.unreadCount === 'number'
          ? response.unreadCount
          : typeof response?.data === 'number'
            ? response.data
            : typeof response?.data?.unreadCount === 'number'
              ? response.data.unreadCount
              : 0;
      
      setUnreadCount(count);
      return count;
    } catch (err) {
      logNotificationFailure('Failed to fetch unread count', err);
      return 0;
    }
  }, [isAuthenticated]);

  // Fetch notifications list
  const fetchNotifications = useCallback(async (pageNumber = 1, isAppend = false) => {
    if (!isAuthenticated || loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      
      const pageSize = 10;
      const response = await notificationApi.getNotifications({
        Page: pageNumber,
        PageSize: pageSize,
      });

      const rawItems = getItems(response);
      const mapped = rawItems.map(mapNotificationToUI).filter(Boolean);

      setNotifications((prev) => {
        const nextList = isAppend ? [...prev, ...mapped] : mapped;
        // Deduplicate in case of race conditions
        const unique = [];
        const seen = new Set();
        for (const item of nextList) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            unique.push(item);
          }
        }
        return unique;
      });

      setPage(pageNumber);
      setHasMore(rawItems.length >= pageSize);
    } catch (err) {
      logNotificationFailure('Failed to fetch notifications', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Mark single notification as read
  const markRead = useCallback(async (id) => {
    if (!isAuthenticated) return;
    try {
      await notificationApi.markAsRead(id);
      
      // Update local state
      setNotifications((prev) => 
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      logNotificationFailure(`Failed to mark notification ${id} as read`, err);
    }
  }, [isAuthenticated]);

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      await notificationApi.markAllAsRead();
      
      // Update local state
      setNotifications((prev) => 
        prev.map((n) => ({ ...n, unread: false }))
      );
      setUnreadCount(0);
    } catch (err) {
      logNotificationFailure('Failed to mark all notifications as read', err);
    }
  }, [isAuthenticated]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationApi.getSettings();
      const data = response?.data || response;
      if (data && typeof data === 'object') {
        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (err) {
      logNotificationFailure('Failed to fetch notification settings', err);
    }
  }, [isAuthenticated]);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    if (!isAuthenticated) return;
    try {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      await notificationApi.updateSettings(merged);
    } catch (err) {
      logNotificationFailure('Failed to update notification settings', err);
      // Revert settings
      fetchSettings();
    }
  }, [isAuthenticated, settings, fetchSettings]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications(1, false);
      fetchSettings();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
      setPage(1);
    }
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications, fetchSettings]);

  // SignalR Real-time Notifications connection (Strategy 1)
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') {
      return undefined;
    }

    const token = localStorage.getItem('token');
    if (!token) return undefined;

    let hubUrl = process.env.NEXT_PUBLIC_NOTIFICATION_HUB_URL || 
      (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '/hubs/notifications') : '');

    if (!hubUrl) {
      console.warn('[SignalR] Notification Hub URL is not defined.');
      return undefined;
    }

    const separator = hubUrl.includes('?') ? '&' : '?';
    hubUrl = `${hubUrl}${separator}ngrok-skip-browser-warning=true`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging({
        log(logLevel, message) {
          if (
            message.includes("Failed to start the transport") ||
            message.includes("WebSocket failed to connect")
          ) {
            return;
          }
          if (logLevel >= LogLevel.Warning) {
            console.warn(`[SignalR Notifications] ${message}`);
          }
        }
      })
      .build();

    connectionRef.current = connection;
    let isMounted = true;

    const startConnection = async () => {
      try {
        await connection.start();
        if (!isMounted) {
          await connection.stop();
          return;
        }
        console.log('SignalR Connected to NotificationHub!');

        connection.on('ReceiveNotification', (rawNotif) => {
          console.log('Realtime notification received:', rawNotif);
          const mapped = mapNotificationToUI(rawNotif);
          if (mapped) {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === mapped.id)) return prev;
              return [mapped, ...prev];
            });
            setUnreadCount((prev) => prev + 1);

            notification.open({
              message: <span className="font-bold text-xs text-[#1b1c1c]">{mapped.title}</span>,
              description: <p className="text-[11px] text-[#4A4A4A] mt-0.5 leading-normal">{mapped.body}</p>,
              placement: 'topRight',
              duration: 5,
              icon: (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mapped.iconBg}`}>
                  <span className={`material-symbols-outlined text-[16px] ${mapped.iconColor}`}>{mapped.icon}</span>
                </div>
              ),
            });
          }
        });
      } catch (err) {
        logNotificationFailure('SignalR Notification Hub connection failed', err);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (connection) {
        connection.off('ReceiveNotification');
        connection.stop()
          .then(() => console.log('SignalR NotificationHub connection stopped.'))
          .catch((err) => logNotificationFailure('Error stopping SignalR NotificationHub connection', err));
      }
    };
  }, [isAuthenticated, notification]);

  // Strategy 2: Smart Polling every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const intervalId = setInterval(async () => {
      const prevCount = unreadCount;
      const nextCount = await fetchUnreadCount();
      
      // If there is new unread notifications, reload page 1 to display them
      if (nextCount > prevCount) {
        fetchNotifications(1, false);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, unreadCount, fetchUnreadCount, fetchNotifications]);

  const value = {
    unreadCount,
    notifications,
    loading,
    hasMore,
    page,
    settings,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllRead,
    fetchSettings,
    updateSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
