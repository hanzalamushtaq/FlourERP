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
        backgroundColor: isSelected ? '#C2C5AA' : '#F4F5EE',
        border: isSelected ? '3px solid #7F4F24' : '1.5px solid #B6AD90',
        boxShadow: isSelected ? '0 8px 18px rgba(65, 72, 51, 0.22)' : '0 2px 8px rgba(65, 72, 51, 0.08)',
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
            backgroundColor: isSelected ? '#7F4F24' : '#C2C5AA',
            border: isSelected ? '1px solid #7F4F24' : '1px solid #B6AD90',
            color: isSelected ? '#F4F5EE' : '#414833',
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
              backgroundColor: '#7F4F24',
              color: '#F4F5EE',
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
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: isSelected ? '#fef3c7' : '#f1f5f9',
              color: isSelected ? '#b45309' : '#475569',
              fontWeight: 800,
              fontSize: '11.5px',
              border: isSelected ? '1px solid #fde68a' : '1px solid #e2e8f0',
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
              padding: '2px 6px',
              borderRadius: '6px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            <AlertTriangle size={12} /> Rate Unset
          </div>
        )}
      </div>

      {/* Main Titles */}
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div
          className="font-nastaleeq"
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: '#0f172a',
            textAlign: 'right',
            lineHeight: 1.2,
          }}
        >
          {product.nameUr}
        </div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b',
          }}
        >
          {product.nameEn}
        </div>
      </div>
    </div>
  );
};
