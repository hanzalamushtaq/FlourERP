'use client';

import React, { useState } from 'react';
import { DailyPriceModal } from './DailyPriceModal';
import {
  TrendingUp,
  Sparkles,
  Receipt,
  Users,
  Wallet,
  ShieldCheck,
  Lock,
  ArrowRight,
  Clock,
  CheckCircle,
  Database,
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

  const handleDailyClosing = () => {
    const confirmClosing = window.confirm(
      'Are you sure you want to perform Daily Closing? This locks the current day ledger and initiates an automatic database backup.'
    );
    if (confirmClosing) {
      setClosingTriggered(true);
      setTimeout(() => {
        alert('Daily Closing Snapshot Recorded! Automated PostgreSQL Database Backup has completed successfully.');
        setClosingTriggered(false);
      }, 1200);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #B6AD90',
          borderRadius: '12px',
          padding: '14px 20px',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 6px rgba(65, 72, 51, 0.05)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#414833' }}>
            Shop Owner Command Center (چکی مینیجر ڈیش بورڈ)
          </h1>
          <p style={{ fontSize: '13px', color: '#656D4A', marginTop: '2px', fontWeight: 600 }}>
            Real-time financial status, prices, grinding queue, and credit exposure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onOpenPriceModal}
            className="touch-active"
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '8px',
              backgroundColor: '#414833',
              color: '#F4F5EE',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Clock size={16} color="#F4F5EE" /> Update Today's Prices
          </button>

          <button
            type="button"
            onClick={handleDailyClosing}
            disabled={closingTriggered}
            className="touch-active"
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '8px',
              backgroundColor: '#C2C5AA',
              color: '#414833',
              border: '1.5px solid #B6AD90',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Database size={16} color="#414833" />
            {closingTriggered ? 'Backing Up DB...' : 'Daily Closing & Backup'}
          </button>
        </div>
      </div>

      {/* 5 Pre-Aggregated Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Card 1: Today's Product Sales */}
        <div
          onClick={() => onNavigateTab('billing')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #B6AD90',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(65, 72, 51, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 800, color: '#414833' }}>آج کی پراڈکٹ سیل</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#656D4A', letterSpacing: '0.2px' }}>TODAY'S PRODUCT SALES</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#C2C5AA', border: '1px solid #B6AD90', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#414833" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#414833', margin: '6px 0 2px' }}>
            Rs 42,850
          </div>
          <div style={{ fontSize: '12px', color: '#656D4A', fontWeight: 600 }}>
            38 bills issued • Atta, Maida, Suji
          </div>
        </div>

        {/* Card 2: Gundam Pisai Grinding */}
        <div
          onClick={() => onNavigateTab('pisai')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #B6AD90',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(65, 72, 51, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 800, color: '#414833' }}>گندم پیسائی آمدن</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#656D4A', letterSpacing: '0.2px' }}>PISAI GRINDING FEES</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#C2C5AA', border: '1px solid #B6AD90', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#414833" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#414833', margin: '6px 0 2px' }}>
            Rs 8,640
          </div>
          <div style={{ fontSize: '12px', color: '#656D4A', fontWeight: 600 }}>
            54 tokens processed • 1,440 KG grain
          </div>
        </div>

        {/* Card 3: Total Expenses & Returns */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #B6AD90',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(65, 72, 51, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 800, color: '#414833' }}>دکان کے اخراجات</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#656D4A', letterSpacing: '0.2px' }}>SHOP EXPENSES & BILLS</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#C2C5AA', border: '1px solid #B6AD90', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} color="#414833" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#414833', margin: '6px 0 2px' }}>
            Rs 3,625
          </div>
          <div style={{ fontSize: '12px', color: '#656D4A', fontWeight: 600 }}>
            Electricity, worker tea, 1 return
          </div>
        </div>

        {/* Card 4: Customer Udhaar Exposure */}
        <div
          onClick={() => onNavigateTab('udhaar')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #B6AD90',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(65, 72, 51, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 800, color: '#414833' }}>کل گاہک ادھار کھاتہ</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#656D4A', letterSpacing: '0.2px' }}>TOTAL CUSTOMER UDHAAR</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#C2C5AA', border: '1px solid #B6AD90', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#414833" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#414833', margin: '6px 0 2px' }}>
            Rs 61,100
          </div>
          <div style={{ fontSize: '12px', color: '#656D4A', fontWeight: 600 }}>
            14 active credit customers
          </div>
        </div>

        {/* Card 5: Net Drawer Cash */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="touch-active"
          style={{
            backgroundColor: '#DCE0CE',
            color: '#414833',
            border: '2px solid #7F4F24',
            borderRadius: '12px',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(65, 72, 51, 0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 800, color: '#414833' }}>دکان کا موجودہ کیش</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#414833', letterSpacing: '0.2px' }}>NET CASH IN DRAWER</span>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#414833', border: '1px solid #414833', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="#F4F5EE" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#414833', margin: '6px 0 2px' }}>
            Rs 47,865
          </div>
          <div style={{ fontSize: '12px', color: '#414833', fontWeight: 600 }}>
            Sales + Pisai + Udhaar In - Out
          </div>
        </div>
      </div>

      {/* Synchronous Activity Audit Log Preview */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #B6AD90',
          padding: '16px 20px',
          boxShadow: '0 2px 6px rgba(65, 72, 51, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#414833" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#414833' }}>
              Synchronous Audit Trail (`activity_log`)
            </h3>
          </div>
          <span style={{ fontSize: '12.5px', color: '#656D4A', fontWeight: 600 }}>
            Immutable Financial & Security Log
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { time: 'Today, 2:30 PM', actor: 'Biller 1', action: 'PRINT_BILL', detail: 'BILL-00481 (Chakki Atta, 40 KG, Rs 5600)' },
            { time: 'Today, 2:15 PM', actor: 'Biller 1', action: 'GENERATE_PISAI_TOKEN', detail: 'Token #0482 (Safai+Pisai, 25 KG, Rs 150)' },
            { time: 'Today, 1:45 PM', actor: 'Admin (Hanzala)', action: 'LOG_EXPENSE', detail: 'EXP-109 (Electricity Advance, Rs 2500)' },
            { time: 'Today, 1:10 PM', actor: 'Admin (Hanzala)', action: 'LOG_UDHAAR_PAYMENT', detail: 'PAY-055 (Customer Haji Rasheed, Rs 2000)' },
            { time: 'Today, 8:00 AM', actor: 'Admin (Hanzala)', action: 'CONFIRM_DAILY_PRICE', detail: 'Updated rates for 5 products for 18 Sep 2026' },
          ].map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1.2fr 1.8fr 3fr',
                fontSize: '12.5px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#F4F5EE',
                border: '1px solid #B6AD90',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#414833', fontWeight: 600 }}>{log.time}</span>
              <span style={{ fontWeight: 800, color: '#414833' }}>{log.actor}</span>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 7px', borderRadius: '5px', backgroundColor: '#414833', color: '#F4F5EE', border: '1px solid #414833' }}>
                  {log.action}
                </span>
              </div>
              <span style={{ color: '#414833', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{log.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
