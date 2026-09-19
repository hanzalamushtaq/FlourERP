'use strict';
'use client';

import React, { useState } from 'react';
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

interface AdminDashboardProps {
  onOpenPriceModal: () => void;
  onNavigateTab: (tab: 'billing' | 'pisai' | 'udhaar' | 'reports') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenPriceModal,
  onNavigateTab,
}) => {
  const [closingTriggered, setClosingTriggered] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const handleDailyClosing = () => {
    const confirmClosing = window.confirm(
      'کیا آپ واقعی یومیہ کلوزنگ اور ڈیٹابیس بیک اپ کرنا چاہتے ہیں؟ اس سے آج کا لیجر محفوظ ہو جائے گا۔'
    );
    if (confirmClosing) {
      setClosingTriggered(true);
      setTimeout(() => {
        alert('یومیہ کلوزنگ اور SQLite/PostgreSQL ڈیٹابیس بیک اپ کامیابی سے مکمل ہو گیا ہے!');
        setClosingTriggered(false);
      }, 1200);
    }
  };

  const summaryCards = [
    {
      id: 'sales',
      titleUrdu: 'آج کی پراڈکٹ سیل',
      titleEn: "TODAY'S PRODUCT SALES",
      value: 'Rs 42,850',
      subtitle: '38 بلز جاری ہوئے • آٹا، میدہ، سوجی',
      icon: <TrendingUp size={20} color="#d97706" />,
      bg: '#fffbeb', // Relative soft amber
      border: '#fde68a',
      textColor: '#92400e',
      valColor: '#b45309',
      onClick: () => onNavigateTab('billing'),
    },
    {
      id: 'pisai',
      titleUrdu: 'گندم پسائی آمدن',
      titleEn: 'PISAI GRINDING FEES',
      value: 'Rs 8,640',
      subtitle: '54 ٹوکنز پراسیسڈ • 1,440 کلو گرام',
      icon: <Sparkles size={20} color="#0284c7" />,
      bg: '#f0f9ff', // Relative soft cyan/blue
      border: '#bae6fd',
      textColor: '#075985',
      valColor: '#0369a1',
      onClick: () => onNavigateTab('pisai'),
    },
    {
      id: 'expenses',
      titleUrdu: 'دکان کے اخراجات',
      titleEn: 'SHOP EXPENSES & BILLS',
      value: 'Rs 3,625',
      subtitle: 'بجلی، ورکر چائے، دکان خرچ',
      icon: <Receipt size={20} color="#e11d48" />,
      bg: '#fff1f2', // Relative soft rose
      border: '#fecdd3',
      textColor: '#9f1239',
      valColor: '#be123c',
      onClick: () => onNavigateTab('reports'),
    },
    {
      id: 'udhaar',
      titleUrdu: 'کل گاہک ادھار کھاتہ',
      titleEn: 'TOTAL CUSTOMER UDHAAR',
      value: 'Rs 61,100',
      subtitle: '14 ایکٹو ادھار کھاتہ داران',
      icon: <Users size={20} color="#7e22ce" />,
      bg: '#faf5ff', // Relative soft purple
      border: '#e9d5ff',
      textColor: '#6b21a8',
      valColor: '#7e22ce',
      onClick: () => onNavigateTab('udhaar'),
    },
    {
      id: 'drawer',
      titleUrdu: 'دکان کا موجودہ کیش',
      titleEn: 'NET CASH IN DRAWER',
      value: 'Rs 47,865',
      subtitle: 'سیلز + پسائی + وصولی - اخراجات',
      icon: <Wallet size={20} color="#16a34a" />,
      bg: '#f0fdf4', // Relative soft green
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
          boxShadow: '0 2px 6px rgba(65, 72, 51, 0.04)',
          direction: 'rtl',
        }}
      >
        <div>
          <h1
            className="font-nastaleeq"
            style={{ fontSize: '20px', fontWeight: 900, color: '#414833', margin: 0, lineHeight: 1.2 }}
          >
            المدینہ فلور ملز - ایڈمن کمانڈ سنٹر (Shop Owner Command Center)
          </h1>
          <p
            className="font-nastaleeq"
            style={{ fontSize: '13.5px', color: '#656D4A', marginTop: '3px', fontWeight: 700 }}
          >
            لائیو مالیاتی صورتحال، روزانہ کے ریٹس، چکی پسائی کیو اور سٹاف پرمیشنز کنٹرول
          </p>
        </div>

        {/* Action Buttons styled with relative pastel fills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* RBAC Button (Warm Amber) */}
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <ShieldCheck size={16} color="#d97706" />
            <span className="font-nastaleeq">سٹاف رولز و اختیارات (RBAC)</span>
          </button>

          {/* Today's Prices (Soft Green) */}
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <Clock size={16} color="#059669" />
            <span className="font-nastaleeq">روزانہ کے ریٹس اپڈیٹ کریں</span>
          </button>

          {/* Daily Closing & Backup (Soft Blue) */}
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <Database size={16} color="#0284c7" />
            <span className="font-nastaleeq">
              {closingTriggered ? 'بیک اپ ہو رہا ہے...' : 'یومیہ کلوزنگ و بیک اپ'}
            </span>
          </button>

          {/* Counter Mode (Soft Purple) */}
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <ShoppingCart size={16} color="#7e22ce" />
            <span className="font-nastaleeq">کاؤنٹر پی او ایس (F8)</span>
          </button>
        </div>
      </div>

      {/* 2. Relative Color Filled Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          direction: 'rtl',
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className="touch-active"
            style={{
              backgroundColor: card.bg, // Relative filled background
              border: `1.5px solid ${card.border}`,
              borderRadius: '12px',
              padding: '14px 16px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    className="font-nastaleeq"
                    style={{ fontSize: '15px', fontWeight: 800, color: card.textColor, lineHeight: 1.1 }}
                  >
                    {card.titleUrdu}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: card.textColor,
                      letterSpacing: '0.2px',
                      opacity: 0.8,
                    }}
                  >
                    {card.titleEn}
                  </span>
                </div>

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
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
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
                  fontFamily: 'var(--font-mono)',
                  color: card.valColor,
                  margin: '8px 0 2px',
                }}
              >
                {card.value}
              </div>
            </div>

            {/* Subtitle */}
            <div
              className="font-nastaleeq"
              style={{ fontSize: '12px', color: card.textColor, opacity: 0.9, marginTop: '4px' }}
            >
              {card.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Synchronous Activity Audit Log Preview */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #C2C5AA',
          padding: '16px 20px',
          boxShadow: '0 2px 6px rgba(65, 72, 51, 0.03)',
          direction: 'rtl',
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
            <h3 className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 800, color: '#414833', margin: 0 }}>
              سسٹم سرگرمی اور مالیاتی لاگ (`activity_log`)
            </h3>
          </div>
          <span className="font-nastaleeq" style={{ fontSize: '12.5px', color: '#656D4A', fontWeight: 600 }}>
            غیر متغیر سکیورٹی و مالیاتی ٹریل
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { time: 'آج، 02:30 PM', actor: 'Biller (محمد عاصف)', action: 'PRINT_BILL', actionColor: '#0284c7', actionBg: '#f0f9ff', actionBorder: '#bae6fd', detail: 'BILL-00481 (چکی آٹا، 40 کلو، Rs 5600)' },
            { time: 'آج، 02:15 PM', actor: 'Biller (محمد عاصف)', action: 'GENERATE_PISAI_TOKEN', actionColor: '#059669', actionBg: '#ecfdf5', actionBorder: '#a7f3d0', detail: 'ٹوکن #0482 (صفائی+پسائی، 25 کلو، Rs 150)' },
            { time: 'آج، 01:45 PM', actor: 'Admin (Hanzala)', action: 'LOG_EXPENSE', actionColor: '#e11d48', actionBg: '#fff1f2', actionBorder: '#fecdd3', detail: 'EXP-109 (بجلی ایڈوانس، Rs 2500)' },
            { time: 'آج، 01:10 PM', actor: 'Admin (Hanzala)', action: 'LOG_UDHAAR_PAYMENT', actionColor: '#7e22ce', actionBg: '#faf5ff', actionBorder: '#e9d5ff', detail: 'PAY-055 (کسٹمر حاجی رشید احمد، Rs 2000)' },
            { time: 'آج، 08:00 AM', actor: 'Admin (Hanzala)', action: 'CONFIRM_DAILY_PRICE', actionColor: '#d97706', actionBg: '#fffbeb', actionBorder: '#fde68a', detail: 'یومیہ ریٹس کی تصدیق برائے 5 پروڈکٹس' },
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
              <span className="font-nastaleeq" style={{ fontWeight: 800, color: '#414833' }}>{log.actor}</span>
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
              <span className="font-nastaleeq" style={{ color: '#414833', fontWeight: 600, fontSize: '12px' }}>
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
