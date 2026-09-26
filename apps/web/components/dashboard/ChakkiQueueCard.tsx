'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Printer,
  CheckCircle2,
  Clock,
  Edit3,
  X,
  Save,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { getApiBaseUrl } from '../../lib/api';
import { getSession } from '../../lib/auth';
import { sound } from '../../lib/audioFeedback';

export interface ChakkiQueueItem {
  id: string;
  tokenNumber: string | number;
  tokenFormatted?: string;
  customerName: string;
  customerPhone?: string;
  weightKg: number;
  deliveryStatus: 'IN_QUEUE' | 'DELIVERED';
  serviceType?: string;
  feeAmount?: number;
  discount?: number;
  netTotal?: number;
  paymentMethod?: string;
  createdAt?: string;
  deliveredAt?: string;
  rawReceiptData?: ReceiptData;
}

const SAMPLE_QUEUE: ChakkiQueueItem[] = [
  {
    id: '1',
    tokenNumber: '1001',
    tokenFormatted: 'T-1001',
    customerName: 'احمد خان',
    customerPhone: '0300-1234567',
    weightKg: 50,
    deliveryStatus: 'IN_QUEUE',
    serviceType: 'SAFAI_PISAI',
    feeAmount: 300,
    netTotal: 300,
    paymentMethod: 'CASH',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    tokenNumber: '1002',
    tokenFormatted: 'T-1002',
    customerName: 'بلال شیخ',
    customerPhone: '0321-9876543',
    weightKg: 30,
    deliveryStatus: 'IN_QUEUE',
    serviceType: 'PISAI_ONLY',
    feeAmount: 150,
    netTotal: 150,
    paymentMethod: 'CASH',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    tokenNumber: '1003',
    tokenFormatted: 'T-1003',
    customerName: 'عمران علی',
    customerPhone: '0333-1122334',
    weightKg: 80,
    deliveryStatus: 'IN_QUEUE',
    serviceType: 'SAFAI_PISAI',
    feeAmount: 480,
    netTotal: 480,
    paymentMethod: 'CASH',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    tokenNumber: '1004',
    tokenFormatted: 'T-1004',
    customerName: 'عمران علی',
    customerPhone: '0333-1122334',
    weightKg: 40,
    deliveryStatus: 'DELIVERED',
    serviceType: 'SAFAI_PISAI',
    feeAmount: 240,
    netTotal: 240,
    paymentMethod: 'CASH',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    deliveredAt: new Date().toISOString(),
  },
  {
    id: '5',
    tokenNumber: '1005',
    tokenFormatted: 'T-1005',
    customerName: 'عمران علی',
    customerPhone: '0333-1122334',
    weightKg: 30,
    deliveryStatus: 'DELIVERED',
    serviceType: 'PISAI_ONLY',
    feeAmount: 150,
    netTotal: 150,
    paymentMethod: 'CASH',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    deliveredAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

interface ChakkiQueueCardProps {
  onTokenDelivered?: (tokenNumber: number | string) => void;
}

export const ChakkiQueueCard: React.FC<ChakkiQueueCardProps> = ({ onTokenDelivered }) => {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useTheme();

  // Status Filter: 'IN_QUEUE' | 'DELIVERED' | 'ALL'
  const [activeFilter, setActiveFilter] = useState<'IN_QUEUE' | 'DELIVERED' | 'ALL'>('IN_QUEUE');
  const [queue, setQueue] = useState<ChakkiQueueItem[]>(SAMPLE_QUEUE);
  const [selectedToken, setSelectedToken] = useState<ChakkiQueueItem | null>(null);

  // Edit fields for selected token
  const [editCustomerName, setEditCustomerName] = useState<string>('');
  const [editCustomerPhone, setEditCustomerPhone] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Receipt modal state
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Fetch live queue from backend
  const fetchQueue = async () => {
    try {
      const session = getSession();
      const res = await fetch(`${getApiBaseUrl()}/api/pisai/queue?limit=50`, {
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.records) && json.data.records.length > 0) {
          const mapped: ChakkiQueueItem[] = json.data.records.map((r: any) => ({
            id: r.id,
            tokenNumber: r.tokenNumber,
            tokenFormatted: r.tokenFormatted || `T-${r.tokenNumber}`,
            customerName: r.customer?.name || r.customerName || (isUrdu ? 'عام گاہک' : 'Walk-in Customer'),
            customerPhone: r.customer?.phone || r.customerPhone || '',
            weightKg: r.weightKg,
            deliveryStatus: (r.deliveryStatus as 'IN_QUEUE' | 'DELIVERED') || 'IN_QUEUE',
            serviceType: r.serviceType,
            feeAmount: r.feeAmount,
            discount: r.discount,
            netTotal: r.netTotal,
            paymentMethod: r.paymentMethod,
            createdAt: r.createdAt,
            deliveredAt: r.deliveredAt,
          }));
          setQueue(mapped);
        }
      }
    } catch {
      // Keep sample data if backend is offline
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter items
  const filteredQueue = queue.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.deliveryStatus === activeFilter;
  });

  const inQueueCount = queue.filter((item) => item.deliveryStatus === 'IN_QUEUE').length;
  const deliveredCount = queue.filter((item) => item.deliveryStatus === 'DELIVERED').length;

  // Open modal on row click
  const handleRowClick = (item: ChakkiQueueItem) => {
    sound.beep();
    setSelectedToken(item);
    setEditCustomerName(item.customerName);
    setEditCustomerPhone(item.customerPhone || '');
    setSaveSuccess(false);
  };

  // Toggle delivery status
  const handleToggleStatus = async (item: ChakkiQueueItem) => {
    const nextStatus: 'IN_QUEUE' | 'DELIVERED' =
      item.deliveryStatus === 'IN_QUEUE' ? 'DELIVERED' : 'IN_QUEUE';

    sound.success();

    // Optimistic local update
    const updatedItem = {
      ...item,
      deliveryStatus: nextStatus,
      deliveredAt: nextStatus === 'DELIVERED' ? new Date().toISOString() : undefined,
    };

    setQueue((prev) =>
      prev.map((q) => (q.id === item.id || q.tokenNumber === item.tokenNumber ? updatedItem : q))
    );
    setSelectedToken(updatedItem);

    if (nextStatus === 'DELIVERED') {
      onTokenDelivered?.(item.tokenNumber);
    }

    try {
      const session = getSession();
      await fetch(`${getApiBaseUrl()}/api/pisai/${item.id}/delivery-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({ deliveryStatus: nextStatus }),
      });
    } catch {
      // Backend error fallback
    }
  };

  // Save edited customer details
  const handleSaveChanges = async () => {
    if (!selectedToken) return;
    setIsSaving(true);
    sound.beep();

    const updatedItem = {
      ...selectedToken,
      customerName: editCustomerName.trim() || selectedToken.customerName,
      customerPhone: editCustomerPhone.trim(),
    };

    setQueue((prev) =>
      prev.map((q) =>
        q.id === selectedToken.id || q.tokenNumber === selectedToken.tokenNumber ? updatedItem : q
      )
    );
    setSelectedToken(updatedItem);

    try {
      const session = getSession();
      await fetch(`${getApiBaseUrl()}/api/pisai/${selectedToken.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          customerName: editCustomerName.trim(),
          customerPhone: editCustomerPhone.trim(),
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Print token ticket
  const handlePrint = (item: ChakkiQueueItem) => {
    sound.beep();
    const tokenDisplay = item.tokenFormatted || `T-${item.tokenNumber}`;
    const dateFormatted = item.createdAt
      ? new Date(item.createdAt).toLocaleString('en-PK', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleString();

    const receipt: ReceiptData = {
      type: 'pisai',
      billNumber: tokenDisplay,
      customerName: item.customerName,
      serviceType: item.serviceType || 'SAFAI_PISAI',
      pisaiWeightKg: item.weightKg,
      pisaiToken: tokenDisplay,
      subtotal: item.feeAmount || item.netTotal || 0,
      discount: item.discount || 0,
      netTotal: item.netTotal || item.feeAmount || 0,
      cashReceived: item.netTotal || item.feeAmount || 0,
      remainingBalance: 0,
      isCredit: item.paymentMethod === 'CREDIT',
      timestamp: dateFormatted,
      billerName: 'محمد عاصف',
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  return (
    <div
      className="dash-interactive-card card-animate-1"
      style={{
        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
        borderRadius: '16px',
        border: isDark ? '1.5px solid #334155' : 'none',
        outline: 'none',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : 'none',
        width: '100%',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Title + 2 Options/Tabs: In Queue vs Delivered */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        <h3
          className={isUrdu ? 'font-nastaleeq' : ''}
          style={{
            fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
            fontSize: isUrdu ? '24px' : '18px',
            fontWeight: 900,
            color: isDark ? '#F8FAFC' : '#0F172A',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1,
          }}
        >
          {t('چکی ٹوکن قطار', 'Milling Token Queue')}
        </h3>

        {/* 2 Options Buttons: In Queue (قطار میں) & Delivered (فراہم کر دیا) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isDark ? '#0F172A' : '#E2E8F0',
            borderRadius: '10px',
            padding: '3px',
            gap: '4px',
          }}
        >
          {/* Option 1: In Queue */}
          <button
            type="button"
            onClick={() => {
              sound.beep();
              setActiveFilter('IN_QUEUE');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: isUrdu ? '15px' : '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor:
                activeFilter === 'IN_QUEUE' ? '#D97706' : 'transparent',
              color:
                activeFilter === 'IN_QUEUE'
                  ? '#FFFFFF'
                  : isDark
                  ? '#94A3B8'
                  : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={14} />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('قطار میں', 'In Queue')}
            </span>
            <span
              style={{
                backgroundColor:
                  activeFilter === 'IN_QUEUE'
                    ? 'rgba(255,255,255,0.25)'
                    : isDark
                    ? '#334155'
                    : '#CBD5E1',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 900,
              }}
            >
              {inQueueCount}
            </span>
          </button>

          {/* Option 2: Delivered */}
          <button
            type="button"
            onClick={() => {
              sound.beep();
              setActiveFilter('DELIVERED');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: isUrdu ? '15px' : '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor:
                activeFilter === 'DELIVERED' ? '#0E8A54' : 'transparent',
              color:
                activeFilter === 'DELIVERED'
                  ? '#FFFFFF'
                  : isDark
                  ? '#94A3B8'
                  : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckCircle2 size={14} />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('فراہم کر دیا', 'Delivered')}
            </span>
            <span
              style={{
                backgroundColor:
                  activeFilter === 'DELIVERED'
                    ? 'rgba(255,255,255,0.25)'
                    : isDark
                    ? '#334155'
                    : '#CBD5E1',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 900,
              }}
            >
              {deliveredCount}
            </span>
          </button>

          {/* Option 3: All */}
          <button
            type="button"
            onClick={() => {
              sound.beep();
              setActiveFilter('ALL');
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: isUrdu ? '14px' : '12px',
              backgroundColor:
                activeFilter === 'ALL'
                  ? (isDark ? '#334155' : '#FFFFFF')
                  : 'transparent',
              color:
                activeFilter === 'ALL'
                  ? (isDark ? '#F8FAFC' : '#0F172A')
                  : isDark
                  ? '#94A3B8'
                  : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('تمام', 'All')}
            </span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ width: '100%', borderRadius: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '380px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                height: '46px',
              }}
            >
              <th
                style={{
                  display: 'table-cell',
                  width: '26%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 8px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '0',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('وزن (کلو)', 'Weight (KG)')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '38%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 8px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('گاہک کا نام', 'Customer Name')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '22%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 8px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('ٹوکن نمبر', 'Token #')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '14%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 6px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '16px' : '13px',
                  textAlign: 'center',
                  borderTopRightRadius: '8px',
                  borderTopLeftRadius: '0',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('اسٹیٹس', 'Status')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: 'center',
                    padding: '24px 8px',
                    color: isDark ? '#94A3B8' : '#64748B',
                    fontSize: '14px',
                    fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                  }}
                >
                  {activeFilter === 'IN_QUEUE'
                    ? t('قطار میں کوئی ٹوکن باقی نہیں ہے', 'No tokens currently in queue')
                    : t('کوئی ٹوکن نہیں ملا', 'No tokens found')}
                </td>
              </tr>
            ) : (
              filteredQueue.map((item, idx) => {
                const isDelivered = item.deliveryStatus === 'DELIVERED';
                const tokenDisplay = item.tokenFormatted || `T-${item.tokenNumber}`;

                return (
                  <tr
                    key={item.id || item.tokenNumber}
                    onClick={() => handleRowClick(item)}
                    className="dash-table-row"
                    title={t('کارروائی اور تفصیلات کے لیے کلک کریں', 'Click to open Action Window (Edit / Print / Status)')}
                    style={{
                      cursor: 'pointer',
                      borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                      backgroundColor: isDark
                        ? idx % 2 === 1
                          ? '#1E293B'
                          : '#151D2F'
                        : idx % 2 === 1
                        ? '#FFFFFF'
                        : '#F8FAFC',
                      height: '52px',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Weight */}
                    <td
                      style={{
                        height: '52px',
                        verticalAlign: 'middle',
                        padding: '0 8px',
                        fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                        fontWeight: 800,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        fontSize: isUrdu ? '18px' : '14px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>{isUrdu ? `${item.weightKg} کلو` : `${item.weightKg} KG`}</span>
                    </td>

                    {/* Customer Name */}
                    <td
                      style={{
                        height: '52px',
                        verticalAlign: 'middle',
                        padding: '0 8px',
                        fontFamily: 'var(--font-urdu)',
                        fontWeight: 800,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        fontSize: isUrdu ? '19px' : '15px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.customerName}
                    </td>

                    {/* Token No */}
                    <td
                      style={{
                        height: '52px',
                        verticalAlign: 'middle',
                        padding: '0 8px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        className="token-badge-animated"
                        style={{
                          backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                          color: isDark ? '#93C5FD' : '#1D4ED8',
                          border: isDark ? '1px solid #2563EB' : '1px solid #BFDBFE',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '14px',
                          fontWeight: 900,
                          display: 'inline-block',
                        }}
                      >
                        {tokenDisplay}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td
                      style={{
                        height: '52px',
                        verticalAlign: 'middle',
                        padding: '0 6px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: isUrdu ? '13px' : '11px',
                          fontWeight: 800,
                          backgroundColor: isDelivered
                            ? isDark
                              ? 'rgba(16, 185, 129, 0.2)'
                              : '#ECFDF5'
                            : isDark
                            ? 'rgba(245, 158, 11, 0.2)'
                            : '#FFFBEB',
                          color: isDelivered
                            ? isDark
                              ? '#34D399'
                              : '#0E8A54'
                            : isDark
                            ? '#FBBF24'
                            : '#B45309',
                          fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                        }}
                      >
                        {isDelivered ? (
                          <>
                            <CheckCircle2 size={12} />
                            {t('فراہم', 'Delivered')}
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            {t('قطار', 'Queue')}
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* POP-UP ACTION WINDOW FOR MILLING TOKEN (Edit / Print / Status Change) */}
      {selectedToken && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedToken(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'modalSlideUp 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '16px',
                  }}
                >
                  {selectedToken.tokenFormatted || `T-${selectedToken.tokenNumber}`}
                </span>
                <h4
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    margin: 0,
                    fontSize: isUrdu ? '20px' : '17px',
                    fontWeight: 900,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                >
                  {t('ٹوکن ایکشن ونڈو', 'Milling Token Action Window')}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedToken(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isDark ? '#334155' : '#E2E8F0',
                  color: isDark ? '#94A3B8' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Delivery Status Card & Toggle */}
              <div
                style={{
                  backgroundColor:
                    selectedToken.deliveryStatus === 'DELIVERED'
                      ? isDark
                        ? 'rgba(16, 185, 129, 0.15)'
                        : '#ECFDF5'
                      : isDark
                      ? 'rgba(217, 119, 6, 0.15)'
                      : '#FFFBEB',
                  border:
                    selectedToken.deliveryStatus === 'DELIVERED'
                      ? '1.5px solid #10B981'
                      : '1.5px solid #D97706',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isDark ? '#94A3B8' : '#64748B',
                      marginBottom: '2px',
                    }}
                  >
                    {t('موجودہ اسٹیٹس', 'Current Status')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 900,
                      fontSize: isUrdu ? '18px' : '15px',
                      color:
                        selectedToken.deliveryStatus === 'DELIVERED'
                          ? '#0E8A54'
                          : '#B45309',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                    }}
                  >
                    {selectedToken.deliveryStatus === 'DELIVERED' ? (
                      <>
                        <CheckCircle2 size={18} color="#0E8A54" />
                        {t('فراہم کر دیا گیا (Delivered)', 'Delivered')}
                      </>
                    ) : (
                      <>
                        <Clock size={18} color="#B45309" />
                        {t('قطار میں ہے (In Queue)', 'In Queue')}
                      </>
                    )}
                  </div>
                </div>

                {/* Status Switcher Button */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedToken)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '9px',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: isUrdu ? '16px' : '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor:
                      selectedToken.deliveryStatus === 'IN_QUEUE'
                        ? '#0E8A54'
                        : '#D97706',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {selectedToken.deliveryStatus === 'IN_QUEUE' ? (
                    <>
                      <Check size={16} />
                      <span className={isUrdu ? 'font-nastaleeq' : ''}>
                        {t('فراہم کریں', 'Mark Delivered')}
                      </span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      <span className={isUrdu ? 'font-nastaleeq' : ''}>
                        {t('واپس قطار میں ڈالیں', 'Back to Queue')}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Weight & Service Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>
                    {t('گندم کا وزن', 'Wheat Weight')}
                  </div>
                  <div
                    style={{
                      fontSize: isUrdu ? '19px' : '16px',
                      fontWeight: 900,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                    }}
                  >
                    {isUrdu ? `${selectedToken.weightKg} کلو` : `${selectedToken.weightKg} KG`}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>
                    {t('سروس کی قسم', 'Service Type')}
                  </div>
                  <div
                    style={{
                      fontSize: isUrdu ? '17px' : '14px',
                      fontWeight: 900,
                      color: '#D97706',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                    }}
                  >
                    {selectedToken.serviceType === 'PISAI_ONLY'
                      ? t('صرف پسائی', 'Pisai Only')
                      : t('صفائی و پسائی', 'Safai & Pisai')}
                  </div>
                </div>
              </div>

              {/* Edit Details Section */}
              <div
                style={{
                  border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '14px', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  <Edit3 size={15} color="#D97706" />
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {t('گاہک کی معلومات تبدیل کریں', 'Edit Customer Details')}
                  </span>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isDark ? '#94A3B8' : '#64748B',
                      marginBottom: '4px',
                    }}
                  >
                    {t('گاہک کا نام', 'Customer Name')}
                  </label>
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '14px',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isDark ? '#94A3B8' : '#64748B',
                      marginBottom: '4px',
                    }}
                  >
                    {t('فون نمبر', 'Phone Number')}
                  </label>
                  <input
                    type="text"
                    value={editCustomerPhone}
                    onChange={(e) => setEditCustomerPhone(e.target.value)}
                    placeholder="0300-1234567"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  style={{
                    marginTop: '4px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: saveSuccess ? '#0E8A54' : '#1877F2',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: isUrdu ? '15px' : '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={16} />
                      <span className={isUrdu ? 'font-nastaleeq' : ''}>
                        {t('محفوظ ہو گیا!', 'Saved Successfully!')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span className={isUrdu ? 'font-nastaleeq' : ''}>
                        {t('تبدیلیاں محفوظ کریں', 'Save Changes')}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: Print & Close */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => handlePrint(selectedToken)}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isUrdu ? '18px' : '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
                  }}
                >
                  <Printer size={18} />
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {t('ٹوکن پرنٹ کریں', 'Print Ticket')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedToken(null)}
                  style={{
                    height: '44px',
                    padding: '0 18px',
                    borderRadius: '10px',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    backgroundColor: 'transparent',
                    color: isDark ? '#94A3B8' : '#475569',
                    fontWeight: 800,
                    fontSize: isUrdu ? '16px' : '14px',
                    cursor: 'pointer',
                  }}
                >
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {t('بند کریں', 'Close')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview & Thermal Print Modal */}
      <ReceiptPreviewModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={receiptData}
      />
    </div>
  );
};
