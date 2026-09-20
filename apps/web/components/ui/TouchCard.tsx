'use client';

import React from 'react';
import { Wheat, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface Product {
  id: string;
  nameEn: string;
  nameUr: string;
  ratePerKg: number;
  icon?: string;
  color?: string;
  unit: string;
  isActive: boolean;
}

interface TouchCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
}

const PRODUCT_THEMES: Record<string, {
  bg: string;
  bgSelected: string;
  text: string;
  subText: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
}> = {
  '1': {
    bg: '#FEF9E7',
    bgSelected: '#FDE68A',
    text: '#78350F',
    subText: '#92400E',
    accent: '#B45309',
    badgeBg: '#FEF08A',
    badgeText: '#78350F',
  },
  '2': {
    bg: '#F0F9FF',
    bgSelected: '#BAE6FD',
    text: '#0369A1',
    subText: '#0284C7',
    accent: '#0284C7',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
  },
  '3': {
    bg: '#FDF2F8',
    bgSelected: '#FBCFE8',
    text: '#9D174D',
    subText: '#BE185D',
    accent: '#DB2777',
    badgeBg: '#FCE7F3',
    badgeText: '#9D174D',
  },
  '4': {
    bg: '#FFF7ED',
    bgSelected: '#FED7AA',
    text: '#9A3412',
    subText: '#C2410C',
    accent: '#EA580C',
    badgeBg: '#FFEDD5',
    badgeText: '#9A3412',
  },
  '5': {
    bg: '#F5F5F4',
    bgSelected: '#E7E5E4',
    text: '#44403C',
    subText: '#57534E',
    accent: '#78716C',
    badgeBg: '#E7E5E4',
    badgeText: '#44403C',
  },
  '6': {
    bg: '#FDF8F0',
    bgSelected: '#FCEFD8',
    text: '#713F12',
    subText: '#854D0E',
    accent: '#92400E',
    badgeBg: '#F3E8D3',
    badgeText: '#713F12',
  },
};

export const TouchCard: React.FC<TouchCardProps> = ({
  product,
  isSelected,
  onSelect,
}) => {
  const { isUrdu } = useLanguage();
  const isRateSet = product.ratePerKg > 0;
  const theme = PRODUCT_THEMES[product.id] || {
    bg: '#F8FAFC',
    bgSelected: '#EFF6FF',
    text: '#0F172A',
    subText: '#64748B',
    accent: '#1877F2',
    badgeBg: '#F1F5F9',
    badgeText: '#0F172A',
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="touch-active"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '14px 14px 12px 14px',
        borderRadius: '16px',
        backgroundColor: isSelected ? theme.bgSelected : theme.bg,
        border: 'none',
        boxShadow: 'none',
        cursor: 'pointer',
        minHeight: '102px',
        opacity: isRateSet ? 1 : 0.85,
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Top Bar: Icon & Rate Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: 'none',
            color: theme.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: 'none',
          }}
        >
          {product.icon || <Wheat size={22} />}
        </div>

        {/* Selected Pill / Checkmark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          {isRateSet ? (
            <div
              style={{
                padding: '3px 8px',
                borderRadius: '7px',
                backgroundColor: isSelected ? '#FFFFFF' : theme.badgeBg,
                color: isSelected ? theme.text : theme.badgeText,
                fontWeight: 900,
                fontSize: '12px',
                border: 'none',
                boxShadow: 'none',
                fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
              }}
            >
              {isUrdu ? `${product.ratePerKg} روپے` : `Rs ${product.ratePerKg}`}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                fontWeight: 700,
                fontSize: '11px',
              }}
            >
              <AlertTriangle size={12} /> {isUrdu ? 'غیر مقرر' : 'Unset'}
            </div>
          )}

          {isSelected && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: theme.accent,
                fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                lineHeight: 1,
              }}
            >
              {isUrdu ? '● منتخب' : '● Selected'}
            </span>
          )}
        </div>
      </div>

      {/* Main Titles */}
      <div style={{ marginTop: '8px' }}>
        <div
          className={isUrdu ? 'font-nastaleeq' : ''}
          style={{
            fontSize: '15px',
            fontWeight: 900,
            color: theme.text,
            textAlign: 'left',
            lineHeight: 1.25,
          }}
        >
          {isUrdu ? product.nameUr : product.nameEn}
        </div>
      </div>
    </div>
  );
};
