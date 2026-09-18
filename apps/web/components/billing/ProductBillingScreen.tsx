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

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Haji Rasheed (حاجی رشید)', phone: '0300-8765432' },
  { id: '2', name: 'Haji Altaf (حاجی الطاف)', phone: '0301-7654321' },
  { id: '3', name: 'Haji Mushtaq (حاجی مشتاق)', phone: '0302-3344556' },
  { id: '4', name: 'Tariq Naan Shop (طارق نان بائی)', phone: '0321-9876543' },
  { id: '5', name: 'Mian Aslam Zamindar (میاں اسلم)', phone: '0333-1122334' },
  { id: '6', name: 'Babar Hotel & Cafe (بابر ہوٹل)', phone: '0345-5566778' },
  { id: '7', name: 'Haji Asif Flour Dealer (حاجی آصف)', phone: '0300-9988776' },
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

  // Customer State & Autocomplete
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [suggestions, setSuggestions] = useState<typeof MOCK_CUSTOMERS>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [billCounter, setBillCounter] = useState<number>(482);

  // Sequential Input Refs
  const weightInputRef = useRef<HTMLInputElement>(null);
  const receivedInputRef = useRef<HTMLInputElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const customerPhoneInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-sync received money with net total when quantity/rate changes
  useEffect(() => {
    if (isReceivedAutoUpdated) {
      setReceivedAmount(String(netTotal));
    }
  }, [netTotal, isReceivedAutoUpdated]);

  const numReceived = parseFloat(receivedAmount) || 0;
  const balanceRemaining = Math.max(0, netTotal - numReceived);
  const changeToReturn = Math.max(0, numReceived - netTotal);

  // Auto focus weight input on product selection
  useEffect(() => {
    weightInputRef.current?.focus();
    weightInputRef.current?.select();
  }, [selectedProduct, calcMode]);

  // Customer name autocomplete suggestions
  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    if (val.trim().length > 0) {
      const filtered = MOCK_CUSTOMERS.filter((c) =>
        c.name.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCustomer = (cust: { name: string; phone: string }) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone);
    setShowSuggestions(false);
    customerPhoneInputRef.current?.focus();
  };

  // Submit Logic: If customer details are entered, it automatically saves as Credit
  const handleFinalSubmit = (forcedCredit?: boolean) => {
    if (rate <= 0) {
      alert('Cannot bill: Rate not set for this product!');
      return;
    }
    if (calculatedWeight <= 0) {
      alert('Please enter weight or amount.');
      weightInputRef.current?.focus();
      return;
    }

    const hasCustomerDetails = customerName.trim().length > 0;
    const isCreditSale = forcedCredit !== undefined ? forcedCredit : (hasCustomerDetails || balanceRemaining > 0);

    const nextBillNum = `BILL-${String(billCounter).padStart(5, '0')}`;
    setBillCounter((prev) => prev + 1);

    const receipt: ReceiptData = {
      type: 'product',
      billNumber: nextBillNum,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      billerName: 'Biller 1 (Counter)',
      customerName: hasCustomerDetails ? `${customerName.trim()} ${customerPhone.trim() ? `(${customerPhone.trim()})` : ''}` : undefined,
      isCredit: isCreditSale,
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

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 1. TOP: Compact Product Selection Strip */}
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

      {/* 2. MAIN BILLING CARD */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Top Mini Strip: Selected Product + Mode Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '6px',
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
                padding: '5px 10px',
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
              <Scale size={13} /> Weight Mode (وزن)
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
                padding: '5px 10px',
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
              <Banknote size={13} /> Rupees Mode (رقم)
            </button>
          </div>
        </div>

        {/* Entry & Total Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', alignItems: 'center' }}>
          {/* 1. Weight Input */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '2px' }}>
              {calcMode === 'weight' ? 'Weight (وزن - KG):' : 'Desired Rupees (مطلوبہ رقم):'}
            </label>
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
                  height: '46px',
                  borderRadius: '8px',
                  border: '2px solid #d97706',
                  backgroundColor: '#fffdfa',
                  fontSize: '26px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#0f172a',
                  padding: '0 45px 0 12px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '12px', fontSize: '15px', fontWeight: 900, color: '#94a3b8' }}>
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>
          </div>

          {/* Right: Net Total Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ fontWeight: 800, color: '#64748b' }}>TOTAL AMOUNT (کل رقم)</span>
              <span style={{ fontWeight: 700, color: '#047857' }}>
                {calculatedWeight} KG @ Rs {rate}/KG
              </span>
            </div>

            <div
              style={{
                fontSize: '32px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#047857',
                lineHeight: 1.1,
                margin: '2px 0',
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
                <Tag size={12} /> {showDiscount ? 'Close Discount' : '+ Add Discount (رعایت)'}
              </button>
              {showDiscount && (
                <input
                  type="number"
                  placeholder="Rs"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value);
                    setIsReceivedAutoUpdated(true);
                  }}
                  style={{ width: '70px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 700, outline: 'none' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 2. Cash Received Row */}
        <div
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            padding: '8px 12px',
            border: '1px solid #cbd5e1',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div>
            <label style={{ fontSize: '12px', fontWeight: 900, color: '#0f172a', display: 'block', marginBottom: '2px' }}>
              Cash Received (وصول رقم):
            </label>
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
                    customerNameInputRef.current?.focus();
                  }
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '6px',
                  border: '2px solid #059669',
                  backgroundColor: '#ffffff',
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#065f46',
                  padding: '0 40px 0 10px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '10px', fontSize: '13px', fontWeight: 900, color: '#047857' }}>
                Rs
              </span>
            </div>
          </div>

          <div>
            {balanceRemaining > 0 ? (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', padding: '4px 8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#92400e' }}>Remaining Balance (باقی رقم):</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#047857' }}>Change to Return (واپسی رقم):</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>✓ Exact Cash Paid</div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Customer Details with Autocomplete Search Dropdown */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '11px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={13} /> Customer Details (گاہک کا نام و فون نمبر — ادھار کے لیے درج کریں)
            </span>
            <span style={{ fontSize: '10px', color: '#b45309' }}>Type name to see registered accounts</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={customerNameInputRef}
                type="text"
                placeholder="Customer Name (گاہک کا نام)..."
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                onFocus={() => {
                  if (customerName.trim().length > 0 && suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (customerName.trim()) {
                      customerPhoneInputRef.current?.focus();
                    } else {
                      // If customer name is left empty and user presses Enter, print cash bill
                      handleFinalSubmit(false);
                    }
                  }
                }}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1.5px solid #d97706',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #d97706',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    zIndex: 200,
                    maxHeight: '160px',
                    overflowY: 'auto',
                  }}
                >
                  {suggestions.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="touch-active"
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{cust.name}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{cust.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <input
                ref={customerPhoneInputRef}
                type="text"
                placeholder="Phone (موبائل نمبر اختیاری)..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Pressing enter on phone completes credit sale!
                    handleFinalSubmit(true);
                  }
                }}
                style={{
                  width: '100%',
                  height: '36px',
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
        </div>

        {/* 4. THE 2 ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginTop: '2px' }}>
          <button
            type="button"
            onClick={() => handleFinalSubmit(false)}
            disabled={rate <= 0 || calculatedWeight <= 0}
            className="touch-active"
            style={{
              height: '48px',
              borderRadius: '8px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#059669' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 3px 8px rgba(5, 150, 105, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Printer size={20} />
            <span>Print Cash Bill (نقد بل)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!customerName.trim()) {
                customerNameInputRef.current?.focus();
              } else {
                handleFinalSubmit(true);
              }
            }}
            disabled={rate <= 0 || calculatedWeight <= 0}
            className="touch-active"
            style={{
              height: '48px',
              borderRadius: '8px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#d97706' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 3px 8px rgba(217, 119, 6, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={18} />
            <span>Save as Credit (ادھار بل)</span>
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
