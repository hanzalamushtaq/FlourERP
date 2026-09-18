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

  const weightInputRef = useRef<HTMLInputElement>(null);
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

  // Global Enter shortcut to print cash token
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReceiptOpen) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePrintCashTicket();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [weightKg, chargeAmount, receivedAmount, serviceType, customerName, isReceiptOpen]);

  // 1. Action: Print Cash Ticket (Does not demand customer details)
  const handlePrintCashTicket = () => {
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

  // 2. Action: Save as Credit Pisai (Demands customer details)
  const handleSaveAsCreditPisai = () => {
    if (numWeight <= 0 || numCharge <= 0) {
      alert('Please enter wheat weight and charge amount.');
      return;
    }

    if (!customerName.trim()) {
      setShowCustomerField(true);
      setCreditError('⚠️ Please enter customer name/phone for Pisai Udhaar!');
      setTimeout(() => {
        customerInputRef.current?.focus();
      }, 100);
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
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP: Service Type Selection */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Select Grinding Service (پیسائی کی قسم منتخب کریں)
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Click service to choose
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div
            onClick={() => setServiceType('safai_pisai')}
            className="touch-active"
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: serviceType === 'safai_pisai' ? '#fffbeb' : '#ffffff',
              border: serviceType === 'safai_pisai' ? '2.5px solid #d97706' : '1.5px solid #e2e8f0',
              boxShadow: serviceType === 'safai_pisai' ? '0 3px 8px rgba(217, 119, 6, 0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#b45309' }}>Full Service</div>
              <div className="font-nastaleeq" style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '1px 0' }}>
                صفائی اور پیسائی
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Grain cleaning + complete grinding</div>
            </div>

            {serviceType === 'safai_pisai' && (
              <div style={{ width: '22px', height: '22px', borderRadius: '9999px', backgroundColor: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} strokeWidth={3} />
              </div>
            )}
          </div>

          <div
            onClick={() => setServiceType('pisai')}
            className="touch-active"
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: serviceType === 'pisai' ? '#fffbeb' : '#ffffff',
              border: serviceType === 'pisai' ? '2.5px solid #d97706' : '1.5px solid #e2e8f0',
              boxShadow: serviceType === 'pisai' ? '0 3px 8px rgba(217, 119, 6, 0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#b45309' }}>Grinding Only</div>
              <div className="font-nastaleeq" style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '1px 0' }}>
                صرف پیسائی
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Direct grinding without cleaning</div>
            </div>

            {serviceType === 'pisai' && (
              <div style={{ width: '22px', height: '22px', borderRadius: '9999px', backgroundColor: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM: Entry Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 6px 20px -2px rgba(0, 0, 0, 0.06)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center' }}>
          {/* Left: Inputs for Weight & Manual Charge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
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
                    height: '60px',
                    borderRadius: '10px',
                    border: '2.5px solid #d97706',
                    backgroundColor: '#fffdfa',
                    fontSize: '34px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#0f172a',
                    padding: '0 60px 0 16px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '16px', fontSize: '18px', fontWeight: 900, color: '#94a3b8' }}>
                  KG
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                MANUAL GRINDING FEE (پیسائی کی اجرت - Rs):
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={chargeAmount}
                  onChange={(e) => {
                    setChargeAmount(e.target.value);
                    setIsReceivedAutoUpdated(true);
                  }}
                  style={{
                    width: '100%',
                    height: '60px',
                    borderRadius: '10px',
                    border: '2.5px solid #059669',
                    backgroundColor: '#fffdfa',
                    fontSize: '34px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#047857',
                    padding: '0 60px 0 16px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '16px', fontSize: '18px', fontWeight: 900, color: '#94a3b8' }}>
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
              borderRadius: '14px',
              padding: '18px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>
              CUSTOMER TOKEN NUMBER (ٹوکن نمبر)
            </span>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#0f172a',
                lineHeight: 1.1,
                margin: '6px 0',
                letterSpacing: '3px',
              }}
            >
              #{currentTokenPreview}
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#b45309' }}>
              گندم پیسائی ٹوکن
            </div>
          </div>
        </div>

        {/* 3. CASH RECEIVED (وصول رقم) & BALANCE CALCULATION FOR PISAI */}
        <div
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1.5px solid #cbd5e1',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div>
            <label style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
              CASH RECEIVED (گاہک سے وصول رقم - Rs):
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                step="any"
                value={receivedAmount}
                onChange={(e) => {
                  setReceivedAmount(e.target.value);
                  setIsReceivedAutoUpdated(false);
                }}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '8px',
                  border: '2px solid #059669',
                  backgroundColor: '#ffffff',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#065f46',
                  padding: '0 50px 0 14px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '14px', fontSize: '16px', fontWeight: 900, color: '#047857' }}>
                Rs
              </span>
            </div>
          </div>

          <div>
            {balanceRemaining > 0 ? (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>REMAINING SHORT (باقی ادھار):</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857' }}>CHANGE TO RETURN (واپسی):</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#047857' }}>✓ Exact Fee Received</div>
              </div>
            )}
          </div>
        </div>

        {/* 4. CUSTOMER DETAILS (Demanded if Credit chosen) */}
        {(showCustomerField || balanceRemaining > 0) && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: creditError ? '2px solid #ef4444' : '1px solid #fde68a',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={16} /> Customer Details for Pisai Udhaar (گاہک کا نام)
              </span>
              {creditError && (
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>
                  {creditError}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <input
                ref={customerInputRef}
                type="text"
                placeholder="Customer Name (گاہک کا نام)..."
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (e.target.value.trim()) setCreditError('');
                }}
                style={{ padding: '8px 12px', borderRadius: '6px', border: creditError ? '2px solid #ef4444' : '1px solid #d97706', fontSize: '13px', fontWeight: 700, outline: 'none' }}
              />
              <input
                type="text"
                placeholder="Phone (اختیاری)..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d97706', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {/* 5. THE 2 ACTION BUTTONS: PRINT CASH TICKET vs SAVE AS CREDIT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '14px', marginTop: '2px' }}>
          {/* Button 1: Print Cash Ticket */}
          <button
            type="button"
            onClick={handlePrintCashTicket}
            disabled={numWeight <= 0 || numCharge <= 0}
            className="touch-active"
            style={{
              height: '66px',
              borderRadius: '12px',
              backgroundColor: numWeight > 0 && numCharge > 0 ? '#059669' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '18px',
              fontWeight: 900,
              cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 6px 14px rgba(5, 150, 105, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <Printer size={26} />
            <div style={{ textAlign: 'left' }}>
              <div>PRINT CASH TICKET — [ENTER]</div>
              <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>
                Rs {numReceived} Cash (نقد ٹوکن پرنٹ کریں)
              </div>
            </div>
          </button>

          {/* Button 2: Save as Credit Pisai Ticket */}
          <button
            type="button"
            onClick={handleSaveAsCreditPisai}
            disabled={numWeight <= 0 || numCharge <= 0}
            className="touch-active"
            style={{
              height: '66px',
              borderRadius: '12px',
              backgroundColor: numWeight > 0 && numCharge > 0 ? '#d97706' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '17px',
              fontWeight: 900,
              cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 6px 14px rgba(217, 119, 6, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <BookOpen size={24} />
            <div style={{ textAlign: 'left' }}>
              <div>SAVE AS CREDIT</div>
              <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>
                Rs {balanceRemaining > 0 ? balanceRemaining : numCharge} to Udhaar (ادھار ٹوکن)
              </div>
            </div>
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
