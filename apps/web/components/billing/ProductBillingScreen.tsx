'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../ui/TouchCard';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, Scale, Banknote, Tag, UserCheck, Check, BookOpen } from 'lucide-react';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameEn: 'Chakki Atta', nameUr: 'چکی آٹا (گندم)', ratePerKg: 140, unit: 'KG', isActive: true, icon: '🌾' },
  { id: '2', nameEn: 'Fine Atta', nameUr: 'فائن آٹا', ratePerKg: 148, unit: 'KG', isActive: true, icon: '✨' },
  { id: '3', nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', ratePerKg: 155, unit: 'KG', isActive: true, icon: '⚪' },
  { id: '4', nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', ratePerKg: 160, unit: 'KG', isActive: true, icon: '🥣' },
  { id: '5', nameEn: 'Chokar / Bran', nameUr: 'چوکر (کھل)', ratePerKg: 95, unit: 'KG', isActive: true, icon: '📦' },
  { id: '6', nameEn: 'Desi Atta', nameUr: 'دیسی گندم آٹا', ratePerKg: 0, unit: 'KG', isActive: true, icon: '⚠️' },
];

export const ProductBillingScreen: React.FC = () => {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [calcMode, setCalcMode] = useState<'weight' | 'amount'>('weight');
  const [inputValue, setInputValue] = useState<string>('10');
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [showDiscount, setShowDiscount] = useState<boolean>(false);
  const [receivedAmount, setReceivedAmount] = useState<string>('1400');
  const [isReceivedAutoUpdated, setIsReceivedAutoUpdated] = useState<boolean>(true);

  // Customer Credit State
  const [showCustomerField, setShowCustomerField] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [creditError, setCreditError] = useState<string>('');

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [billCounter, setBillCounter] = useState<number>(482);

  // Input Refs for sequential Enter navigation
  const weightInputRef = useRef<HTMLInputElement>(null);
  const receivedInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const rate = selectedProduct.ratePerKg;
  const numInput = parseFloat(inputValue) || 0;
  const numDiscount = parseFloat(discountValue) || 0;

  let calculatedWeight = 0;
  let calculatedAmount = 0;

  if (rate > 0) {
    if (calcMode === 'weight') {
      calculatedWeight = numInput;
      calculatedAmount = Math.round(numInput * rate);
    } else {
      calculatedAmount = numInput;
      calculatedWeight = parseFloat((numInput / rate).toFixed(2));
    }
  }

  const subtotal = calculatedAmount;
  const netTotal = Math.max(0, subtotal - numDiscount);

  // Sync received money when total changes if not manually typed
  useEffect(() => {
    if (isReceivedAutoUpdated) {
      setReceivedAmount(String(netTotal));
    }
  }, [netTotal, isReceivedAutoUpdated]);

  const numReceived = parseFloat(receivedAmount) || 0;
  const balanceRemaining = Math.max(0, netTotal - numReceived);
  const changeToReturn = Math.max(0, numReceived - netTotal);

  // Focus weight input on product or mode change
  useEffect(() => {
    weightInputRef.current?.focus();
    weightInputRef.current?.select();
  }, [selectedProduct, calcMode]);

  // Action 1: Print Cash Bill
  const handlePrintCashBill = () => {
    if (rate <= 0) {
      alert('Cannot bill: Rate not set for this product!');
      return;
    }
    if (calculatedWeight <= 0) {
      alert('Please enter weight or amount.');
      weightInputRef.current?.focus();
      return;
    }

    const nextBillNum = `BILL-${String(billCounter).padStart(5, '0')}`;
    setBillCounter((prev) => prev + 1);

    const receipt: ReceiptData = {
      type: 'product',
      billNumber: nextBillNum,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      billerName: 'Biller 1 (Counter)',
      customerName: customerName.trim() || undefined,
      isCredit: false,
      items: [
        {
          nameEn: selectedProduct.nameEn,
          nameUr: selectedProduct.nameUr,
          weightKg: calculatedWeight,
          ratePerKg: rate,
          total: subtotal,
        },
      ],
      subtotal,
      discount: numDiscount,
      netTotal,
      cashReceived: numReceived,
      remainingBalance: balanceRemaining,
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  // Action 2: Save as Credit
  const handleSaveAsCredit = () => {
    if (rate <= 0) {
      alert('Cannot bill: Rate not set for this product!');
      return;
    }
    if (calculatedWeight <= 0) {
      alert('Please enter weight or amount.');
      weightInputRef.current?.focus();
      return;
    }

    if (!customerName.trim()) {
      setShowCustomerField(true);
      setCreditError('⚠️ Please enter customer name/phone for credit!');
      setTimeout(() => {
        customerInputRef.current?.focus();
      }, 80);
      return;
    }

    setCreditError('');
    const nextBillNum = `BILL-${String(billCounter).padStart(5, '0')}`;
    setBillCounter((prev) => prev + 1);

    const receipt: ReceiptData = {
      type: 'product',
      billNumber: nextBillNum,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      billerName: 'Biller 1 (Counter)',
      customerName: `${customerName.trim()} ${customerPhone.trim() ? `(${customerPhone.trim()})` : ''}`,
      isCredit: true,
      items: [
        {
          nameEn: selectedProduct.nameEn,
          nameUr: selectedProduct.nameUr,
          weightKg: calculatedWeight,
          ratePerKg: rate,
          total: subtotal,
        },
      ],
      subtotal,
      discount: numDiscount,
      netTotal,
      cashReceived: numReceived,
      remainingBalance: balanceRemaining > 0 ? balanceRemaining : netTotal,
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* 1. TOP: Compact Horizontal Product Selection */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px',
        }}
      >
        {products.map((p) => {
          const isSelected = selectedProduct.id === p.id;
          const isRateSet = p.ratePerKg > 0;
          return (
            <div
              key={p.id}
              onClick={() => {
                setSelectedProduct(p);
                setIsReceivedAutoUpdated(true);
                weightInputRef.current?.focus();
                weightInputRef.current?.select();
              }}
              className="touch-active"
              style={{
                padding: '8px 10px',
                borderRadius: '10px',
                backgroundColor: isSelected ? '#fffbeb' : '#ffffff',
                border: isSelected ? '2.5px solid #d97706' : '1px solid #cbd5e1',
                boxShadow: isSelected ? '0 2px 6px rgba(217, 119, 6, 0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                textAlign: 'center',
                transition: 'all 0.1s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ fontWeight: 800, color: isSelected ? '#b45309' : '#047857', fontFamily: 'var(--font-mono)' }}>
                  {isRateSet ? `Rs ${p.ratePerKg}` : '⚠️ Unset'}
                </span>
                {isSelected && <Check size={12} color="#d97706" strokeWidth={3} />}
              </div>

              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: isSelected ? '#000000' : '#1e293b',
                  lineHeight: 1.2,
                }}
              >
                {p.nameUr}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.nameEn}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MAIN BILLING CARD (Compact & 100% Viewport-Fitted) */}
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
        {/* Top Mini Strip: Selected Product + Mode Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
              {selectedProduct.nameEn}
            </span>
            <span className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#d97706' }}>
              {selectedProduct.nameUr}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
              • Rate: Rs {selectedProduct.ratePerKg}/KG
            </span>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '8px', gap: '2px' }}>
            <button
              type="button"
              onClick={() => {
                setCalcMode('weight');
                setInputValue('10');
                setIsReceivedAutoUpdated(true);
                weightInputRef.current?.focus();
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: calcMode === 'weight' ? '#d97706' : 'transparent',
                color: calcMode === 'weight' ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Scale size={14} /> Weight Mode (وزن)
            </button>

            <button
              type="button"
              onClick={() => {
                setCalcMode('amount');
                setInputValue('500');
                setIsReceivedAutoUpdated(true);
                weightInputRef.current?.focus();
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: calcMode === 'amount' ? '#d97706' : 'transparent',
                color: calcMode === 'amount' ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Banknote size={14} /> Rupees Mode (رقم)
            </button>
          </div>
        </div>

        {/* Entry & Total Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center' }}>
          {/* Weight Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                {calcMode === 'weight' ? '1. WEIGHT (وزن درج کریں) [Press Enter ➔ Cash Recv]:' : '1. RUPEES (رقم درج کریں) [Press Enter ➔ Cash Recv]:'}
              </label>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Enter ➔ Next Field</span>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                ref={weightInputRef}
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
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
                  height: '52px',
                  borderRadius: '10px',
                  border: '2px solid #d97706',
                  backgroundColor: '#fffdfa',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#0f172a',
                  padding: '0 50px 0 14px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '14px', fontSize: '16px', fontWeight: 900, color: '#94a3b8' }}>
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>
          </div>

          {/* Right Total Display */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ fontWeight: 800, color: '#64748b' }}>TOTAL BILL AMOUNT</span>
              <span style={{ fontWeight: 700, color: '#047857' }}>
                {calculatedWeight} KG @ Rs {rate}/KG
              </span>
            </div>

            <div
              style={{
                fontSize: '34px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#047857',
                lineHeight: 1.1,
                margin: '2px 0 4px',
              }}
            >
              Rs {netTotal.toLocaleString()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                style={{ background: 'none', border: 'none', color: '#b45309', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Tag size={12} /> {showDiscount ? 'Close Discount' : '+ Add Discount'}
              </button>
              {showDiscount && (
                <input
                  type="number"
                  placeholder="Discount Rs"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value);
                    setIsReceivedAutoUpdated(true);
                  }}
                  style={{ width: '80px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 700, outline: 'none' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Cash Received Row with Enter ➔ Print shortcut */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>
                2. CASH RECEIVED (گاہک سے وصول رقم) [Press Enter ➔ Print]:
              </label>
              <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>Enter ➔ Print Cash</span>
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
                    handlePrintCashBill();
                  }
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '8px',
                  border: '2px solid #059669',
                  backgroundColor: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#065f46',
                  padding: '0 45px 0 12px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '12px', fontSize: '14px', fontWeight: 900, color: '#047857' }}>
                Rs
              </span>
            </div>
          </div>

          <div>
            {balanceRemaining > 0 ? (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>REMAINING SHORT / BALANCE (باقی رقم):</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857' }}>CHANGE TO RETURN (واپسی رقم):</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>✓ Exact Cash Paid (پوری رقم وصول)</div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Details Row (Auto shows if remaining > 0 or toggled) */}
        {(showCustomerField || balanceRemaining > 0) && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: creditError ? '2px solid #ef4444' : '1px solid #fde68a',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={14} /> Customer Details for Udhaar (ادھار کھاتہ کے لیے گاہک کا نام)
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
                placeholder="Customer Name (گاہک کا نام) — e.g. Haji Rasheed"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (e.target.value.trim()) setCreditError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveAsCredit();
                  }
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: creditError ? '2px solid #ef4444' : '1px solid #d97706',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
              <input
                type="text"
                placeholder="Phone (موبائل نمبر اختیاری)..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveAsCredit();
                  }
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #d97706',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
            </div>
          </div>
        )}

        {/* 2 ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={handlePrintCashBill}
            disabled={rate <= 0 || calculatedWeight <= 0}
            className="touch-active"
            style={{
              height: '52px',
              borderRadius: '10px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#059669' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '16px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Printer size={22} />
            <span>PRINT CASH BILL — [ENTER] (Rs {numReceived} نقد)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAsCredit}
            disabled={rate <= 0 || calculatedWeight <= 0}
            className="touch-active"
            style={{
              height: '52px',
              borderRadius: '10px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#d97706' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={20} />
            <span>SAVE AS CREDIT (Rs {balanceRemaining > 0 ? balanceRemaining : netTotal} ادھار)</span>
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
