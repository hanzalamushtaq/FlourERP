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
        backgroundColor: 'rgba(43, 29, 20, 0.65)',
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
          backgroundColor: '#FAF5EA',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 35px rgba(43, 29, 20, 0.25)',
          border: '2px solid #BAA587',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#F1DCA7',
            borderBottom: '1.5px solid #BAA587',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#2B1D14" />
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#2B1D14' }}>
                Daily Price Confirmation
              </h2>
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: '#2B1D14' }}>
              روزانہ نرخ نامہ کی تصدیق (24 گھنٹے میں ایک بار)
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2B1D14' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Informational Banner */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#F1DCA7',
            fontSize: '13px',
            color: '#2B1D14',
            fontWeight: 700,
            borderBottom: '1px solid #BAA587',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={18} color="#2B1D14" />
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
              fontWeight: 800,
              color: '#2B1D14',
              paddingBottom: '4px',
              borderBottom: '1.5px solid #BAA587',
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
                borderBottom: '1px dashed #BAA587',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#2B1D14' }}>{item.nameEn}</div>
                <div className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 700, color: '#2B1D14' }}>
                  {item.nameUr}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontWeight: 700, color: '#2B1D14' }}>
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
                      borderRadius: '8px',
                      border: '2px solid #BAA587',
                      backgroundColor: '#FAF5EA',
                      color: '#2B1D14',
                      fontSize: '16px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: 900, fontSize: '16px', color: '#2B1D14' }}>
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
                backgroundColor: '#FAF5EA',
                border: '1.5px solid #BAA587',
                borderRadius: '12px',
                padding: '14px',
                marginTop: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} color="#2B1D14" />
                <span style={{ fontWeight: 800, fontSize: '13px', color: '#2B1D14' }}>
                  {billerHoldState
                    ? 'BILL ON HOLD: Price change request sent to Admin!'
                    : 'Biller Notice: You cannot edit rates directly.'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#2B1D14', marginTop: '4px', fontWeight: 600 }}>
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
            backgroundColor: '#F1DCA7',
            borderTop: '1.5px solid #BAA587',
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
                  borderRadius: '10px',
                  backgroundColor: '#2B1D14',
                  color: '#FAF5EA',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {confirmed ? <CheckCircle2 size={18} color="#FAF5EA" /> : <Save size={18} color="#FAF5EA" />}
                {confirmed ? 'Prices Confirmed & Logged!' : 'Confirm & Apply Today’s Rates'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="touch-active"
                style={{
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5EA',
                  color: '#2B1D14',
                  border: '1.5px solid #BAA587',
                  fontSize: '14px',
                  fontWeight: 700,
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
                  borderRadius: '10px',
                  backgroundColor: '#2B1D14',
                  color: '#FAF5EA',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
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
                  borderRadius: '10px',
                  backgroundColor: '#FAF5EA',
                  color: '#2B1D14',
                  border: '1.5px solid #BAA587',
                  fontSize: '14px',
                  fontWeight: 700,
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
