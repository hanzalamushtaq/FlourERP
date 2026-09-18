'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Ticket, Printer, BookOpen, Check, UserCheck } from 'lucide-react';

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Haji Rasheed (حاجی رشید)', phone: '0300-8765432' },
  { id: '2', name: 'Haji Altaf (حاجی الطاف)', phone: '0301-7654321' },
  { id: '3', name: 'Haji Mushtaq (حاجی مشتاق)', phone: '0302-3344556' },
  { id: '4', name: 'Tariq Naan Shop (طارق نان بائی)', phone: '0321-9876543' },
  { id: '5', name: 'Mian Aslam Zamindar (میاں اسلم)', phone: '0333-1122334' },
  { id: '6', name: 'Babar Hotel & Cafe (بابر ہوٹل)', phone: '0345-5566778' },
];

export const PisaiBillingScreen: React.FC = () => {
  const [weightKg, setWeightKg] = useState<string>('25');
  const [chargeAmount, setChargeAmount] = useState<string>('150');
  const [receivedAmount, setReceivedAmount] = useState<string>('150');
  const [isReceivedAutoUpdated, setIsReceivedAutoUpdated] = useState<boolean>(true);
  const [serviceType, setServiceType] = useState<'safai_pisai' | 'pisai'>('safai_pisai');

  // Customer State & Autocomplete
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [suggestions, setSuggestions] = useState<typeof MOCK_CUSTOMERS>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const [tokenCounter, setTokenCounter] = useState<number>(482);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Sequential Enter Refs
  const weightInputRef = useRef<HTMLInputElement>(null);
  const feeInputRef = useRef<HTMLInputElement>(null);
  const receivedInputRef = useRef<HTMLInputElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const customerPhoneInputRef = useRef<HTMLInputElement>(null);

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

  // Autocomplete
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

  // Submit Logic
  const handleFinalSubmit = (forcedCredit?: boolean) => {
    if (numWeight <= 0 || numCharge <= 0) {
      alert('Please enter weight and charge amount.');
      weightInputRef.current?.focus();
      return;
    }

    const hasCustomerDetails = customerName.trim().length > 0;
    const isCreditSale = forcedCredit !== undefined ? forcedCredit : (hasCustomerDetails || balanceRemaining > 0);

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
      customerName: hasCustomerDetails ? `${customerName.trim()} ${customerPhone.trim() ? `(${customerPhone.trim()})` : ''}` : undefined,
      isCredit: isCreditSale,
      subtotal: numCharge,
      discount: 0,
      netTotal: numCharge,
      cashReceived: numReceived,
      remainingBalance: balanceRemaining,
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  const currentTokenPreview = String(tokenCounter).padStart(4, '0');

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. TOP: Fitted Service Selection Cards - Large & Touch-Friendly */}
      <div className="service-grid-responsive">
        <div
          onClick={() => setServiceType('safai_pisai')}
          className="touch-active"
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: serviceType === 'safai_pisai' ? '#DCE0CE' : '#FFFFFF',
            border: serviceType === 'safai_pisai' ? '2.5px solid #7F4F24' : '1.5px solid #B6AD90',
            boxShadow: serviceType === 'safai_pisai' ? '0 3px 8px rgba(127, 79, 36, 0.2)' : '0 1px 4px rgba(65, 72, 51, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '64px',
            transition: 'all 0.12s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="font-nastaleeq" style={{ fontSize: '19px', fontWeight: 800, color: '#414833' }}>
              صفائی اور پیسائی
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#656D4A' }}>
              (Cleaning + Grinding)
            </span>
          </div>
          {serviceType === 'safai_pisai' && (
            <div style={{ width: '26px', height: '26px', borderRadius: '9999px', backgroundColor: '#7F4F24', color: '#F4F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={16} strokeWidth={3} />
            </div>
          )}
        </div>

        <div
          onClick={() => setServiceType('pisai')}
          className="touch-active"
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: serviceType === 'pisai' ? '#DCE0CE' : '#FFFFFF',
            border: serviceType === 'pisai' ? '2.5px solid #7F4F24' : '1.5px solid #B6AD90',
            boxShadow: serviceType === 'pisai' ? '0 3px 8px rgba(127, 79, 36, 0.2)' : '0 1px 4px rgba(65, 72, 51, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '64px',
            transition: 'all 0.12s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="font-nastaleeq" style={{ fontSize: '19px', fontWeight: 800, color: '#414833' }}>
              صرف پیسائی
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#656D4A' }}>
              (Grinding Only)
            </span>
          </div>
          {serviceType === 'pisai' && (
            <div style={{ width: '26px', height: '26px', borderRadius: '9999px', backgroundColor: '#7F4F24', color: '#F4F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={16} strokeWidth={3} />
            </div>
          )}
        </div>
      </div>

      {/* 2. BALANCED 2-COLUMN ZERO-SCROLL POS BILLING GRID */}
      <div className="billing-grid-responsive">
        {/* LEFT COLUMN: Weight, Quick Add, Fee, Cash, Customer */}
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
          {/* Wheat Weight Entry */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="font-nastaleeq" style={{ fontSize: '17px', fontWeight: 800, color: '#414833' }}>
                  گندم کا وزن درج کریں
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#656D4A' }}>
                  (Weight - KG)
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#7F4F24' }}>
                {serviceType === 'safai_pisai' ? 'صفائی + پیسائی' : 'صرف پیسائی'}
              </span>
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
                KG
              </span>
            </div>

            {/* Quick Tap Weight Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
              {[
                { label: '10 KG (کلو)', val: 10 },
                { label: '20 KG (کلو)', val: 20 },
                { label: '40 KG (من)', val: 40 },
                { label: '50 KG (کلو)', val: 50 },
              ].map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => {
                    setWeightKg(String(pill.val));
                    weightInputRef.current?.focus();
                  }}
                  className="touch-active"
                  style={{
                    padding: '8px 6px',
                    borderRadius: '8px',
                    backgroundColor: numWeight === pill.val ? '#7F4F24' : '#C2C5AA',
                    color: numWeight === pill.val ? '#F4F5EE' : '#414833',
                    border: numWeight === pill.val ? '2px solid #7F4F24' : '1.5px solid #B6AD90',
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
          </div>

          {/* Grinding Fee (مزدوری) + Received Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                <span className="font-nastaleeq" style={{ fontSize: '17px', fontWeight: 800, color: '#414833' }}>
                  مزدوری پیسائی
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#656D4A' }}>
                  (Fee - Rs)
                </span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={feeInputRef}
                  type="number"
                  step="any"
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
                    height: '48px',
                    borderRadius: '9px',
                    border: '2px solid #B6AD90',
                    backgroundColor: '#F4F5EE',
                    fontSize: '26px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#414833',
                    padding: '0 42px 0 12px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '14px', fontSize: '14px', fontWeight: 900, color: '#414833' }}>
                  Rs
                </span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-nastaleeq" style={{ fontSize: '17px', fontWeight: 800, color: '#414833' }}>
                    وصول رقم
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#656D4A' }}>
                    (Cash)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReceivedAmount(chargeAmount);
                    setIsReceivedAutoUpdated(true);
                  }}
                  className="touch-active"
                  style={{
                    background: '#C2C5AA',
                    border: '1.5px solid #B6AD90',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#414833',
                    cursor: 'pointer',
                  }}
                >
                  ✓ پورے (Exact)
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
                    padding: '0 42px 0 12px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '14px', fontSize: '14px', fontWeight: 900, color: '#414833' }}>
                  Rs
                </span>
              </div>
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
                  (Customer - ادھار کے لیے)
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

        {/* RIGHT COLUMN: Token Preview, Total Fee & 2 Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Token Card */}
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
                  پیسائی ٹوکن و فیس
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#656D4A' }}>
                  (PISAI TOKEN & CHARGES)
                </span>
              </div>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#7F4F24',
                  color: '#F4F5EE',
                  fontSize: '14px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {'Token #' + currentTokenPreview}
              </div>
            </div>

            {/* Crisp Fee Figure */}
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
              {'Rs ' + numCharge.toLocaleString()}
            </div>

            {/* Balance Status */}
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
                    واپسی رقم
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#7F4F24' }}>
                    (Change):
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
                ✓ مکمل نقد وصول (Exact Cash Received)
              </div>
            )}
          </div>

          {/* 2 ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* BUTTON 1: PRINT TOKEN (CASH) */}
            <button
              type="button"
              onClick={() => handleFinalSubmit(false)}
              disabled={numWeight <= 0 || numCharge <= 0}
              className="touch-active"
              style={{
                height: '54px',
                borderRadius: '11px',
                backgroundColor: numWeight > 0 && numCharge > 0 ? '#7F4F24' : '#C2C5AA',
                color: '#F4F5EE',
                border: 'none',
                cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
                boxShadow: numWeight > 0 && numCharge > 0 ? '0 4px 12px rgba(127, 79, 36, 0.28)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0 20px',
              }}
            >
              <Printer size={22} color="#F4F5EE" strokeWidth={2.4} />
              <span className="font-nastaleeq" style={{ fontSize: '21px', fontWeight: 800, color: '#F4F5EE' }}>
                نقد ٹوکن پرنٹ کریں
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#F4F5EE', opacity: 0.9 }}>
                (Print Cash Token)
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
              disabled={numWeight <= 0 || numCharge <= 0}
              className="touch-active"
              style={{
                height: '48px',
                borderRadius: '11px',
                backgroundColor: numWeight > 0 && numCharge > 0 ? '#656D4A' : '#C2C5AA',
                color: '#F4F5EE',
                border: 'none',
                cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
                boxShadow: numWeight > 0 && numCharge > 0 ? '0 4px 10px rgba(101, 109, 74, 0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0 20px',
              }}
            >
              <BookOpen size={19} color="#F4F5EE" strokeWidth={2.4} />
              <span className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 800, color: '#F4F5EE' }}>
                ادھار ٹوکن درج کریں
              </span>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#F4F5EE', opacity: 0.9 }}>
                (Save as Credit Token)
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
