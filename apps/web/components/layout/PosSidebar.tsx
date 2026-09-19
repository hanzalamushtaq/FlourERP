'use strict';
'use client';

import React from 'react';
import {
  Wheat,
  Home,
  ShoppingCart,
  Cog,
  BookUser,
  Boxes,
  ClipboardList,
  Calculator,
  Lock,
  Printer,
  ShieldCheck,
} from 'lucide-react';

interface PosSidebarProps {
  currentTab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin';
  onSelectTab: (tab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock' | 'admin') => void;
  onOpenPriceModal: () => void;
  onLock: () => void;
  operatorName?: string;
  counterId?: string;
}

export const PosSidebar: React.FC<PosSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPriceModal,
  onLock,
  operatorName = 'محمد عاصف',
  counterId = 'کاؤنٹر 01',
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'ڈیش بورڈ',
      hotkey: 'Esc',
      icon: <Home size={18} />,
      onClick: () => onSelectTab('dashboard'),
    },
    {
      id: 'billing',
      label: 'نیا بل (سیلز)',
      hotkey: 'F8',
      icon: <ShoppingCart size={18} />,
      onClick: () => onSelectTab('billing'),
    },
    {
      id: 'pisai',
      label: 'گندم پسائی',
      hotkey: 'F2',
      icon: <Cog size={18} />,
      onClick: () => onSelectTab('pisai'),
    },
    {
      id: 'udhaar',
      label: 'ادھار کھاتہ',
      hotkey: 'Alt+K',
      icon: <BookUser size={18} />,
      onClick: () => onSelectTab('udhaar'),
    },
    {
      id: 'rates',
      label: 'ریٹ لسٹ',
      hotkey: 'F3',
      icon: <ClipboardList size={18} />,
      onClick: onOpenPriceModal,
    },
    {
      id: 'stock',
      label: 'گودام و اسٹاک',
      icon: <Boxes size={18} />,
      onClick: () => onSelectTab('stock'),
    },
    {
      id: 'reports',
      label: 'روزنامچہ و حساب',
      icon: <Calculator size={18} />,
      onClick: () => onSelectTab('reports'),
    },
    {
      id: 'admin',
      label: 'ایڈمن و اختیارات (RBAC)',
      icon: <ShieldCheck size={18} />,
      onClick: () => onSelectTab('admin'),
    },
  ];

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        backgroundColor: '#ffffff', // Clean Light Theme
        color: '#414833',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRight: '1px solid #e2e8f0',
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          style={{
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            direction: 'rtl',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#7F4F24', // Warm Timber brand
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Wheat size={20} strokeWidth={2.4} />
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#414833', letterSpacing: '-0.3px' }}>
              FlourERP
            </div>
            <div
              className="font-nastaleeq"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#656D4A',
                lineHeight: 1.1,
              }}
            >
              المدینہ فلور ملز
            </div>
          </div>
        </div>

        {/* Operator Profile */}
        <div
          style={{
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            direction: 'rtl',
          }}
        >
          <div>
            <div className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#414833' }}>
              {operatorName}
            </div>
            <div style={{ fontSize: '11px', color: '#656D4A' }}>{counterId}</div>
          </div>

          <button
            type="button"
            onClick={onLock}
            className="touch-active"
            title="Lock Terminal"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#414833',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Lock size={13} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="touch-active"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: isActive ? '#7F4F24' : 'transparent', // Warm Timber active
                  color: isActive ? '#ffffff' : '#414833',
                  cursor: 'pointer',
                  fontWeight: isActive ? 800 : 600,
                  transition: 'background-color 0.1s ease',
                  direction: 'rtl',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ color: isActive ? '#ffffff' : '#656D4A' }}>{item.icon}</span>
                  <span className="font-nastaleeq" style={{ fontSize: '13.5px', fontWeight: 700 }}>
                    {item.label}
                  </span>
                </div>

                {item.hotkey && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: isActive ? '#5E3615' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      border: isActive ? 'none' : '1px solid #e2e8f0',
                    }}
                  >
                    {item.hotkey}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Online & Printer Status */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          direction: 'rtl',
          fontSize: '11px',
          color: '#64748b',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              boxShadow: '0 0 4px rgba(22, 163, 74, 0.4)',
            }}
          />
          <span className="font-nastaleeq" style={{ color: '#15803d', fontWeight: 700 }}>
            آن لائن
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Printer size={12} color="#64748b" />
          <span>پرنٹر تیار</span>
        </div>
      </div>
    </aside>
  );
};
