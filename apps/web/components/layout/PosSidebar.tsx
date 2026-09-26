'use strict';
'use client';

import React from 'react';
import {
  Home,
  PlusCircle,
  BookOpen,
  Tag,
  Boxes,
  Calculator,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart2,
  ShieldAlert,
  ShoppingCart,
  Users,
  Truck,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

export type ReportSubTab = 'sales' | 'audit' | 'purchase' | 'customer' | 'supplier' | 'daily_log' | 'user_sales';

const REPORT_SUB_ITEMS: { id: ReportSubTab; labelEn: string; labelUr: string; icon: React.ReactNode }[] = [
  { id: 'sales',      labelEn: 'Sales Report',           labelUr: 'سیلز رپورٹ',          icon: <BarChart2 size={15} /> },
  { id: 'audit',      labelEn: 'Audit Report',           labelUr: 'آڈٹ رپورٹ',           icon: <ShieldAlert size={15} /> },
  { id: 'purchase',   labelEn: 'Purchase Report',        labelUr: 'خریداری رپورٹ',        icon: <ShoppingCart size={15} /> },
  { id: 'customer',   labelEn: 'Customer Report',        labelUr: 'کسٹمر رپورٹ',         icon: <Users size={15} /> },
  { id: 'supplier',   labelEn: 'Supplier Report',        labelUr: 'سپلائر رپورٹ',         icon: <Truck size={15} /> },
  { id: 'daily_log',  labelEn: 'Daily Log Report',       labelUr: 'روزانہ لاگ رپورٹ',    icon: <BookOpen size={15} /> },
  { id: 'user_sales', labelEn: 'User Wise Sales Report', labelUr: 'یوزر وائز سیلز رپورٹ', icon: <UserCheck size={15} /> },
];
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

// Wheat-Ear Cogwheel Logo matching user's reference image
const WheatGearLogo = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', flexShrink: 0 }}
  >
    {/* Outer Cogwheel / Gear in cobalt blue */}
    <path
      d="M32 12V21C26.5 24 22 28.5 18.5 34L10 30L4 41L12 45.5C11.5 48.5 11 51.5 11 55C11 58.5 11.5 61.5 12 64.5L4 69L10 80L18.5 76C22 81.5 26.5 86 32 89V98H44V90C46 90.5 48 90.5 50 90.5C52 90.5 54 90.5 56 90V98H68V89C73.5 86 78 81.5 81.5 76L90 80L96 69L88 64.5C88.5 61.5 89 58.5 89 55C89 51.5 88.5 48.5 88 45.5L96 41L90 30L81.5 34C78 28.5 73.5 24 68 21V12H61V28.5C57.5 27.5 53.8 27 50 27C46.2 27 42.5 27.5 39 28.5V12H32Z"
      fill="#1877F2"
    />
    {/* Inner White Cutout circle */}
    <circle cx="50" cy="56" r="20" fill="#FFFFFF" />

    {/* Center Wheat Stalk */}
    <line x1="50" y1="20" x2="50" y2="78" stroke="#1877F2" strokeWidth="3" strokeLinecap="round" />

    {/* Top Grains */}
    <path d="M50 12C46 17 46 22 50 26C54 22 54 17 50 12Z" fill="#1877F2" />

    {/* Row 1 Grains */}
    <path d="M48 26C41 27 38 32 43 36C47 36 49 33 48 26Z" fill="#1877F2" />
    <path d="M52 26C59 27 62 32 57 36C53 36 51 33 52 26Z" fill="#1877F2" />

    {/* Row 2 Grains */}
    <path d="M48 35C40 36 36 41 41 45C46 45 49 42 48 35Z" fill="#1877F2" />
    <path d="M52 35C60 36 64 41 59 45C54 45 51 42 52 35Z" fill="#1877F2" />

    {/* Row 3 Grains */}
    <path d="M48 44C39 46 36 51 41 55C46 55 49 51 48 44Z" fill="#1877F2" />
    <path d="M52 44C61 46 64 51 59 55C54 55 51 51 52 44Z" fill="#1877F2" />

    {/* Row 4 Grains */}
    <path d="M48 54C40 56 37 61 42 65C47 65 49 61 48 54Z" fill="#1877F2" />
    <path d="M52 54C60 56 63 61 58 65C53 65 51 61 52 54Z" fill="#1877F2" />
  </svg>
);

// Chakki Grinder Outline Icon
const ChakkiMachineIcon = ({ size = 22, color = '#374151' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="6,3 18,3 15,8 9,8" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="8" y="8" width="8" height="7" rx="1" stroke={color} strokeWidth="1.8" />
    <circle cx="12" cy="11.5" r="1.5" fill={color} />
    <path d="M16 10H19V13H16" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <polygon points="5,15 19,15 21,20 3,20" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

// Warehouse Outline Icon
const WarehouseBoxIcon = ({ size = 22, color = '#374151' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 4L21 9.5V20H3V9.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 20V13H15V20" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="10.5" y="14.5" width="3" height="3" stroke={color} strokeWidth="1.2" />
  </svg>
);

interface PosSidebarProps {
  currentTab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin' | 'rates' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin' | 'rates' | 'settings') => void;
  onOpenPriceModal: () => void;
  onLock: () => void;
  operatorName?: string;
  counterId?: string;
  roleName?: string;
  permissions?: string[];
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  /** Active sub-tab inside Reports section */
  reportSubTab?: ReportSubTab;
  /** Called when a report sub-item is clicked */
  onSelectReportSubTab?: (sub: ReportSubTab) => void;
}

export const PosSidebar: React.FC<PosSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPriceModal,
  roleName = 'Biller',
  permissions = [],
  onLogout,
  isCollapsed: isCollapsedProp,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  reportSubTab = 'sales',
  onSelectReportSubTab,
}) => {
  const { language, isUrdu, t } = useLanguage();
  const { isDark } = useTheme();
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(false);
  const isCollapsed = isCollapsedProp !== undefined ? isCollapsedProp : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed((prev) => !prev));

  const handleItemSelect = (tab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin' | 'rates' | 'settings') => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const isAdminUser =
    roleName.toLowerCase().includes('admin') || permissions.includes('can_manage_users');
  const canViewReports =
    isAdminUser || permissions.includes('can_view_reports');

  const allMenuItems = [
    {
      id: 'dashboard',
      label: t('ڈیش بورڈ', 'Dashboard'),
      icon: (color: string) => <Home size={22} color={color} strokeWidth={2} />,
      onClick: () => handleItemSelect('dashboard'),
      visible: true,
    },
    {
      id: 'billing',
      label: t('نیا بل', 'New Bill'),
      icon: (color: string) => <PlusCircle size={22} color={color} strokeWidth={1.8} />,
      onClick: () => handleItemSelect('billing'),
      visible: true,
    },
    {
      id: 'pisai',
      label: t('گندم پسائی', 'Wheat Grinding'),
      icon: (color: string) => <ChakkiMachineIcon size={22} color={color} />,
      onClick: () => handleItemSelect('pisai'),
      visible: true,
    },
    {
      id: 'udhaar',
      label: t('ادھار کھاتے', 'Customer Ledger'),
      icon: (color: string) => <BookOpen size={22} color={color} strokeWidth={1.8} />,
      onClick: () => handleItemSelect('udhaar'),
      visible: true,
    },
    {
      id: 'rates',
      label: t('ریٹ لسٹ', 'Daily Rates'),
      icon: (color: string) => <Tag size={22} color={color} strokeWidth={2} />,
      onClick: () => handleItemSelect('rates'),
      visible: true,
    },
    {
      id: 'stock',
      label: t('گودام و اسٹاک', 'Inventory & Stock'),
      icon: (color: string) => <Boxes size={22} color={color} strokeWidth={1.8} />,
      onClick: () => handleItemSelect('stock'),
      visible: false,
    },
    {
      id: 'reports',
      label: t('روزنامچہ و حساب', 'Reports & Accounts'),
      icon: (color: string) => <Calculator size={22} color={color} strokeWidth={1.8} />,
      onClick: () => handleItemSelect('reports'),
      visible: canViewReports,
    },
    {
      id: 'admin',
      label: t('ایڈمن و اختیارات', 'Admin & Settings'),
      icon: (color: string) => <ShieldCheck size={22} color={color} strokeWidth={1.8} />,
      onClick: () => handleItemSelect('admin'),
      visible: isAdminUser,
    },
    {
      id: 'settings',
      label: t('عمومی معلومات', 'General Info'),
      icon: (color: string) => <Settings size={22} color={color} strokeWidth={1.8} />,
      onClick: () => handleItemSelect('settings'),
      visible: isAdminUser,
    },
  ];

  const menuItems = allMenuItems.filter((item) => item.visible);

  const [hoveredTab, setHoveredTab] = React.useState<string | null>(null);
  const [pressedTab, setPressedTab] = React.useState<string | null>(null);

  return (
    <aside
      className={`pos-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: isCollapsed ? '68px' : '240px',
        minWidth: isCollapsed ? '68px' : '240px',
        maxWidth: isCollapsed ? '68px' : '240px',
        backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRight: isDark ? '1.5px solid #1E293B' : '1.5px solid #E2E8F0',
        boxShadow: 'none',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, border-color 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Row: Small Logo aligned with Toggle Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '14px 0 10px 0' : '14px 14px 12px 14px',
          flexShrink: 0,
          borderBottom: isDark ? '1px solid #1E293B' : '1px solid #F1F5F9',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WheatGearLogo size={32} />
            <span
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: isDark ? '#F8FAFC' : '#0F172A',
                letterSpacing: '-0.2px',
              }}
            >
              Flour ERP
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Mobile Drawer Close Button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              title={t('سائیڈ بار بند کریں', 'Close Sidebar')}
              className="touch-active mobile-sidebar-close-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isDark ? '#F8FAFC' : '#0F172A',
                boxShadow: 'none',
                outline: 'none',
                flexShrink: 0,
              }}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}

          {/* Desktop Collapse / Expand Toggle Button (Hidden on Mobile) */}
          <button
            type="button"
            onClick={toggleCollapse}
            title={isCollapsed ? t('سائیڈ بار کھولیں', 'Expand Sidebar') : t('سائیڈ بار بند کریں', 'Collapse Sidebar')}
            className="touch-active desktop-sidebar-collapse-btn"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isDark ? '#F8FAFC' : '#0F172A',
              boxShadow: 'none',
              transition: 'all 0.15s ease',
              outline: 'none',
              flexShrink: 0,
            }}
          >
            <Menu size={20} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Menu Navigation Items with Tactile Button / Card Feel & Scrollbar */}
      <nav
        className="custom-sidebar-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: isCollapsed ? '6px 6px' : '6px 8px',
          alignItems: isCollapsed ? 'center' : 'stretch',
        }}
      >
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          const isHovered = hoveredTab === item.id;
          const isPressed = pressedTab === item.id;

          return (
            <React.Fragment key={item.id}>
              <button
              type="button"
              onClick={item.onClick}
              title={item.label}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => {
                setHoveredTab(null);
                setPressedTab(null);
              }}
              onMouseDown={() => setPressedTab(item.id)}
              onMouseUp={() => setPressedTab(null)}
              onTouchStart={() => setPressedTab(item.id)}
              onTouchEnd={() => setPressedTab(null)}
              className="touch-active"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : (isUrdu ? 'space-between' : 'flex-start'),
                gap: isCollapsed ? '0' : '10px',
                width: isCollapsed ? '46px' : '100%',
                minHeight: isCollapsed ? '40px' : '40px',
                height: isCollapsed ? '40px' : 'auto',
                padding: isCollapsed ? '0' : '4px 8px',
                borderRadius: '10px',
                border: isActive
                  ? '1.5px solid #1877F2'
                  : isDark
                    ? isHovered ? '1.5px solid #475569' : '1.5px solid #1E293B'
                    : isHovered ? '1.5px solid #CBD5E1' : '1.5px solid #E2E8F0',
                backgroundColor: isActive
                  ? '#1877F2'
                  : isDark
                    ? isHovered ? '#243046' : '#141D2E'
                    : isHovered ? '#F1F5F9' : '#F8FAFC',
                cursor: 'pointer',
                direction: isUrdu ? 'rtl' : 'ltr',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive
                  ? '0 4px 12px rgba(24, 119, 242, 0.28)'
                  : isDark
                    ? '0 2px 6px rgba(0, 0, 0, 0.2)'
                    : isHovered
                      ? '0 2px 6px rgba(15, 23, 42, 0.06)'
                      : '0 1px 3px rgba(15, 23, 42, 0.03)',
                transform: isPressed ? 'scale(0.97)' : isHovered ? (isUrdu ? 'translateX(-2px)' : 'translateX(2px)') : 'none',
                outline: 'none',
                overflow: 'hidden',
              }}
            >
              {isUrdu ? (
                <>
                  {!isCollapsed && (
                    <span
                      className="font-nastaleeq"
                      style={{
                        fontSize: '18px',
                        fontWeight: isActive ? 900 : 800,
                        color: isActive ? '#FFFFFF' : isHovered ? '#38BDF8' : (isDark ? '#F1F5F9' : '#0F172A'),
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                        textAlign: 'right',
                        marginRight: '2px',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isActive
                        ? 'rgba(255, 255, 255, 0.22)'
                        : (isDark ? '#0B0F19' : '#FFFFFF'),
                      border: isActive
                        ? '1px solid rgba(255, 255, 255, 0.35)'
                        : isDark
                          ? (isHovered ? '1px solid #475569' : '1px solid #1E293B')
                          : (isHovered ? '1px solid #CBD5E1' : '1px solid #E2E8F0'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.icon(
                      isActive
                        ? '#FFFFFF'
                        : isHovered
                          ? '#38BDF8'
                          : (isDark ? '#94A3B8' : '#475569')
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isActive
                        ? 'rgba(255, 255, 255, 0.22)'
                        : (isDark ? '#0B0F19' : '#FFFFFF'),
                      border: isActive
                        ? '1px solid rgba(255, 255, 255, 0.35)'
                        : isDark
                          ? (isHovered ? '1px solid #475569' : '1px solid #1E293B')
                          : (isHovered ? '1px solid #CBD5E1' : '1px solid #E2E8F0'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.icon(
                      isActive
                        ? '#FFFFFF'
                        : isHovered
                          ? '#38BDF8'
                          : (isDark ? '#94A3B8' : '#475569')
                    )}
                  </div>
                  {!isCollapsed && (
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: isActive ? 800 : 700,
                        color: isActive ? '#FFFFFF' : isHovered ? '#38BDF8' : (isDark ? '#F1F5F9' : '#0F172A'),
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                        textAlign: 'left',
                        letterSpacing: '-0.15px',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </button>
            {/* ─── Reports Sub-Items: appears immediately after the reports button ─── */}
            {item.id === 'reports' && currentTab === 'reports' && !isCollapsed && (
              <div
                style={{
                  marginTop: '-4px',
                  marginBottom: '2px',
                  paddingLeft: '14px',
                  paddingRight: '4px',
                  borderLeft: isDark ? '2px solid #2563EB' : '2px solid #BFDBFE',
                  marginLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {REPORT_SUB_ITEMS.map((sub) => {
                  const isSubActive = reportSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      className="touch-active"
                      onClick={() => {
                        onSelectReportSubTab?.(sub.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: isSubActive
                          ? (isDark ? '1px solid #2563EB' : '1px solid #BFDBFE')
                          : '1px solid transparent',
                        backgroundColor: isSubActive
                          ? (isDark ? 'rgba(37, 99, 235, 0.25)' : '#EFF6FF')
                          : 'transparent',
                        cursor: 'pointer',
                        outline: 'none',
                        direction: 'rtl',
                        textAlign: 'right',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? '#1E293B' : '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, backgroundColor: isSubActive ? '#38BDF8' : (isDark ? '#475569' : '#CBD5E1'), transition: 'background-color 0.12s' }} />
                      <span
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{ flex: 1, fontSize: isUrdu ? '17px' : '13px', fontWeight: isSubActive ? 800 : 600, color: isSubActive ? '#38BDF8' : (isDark ? '#CBD5E1' : '#64748B'), lineHeight: 1.3, transition: 'color 0.12s' }}
                      >
                        {isUrdu ? sub.labelUr : sub.labelEn}
                      </span>
                      <span style={{ color: isSubActive ? '#38BDF8' : (isDark ? '#94A3B8' : '#94A3B8'), flexShrink: 0, display: 'flex' }}>{sub.icon}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </React.Fragment>
          );
        })}



        {/* Separator before Logout */}
        {onLogout && (
          <div
            style={{
              margin: isCollapsed ? '6px 0 2px 0' : '6px 4px 2px 4px',
              borderTop: isDark ? '1.5px dashed #334155' : '1.5px dashed #E2E8F0',
              width: isCollapsed ? '36px' : 'auto',
            }}
          />
        )}

        {/* Logout Button Attached with Page Buttons */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title={t('لاگ آؤٹ', 'Logout')}
            className="touch-active"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : (isUrdu ? 'space-between' : 'flex-start'),
              gap: isCollapsed ? '0' : '10px',
              width: isCollapsed ? '46px' : '100%',
              minHeight: isCollapsed ? '40px' : '40px',
              height: isCollapsed ? '40px' : 'auto',
              padding: isCollapsed ? '0' : '4px 8px',
              borderRadius: '10px',
              border: isDark ? '1.5px solid #7F1D1D' : '1.5px solid #FECACA',
              backgroundColor: isDark ? '#1F1315' : '#FEF2F2',
              cursor: 'pointer',
              direction: isUrdu ? 'rtl' : 'ltr',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.08)',
              outline: 'none',
              flexShrink: 0,
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#2D1618' : '#FEE2E2';
              e.currentTarget.style.borderColor = isDark ? '#991B1B' : '#FCA5A5';
              e.currentTarget.style.transform = isCollapsed ? 'none' : (isUrdu ? 'translateX(-2px)' : 'translateX(2px)');
              e.currentTarget.style.boxShadow = '0 3px 8px rgba(239, 68, 68, 0.14)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#1F1315' : '#FEF2F2';
              e.currentTarget.style.borderColor = isDark ? '#7F1D1D' : '#FECACA';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(239, 68, 68, 0.08)';
            }}
          >
            {isUrdu ? (
              <>
                {!isCollapsed && (
                  <span
                    className="font-nastaleeq"
                    style={{
                      fontSize: '18px',
                      fontWeight: 900,
                      color: '#EF4444',
                      lineHeight: 1.3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                      textAlign: 'right',
                      marginRight: '2px',
                    }}
                  >
                    {t('لاگ آؤٹ', 'Logout')}
                  </span>
                )}
                {isCollapsed ? (
                  <LogOut size={18} color="#EF4444" />
                ) : (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#2D1618' : '#FFFFFF',
                      border: isDark ? '1px solid #7F1D1D' : '1px solid #FECACA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 1px 2px rgba(239, 68, 68, 0.06)',
                    }}
                  >
                    <LogOut size={17} color="#EF4444" />
                  </div>
                )}
              </>
            ) : (
              <>
                {isCollapsed ? (
                  <LogOut size={18} color="#EF4444" />
                ) : (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#2D1618' : '#FFFFFF',
                      border: isDark ? '1px solid #7F1D1D' : '1px solid #FECACA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 1px 2px rgba(239, 68, 68, 0.06)',
                    }}
                  >
                    <LogOut size={17} color="#EF4444" />
                  </div>
                )}
                {!isCollapsed && (
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#EF4444',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                      textAlign: 'left',
                      letterSpacing: '-0.1px',
                    }}
                  >
                    {t('لاگ آؤٹ', 'Logout')}
                  </span>
                )}
              </>
            )}
          </button>
        )}

        {/* Bottom Online Status & Version Info - Attached inside Nav */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '6px',
            paddingBottom: '12px',
            paddingLeft: isCollapsed ? '0' : '6px',
            paddingRight: isCollapsed ? '0' : '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            direction: isUrdu ? 'rtl' : 'ltr',
            fontSize: '12px',
            color: '#64748B',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#0E8A54',
                boxShadow: 'none',
              }}
            />
            {!isCollapsed && (
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{ color: '#0E8A54', fontWeight: 800, fontSize: isUrdu ? '17px' : '13px' }}
              >
                {t('آن لائن', 'Online')}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748B' }}>
              v1.0 POS
            </span>
          )}
        </div>
      </nav>
    </aside>
  );
};
