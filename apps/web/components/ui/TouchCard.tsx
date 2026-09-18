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
        borderRadius: '16px',
        backgroundColor: isSelected ? '#FFCB69' : '#FFFFFF',
        border: isSelected ? '3px solid #5E6348' : '2px solid #C2BAAA',
        boxShadow: isSelected ? '0 6px 16px rgba(27, 30, 19, 0.15)' : '0 2px 6px rgba(27, 30, 19, 0.05)',
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
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: isSelected ? '#E8AC65' : '#F4F1EA',
            border: '1.5px solid #C2BAAA',
            color: '#1B1E13',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
          }}
        >
          {product.icon || <Wheat size={24} />}
        </div>

        {/* Selected Checkmark */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '26px',
              height: '26px',
              borderRadius: '9999px',
              backgroundColor: '#5E6348',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={18} strokeWidth={3} />
          </div>
        )}

        {/* Rate Badge */}
        {isRateSet ? (
          <div
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              backgroundColor: isSelected ? '#FFFFFF' : '#F4F1EA',
              color: '#1B1E13',
              fontWeight: 900,
              fontSize: '15px',
              border: isSelected ? '2px solid #5E6348' : '1.5px solid #C2BAAA',
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
              padding: '5px 10px',
              borderRadius: '9999px',
              backgroundColor: '#F4F1EA',
              color: '#D08C60',
              border: '1.5px solid #D08C60',
              fontWeight: 900,
              fontSize: '13px',
            }}
          >
            <AlertTriangle size={15} color="#D08C60" /> Rate Unset
          </div>
        )}
      </div>

      {/* Main Titles: English + Prominent Urdu Nastaleeq */}
      <div style={{ marginTop: '12px' }}>
        <div
          className="font-nastaleeq"
          style={{
            fontSize: '28px',
            fontWeight: 900,
            color: '#1B1E13',
            textAlign: 'right',
            lineHeight: 1.2,
          }}
        >
          {product.nameUr}
        </div>

        <div style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? '#1B1E13' : '#4A4F35' }}>
          {product.nameEn}
        </div>
      </div>
    </div>
  );
};