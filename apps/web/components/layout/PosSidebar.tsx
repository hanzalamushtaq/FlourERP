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
  ];

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        backgroundColor: '#414833', // Deep Forest Olive (--c8 theme)
        color: '#F4F5EE',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRight: '1px solid #363C2A',
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
            borderBottom: '1px solid #4D563C',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#7F4F24', // Warm Timber brand
              color: '#F4F5EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <Wheat size={20} strokeWidth={2.4} />
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#F4F5EE', letterSpacing: '-0.3px' }}>
              FlourERP
            </div>
            <div
              className="font-nastaleeq"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#C2C5AA', // Pale sage
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
            borderBottom: '1px solid #4D563C',
            backgroundColor: '#383F2B',
            direction: 'rtl',
          }}
        >
          <div>
            <div className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#F4F5EE' }}>
              {operatorName}
            </div>
            <div style={{ fontSize: '11px', color: '#C2C5AA' }}>{counterId}</div>
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
              border: '1px solid #545D43',
              backgroundColor: '#2E3424',
              color: '#C2C5AA',
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
                  backgroundColor: isActive ? '#7F4F24' : 'transparent', // Warm Timber for Active state
                  color: isActive ? '#F4F5EE' : '#C2C5AA',
                  cursor: 'pointer',
                  fontWeight: isActive ? 800 : 600,
                  transition: 'background-color 0.1s ease',
                  direction: 'rtl',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ color: isActive ? '#F4F5EE' : '#A4AC86' }}>{item.icon}</span>
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
                      backgroundColor: isActive ? '#5E3615' : '#363C2A',
                      color: isActive ? '#F4F5EE' : '#A4AC86',
                      border: `1px solid ${isActive ? '#7F4F24' : '#4D563C'}`,
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
          borderTop: '1px solid #4D563C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          direction: 'rtl',
          fontSize: '11px',
          color: '#A4AC86',
          backgroundColor: '#383F2B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#86efac',
              boxShadow: '0 0 5px #86efac',
            }}
          />
          <span className="font-nastaleeq" style={{ color: '#F4F5EE', fontWeight: 700 }}>
            آن لائن
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Printer size={12} color="#C2C5AA" />
          <span style={{ color: '#C2C5AA' }}>پرنٹر تیار</span>
        </div>
      </div>
    </aside>
  );
};
