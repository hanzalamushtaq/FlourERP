'use strict';
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
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 1. TOP: Service Type Toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div
          onClick={() => setServiceType('safai_pisai')}
          className="touch-active"
          style={{
            padding: '8px 14px',
            borderRadius: '12px',
            backgroundColor: serviceType === 'safai_pisai' ? '#F1DCA7' : '#FAF5EA',
            border: serviceType === 'safai_pisai' ? '2.5px solid #2B1D14' : '1.5px solid #BAA587',
            boxShadow: serviceType === 'safai_pisai' ? '0 4px 10px rgba(43, 29, 20, 0.2)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2B1D14' }}>FULL SERVICE</span>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#2B1D14', lineHeight: 1.2 }}>
              صفائی اور پیسائی
            </div>
          </div>
          {serviceType === 'safai_pisai' && <Check size={16} color="#2B1D14" strokeWidth={3} />}
        </div>

        <div
          onClick={() => setServiceType('pisai')}
          className="touch-active"
          style={{
            padding: '8px 14px',
            borderRadius: '12px',
            backgroundColor: serviceType === 'pisai' ? '#F1DCA7' : '#FAF5EA',
            border: serviceType === 'pisai' ? '2.5px solid #2B1D14' : '1.5px solid #BAA587',
            boxShadow: serviceType === 'pisai' ? '0 4px 10px rgba(43, 29, 20, 0.2)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2B1D14' }}>GRINDING ONLY</span>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#2B1D14', lineHeight: 1.2 }}>
              صرف پیسائی
            </div>
          </div>
          {serviceType === 'pisai' && <Check size={16} color="#2B1D14" strokeWidth={3} />}
        </div>
      </div>

      {/* 2. ENTRY CARD */}
      <div
        style={{
          backgroundColor: '#FAF5EA',
          borderRadius: '16px',
          border: '2px solid #BAA587',
          boxShadow: '0 6px 16px rgba(43, 29, 20, 0.08)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', alignItems: 'center' }}>
          {/* Left: Inputs for Weight & Manual Charge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#2B1D14', display: 'block', marginBottom: '3px' }}>
                Wheat Weight (گندم کا وزن - KG):
              </label>
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
                    height: '44px',
                    borderRadius: '10px',
                    border: '2px solid #BAA587',
                    backgroundColor: '#FAF5EA',
                    fontSize: '22px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#2B1D14',
                    padding: '0 45px 0 10px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', fontSize: '14px', fontWeight: 900, color: '#2B1D14' }}>
                  KG
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#2B1D14', display: 'block', marginBottom: '3px' }}>
                Manual Grinding Fee (پیسائی کی اجرت - Rs):
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={feeInputRef}
                  type="number"
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
                    height: '44px',
                    borderRadius: '10px',
                    border: '2px solid #BAA587',
                    backgroundColor: '#FAF5EA',
                    fontSize: '22px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#2B1D14',
                    padding: '0 45px 0 10px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', fontSize: '14px', fontWeight: 900, color: '#2B1D14' }}>
                  Rs
                </span>
              </div>
            </div>
          </div>

          {/* Right: Token Preview Card */}
          <div
            style={{
              backgroundColor: '#F1DCA7',
              border: '2px dashed #2B1D14',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(43, 29, 20, 0.12)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#2B1D14' }}>
              CUSTOMER TOKEN NUMBER (ٹوکن نمبر)
            </span>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#2B1D14',
                lineHeight: 1.1,
                margin: '2px 0',
                letterSpacing: '2px',
              }}
            >
              #{currentTokenPreview}
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: '#2B1D14' }}>
              گندم پیسائی ٹوکن
            </div>
          </div>
        </div>

        {/* 3. Cash Received Row */}
        <div
          style={{
            backgroundColor: '#FAF5EA',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1.5px solid #BAA587',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div>
            <label style={{ fontSize: '12px', fontWeight: 900, color: '#2B1D14', display: 'block', marginBottom: '2px' }}>
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
                  border: '2px solid #BAA587',
                  backgroundColor: '#FAF5EA',
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#2B1D14',
                  padding: '0 40px 0 10px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '10px', fontSize: '13px', fontWeight: 900, color: '#2B1D14' }}>
                Rs
              </span>
            </div>
          </div>

          <div>
            {balanceRemaining > 0 ? (
              <div style={{ backgroundColor: '#F1DCA7', border: '1.5px solid #BAA587', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#2B1D14' }}>Remaining Balance (باقی):</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#2B1D14', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div style={{ backgroundColor: '#F1DCA7', border: '1.5px solid #BAA587', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#2B1D14' }}>Change to Return (واپسی):</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#2B1D14', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#F1DCA7', border: '1.5px solid #BAA587', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#2B1D14' }}>✓ Exact Fee Received</div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Customer Details with Autocomplete */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#FAF5EA',
            border: '1.5px solid #BAA587',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '12px', color: '#2B1D14', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={14} color="#2B1D14" /> Customer Details (گاہک کا نام — ادھار کے لیے درج کریں)
            </span>
            <span style={{ fontSize: '11px', color: '#797D62', fontWeight: 600 }}>Type name for registered accounts</span>
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
                  border: '1.5px solid #BAA587',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                  backgroundColor: '#FAF5EA',
                  color: '#2B1D14',
                }}
              />

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '42px',
                    left: 0,
                    right: 0,
                    backgroundColor: '#FAF5EA',
                    border: '1.5px solid #BAA587',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(43, 29, 20, 0.2)',
                    zIndex: 200,
                    maxHeight: '150px',
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
                        borderBottom: '1px solid #BAA587',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#2B1D14' }}>{cust.name}</span>
                      <span style={{ fontSize: '11px', color: '#797D62', fontWeight: 600 }}>{cust.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <input
                ref={customerPhoneInputRef}
                type="text"
                placeholder="Phone (اختیاری)..."
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
                  border: '1.5px solid #BAA587',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FAF5EA',
                  color: '#2B1D14',
                }}
              />
            </div>
          </div>
        </div>

        {/* 5. ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => handleFinalSubmit(false)}
            disabled={numWeight <= 0 || numCharge <= 0}
            className="touch-active"
            style={{
              height: '48px',
              borderRadius: '10px',
              backgroundColor: numWeight > 0 && numCharge > 0 ? '#E8AC65' : '#F1DCA7',
              color: numWeight > 0 && numCharge > 0 ? '#2B1D14' : '#BAA587',
              border: 'none',
              fontSize: '15px',
              fontWeight: 900,
              cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
              boxShadow: numWeight > 0 && numCharge > 0 ? '0 3px 8px rgba(43, 29, 20, 0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Printer size={20} color={numWeight > 0 && numCharge > 0 ? '#2B1D14' : '#BAA587'} />
            <span>Print Cash Ticket (نقد ٹوکن)</span>
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
            disabled={numWeight <= 0 || numCharge <= 0}
            className="touch-active"
            style={{
              height: '48px',
              borderRadius: '10px',
              backgroundColor: numWeight > 0 && numCharge > 0 ? '#797D62' : '#F1DCA7',
              color: numWeight > 0 && numCharge > 0 ? '#FAF5EA' : '#BAA587',
              border: 'none',
              fontSize: '15px',
              fontWeight: 900,
              cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
              boxShadow: numWeight > 0 && numCharge > 0 ? '0 3px 8px rgba(43, 29, 20, 0.2)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={18} color={numWeight > 0 && numCharge > 0 ? '#FAF5EA' : '#BAA587'} />
            <span>Save as Credit (ادھار ٹوکن)</span>
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
