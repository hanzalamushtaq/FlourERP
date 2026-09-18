'use strict';
'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Clock, ShieldCheck, AlertCircle, Save } from 'lucide-react';

interface DailyPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

interface PriceItem {
  id: string;
  nameEn: string;
  nameUr: string;
  yesterdayRate: number;
  todayRate: number;
}

export const DailyPriceModal: React.FC<DailyPriceModalProps> = ({
  isOpen,
  onClose,
  isAdmin = true,
}) => {
  const [prices, setPrices] = useState<PriceItem[]>([
    { id: '1', nameEn: 'Chakki Atta', nameUr: 'چکی آٹا (گندم)', yesterdayRate: 138, todayRate: 140 },
    { id: '2', nameEn: 'Fine Atta', nameUr: 'فائن آٹا', yesterdayRate: 145, todayRate: 148 },
    { id: '3', nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', yesterdayRate: 155, todayRate: 155 },
    { id: '4', nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', yesterdayRate: 160, todayRate: 160 },
    { id: '5', nameEn: 'Chokar / Bran', nameUr: 'چوکر (کھل)', yesterdayRate: 90, todayRate: 95 },
  ]);

  const [billerHoldState, setBillerHoldState] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRateChange = (id: string, newRate: number) => {
    setPrices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, todayRate: newRate } : item))
    );
  };

  const handleConfirmAll = () => {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9995,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          border: '1.5px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--wheat-50)',
            borderBottom: '1.5px solid var(--wheat-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--wheat-700)" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--wheat-700)' }}>
                Daily Price Confirmation
              </h2>
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              روزانہ نرخ نامہ کی تصدیق (24 گھنٹے میں ایک بار)
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Informational Banner */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={18} color="var(--emerald-600)" />
          <span>
            First bill of the day protocol: Rates must be confirmed before counter sales proceed.
          </span>
        </div>

        {/* Product Rates Table */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              paddingBottom: '4px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <span>PRODUCT (پروڈکٹ)</span>
            <span style={{ textAlign: 'center' }}>YESTERDAY RATE</span>
            <span style={{ textAlign: 'right' }}>TODAY RATE (Rs/KG)</span>
          </div>

          {prices.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px dashed var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.nameEn}</div>
                <div className="font-nastaleeq" style={{ fontSize: '16px', color: 'var(--wheat-700)' }}>
                  {item.nameUr}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Rs {item.yesterdayRate}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {isAdmin ? (
                  <input
                    type="number"
                    value={item.todayRate}
                    onChange={(e) => handleRateChange(item.id, parseFloat(e.target.value) || 0)}
                    style={{
                      width: '90px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '2px solid var(--wheat-500)',
                      fontSize: '16px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
                    Rs {item.todayRate}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Biller Mode Test State */}
          {!isAdmin && (
            <div
              style={{
                backgroundColor: billerHoldState ? '#fee2e2' : 'var(--bg-subtle)',
                border: billerHoldState ? '1.5px solid #ef4444' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginTop: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} color={billerHoldState ? '#b91c1c' : '#4b5563'} />
                <span style={{ fontWeight: 700, fontSize: '13px' }}>
                  {billerHoldState
                    ? 'BILL ON HOLD: Price change request sent to Admin!'
                    : 'Biller Notice: You cannot edit rates directly.'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {billerHoldState
                  ? 'Counter bill is locked until Admin confirms or rejects new pricing.'
                  : 'Click below to request rate update from Admin or keep previous rates to proceed.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-subtle)',
            borderTop: '1.5px solid var(--border-medium)',
            display: 'flex',
            gap: '12px',
          }}
        >
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={handleConfirmAll}
                className="touch-active"
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--emerald-600)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {confirmed ? <CheckCircle2 size={18} /> : <Save size={18} />}
                {confirmed ? 'Prices Confirmed & Logged!' : 'Confirm & Apply Today’s Rates'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="touch-active"
                style={{
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Keep Previous Rates
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setBillerHoldState(true)}
                className="touch-active"
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--wheat-600)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Request Rate Change (Hold Bill)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="touch-active"
                style={{
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Proceed With Previous Rates
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
