'use strict';
'use client';

import React from 'react';
import {
  ShoppingCart,
  Cog,
  BookUser,
} from 'lucide-react';
import { ShiftKpiCards } from './ShiftKpiCards';
import { ChakkiQueueCard } from './ChakkiQueueCard';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { ReceiptData } from '../ui/ReceiptPreviewModal';

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
  counterId = 'کاؤنٹر #01',
  onNewBill,
  onNewPisaiToken,
  onViewUdhaar,
  onReprintReceipt,
  onViewAllInvoices,
}) => {
  const actionCards = [
    {
      id: 'billing',
      title: 'نیا بل بنائیں',
      hotkey: 'F8',
      icon: <ShoppingCart size={28} />,
      color: '#d97706',
      bgLight: '#fffbeb', // Relative soft amber
      border: '#fde68a',
      onClick: onNewBill,
    },
    {
      id: 'pisai',
      title: 'گندم پسائی ٹوکن',
      hotkey: 'F2',
      icon: <Cog size={28} />,
      color: '#0284c7',
      bgLight: '#f0f9ff', // Relative soft blue
      border: '#bae6fd',
      onClick: onNewPisaiToken,
    },
    {
      id: 'udhaar',
      title: 'ادھار کھاتہ و وصولی',
      hotkey: 'Alt+K',
      icon: <BookUser size={28} />,
      color: '#059669',
      bgLight: '#ecfdf5', // Relative soft green
      border: '#a7f3d0',
      onClick: onViewUdhaar,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px',
      }}
    >
      {/* 1. Biller Welcome & Active Station Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #C2C5AA',
          borderRadius: '14px',
          padding: '14px 20px',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 4px rgba(65, 72, 51, 0.04)',
          direction: 'rtl',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <ShoppingCart size={22} color="#15803d" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                className="font-nastaleeq"
                style={{ fontSize: '19px', fontWeight: 900, color: '#414833', margin: 0 }}
              >
                کاؤنٹر بلر ڈیش بورڈ (Biller Duty Station)
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#f0f9ff',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                }}
              >
                {counterId}
              </span>
            </div>

            <p
              className="font-nastaleeq"
              style={{ fontSize: '13.5px', color: '#656D4A', margin: '2px 0 0 0', fontWeight: 700 }}
            >
              آپریٹر: <strong>{billerName}</strong> • بلنگ اور گندم پسائی ٹوکن سسٹم مکمل فعال ہے
            </p>
          </div>
        </div>

        {/* Live Daily Price Indicator (Read Only for Biller) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '6px 14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700 }} className="font-nastaleeq">
              آٹا ریٹ (20KG)
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
              Rs. 2,150
            </div>
          </div>
          <div style={{ height: '22px', width: '1px', backgroundColor: '#e2e8f0' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700 }} className="font-nastaleeq">
              پسائی فی کلو
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>
              Rs. 8.50
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 3 Relative Color Filled Duty Action Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          width: '100%',
          direction: 'rtl',
        }}
      >
        {actionCards.map((card) => (
          <div
            key={card.id}
            className="touch-active"
            onClick={card.onClick}
            style={{
              backgroundColor: card.bgLight, // Relative filled background
              borderRadius: '12px',
              border: `1.5px solid ${card.border}`,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Right: Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                  border: `1px solid ${card.border}`,
                }}
              >
                {card.icon}
              </div>

              <div>
                <h2
                  className="font-nastaleeq"
                  style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color:
                      card.color === '#d97706'
                        ? '#92400e'
                        : card.color === '#0284c7'
                        ? '#075985'
                        : '#065f46',
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {card.title}
                </h2>
              </div>
            </div>

            {/* Left: Hotkey Badge */}
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: card.color,
                border: `1px solid ${card.border}`,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              {card.hotkey}
            </span>
          </div>
        ))}
      </div>

      {/* 3. Relative Color Filled Key Metrics Row */}
      <ShiftKpiCards
        todaySales={184500}
        creditRecovery={42000}
        todayPisaiKg={1250}
        cashDrawerBalance={126500}
        onCardClick={(metric) => {
          if (metric === 'sales') onNewBill();
          else if (metric === 'pisai') onNewPisaiToken();
          else if (metric === 'recovery') onViewUdhaar();
        }}
      />

      {/* 4. Operational Queue & Invoices */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px',
          alignItems: 'stretch',
        }}
      >
        <ChakkiQueueCard />
        <RecentInvoicesTable
          onReprint={onReprintReceipt}
          onViewAllInvoices={onViewAllInvoices}
        />
      </div>
    </div>
  );
};
