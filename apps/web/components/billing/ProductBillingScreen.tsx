'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../ui/TouchCard';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, Scale, Banknote, Tag, UserCheck, AlertTriangle, Check } from 'lucide-react';

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
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [billCounter, setBillCounter] = useState<number>(482);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on load or product change
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [selectedProduct, calcMode]);

  // Global Keyboard shortcuts: Enter to print, 1-5 to select product
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if receipt modal is open
      if (isReceiptOpen) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, calcMode, inputValue, discountValue, isCredit, customerName, isReceiptOpen]);

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

  const handleQuickAdd = (amount: number) => {
    const curr = parseFloat(inputValue) || 0;
    const nextVal = String(curr + amount);
    setInputValue(nextVal);
    inputRef.current?.focus();
  };

  const handleCheckout = () => {
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
      customerName: isCredit ? (customerName.trim() || 'Haji Rasheed (Credit)') : undefined,
      isCredit,
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
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. TOP: Product Selection (Large, Eye-Catching Cards with Clean Urdu) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            1. Select Product (پروڈکٹ منتخب کریں)
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Click or tap to choose product
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {products.map((p, idx) => {
            const isSelected = selectedProduct.id === p.id;
            const isRateSet = p.ratePerKg > 0;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  inputRef.current?.focus();
                  inputRef.current?.select();
                }}
                className="touch-active"
                style={{
                  position: 'relative',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: isSelected ? '#fffbeb' : '#ffffff',
                  border: isSelected ? '3px solid #d97706' : '1.5px solid #e2e8f0',
                  boxShadow: isSelected ? '0 4px 12px rgba(217, 119, 6, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Rate Badge & Check */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {isRateSet ? (
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 900,
                        color: isSelected ? '#b45309' : '#047857',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      Rs {p.ratePerKg}/KG
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>
                      ⚠️ Rate Unset
                    </span>
                  )}

                  {isSelected && (
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '9999px',
                        backgroundColor: '#d97706',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Big Urdu Title */}
                <div
                  className="font-nastaleeq"
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: isSelected ? '#000000' : '#1e293b',
                    textAlign: 'right',
                    lineHeight: 1.4,
                    margin: '2px 0',
                  }}
                >
                  {p.nameUr}
                </div>

                {/* English Name */}
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                  {p.nameEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BOTTOM: Clean, Keyboard-First Billing Entry Card */}
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
        {/* Mode Selector & Selected Product Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            borderBottom: '1.5px solid #f1f5f9',
            paddingBottom: '16px',
          }}
        >
          {/* Active Product Title Callout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              {selectedProduct.icon || '🌾'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                  {selectedProduct.nameEn}
                </span>
                <span
                  className="font-nastaleeq"
                  style={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}
                >
                  {selectedProduct.nameUr}
                </span>
              </div>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 700 }}>
                Current Rate: Rs {selectedProduct.ratePerKg} per KG
              </span>
            </div>
          </div>

          {/* Mode Tabs (Weight Mode vs Amount Mode) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setCalcMode('weight');
                setInputValue('10');
                inputRef.current?.focus();
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: calcMode === 'weight' ? '#d97706' : 'transparent',
                color: calcMode === 'weight' ? '#ffffff' : '#475569',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <Scale size={18} /> Weight Mode (وزن)
            </button>

            <button
              type="button"
              onClick={() => {
                setCalcMode('amount');
                setInputValue('500');
                inputRef.current?.focus();
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: calcMode === 'amount' ? '#d97706' : 'transparent',
                color: calcMode === 'amount' ? '#ffffff' : '#475569',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <Banknote size={18} /> Rupees Mode (رقم)
            </button>
          </div>
        </div>

        {/* Big Entry & Live Calculation Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {/* Left: Huge Direct Keyboard Input Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#334155',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{calcMode === 'weight' ? 'ENTER WEIGHT (وزن لکھیں):' : 'ENTER RUPEES (رقم لکھیں):'}</span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                Type on keyboard directly
              </span>
            </label>

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                ref={inputRef}
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  width: '100%',
                  height: '76px',
                  borderRadius: '14px',
                  border: '3px solid #d97706',
                  backgroundColor: '#fffdfa',
                  fontSize: '44px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#0f172a',
                  padding: '0 80px 0 20px',
                  outline: 'none',
                  boxShadow: '0 0 0 4px rgba(217, 119, 6, 0.1)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '22px',
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#94a3b8',
                }}
              >
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>

            {/* Quick Increment Buttons for Fast 1-Touch Bag Sizes */}
            {calcMode === 'weight' ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {[
                  { label: '+5 kg', val: 5 },
                  { label: '+10 kg', val: 10 },
                  { label: '+20 kg', val: 20 },
                  { label: '+40 kg (Bori)', val: 40 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleQuickAdd(item.val)}
                    style={{
                      flex: 1,
                      padding: '10px 4px',
                      borderRadius: '8px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1.5px solid #fde68a',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {[
                  { label: '+100', val: 100 },
                  { label: '+200', val: 200 },
                  { label: '+500', val: 500 },
                  { label: '+1,000', val: 1000 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleQuickAdd(item.val)}
                    style={{
                      flex: 1,
                      padding: '10px 4px',
                      borderRadius: '8px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1.5px solid #fde68a',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Big Crisp Total Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b' }}>
                {calcMode === 'weight' ? 'BILL CALCULATION' : 'QUANTITY CALCULATION'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>
                {calculatedWeight} KG @ Rs {rate}/KG
              </span>
            </div>

            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 700 }}>
              TOTAL NET AMOUNT (کل رقم):
            </div>
            <div
              style={{
                fontSize: '52px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#047857',
                lineHeight: 1.1,
                margin: '6px 0 10px',
              }}
            >
              Rs {netTotal.toLocaleString()}
            </div>

            {/* Sub-breakdown if discount applied */}
            {numDiscount > 0 && (
              <div style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 700 }}>
                Subtotal: Rs {subtotal} — Discount: Rs {numDiscount}
              </div>
            )}
          </div>
        </div>

        {/* Optional Clean Drawer for Udhaar / Discount */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            backgroundColor: '#f8fafc',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Udhaar Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isCredit}
              onChange={(e) => setIsCredit(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#d97706' }}
            />
            <span style={{ fontWeight: 800, fontSize: '15px', color: isCredit ? '#92400e' : '#334155' }}>
              Udhaar Customer (ادھار کھاتہ)
            </span>
          </label>

          {isCredit && (
            <input
              type="text"
              placeholder="Customer name / phone..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '2px solid #d97706',
                fontSize: '14px',
                fontWeight: 700,
                outline: 'none',
                width: '260px',
              }}
            />
          )}

          {/* Discount Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={() => setShowDiscount(!showDiscount)}
              style={{
                background: 'none',
                border: 'none',
                color: '#b45309',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Tag size={16} /> {showDiscount ? 'Close Discount' : '+ Add Discount (رعایت)'}
            </button>

            {showDiscount && (
              <input
                type="number"
                placeholder="Discount Rs"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                style={{
                  width: '120px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            )}
          </div>
        </div>

        {/* Big Eye-Catching Print Bill Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={rate <= 0 || calculatedWeight <= 0}
          className="touch-active"
          style={{
            height: '70px',
            borderRadius: '14px',
            backgroundColor: rate > 0 && calculatedWeight > 0 ? '#059669' : '#94a3b8',
            color: '#ffffff',
            border: 'none',
            fontSize: '22px',
            fontWeight: 900,
            cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
            boxShadow: '0 8px 16px -2px rgba(5, 150, 105, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            transition: 'all 0.15s ease',
          }}
        >
          <Printer size={30} />
          <span>PRINT BILL — [ENTER] (بل پرنٹ کریں)</span>
        </button>
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
