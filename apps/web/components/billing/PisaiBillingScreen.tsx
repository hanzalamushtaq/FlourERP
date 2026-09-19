'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Ticket, Printer, BookOpen, Check, Cog } from 'lucide-react';

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

  // Input Refs
  const weightInputRef = useRef<HTMLInputElement>(null);
  const feeInputRef = useRef<HTMLInputElement>(null);
  const receivedInputRef = useRef<HTMLInputElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);

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
    feeInputRef.current?.focus();
  };

  // Submit Logic
  const handleFinalSubmit = (forcedCredit?: boolean) => {
    if (numWeight <= 0 || numCharge <= 0) {
      alert('برائے مہربانی وزن اور اجرت کی رقم درج کریں۔');
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
      timestamp: new Date().toLocaleString('en-US', { hour12: true }),
      billerName: 'محمد عاصف (کاؤنٹر 01)',
      customerName: customerName.trim() || undefined,
      isCredit: isCreditSale,
      serviceType: serviceType === 'safai_pisai' ? 'صفائی و پسائی' : 'صرف پسائی',
      pisaiWeightKg: numWeight,
      subtotal: numCharge,
      discount: 0,
      netTotal: numCharge,
      cashReceived: numReceived,
      remainingBalance: balanceRemaining,
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. TOP: Service Type Selection */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setServiceType('safai_pisai');
            weightInputRef.current?.focus();
          }}
          className="touch-active"
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: serviceType === 'safai_pisai' ? '#fffbeb' : '#ffffff',
            border: serviceType === 'safai_pisai' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Cog size={18} color={serviceType === 'safai_pisai' ? '#d97706' : '#64748b'} />
          <span
            className="font-nastaleeq"
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: serviceType === 'safai_pisai' ? '#92400e' : '#334155',
            }}
          >
            صفائی و پسائی (Safai + Pisai)
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setServiceType('pisai');
            weightInputRef.current?.focus();
          }}
          className="touch-active"
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: serviceType === 'pisai' ? '#fffbeb' : '#ffffff',
            border: serviceType === 'pisai' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Ticket size={18} color={serviceType === 'pisai' ? '#d97706' : '#64748b'} />
          <span
            className="font-nastaleeq"
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: serviceType === 'pisai' ? '#92400e' : '#334155',
            }}
          >
            صرف پسائی (Pisai Only)
          </span>
        </button>
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
          {/* Weight Entry */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                گندم وزن (KG):
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
                KG
              </span>
            </div>

            {/* Quick Weight Presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
              {[
                { label: '20 KG', val: 20 },
                { label: '25 KG', val: 25 },
                { label: '40 KG', val: 40 },
                { label: '50 KG', val: 50 },
              ].map((pill) => (
                <button
                  key={pill.val}
                  type="button"
                  onClick={() => {
                    setWeightKg(String(pill.val));
                    feeInputRef.current?.focus();
                  }}
                  className="touch-active"
                  style={{
                    padding: '5px 4px',
                    borderRadius: '5px',
                    backgroundColor: numWeight === pill.val ? '#0f172a' : '#f1f5f9',
                    color: numWeight === pill.val ? '#ffffff' : '#334155',
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
          </div>

          {/* Grinding Fee (Manual Amount) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                پسائی اجرت (Rs):
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

          {/* Cash Received */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                وصول رقم (Rs):
              </span>
              <button
                type="button"
                onClick={() => {
                  setReceivedAmount(chargeAmount);
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

          {/* Customer Name */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                گاہک کا نام (اختیاری):
              </span>
            </div>

            <input
              ref={customerNameInputRef}
              type="text"
              placeholder="گاہک کا نام لکھیں..."
              value={customerName}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
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

        {/* RIGHT COLUMN: Token Summary & Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Token Summary Card */}
          <div
            style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '10px',
              border: '1.5px solid #bae6fd',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 2px 5px rgba(2, 132, 199, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                پسائی ٹوکن رقم
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: '#b45309',
                  backgroundColor: '#fef3c7',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                #{String(tokenCounter).padStart(4, '0')}
              </span>
            </div>

            {/* Total Fee Figure */}
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
              Rs {numCharge.toLocaleString()}
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
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Button 1: Print Token */}
            <button
              type="button"
              onClick={() => handleFinalSubmit(false)}
              disabled={numWeight <= 0 || numCharge <= 0}
              className="touch-active"
              style={{
                height: '44px',
                borderRadius: '8px',
                backgroundColor: numWeight > 0 && numCharge > 0 ? '#0284c7' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 16px',
                boxShadow: numWeight > 0 && numCharge > 0 ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
              }}
            >
              <Printer size={16} />
              <span className="font-nastaleeq" style={{ fontSize: '15px', fontWeight: 800 }}>
                ٹوکن اور بل پرنٹ کریں
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
              disabled={numWeight <= 0 || numCharge <= 0}
              className="touch-active"
              style={{
                height: '40px',
                borderRadius: '8px',
                backgroundColor: numWeight > 0 && numCharge > 0 ? '#7F4F24' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
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
