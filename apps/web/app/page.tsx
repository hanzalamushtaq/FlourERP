'use client';

import React, { useState, useEffect } from 'react';
import { PosSidebar } from '../components/layout/PosSidebar';
import type { ReportSubTab } from '../components/layout/PosSidebar';
import { PosHeader } from '../components/layout/PosHeader';
import { CounterDashboard } from '../components/dashboard/CounterDashboard';
import { BillerDashboard } from '../components/dashboard/BillerDashboard';
import { ProductBillingScreen } from '../components/billing/ProductBillingScreen';
import { PisaiBillingScreen } from '../components/billing/PisaiBillingScreen';
import { CustomerLedgerView } from '../components/admin/CustomerLedgerView';
import { ReportsView } from '../components/admin/ReportsView';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { RateListView } from '../components/rates/RateListView';
import { WarehouseStockView } from '../components/stock/WarehouseStockView';
import { DailyPriceModal } from '../components/admin/DailyPriceModal';
import { GeneralInfoView } from '../components/admin/GeneralInfoView';
import { PinLockOverlay } from '../components/ui/PinLockOverlay';
import { ZReportModal } from '../components/admin/ZReportModal';
import { ReceiptPreviewModal, ReceiptData } from '../components/ui/ReceiptPreviewModal';
import { LoginScreen } from '../components/auth/LoginScreen';
import {
  UserSession,
  getSession,
  clearSession,
  ensureValidToken,
  isAdmin,
  isBiller,
  hasPermission,
} from '../lib/auth';
import { getApiBaseUrl } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { isUrdu, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin' | 'rates' | 'settings'
  >(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('flour_erp_active_tab') as any;
      const validTabs = ['dashboard', 'billing', 'pisai', 'udhaar', 'reports', 'stock', 'admin', 'rates', 'settings'];
      if (savedTab && validTabs.includes(savedTab)) {
        return savedTab;
      }
    }
    return 'dashboard';
  });
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  const [isZReportOpen, setIsZReportOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>('sales');

  // Reprint Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  // Synchronize activeTab to localStorage so page refresh maintains the current tab
  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab) {
      localStorage.setItem('flour_erp_active_tab', activeTab);
    }
  }, [activeTab]);

  // Check saved session on mount
  useEffect(() => {
    const saved = getSession();
    if (saved) {
      setCurrentUser(saved);
      const savedTab = localStorage.getItem('flour_erp_active_tab') as any;
      const validTabs = ['dashboard', 'billing', 'pisai', 'udhaar', 'reports', 'stock', 'admin', 'rates', 'settings'];
      if (savedTab && validTabs.includes(savedTab)) {
        setActiveTab(savedTab);
      }
      // Silently upgrade token if it was an offline mock token
      ensureValidToken(saved).then((token) => {
        if (token && token !== saved.token) {
          const refreshed = getSession();
          if (refreshed) setCurrentUser(refreshed);
        }
      });
    }
  }, []);

  // Global Keyboard Shortcuts (F8, F2, F3, Esc, Alt+K)
  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
      // F3 -> Daily Rates Tab
      else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('rates');
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
  }, [currentUser, isReceiptOpen, isPriceModalOpen, isZReportOpen]);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('کیا آپ واقعی سیشن ختم اور لاگ آؤٹ کرنا چاہتے ہیں؟');
    if (!confirmLogout) return;

    // Call backend logout asynchronously
    try {
      fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      }).catch(() => {});
    } catch {}

    clearSession();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flour_erp_active_tab');
    }
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleReprintReceipt = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
    setIsReceiptOpen(true);
  };

  const handleConfirmShiftClose = () => {
    setIsLocked(true);
  };

  // If no active session, render the dedicated Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const userIsAdmin = isAdmin(currentUser);
  const userIsBiller = isBiller(currentUser);
  const canCloseDay = userIsAdmin || hasPermission(currentUser, 'can_close_day');

  return (
    <div
      className={isUrdu ? 'dashboard-nastaleeq-scope' : ''}
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        width: '100%',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* 1. Left Navigation Sidebar with POS Hotkeys & Role-Gated Menu */}
      <PosSidebar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileNavOpen(false);
        }}
        onOpenPriceModal={() => setIsPriceModalOpen(true)}
        onLock={() => setIsLocked(true)}
        operatorName={currentUser.fullName}
        counterId={userIsAdmin ? 'مرکزی کنٹرول (Shop Owner)' : 'کاؤنٹر #01 (آپریٹر)'}
        roleName={currentUser.role}
        permissions={currentUser.permissions}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        reportSubTab={reportSubTab}
        onSelectReportSubTab={(sub) => {
          setReportSubTab(sub);
          setActiveTab('reports');
          setIsMobileNavOpen(false);
        }}
      />

      {/* 2. Main Workspace Layout */}
      <div
        className={`app-main-workspace ${isUrdu ? 'dashboard-nastaleeq-scope' : ''}`}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100dvh',
          minHeight: '100vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          width: '100%',
        }}
      >
        {/* Top Action Header */}
        <PosHeader
          onOpenZReport={() => setIsZReportOpen(true)}
          operatorName={currentUser.fullName}
          roleName={currentUser.role}
          canCloseDay={canCloseDay}
          onLogout={handleLogout}
          activeTab={activeTab}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileNavOpen={isMobileNavOpen}
          onToggleSidebar={() => {
            if (typeof window !== 'undefined' && window.innerWidth <= 768) {
              setIsMobileNavOpen((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          title={
            activeTab === 'dashboard'
              ? t('کاؤنٹر بلر ڈیوٹی بورڈ', 'Biller Duty Station')
              : activeTab === 'admin'
              ? t('مالک و ایڈمنسٹریٹر کمانڈ سنٹر', 'Administrator Command Center')
              : activeTab === 'billing'
              ? t('نیا بل (پروڈکٹ سیلز)', 'New Bill (Product Sales)')
              : activeTab === 'pisai'
              ? t('گندم پسائی و ٹوکن جاری کریں', 'Wheat Milling & Token Issue')
              : activeTab === 'udhaar'
              ? t('کسٹمر ادھار کھاتہ و وصولی', 'Customer Ledger & Recovery')
              : activeTab === 'reports'
              ? t('مالیاتی روزنامچہ و حسابات', 'Financial Journal & Reports')
              : activeTab === 'rates'
              ? t('روزانہ نرخ نامہ و ریٹ لسٹ', 'Daily Rate List & Pricing')
              : activeTab === 'stock'
              ? t('گودام و اسٹاک انوینٹری', 'Warehouse & Stock Inventory')
              : activeTab === 'settings'
              ? t('عمومی معلومات و مل پروفائل', 'General Information & Mill Profile')
              : userIsAdmin
              ? t('ایڈمن کنٹرول پینل', 'Admin Control Panel')
              : t('کاؤنٹر بلر ورک سپیس', 'Counter Biller Workspace')
          }
        />

        {/* View Router based on active tab and logged-in role */}
        <main className="app-main-content" style={{ flex: 1, paddingBottom: '32px' }}>
          {/* Dashboard Tab: Unified Approved Dashboard for both Operator and Admin */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-nastaleeq-scope">
              <BillerDashboard
                billerName={currentUser.fullName}
                counterId={userIsAdmin ? 'مرکزی کنٹرول' : 'کاؤنٹر #01'}
                onNewBill={() => setActiveTab('billing')}
                onNewPisaiToken={() => setActiveTab('pisai')}
                onViewUdhaar={() => setActiveTab('udhaar')}
                onReprintReceipt={handleReprintReceipt}
                onViewAllInvoices={() => {
                  if (userIsAdmin) setActiveTab('reports');
                }}
              />
            </div>
          )}

          {/* Billing Screen (F8) */}
          {activeTab === 'billing' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              <ProductBillingScreen />
            </div>
          )}

          {/* Pisai Screen (F2) */}
          {activeTab === 'pisai' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              <PisaiBillingScreen />
            </div>
          )}

          {/* Udhaar Ledger (Alt+K) */}
          {activeTab === 'udhaar' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              <CustomerLedgerView />
            </div>
          )}

          {/* Reports View: Accessible to Admin or permitted staff */}
          {activeTab === 'reports' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              {userIsAdmin || hasPermission(currentUser, 'can_view_reports') ? (
                <ReportsView activeSubTab={reportSubTab} />
              ) : (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: '#991B1B' }}>
                    اختیار موجود نہیں (Access Restricted)
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: '#475569', marginTop: '10px' }}>
                    روزنامچہ اور منافع دیکھنے کے اختیارات صرف ایڈمن یا منظور شدہ سپروائزر کے پاس ہیں۔
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="touch-active"
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      backgroundColor: '#7F4F24',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    واپس جائیں (Esc)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Admin Dashboard: Accessible to SuperAdmin or users with can_manage_users */}
          {activeTab === 'admin' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              {userIsAdmin ? (
                <AdminDashboard
                  onOpenPriceModal={() => setActiveTab('rates')}
                  onNavigateTab={(tab) => {
                    if (tab === 'billing') setActiveTab('billing');
                    else if (tab === 'pisai') setActiveTab('pisai');
                    else if (tab === 'udhaar') setActiveTab('udhaar');
                    else if (tab === 'reports') setActiveTab('reports');
                  }}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛡️</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: '#991B1B' }}>
                    ایڈمنسٹریٹو اختیارات درکار ہیں
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: '#475569', marginTop: '10px' }}>
                    سٹاف رولز، پرمیشنز اور سسٹم ایڈمنسٹریشن صرف ایڈمنسٹریٹر کے پاس ہے۔
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="touch-active"
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      backgroundColor: '#7F4F24',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ڈیش بورڈ پر واپس جائیں (Esc)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stock Warehouse View */}
          {activeTab === 'stock' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              <WarehouseStockView />
            </div>
          )}

          {/* Daily Rates View (F3) */}
          {activeTab === 'rates' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              <RateListView />
            </div>
          )}

          {/* General Information Settings View */}
          {activeTab === 'settings' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              {userIsAdmin ? (
                <GeneralInfoView />
              ) : (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚙️</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: '#991B1B' }}>
                    ایڈمنسٹریٹو اختیارات درکار ہیں
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: '#475569', marginTop: '10px' }}>
                    عمومی معلومات صرف ایڈمنسٹریٹر ترتیب دے سکتا ہے۔
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="touch-active"
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      backgroundColor: '#7F4F24',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ڈیش بورڈ پر واپس جائیں (Esc)
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Daily Price Confirmation Modal */}
      <DailyPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        isAdmin={userIsAdmin || hasPermission(currentUser, 'can_manage_prices')}
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
        staffName={currentUser.fullName}
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
