'use client';

import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';

interface PinLockOverlayProps {
  isLocked: boolean;
  onUnlock: () => void;
  staffName?: string;
}

export const PinLockOverlay: React.FC<PinLockOverlayProps> = ({
  isLocked,
  onUnlock,
  staffName = 'Counter Staff (Biller 1)',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = '1234';

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setError(false);
          setTimeout(() => {
            setPin('');
            onUnlock();
          }, 150);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(65, 72, 51, 0.65)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          backgroundColor: '#F4F5EE',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 20px 35px rgba(65, 72, 51, 0.25)',
          border: '2px solid #B6AD90',
          textAlign: 'center',
          animation: error ? 'shake 0.4s ease' : 'none',
        }}
      >
        {/* Lock Icon Badge */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '9999px',
            backgroundColor: '#414833',
            border: '1.5px solid #414833',
            color: error ? '#F4F5EE' : '#F4F5EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            transition: 'all 0.2s',
          }}
        >
          {error ? <ShieldAlert size={30} color="#F4F5EE" /> : <Lock size={30} color="#F4F5EE" />}
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
          Terminal Locked
        </h2>
        <p
          className="font-nastaleeq"
          style={{
            fontSize: '14px',
            color: '#475569',
            margin: '2px 0 6px',
            fontWeight: 700,
          }}
        >
          ٹرمینل مقفل ہے — پن درج کریں
        </p>
        <p style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '16px', fontWeight: 600 }}>
          {staffName} • Enter 4-digit PIN (Demo: 1234)
        </p>

        {/* PIN Indicators (Dots) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <div
                key={index}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '9999px',
                  backgroundColor: error
                    ? '#ef4444'
                    : filled
                    ? '#0f172a'
                    : '#e2e8f0',
                  border: filled ? 'none' : '1.5px solid #cbd5e1',
                  transform: filled ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                }}
              />
            );
          })}
        </div>

        {/* Keypad */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="touch-active"
              style={{
                height: '46px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                fontSize: '18px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="touch-active"
            style={{
              height: '46px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              fontSize: '18px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="touch-active"
            style={{
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#414833',
              color: '#F4F5EE',
              border: '1.5px solid #414833',
              fontSize: '18px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⌫
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};
