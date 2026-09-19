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
} from 'lucide-react';

interface PosSidebarProps {
  currentTab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock';
  onSelectTab: (tab: 'dashboard' | 'billing' | 'pisai' | 'udhaar' | 'reports' | 'stock') => void;
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
      icon: <Home size={19} />,
      onClick: () => onSelectTab('dashboard'),
    },
    {
      id: 'billing',
      label: 'نیا بل (سیلز)',
      hotkey: 'F8',
      icon: <ShoppingCart size={19} />,
      onClick: () => onSelectTab('billing'),
    },
    {
      id: 'pisai',
      label: 'گندم پسائی',
      hotkey: 'F2',
      icon: <Cog size={19} />,
      onClick: () => onSelectTab('pisai'),
    },
    {
      id: 'udhaar',
      label: 'ادھار کھاتہ',
      hotkey: 'Alt+K',
      icon: <BookUser size={19} />,
      onClick: () => onSelectTab('udhaar'),
    },
    {
      id: 'rates',
      label: 'ریٹ لسٹ',
      hotkey: 'F3',
      icon: <ClipboardList size={19} />,
      onClick: onOpenPriceModal,
    },
    {
      id: 'stock',
      label: 'گودام و اسٹاک',
      icon: <Boxes size={19} />,
      onClick: () => onSelectTab('stock'),
    },
    {
      id: 'reports',
      label: 'روزنامچہ و حساب',
      icon: <Calculator size={19} />,
      onClick: () => onSelectTab('reports'),
    },
  ];

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRight: '1px solid #1e293b',
      }}
    >
      <div>
        {/* Simple Brand Header */}
        <div
          style={{
            padding: '16px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            direction: 'rtl',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wheat size={20} />
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              FlourERP
            </div>
            <div
              className="font-nastaleeq"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#94a3b8',
                lineHeight: 1.1,
              }}
            >
              المدینہ فلور ملز
            </div>
          </div>
        </div>

        {/* Minimal Operator Status */}
        <div
          style={{
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
            direction: 'rtl',
          }}
        >
          <div>
            <div className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#f1f5f9' }}>
              {operatorName}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{counterId}</div>
          </div>

          <button
            type="button"
            onClick={onLock}
            className="touch-active"
            title="Lock"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Lock size={14} />
          </button>
        </div>

        {/* Clean Menu Items */}
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
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#d97706' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: isActive ? 800 : 600,
                  transition: 'background-color 0.1s ease',
                  direction: 'rtl',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? '#ffffff' : '#64748b' }}>{item.icon}</span>
                  <span className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 700 }}>
                    {item.label}
                  </span>
                </div>

                {item.hotkey && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: isActive ? '#fef3c7' : '#475569',
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

      {/* Clean Bottom Status */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          direction: 'rtl',
          fontSize: '11px',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span className="font-nastaleeq" style={{ color: '#10b981', fontWeight: 700 }}>
            آن لائن
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Printer size={13} />
          <span>پرنٹر تیار</span>
        </div>
      </div>
    </aside>
  );
};
