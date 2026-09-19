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
  LogOut,
  Menu,
} from 'lucide-react';

// Wheat-Ear Cogwheel Logo matching user's reference image
const WheatGearLogo = () => (
  <svg
    width="92"
    height="92"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', margin: '0 auto' }}
  >
    {/* Outer Cogwheel / Gear in warm golden-brown */}
    <path
      d="M32 12V21C26.5 24 22 28.5 18.5 34L10 30L4 41L12 45.5C11.5 48.5 11 51.5 11 55C11 58.5 11.5 61.5 12 64.5L4 69L10 80L18.5 76C22 81.5 26.5 86 32 89V98H44V90C46 90.5 48 90.5 50 90.5C52 90.5 54 90.5 56 90V98H68V89C73.5 86 78 81.5 81.5 76L90 80L96 69L88 64.5C88.5 61.5 89 58.5 89 55C89 51.5 88.5 48.5 88 45.5L96 41L90 30L81.5 34C78 28.5 73.5 24 68 21V12H61V28.5C57.5 27.5 53.8 27 50 27C46.2 27 42.5 27.5 39 28.5V12H32Z"
      fill="#B26E3A"
    />
    {/* Inner White Cutout circle */}
    <circle cx="50" cy="56" r="20" fill="#FFFFFF" />

    {/* Center Wheat Stalk */}
    <line x1="50" y1="20" x2="50" y2="78" stroke="#B26E3A" strokeWidth="3" strokeLinecap="round" />

    {/* Top Grains */}
    <path d="M50 12C46 17 46 22 50 26C54 22 54 17 50 12Z" fill="#B26E3A" />

    {/* Row 1 Grains */}
    <path d="M48 26C41 27 38 32 43 36C47 36 49 33 48 26Z" fill="#B26E3A" />
    <path d="M52 26C59 27 62 32 57 36C53 36 51 33 52 26Z" fill="#B26E3A" />

    {/* Row 2 Grains */}
    <path d="M48 35C40 36 36 41 41 45C46 45 49 42 48 35Z" fill="#B26E3A" />
    <path d="M52 35C60 36 64 41 59 45C54 45 51 42 52 35Z" fill="#B26E3A" />

    {/* Row 3 Grains */}
    <path d="M48 44C39 46 36 51 41 55C46 55 49 51 48 44Z" fill="#B26E3A" />
    <path d="M52 44C61 46 64 51 59 55C54 55 51 51 52 44Z" fill="#B26E3A" />

    {/* Row 4 Grains */}
    <path d="M48 54C40 56 37 61 42 65C47 65 49 61 48 54Z" fill="#B26E3A" />
    <path d="M52 54C60 56 63 61 58 65C53 65 51 61 52 54Z" fill="#B26E3A" />
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
  currentTab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin' | 'rates';
  onSelectTab: (tab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin' | 'rates') => void;
  onOpenPriceModal: () => void;
  onLock: () => void;
  operatorName?: string;
  counterId?: string;
  roleName?: string;
  permissions?: string[];
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(false);
  const isCollapsed = isCollapsedProp !== undefined ? isCollapsedProp : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed((prev) => !prev));

  const isAdminUser =
    roleName.toLowerCase().includes('admin') || permissions.includes('can_manage_users');
  const canViewReports =
    isAdminUser || permissions.includes('can_view_reports');

  const allMenuItems = [
    {
      id: 'dashboard',
      label: 'ڈیش بورڈ',
      icon: (color: string) => <Home size={22} color={color} strokeWidth={2} />,
      onClick: () => onSelectTab('dashboard'),
      visible: true,
    },
    {
      id: 'billing',
      label: 'نیا بل',
      icon: (color: string) => <PlusCircle size={22} color={color} strokeWidth={1.8} />,
      onClick: () => onSelectTab('billing'),
      visible: true,
    },
    {
      id: 'pisai',
      label: 'گندم پسائی',
      icon: (color: string) => <ChakkiMachineIcon size={22} color={color} />,
      onClick: () => onSelectTab('pisai'),
      visible: true,
    },
    {
      id: 'udhaar',
      label: 'ادھار کھاتے',
      icon: (color: string) => <BookOpen size={22} color={color} strokeWidth={1.8} />,
      onClick: () => onSelectTab('udhaar'),
      visible: true,
    },
    {
      id: 'rates',
      label: 'ریٹ لسٹ',
      icon: (color: string) => <Tag size={22} color={color} strokeWidth={2} />,
      onClick: () => onSelectTab('rates'),
      visible: true,
    },
    {
      id: 'stock',
      label: 'گودام و اسٹاک',
      icon: (color: string) => <Boxes size={22} color={color} strokeWidth={1.8} />,
      onClick: () => onSelectTab('stock'),
      visible: true,
    },
    {
      id: 'reports',
      label: 'روزنامچہ و حساب',
      icon: (color: string) => <Calculator size={22} color={color} strokeWidth={1.8} />,
      onClick: () => onSelectTab('reports'),
      visible: canViewReports,
    },
    {
      id: 'admin',
      label: 'ایڈمن و اختیارات',
      icon: (color: string) => <ShieldCheck size={22} color={color} strokeWidth={1.8} />,
      onClick: () => onSelectTab('admin'),
      visible: isAdminUser,
    },
  ];

  const menuItems = allMenuItems.filter((item) => item.visible);

  const [hoveredTab, setHoveredTab] = React.useState<string | null>(null);
  const [pressedTab, setPressedTab] = React.useState<string | null>(null);

  return (
    <aside
      style={{
        width: isCollapsed ? '68px' : '232px',
        minWidth: isCollapsed ? '68px' : '232px',
        maxWidth: isCollapsed ? '68px' : '232px',
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRight: '1.5px solid #EBE4DA',
        boxShadow: '1px 0 5px rgba(0, 0, 0, 0.03)',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      <div>
        {/* Top Header Row: Three Lines Toggle Button on Top Right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-end',
            padding: isCollapsed ? '14px 0 8px 0' : '12px 14px 2px 14px',
          }}
        >
          <button
            type="button"
            onClick={toggleCollapse}
            title={isCollapsed ? 'سائیڈ بار کھولیں' : 'سائیڈ بار بند کریں'}
            className="touch-active"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#F5EFE6',
              border: '1.5px solid #E8DED1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B4A28',
              boxShadow: '0 1px 3px rgba(60, 40, 20, 0.05)',
              transition: 'all 0.15s ease',
              outline: 'none',
            }}
          >
            <Menu size={20} strokeWidth={2.2} />
          </button>
        </div>

        {/* Top Centered Brand Emblem (visible when expanded) */}
        {!isCollapsed && (
          <div
            style={{
              padding: '6px 16px 16px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WheatGearLogo />
          </div>
        )}

        {/* Menu Navigation Items with Tactile Button / Card Feel */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: isCollapsed ? '6px 10px' : '4px 12px',
            alignItems: isCollapsed ? 'center' : 'stretch',
          }}
        >
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            const isHovered = hoveredTab === item.id;
            const isPressed = pressedTab === item.id;

            return (
              <button
                key={item.id}
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
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  width: isCollapsed ? '46px' : '100%',
                  minHeight: isCollapsed ? '46px' : '50px',
                  height: isCollapsed ? '46px' : 'auto',
                  padding: isCollapsed ? '0' : '7px 12px',
                  borderRadius: '13px',
                  border: isActive
                    ? '2px solid #B26E3A'
                    : isHovered
                      ? '1.5px solid #CDB59E'
                      : '1.5px solid #EDE4D8',
                  borderRight: !isCollapsed && isActive ? '5px solid #B26E3A' : undefined,
                  backgroundColor: isActive
                    ? '#FBF3E8'
                    : isHovered
                      ? '#FAF4EC'
                      : '#FFFFFF',
                  cursor: 'pointer',
                  direction: 'rtl',
                  transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(178, 110, 58, 0.18), 0 1px 3px rgba(0, 0, 0, 0.04)'
                    : isHovered
                      ? '0 4px 10px rgba(178, 110, 58, 0.10)'
                      : '0 1px 3px rgba(60, 40, 20, 0.04)',
                  transform: isPressed
                    ? 'scale(0.975) translateY(1px)'
                    : isHovered
                      ? 'translateY(-1.5px)'
                      : 'none',
                  outline: 'none',
                }}
              >
                {/* Right: Bold Urdu Nastaleeq Text */}
                {!isCollapsed && (
                  <span
                    className="font-nastaleeq"
                    style={{
                      fontSize: '19.5px',
                      fontWeight: 900,
                      color: isActive ? '#783E15' : isHovered ? '#111827' : '#2B231D',
                      lineHeight: 1.15,
                      whiteSpace: 'nowrap',
                      marginRight: '2px',
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {/* Left: Dedicated Tactile Icon Squircle */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: isActive
                      ? '#B26E3A'
                      : isHovered
                        ? '#EDE0D0'
                        : '#F5EFE6',
                    border: isActive
                      ? '1px solid #995A2B'
                      : isHovered
                        ? '1px solid #D6C2B0'
                        : '1px solid #E8DED1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isActive
                      ? '0 2px 6px rgba(178, 110, 58, 0.35)'
                      : 'none',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {item.icon(
                    isActive
                      ? '#FFFFFF'
                      : isHovered
                        ? '#B26E3A'
                        : '#6E5844'
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Clean Logout Button & Online Indicator */}
      <div>
        {onLogout && (
          <div style={{ padding: isCollapsed ? '8px 10px' : '8px 12px', borderTop: '1px solid #F3EDE4', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onLogout}
              title="لاگ آؤٹ"
              className="touch-active"
              style={{
                width: isCollapsed ? '46px' : '100%',
                minHeight: isCollapsed ? '42px' : 'auto',
                padding: isCollapsed ? '0' : '9px 12px',
                borderRadius: '10px',
                border: '1.5px solid #F3D3CC',
                backgroundColor: '#FFF8F6',
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                direction: 'rtl',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
                e.currentTarget.style.borderColor = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFF8F6';
                e.currentTarget.style.borderColor = '#F3D3CC';
              }}
            >
              <LogOut size={16} color="#DC2626" />
              {!isCollapsed && (
                <span
                  className="font-nastaleeq"
                  style={{ fontSize: '15px', fontWeight: 900, color: '#B91C1C' }}
                >
                  لاگ آؤٹ
                </span>
              )}
            </button>
          </div>
        )}

        {/* Bottom Online Status */}
        <div
          style={{
            padding: isCollapsed ? '8px 0' : '8px 14px',
            borderTop: '1px solid #F3EDE4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            direction: 'rtl',
            fontSize: '11.5px',
            color: '#6B7280',
            backgroundColor: '#FAF7F2',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#16A34A',
                boxShadow: '0 0 6px rgba(22, 163, 74, 0.6)',
              }}
            />
            {!isCollapsed && (
              <span
                className="font-nastaleeq"
                style={{ color: '#15803D', fontWeight: 800, fontSize: '14px' }}
              >
                آن لائن
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#8C7E72' }}>
              v1.0 POS
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
