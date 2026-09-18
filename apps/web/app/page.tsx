'use strict';
'use client';

import React, { useState } from 'react';
import { ProductBillingScreen } from '../components/billing/ProductBillingScreen';
import { PisaiBillingScreen } from '../components/billing/PisaiBillingScreen';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { CustomerLedgerView } from '../components/admin/CustomerLedgerView';
import { ReportsView } from '../components/admin/ReportsView';
import { DailyPriceModal } from '../components/admin/DailyPriceModal';
import { PinLockOverlay } from '../components/ui/PinLockOverlay';
import {
  Wheat,
  Scale,
  Sparkles,
  LayoutDashboard,
  Users,
  FileText,
  Lock,
  Clock,
  Shield,
  UserCheck,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'billing' | 'pisai' | 'dashboard' | 'udhaar' | 'reports'>('billing');
  const [userRole, setUserRole] = useState<'admin' | 'biller'>('biller');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid var(--wheat-200)',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Logo & Shop Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--wheat-500)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Wheat size={26} strokeWidth={2.4} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  FlourERP
                </h1>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--emerald-50)',
                    color: 'var(--emerald-700)',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  ONLINE • LIVE DB
                </span>
              </div>
              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--wheat-700)',
                  lineHeight: 1.2,
                }}
              >
                المدینہ فلور ملز و چکی سسٹم
              </div>
            </div>
          </div>

          {/* Role Switcher & Security Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Daily Price Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsPriceModalOpen(true)}
              className="touch-active"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--wheat-100)',
                color: 'var(--wheat-700)',
                border: '1px solid var(--wheat-400)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={16} /> Daily Prices (نرخ نامہ)
            </button>

            {/* Role Switcher Pill */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-subtle)',
                padding: '3px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
              }}
            >
              <button
                type="button"
                onClick={() => setUserRole('biller')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: userRole === 'biller' ? 'var(--wheat-600)' : 'transparent',
                  color: userRole === 'biller' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Biller Mode
              </button>
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: userRole === 'admin' ? '#0f172a' : 'transparent',
                  color: userRole === 'admin' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Admin Mode
              </button>
            </div>

            {/* PIN Lock Screen Button */}
            <button
              type="button"
              onClick={() => setIsLocked(true)}
              className="touch-active"
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1.5px solid #fca5a5',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Lock Counter Terminal"
            >
              <Lock size={15} /> Lock PIN
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'billing', label: 'Product Billing', ur: 'بل بنائیں', icon: <Scale size={18} /> },
            { id: 'pisai', label: 'Gundam Pisai', ur: 'گندم پیسائی', icon: <Sparkles size={18} /> },
            { id: 'dashboard', label: 'Admin Dashboard', ur: 'ڈیش بورڈ', icon: <LayoutDashboard size={18} /> },
            { id: 'udhaar', label: 'Customer Udhaar', ur: 'ادھار کھاتہ', icon: <Users size={18} /> },
            { id: 'reports', label: 'Reports & Ledger', ur: 'روزنامچہ و اخراجات', icon: <FileText size={18} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: isActive ? '3.5px solid var(--wheat-600)' : '3.5px solid transparent',
                  color: isActive ? 'var(--wheat-700)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="font-nastaleeq" style={{ fontSize: '15px', opacity: 0.9 }}>
                  ({tab.ur})
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Screen Content */}
      <div
        style={{
          flex: 1,
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        {activeTab === 'billing' && <ProductBillingScreen />}
        {activeTab === 'pisai' && <PisaiBillingScreen />}
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onOpenPriceModal={() => setIsPriceModalOpen(true)}
            onNavigateTab={(tab) => {
              if (tab === 'billing') setActiveTab('billing');
              else if (tab === 'pisai') setActiveTab('pisai');
              else if (tab === 'udhaar') setActiveTab('udhaar');
              else if (tab === 'reports') setActiveTab('reports');
            }}
          />
        )}
        {activeTab === 'udhaar' && <CustomerLedgerView />}
        {activeTab === 'reports' && <ReportsView />}
      </div>

      {/* Daily Price Confirmation Modal */}
      <DailyPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        isAdmin={userRole === 'admin'}
      />

      {/* Screen Masking PIN-Lock Overlay */}
      <PinLockOverlay
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        staffName={userRole === 'admin' ? 'Shop Owner (Hanzala)' : 'Counter Biller 1'}
      />
    </main>
  );
}
