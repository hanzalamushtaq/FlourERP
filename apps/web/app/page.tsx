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
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '8px 20px',
            width: '100%',
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
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#414833',
                  lineHeight: 1.2,
                }}
              >
                المدینہ چکی و فلور ملز
              </div>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="header-actions-responsive" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Daily Price Button */}
            <button
              type="button"
              onClick={() => setIsPriceModalOpen(true)}
              className="touch-active"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#C2C5AA',
                color: '#414833',
                border: '1.5px solid #B6AD90',
                fontSize: '13px',
                fontWeight: 800,
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
                borderRadius: '8px',
                border: '1px solid #B6AD90',
              }}
            >
              <button
                type="button"
                onClick={() => setUserRole('biller')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: userRole === 'biller' ? '#414833' : 'transparent',
                  color: userRole === 'biller' ? '#F4F5EE' : '#414833',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                }}
              >
                Biller
              </button>
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: userRole === 'admin' ? '#414833' : 'transparent',
                  color: userRole === 'admin' ? '#F4F5EE' : '#414833',
                  fontWeight: 800,
                  fontSize: '12.5px',
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
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#414833',
                color: '#F4F5EE',
                border: '1.5px solid #414833',
                fontSize: '13px',
                fontWeight: 800,
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

        {/* Clear, Large, Readable Navigation Tabs - Equal Width Edge-to-Edge */}
        <div
          className="nav-tabs-grid"
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 20px',
            width: '100%',
          }}
        >
          {[
            { id: 'billing', shortEn: 'Billing', ur: 'بل بنائیں', icon: <Scale size={18} /> },
            { id: 'pisai', shortEn: 'Pisai', ur: 'گندم پیسائی', icon: <Sparkles size={18} /> },
            { id: 'dashboard', shortEn: 'Dashboard', ur: 'ڈیش بورڈ', icon: <LayoutDashboard size={18} /> },
            { id: 'udhaar', shortEn: 'Udhaar', ur: 'ادھار کھاتہ', icon: <Users size={18} /> },
            { id: 'reports', shortEn: 'Reports', ur: 'روزنامچہ', icon: <FileText size={18} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className="touch-active nav-tab-btn"
                style={{
                  padding: '9px 12px',
                  backgroundColor: isActive ? '#C2C5AA' : 'rgba(194, 197, 170, 0.32)',
                  border: isActive ? '2px solid #7F4F24' : '1.5px solid #B6AD90',
                  borderBottom: isActive ? '3.5px solid #7F4F24' : '1.5px solid #B6AD90',
                  borderRadius: '9px 9px 0 0',
                  cursor: 'pointer',
                  color: isActive ? '#414833' : '#656D4A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 -2px 8px rgba(127, 79, 36, 0.16)' : 'none',
                  transition: 'all 0.12s ease',
                  width: '100%',
                }}
              >
                {tab.icon}
                <span className="font-nastaleeq" style={{ fontSize: '17px', fontWeight: 800, color: '#414833' }}>
                  {tab.ur}
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: isActive ? '#414833' : '#656D4A' }}>
                  ({tab.shortEn})
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
          padding: '12px 20px 24px',
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
