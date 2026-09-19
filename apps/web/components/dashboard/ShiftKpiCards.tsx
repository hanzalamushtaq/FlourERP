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
      title: 'آج کی کل نقد سیلز',
      value: `${todaySales.toLocaleString()} Rs`,
      icon: <Banknote size={24} color="#15803d" />,
      bgIcon: '#dcfce7',
      borderColor: '#e2e8f0',
      valueColor: '#0f172a',
    },
    {
      id: 'recovery' as const,
      title: 'ادھار وصولی (ریکوری)',
      value: `${creditRecovery.toLocaleString()} Rs`,
      icon: <HandCoins size={24} color="#0284c7" />,
      bgIcon: '#e0f2fe',
      borderColor: '#e2e8f0',
      valueColor: '#0f172a',
    },
    {
      id: 'pisai' as const,
      title: 'آج کی گندم پسائی',
      value: `${todayPisaiKg.toLocaleString()} KG`,
      icon: <Wheat size={24} color="#d97706" />,
      bgIcon: '#fef3c7',
      borderColor: '#e2e8f0',
      valueColor: '#0f172a',
      isKg: true,
    },
    {
      id: 'drawer' as const,
      title: 'کیش دراز بیلنس (موجود)',
      value: `${cashDrawerBalance.toLocaleString()} Rs`,
      icon: <Landmark size={24} color="#475569" />,
      bgIcon: '#f1f5f9',
      borderColor: '#e2e8f0',
      valueColor: '#0f172a',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
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
            borderRadius: '16px',
            border: `1.5px solid ${card.borderColor}`,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            cursor: onCardClick ? 'pointer' : 'default',
          }}
        >
          {/* Text Info */}
          <div>
            <div
              className="font-nastaleeq"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#64748b',
                lineHeight: 1.2,
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: card.valueColor,
                marginTop: '6px',
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
              }}
            >
              {card.isKg && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: '#fef3c7',
                    color: '#b45309',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  KG
                </span>
              )}
              <span>{card.value}</span>
            </div>
          </div>

          {/* Right Icon Circle */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: card.bgIcon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
