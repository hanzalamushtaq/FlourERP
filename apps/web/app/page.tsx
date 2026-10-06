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
  isTokenExpired,
  refreshCurrentUserProfile,
  isAdmin,
  isBiller,
  hasPermission,
} from '../lib/auth';
import { getApiBaseUrl } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { isUrdu, t } = useLanguage();
  const { isDark, isNightMode } = useTheme();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin' | 'rates' | 'settings'
  >(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('flour_erp_active_tab') as any;
      const validTabs = ['dashboard', 'billing', 'pisai', 'udhaar', 'reports', 'admin', 'rates', 'settings'];
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

  // Selected entities from Global Search
  const [selectedCustomerIdForLedger, setSelectedCustomerIdForLedger] = useState<string | null>(null);
  const [customerSearchForLedger, setCustomerSearchForLedger] = useState<string>('');
  const [selectedProductIdForBilling, setSelectedProductIdForBilling] = useState<string | undefined>(undefined);

  // Reprint Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  // Refs for Android hardware back button handler
  const isReceiptOpenRef = React.useRef(isReceiptOpen);
  isReceiptOpenRef.current = isReceiptOpen;

  const isPriceModalOpenRef = React.useRef(isPriceModalOpen);
  isPriceModalOpenRef.current = isPriceModalOpen;

  const isZReportOpenRef = React.useRef(isZReportOpen);
  isZReportOpenRef.current = isZReportOpen;

  const isMobileNavOpenRef = React.useRef(isMobileNavOpen);
  isMobileNavOpenRef.current = isMobileNavOpen;

  const activeTabRef = React.useRef(activeTab);
  activeTabRef.current = activeTab;

  const currentUserRef = React.useRef(currentUser);
  currentUserRef.current = currentUser;

  // Android Hardware / Gesture Back Button Handling (One Step Back)
  useEffect(() => {
    let appListenerHandle: any = null;

    const handleBackAction = async () => {
      // 1. Close open modals first
      if (isReceiptOpenRef.current) {
        setIsReceiptOpen(false);
        return;
      }
      if (isPriceModalOpenRef.current) {
        setIsPriceModalOpen(false);
        return;
      }
      if (isZReportOpenRef.current) {
        setIsZReportOpen(false);
        return;
      }

      // 2. Close mobile sidebar drawer if open
      if (isMobileNavOpenRef.current) {
        setIsMobileNavOpen(false);
        return;
      }

      // 3. If in a sub-view / sub-tab, navigate back to dashboard
      if (currentUserRef.current && activeTabRef.current !== 'dashboard') {
        setActiveTab('dashboard');
        setSelectedCustomerIdForLedger(null);
        setCustomerSearchForLedger('');
        setSelectedProductIdForBilling(undefined);
        return;
      }

      // 4. If already on dashboard or on login screen, close/exit the app
      try {
        const { App } = await import('@capacitor/app');
        await App.exitApp();
      } catch (err) {
        if (typeof window !== 'undefined' && (window as any).navigator?.app?.exitApp) {
          (window as any).navigator.app.exitApp();
        }
      }
    };

    const registerBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');
        appListenerHandle = await App.addListener('backButton', () => {
          handleBackAction();
        });
      } catch (e) {
        // Not running in Capacitor or plugin not supported
      }
    };

    const handleDocBackButton = (e: Event) => {
      e.preventDefault();
      handleBackAction();
    };

    registerBackButton();
    document.addEventListener('backbutton', handleDocBackButton);

    return () => {
      if (appListenerHandle && typeof appListenerHandle.remove === 'function') {
        appListenerHandle.remove();
      }
      document.removeEventListener('backbutton', handleDocBackButton);
    };
  }, []);

  // Synchronize activeTab to localStorage so page refresh maintains the current tab
  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab) {
      localStorage.setItem('flour_erp_active_tab', activeTab);
    }
  }, [activeTab]);

  // Check saved session on mount
  useEffect(() => {
    const handleUnauthorized = () => {
      const current = getSession();
      if (current) {
        ensureValidToken(current, true).then((fresh) => {
          if (fresh) {
            const refreshed = getSession();
            if (refreshed) setCurrentUser(refreshed);
          } else {
            setCurrentUser(null);
          }
        }).catch(() => {
          setCurrentUser(null);
        });
      }
    };

    const handleRefreshed = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };

    const handleCleared = () => {
      setCurrentUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('flour_erp_unauthorized', handleUnauthorized);
      window.addEventListener('flour_erp_token_refreshed', handleRefreshed);
      window.addEventListener('flour_erp_session_cleared', handleCleared);
    }

    const saved = getSession();
    if (saved) {
      setCurrentUser(saved);
      const savedTab = localStorage.getItem('flour_erp_active_tab') as any;
      const validTabs = ['dashboard', 'billing', 'pisai', 'udhaar', 'reports', 'admin', 'rates', 'settings'];
      if (savedTab && validTabs.includes(savedTab)) {
        setActiveTab(savedTab);
      }

      // Always ensure token is verified against the active backend
      ensureValidToken(saved, isTokenExpired(saved.token)).then((freshToken) => {
        if (freshToken) {
          const refreshed = getSession();
          if (refreshed) setCurrentUser(refreshed);
        }
      }).catch(() => {});
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('flour_erp_unauthorized', handleUnauthorized);
        window.removeEventListener('flour_erp_token_refreshed', handleRefreshed);
        window.removeEventListener('flour_erp_session_cleared', handleCleared);
      }
    };
  }, []);

  // Real-time RBAC Profile Sync: poll every 6s and re-check on tab focus / visibility
  useEffect(() => {
    if (!currentUser) return;

    // Immediate check
    refreshCurrentUserProfile();

    // Regular heartbeat polling to catch changes made by Admin
    const interval = setInterval(() => {
      refreshCurrentUserProfile();
    }, 6000);

    const handleFocus = () => {
      refreshCurrentUserProfile();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshCurrentUserProfile();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentUser?.id]);

  // Dynamic User Permissions Gating
  const userIsAdmin = isAdmin(currentUser);
  const userIsBiller = isBiller(currentUser);
  const canBill = userIsAdmin || hasPermission(currentUser, 'can_bill');
  const canPisai = userIsAdmin || hasPermission(currentUser, 'can_pisai');
  const canIssueCredit = userIsAdmin || hasPermission(currentUser, 'can_issue_credit');
  const canManagePrices = userIsAdmin || hasPermission(currentUser, 'can_manage_prices');
  const canViewReports = userIsAdmin || hasPermission(currentUser, 'can_view_reports');
  const canCloseDay = userIsAdmin || hasPermission(currentUser, 'can_close_day');

  // RBAC Tab Kickback Guard: If Admin revokes permission for the active tab, immediately return to dashboard
  useEffect(() => {
    if (!currentUser) return;
    if (activeTab === 'billing' && !canBill) {
      setActiveTab('dashboard');
    } else if (activeTab === 'pisai' && !canPisai) {
      setActiveTab('dashboard');
    } else if (activeTab === 'udhaar' && !canIssueCredit) {
      setActiveTab('dashboard');
    } else if (activeTab === 'rates' && !canManagePrices) {
      setActiveTab('dashboard');
    } else if (activeTab === 'reports' && !canViewReports) {
      setActiveTab('dashboard');
    } else if (activeTab === 'admin' && !userIsAdmin) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab, canBill, canPisai, canIssueCredit, canManagePrices, canViewReports, userIsAdmin]);

  // Global Keyboard Shortcuts (F8, F2, F3, Esc, Alt+K) - Gated by Permissions
  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputActive = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      // F8 -> New Sales Bill (if permitted)
      if (e.key === 'F8') {
        e.preventDefault();
        if (canBill) {
          setActiveTab('billing');
        }
      }
      // F2 -> Gundam Pisai & Token (if permitted)
      else if (e.key === 'F2') {
        e.preventDefault();
        if (canPisai) {
          setActiveTab('pisai');
        }
      }
      // F3 -> Daily Rates Tab (if permitted)
      else if (e.key === 'F3') {
        e.preventDefault();
        if (canManagePrices) {
          setActiveTab('rates');
        }
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
      // Alt+K -> Customer Udhaar Ledger (if permitted)
      else if (e.altKey && (e.key === 'k' || e.key === 'K' || e.key === 'ک')) {
        e.preventDefault();
        if (canIssueCredit) {
          setActiveTab('udhaar');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, isReceiptOpen, isPriceModalOpen, isZReportOpen, canBill, canPisai, canManagePrices, canIssueCredit]);

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

  return (
    <div
      className={isUrdu ? 'dashboard-nastaleeq-scope' : ''}
      style={{
        display: 'flex',
        height: '100%',
        maxHeight: '100vh',
        backgroundColor: isNightMode ? '#0B0F19' : '#FFFFFF',
        color: '#0F172A',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
        position: 'relative',
        transition: 'background-color 0.2s ease',
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
          maxWidth: '100vw',
          height: '100%',
          maxHeight: '100dvh',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          width: '100%',
        }}
      >
        {/* Top Action Header */}
        <PosHeader
          onPrintDailyReport={() => setIsZReportOpen(true)}
          onOpenZReport={() => setIsZReportOpen(true)}
          onOpenPriceModal={() => setIsPriceModalOpen(true)}
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
          onNavigateTab={(tab, extra) => {
            if (tab === 'stock') {
              setActiveTab('dashboard');
              return;
            }
            if (extra?.subTab) {
              const safeSub = (extra.subTab === 'purchase' || extra.subTab === 'supplier') ? 'sales' : extra.subTab;
              setReportSubTab(safeSub as ReportSubTab);
            }
            if (extra?.customerId || extra?.customerName) {
              setSelectedCustomerIdForLedger(extra.customerId || null);
              setCustomerSearchForLedger(extra.customerName || '');
            }
            if (extra?.productId) {
              setSelectedProductIdForBilling(extra.productId);
            }
            setActiveTab(tab as any);
          }}
          title={
            activeTab === 'dashboard'
              ? t('بلر ڈیوٹی بورڈ', 'Biller Station')
              : activeTab === 'admin'
              ? t('ایڈمن کمانڈ سنٹر', 'Admin Center')
              : activeTab === 'billing'
              ? t('نیا بل (سیلز)', 'New Bill (Sales)')
              : activeTab === 'pisai'
              ? t('گندم پسائی و ٹوکن', 'Milling & Token')
              : activeTab === 'udhaar'
              ? t('کسٹمر ادھار کھاتہ', 'Customer Ledger')
              : activeTab === 'reports'
              ? t('مالیاتی رپورٹس', 'Financial Reports')
              : activeTab === 'rates'
              ? t('روزانہ ریٹ لسٹ', 'Daily Rate List')
              : activeTab === 'settings'
              ? t('پروفائل و سیٹنگز', 'Profile & Settings')
              : userIsAdmin
              ? t('ایڈمن پینل', 'Admin Panel')
              : t('بلر ورک سپیس', 'Biller Workspace')
          }
        />

        {/* View Router based on active tab and logged-in role */}
        <main
          className="app-main-content"
          style={{
            flex: 1,
            paddingBottom: '32px',
            backgroundColor: isNightMode ? '#0B0F19' : 'transparent',
            transition: 'background-color 0.2s ease',
          }}
        >
          {/* Dashboard Tab: Unified Approved Dashboard for both Operator and Admin */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-nastaleeq-scope">
              <BillerDashboard
                billerName={currentUser.fullName}
                counterId={userIsAdmin ? 'مرکزی کنٹرول' : 'کاؤنٹر #01'}
                permissions={currentUser.permissions}
                isAdmin={userIsAdmin}
                onNewBill={() => {
                  if (canBill) setActiveTab('billing');
                }}
                onNewPisaiToken={() => {
                  if (canPisai) setActiveTab('pisai');
                }}
                onViewUdhaar={() => {
                  if (canIssueCredit) setActiveTab('udhaar');
                }}
                onReprintReceipt={handleReprintReceipt}
                onViewAllInvoices={() => {
                  if (canViewReports) setActiveTab('reports');
                }}
              />
            </div>
          )}

          {/* Billing Screen (F8) */}
          {activeTab === 'billing' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              {canBill ? (
                <ProductBillingScreen initialProductId={selectedProductIdForBilling} />
              ) : (
                <div
                  style={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1.5px solid #7F1D1D' : '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#991B1B' }}>
                    بلنگ کا اختیار موجود نہیں (Billing Restricted)
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: isDark ? '#94A3B8' : '#475569', marginTop: '10px' }}>
                    آپ کے اکاؤنٹ کو پراڈکٹ سیلز اور بل بنانے کا اختیار حاصل نہیں ہے۔
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

          {/* Pisai Screen (F2) */}
          {activeTab === 'pisai' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              {canPisai ? (
                <PisaiBillingScreen />
              ) : (
                <div
                  style={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1.5px solid #7F1D1D' : '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#991B1B' }}>
                    پسائی ٹوکن کا اختیار موجود نہیں
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: isDark ? '#94A3B8' : '#475569', marginTop: '10px' }}>
                    آپ کے اکاؤنٹ کو گندم پسائی ٹوکن جاری کرنے کا اختیار حاصل نہیں ہے۔
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

          {/* Udhaar Ledger (Alt+K) */}
          {activeTab === 'udhaar' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              {canIssueCredit ? (
                <CustomerLedgerView
                  initialSearch={customerSearchForLedger}
                  targetCustomerId={selectedCustomerIdForLedger || undefined}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1.5px solid #7F1D1D' : '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#991B1B' }}>
                    ادھار کھاتہ کا اختیار موجود نہیں
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: isDark ? '#94A3B8' : '#475569', marginTop: '10px' }}>
                    آپ کے اکاؤنٹ کو کسٹمر ادھار کھاتے دیکھنے اور ادھار جاری کرنے کا اختیار حاصل نہیں ہے۔
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

          {/* Reports View: Accessible to Admin or permitted staff */}
          {activeTab === 'reports' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              {userIsAdmin || hasPermission(currentUser, 'can_view_reports') ? (
                <ReportsView activeSubTab={reportSubTab} />
              ) : (
                <div
                  style={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1.5px solid #7F1D1D' : '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#991B1B' }}>
                    اختیار موجود نہیں (Access Restricted)
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: isDark ? '#94A3B8' : '#475569', marginTop: '10px' }}>
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
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1.5px solid #7F1D1D' : '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛡️</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#991B1B' }}>
                    ایڈمنسٹریٹو اختیارات درکار ہیں
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: isDark ? '#94A3B8' : '#475569', marginTop: '10px' }}>
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
              {canManagePrices ? (
                <RateListView />
              ) : (
                <div
                  style={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1.5px solid #7F1D1D' : '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#991B1B' }}>
                    ریٹ لسٹ کا اختیار موجود نہیں
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: isDark ? '#94A3B8' : '#475569', marginTop: '10px' }}>
                    روزانہ کے ریٹ تبدیل کرنے اور ریٹ لسٹ دیکھنے کا اختیار حاصل نہیں ہے۔
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

          {/* General Information Settings View */}
          {activeTab === 'settings' && (
            <div className="dashboard-nastaleeq-scope main-content-view-container">
              {userIsAdmin ? (
                <GeneralInfoView />
              ) : (
                <div
                  style={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderRadius: '16px',
                    border: isDark ? '1.5px solid #7F1D1D' : '1.5px solid #FCA5A5',
                    padding: '36px',
                    maxWidth: '600px',
                    margin: '40px auto',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚙️</div>
                  <h2 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#991B1B' }}>
                    ایڈمنسٹریٹو اختیارات درکار ہیں
                  </h2>
                  <p className="font-nastaleeq" style={{ fontSize: '14px', color: isDark ? '#94A3B8' : '#475569', marginTop: '10px' }}>
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

      {/* Daily Financial Report Modal */}
      <ZReportModal
        isOpen={isZReportOpen}
        onClose={() => setIsZReportOpen(false)}
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
