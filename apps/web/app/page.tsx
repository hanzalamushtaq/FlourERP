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
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'billing' | 'pisai' | 'dashboard' | 'udhaar' | 'reports'>('billing');
  const [userRole, setUserRole] = useState<'admin' | 'biller'>('biller');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Top Application Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '6px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Logo & Shop Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#d97706',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wheat size={22} strokeWidth={2.4} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  FlourERP
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  ONLINE
                </span>
              </div>
              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#b45309',
                  lineHeight: 1.2,
                }}
              >
                المدینہ چکی و فلور ملز
              </div>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Daily Price Button */}
            <button
              type="button"
              onClick={() => setIsPriceModalOpen(true)}
              className="touch-active"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1.5px solid #fde68a',
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
                backgroundColor: '#f1f5f9',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
              }}
            >
              <button
                type="button"
                onClick={() => setUserRole('biller')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: userRole === 'biller' ? '#d97706' : 'transparent',
                  color: userRole === 'biller' ? '#ffffff' : '#475569',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Biller
              </button>
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: userRole === 'admin' ? '#0f172a' : 'transparent',
                  color: userRole === 'admin' ? '#ffffff' : '#475569',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Admin
              </button>
            </div>

            {/* Lock Screen Button */}
            <button
              type="button"
              onClick={() => setIsLocked(true)}
              className="touch-active"
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
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
              title="Lock Terminal"
            >
              <Lock size={15} /> Lock PIN
            </button>
          </div>
        </div>

        {/* Big, Clear Navigation Tabs for 40+ year old readability */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'billing', label: 'Product Billing', ur: 'بل بنائیں', icon: <Scale size={19} /> },
            { id: 'pisai', label: 'Gundam Pisai', ur: 'گندم پیسائی', icon: <Sparkles size={19} /> },
            { id: 'dashboard', label: 'Admin Dashboard', ur: 'ڈیش بورڈ', icon: <LayoutDashboard size={19} /> },
            { id: 'udhaar', label: 'Customer Udhaar', ur: 'ادھار کھاتہ', icon: <Users size={19} /> },
            { id: 'reports', label: 'Reports & Ledger', ur: 'روزنامچہ و اخراجات', icon: <FileText size={19} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: isActive ? '3px solid #d97706' : '3px solid transparent',
                  color: isActive ? '#b45309' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 700 }}>
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
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '8px 16px 14px',
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
