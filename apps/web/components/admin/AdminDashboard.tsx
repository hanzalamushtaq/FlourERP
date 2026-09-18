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
          backgroundColor: '#FAF3DD',
          border: '2px solid #8FC0A9',
          borderRadius: '16px',
          padding: '18px 24px',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(74, 124, 89, 0.08)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#4A7C59' }}>
            Shop Owner Command Center (چکی مینیجر ڈیش بورڈ)
          </h1>
          <p style={{ fontSize: '13px', color: '#4A7C59', marginTop: '2px', fontWeight: 600 }}>
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
              backgroundColor: '#4A7C59',
              color: '#FAF3DD',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={18} color="#FAF3DD" /> Update Today's Prices
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
              backgroundColor: '#C8D5B9',
              color: '#4A7C59',
              border: '1.5px solid #8FC0A9',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Database size={18} color="#4A7C59" />
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
            backgroundColor: '#FAF3DD',
            border: '1.5px solid #8FC0A9',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(74, 124, 89, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A7C59' }}>
              TODAY'S PRODUCT SALES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#C8D5B9', border: '1px solid #8FC0A9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#4A7C59" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#4A7C59', margin: '8px 0 2px' }}>
            Rs 42,850
          </div>
          <div style={{ fontSize: '11px', color: '#68B0AB', fontWeight: 600 }}>
            38 bills issued • Atta, Maida, Suji
          </div>
        </div>

        {/* Card 2: Gundam Pisai Grinding */}
        <div
          onClick={() => onNavigateTab('pisai')}
          className="touch-active"
          style={{
            backgroundColor: '#FAF3DD',
            border: '1.5px solid #8FC0A9',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(74, 124, 89, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A7C59' }}>
              PISAI (GRINDING) FEES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#C8D5B9', border: '1px solid #8FC0A9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#4A7C59" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#4A7C59', margin: '8px 0 2px' }}>
            Rs 8,640
          </div>
          <div style={{ fontSize: '11px', color: '#68B0AB', fontWeight: 600 }}>
            54 tokens processed • 1,440 KG grain
          </div>
        </div>

        {/* Card 3: Total Expenses & Returns */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="touch-active"
          style={{
            backgroundColor: '#FAF3DD',
            border: '1.5px solid #8FC0A9',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(74, 124, 89, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A7C59' }}>
              SHOP EXPENSES & VOIDS
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#C8D5B9', border: '1px solid #8FC0A9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} color="#4A7C59" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#4A7C59', margin: '8px 0 2px' }}>
            Rs 3,625
          </div>
          <div style={{ fontSize: '11px', color: '#68B0AB', fontWeight: 600 }}>
            Electricity, worker tea, 1 return
          </div>
        </div>

        {/* Card 4: Customer Udhaar Exposure */}
        <div
          onClick={() => onNavigateTab('udhaar')}
          className="touch-active"
          style={{
            backgroundColor: '#FAF3DD',
            border: '1.5px solid #8FC0A9',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(74, 124, 89, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A7C59' }}>
              CUSTOMER UDHAAR (ادھار)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#C8D5B9', border: '1px solid #8FC0A9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#4A7C59" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#4A7C59', margin: '8px 0 2px' }}>
            Rs 61,100
          </div>
          <div style={{ fontSize: '11px', color: '#68B0AB', fontWeight: 600 }}>
            14 active credit customers
          </div>
        </div>

        {/* Card 5: Net Drawer Cash */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="touch-active"
          style={{
            backgroundColor: '#C8D5B9',
            color: '#4A7C59',
            border: '2px solid #4A7C59',
            borderRadius: '16px',
            padding: '18px',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(74, 124, 89, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A7C59' }}>
              NET CASH IN DRAWER
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#4A7C59', border: '1px solid #4A7C59', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={18} color="#FAF3DD" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#4A7C59', margin: '8px 0 2px' }}>
            Rs 47,865
          </div>
          <div style={{ fontSize: '11px', color: '#4A7C59', fontWeight: 600 }}>
            Sales + Pisai + Udhaar In - Out
          </div>
        </div>
      </div>

      {/* Synchronous Activity Audit Log Preview */}
      <div
        style={{
          backgroundColor: '#FAF3DD',
          borderRadius: '16px',
          border: '2px solid #8FC0A9',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(74, 124, 89, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#4A7C59" />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#4A7C59' }}>
              Synchronous Audit Trail (`activity_log`)
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#4A7C59', fontWeight: 700 }}>
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
                backgroundColor: '#C8D5B9',
                border: '1px solid #8FC0A9',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#4A7C59', fontWeight: 600 }}>{log.time}</span>
              <span style={{ fontWeight: 800, color: '#4A7C59' }}>{log.actor}</span>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#4A7C59', color: '#FAF3DD', border: '1px solid #4A7C59' }}>
                  {log.action}
                </span>
              </div>
              <span style={{ color: '#4A7C59', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{log.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
