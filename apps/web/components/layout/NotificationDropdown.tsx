'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Tag,
  Database,
  X,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSession } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/api';

export interface NotificationItem {
  id: string;
  type: 'rate_verify' | 'price_request' | 'closing' | 'system';
  severity: 'urgent' | 'warning' | 'info' | 'success';
  titleUr: string;
  titleEn: string;
  descUr: string;
  descEn: string;
  time: string;
  read: boolean;
  actionLabelUr?: string;
  actionLabelEn?: string;
  onAction?: () => void;
}

interface NotificationDropdownProps {
  isAdmin: boolean;
  onOpenPriceModal?: () => void;
  onOpenZReport?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isAdmin,
  onOpenPriceModal,
  onOpenZReport,
}) => {
  const { isUrdu, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRateConfirmedToday, setIsRateConfirmedToday] = useState<boolean | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('flour_erp_dismissed_notifications');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('flour_erp_read_notifications');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch daily rate verification status
  const fetchStatus = () => {
    const session = getSession();
    const headers: Record<string, string> = session?.token
      ? { Authorization: `Bearer ${session.token}` }
      : {};
    const baseUrl = getApiBaseUrl();

    // Check daily price status
    fetch(`${baseUrl}/api/prices/daily-status`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) {
          setIsRateConfirmedToday(!!json.data.isConfirmedToday);
        }
      })
      .catch(() => {});

    // If Admin, check pending price requests
    if (isAdmin) {
      fetch(`${baseUrl}/api/prices/requests?status=PENDING`, { headers })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.success && Array.isArray(json.data.requests)) {
            setPendingRequestsCount(json.data.requests.length);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 45000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Build current active notification list
  const notifications: NotificationItem[] = [];

  // 1. Daily Rate Verification Notification (Primary for Admin)
  if (isRateConfirmedToday === false) {
    notifications.push({
      id: `rate_verify_${new Date().toISOString().slice(0, 10)}`,
      type: 'rate_verify',
      severity: 'urgent',
      titleUr: 'آج کے ریٹ کی تصدیق درکار ہے!',
      titleEn: 'Daily Rate Verification Required!',
      descUr: 'آج کی تاریخ کے لیے روزانہ نرخوں کی تصدیق نہیں ہوئی۔ براہ کرم بلنگ سے پہلے ریٹ چیک اور تصدیق کریں۔',
      descEn: "Today's rates have not been verified yet. Please review and confirm prices before billing.",
      time: t('فوری', 'Urgent'),
      read: readIds.includes(`rate_verify_${new Date().toISOString().slice(0, 10)}`),
      actionLabelUr: 'ابھی ریٹ تصدیق کریں',
      actionLabelEn: 'Verify Rates Now',
      onAction: () => {
        setIsOpen(false);
        if (onOpenPriceModal) onOpenPriceModal();
      },
    });
  } else if (isRateConfirmedToday === true) {
    notifications.push({
      id: `rate_verified_${new Date().toISOString().slice(0, 10)}`,
      type: 'rate_verify',
      severity: 'success',
      titleUr: 'آج کے ریٹ تصدیق شدہ ہیں',
      titleEn: 'Rates Verified for Today',
      descUr: 'آج کے تمام چکی نرخ ایڈمن کے ذریعے تصدیق ہو چکے ہیں۔',
      descEn: "All flour products and rates for today have been verified by Admin.",
      time: t('آج', 'Today'),
      read: readIds.includes(`rate_verified_${new Date().toISOString().slice(0, 10)}`),
      actionLabelUr: 'ریٹ لسٹ دیکھیں',
      actionLabelEn: 'View Rates',
      onAction: () => {
        setIsOpen(false);
        if (onOpenPriceModal) onOpenPriceModal();
      },
    });
  }

  // 2. Pending Price Override Requests (Admin only)
  if (isAdmin && pendingRequestsCount > 0) {
    notifications.push({
      id: `pending_req_${pendingRequestsCount}`,
      type: 'price_request',
      severity: 'warning',
      titleUr: `کاؤنٹر بلر کی ${pendingRequestsCount} ریٹ تبدیل درخواستیں`,
      titleEn: `${pendingRequestsCount} Pending Price Change Requests`,
      descUr: 'کاؤنٹر بلر نے رعایت یا خاص ریٹ کی منظوری کی درخواست کی ہے۔',
      descEn: 'A biller has submitted a price override request awaiting your approval.',
      time: t('زیرِ التواء', 'Pending'),
      read: readIds.includes(`pending_req_${pendingRequestsCount}`),
      actionLabelUr: 'درخواست دیکھیں',
      actionLabelEn: 'Review Request',
      onAction: () => {
        setIsOpen(false);
        if (onOpenPriceModal) onOpenPriceModal();
      },
    });
  }

  // 3. Shift closing reminder in the evening
  const currentHour = new Date().getHours();
  if (currentHour >= 18) {
    notifications.push({
      id: `closing_reminder_${new Date().toISOString().slice(0, 10)}`,
      type: 'closing',
      severity: 'info',
      titleUr: 'روزانہ شفٹ اختتام (Z-Report) یاد دہانی',
      titleEn: 'End of Shift (Z-Report) Reminder',
      descUr: 'دن کی اختتامی رپورٹ نکالیں اور کیش دراز کا حساب مکمل کریں۔',
      descEn: 'Remember to perform daily closing and print the official Z-Report.',
      time: t('شام', 'Evening'),
      read: readIds.includes(`closing_reminder_${new Date().toISOString().slice(0, 10)}`),
      actionLabelUr: 'شفٹ کلوز کریں',
      actionLabelEn: 'Close Shift',
      onAction: () => {
        setIsOpen(false);
        if (onOpenZReport) onOpenZReport();
      },
    });
  }

  // 4. Supabase Database status
  notifications.push({
    id: 'db_cloud_active',
    type: 'system',
    severity: 'info',
    titleUr: 'سوپا بیس کلاؤڈ ڈیٹا بیس فعال ہے',
    titleEn: 'Supabase Cloud Database Active',
    descUr: 'تمام ریکارڈز محفوظ اور لائیو کلاؤڈ پوسٹگریس کے ساتھ منسلک ہیں۔',
    descEn: 'All records are securely synchronized with live cloud PostgreSQL.',
    time: t('آن لائن', 'Online'),
    read: readIds.includes('db_cloud_active'),
  });

  // Filter out dismissed
  const visibleNotifications = notifications.filter((n) => !dismissedIds.includes(n.id));
  const unreadCount = visibleNotifications.filter((n) => !n.read && n.severity !== 'info').length;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('flour_erp_dismissed_notifications', JSON.stringify(updated));
    }
  };

  const handleMarkAllRead = () => {
    const allIds = visibleNotifications.map((n) => n.id);
    setReadIds(allIds);
    if (typeof window !== 'undefined') {
      localStorage.setItem('flour_erp_read_notifications', JSON.stringify(allIds));
    }
  };

  const getSeverityStyle = (severity: NotificationItem['severity']) => {
    switch (severity) {
      case 'urgent':
        return {
          bg: '#FEF2F2',
          border: '#F87171',
          text: '#991B1B',
          badgeBg: '#DC2626',
          badgeText: '#FFFFFF',
          iconColor: '#DC2626',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FBBF24',
          text: '#92400E',
          badgeBg: '#F59E0B',
          badgeText: '#FFFFFF',
          iconColor: '#D97706',
        };
      case 'success':
        return {
          bg: '#F0FDF4',
          border: '#86EFAC',
          text: '#166534',
          badgeBg: '#16A34A',
          badgeText: '#FFFFFF',
          iconColor: '#16A34A',
        };
      case 'info':
      default:
        return {
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#334155',
          badgeBg: '#64748B',
          badgeText: '#FFFFFF',
          iconColor: '#2563EB',
        };
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Top Right Bell Icon Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          fetchStatus();
        }}
        title={t('اطلاعات', 'Notifications')}
        className="touch-active header-bell-btn"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: isOpen ? '#EFF6FF' : '#F8FAFC',
          border: isOpen ? '1.5px solid #1877F2' : '1.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isOpen ? '#1877F2' : '#0F172A',
          position: 'relative',
          outline: 'none',
          boxShadow: 'none',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
      >
        <Bell size={19} strokeWidth={2.2} />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 900,
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 5px rgba(220, 38, 38, 0.4)',
              border: '2px solid #FFFFFF',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="notification-panel-dropdown"
          style={{
            position: 'absolute',
            top: '46px',
            right: 0,
            left: 'auto',
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 12px 35px -5px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            zIndex: 100,
            overflow: 'hidden',
            direction: isUrdu ? 'rtl' : 'ltr',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="#1877F2" strokeWidth={2.2} />
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{ fontWeight: 800, fontSize: isUrdu ? '17px' : '14px', color: '#0F172A' }}
              >
                {t('اطلاعات و الرٹس', 'Notifications & Alerts')}
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px',
                  }}
                >
                  {unreadCount} {t('فوری', 'Action')}
                </span>
              )}
            </div>

            {visibleNotifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title={t('تمام پڑھ لیں', 'Mark all as read')}
                className="touch-active"
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#64748B',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                }}
              >
                <Check size={14} />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('تمام پڑھے گئے', 'Mark read')}
                </span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {visibleNotifications.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94A3B8' }}>
                <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px' }} />
                <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '15px', fontWeight: 700 }}>
                  {t('کوئی نئی اطلاع نہیں ہے', 'No new notifications')}
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  {t('تمام الرٹس کلیئر ہیں', 'All alerts are up to date')}
                </div>
              </div>
            ) : (
              visibleNotifications.map((item) => {
                const style = getSeverityStyle(item.severity);
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: item.read ? '#FFFFFF' : style.bg,
                      border: `1.5px solid ${item.read ? '#E2E8F0' : style.border}`,
                      borderRadius: '12px',
                      padding: '12px',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                      boxShadow: item.read ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* Top Row: Title + Time + Dismiss */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        {item.type === 'rate_verify' && <Tag size={16} color={style.iconColor} strokeWidth={2.4} />}
                        {item.type === 'price_request' && <AlertTriangle size={16} color={style.iconColor} strokeWidth={2.4} />}
                        {item.type === 'closing' && <Clock size={16} color={style.iconColor} strokeWidth={2.4} />}
                        {item.type === 'system' && <Database size={16} color={style.iconColor} strokeWidth={2.4} />}

                        <span
                          className={isUrdu ? 'font-nastaleeq' : ''}
                          style={{
                            fontWeight: 800,
                            fontSize: isUrdu ? '15px' : '13px',
                            color: '#0F172A',
                            lineHeight: 1.3,
                          }}
                        >
                          {isUrdu ? item.titleUr : item.titleEn}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            backgroundColor: style.badgeBg,
                            color: style.badgeText,
                          }}
                        >
                          {item.time}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDismiss(item.id, e)}
                          title={t('ہٹائیں', 'Dismiss')}
                          style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className={isUrdu ? 'font-nastaleeq' : ''}
                      style={{
                        margin: '6px 0 0',
                        fontSize: isUrdu ? '13px' : '12px',
                        color: '#475569',
                        lineHeight: 1.4,
                      }}
                    >
                      {isUrdu ? item.descUr : item.descEn}
                    </p>

                    {/* Action Button (e.g. Verify Rates Now) */}
                    {item.onAction && (
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-start' }}>
                        <button
                          type="button"
                          onClick={item.onAction}
                          className="touch-active"
                          style={{
                            backgroundColor: item.severity === 'urgent' ? '#DC2626' : '#1877F2',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: isUrdu ? '13px' : '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        >
                          <span className={isUrdu ? 'font-nastaleeq' : ''}>
                            {isUrdu ? item.actionLabelUr : item.actionLabelEn}
                          </span>
                          <ChevronRight size={14} style={{ transform: isUrdu ? 'rotate(180deg)' : 'none' }} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              color: '#64748B',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              {t('کلاؤڈ سسٹمز آن لائن', 'Cloud Systems Online')}
            </span>
            <button
              type="button"
              onClick={fetchStatus}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: '#1877F2',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('ریفریش', 'Refresh')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
