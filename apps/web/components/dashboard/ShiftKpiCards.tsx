'use strict';
'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

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
  onCardClick,
}) => {
  const { isUrdu, t } = useLanguage();
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const items = [
    {
      id: 'sales' as const,
      title: t('کل نقد سیلز', 'Net Cash Sales'),
      value: isUrdu ? `${todaySales.toLocaleString()} روپے` : `Rs ${todaySales.toLocaleString()}`,
    },
    {
      id: 'recovery' as const,
      title: t('ادھار وصولی', 'Credit Recovered'),
      value: isUrdu ? `${creditRecovery.toLocaleString()} روپے` : `Rs ${creditRecovery.toLocaleString()}`,
    },
    {
      id: 'pisai' as const,
      title: t('گندم پسائی', 'Milling Revenue'),
      value: isUrdu ? `${todayPisaiKg.toLocaleString()} روپے` : `Rs ${todayPisaiKg.toLocaleString()}`,
    },
    {
      id: 'drawer' as const,
      title: t('کیش دراز', 'Cash Drawer'),
      value: isUrdu ? `${cashDrawerBalance.toLocaleString()} روپے` : `Rs ${cashDrawerBalance.toLocaleString()}`,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        borderRadius: '16px',
        border: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '14px 8px',
        boxShadow: 'none',
      }}
    >
      {items.map((item, idx) => {
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={item.id}
            className="touch-active"
            onClick={() => onCardClick?.(item.id)}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: onCardClick ? 'pointer' : 'default',
              padding: '6px 14px',
              borderRadius: '10px',
              backgroundColor: isHovered ? '#FFFFFF' : 'transparent',
              border: 'none',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'translateY(-1px)' : 'none',
            }}
          >
            <div
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#64748B',
                marginBottom: '4px',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: '25px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#0F172A',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                transition: 'transform 0.18s ease',
                transform: isHovered ? 'scale(1.035)' : 'scale(1)',
              }}
            >
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
