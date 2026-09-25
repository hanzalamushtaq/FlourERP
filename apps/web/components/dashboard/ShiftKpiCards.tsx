'use strict';
'use client';

import React from 'react';
import { TrendingUp, BookOpen, Wheat, Wallet } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface ShiftKpiCardsProps {
  todaySales?: number;
  creditRecovery?: number;
  todayPisaiKg?: number;
  cashDrawerBalance?: number;
  onCardClick?: (metric: 'sales' | 'recovery' | 'pisai' | 'drawer') => void;
}

export const ShiftKpiCards: React.FC<ShiftKpiCardsProps> = ({
  todaySales = 145890,
  creditRecovery = 25500,
  todayPisaiKg = 12340,
  cashDrawerBalance = 183730,
}) => {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useTheme();

  const items = [
    {
      id: 'sales' as const,
      title: t('کل نقد سیلز', 'Net Cash Sales'),
      amount: todaySales,
      icon: TrendingUp,
      accentColor: '#10B981',
      lightBg: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      id: 'recovery' as const,
      title: t('ادھار وصولی', 'Credit Recovered'),
      amount: creditRecovery,
      icon: BookOpen,
      accentColor: '#F59E0B',
      lightBg: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      id: 'pisai' as const,
      title: t('گندم پسائی', 'Milling Revenue'),
      amount: todayPisaiKg,
      icon: Wheat,
      accentColor: '#EA580C',
      lightBg: '#FFF7ED',
      iconColor: '#C2410C',
    },
    {
      id: 'drawer' as const,
      title: t('کیش دراز', 'Cash Drawer'),
      amount: cashDrawerBalance,
      icon: Wallet,
      accentColor: '#2563EB',
      lightBg: '#EFF6FF',
      iconColor: '#1D4ED8',
    },
  ];

  return (
    <div className="kpi-strip-container card-animate-1">
      {items.map((item) => {
        return (
          <div
            key={item.id}
            className="kpi-card-box"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
              boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(15, 23, 42, 0.04)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              userSelect: 'none',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}
          >
            {/* Top Accent Color Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3.5px',
                backgroundColor: item.accentColor,
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
              }}
            />

            {/* Top Row: Icon + Nastaleeq Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '6px',
                marginTop: '2px',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  backgroundColor: isDark ? '#111827' : item.lightBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <item.icon size={15} strokeWidth={2.4} />
              </div>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '18px' : '14px',
                  fontWeight: 800,
                  color: isDark ? '#94A3B8' : '#334155',
                  lineHeight: 1.4,
                }}
              >
                {item.title}
              </span>
            </div>

            {/* Center: Large Amount + Currency */}
            <div
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: isDark ? '#F8FAFC' : '#0F172A',
                lineHeight: 1.3,
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '6px',
                direction: isUrdu ? 'rtl' : 'ltr',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>
                {isUrdu ? item.amount.toLocaleString() : `Rs ${item.amount.toLocaleString()}`}
              </span>
              {isUrdu && (
                <span
                  className="font-nastaleeq"
                  style={{ fontSize: '16px', fontWeight: 800, color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  روپے
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
