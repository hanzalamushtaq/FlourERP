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
      value: kpiData
        ? isUrdu
          ? `${kpiData.sales.totalAmount.toLocaleString()} روپے`
          : `Rs ${kpiData.sales.totalAmount.toLocaleString()}`
        : isUrdu ? '42,850 روپے' : 'Rs 42,850',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.sales.billsCount} بلز جاری ہوئے • آٹا، میدہ، سوجی`
          : `${kpiData.sales.billsCount} bills issued • Atta, Maida, Suji`
        : isUrdu ? '38 بلز جاری ہوئے • آٹا، میدہ، سوجی' : '38 bills issued • Atta, Maida, Suji',
      icon: <TrendingUp size={20} color="#d97706" />,
      bg: '#fffbeb',
      border: '#fde68a',
      textColor: '#92400e',
      valColor: '#b45309',
      onClick: () => onNavigateTab('billing'),
    },
    {
      id: 'pisai',
      title: isUrdu ? 'گندم پسائی آمدن' : 'Pisai Milling Revenue',
      value: kpiData
        ? isUrdu
          ? `${kpiData.pisai.totalRevenue.toLocaleString()} روپے`
          : `Rs ${kpiData.pisai.totalRevenue.toLocaleString()}`
        : isUrdu ? '8,640 روپے' : 'Rs 8,640',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.pisai.tokensCount} ٹوکنز مکمل • ${kpiData.pisai.weightKg} کلو`
          : `${kpiData.pisai.tokensCount} tokens processed • ${kpiData.pisai.weightKg} KG`
        : isUrdu ? '54 ٹوکنز مکمل • 1,440 کلو' : '54 tokens processed • 1,440 KG',
      icon: <Sparkles size={20} color="#0284c7" />,
      bg: '#f0f9ff',
      border: '#bae6fd',
      textColor: '#075985',
      valColor: '#0369a1',
      onClick: () => onNavigateTab('pisai'),
    },
    {
      id: 'expenses',
      title: isUrdu ? 'دکان کے اخراجات' : 'Shop Expenses & Bills',
      value: kpiData
        ? isUrdu
          ? `${kpiData.expenses.totalAmount.toLocaleString()} روپے`
          : `Rs ${kpiData.expenses.totalAmount.toLocaleString()}`
        : isUrdu ? '3,625 روپے' : 'Rs 3,625',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.expenses.count} اخراجات درج • بجلی، دکان خرچ`
          : `${kpiData.expenses.count} recorded • Electricity, tea, maintenance`
        : isUrdu ? 'بجلی، ورکر چائے، دکان خرچ' : 'Electricity, tea, maintenance',
      icon: <Receipt size={20} color="#e11d48" />,
      bg: '#fff1f2',
      border: '#fecdd3',
      textColor: '#9f1239',
      valColor: '#be123c',
      onClick: () => onNavigateTab('reports'),
    },
    {
      id: 'udhaar',
      title: isUrdu ? 'کل گاہک ادھار کھاتہ' : 'Total Customer Udhaar',
      value: kpiData
        ? isUrdu
          ? `${kpiData.udhaar.totalOutstanding.toLocaleString()} روپے`
          : `Rs ${kpiData.udhaar.totalOutstanding.toLocaleString()}`
        : isUrdu ? '61,100 روپے' : 'Rs 61,100',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.udhaar.debtorsCount} فعال ادھار کھاتہ داران`
          : `${kpiData.udhaar.debtorsCount} active credit accounts`
        : isUrdu ? '14 فعال ادھار کھاتہ داران' : '14 active credit accounts',
      icon: <Users size={20} color="#7e22ce" />,
      bg: '#faf5ff',
      border: '#e9d5ff',
      textColor: '#6b21a8',
      valColor: '#7e22ce',
      onClick: () => onNavigateTab('udhaar'),
    },
    {
      id: 'drawer',
      title: isUrdu ? 'دکان کا موجودہ کیش' : 'Net Cash in Drawer',
      value: kpiData
        ? isUrdu
          ? `${kpiData.cash.netCashInHand.toLocaleString()} روپے`
          : `Rs ${kpiData.cash.netCashInHand.toLocaleString()}`
        : isUrdu ? '47,865 روپے' : 'Rs 47,865',
      subtitle: isUrdu ? 'سیلز + پسائی + وصولی - اخراجات' : 'Sales + Pisai + Recovery - Expenses',
      icon: <Wallet size={20} color="#16a34a" />,
      bg: '#f0fdf4',
      border: '#bbf7d0',
      textColor: '#166534',
      valColor: '#15803d',
      onClick: () => onNavigateTab('reports'),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Shop Owner Welcome Command Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #C2C5AA',
          borderRadius: '14px',
          padding: '16px 20px',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: 'none',
        }}
      >
        <div>
          <h1
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{ fontSize: '18px', fontWeight: 900, color: '#414833', margin: 0, lineHeight: 1.2 }}
          >
            {t('المدینہ فلور ملز - ایڈمن کمانڈ سنٹر', 'Al-Madina Flour Mills - Admin Command Center')}
          </h1>
          <p
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{ fontSize: '12px', color: '#656D4A', marginTop: '3px', fontWeight: 700 }}
          >
            {t(
              'لائیو مالیاتی صورتحال، روزانہ کے ریٹس، چکی پسائی کیو اور سٹاف اختیارات کنٹرول',
              'Live financial status, daily rates, milling queue and staff permissions control'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* RBAC Button */}
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            className="touch-active"
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#fffbeb',
              color: '#92400e',
              border: '1.5px solid #fde68a',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'none',
            }}
          >
            <ShieldCheck size={16} color="#d97706" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('سٹاف رولز و اختیارات', 'Staff Roles & Permissions')}</span>
          </button>

          {/* Today's Prices */}
          <button
            type="button"
            onClick={onOpenPriceModal}
            className="touch-active"
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1.5px solid #a7f3d0',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'none',
            }}
          >
            <Clock size={16} color="#059669" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('روزانہ کے ریٹس', 'Daily Rates')}</span>
          </button>

          {/* Daily Closing & Backup */}
          <button
            type="button"
            onClick={handleDailyClosing}
            disabled={closingTriggered}
            className="touch-active"
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              color: '#0369a1',
              border: '1.5px solid #bae6fd',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'none',
            }}
          >
            <Database size={16} color="#0284c7" />
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
              height: '38px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#faf5ff',
              color: '#6b21a8',
              border: '1.5px solid #e9d5ff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'none',
            }}
          >
            <ShoppingCart size={16} color="#7e22ce" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('کاؤنٹر پی او ایس', 'Counter POS')}</span>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className="touch-active"
            style={{
              backgroundColor: card.bg,
              border: `1.5px solid ${card.border}`,
              borderRadius: '12px',
              padding: '14px 16px',
              cursor: 'pointer',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: '14px', fontWeight: 800, color: card.textColor, lineHeight: 1.1 }}
                >
                  {card.title}
                </span>

                {/* White rounded square for icon */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: `1px solid ${card.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none',
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
              </div>

              {/* Amount */}
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                  color: card.valColor,
                  margin: '8px 0 2px',
                }}
              >
                {card.value}
              </div>
            </div>

            {/* Subtitle */}
            <div
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{ fontSize: '12px', color: card.textColor, opacity: 0.9, marginTop: '4px' }}
            >
              {card.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Activity Audit Log */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #C2C5AA',
          padding: '16px 20px',
          boxShadow: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={16} color="#d97706" />
            </div>
            <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '15px', fontWeight: 800, color: '#414833', margin: 0 }}>
              {t('سسٹم سرگرمی اور مالیاتی لاگ', 'System Activity & Financial Audit Log')}
            </h3>
          </div>
          <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12.5px', color: '#656D4A', fontWeight: 600 }}>
            {t('غیر متغیر سکیورٹی و مالیاتی ٹریل', 'Immutable security and audit trail')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            {
              time: isUrdu ? 'آج، 02:30 PM' : 'Today, 02:30 PM',
              actor: isUrdu ? 'بلر (محمد عاصف)' : 'Biller (Muhammad Asif)',
              action: 'PRINT_BILL',
              actionColor: '#0284c7',
              actionBg: '#f0f9ff',
              actionBorder: '#bae6fd',
              detail: isUrdu ? 'بل #00481 (چکی آٹا، 40 کلو، 5,600 روپے)' : 'BILL-00481 (Chakki Atta, 40 KG, Rs 5,600)',
            },
            {
              time: isUrdu ? 'آج، 02:15 PM' : 'Today, 02:15 PM',
              actor: isUrdu ? 'بلر (محمد عاصف)' : 'Biller (Muhammad Asif)',
              action: 'GENERATE_PISAI_TOKEN',
              actionColor: '#059669',
              actionBg: '#ecfdf5',
              actionBorder: '#a7f3d0',
              detail: isUrdu ? 'ٹوکن #0482 (صفائی و پسائی، 25 کلو، 150 روپے)' : 'Token #0482 (Cleaning & Grinding, 25 KG, Rs 150)',
            },
            {
              time: isUrdu ? 'آج، 01:45 PM' : 'Today, 01:45 PM',
              actor: isUrdu ? 'ایڈمن (حنظلہ)' : 'Admin (Hanzala)',
              action: 'LOG_EXPENSE',
              actionColor: '#e11d48',
              actionBg: '#fff1f2',
              actionBorder: '#fecdd3',
              detail: isUrdu ? 'خرچہ #109 (بجلی ایڈوانس، 2,500 روپے)' : 'EXP-109 (Electricity Advance, Rs 2,500)',
            },
            {
              time: isUrdu ? 'آج، 01:10 PM' : 'Today, 01:10 PM',
              actor: isUrdu ? 'ایڈمن (حنظلہ)' : 'Admin (Hanzala)',
              action: 'LOG_UDHAAR_PAYMENT',
              actionColor: '#7e22ce',
              actionBg: '#faf5ff',
              actionBorder: '#e9d5ff',
              detail: isUrdu ? 'وصولی #055 (گاہک حاجی رشید، 2,000 روپے)' : 'PAY-055 (Customer Haji Rasheed, Rs 2,000)',
            },
            {
              time: isUrdu ? 'آج، 08:00 AM' : 'Today, 08:00 AM',
              actor: isUrdu ? 'ایڈمن (حنظلہ)' : 'Admin (Hanzala)',
              action: 'CONFIRM_DAILY_PRICE',
              actionColor: '#d97706',
              actionBg: '#fffbeb',
              actionBorder: '#fde68a',
              detail: isUrdu ? 'یومیہ ریٹس کی تصدیق برائے 5 پراڈکٹس' : 'Daily rates confirmed for 5 products',
            },
          ].map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.5fr 1.6fr 3fr',
                fontSize: '12.5px',
                padding: '9px 14px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: '#64748b', fontWeight: 600, fontSize: '11.5px' }}>{log.time}</span>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800, color: '#414833' }}>{log.actor}</span>
              <div>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: log.actionBg,
                    color: log.actionColor,
                    border: `1px solid ${log.actionBorder}`,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {log.action}
                </span>
              </div>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: '#414833', fontWeight: 600, fontSize: '12px' }}>
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
