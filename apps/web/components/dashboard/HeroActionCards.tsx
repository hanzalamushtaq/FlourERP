'use strict';
'use client';

import React from 'react';
import { ShoppingCart, Cog, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
  const { isUrdu, t } = useLanguage();

  const cards = [
    {
      id: 'billing',
      title: t('نیا بل بنائیں', 'Create New Bill'),
      hotkey: 'F8',
      icon: <ShoppingCart size={28} />,
      color: '#1877F2',
      bgLight: '#1877F2',
      onClick: onNewBill,
    },
    {
      id: 'pisai',
      title: t('گندم پسائی ٹوکن', 'Milling Token'),
      hotkey: 'F2',
      icon: <Cog size={28} />,
      color: '#D97706',
      bgLight: '#D97706',
      onClick: onNewPisaiToken,
    },
    {
      id: 'rates',
      title: t('ریٹ لسٹ', 'Daily Rate List'),
      hotkey: 'F3',
      icon: <Tag size={28} />,
      color: '#0E8A54',
      bgLight: '#0E8A54',
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
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="touch-active"
          onClick={card.onClick}
          style={{
            backgroundColor: card.bgLight,
            borderRadius: '16px',
            border: 'none',
            outline: 'none',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            boxShadow: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {/* Right: Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '13px',
                backgroundColor: '#FFFFFF',
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: 'none',
                boxShadow: 'none',
              }}
            >
              {card.icon}
            </div>

            <div>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#FFFFFF',
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
              border: 'none',
              boxShadow: 'none',
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
