'use strict';
'use client';

import React from 'react';
import { ShoppingCart, Cog, Tag, Plus, Printer, Edit3 } from 'lucide-react';

interface HeroActionCardsProps {
  onNewBill: () => void;
  onNewPisaiToken: () => void;
  onEditRates: () => void;
  todayBillsCount?: number;
  activePisaiTokensCount?: number;
  ratesLastUpdated?: string;
}

export const HeroActionCards: React.FC<HeroActionCardsProps> = ({
  onNewBill,
  onNewPisaiToken,
  onEditRates,
  todayBillsCount = 142,
  activePisaiTokensCount = 28,
  ratesLastUpdated = '09:00 AM',
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        width: '100%',
        direction: 'rtl',
      }}
    >
      {/* Card 1: New Sales Bill [F8] */}
      <div
        className="touch-active"
        onClick={onNewBill}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #f59e0b',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Header: Hotkey Tag & Icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingCart size={24} />
          </div>

          <div
            style={{
              border: '1px dashed #f59e0b',
              backgroundColor: '#fffbeb',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: '#b45309',
            }}
          >
            Hotkey: [F8]
          </div>
        </div>

        {/* Center: Title & Subtitle */}
        <div style={{ margin: '14px 0 16px' }}>
          <h2
            className="font-nastaleeq"
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.3,
            }}
          >
            نیا سیلز بل بنائیں
          </h2>
          <div
            className="font-nastaleeq"
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              marginTop: '4px',
            }}
          >
            {todayBillsCount} بل آج جاری ہوئے
          </div>
        </div>

        {/* Bottom Button */}
        <div>
          <button
            type="button"
            className="touch-active"
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #fde68a',
              backgroundColor: '#fffbeb',
              color: '#b45309',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            <span className="font-nastaleeq" style={{ fontSize: '15px' }}>
              بل بنائیں +
            </span>
          </button>
        </div>
      </div>

      {/* Card 2: Gundam Pisai & Fee Entry [F2] */}
      <div
        className="touch-active"
        onClick={onNewPisaiToken}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #cbd5e1',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Header: Hotkey Tag & Icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cog size={24} />
          </div>

          <div
            style={{
              border: '1px dashed #94a3b8',
              backgroundColor: '#f8fafc',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: '#475569',
            }}
          >
            Hotkey: [F2]
          </div>
        </div>

        {/* Center: Title & Subtitle */}
        <div style={{ margin: '14px 0 16px' }}>
          <h2
            className="font-nastaleeq"
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.3,
            }}
          >
            گندم پسائی و اجرت انٹری
          </h2>
          <div
            className="font-nastaleeq"
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              marginTop: '4px',
            }}
          >
            {activePisaiTokensCount} ٹوکن فعال (جاری)
          </div>
        </div>

        {/* Bottom Button */}
        <div>
          <button
            type="button"
            className="touch-active"
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#334155',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Printer size={16} />
            <span className="font-nastaleeq" style={{ fontSize: '15px' }}>
              ٹوکن جاری کریں 🖨
            </span>
          </button>
        </div>
      </div>

      {/* Card 3: Daily Price List & Rates [F3] */}
      <div
        className="touch-active"
        onClick={onEditRates}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #10b981',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Header: Hotkey Tag & Icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tag size={24} />
          </div>

          <div
            style={{
              border: '1px dashed #10b981',
              backgroundColor: '#f0fdf4',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: '#047857',
            }}
          >
            Hotkey: [F3]
          </div>
        </div>

        {/* Center: Title & Subtitle */}
        <div style={{ margin: '14px 0 16px' }}>
          <h2
            className="font-nastaleeq"
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.3,
            }}
          >
            روزانہ نرخ نامہ و ریٹ لسٹ
          </h2>
          <div
            className="font-nastaleeq"
            style={{
              fontSize: '13px',
              color: '#94a3b8',
              marginTop: '4px',
            }}
          >
            اپ ڈیٹ: {ratesLastUpdated}
          </div>
        </div>

        {/* Bottom Button */}
        <div>
          <button
            type="button"
            className="touch-active"
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #a7f3d0',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Edit3 size={15} />
            <span className="font-nastaleeq" style={{ fontSize: '15px' }}>
              ریٹس ایڈٹ کریں 📝
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
