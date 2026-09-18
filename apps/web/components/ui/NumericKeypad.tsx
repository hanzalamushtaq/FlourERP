'use strict';
'use client';

import React from 'react';
import { Delete, XCircle } from 'lucide-react';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onQuickAdd?: (amount: number) => void;
  mode?: 'weight' | 'amount';
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onClear,
  onBackspace,
  onQuickAdd,
  mode = 'weight',
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  const quickIncrements =
    mode === 'weight'
      ? [
          { label: '+5 kg', value: 5 },
          { label: '+10 kg', value: 10 },
          { label: '+20 kg', value: 20 },
          { label: '+40 kg (Bori)', value: 40 },
        ]
      : [
          { label: '+100', value: 100 },
          { label: '+200', value: 200 },
          { label: '+500', value: 500 },
          { label: '+1,000', value: 1000 },
        ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Quick Add Pills */}
      {onQuickAdd && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {quickIncrements.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickAdd(item.value)}
              className="touch-active"
              style={{
                padding: '10px 4px',
                borderRadius: '12px',
                backgroundColor: '#C8D5B9',
                color: '#4A7C59',
                border: '1.5px solid #8FC0A9',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Numeric Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onKeyPress(digit)}
            className="touch-active"
            style={{
              height: '62px',
              borderRadius: '12px',
              backgroundColor: '#FAF3DD',
              color: '#4A7C59',
              border: '2px solid #8FC0A9',
              fontSize: '26px',
              fontWeight: 800,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(74, 124, 89, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {digit}
          </button>
        ))}

        {/* Backspace Key */}
        <button
          type="button"
          onClick={onBackspace}
          className="touch-active"
          style={{
            height: '62px',
            borderRadius: '12px',
            backgroundColor: '#4A7C59',
            color: '#FAF3DD',
            border: '2px solid #4A7C59',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Backspace"
        >
          <Delete size={26} strokeWidth={2.4} color="#FAF3DD" />
        </button>
      </div>

      {/* Clear Button */}
      <button
        type="button"
        onClick={onClear}
        className="touch-active"
        style={{
          height: '46px',
          borderRadius: '12px',
          backgroundColor: '#4A7C59',
          color: '#FAF3DD',
          border: '1.5px solid #4A7C59',
          fontSize: '15px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <XCircle size={18} color="#FAF3DD" /> Clear Entry (صاف کریں)
      </button>
    </div>
  );
};
