'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Ticket, Printer, BookOpen, Check, UserCheck } from 'lucide-react';

export const PisaiBillingScreen: React.FC = () => {
  const [weightKg, setWeightKg] = useState<string>('25');
  const [chargeAmount, setChargeAmount] = useState<string>('150');
  const [receivedAmount, setReceivedAmount] = useState<string>('150');
  const [isReceivedAutoUpdated, setIsReceivedAutoUpdated] = useState<boolean>(true);
  const [serviceType, setServiceType] = useState<'safai_pisai' | 'pisai'>('safai_pisai');

  // Customer Credit State
  const [showCustomerField, setShowCustomerField] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [creditError, setCreditError] = useState<string>('');

  const [tokenCounter, setTokenCounter] = useState<number>(482);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Sequential Enter Refs
  const weightInputRef = useRef<HTMLInputElement>(null);
  const feeInputRef = useRef<HTMLInputElement>(null);
  const receivedInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);

  const numWeight = parseFloat(weightKg) || 0;
  const numCharge = parseFloat(chargeAmount) || 0;

  // Sync received amount when charge amount changes
  useEffect(() => {
    if (isReceivedAutoUpdated) {
      setReceivedAmount(chargeAmount);
    }
  }, [chargeAmount, isReceivedAutoUpdated]);

  const numReceived = parseFloat(receivedAmount) || 0;
  const balanceRemaining = Math.max(0, numCharge - numReceived);
  const changeToReturn = Math.max(0, numReceived - numCharge);

  useEffect(() => {
    weightInputRef.current?.focus();
    weightInputRef.current?.select();
  }, [serviceType]);

  // Action 1: Print Cash Ticket
  const handlePrintCashTicket = () => {
    if (numWeight <= 0 || numCharge <= 0) {
      alert('Please enter weight and charge.');
      weightInputRef.current?.focus();
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
      isCredit: false,
      subtotal: numCharge,
      discount: 0,
      netTotal: numCharge,
      cashReceived: numReceived,
      remainingBalance: balanceRemaining,
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  // Action 2: Save as Credit Pisai Ticket
  const handleSaveAsCreditPisai = () => {
    if (numWeight <= 0 || numCharge <= 0) {
      alert('Please enter weight and charge.');
      weightInputRef.current?.focus();
      return;
    }

    if (!customerName.trim()) {
      setShowCustomerField(true);
      setCreditError('⚠️ Please enter customer name for credit!');
      setTimeout(() => {
        customerInputRef.current?.focus();
      }, 80);
      return;
    }

    setCreditError('');
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
      customerName: `${customerName.trim()} ${customerPhone.trim() ? `(${customerPhone.trim()})` : ''}`,
      isCredit: true,
      subtotal: numCharge,
      discount: 0,
      netTotal: numCharge,
      cashReceived: numReceived,
      remainingBalance: balanceRemaining > 0 ? balanceRemaining : numCharge,
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  const currentTokenPreview = String(tokenCounter).padStart(4, '0');

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* 1. TOP: Compact Service Type Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div
          onClick={() => setServiceType('safai_pisai')}
          className="touch-active"
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: serviceType === 'safai_pisai' ? '#fffbeb' : '#ffffff',
            border: serviceType === 'safai_pisai' ? '2.5px solid #d97706' : '1px solid #cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309' }}>FULL SERVICE</span>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              صفائی اور پیسائی
            </div>
          </div>
          {serviceType === 'safai_pisai' && <Check size={16} color="#d97706" strokeWidth={3} />}
        </div>

        <div
          onClick={() => setServiceType('pisai')}
          className="touch-active"
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: serviceType === 'pisai' ? '#fffbeb' : '#ffffff',
            border: serviceType === 'pisai' ? '2.5px solid #d97706' : '1px solid #cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309' }}>GRINDING ONLY</span>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              صرف پیسائی
            </div>
          </div>
          {serviceType === 'pisai' && <Check size={16} color="#d97706" strokeWidth={3} />}
        </div>
      </div>

      {/* 2. BOTTOM: Entry Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center' }}>
          {/* Left: Inputs for Weight & Manual Charge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  1. WHEAT WEIGHT (وزن) [Enter ➔ Fee]:
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Enter ➔ Next</span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={weightInputRef}
                  type="number"
                  step="any"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      feeInputRef.current?.focus();
                      feeInputRef.current?.select();
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '8px',
                    border: '2px solid #d97706',
                    backgroundColor: '#fffdfa',
                    fontSize: '24px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#0f172a',
                    padding: '0 45px 0 12px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', fontSize: '14px', fontWeight: 900, color: '#94a3b8' }}>
                  KG
                </span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  2. MANUAL FEE (پیسائی رقم) [Enter ➔ Cash Recv]:
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Enter ➔ Next</span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={feeInputRef}
                  type="number"
                  value={chargeAmount}
                  onChange={(e) => {
                    setChargeAmount(e.target.value);
                    setIsReceivedAutoUpdated(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      receivedInputRef.current?.focus();
                      receivedInputRef.current?.select();
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '8px',
                    border: '2px solid #059669',
                    backgroundColor: '#fffdfa',
                    fontSize: '24px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#047857',
                    padding: '0 45px 0 12px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', fontSize: '14px', fontWeight: 900, color: '#94a3b8' }}>
                  Rs
                </span>
              </div>
            </div>
          </div>

          {/* Right: Token Preview Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #000000',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
              CUSTOMER TOKEN NUMBER (ٹوکن نمبر)
            </span>
            <div
              style={{
                fontSize: '44px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#0f172a',
                lineHeight: 1.1,
                margin: '2px 0',
                letterSpacing: '2px',
              }}
            >
              #{currentTokenPreview}
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: '#b45309' }}>
              گندم پیسائی ٹوکن
            </div>
          </div>
        </div>

        {/* 3. CASH RECEIVED (وصول رقم) & BALANCE CALCULATION FOR PISAI */}
        <div
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1px solid #cbd5e1',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '14px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a' }}>
                3. CASH RECEIVED (وصول رقم) [Press Enter ➔ Print]:
              </label>
              <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>Enter ➔ Print</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                ref={receivedInputRef}
                type="number"
                step="any"
                value={receivedAmount}
                onChange={(e) => {
                  setReceivedAmount(e.target.value);
                  setIsReceivedAutoUpdated(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePrintCashTicket();
                  }
                }}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  border: '2px solid #059669',
                  backgroundColor: '#ffffff',
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#065f46',
                  padding: '0 40px 0 12px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '12px', fontSize: '13px', fontWeight: 900, color: '#047857' }}>
                Rs
              </span>
            </div>
          </div>

          <div>
            {balanceRemaining > 0 ? (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', padding: '4px 8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#92400e' }}>REMAINING SHORT (باقی):</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#047857' }}>CHANGE TO RETURN (واپسی):</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>✓ Exact Fee Received</div>
              </div>
            )}
          </div>
        </div>

        {/* 4. CUSTOMER DETAILS */}
        {(showCustomerField || balanceRemaining > 0) && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: creditError ? '2px solid #ef4444' : '1px solid #fde68a',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '11px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={13} /> Customer Details for Pisai Udhaar (گاہک کا نام)
              </span>
              {creditError && (
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>
                  {creditError}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
              <input
                ref={customerInputRef}
                type="text"
                placeholder="Customer Name (گاہک کا نام)..."
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (e.target.value.trim()) setCreditError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveAsCreditPisai();
                  }
                }}
                style={{ padding: '6px 10px', borderRadius: '6px', border: creditError ? '2px solid #ef4444' : '1px solid #d97706', fontSize: '12px', fontWeight: 700, outline: 'none' }}
              />
              <input
                type="text"
                placeholder="Phone (اختیاری)..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveAsCreditPisai();
                  }
                }}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d97706', fontSize: '12px', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {/* 5. THE 2 ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={handlePrintCashTicket}
            disabled={numWeight <= 0 || numCharge <= 0}
            className="touch-active"
            style={{
              height: '52px',
              borderRadius: '10px',
              backgroundColor: numWeight > 0 && numCharge > 0 ? '#059669' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '16px',
              fontWeight: 900,
              cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Printer size={22} />
            <span>PRINT CASH TICKET — [ENTER] (Rs {numReceived} نقد)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAsCreditPisai}
            disabled={numWeight <= 0 || numCharge <= 0}
            className="touch-active"
            style={{
              height: '52px',
              borderRadius: '10px',
              backgroundColor: numWeight > 0 && numCharge > 0 ? '#d97706' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: 900,
              cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={20} />
            <span>SAVE AS CREDIT (Rs {balanceRemaining > 0 ? balanceRemaining : numCharge} ادھار)</span>
          </button>
        </div>
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
