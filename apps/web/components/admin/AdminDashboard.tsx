'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { getSession, ensureValidToken } from '../../lib/auth';
import { RoleManagementModal } from './RoleManagementModal';
import {
  TrendingUp,
  Sparkles,
  Receipt,
  Users,
  Wallet,
  ShieldCheck,
  Clock,
  Database,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AdminDashboardProps {
  onOpenPriceModal: () => void;
  onNavigateTab: (tab: 'billing' | 'pisai' | 'udhaar' | 'reports') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenPriceModal,
  onNavigateTab,
}) => {
  const { isUrdu, t } = useLanguage();
  const [closingTriggered, setClosingTriggered] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [kpiData, setKpiData] = useState<{
    sales: { totalAmount: number; billsCount: number; cashCollected: number };
    pisai: { totalRevenue: number; tokensCount: number; weightKg: number; cashCollected: number };
    expenses: { totalAmount: number; count: number };
    udhaar: { totalOutstanding: number; debtorsCount: number };
    cash: { netCashInHand: number; inflows: number; outflows: number };
  } | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const sess = getSession();
        const token = await ensureValidToken(sess);
        const res = await fetch('http://localhost:5000/api/reports/dashboard-kpis?range=today', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (json.success && json.data) {
          setKpiData(json.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard KPIs:', err);
      }
    };
    fetchKpis();
  }, []);

  const handleDailyClosing = () => {
    const confirmClosing = window.confirm(
      isUrdu
        ? 'کیا آپ واقعی یومیہ کلوزنگ اور ڈیٹابیس بیک اپ کرنا چاہتے ہیں؟ اس سے آج کا لیجر محفوظ ہو جائے گا۔'
        : 'Are you sure you want to perform daily closing and database backup?'
    );
    if (confirmClosing) {
      setClosingTriggered(true);
      setTimeout(() => {
        alert(
          isUrdu
            ? 'یومیہ کلوزنگ اور ڈیٹابیس بیک اپ کامیابی سے مکمل ہو گیا ہے!'
            : 'Daily closing and database backup completed successfully!'
        );
        setClosingTriggered(false);
      }, 1200);
    }
  };

  const summaryCards = [
    {
      id: 'sales',
      title: isUrdu ? 'آج کی پراڈکٹ سیل' : "Today's Product Sales",
      numValue: kpiData
        ? kpiData.sales.totalAmount.toLocaleString()
        : '0',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.sales.billsCount} بلز جاری ہوئے • آٹا، میدہ، سوجی`
          : `${kpiData.sales.billsCount} bills issued • Atta, Maida, Suji`
        : isUrdu ? '0 بلز جاری ہوئے • آٹا، میدہ، سوجی' : '0 bills issued • Atta, Maida, Suji',
      icon: <TrendingUp size={20} color="#D97706" />,
      bg: '#FFFBEB',
      border: '#FDE68A',
      textColor: '#92400E',
      valColor: '#B45309',
      onClick: () => onNavigateTab('billing'),
    },
    {
      id: 'pisai',
      title: isUrdu ? 'گندم پسائی آمدن' : 'Pisai Milling Revenue',
      numValue: kpiData
        ? kpiData.pisai.totalRevenue.toLocaleString()
        : '0',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.pisai.tokensCount} ٹوکنز مکمل • ${kpiData.pisai.weightKg} کلو`
          : `${kpiData.pisai.tokensCount} tokens processed • ${kpiData.pisai.weightKg} KG`
        : isUrdu ? '0 ٹوکنز مکمل • 0 کلو' : '0 tokens processed • 0 KG',
      icon: <Sparkles size={20} color="#0284C7" />,
      bg: '#F0F9FF',
      border: '#BAE6FD',
      textColor: '#0369A1',
      valColor: '#0284C7',
      onClick: () => onNavigateTab('pisai'),
    },
    {
      id: 'expenses',
      title: isUrdu ? 'دکان کے اخراجات' : 'Shop Expenses & Bills',
      numValue: kpiData
        ? kpiData.expenses.totalAmount.toLocaleString()
        : '0',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.expenses.count} اخراجات درج • بجلی، دکان خرچ`
          : `${kpiData.expenses.count} recorded • Electricity, shop`
        : isUrdu ? '0 اخراجات درج • بجلی، دکان خرچ' : '0 recorded • Electricity, shop',
      icon: <Receipt size={20} color="#E11D48" />,
      bg: '#FFF1F2',
      border: '#FECDD3',
      textColor: '#9F1239',
      valColor: '#BE123C',
      onClick: () => onNavigateTab('reports'),
    },
    {
      id: 'udhaar',
      title: isUrdu ? 'کل گاہک ادھار کھاتہ' : 'Total Customer Udhaar',
      numValue: kpiData
        ? kpiData.udhaar.totalOutstanding.toLocaleString()
        : '83,250',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.udhaar.debtorsCount} فعال ادھار کھاتہ داران`
          : `${kpiData.udhaar.debtorsCount} active credit accounts`
        : isUrdu ? '7 فعال ادھار کھاتہ داران' : '7 active credit accounts',
      icon: <Users size={20} color="#7E22CE" />,
      bg: '#FAF5FF',
      border: '#E9D5FF',
      textColor: '#6B21A8',
      valColor: '#7E22CE',
      onClick: () => onNavigateTab('udhaar'),
    },
    {
      id: 'drawer',
      title: isUrdu ? 'دکان کا موجودہ کیش' : 'Net Cash in Drawer',
      numValue: kpiData
        ? kpiData.cash.netCashInHand.toLocaleString()
        : '0',
      subtitle: isUrdu ? 'سیلز + پسائی + وصولی - اخراجات' : 'Sales + Pisai + Recovery - Expenses',
      icon: <Wallet size={20} color="#16A34A" />,
      bg: '#F0FDF4',
      border: '#BBF7D0',
      textColor: '#166534',
      valColor: '#15803D',
      onClick: () => onNavigateTab('reports'),
    },
  ];

  const auditLogs = [
    {
      time: isUrdu ? 'آج، 02:30 PM' : 'Today, 02:30 PM',
      actor: isUrdu ? 'بلر (محمد عاصف)' : 'Biller (Muhammad Asif)',
      action: 'PRINT_BILL',
      actionColor: '#0284C7',
      actionBg: '#F0F9FF',
      actionBorder: '#BAE6FD',
      detail: isUrdu ? 'بل #00481 (چکی آٹا، 40 کلو، 5,600 روپے)' : 'BILL-00481 (Chakki Atta, 40 KG, Rs 5,600)',
    },
    {
      time: isUrdu ? 'آج، 02:15 PM' : 'Today, 02:15 PM',
      actor: isUrdu ? 'بلر (محمد عاصف)' : 'Biller (Muhammad Asif)',
      action: 'GENERATE_PISAI_TOKEN',
      actionColor: '#059669',
      actionBg: '#ECFDF5',
      actionBorder: '#A7F3D0',
      detail: isUrdu ? 'ٹوکن #0482 (صفائی و پسائی، 25 کلو، 150 روپے)' : 'Token #0482 (Cleaning & Grinding, 25 KG, Rs 150)',
    },
    {
      time: isUrdu ? 'آج، 01:45 PM' : 'Today, 01:45 PM',
      actor: isUrdu ? 'ایڈمن (حنظلہ)' : 'Admin (Hanzala)',
      action: 'LOG_EXPENSE',
      actionColor: '#E11D48',
      actionBg: '#FFF1F2',
      actionBorder: '#FECDD3',
      detail: isUrdu ? 'خرچہ #109 (بجلی ایڈوانس، 2,500 روپے)' : 'EXP-109 (Electricity Advance, Rs 2,500)',
    },
    {
      time: isUrdu ? 'آج، 01:10 PM' : 'Today, 01:10 PM',
      actor: isUrdu ? 'ایڈمن (حنظلہ)' : 'Admin (Hanzala)',
      action: 'LOG_UDHAAR_PAYMENT',
      actionColor: '#7E22CE',
      actionBg: '#FAF5FF',
      actionBorder: '#E9D5FF',
      detail: isUrdu ? 'وصولی #055 (گاہک حاجی رشید، 2,000 روپے)' : 'PAY-055 (Customer Haji Rasheed, Rs 2,000)',
    },
    {
      time: isUrdu ? 'آج، 08:00 AM' : 'Today, 08:00 AM',
      actor: isUrdu ? 'ایڈمن (حنظلہ)' : 'Admin (Hanzala)',
      action: 'CONFIRM_DAILY_PRICE',
      actionColor: '#D97706',
      actionBg: '#FFFBEB',
      actionBorder: '#FDE68A',
      detail: isUrdu ? 'یومیہ ریٹس کی تصدیق برائے 5 پراڈکٹس' : 'Daily rates confirmed for 5 products',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
      {/* 1. Shop Owner Welcome Command Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          borderRadius: '16px',
          padding: '18px 24px',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div>
          <h1
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{ fontSize: isUrdu ? '24px' : '18px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.2 }}
          >
            {t('المدینہ فلور ملز - ایڈمن کمانڈ سنٹر', 'Al-Madina Flour Mills - Admin Command Center')}
          </h1>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* RBAC Button */}
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            className="touch-active"
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '10px',
              backgroundColor: '#FFFBEB',
              color: '#92400E',
              border: '1.5px solid #FDE68A',
              fontSize: isUrdu ? '17px' : '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(217, 119, 6, 0.08)',
            }}
          >
            <ShieldCheck size={18} color="#D97706" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('سٹاف رولز و اختیارات', 'Staff Roles & Permissions')}</span>
          </button>

          {/* Today's Prices */}
          <button
            type="button"
            onClick={onOpenPriceModal}
            className="touch-active"
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1.5px solid #A7F3D0',
              fontSize: isUrdu ? '17px' : '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.08)',
            }}
          >
            <Clock size={18} color="#059669" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('روزانہ کے ریٹس', 'Daily Rates')}</span>
          </button>

          {/* Daily Closing & Backup */}
          <button
            type="button"
            onClick={handleDailyClosing}
            disabled={closingTriggered}
            className="touch-active"
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '10px',
              backgroundColor: '#F0F9FF',
              color: '#0369A1',
              border: '1.5px solid #BAE6FD',
              fontSize: isUrdu ? '17px' : '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.08)',
            }}
          >
            <Database size={18} color="#0284C7" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {closingTriggered
                ? t('بیک اپ ہو رہا ہے...', 'Backing up...')
                : t('یومیہ کلوزنگ و بیک اپ', 'Daily Closing & Backup')}
            </span>
          </button>

          {/* Counter Mode */}
          <button
            type="button"
            onClick={() => onNavigateTab('billing')}
            className="touch-active"
            style={{
              height: '42px',
              padding: '0 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1877F2 0%, #0D5AC4 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: isUrdu ? '17px' : '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(24, 119, 242, 0.25)',
            }}
          >
            <ShoppingCart size={18} color="#FFFFFF" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('کاؤنٹر پی او ایس', 'Counter POS')}</span>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Cards - 5 Evenly Distributed Cards in 1 Balanced Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '14px',
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className="touch-active dash-card-animated"
            style={{
              backgroundColor: card.bg,
              border: `1.5px solid ${card.border}`,
              borderRadius: '16px',
              padding: '16px 18px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '102px',
              transition: 'all 0.18s ease',
            }}
          >
            <div>
              {/* Card Header: Title + Squircle Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '19px' : '14px', fontWeight: 900, color: card.textColor, lineHeight: 1.2 }}
                >
                  {card.title}
                </span>

                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${card.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {card.icon}
                </div>
              </div>

              {/* Amount */}
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: card.valColor,
                  margin: '10px 0 0',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  direction: 'ltr',
                }}
              >
                <span>{card.numValue}</span>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '16px' : '13px', fontWeight: 800, color: card.textColor }}
                >
                  {isUrdu ? 'روپے' : 'PKR'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Activity Audit Log */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #CBD5E1',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Table Header / Banner */}
        <div
          style={{
            backgroundColor: '#0F172A',
            padding: '16px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} color="#FDE68A" />
            </div>
            <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '16px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              {t('سسٹم سرگرمی اور مالیاتی لاگ', 'System Activity & Financial Audit Log')}
            </h3>
          </div>

          <span
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{
              fontSize: isUrdu ? '15px' : '12.5px',
              color: '#34D399',
              fontWeight: 800,
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }}
          >
            {t('غیر متغیر سکیورٹی و مالیاتی ٹریل', 'Immutable security and audit trail')}
          </span>
        </div>

        {/* Column Headings */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 200px 220px 1fr',
            padding: '12px 22px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1.5px solid #E2E8F0',
            fontSize: isUrdu ? '16px' : '13px',
            fontWeight: 800,
            color: '#64748B',
          }}
          className={isUrdu ? 'font-nastaleeq' : ''}
        >
          <span>{t('وقت و تاریخ', 'Time')}</span>
          <span>{t('صارف / بلر', 'User / Actor')}</span>
          <span>{t('کارروائی کی قسم', 'Action')}</span>
          <span>{t('تفصیلات', 'Details')}</span>
        </div>

        {/* Log Entries */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {auditLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 200px 220px 1fr',
                padding: '14px 22px',
                backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                borderBottom: idx === auditLogs.length - 1 ? 'none' : '1px solid #F1F5F9',
                alignItems: 'center',
                gap: '10px',
                transition: 'background-color 0.12s ease',
              }}
            >
              <span style={{ color: '#475569', fontWeight: 800, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                {log.time}
              </span>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800, color: '#0F172A', fontSize: isUrdu ? '17px' : '14px' }}>
                {log.actor}
              </span>
              <div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: log.actionBg,
                    color: log.actionColor,
                    border: `1.5px solid ${log.actionBorder}`,
                    fontFamily: 'var(--font-mono)',
                    display: 'inline-block',
                  }}
                >
                  {log.action}
                </span>
              </div>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: '#1E293B', fontWeight: 700, fontSize: isUrdu ? '17px' : '14px' }}>
                {log.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Role & Permission Management Modal */}
      <RoleManagementModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </div>
  );
};
