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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* 1. TOP: Fitted Product Selection Cards - Clear, Prominent & Readable */}
      <div className="product-grid-responsive">
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
                backgroundColor: isSelected ? '#DCE0CE' : '#FFFFFF',
                border: isSelected ? '2.5px solid #7F4F24' : '1.5px solid #B6AD90',
                boxShadow: isSelected ? '0 4px 10px rgba(127, 79, 36, 0.2)' : '0 1px 4px rgba(65, 72, 51, 0.06)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '86px',
                transition: 'all 0.12s ease',
              }}
            >
              {/* Top Row: Icon + Rate Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>{p.icon || '🌾'}</span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? '#F4F5EE' : '#414833',
                    backgroundColor: isSelected ? '#7F4F24' : '#C2C5AA',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    border: '1px solid #B6AD90',
                  }}
                >
                  {isRateSet ? ('Rs ' + p.ratePerKg) : '⚠️ Unset'}
                </span>
              </div>

              {/* Middle: Clear Urdu Nastaleeq */}
              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#414833',
                  lineHeight: 1.25,
                  textAlign: 'center',
                }}
              >
                {p.nameUr}
              </div>

              {/* Bottom: Crisp English Subtitle Badge */}
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#656D4A',
                  textAlign: 'center',
                  backgroundColor: '#F4F5EE',
                  borderRadius: '5px',
                  padding: '2px 6px',
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

      {/* 2. BALANCED 2-COLUMN ZERO-SCROLL POS BILLING GRID */}
      <div className="billing-grid-responsive">
        {/* LEFT COLUMN: Entry Fields */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1.5px solid #B6AD90',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(65, 72, 51, 0.06)',
          }}
        >
          {/* Selected Product Header Strip - Horizontal Inline */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid #E8EAE0',
              paddingBottom: '8px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>{selectedProduct.icon}</span>
              <span className="font-nastaleeq" style={{ fontSize: '19px', fontWeight: 800, color: '#414833' }}>
                {selectedProduct.nameUr}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#656D4A' }}>
                ({selectedProduct.nameEn})
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#7F4F24', fontFamily: 'var(--font-mono)' }}>
                • Rs {selectedProduct.ratePerKg}/KG
              </span>
            </div>

            {/* Mode Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#C2C5AA',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid #B6AD90',
                gap: '4px',
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
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: calcMode === 'weight' ? '#414833' : 'transparent',
                  color: calcMode === 'weight' ? '#F4F5EE' : '#414833',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Scale size={15} color={calcMode === 'weight' ? '#F4F5EE' : '#414833'} />
                <span>وزن (Weight)</span>
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
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: calcMode === 'amount' ? '#414833' : 'transparent',
                  color: calcMode === 'amount' ? '#F4F5EE' : '#414833',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Banknote size={15} color={calcMode === 'amount' ? '#F4F5EE' : '#414833'} />
                <span>رقم (Rupees)</span>
              </button>
            </div>
          </div>

          {/* Weight Entry + Quick Add Row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="font-nastaleeq" style={{ fontSize: '17px', fontWeight: 800, color: '#414833' }}>
                  {calcMode === 'weight' ? 'وزن درج کریں' : 'مطلوبہ رقم درج کریں'}
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#656D4A' }}>
                  {calcMode === 'weight' ? '(Weight - KG)' : '(Rupees - Rs)'}
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#7F4F24', fontFamily: 'var(--font-mono)' }}>
                {'Rate: Rs ' + rate + '/KG'}
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
                  height: '52px',
                  borderRadius: '9px',
                  border: '2px solid #B6AD90',
                  backgroundColor: '#F4F5EE',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#414833',
                  padding: '0 50px 0 14px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '16px', fontSize: '15px', fontWeight: 900, color: '#414833' }}>
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>

            {/* Quick-Tap Weight Increments */}
            {calcMode === 'weight' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
                {[
                  { label: '5 KG (کلو)', val: 5 },
                  { label: '10 KG (کلو)', val: 10 },
                  { label: '20 KG (کلو)', val: 20 },
                  { label: '40 KG (بوری)', val: 40 },
                ].map((pill) => (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => {
                      setInputValue(String(pill.val));
                      setIsReceivedAutoUpdated(true);
                      weightInputRef.current?.focus();
                    }}
                    className="touch-active"
                    style={{
                      padding: '8px 6px',
                      borderRadius: '8px',
                      backgroundColor: numInput === pill.val ? '#7F4F24' : '#C2C5AA',
                      color: numInput === pill.val ? '#F4F5EE' : '#414833',
                      border: numInput === pill.val ? '2px solid #7F4F24' : '1.5px solid #B6AD90',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '13.5px',
                      fontWeight: 800,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="font-nastaleeq" style={{ fontSize: '17px', fontWeight: 800, color: '#414833' }}>
                  وصول رقم
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#656D4A' }}>
                  (Cash Received - Rs)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReceivedAmount(String(netTotal));
                  setIsReceivedAutoUpdated(true);
                }}
                className="touch-active"
                style={{
                  background: '#C2C5AA',
                  border: '1.5px solid #B6AD90',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#414833',
                  cursor: 'pointer',
                }}
              >
                ✓ پورے پیسے (Exact Cash)
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
                  height: '48px',
                  borderRadius: '9px',
                  border: '2px solid #B6AD90',
                  backgroundColor: '#F4F5EE',
                  fontSize: '26px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#414833',
                  padding: '0 48px 0 14px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '16px', fontSize: '15px', fontWeight: 900, color: '#414833' }}>
                Rs
              </span>
            </div>
          </div>

          {/* Customer Details for Udhaar */}
          <div
            style={{
              position: 'relative',
              backgroundColor: '#F4F5EE',
              borderRadius: '10px',
              border: '1.5px solid #B6AD90',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={16} color="#414833" />
                <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 800, color: '#414833' }}>
                  گاہک کا نام و فون
                </span>
                <span style={{ fontSize: '12px', color: '#656D4A', fontWeight: 700 }}>
                  (Customer - ادھار کھاتہ)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#656D4A', fontWeight: 600 }}>Type name for list</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  ref={customerNameInputRef}
                  type="text"
                  placeholder="گاہک کا نام / Name..."
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
                    padding: '4px 10px',
                    borderRadius: '7px',
                    border: '1.5px solid #B6AD90',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#414833',
                  }}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '42px',
                      left: 0,
                      right: 0,
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #B6AD90',
                      borderRadius: '8px',
                      boxShadow: '0 6px 16px rgba(65, 72, 51, 0.2)',
                      zIndex: 200,
                      maxHeight: '140px',
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
                          borderBottom: '1px solid #E8EAE0',
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
                  placeholder="موبائل نمبر / Phone..."
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
                    padding: '4px 10px',
                    borderRadius: '7px',
                    border: '1.5px solid #B6AD90',
                    fontSize: '13.5px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#414833',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Total Amount & 2 Prominent Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Total Bill Box */}
          <div
            style={{
              backgroundColor: '#C2C5AA',
              borderRadius: '12px',
              border: '2px solid #B6AD90',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 4px 10px rgba(65, 72, 51, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 800, color: '#414833' }}>
                  کل رقم
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#656D4A' }}>
                  (TOTAL BILL)
                </span>
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#414833',
                  backgroundColor: '#F4F5EE',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  border: '1.5px solid #B6AD90',
                }}
              >
                {calculatedWeight + ' KG @ Rs ' + rate}
              </span>
            </div>

            {/* Clear, Prominent Bill Figure */}
            <div
              style={{
                fontSize: '40px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#414833',
                lineHeight: 1,
                margin: '6px 0 4px',
                letterSpacing: '-0.5px',
              }}
            >
              {'Rs ' + netTotal.toLocaleString()}
            </div>

            {/* Balance or Return Status */}
            {balanceRemaining > 0 ? (
              <div
                style={{
                  backgroundColor: '#F4F5EE',
                  border: '1.5px solid #656D4A',
                  borderRadius: '7px',
                  padding: '7px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-nastaleeq" style={{ fontSize: '15px', fontWeight: 800, color: '#656D4A' }}>
                    باقی ادھار
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#656D4A' }}>
                    (Remaining):
                  </span>
                </div>
                <span style={{ fontSize: '17px', fontWeight: 900, color: '#656D4A', fontFamily: 'var(--font-mono)' }}>
                  {'Rs ' + balanceRemaining.toLocaleString()}
                </span>
              </div>
            ) : changeToReturn > 0 ? (
              <div
                style={{
                  backgroundColor: '#F4F5EE',
                  border: '1.5px solid #7F4F24',
                  borderRadius: '7px',
                  padding: '7px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-nastaleeq" style={{ fontSize: '15px', fontWeight: 800, color: '#7F4F24' }}>
                    گاہک کو واپسی
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#7F4F24' }}>
                    (Return):
                  </span>
                </div>
                <span style={{ fontSize: '17px', fontWeight: 900, color: '#7F4F24', fontFamily: 'var(--font-mono)' }}>
                  {'Rs ' + changeToReturn.toLocaleString()}
                </span>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#F4F5EE',
                  border: '1.5px solid #B6AD90',
                  borderRadius: '7px',
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#414833',
                }}
              >
                ✓ مکمل نقد ادائیگی (Exact Cash Paid)
              </div>
            )}

            {/* Discount Option */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed #B6AD90' }}>
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#414833',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Tag size={14} color="#414833" />
                <span>{showDiscount ? 'رعایت بند کریں' : '+ رعایت شامل کریں (+ Add Discount)'}</span>
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
                  style={{
                    width: '75px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1.5px solid #414833',
                    backgroundColor: '#F4F5EE',
                    color: '#414833',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              )}
            </div>
          </div>

          {/* 2 ACTION BUTTONS - PROMINENT, TOUCH FRIENDLY & PERFECT FIT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* BUTTON 1: PRINT CASH BILL */}
            <button
              type="button"
              onClick={() => handleFinalSubmit(false)}
              disabled={rate <= 0 || calculatedWeight <= 0}
              className="touch-active"
              style={{
                height: '54px',
                borderRadius: '11px',
                backgroundColor: rate > 0 && calculatedWeight > 0 ? '#7F4F24' : '#C2C5AA',
                color: '#F4F5EE',
                border: 'none',
                cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
                boxShadow: rate > 0 && calculatedWeight > 0 ? '0 4px 12px rgba(127, 79, 36, 0.28)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0 20px',
              }}
            >
              <Printer size={22} color="#F4F5EE" strokeWidth={2.4} />
              <span className="font-nastaleeq" style={{ fontSize: '21px', fontWeight: 800, color: '#F4F5EE' }}>
                نقد بل پرنٹ کریں
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#F4F5EE', opacity: 0.9 }}>
                (Print Cash Bill)
              </span>
            </button>

            {/* BUTTON 2: SAVE AS CREDIT */}
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
                borderRadius: '11px',
                backgroundColor: rate > 0 && calculatedWeight > 0 ? '#656D4A' : '#C2C5AA',
                color: '#F4F5EE',
                border: 'none',
                cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
                boxShadow: rate > 0 && calculatedWeight > 0 ? '0 4px 10px rgba(101, 109, 74, 0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0 20px',
              }}
            >
              <BookOpen size={19} color="#F4F5EE" strokeWidth={2.4} />
              <span className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 800, color: '#F4F5EE' }}>
                ادھار کھاتہ میں محفوظ کریں
              </span>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#F4F5EE', opacity: 0.9 }}>
                (Save as Credit)
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
    </div>);
};
