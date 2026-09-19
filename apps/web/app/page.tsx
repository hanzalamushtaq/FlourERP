'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PosSidebar } from '../components/layout/PosSidebar';
import { PosHeader } from '../components/layout/PosHeader';
import { CounterDashboard } from '../components/dashboard/CounterDashboard';
import { ProductBillingScreen } from '../components/billing/ProductBillingScreen';
import { PisaiBillingScreen } from '../components/billing/PisaiBillingScreen';
import { CustomerLedgerView } from '../components/admin/CustomerLedgerView';
import { ReportsView } from '../components/admin/ReportsView';
import { DailyPriceModal } from '../components/admin/DailyPriceModal';
import { PinLockOverlay } from '../components/ui/PinLockOverlay';
import { ZReportModal } from '../components/admin/ZReportModal';
import { ReceiptPreviewModal, ReceiptData } from '../components/ui/ReceiptPreviewModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock'>('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'biller'>('biller');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  const [isZReportOpen, setIsZReportOpen] = useState<boolean>(false);

  // Reprint Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  // Global Keyboard Shortcuts (F8, F2, F3, Esc, Alt+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an active text input or textarea (unless it's an F-key)
      const target = e.target as HTMLElement;
      const isInputActive = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      // F8 -> New Sales Bill
      if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('billing');
      }
      // F2 -> Gundam Pisai & Token
      else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pisai');
      }
      // F3 -> Daily Rates Modal
      else if (e.key === 'F3') {
        e.preventDefault();
        setIsPriceModalOpen(true);
      }
      // Esc -> Home / Dashboard
      else if (e.key === 'Escape') {
        if (isReceiptOpen) {
          setIsReceiptOpen(false);
        } else if (isPriceModalOpen) {
          setIsPriceModalOpen(false);
        } else if (isZReportOpen) {
          setIsZReportOpen(false);
        } else {
          setActiveTab('dashboard');
        }
      }
      // Alt+K -> Customer Udhaar Ledger
      else if (e.altKey && (e.key === 'k' || e.key === 'K' || e.key === 'ک')) {
        e.preventDefault();
        setActiveTab('udhaar');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReceiptOpen, isPriceModalOpen, isZReportOpen]);

  const handleReprintReceipt = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
    setIsReceiptOpen(true);
  };

  const handleConfirmShiftClose = () => {
    // Lock the shift & trigger closing state
    setIsLocked(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* 1. Left Navigation Sidebar with POS Hotkeys & Operator Info */}
      <PosSidebar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPriceModal={() => setIsPriceModalOpen(true)}
        onLock={() => setIsLocked(true)}
        operatorName="محمد عاصف"
        counterId="کاؤنٹر #01 (آپریٹر)"
      />

      {/* 2. Main Workspace Layout */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Top Action Header */}
        <PosHeader
          onOpenZReport={() => setIsZReportOpen(true)}
          onRefresh={() => {
            // Soft refresh state
          }}
        />

        {/* View Router based on active tab */}
        <main style={{ flex: 1, paddingBottom: '24px' }}>
          {activeTab === 'dashboard' && (
            <CounterDashboard
              onNewBill={() => setActiveTab('billing')}
              onNewPisaiToken={() => setActiveTab('pisai')}
              onEditRates={() => setIsPriceModalOpen(true)}
              onReprintReceipt={handleReprintReceipt}
              onViewAllInvoices={() => setActiveTab('reports')}
              onMetricCardClick={(metric) => {
                if (metric === 'sales') setActiveTab('billing');
                else if (metric === 'pisai') setActiveTab('pisai');
                else if (metric === 'recovery') setActiveTab('udhaar');
                else if (metric === 'drawer') setIsZReportOpen(true);
              }}
            />
          )}

          {activeTab === 'billing' && (
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px' }}>
              <ProductBillingScreen />
            </div>
          )}

          {activeTab === 'pisai' && (
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px' }}>
              <PisaiBillingScreen />
            </div>
          )}

          {activeTab === 'udhaar' && (
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px' }}>
              <CustomerLedgerView />
            </div>
          )}

          {activeTab === 'reports' && (
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px' }}>
              <ReportsView />
            </div>
          )}

          {activeTab === 'stock' && (
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px', textAlign: 'center' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #fee2e2',
                  padding: '36px',
                  maxWidth: '600px',
                  margin: '40px auto',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                <h2 className="font-nastaleeq" style={{ fontSize: '22px', fontWeight: 900, color: '#991b1b' }}>
                  گودام و اسٹاک الرٹ
                </h2>
                <p className="font-nastaleeq" style={{ fontSize: '15px', color: '#475569', marginTop: '10px' }}>
                  میدہ بوری 50KG اور سوجی کا اسٹاک کم ہے۔ برائے مہربانی نیا اسٹاک حاصل کریں یا ریٹ لسٹ چیک کریں۔
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="touch-active"
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ڈیش بورڈ پر واپس جائیں (Esc)
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Daily Price Confirmation Modal */}
      <DailyPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        isAdmin={true}
      />

      {/* End-of-Shift / Z-Report Reconciliation Modal */}
      <ZReportModal
        isOpen={isZReportOpen}
        onClose={() => setIsZReportOpen(false)}
        onConfirmCloseShift={handleConfirmShiftClose}
      />

      {/* Screen Masking PIN-Lock Overlay */}
      <PinLockOverlay
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        staffName="محمد عاصف (کاؤنٹر #01)"
      />

      {/* Receipt Reprint Modal */}
      {selectedReceipt && (
        <ReceiptPreviewModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          data={selectedReceipt}
        />
      )}
    </div>
  );
}
