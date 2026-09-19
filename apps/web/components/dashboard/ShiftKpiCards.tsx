'use strict';
'use client';

import React from 'react';

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
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const items = [
    {
      id: 'drawer' as const,
      title: 'کیش دراز',
      value: `Rs. ${cashDrawerBalance.toLocaleString()}`,
    },
    {
      id: 'pisai' as const,
      title: 'گندم پسائی',
      value: `Rs. ${todayPisaiKg.toLocaleString()}`,
    },
    {
      id: 'recovery' as const,
      title: 'ادھار وصولی',
      value: `Rs. ${creditRecovery.toLocaleString()}`,
    },
    {
      id: 'sales' as const,
      title: 'کل نقد سیلز',
      value: `Rs. ${todaySales.toLocaleString()}`,
    },
  ];

  return (
    <div
      className="dash-card-animated"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid #EBE4DA',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '14px 8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        direction: 'rtl',
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
              backgroundColor: isHovered ? '#FAF4EA' : 'transparent',
              borderLeft: idx !== items.length - 1 ? '1.5px solid #EBE4DA' : 'none',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'translateY(-1px)' : 'none',
            }}
          >
            <div
              className="font-nastaleeq"
              style={{
                fontSize: '16.5px',
                fontWeight: 800,
                color: isHovered ? '#783E15' : '#4B5563',
                marginBottom: '4px',
                lineHeight: 1.2,
                transition: 'color 0.18s ease',
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: '25px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: isHovered ? '#1F2937' : '#111827',
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
