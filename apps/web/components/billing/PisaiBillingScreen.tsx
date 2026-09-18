'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Sparkles, Ticket, ShieldCheck, Check } from 'lucide-react';

export const PisaiBillingScreen: React.FC = () => {
  const [weightKg, setWeightKg] = useState<string>('25');
  const [chargeAmount, setChargeAmount] = useState<string>('150');
  const [serviceType, setServiceType] = useState<'safai_pisai' | 'pisai'>('safai_pisai');
  const [customerName, setCustomerName] = useState<string>('');
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [tokenCounter, setTokenCounter] = useState<number>(482);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const weightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    weightInputRef.current?.focus();
    weightInputRef.current?.select();
  }, [serviceType]);

  // Global Enter shortcut to print token ticket
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReceiptOpen) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGenerateTicket();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [weightKg, chargeAmount, serviceType, customerName, isCredit, isReceiptOpen]);

  const numWeight = parseFloat(weightKg) || 0;
  const numCharge = parseFloat(chargeAmount) || 0;

  const handleGenerateTicket = () => {
    if (numWeight <= 0 || numCharge <= 0) {
      alert('Please enter wheat weight and charge amount.');
      return;
    }

    const tokenFormatted = String(tokenCounter).padStart(4, '0');
    setTokenCounter((prev) => prev + 1);

    const receipt: ReceiptData = {
      type: 'pisai',
      billNumber: `PISAI-${tokenFormatted}`,
      pisaiToken: tokenFormatted,
      serviceType: serviceType === 'safai_pisai' ? 'Safai + Pisai (صفائی اور پیسائی)' : 'Pisai Only (صرف پیسائی)',
      pisaiWeightKg: numWeight,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      billerName: 'Biller 1 (Counter)',
      customerName: customerName.trim() || undefined,
      isCredit,
      subtotal: numCharge,
      discount: 0,
      netTotal: numCharge,
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  const currentTokenPreview = String(tokenCounter).padStart(4, '0');

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. TOP: Service Type Selection */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            1. Select Grinding Service (پیسائی کی قسم منتخب کریں)
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Click or tap service
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Option 1: Safai + Pisai */}
          <div
            onClick={() => setServiceType('safai_pisai')}
            className="touch-active"
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              backgroundColor: serviceType === 'safai_pisai' ? '#fffbeb' : '#ffffff',
              border: serviceType === 'safai_pisai' ? '3px solid #d97706' : '1.5px solid #e2e8f0',
              boxShadow: serviceType === 'safai_pisai' ? '0 4px 12px rgba(217, 119, 6, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#b45309' }}>
                Full Service (صفائی + پیسائی)
              </div>
              <div
                className="font-nastaleeq"
                style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: '2px 0' }}
              >
                صفائی اور پیسائی
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Grain cleaning and complete grinding
              </div>
            </div>

            {serviceType === 'safai_pisai' && (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '9999px',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={18} strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Option 2: Pisai Only */}
          <div
            onClick={() => setServiceType('pisai')}
            className="touch-active"
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              backgroundColor: serviceType === 'pisai' ? '#fffbeb' : '#ffffff',
              border: serviceType === 'pisai' ? '3px solid #d97706' : '1.5px solid #e2e8f0',
              boxShadow: serviceType === 'pisai' ? '0 4px 12px rgba(217, 119, 6, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#b45309' }}>
                Grinding Only (صرف پیسائی)
              </div>
              <div
                className="font-nastaleeq"
                style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', margin: '2px 0' }}
              >
                صرف پیسائی
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Direct grinding without cleaning
              </div>
            </div>

            {serviceType === 'pisai' && (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '9999px',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={18} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM: Keyboard Entry Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.08)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center' }}>
          {/* Left: Direct Weight & Fee Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Weight Box */}
            <div>
              <label style={{ fontSize: '15px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                WHEAT WEIGHT (گندم کا وزن - KG):
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={weightInputRef}
                  type="number"
                  step="any"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  style={{
                    width: '100%',
                    height: '70px',
                    borderRadius: '14px',
                    border: '3px solid #d97706',
                    backgroundColor: '#fffdfa',
                    fontSize: '38px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#0f172a',
                    padding: '0 70px 0 18px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '18px', fontSize: '20px', fontWeight: 900, color: '#94a3b8' }}>
                  KG
                </span>
              </div>
            </div>

            {/* Fee Box */}
            <div>
              <label style={{ fontSize: '15px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                MANUAL GRINDING FEE (پیسائی کی اجرت - Rs):
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  style={{
                    width: '100%',
                    height: '70px',
                    borderRadius: '14px',
                    border: '3px solid #059669',
                    backgroundColor: '#fffdfa',
                    fontSize: '38px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#047857',
                    padding: '0 70px 0 18px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '18px', fontSize: '20px', fontWeight: 900, color: '#94a3b8' }}>
                  Rs
                </span>
              </div>
            </div>
          </div>

          {/* Right: Next Token Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #000000',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', letterSpacing: '1px' }}>
              CUSTOMER TOKEN NUMBER (ٹوکن نمبر)
            </span>
            <div
              style={{
                fontSize: '68px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#0f172a',
                lineHeight: 1.1,
                margin: '8px 0',
                letterSpacing: '4px',
              }}
            >
              #{currentTokenPreview}
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '22px', fontWeight: 700, color: '#b45309' }}>
              گندم پیسائی ٹوکن
            </div>
          </div>
        </div>

        {/* Optional Customer Name & Udhaar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: '#f8fafc',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isCredit}
              onChange={(e) => setIsCredit(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#d97706' }}
            />
            <span style={{ fontWeight: 800, fontSize: '14px', color: isCredit ? '#92400e' : '#334155' }}>
              Udhaar Customer (ادھار کھاتہ)
            </span>
          </label>

          <input
            type="text"
            placeholder="Customer name (optional)..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{
              flex: 1,
              maxWidth: '300px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        {/* Big Print Token Button */}
        <button
          type="button"
          onClick={handleGenerateTicket}
          disabled={numWeight <= 0 || numCharge <= 0}
          className="touch-active"
          style={{
            height: '70px',
            borderRadius: '14px',
            backgroundColor: numWeight > 0 && numCharge > 0 ? '#d97706' : '#94a3b8',
            color: '#ffffff',
            border: 'none',
            fontSize: '22px',
            fontWeight: 900,
            cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
            boxShadow: '0 8px 16px -2px rgba(217, 119, 6, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <Ticket size={30} />
          <span>ISSUE TOKEN #{currentTokenPreview} — [ENTER] (ٹوکن پرنٹ کریں)</span>
        </button>
      </div>

      {/* Receipt Modal */}
      <ReceiptPreviewModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          weightInputRef.current?.focus();
          weightInputRef.current?.select();
        }}
        data={receiptData}
      />
    </div>
  );
};
