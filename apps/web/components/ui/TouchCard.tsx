'use strict';
'use client';

import React from 'react';
import { Wheat, Check, AlertTriangle } from 'lucide-react';

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

export const TouchCard: React.FC<TouchCardProps> = ({
  product,
  isSelected,
  onSelect,
}) => {
  const isRateSet = product.ratePerKg > 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="touch-active"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 14px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: isSelected ? 'var(--wheat-50)' : 'var(--bg-card)',
        border: isSelected
          ? '3px solid var(--wheat-600)'
          : '2px solid var(--border-subtle)',
        boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        cursor: 'pointer',
        minHeight: '135px',
        opacity: isRateSet ? 1 : 0.85,
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
            borderRadius: 'var(--radius-md)',
            backgroundColor: isSelected ? 'var(--wheat-500)' : 'var(--bg-subtle)',
            color: isSelected ? 'var(--text-inverse)' : 'var(--wheat-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          {product.icon || <Wheat size={22} />}
        </div>

        {/* Selected Checkmark */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--wheat-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} strokeWidth={3} />
          </div>
        )}

        {/* Rate Badge */}
        {isRateSet ? (
          <div
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isSelected ? 'var(--wheat-200)' : 'var(--emerald-50)',
              color: isSelected ? 'var(--wheat-700)' : 'var(--emerald-700)',
              fontWeight: 800,
              fontSize: '14px',
              border: isSelected
                ? '1px solid var(--wheat-400)'
                : '1px solid #a7f3d0',
            }}
          >
            Rs {product.ratePerKg}/KG
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--rose-50)',
              color: 'var(--rose-600)',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            <AlertTriangle size={14} /> Rate Unset
          </div>
        )}
      </div>

      {/* Main Titles: English + Prominent Urdu Nastaleeq */}
      <div style={{ marginTop: '12px' }}>
        <div
          className="font-nastaleeq"
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textAlign: 'right',
            marginBottom: '2px',
            letterSpacing: '0.5px',
          }}
        >
          {product.nameUr}
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {product.nameEn}
        </div>
      </div>
    </div>
  );
};
