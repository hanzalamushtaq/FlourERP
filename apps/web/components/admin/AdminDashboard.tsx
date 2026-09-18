
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '2px solid #C2BAAA',
          borderRadius: '16px',
          padding: '18px 24px',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(27, 30, 19, 0.06)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1B1E13' }}>
            Shop Owner Command Center (Ãšâ€ ÃšÂ©Ã›Å’ Ã™â€¦Ã›Å’Ã™â€ Ã›Å’Ã˜Â¬Ã˜Â± ÃšË†Ã›Å’Ã˜Â´ Ã˜Â¨Ã™Ë†Ã˜Â±ÃšË†)
          </h1>
          <p style={{ fontSize: '13px', color: '#1B1E13', marginTop: '2px', fontWeight: 600 }}>
            Real-time financial status, prices, grinding queue, and credit exposure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onOpenPriceModal}
            className="touch-active"
            style={{
              height: '44px',
              padding: '0 16px',
              borderRadius: '10px',
              backgroundColor: '#E8AC65',
              color: '#1B1E13',
              border: '2px solid #5E6348',
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={18} color="#1B1E13" /> Update Today's Prices
          </button>

          <button
            type="button"
            onClick={handleDailyClosing}
            disabled={closingTriggered}
            className="touch-active"
            style={{
              height: '44px',
              padding: '0 16px',
              borderRadius: '10px',
              backgroundColor: '#5E6348',
              color: '#FFFFFF',
              border: '2px solid #5E6348',
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Database size={18} color="#FFFFFF" />
            {closingTriggered ? 'Backing Up DB...' : 'Daily Closing & Backup'}
          </button>
        </div>
      </div>

      {/* 5 Pre-Aggregated Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Card 1: Today's Product Sales */}
        <div
          onClick={() => onNavigateTab('billing')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #C2BAAA',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(27, 30, 19, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13' }}>
              TODAY'S PRODUCT SALES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F4F1EA', border: '1.5px solid #C2BAAA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#1B1E13" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#1B1E13', margin: '8px 0 2px' }}>
            Rs 42,850
          </div>
          <div style={{ fontSize: '11px', color: '#1B1E13', fontWeight: 600 }}>
            38 bills issued Ã¢â‚¬Â¢ Atta, Maida, Suji
          </div>
        </div>

        {/* Card 2: Gundam Pisai Grinding */}
        <div
          onClick={() => onNavigateTab('pisai')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #C2BAAA',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(27, 30, 19, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13' }}>
              PISAI (GRINDING) FEES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F4F1EA', border: '1.5px solid #C2BAAA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#1B1E13" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#1B1E13', margin: '8px 0 2px' }}>
            Rs 8,640
          </div>
          <div style={{ fontSize: '11px', color: '#1B1E13', fontWeight: 600 }}>
            54 tokens processed Ã¢â‚¬Â¢ 1,440 KG grain
          </div>
        </div>

        {/* Card 3: Total Expenses & Returns */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #C2BAAA',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(27, 30, 19, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13' }}>
              SHOP EXPENSES & VOIDS
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F4F1EA', border: '1.5px solid #C2BAAA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} color="#1B1E13" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#1B1E13', margin: '8px 0 2px' }}>
            Rs 3,625
          </div>
          <div style={{ fontSize: '11px', color: '#1B1E13', fontWeight: 600 }}>
            Electricity, worker tea, 1 return
          </div>
        </div>

        {/* Card 4: Customer Udhaar Exposure */}
        <div
          onClick={() => onNavigateTab('udhaar')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #C2BAAA',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(27, 30, 19, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13' }}>
              CUSTOMER UDHAAR (Ã˜Â§Ã˜Â¯ÃšÂ¾Ã˜Â§Ã˜Â±)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F4F1EA', border: '1.5px solid #C2BAAA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#1B1E13" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#1B1E13', margin: '8px 0 2px' }}>
            Rs 61,100
          </div>
          <div style={{ fontSize: '11px', color: '#1B1E13', fontWeight: 600 }}>
            14 active credit customers
          </div>
        </div>

        {/* Card 5: Net Drawer Cash */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="touch-active"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#1B1E13',
            border: '2px solid #C2BAAA',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(27, 30, 19, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13' }}>
              NET CASH IN DRAWER
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#5E6348', border: '1px solid #5E6348', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="#1B1E13" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#1B1E13', margin: '8px 0 2px' }}>
            Rs 47,865
          </div>
          <div style={{ fontSize: '11px', color: '#1B1E13', fontWeight: 600 }}>
            Sales + Pisai + Udhaar In - Out
          </div>
        </div>
      </div>

      {/* Synchronous Activity Audit Log Preview */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #C2BAAA',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(121, 125, 98, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#1B1E13" />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1B1E13' }}>
              Synchronous Audit Trail (`activity_log`)
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#1B1E13', fontWeight: 700 }}>
            Immutable Financial & Security Log
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                fontSize: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#F8FAF8',
                border: '1.5px solid #E2DDD3',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#1B1E13', fontWeight: 600 }}>{log.time}</span>
              <span style={{ fontWeight: 800, color: '#1B1E13' }}>{log.actor}</span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#5E6348', color: '#FFFFFF', border: '1px solid #5E6348' }}>
                  {log.action}
                </span>
              </div>
              <span style={{ color: '#1B1E13', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{log.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

