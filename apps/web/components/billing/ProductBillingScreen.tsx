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
  { id: '6', nameEn: 'Desi Atta', nameUr: 'دیسی گندم آٹا', ratePerKg: 145, unit: 'KG', isActive: true, icon: '🌾' },
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

  // Submit Handler
  const handleFinalSubmit = (forcedCredit?: boolean) => {
    if (rate <= 0) {
      alert('اس پروڈکٹ کا ریٹ مقرر نہیں ہے۔ برائے مہربانی ریٹ لسٹ اپ ڈیٹ کریں۔');
      return;
    }
    if (calculatedWeight <= 0) {
      alert('برائے مہربانی صحیح وزن درج کریں۔');
      weightInputRef.current?.focus();
      return;
    }

    const hasCustomerDetails = customerName.trim().length > 0;
    const isCreditSale = forcedCredit !== undefined ? forcedCredit : (hasCustomerDetails || balanceRemaining > 0);

    const billNumberFormatted = String(billCounter).padStart(5, '0');
    setBillCounter((prev) => prev + 1);

    const receipt: ReceiptData = {
      type: 'product',
      billNumber: billNumberFormatted,
      timestamp: new Date().toLocaleString('en-US', { hour12: true }),
      billerName: 'محمد عاصف (کاؤنٹر 01)',
      customerName: customerName.trim() || undefined,
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. TOP: Compact Product Selection Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '8px',
          width: '100%',
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
                borderRadius: '8px',
                backgroundColor: isSelected ? '#fffbeb' : '#fafaf7',
                border: isSelected ? '1.5px solid #d97706' : '1px solid #e8eae0',
                boxShadow: isSelected ? '0 2px 6px rgba(217, 119, 6, 0.12)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '68px',
                transition: 'all 0.1s ease',
              }}
            >
              {/* Top Row: Icon + Rate Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px' }}>{p.icon || '🌾'}</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? '#b45309' : '#475569',
                    backgroundColor: isSelected ? '#fef3c7' : '#f1f5f9',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {isRateSet ? `Rs ${p.ratePerKg}` : 'Unset'}
                </span>
              </div>

              {/* Middle: Urdu Name */}
              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: isSelected ? '#92400e' : '#0f172a',
                  lineHeight: 1.2,
                  textAlign: 'center',
                }}
              >
                {p.nameUr}
              </div>

              {/* Bottom: English Name */}
              <div
                style={{
                  fontSize: '10.5px',
                  color: '#64748b',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.nameEn}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. 2-COLUMN BALANCED BILLING GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)',
          gap: '12px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Entry Fields */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Selected Product Strip & Mode Switcher */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '8px',
              direction: 'rtl',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-nastaleeq" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                {selectedProduct.nameUr}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
                Rs {selectedProduct.ratePerKg}/KG
              </span>
            </div>

            {/* Mode Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                padding: '2px',
                borderRadius: '6px',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setCalcMode('weight');
                  setInputValue('10');
                  setIsReceivedAutoUpdated(true);
                  weightInputRef.current?.focus();
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: calcMode === 'weight' ? '#0f172a' : 'transparent',
                  color: calcMode === 'weight' ? '#ffffff' : '#475569',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Scale size={13} />
                <span className="font-nastaleeq">وزن</span>
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
                  padding: '4px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: calcMode === 'amount' ? '#0f172a' : 'transparent',
                  color: calcMode === 'amount' ? '#ffffff' : '#475569',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Banknote size={13} />
                <span className="font-nastaleeq">رقم</span>
              </button>
            </div>
          </div>

          {/* Weight / Amount Entry */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                {calcMode === 'weight' ? 'وزن درج کریں (KG):' : 'مطلوبہ رقم درج کریں (Rs):'}
              </span>
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
                  height: '42px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: '#0f172a',
                  padding: '0 40px 0 12px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '12px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>

            {/* Weight Quick Pills */}
            {calcMode === 'weight' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
                {[
                  { label: '5 KG', val: 5 },
                  { label: '10 KG', val: 10 },
                  { label: '20 KG', val: 20 },
                  { label: '40 KG', val: 40 },
                ].map((pill) => (
                  <button
                    key={pill.val}
                    type="button"
                    onClick={() => {
                      setInputValue(String(pill.val));
                      setIsReceivedAutoUpdated(true);
                      weightInputRef.current?.focus();
                    }}
                    className="touch-active"
                    style={{
                      padding: '5px 4px',
                      borderRadius: '5px',
                      backgroundColor: numInput === pill.val ? '#0f172a' : '#f1f5f9',
                      color: numInput === pill.val ? '#ffffff' : '#334155',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cash Received Row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                وصول رقم (Rs):
              </span>
              <button
                type="button"
                onClick={() => {
                  setReceivedAmount(String(netTotal));
                  setIsReceivedAutoUpdated(true);
                }}
                className="touch-active"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Check size={13} />
                <span className="font-nastaleeq">مکمل ادا</span>
              </button>
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
                    customerNameInputRef.current?.focus();
                  }
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: '#0f172a',
                  padding: '0 40px 0 12px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '12px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>
                Rs
              </span>
            </div>
          </div>

          {/* Customer Name (Udhaar / Optional) */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                گاہک کا نام (اختیاری):
              </span>
              {balanceRemaining > 0 && (
                <span className="font-nastaleeq" style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 700 }}>
                  * ادھار کے لیے نام ضروری ہے
                </span>
              )}
            </div>

            <input
              ref={customerNameInputRef}
              type="text"
              placeholder="گاہک کا نام لکھیں..."
              value={customerName}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  customerPhoneInputRef.current?.focus();
                }
              }}
              className="font-nastaleeq"
              style={{
                width: '100%',
                height: '38px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                padding: '0 10px',
                fontSize: '13px',
                outline: 'none',
                textAlign: 'right',
              }}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  marginTop: '2px',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="touch-active"
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '12px',
                      textAlign: 'right',
                    }}
                  >
                    <span className="font-nastaleeq" style={{ fontWeight: 700 }}>{c.name}</span>
                    <span style={{ color: '#64748b', fontSize: '11px', marginRight: '6px' }}>{c.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Total Bill Box & Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Total Bill Box */}
          <div
            style={{
              backgroundColor: '#fffdf5',
              borderRadius: '10px',
              border: '1.5px solid #fde68a',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 2px 5px rgba(217, 119, 6, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                کل رقم
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#475569',
                  backgroundColor: '#f1f5f9',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {calculatedWeight} KG @ Rs {rate}
              </span>
            </div>

            {/* Total Figure */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#0f172a',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}
            >
              Rs {netTotal.toLocaleString()}
            </div>

            {/* Balance or Return Status */}
            {balanceRemaining > 0 ? (
              <div
                style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  direction: 'rtl',
                }}
              >
                <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: '#b45309' }}>
                  باقی ادھار:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </span>
              </div>
            ) : changeToReturn > 0 ? (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  direction: 'rtl',
                }}
              >
                <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>
                  گاہک کو واپسی:
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </span>
              </div>
            ) : null}

            {/* Discount Option Toggle */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Tag size={12} />
                <span className="font-nastaleeq">رعایت شامل کریں (+ Discount)</span>
              </button>

              {showDiscount && (
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number"
                    placeholder="رعایت رقم"
                    value={discountValue}
                    onChange={(e) => {
                      setDiscountValue(e.target.value);
                      setIsReceivedAutoUpdated(true);
                    }}
                    style={{
                      width: '80px',
                      height: '32px',
                      padding: '0 8px',
                      borderRadius: '5px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Rs</span>
                </div>
              )}
            </div>
          </div>

          {/* 2 Clean Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Button 1: Print Cash Bill */}
            <button
              type="button"
              onClick={() => handleFinalSubmit(false)}
              disabled={rate <= 0 || calculatedWeight <= 0}
              className="touch-active"
              style={{
                height: '44px',
                borderRadius: '8px',
                backgroundColor: rate > 0 && calculatedWeight > 0 ? '#15803d' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 16px',
              }}
            >
              <Printer size={16} />
              <span className="font-nastaleeq" style={{ fontSize: '15px', fontWeight: 800 }}>
                نقد بل پرنٹ کریں
              </span>
            </button>

            {/* Button 2: Save as Credit */}
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
                height: '40px',
                borderRadius: '8px',
                backgroundColor: rate > 0 && calculatedWeight > 0 ? '#0f172a' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 16px',
              }}
            >
              <BookOpen size={15} />
              <span className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800 }}>
                ادھار کھاتہ میں محفوظ کریں
              </span>
            </button>
          </div>
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
