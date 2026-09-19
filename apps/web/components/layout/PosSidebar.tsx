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
  CheckCircle2,
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
  counterId = 'کاؤنٹر #01 (آپریٹر)',
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'ڈیش بورڈ / ہوم',
      hotkey: 'Esc',
      icon: <Home size={18} />,
      onClick: () => onSelectTab('dashboard'),
    },
    {
      id: 'billing',
      label: 'نیا بل / سیلز',
      hotkey: 'F8',
      icon: <ShoppingCart size={18} />,
      onClick: () => onSelectTab('billing'),
    },
    {
      id: 'pisai',
      label: 'گندم پسائی و ٹوکن',
      hotkey: 'F2',
      icon: <Cog size={18} />,
      onClick: () => onSelectTab('pisai'),
    },
    {
      id: 'udhaar',
      label: 'گاہک ادھار کھاتہ',
      hotkey: 'Alt+K',
      icon: <BookUser size={18} />,
      onClick: () => onSelectTab('udhaar'),
    },
    {
      id: 'stock',
      label: 'گودام و اسٹاک',
      badge: 'کم اسٹاک',
      badgeColor: '#ef4444',
      icon: <Boxes size={18} />,
      onClick: () => onSelectTab('stock'),
    },
    {
      id: 'rates',
      label: 'نرخ نامہ (ریٹ لسٹ)',
      hotkey: 'F3',
      icon: <ClipboardList size={18} />,
      onClick: onOpenPriceModal,
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
        width: '240px',
        minWidth: '240px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid #1e293b',
        userSelect: 'none',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Top Section: Logo & Operator */}
      <div>
        {/* Brand Header */}
        <div
          style={{
            padding: '16px 14px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            direction: 'rtl',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.4)',
              flexShrink: 0,
            }}
          >
            <Wheat size={24} strokeWidth={2.4} />
          </div>

          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-start' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.3px', color: '#ffffff' }}>
                FlourERP
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  backgroundColor: '#334155',
                  color: '#fbbf24',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                v4.2
              </span>
            </div>
            <div
              className="font-nastaleeq"
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#cbd5e1',
                lineHeight: 1.2,
                marginTop: '1px',
              }}
            >
              المدینہ چکی و فلور ملز
            </div>
          </div>
        </div>

        {/* Operator Badge & Quick Lock */}
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#17255420',
          }}
        >
          <button
            type="button"
            onClick={onLock}
            className="touch-active"
            title="Lock Terminal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Lock size={15} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', direction: 'rtl' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '15px',
                  border: '1.5px solid #38bdf8',
                }}
              >
                ع
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '1.5px solid #0f172a',
                }}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                className="font-nastaleeq"
                style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}
              >
                {operatorName}
              </div>
              <div
                className="font-nastaleeq"
                style={{ fontSize: '11px', color: '#fbbf24', lineHeight: 1.2, marginTop: '2px' }}
              >
                {counterId}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? '#f59e0b' : 'transparent',
                  color: isActive ? '#0f172a' : '#cbd5e1',
                  cursor: 'pointer',
                  fontWeight: isActive ? 800 : 600,
                  transition: 'all 0.15s ease',
                  direction: 'rtl',
                }}
              >
                {/* Right side: Icon + Urdu Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? '#0f172a' : '#94a3b8' }}>{item.icon}</span>
                  <span
                    className="font-nastaleeq"
                    style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Left side: Hotkey or Badge */}
                <div>
                  {item.hotkey && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? '#b45309' : '#1e293b',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        border: isActive ? 'none' : '1px solid #334155',
                      }}
                    >
                      {item.hotkey}
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className="font-nastaleeq"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: item.badgeColor || '#ef4444',
                        color: '#ffffff',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Hardware & Connection Status */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid #1e293b',
          backgroundColor: '#090d16',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 6px #10b981',
              }}
            />
            <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
              آن لائن
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', direction: 'rtl' }}>
            <Printer size={14} color="#94a3b8" />
            <span className="font-nastaleeq" style={{ fontSize: '11px', color: '#94a3b8' }}>
              پرنٹر 80-POS تیار
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
