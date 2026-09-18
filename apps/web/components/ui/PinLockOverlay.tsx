'use strict';
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
        backgroundColor: 'rgba(121, 125, 98, 0.65)',
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
          backgroundColor: '#F1DCA7',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 20px 35px rgba(121, 125, 98, 0.25)',
          border: '2.5px solid #797D62',
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
            backgroundColor: '#797D62',
            border: '1.5px solid #797D62',
            color: error ? '#F1DCA7' : '#F1DCA7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            transition: 'all 0.2s',
          }}
        >
          {error ? <ShieldAlert size={30} color="#F1DCA7" /> : <Lock size={30} color="#F1DCA7" />}
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#797D62' }}>
          Terminal Locked
        </h2>
        <p
          className="font-nastaleeq"
          style={{
            fontSize: '19px',
            color: '#797D62',
            margin: '4px 0 8px',
            fontWeight: 700,
          }}
        >
          ٹرمینل مقفل ہے — پن درج کریں
        </p>
        <p style={{ fontSize: '13px', color: '#797D62', marginBottom: '20px', fontWeight: 600 }}>
          {staffName} • Enter 4-digit PIN (Demo: 1234)
        </p>

        {/* PIN Indicators (Dots) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <div
                key={index}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '9999px',
                  backgroundColor: error
                    ? '#797D62'
                    : filled
                    ? '#797D62'
                    : '#F1DCA7',
                  border: filled ? 'none' : '2px solid #BAA587',
                  transform: filled ? 'scale(1.15)' : 'scale(1)',
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
            gap: '10px',
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="touch-active"
              style={{
                height: '56px',
                borderRadius: '12px',
                backgroundColor: '#F1DCA7',
                color: '#797D62',
                border: '2px solid #797D62',
                fontSize: '22px',
                fontWeight: 800,
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
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#F1DCA7',
              color: '#797D62',
              border: '2px solid #797D62',
              fontSize: '22px',
              fontWeight: 800,
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
              backgroundColor: '#797D62',
              color: '#F1DCA7',
              border: '1.5px solid #797D62',
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
