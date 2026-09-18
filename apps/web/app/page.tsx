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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F1DCA7', color: '#797D62' }}>
      {/* Top Application Header */}
      <header
        style={{
          backgroundColor: '#F1DCA7',
          borderBottom: '2.5px solid #797D62',
          boxShadow: '0 3px 10px rgba(121, 125, 98, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#797D62',
                border: '2px solid #797D62',
                color: '#F1DCA7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wheat size={26} strokeWidth={2.6} color="#F1DCA7" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#797D62', letterSpacing: '-0.5px' }}>
                  FlourERP
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFCB69',
                    color: '#797D62',
                    border: '1.5px solid #797D62',
                  }}
                >
                  ONLINE
                </span>
              </div>
              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#797D62',
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
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: '#E8AC65',
                color: '#797D62',
                border: '2px solid #797D62',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(121, 125, 98, 0.15)',
              }}
            >
              <Clock size={18} color="#797D62" strokeWidth={2.5} /> Daily Prices (نرخ نامہ)
            </button>

            {/* Role Switcher Pill */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F1DCA7',
                padding: '4px',
                borderRadius: '12px',
                border: '2px solid #797D62',
              }}
            >
              <button
                type="button"
                onClick={() => setUserRole('biller')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: userRole === 'biller' ? '1.5px solid #797D62' : 'none',
                  backgroundColor: userRole === 'biller' ? '#797D62' : 'transparent',
                  color: userRole === 'biller' ? '#F1DCA7' : '#797D62',
                  fontWeight: 900,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Biller
              </button>
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: userRole === 'admin' ? '1.5px solid #797D62' : 'none',
                  backgroundColor: userRole === 'admin' ? '#797D62' : 'transparent',
                  color: userRole === 'admin' ? '#F1DCA7' : '#797D62',
                  fontWeight: 900,
                  fontSize: '14px',
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
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: '#D08C60',
                color: '#F1DCA7',
                border: '2px solid #797D62',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(121, 125, 98, 0.15)',
              }}
              title="Lock Terminal"
            >
              <Lock size={17} color="#F1DCA7" strokeWidth={2.5} /> Lock PIN
            </button>
          </div>
        </div>

        {/* Big, Clear Navigation Tabs for Weak Eyesight */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '6px 20px 10px',
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'billing', label: 'Product Billing', ur: 'بل بنائیں', icon: <Scale size={20} strokeWidth={2.5} /> },
            { id: 'pisai', label: 'Gundam Pisai', ur: 'گندم پیسائی', icon: <Sparkles size={20} strokeWidth={2.5} /> },
            { id: 'dashboard', label: 'Admin Dashboard', ur: 'ڈیش بورڈ', icon: <LayoutDashboard size={20} strokeWidth={2.5} /> },
            { id: 'udhaar', label: 'Customer Udhaar', ur: 'ادھار کھاتہ', icon: <Users size={20} strokeWidth={2.5} /> },
            { id: 'reports', label: 'Reports & Ledger', ur: 'روزنامچہ و اخراجات', icon: <FileText size={20} strokeWidth={2.5} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className="touch-active"
                style={{
                  padding: '9px 18px',
                  borderRadius: '12px',
                  border: isActive ? '2.5px solid #797D62' : '2px solid #9B9B7A',
                  backgroundColor: isActive ? '#FFCB69' : '#F1DCA7',
                  color: '#797D62',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 900,
                  fontSize: '15px',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 3px 8px rgba(121, 125, 98, 0.25)' : 'none',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 900, color: '#797D62' }}>
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
