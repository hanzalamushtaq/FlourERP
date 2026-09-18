'use strict';
'use client';

import React, { useState } from 'react';
import { TouchCard, Product } from '../ui/TouchCard';
import { NumericKeypad } from '../ui/NumericKeypad';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Scale, Banknote, Tag, UserCheck, AlertTriangle, ArrowRight, Printer } from 'lucide-react';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameEn: 'Chakki Atta', nameUr: 'چکی آٹا (گندم)', ratePerKg: 140, unit: 'KG', isActive: true, icon: '🌾' },
  { id: '2', nameEn: 'Fine Atta', nameUr: 'فائن آٹا', ratePerKg: 148, unit: 'KG', isActive: true, icon: '✨' },
  { id: '3', nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', ratePerKg: 155, unit: 'KG', isActive: true, icon: '⚪' },
  { id: '4', nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', ratePerKg: 160, unit: 'KG', isActive: true, icon: '🥣' },
  { id: '5', nameEn: 'Chokar / Bran', nameUr: 'چوکر (کھل)', ratePerKg: 95, unit: 'KG', isActive: true, icon: '📦' },
  { id: '6', nameEn: 'Premium Desi Atta', nameUr: 'دیسی گندم آٹا', ratePerKg: 0, unit: 'KG', isActive: true, icon: '⚠️' }, // Rate unset guard demo
];

export const ProductBillingScreen: React.FC = () => {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [calcMode, setCalcMode] = useState<'weight' | 'amount'>('weight');
  const [inputValue, setInputValue] = useState<string>('10'); // default 10 KG
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  
  // Bill Preview State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [billCounter, setBillCounter] = useState<number>(482);

  // Math Calculations
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

  // Keypad Handlers
  const handleKeyPress = (key: string) => {
    if (key === '.' && inputValue.includes('.')) return;
    if (inputValue === '0' && key !== '.') {
      setInputValue(key);
    } else {
      setInputValue((prev) => prev + key);
    }
  };

  const handleClear = () => {
    setInputValue('0');
  };

  const handleBackspace = () => {
    setInputValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleQuickAdd = (amount: number) => {
    const current = parseFloat(inputValue) || 0;
    setInputValue(String(current + amount));
  };

  const handleCheckout = () => {
    if (rate <= 0) {
      alert('Cannot bill product: Rate is not set! Please contact Admin to set daily price.');
      return;
    }
    if (calculatedWeight <= 0) {
      alert('Please enter a valid quantity or amount.');
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(340px, 1fr)',
        gap: '20px',
        width: '100%',
      }}
    >
      {/* Left Column: Product Selection Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Select Product (پروڈکٹ منتخب کریں)</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Touch product card to begin calculation
            </p>
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              backgroundColor: 'var(--wheat-100)',
              color: 'var(--wheat-700)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            5 Active Items
          </span>
        </div>

        {/* Product Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '12px',
          }}
        >
          {products.map((p) => (
            <TouchCard
              key={p.id}
              product={p}
              isSelected={selectedProduct.id === p.id}
              onSelect={(product) => {
                setSelectedProduct(product);
                if (product.ratePerKg <= 0) {
                  setInputValue('0');
                }
              }}
            />
          ))}
        </div>

        {/* Warning If Rate Not Set */}
        {rate <= 0 && (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--rose-50)',
              border: '2px dashed var(--rose-500)',
              color: 'var(--rose-600)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <AlertTriangle size={28} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>Rate Not Set! (قیمت مقرر نہیں ہے)</div>
              <div style={{ fontSize: '12px', color: '#9f1239' }}>
                Cannot generate bill for {selectedProduct.nameEn} until the daily price is confirmed by Admin.
              </div>
            </div>
          </div>
        )}

        {/* Optional Credit (Udhaar) Customer Toggle */}
        <div
          style={{
            backgroundColor: isCredit ? '#fef3c7' : 'var(--bg-surface)',
            border: isCredit ? '2px solid #d97706' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            transition: 'all 0.2s ease',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isCredit}
              onChange={(e) => setIsCredit(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--wheat-600)' }}
            />
            <span style={{ fontWeight: 700, fontSize: '14px', color: isCredit ? '#92400e' : 'var(--text-primary)' }}>
              Udhaar / Credit Customer (ادھار کھاتہ)
            </span>
          </label>
          {isCredit && (
            <input
              type="text"
              placeholder="Search or enter customer name..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{
                flex: 1,
                maxWidth: '220px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #d97706',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* Right Column: Calculation Modes, Numpad & Instant Total Checkout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: 'var(--bg-surface)',
          padding: '18px',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Mode Toggle Switch: Weight -> Amount vs Amount -> Weight */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setCalcMode('weight');
              setInputValue('10');
            }}
            className="touch-active"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: calcMode === 'weight' ? 'var(--wheat-600)' : 'transparent',
              color: calcMode === 'weight' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Scale size={18} /> Weight → Rs (وزن سے رقم)
          </button>

          <button
            type="button"
            onClick={() => {
              setCalcMode('amount');
              setInputValue('500');
            }}
            className="touch-active"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: calcMode === 'amount' ? 'var(--wheat-600)' : 'transparent',
              color: calcMode === 'amount' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Banknote size={18} /> Rs → Weight (رقم سے وزن)
          </button>
        </div>

        {/* Live Display Monitor */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            border: '2px solid var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {calcMode === 'weight' ? 'ENTER WEIGHT (KG):' : 'ENTER DESIRED RUPEES (Rs):'}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--wheat-700)',
                backgroundColor: 'var(--wheat-100)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Rate: Rs {rate}/KG
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontSize: '34px',
                fontWeight: 900,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {inputValue || '0'} {calcMode === 'weight' ? 'KG' : 'Rs'}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                {calcMode === 'weight' ? 'CALCULATED AMOUNT' : 'CALCULATED WEIGHT'}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: calcMode === 'weight' ? 'var(--emerald-600)' : 'var(--wheat-700)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {calcMode === 'weight' ? `Rs ${calculatedAmount}` : `${calculatedWeight} KG`}
              </div>
            </div>
          </div>
        </div>

        {/* Keypad */}
        <NumericKeypad
          mode={calcMode}
          onKeyPress={handleKeyPress}
          onClear={handleClear}
          onBackspace={handleBackspace}
          onQuickAdd={handleQuickAdd}
        />

        {/* Discount Bar (Permission Gated) */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--wheat-700)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Tag size={15} /> {showDiscountInput ? 'Hide Discount' : '+ Add Discount (رعایت)'}
            </button>
            {numDiscount > 0 && (
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--rose-600)' }}>
                - Rs {numDiscount}
              </span>
            )}
          </div>

          {showDiscountInput && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Discount amount (Rs)"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-medium)',
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setDiscountValue('0')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Big Touch Checkout Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={rate <= 0 || calculatedWeight <= 0}
          className="touch-active"
          style={{
            height: '66px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: rate > 0 && calculatedWeight > 0 ? 'var(--emerald-600)' : 'var(--border-medium)',
            color: '#ffffff',
            border: 'none',
            fontSize: '20px',
            fontWeight: 800,
            cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Printer size={26} />
            <div style={{ textAlign: 'left' }}>
              <div>Print Bill (بل بنائیں)</div>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 500 }}>
                {calculatedWeight} KG • {selectedProduct.nameEn}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '26px', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
            Rs {netTotal}
          </div>
        </button>
      </div>

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={receiptData}
      />
    </div>
  );
};
