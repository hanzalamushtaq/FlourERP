'use strict';
'use client';

import React from 'react';
import { Banknote, HandCoins, Wheat, Landmark } from 'lucide-react';

interface ShiftKpiCardsProps {
  todaySales?: number;
  creditRecovery?: number;
  todayPisaiKg?: number;
  cashDrawerBalance?: number;
  onCardClick?: (metric: 'sales' | 'recovery' | 'pisai' | 'drawer') => void;
}

export const ShiftKpiCards: React.FC<ShiftKpiCardsProps> = ({
  todaySales = 184500,
  creditRecovery = 42000,
  todayPisaiKg = 1250,
  cashDrawerBalance = 126500,
  onCardClick,
}) => {
  const cards = [
    {
      id: 'sales' as const,
      title: 'کل نقد سیلز',
      value: `Rs ${todaySales.toLocaleString()}`,
      icon: <Banknote size={20} color="#15803d" />,
    },
    {
      id: 'recovery' as const,
      title: 'ادھار وصولی',
      value: `Rs ${creditRecovery.toLocaleString()}`,
      icon: <HandCoins size={20} color="#0284c7" />,
    },
    {
      id: 'pisai' as const,
      title: 'گندم پسائی',
      value: `${todayPisaiKg.toLocaleString()} KG`,
      icon: <Wheat size={20} color="#d97706" />,
    },
    {
      id: 'drawer' as const,
      title: 'کیش دراز بیلنس',
      value: `Rs ${cashDrawerBalance.toLocaleString()}`,
      icon: <Landmark size={20} color="#475569" />,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        width: '100%',
        direction: 'rtl',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="touch-active"
          onClick={() => onCardClick?.(card.id)}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: onCardClick ? 'pointer' : 'default',
          }}
        >
          <div>
            <div
              className="font-nastaleeq"
              style={{
                fontSize: '13px',
                color: '#64748b',
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                fontSize: '18px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#0f172a',
                marginTop: '4px',
              }}
            >
              {card.value}
            </div>
          </div>

          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
