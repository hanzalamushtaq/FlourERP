'use strict';
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
          backgroundColor: 'var(--wheat-50)',
          border: '1.5px solid var(--wheat-300)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--wheat-700)' }}>
            Shop Owner Command Center (چکی مینیجر ڈیش بورڈ)
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
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
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--wheat-600)',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={18} /> Update Today's Prices
          </button>

          <button
            type="button"
            onClick={handleDailyClosing}
            disabled={closingTriggered}
            className="touch-active"
            style={{
              height: '44px',
              padding: '0 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: closingTriggered ? 'var(--emerald-600)' : '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Database size={18} />
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
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              TODAY'S PRODUCT SALES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#15803d" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#15803d', margin: '8px 0 2px' }}>
            Rs 42,850
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            38 bills issued • Atta, Maida, Suji
          </div>
        </div>

        {/* Card 2: Gundam Pisai Grinding */}
        <div
          onClick={() => onNavigateTab('pisai')}
          className="touch-active"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              PISAI (GRINDING) FEES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#b45309" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#b45309', margin: '8px 0 2px' }}>
            Rs 8,640
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            54 tokens processed • 1,440 KG grain
          </div>
        </div>

        {/* Card 3: Total Expenses & Returns */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="touch-active"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              SHOP EXPENSES & VOIDS
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} color="#b91c1c" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#b91c1c', margin: '8px 0 2px' }}>
            Rs 3,625
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Electricity, worker tea, 1 return
          </div>
        </div>

        {/* Card 4: Customer Udhaar Exposure */}
        <div
          onClick={() => onNavigateTab('udhaar')}
          className="touch-active"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              CUSTOMER UDHAAR (ادھار)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#b45309', margin: '8px 0 2px' }}>
            Rs 61,100
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            14 active credit customers
          </div>
        </div>

        {/* Card 5: Net Drawer Cash */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="touch-active"
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
              NET CASH IN DRAWER
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#38bdf8', margin: '8px 0 2px' }}>
            Rs 47,865
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Sales + Pisai + Udhaar In - Out
          </div>
        </div>
      </div>

      {/* Synchronous Activity Audit Log Preview */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-subtle)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--emerald-600)" />
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
              Synchronous Audit Trail (`activity_log`)
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
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
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{log.time}</span>
              <span style={{ fontWeight: 700 }}>{log.actor}</span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}>
                  {log.action}
                </span>
              </div>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{log.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
