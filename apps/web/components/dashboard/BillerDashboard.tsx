'use strict';
'use client';

import React from 'react';
import {
  ShoppingCart,
  Cog,
  BookUser,
  Clock,
  Printer,
  Receipt,
  Scale,
  DollarSign,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';
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
          boxShadow: '0 2px 4px rgba(65, 72, 51, 0.06)',
          direction: 'rtl',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#656D4A', // Olive Green
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(101, 109, 74, 0.25)',
            }}
          >
            <ShoppingCart size={22} />
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
                  backgroundColor: '#E8EAE0',
                  color: '#414833',
                  border: '1px solid #C2C5AA',
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
            backgroundColor: '#F4F5EE',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '8px 14px',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700 }}>آج کا آٹا ریٹ (20KG)</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#7F4F24', fontFamily: 'var(--font-mono)' }}>
              Rs. 2,150
            </div>
          </div>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#CBD5E1' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700 }}>پسائی ریٹ فی کلو</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#656D4A', fontFamily: 'var(--font-mono)' }}>
              Rs. 8.50
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 3 Main Duty Action Cards (Designed for touch-friendly rapid counter work) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          direction: 'rtl',
        }}
      >
        {/* Duty 1: Sales Billing (F8) */}
        <button
          type="button"
          onClick={onNewBill}
          className="touch-active"
          style={{
            backgroundColor: '#7F4F24', // Warm Timber Primary
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '130px',
            boxShadow: '0 4px 10px rgba(127, 79, 36, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCart size={22} color="#FFFFFF" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#5E3615',
                color: '#F4F5EE',
              }}
            >
              F8
            </span>
          </div>

          <div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '19px', fontWeight: 900, color: '#FFFFFF' }}
            >
              نیا سیلز بل بنائیں
            </div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '12.5px', color: '#E8EAE0', marginTop: '2px' }}
            >
              آٹا، میدہ، سوجی اور چوکر کی نقد و ادھار فروخت
            </div>
          </div>
        </button>

        {/* Duty 2: Pisai Token Intake (F2) */}
        <button
          type="button"
          onClick={onNewPisaiToken}
          className="touch-active"
          style={{
            backgroundColor: '#656D4A', // Olive Green
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '130px',
            boxShadow: '0 4px 10px rgba(101, 109, 74, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cog size={22} color="#FFFFFF" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#414833',
                color: '#F4F5EE',
              }}
            >
              F2
            </span>
          </div>

          <div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '19px', fontWeight: 900, color: '#FFFFFF' }}
            >
              گندم پسائی ٹوکن جاری کریں
            </div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '12.5px', color: '#E8EAE0', marginTop: '2px' }}
            >
              کسٹمر گندم وصولی، وزن اندراج اور چکی ٹوکن پرنٹ
            </div>
          </div>
        </button>

        {/* Duty 3: Customer Udhaar Ledger (Alt+K) */}
        <button
          type="button"
          onClick={onViewUdhaar}
          className="touch-active"
          style={{
            backgroundColor: '#414833', // Deep Forest Olive
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '130px',
            boxShadow: '0 4px 10px rgba(65, 72, 51, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookUser size={22} color="#FFFFFF" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#282E20',
                color: '#F4F5EE',
              }}
            >
              Alt+K
            </span>
          </div>

          <div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '19px', fontWeight: 900, color: '#FFFFFF' }}
            >
              ادھار کھاتہ و کیش وصولی
            </div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '12.5px', color: '#E8EAE0', marginTop: '2px' }}
            >
              کسٹمر بقایا جات چیک کریں اور ادائیگی ریکارڈ کریں
            </div>
          </div>
        </button>
      </div>

      {/* 3. Biller Shift KPIs Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          direction: 'rtl',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #C2C5AA',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#F4F5EE',
              color: '#7F4F24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #C2C5AA',
            }}
          >
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#656D4A', fontWeight: 700 }} className="font-nastaleeq">
              کاؤنٹر کیش دراز (Cash in Drawer)
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#414833', fontFamily: 'var(--font-mono)' }}>
              Rs. 126,500
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #C2C5AA',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#F4F5EE',
              color: '#656D4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #C2C5AA',
            }}
          >
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#656D4A', fontWeight: 700 }} className="font-nastaleeq">
              آج جاری کردہ بلز (Shift Invoices)
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#414833', fontFamily: 'var(--font-mono)' }}>
              48 بلز
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #C2C5AA',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#F4F5EE',
              color: '#414833',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #C2C5AA',
            }}
          >
            <Scale size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#656D4A', fontWeight: 700 }} className="font-nastaleeq">
              آج کی پسائی گندم (Grinding Weight)
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#414833', fontFamily: 'var(--font-mono)' }}>
              1,250 کلوگرام
            </div>
          </div>
        </div>
      </div>

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
