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
        backgroundColor: 'rgba(51, 61, 41, 0.65)',
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
          backgroundColor: '#F6F7F0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 35px rgba(51, 61, 41, 0.25)',
          border: '2px solid #B6AD90',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#C2C5AA',
            borderBottom: '1.5px solid #B6AD90',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#333D29" />
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#333D29' }}>
                Daily Price Confirmation
              </h2>
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: '#333D29' }}>
              روزانہ نرخ نامہ کی تصدیق (24 گھنٹے میں ایک بار)
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333D29' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Informational Banner */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#C2C5AA',
            fontSize: '13px',
            color: '#333D29',
            fontWeight: 700,
            borderBottom: '1px solid #B6AD90',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={18} color="#333D29" />
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
              color: '#333D29',
              paddingBottom: '4px',
              borderBottom: '1.5px solid #B6AD90',
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
                borderBottom: '1px dashed #B6AD90',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#333D29' }}>{item.nameEn}</div>
                <div className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 700, color: '#333D29' }}>
                  {item.nameUr}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontWeight: 700, color: '#333D29' }}>
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
                      border: '2px solid #B6AD90',
                      backgroundColor: '#F6F7F0',
                      color: '#333D29',
                      fontSize: '16px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: 900, fontSize: '16px', color: '#333D29' }}>
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
                backgroundColor: '#F6F7F0',
                border: '1.5px solid #B6AD90',
                borderRadius: '12px',
                padding: '14px',
                marginTop: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} color="#333D29" />
                <span style={{ fontWeight: 800, fontSize: '13px', color: '#333D29' }}>
                  {billerHoldState
                    ? 'BILL ON HOLD: Price change request sent to Admin!'
                    : 'Biller Notice: You cannot edit rates directly.'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#333D29', marginTop: '4px', fontWeight: 600 }}>
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
            backgroundColor: '#C2C5AA',
            borderTop: '1.5px solid #B6AD90',
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
                  backgroundColor: '#333D29',
                  color: '#F6F7F0',
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
                {confirmed ? <CheckCircle2 size={18} color="#F6F7F0" /> : <Save size={18} color="#F6F7F0" />}
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
                  backgroundColor: '#F6F7F0',
                  color: '#333D29',
                  border: '1.5px solid #B6AD90',
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
                  backgroundColor: '#333D29',
                  color: '#F6F7F0',
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
                  backgroundColor: '#F6F7F0',
                  color: '#333D29',
                  border: '1.5px solid #B6AD90',
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
