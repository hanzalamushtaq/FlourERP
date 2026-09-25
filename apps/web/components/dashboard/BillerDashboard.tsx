'use strict';
'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { ShiftKpiCards } from './ShiftKpiCards';
import { ChakkiQueueCard } from './ChakkiQueueCard';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { ReceiptData } from '../ui/ReceiptPreviewModal';
import { useLanguage } from '../../context/LanguageContext';

// 1. Receipt Printer SVG Illustration matching reference image
const ReceiptPrinterIcon = () => (
  <svg width="58" height="50" viewBox="0 0 58 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Printer Body */}
    <rect x="5" y="17" width="48" height="23" rx="4" fill="#C99462" stroke="#4A2810" strokeWidth="2.5" />
    {/* Printer Top Slot */}
    <rect x="13" y="7" width="32" height="13" rx="2" fill="#FFFFFF" stroke="#4A2810" strokeWidth="2.5" />
    {/* Top Paper Lines */}
    <line x1="17" y1="11" x2="35" y2="11" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="17" y1="15" x2="29" y2="15" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    {/* Paper Feed coming out */}
    <path d="M15 25V42L20 39.5L25 42L29 39.5L34 42L38 39.5L43 42V25" fill="#FFFFFF" stroke="#4A2810" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Paper detail lines */}
    <line x1="19" y1="30" x2="39" y2="30" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="19" y1="34" x2="33" y2="34" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 2. Chakki / Flour Mill Machine SVG Illustration matching reference image
const ChakkiGrinderIcon = () => (
  <svg width="54" height="50" viewBox="0 0 54 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top Hopper Funnel */}
    <polygon points="13,6 41,6 34,17 20,17" fill="#C99462" stroke="#4A2810" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Grinding Chamber Body */}
    <rect x="16" y="17" width="22" height="17" rx="2" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.5" />
    <circle cx="27" cy="25" r="4" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
    {/* Side Crank Handle */}
    <path d="M38 21H45V29H38" stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="45" cy="25" r="2.5" fill="#4A2810" />
    {/* Base Stand & Outlet Tray */}
    <polygon points="12,34 42,34 46,44 8,44" fill="#C99462" stroke="#4A2810" strokeWidth="2.5" strokeLinejoin="round" />
    <line x1="16" y1="39" x2="38" y2="39" stroke="#4A2810" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 3. Khata Ledger Book & Coins SVG Illustration matching reference image
const KhataBookIcon = () => (
  <svg width="58" height="50" viewBox="0 0 58 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Open Book */}
    <path d="M7 10C13 8 19 8 25 11C31 8 37 8 43 10V35C37 33 31 33 25 36C19 33 13 33 7 35V10Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.5" strokeLinejoin="round" />
    <line x1="25" y1="11" x2="25" y2="36" stroke="#4A2810" strokeWidth="2.5" />
    {/* Bookmark ribbon */}
    <path d="M11 8V17L14 14L17 17V8" fill="#C99462" stroke="#4A2810" strokeWidth="1.8" />
    {/* Page text lines */}
    <line x1="13" y1="21" x2="21" y2="21" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="13" y1="26" x2="21" y2="26" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="29" y1="17" x2="37" y2="17" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="29" y1="22" x2="37" y2="22" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    {/* Stack of coins on right */}
    <g transform="translate(35, 27)">
      <ellipse cx="9" cy="5" rx="7.5" ry="3" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
      <path d="M1.5 5V8.5C1.5 10.2 4.8 11.5 9 11.5C13.2 11.5 16.5 10.2 16.5 8.5V5" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
      <path d="M1.5 8.5V12C1.5 13.7 4.8 15 9 15C13.2 15 16.5 13.7 16.5 12V8.5" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
    </g>
  </svg>
);

interface BillerDashboardProps {
  billerName?: string;
  counterId?: string;
  onNewBill: () => void;
  onNewPisaiToken: () => void;
  onViewUdhaar: () => void;
  onReprintReceipt: (receipt: ReceiptData) => void;
  onViewAllInvoices?: () => void;
}

export const BillerDashboard: React.FC<BillerDashboardProps> = ({
  billerName = 'محمد عاصف',
  counterId = '01',
  onNewBill,
  onNewPisaiToken,
  onViewUdhaar,
  onReprintReceipt,
  onViewAllInvoices,
}) => {
  const { isUrdu, t } = useLanguage();
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  const [pressedCard, setPressedCard] = React.useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px 16px 24px 16px',
      }}
    >
      {/* Top 3 Action Cards (Responsive on Mobile) */}
      <div className="dashboard-3-action-cards">
        {/* Card 1: Create New Bill */}
        <div
          onClick={onNewBill}
          onMouseEnter={() => setHoveredCard('billing')}
          onMouseLeave={() => {
            setHoveredCard(null);
            setPressedCard(null);
          }}
          onMouseDown={() => setPressedCard('billing')}
          onMouseUp={() => setPressedCard(null)}
          onTouchStart={() => setPressedCard('billing')}
          onTouchEnd={() => setPressedCard(null)}
          className="touch-active"
          style={{
            background: '#1877F2',
            borderRadius: '16px',
            border: 'none',
            outline: 'none',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            boxShadow: 'none',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform:
              pressedCard === 'billing'
                ? 'scale(0.975) translateY(1px)'
                : hoveredCard === 'billing'
                  ? 'translateY(-4px)'
                  : 'none',
          }}
        >
          {/* Left: White Squircle Icon Tile */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: 'none',
              flexShrink: 0,
              transition: 'transform 0.25s ease',
              transform: hoveredCard === 'billing' ? 'scale(1.08) rotate(-1.5deg)' : 'scale(1)',
            }}
          >
            <ReceiptPrinterIcon />
          </div>

          {/* Right Text */}
          <div style={{ textAlign: isUrdu ? 'right' : 'left', display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-end' : 'flex-start' }}>
            <h2
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: isUrdu ? '28px' : '20px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {t('نیا بل بنائیں', 'Create New Bill')}
            </h2>
          </div>
        </div>

        {/* Card 2: Milling Token */}
        <div
          onClick={onNewPisaiToken}
          onMouseEnter={() => setHoveredCard('pisai')}
          onMouseLeave={() => {
            setHoveredCard(null);
            setPressedCard(null);
          }}
          onMouseDown={() => setPressedCard('pisai')}
          onMouseUp={() => setPressedCard(null)}
          onTouchStart={() => setPressedCard('pisai')}
          onTouchEnd={() => setPressedCard(null)}
          className="touch-active"
          style={{
            background: '#D97706',
            borderRadius: '16px',
            border: 'none',
            outline: 'none',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            boxShadow: 'none',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform:
              pressedCard === 'pisai'
                ? 'scale(0.975) translateY(1px)'
                : hoveredCard === 'pisai'
                  ? 'translateY(-4px)'
                  : 'none',
          }}
        >
          {/* Left: White Squircle Icon Tile */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: 'none',
              flexShrink: 0,
              transition: 'transform 0.25s ease',
              transform: hoveredCard === 'pisai' ? 'scale(1.08) rotate(1.5deg)' : 'scale(1)',
            }}
          >
            <ChakkiGrinderIcon />
          </div>

          {/* Right Text */}
          <div style={{ textAlign: isUrdu ? 'right' : 'left', display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-end' : 'flex-start' }}>
            <h2
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: isUrdu ? '28px' : '20px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {t('گندم پسائی ٹوکن', 'Milling Token')}
            </h2>
          </div>
        </div>

        {/* Card 3: Customer Ledger */}
        <div
          onClick={onViewUdhaar}
          onMouseEnter={() => setHoveredCard('udhaar')}
          onMouseLeave={() => {
            setHoveredCard(null);
            setPressedCard(null);
          }}
          onMouseDown={() => setPressedCard('udhaar')}
          onMouseUp={() => setPressedCard(null)}
          onTouchStart={() => setPressedCard('udhaar')}
          onTouchEnd={() => setPressedCard(null)}
          className="touch-active"
          style={{
            background: '#0E8A54',
            borderRadius: '16px',
            border: 'none',
            outline: 'none',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            boxShadow: 'none',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform:
              pressedCard === 'udhaar'
                ? 'scale(0.975) translateY(1px)'
                : hoveredCard === 'udhaar'
                  ? 'translateY(-4px)'
                  : 'none',
          }}
        >
          {/* Left: White Squircle Icon Tile */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: 'none',
              flexShrink: 0,
              transition: 'transform 0.25s ease',
              transform: hoveredCard === 'udhaar' ? 'scale(1.08) rotate(-1.5deg)' : 'scale(1)',
            }}
          >
            <KhataBookIcon />
          </div>

          {/* Right Text */}
          <div style={{ textAlign: isUrdu ? 'right' : 'left', display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-end' : 'flex-start' }}>
            <h2
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: isUrdu ? '28px' : '20px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {t('ادھار کھاتے و وصولی', 'Customer Ledger')}
            </h2>
          </div>
        </div>
      </div>

      {/* 3. Key Metrics Single Card with 4 Compartments matching reference image */}
      <ShiftKpiCards
        todaySales={145890}
        creditRecovery={25500}
        todayPisaiKg={12340}
        cashDrawerBalance={183730}
        onCardClick={(metric) => {
          if (metric === 'sales') onNewBill();
          else if (metric === 'pisai') onNewPisaiToken();
          else if (metric === 'recovery') onViewUdhaar();
          else if (metric === 'drawer') onViewAllInvoices?.();
        }}
      />

      {/* 4. Operational Queue & Invoices Tables with Balanced Widths */}
      <div className="dashboard-tables-grid">
        <ChakkiQueueCard />
        <RecentInvoicesTable
          onReprint={onReprintReceipt}
          onViewAllInvoices={onViewAllInvoices}
        />
      </div>
    </div>
  );
};
