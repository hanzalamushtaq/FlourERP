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
        backgroundColor: isSelected ? '#F1DCA7' : '#FAF5EA',
        border: isSelected ? '3px solid #E8AC65' : '1.5px solid #BAA587',
        boxShadow: isSelected ? '0 8px 18px rgba(43, 29, 20, 0.22)' : '0 2px 8px rgba(43, 29, 20, 0.08)',
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
            borderRadius: '10px',
            backgroundColor: isSelected ? '#E8AC65' : '#F1DCA7',
            border: isSelected ? '1px solid #E8AC65' : '1px solid #BAA587',
            color: isSelected ? '#2B1D14' : '#2B1D14',
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
              borderRadius: '9999px',
              backgroundColor: '#E8AC65',
              color: '#FAF5EA',
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
              borderRadius: '9999px',
              backgroundColor: isSelected ? '#FFCB69' : '#FAF5EA',
              color: '#2B1D14',
              fontWeight: 800,
              fontSize: '14px',
              border: isSelected ? '1.5px solid #E8AC65' : '1px solid #BAA587',
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
              borderRadius: '9999px',
              backgroundColor: '#FAF5EA',
              color: '#2B1D14',
              border: '1px solid #BAA587',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            <AlertTriangle size={14} color="#2B1D14" /> Rate Unset
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
            color: '#2B1D14',
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
            fontWeight: 700,
            color: '#2B1D14',
          }}
        >
          {product.nameEn}
        </div>
      </div>
    </div>
  );
};
