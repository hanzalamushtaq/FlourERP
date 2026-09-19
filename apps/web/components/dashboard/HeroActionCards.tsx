'use strict';
'use client';

import React from 'react';
import { ShoppingCart, Cog, Tag } from 'lucide-react';

interface HeroActionCardsProps {
  onNewBill: () => void;
  onNewPisaiToken: () => void;
  onEditRates: () => void;
}

export const HeroActionCards: React.FC<HeroActionCardsProps> = ({
  onNewBill,
  onNewPisaiToken,
  onEditRates,
}) => {
  const cards = [
    {
      id: 'billing',
      title: 'نیا بل بنائیں',
      hotkey: 'F8',
      icon: <ShoppingCart size={28} />,
      color: '#d97706',
      bgLight: '#fffbeb',
      border: '#fde68a',
      onClick: onNewBill,
    },
    {
      id: 'pisai',
      title: 'گندم پسائی ٹوکن',
      hotkey: 'F2',
      icon: <Cog size={28} />,
      color: '#0284c7',
      bgLight: '#f0f9ff',
      border: '#bae6fd',
      onClick: onNewPisaiToken,
    },
    {
      id: 'rates',
      title: 'ریٹ لسٹ (نرخ)',
      hotkey: 'F3',
      icon: <Tag size={28} />,
      color: '#059669',
      bgLight: '#ecfdf5',
      border: '#a7f3d0',
      onClick: onEditRates,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px',
        width: '100%',
        direction: 'rtl',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="touch-active"
          onClick={card.onClick}
          style={{
            backgroundColor: card.bgLight,
            borderRadius: '14px',
            border: `2px solid ${card.border}`,
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          {/* Right: Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1.5px solid ${card.border}`,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              {card.icon}
            </div>

            <div>
              <h2
                className="font-nastaleeq"
                style={{
                  fontSize: '21px',
                  fontWeight: 900,
                  color:
                    card.color === '#d97706'
                      ? '#92400e'
                      : card.color === '#0284c7'
                      ? '#075985'
                      : '#065f46',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {card.title}
              </h2>
            </div>
          </div>

          {/* Left: Hotkey Badge */}
          <span
            style={{
              fontSize: '13px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              color: card.color,
              border: `1.5px solid ${card.border}`,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
              letterSpacing: '0.5px',
            }}
          >
            {card.hotkey}
          </span>
        </div>
      ))}
    </div>
  );
};
