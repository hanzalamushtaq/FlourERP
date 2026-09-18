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
    { id: '1', nameEn: 'Chakki Atta', nameUr: 'Ãšâ€ ÃšÂ©Ã›Å’ Ã˜Â¢Ã™Â¹Ã˜Â§ (ÃšÂ¯Ã™â€ Ã˜Â¯Ã™â€¦)', yesterdayRate: 138, todayRate: 140 },
    { id: '2', nameEn: 'Fine Atta', nameUr: 'Ã™ÂÃ˜Â§Ã˜Â¦Ã™â€  Ã˜Â¢Ã™Â¹Ã˜Â§', yesterdayRate: 145, todayRate: 148 },
    { id: '3', nameEn: 'Maida Special', nameUr: 'Ã™â€¦Ã›Å’Ã˜Â¯Ã›Â Ã˜Â§Ã˜Â³Ã™Â¾Ã›Å’Ã˜Â´Ã™â€ž', yesterdayRate: 155, todayRate: 155 },
    { id: '4', nameEn: 'Suji / Semolina', nameUr: 'Ã˜Â®Ã˜Â§Ã™â€žÃ˜Âµ Ã˜Â³Ã™Ë†Ã˜Â¬Ã›Å’', yesterdayRate: 160, todayRate: 160 },
    { id: '5', nameEn: 'Chokar / Bran', nameUr: 'Ãšâ€ Ã™Ë†ÃšÂ©Ã˜Â± (ÃšÂ©ÃšÂ¾Ã™â€ž)', yesterdayRate: 90, todayRate: 95 },
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
        backgroundColor: 'rgba(27, 30, 19, 0.7)',
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
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '2.5px solid #5E6348',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FFCB69',
            borderBottom: '2px solid #5E6348',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#1B1E13" />
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1B1E13' }}>
                Daily Price Confirmation
              </h2>
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: '#1B1E13' }}>
              Ã˜Â±Ã™Ë†Ã˜Â²Ã˜Â§Ã™â€ Ã›Â Ã™â€ Ã˜Â±Ã˜Â® Ã™â€ Ã˜Â§Ã™â€¦Ã›Â ÃšÂ©Ã›Å’ Ã˜ÂªÃ˜ÂµÃ˜Â¯Ã›Å’Ã™â€š (24 ÃšÂ¯ÃšÂ¾Ã™â€ Ã™Â¹Ã›â€™ Ã™â€¦Ã›Å’ÃšÂº Ã˜Â§Ã›Å’ÃšÂ© Ã˜Â¨Ã˜Â§Ã˜Â±)
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B1E13' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Informational Banner */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#F4F1EA',
            fontSize: '13px',
            color: '#1B1E13',
            fontWeight: 700,
            borderBottom: '2px solid #5E6348',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={18} color="#1B1E13" />
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
              color: '#1B1E13',
              paddingBottom: '4px',
              borderBottom: '1.5px solid #BAA587',
            }}
          >
            <span>PRODUCT (Ã™Â¾Ã˜Â±Ã™Ë†ÃšË†ÃšÂ©Ã™Â¹)</span>
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
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1B1E13' }}>{item.nameEn}</div>
                <div className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 700, color: '#1B1E13' }}>
                  {item.nameUr}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontWeight: 700, color: '#1B1E13' }}>
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
                      border: '2px solid #5E6348',
                      backgroundColor: '#FFFFFF',
                      color: '#1B1E13',
                      fontSize: '16px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: 900, fontSize: '16px', color: '#1B1E13' }}>
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
                backgroundColor: '#F8FAF8',
                border: '2px solid #C2BAAA',
                borderRadius: '12px',
                padding: '14px',
                marginTop: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} color="#1B1E13" />
                <span style={{ fontWeight: 800, fontSize: '13px', color: '#1B1E13' }}>
                  {billerHoldState
                    ? 'BILL ON HOLD: Price change request sent to Admin!'
                    : 'Biller Notice: You cannot edit rates directly.'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#1B1E13', marginTop: '4px', fontWeight: 600 }}>
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
            backgroundColor: '#F4F1EA',
            borderTop: '2px solid #C2BAAA',
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
                  backgroundColor: '#5E6348',
                  color: '#FFFFFF',
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
                {confirmed ? <CheckCircle2 size={18} color="#1B1E13" /> : <Save size={18} color="#1B1E13" />}
                {confirmed ? 'Prices Confirmed & Logged!' : 'Confirm & Apply TodayÃ¢â‚¬â„¢s Rates'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="touch-active"
                style={{
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#1B1E13',
                  border: '2px solid #C2BAAA',
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
                  backgroundColor: '#5E6348',
                  color: '#FFFFFF',
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
                  backgroundColor: '#FFFFFF',
                  color: '#1B1E13',
                  border: '2px solid #C2BAAA',
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

