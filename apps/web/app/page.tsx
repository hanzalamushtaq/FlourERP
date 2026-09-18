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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F5EE', color: '#414833' }}>
      {/* Top Application Header */}
      <header
        style={{
          backgroundColor: '#F4F5EE',
          borderBottom: '2px solid #B6AD90',
          boxShadow: '0 2px 8px rgba(65, 72, 51, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Logo & Shop Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#414833',
                border: '1.5px solid #414833',
                color: '#F4F5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wheat size={22} strokeWidth={2.4} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#414833', letterSpacing: '-0.5px' }}>
                  FlourERP
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#C2C5AA',
                    color: '#414833',
                    border: '1px solid #B6AD90',
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
                  color: '#414833',
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
                backgroundColor: '#C2C5AA',
                color: '#414833',
                border: '1.5px solid #B6AD90',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={16} color="#414833" /> Daily Prices (نرخ نامہ)
            </button>

            {/* Role Switcher Pill */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#C2C5AA',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid #B6AD90',
              }}
            >
              <button
                type="button"
                onClick={() => setUserRole('biller')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: userRole === 'biller' ? '#414833' : 'transparent',
                  color: userRole === 'biller' ? '#F4F5EE' : '#414833',
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
                  backgroundColor: userRole === 'admin' ? '#414833' : 'transparent',
                  color: userRole === 'admin' ? '#F4F5EE' : '#414833',
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
                backgroundColor: '#414833',
                color: '#F4F5EE',
                border: '1.5px solid #414833',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Lock Terminal"
            >
              <Lock size={15} color="#F4F5EE" /> Lock PIN
            </button>
          </div>
        </div>

        {/* Big, Clear Navigation Tabs */}
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
                  padding: '8px 14px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: isActive ? '3px solid #7F4F24' : '3px solid transparent',
                  color: isActive ? '#414833' : '#656D4A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 700, color: isActive ? '#414833' : '#656D4A' }}>
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
