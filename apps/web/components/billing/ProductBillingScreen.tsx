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
                borderRadius: '12px',
                backgroundColor: isSelected ? '#C2C5AA' : '#F4F5EE',
                border: isSelected ? '2.5px solid #414833' : '1.5px solid #B6AD90',
                boxShadow: isSelected ? '0 4px 10px rgba(65, 72, 51, 0.2)' : '0 1px 3px rgba(65, 72, 51, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                textAlign: 'center',
                transition: 'all 0.1s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ fontWeight: 800, color: '#414833', fontFamily: 'var(--font-mono)' }}>
                  {isRateSet ? `Rs ${p.ratePerKg}` : '⚠️ Unset'}
                </span>
                {isSelected && <Check size={12} color="#414833" strokeWidth={3} />}
              </div>

              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#414833',
                  lineHeight: 1.2,
                }}
              >
                {p.nameUr}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#414833', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.nameEn}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MAIN BILLING CARD */}
      <div
        style={{
          backgroundColor: '#F4F5EE',
          borderRadius: '16px',
          border: '2px solid #B6AD90',
          boxShadow: '0 6px 16px rgba(65, 72, 51, 0.08)',
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
            borderBottom: '1px solid #B6AD90',
            paddingBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#414833' }}>
              {selectedProduct.nameEn}
            </span>
            <span className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#414833' }}>
              {selectedProduct.nameUr}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#656D4A' }}>
              • Rate: Rs {selectedProduct.ratePerKg}/KG
            </span>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#C2C5AA', padding: '3px', borderRadius: '10px', border: '1px solid #B6AD90', gap: '3px' }}>
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
                borderRadius: '7px',
                border: 'none',
                backgroundColor: calcMode === 'weight' ? '#414833' : 'transparent',
                color: calcMode === 'weight' ? '#F4F5EE' : '#414833',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Scale size={13} color={calcMode === 'weight' ? '#F4F5EE' : '#414833'} /> Weight Mode (وزن)
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
                borderRadius: '7px',
                border: 'none',
                backgroundColor: calcMode === 'amount' ? '#414833' : 'transparent',
                color: calcMode === 'amount' ? '#F4F5EE' : '#414833',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Banknote size={13} color={calcMode === 'amount' ? '#F4F5EE' : '#414833'} /> Rupees Mode (رقم)
            </button>
          </div>
        </div>

        {/* Entry & Total Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', alignItems: 'center' }}>
          {/* 1. Weight Input */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#414833', display: 'block', marginBottom: '4px' }}>
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
                  height: '48px',
                  borderRadius: '10px',
                  border: '2px solid #B6AD90',
                  backgroundColor: '#F4F5EE',
                  fontSize: '26px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#414833',
                  padding: '0 45px 0 12px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '12px', fontSize: '15px', fontWeight: 900, color: '#414833' }}>
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>
          </div>

          {/* Right: Net Total Box */}
          <div
            style={{
              backgroundColor: '#C2C5AA',
              border: '2px solid #414833',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(65, 72, 51, 0.12)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ fontWeight: 800, color: '#414833' }}>TOTAL AMOUNT (کل رقم)</span>
              <span style={{ fontWeight: 700, color: '#414833' }}>
                {calculatedWeight} KG @ Rs {rate}/KG
              </span>
            </div>

            <div
              style={{
                fontSize: '32px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#414833',
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
                style={{ background: 'none', border: 'none', color: '#414833', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Tag size={12} color="#414833" /> {showDiscount ? 'Close Discount' : '+ Add Discount (رعایت)'}
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
                  style={{ width: '75px', padding: '3px 6px', borderRadius: '6px', border: '1.5px solid #414833', backgroundColor: '#F4F5EE', color: '#414833', fontSize: '12px', fontWeight: 700, outline: 'none' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 2. Cash Received Row */}
        <div
          style={{
            backgroundColor: '#F4F5EE',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1.5px solid #B6AD90',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div>
            <label style={{ fontSize: '12px', fontWeight: 900, color: '#414833', display: 'block', marginBottom: '2px' }}>
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
                  borderRadius: '8px',
                  border: '2px solid #B6AD90',
                  backgroundColor: '#F4F5EE',
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#414833',
                  padding: '0 40px 0 10px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '10px', fontSize: '13px', fontWeight: 900, color: '#414833' }}>
                Rs
              </span>
            </div>
          </div>

          <div>
            {balanceRemaining > 0 ? (
              <div style={{ backgroundColor: '#C2C5AA', border: '1.5px solid #B6AD90', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#414833' }}>Remaining Balance (باقی رقم):</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#414833', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div style={{ backgroundColor: '#C2C5AA', border: '1.5px solid #B6AD90', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#414833' }}>Change to Return (واپسی رقم):</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#414833', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#C2C5AA', border: '1.5px solid #B6AD90', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#414833' }}>✓ Exact Cash Paid</div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Customer Details with Autocomplete Search Dropdown */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#F4F5EE',
            border: '1.5px solid #B6AD90',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '12px', color: '#414833', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={14} color="#414833" /> Customer Details (گاہک کا نام و فون نمبر — ادھار کے لیے درج کریں)
            </span>
            <span style={{ fontSize: '11px', color: '#656D4A', fontWeight: 600 }}>Type name to see registered accounts</span>
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
                      handleFinalSubmit(false);
                    }
                  }
                }}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #B6AD90',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                  backgroundColor: '#F4F5EE',
                  color: '#414833',
                }}
              />

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '42px',
                    left: 0,
                    right: 0,
                    backgroundColor: '#F4F5EE',
                    border: '1.5px solid #B6AD90',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(65, 72, 51, 0.2)',
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
                        borderBottom: '1px solid #B6AD90',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#414833' }}>{cust.name}</span>
                      <span style={{ fontSize: '11px', color: '#656D4A', fontWeight: 600 }}>{cust.phone}</span>
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
                    handleFinalSubmit(true);
                  }
                }}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #B6AD90',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#F4F5EE',
                  color: '#414833',
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. THE 2 ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => handleFinalSubmit(false)}
            disabled={rate <= 0 || calculatedWeight <= 0}
            className="touch-active"
            style={{
              height: '48px',
              borderRadius: '10px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#7F4F24' : '#C2C5AA',
              color: rate > 0 && calculatedWeight > 0 ? '#F4F5EE' : '#B6AD90',
              border: 'none',
              fontSize: '15px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: rate > 0 && calculatedWeight > 0 ? '0 3px 8px rgba(65, 72, 51, 0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Printer size={20} color={rate > 0 && calculatedWeight > 0 ? '#F4F5EE' : '#B6AD90'} />
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
              borderRadius: '10px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#656D4A' : '#C2C5AA',
              color: rate > 0 && calculatedWeight > 0 ? '#F4F5EE' : '#B6AD90',
              border: 'none',
              fontSize: '15px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: rate > 0 && calculatedWeight > 0 ? '0 3px 8px rgba(65, 72, 51, 0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={18} color={rate > 0 && calculatedWeight > 0 ? '#F4F5EE' : '#B6AD90'} />
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
