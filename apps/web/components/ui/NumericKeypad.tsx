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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>

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
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              fontSize: '18px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
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
            backgroundColor: '#7F4F24',
            color: '#F4F5EE',
            border: '2px solid #7F4F24',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Backspace"
        >
          <Delete size={26} strokeWidth={2.4} color="#F4F5EE" />
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
          backgroundColor: '#414833',
          color: '#F4F5EE',
          border: '1.5px solid #414833',
          fontSize: '15px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <XCircle size={18} color="#F4F5EE" /> Clear Entry (صاف کریں)
      </button>
    </div>
  );
};
