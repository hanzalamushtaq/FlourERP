'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../ui/TouchCard';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, Scale, Banknote, Tag, UserCheck, AlertTriangle, Check, BookOpen, AlertCircle } from 'lucide-react';

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

  const inputRef = useRef<HTMLInputElement>(null);
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

  // Synchronize received money when total changes if user hasn't manually edited it
  useEffect(() => {
    if (isReceivedAutoUpdated) {
      setReceivedAmount(String(netTotal));
    }
  }, [netTotal, isReceivedAutoUpdated]);

  const numReceived = parseFloat(receivedAmount) || 0;
  const balanceRemaining = Math.max(0, netTotal - numReceived);
  const changeToReturn = Math.max(0, numReceived - netTotal);

  // Auto focus input on load or product change
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [selectedProduct, calcMode]);

  // Global Keyboard shortcuts: Enter to print cash bill
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReceiptOpen) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePrintCashBill();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, calcMode, inputValue, discountValue, receivedAmount, isReceiptOpen, netTotal]);

  const handleQuickAdd = (amount: number) => {
    const curr = parseFloat(inputValue) || 0;
    setInputValue(String(curr + amount));
    setIsReceivedAutoUpdated(true);
    inputRef.current?.focus();
  };

  // 1. Action: Print Cash Bill (Saves without requiring customer details even if received < total)
  const handlePrintCashBill = () => {
    if (rate <= 0) {
      alert('Cannot bill: Daily rate is not set for this product!');
      return;
    }
    if (calculatedWeight <= 0) {
      alert('Please enter a valid quantity or amount.');
      inputRef.current?.focus();
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

  // 2. Action: Save as Credit (Demands customer details)
  const handleSaveAsCredit = () => {
    if (rate <= 0) {
      alert('Cannot bill: Daily rate is not set for this product!');
      return;
    }
    if (calculatedWeight <= 0) {
      alert('Please enter a valid quantity or amount.');
      inputRef.current?.focus();
      return;
    }

    // Must have customer name to put on credit
    if (!customerName.trim()) {
      setShowCustomerField(true);
      setCreditError('⚠️ Please enter customer name or phone to record this Udhaar!');
      setTimeout(() => {
        customerInputRef.current?.focus();
      }, 100);
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
    <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP: Compact Product Selection Strip */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Select Product (پروڈکٹ منتخب کریں)
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Click product to choose
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '10px',
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
                  inputRef.current?.focus();
                  inputRef.current?.select();
                }}
                className="touch-active"
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? '#fffbeb' : '#ffffff',
                  border: isSelected ? '2.5px solid #d97706' : '1.5px solid #e2e8f0',
                  boxShadow: isSelected ? '0 3px 8px rgba(217, 119, 6, 0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {isRateSet ? (
                    <span style={{ fontSize: '14px', fontWeight: 900, color: isSelected ? '#b45309' : '#047857', fontFamily: 'var(--font-mono)' }}>
                      Rs {p.ratePerKg}/KG
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>
                      ⚠️ Unset
                    </span>
                  )}
                  {isSelected && (
                    <div style={{ width: '18px', height: '18px', borderRadius: '9999px', backgroundColor: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div
                  className="font-nastaleeq"
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: isSelected ? '#000000' : '#1e293b',
                    textAlign: 'right',
                    lineHeight: 1.3,
                    margin: '1px 0',
                  }}
                >
                  {p.nameUr}
                </div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                  {p.nameEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BOTTOM: Billing Card with Cash Received & 2 Final Buttons */}
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
        {/* Header Strip: Active Product + Mode Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1.5px solid #f1f5f9',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
              {selectedProduct.nameEn}
            </span>
            <span className="font-nastaleeq" style={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}>
              {selectedProduct.nameUr}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, marginLeft: '6px' }}>
              (Rate: Rs {selectedProduct.ratePerKg}/KG)
            </span>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
            <button
              type="button"
              onClick={() => {
                setCalcMode('weight');
                setInputValue('10');
                setIsReceivedAutoUpdated(true);
                inputRef.current?.focus();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: calcMode === 'weight' ? '#d97706' : 'transparent',
                color: calcMode === 'weight' ? '#ffffff' : '#475569',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Scale size={16} /> Weight Mode (وزن)
            </button>

            <button
              type="button"
              onClick={() => {
                setCalcMode('amount');
                setInputValue('500');
                setIsReceivedAutoUpdated(true);
                inputRef.current?.focus();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: calcMode === 'amount' ? '#d97706' : 'transparent',
                color: calcMode === 'amount' ? '#ffffff' : '#475569',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Banknote size={16} /> Rupees Mode (رقم)
            </button>
          </div>
        </div>

        {/* Input & Calculated Total Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center' }}>
          {/* Weight / Rupees Entry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 800, color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
              <span>{calcMode === 'weight' ? 'ENTER WEIGHT (وزن درج کریں):' : 'DESIRED RUPEES (رقم درج کریں):'}</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Type on keyboard</span>
            </label>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                ref={inputRef}
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsReceivedAutoUpdated(true);
                }}
                style={{
                  width: '100%',
                  height: '68px',
                  borderRadius: '12px',
                  border: '3px solid #d97706',
                  backgroundColor: '#fffdfa',
                  fontSize: '40px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#0f172a',
                  padding: '0 70px 0 18px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '18px', fontSize: '20px', fontWeight: 900, color: '#94a3b8' }}>
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>

            {/* Quick Bag Pills */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
              {(calcMode === 'weight'
                ? [{ label: '+5 kg', val: 5 }, { label: '+10 kg', val: 10 }, { label: '+20 kg', val: 20 }, { label: '+40 kg (Bori)', val: 40 }]
                : [{ label: '+100', val: 100 }, { label: '+200', val: 200 }, { label: '+500', val: 500 }, { label: '+1,000', val: 1000 }]
              ).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickAdd(item.val)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Big Net Total Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>TOTAL BILL AMOUNT</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>
                {calculatedWeight} KG @ Rs {rate}/KG
              </span>
            </div>

            <div
              style={{
                fontSize: '48px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#047857',
                lineHeight: 1.1,
                margin: '4px 0 6px',
              }}
            >
              Rs {netTotal.toLocaleString()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                style={{ background: 'none', border: 'none', color: '#b45309', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Tag size={14} /> {showDiscount ? 'Close Discount' : '+ Add Discount (رعایت)'}
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
                  style={{ width: '100px', padding: '4px 8px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 3. CASH RECEIVED (وصول رقم) & BALANCE CALCULATION */}
        <div
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '14px',
            padding: '14px 18px',
            border: '1.5px solid #cbd5e1',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {/* Left: Direct Cash Received Input */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              CASH RECEIVED FROM CUSTOMER (گاہک سے وصول رقم - Rs):
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
                  height: '56px',
                  borderRadius: '10px',
                  border: '2.5px solid #059669',
                  backgroundColor: '#ffffff',
                  fontSize: '32px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#065f46',
                  padding: '0 60px 0 16px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '16px', fontSize: '18px', fontWeight: 900, color: '#047857' }}>
                Rs
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              e.g. If bill is Rs 110 and you took Rs 100, enter 100 here.
            </span>
          </div>

          {/* Right: Difference / Remaining Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {balanceRemaining > 0 ? (
              <div
                style={{
                  backgroundColor: '#fffbeb',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>
                  REMAINING SHORT / BALANCE (باقی رقم):
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#78350f' }}>
                  Can print as Cash (short waived) OR click "Save as Credit" to record under customer.
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>
                  CHANGE TO RETURN (واپسی رقم):
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#047857' }}>
                  ✓ Exact Amount Paid (پوری رقم وصول)
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>No remaining balance or change</div>
              </div>
            )}
          </div>
        </div>

        {/* 4. CUSTOMER DETAILS (Required for Credit, Optional for Cash) */}
        {(showCustomerField || balanceRemaining > 0) && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: creditError ? '2px solid #ef4444' : '1.5px solid #fde68a',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '14px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={18} /> Customer Details for Udhaar Credit (گاہک کا نام و فون نمبر)
              </span>
              {creditError && (
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>
                  {creditError}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <input
                  ref={customerInputRef}
                  type="text"
                  placeholder="Customer Name (گاہک کا نام) — e.g. Haji Rasheed"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (e.target.value.trim()) setCreditError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: creditError ? '2px solid #ef4444' : '1.5px solid #d97706',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Phone (موبائل نمبر اختیاری) — 0300-1234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #d97706',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. THE 2 ACTION BUTTONS AT THE END: PRINT CASH BILL vs SAVE AS CREDIT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '14px', marginTop: '4px' }}>
          {/* Button 1: PRINT CASH BILL (Enter Key) */}
          <button
            type="button"
            onClick={handlePrintCashBill}
            disabled={rate <= 0 || calculatedWeight <= 0}
            className="touch-active"
            style={{
              height: '66px',
              borderRadius: '12px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#059669' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '18px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 6px 14px rgba(5, 150, 105, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <Printer size={26} />
            <div style={{ textAlign: 'left' }}>
              <div>PRINT CASH BILL — [ENTER]</div>
              <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>
                Rs {numReceived} Cash Recv (نقد بل پرنٹ کریں)
              </div>
            </div>
          </button>

          {/* Button 2: SAVE AS CREDIT (Demands customer details) */}
          <button
            type="button"
            onClick={handleSaveAsCredit}
            disabled={rate <= 0 || calculatedWeight <= 0}
            className="touch-active"
            style={{
              height: '66px',
              borderRadius: '12px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#d97706' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '17px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
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
                Rs {balanceRemaining > 0 ? balanceRemaining : netTotal} to Udhaar (ادھار بل)
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          inputRef.current?.focus();
          inputRef.current?.select();
        }}
        data={receiptData}
      />
    </div>
  );
};
