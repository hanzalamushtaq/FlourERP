'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Ticket, Printer, BookOpen, Check, UserCheck } from 'lucide-react';

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Haji Rasheed (Ø­Ø§Ø¬ÛŒ Ø±Ø´ÛŒØ¯)', phone: '0300-8765432' },
  { id: '2', name: 'Haji Altaf (Ø­Ø§Ø¬ÛŒ Ø§Ù„Ø·Ø§Ù)', phone: '0301-7654321' },
  { id: '3', name: 'Haji Mushtaq (Ø­Ø§Ø¬ÛŒ Ù…Ø´ØªØ§Ù‚)', phone: '0302-3344556' },
  { id: '4', name: 'Tariq Naan Shop (Ø·Ø§Ø±Ù‚ Ù†Ø§Ù† Ø¨Ø§Ø¦ÛŒ)', phone: '0321-9876543' },
  { id: '5', name: 'Mian Aslam Zamindar (Ù…ÛŒØ§Úº Ø§Ø³Ù„Ù…)', phone: '0333-1122334' },
  { id: '6', name: 'Babar Hotel & Cafe (Ø¨Ø§Ø¨Ø± ÛÙˆÙ¹Ù„)', phone: '0345-5566778' },
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
      serviceType: serviceType === 'safai_pisai' ? 'Safai + Pisai (ØµÙØ§Ø¦ÛŒ Ø§ÙˆØ± Ù¾ÛŒØ³Ø§Ø¦ÛŒ)' : 'Pisai Only (ØµØ±Ù Ù¾ÛŒØ³Ø§Ø¦ÛŒ)',
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
            backgroundColor: serviceType === 'safai_pisai' ? '#5E6348' : '#FFFFFF',
            border: serviceType === 'safai_pisai' ? '2.5px solid #5E6348' : '2px solid #C2BAAA',
            boxShadow: serviceType === 'safai_pisai' ? '0 4px 10px rgba(121, 125, 98, 0.2)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1B1E13' }}>FULL SERVICE</span>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#1B1E13', lineHeight: 1.2 }}>
              ØµÙØ§Ø¦ÛŒ Ø§ÙˆØ± Ù¾ÛŒØ³Ø§Ø¦ÛŒ
            </div>
          </div>
          {serviceType === 'safai_pisai' && <Check size={16} color="#1B1E13" strokeWidth={3} />}
        </div>

        <div
          onClick={() => setServiceType('pisai')}
          className="touch-active"
          style={{
            padding: '8px 14px',
            borderRadius: '12px',
            backgroundColor: serviceType === 'pisai' ? '#5E6348' : '#FFFFFF',
            border: serviceType === 'pisai' ? '2.5px solid #5E6348' : '2px solid #C2BAAA',
            boxShadow: serviceType === 'pisai' ? '0 4px 10px rgba(121, 125, 98, 0.2)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1B1E13' }}>GRINDING ONLY</span>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#1B1E13', lineHeight: 1.2 }}>
              ØµØ±Ù Ù¾ÛŒØ³Ø§Ø¦ÛŒ
            </div>
          </div>
          {serviceType === 'pisai' && <Check size={16} color="#1B1E13" strokeWidth={3} />}
        </div>
      </div>

      {/* 2. ENTRY CARD */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #C2BAAA',
          boxShadow: '0 4px 14px rgba(27, 30, 19, 0.07)',
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
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13', display: 'block', marginBottom: '3px' }}>
                Wheat Weight (Ú¯Ù†Ø¯Ù… Ú©Ø§ ÙˆØ²Ù† - KG):
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
                    border: '2.5px solid #5E6348',
                    backgroundColor: '#FFFFFF',
                    fontSize: '22px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#1B1E13',
                    padding: '0 45px 0 10px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', fontSize: '14px', fontWeight: 900, color: '#1B1E13' }}>
                  KG
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13', display: 'block', marginBottom: '3px' }}>
                Manual Grinding Fee (Ù¾ÛŒØ³Ø§Ø¦ÛŒ Ú©ÛŒ Ø§Ø¬Ø±Øª - Rs):
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
                    border: '2.5px solid #5E6348',
                    backgroundColor: '#FFFFFF',
                    fontSize: '22px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#1B1E13',
                    padding: '0 45px 0 10px',
                    outline: 'none',
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', fontSize: '14px', fontWeight: 900, color: '#1B1E13' }}>
                  Rs
                </span>
              </div>
            </div>
          </div>

          {/* Right: Token Preview Card */}
          <div
            style={{
              backgroundColor: '#FFCB69',
              border: '2.5px dashed #5E6348',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(121, 125, 98, 0.12)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1B1E13' }}>
              CUSTOMER TOKEN NUMBER (Ù¹ÙˆÚ©Ù† Ù†Ù…Ø¨Ø±)
            </span>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#1B1E13',
                lineHeight: 1.1,
                margin: '2px 0',
                letterSpacing: '2px',
              }}
            >
              #{currentTokenPreview}
            </div>
            <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: '#1B1E13' }}>
              Ú¯Ù†Ø¯Ù… Ù¾ÛŒØ³Ø§Ø¦ÛŒ Ù¹ÙˆÚ©Ù†
            </div>
          </div>
        </div>

        {/* 3. Cash Received Row */}
        <div
          style={{
            backgroundColor: '#F4F1EA',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '2px solid #C2BAAA',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div>
            <label style={{ fontSize: '12px', fontWeight: 900, color: '#1B1E13', display: 'block', marginBottom: '2px' }}>
              Cash Received (ÙˆØµÙˆÙ„ Ø±Ù‚Ù…):
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
                  border: '2px solid #5E6348',
                  backgroundColor: '#FFFFFF',
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#1B1E13',
                  padding: '0 40px 0 10px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '10px', fontSize: '13px', fontWeight: 900, color: '#1B1E13' }}>
                Rs
              </span>
            </div>
          </div>

          <div>
            {balanceRemaining > 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #5E6348', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#1B1E13' }}>Remaining Balance (Ø¨Ø§Ù‚ÛŒ):</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#1B1E13', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #5E6348', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#1B1E13' }}>Change to Return (ÙˆØ§Ù¾Ø³ÛŒ):</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#1B1E13', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #5E6348', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13' }}>âœ“ Exact Fee Received</div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Customer Details with Autocomplete */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#F8FAF8',
            border: '2px solid #C2BAAA',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '12px', color: '#1B1E13', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={14} color="#1B1E13" /> Customer Details (Ú¯Ø§ÛÚ© Ú©Ø§ Ù†Ø§Ù… â€” Ø§Ø¯Ú¾Ø§Ø± Ú©Û’ Ù„ÛŒÛ’ Ø¯Ø±Ø¬ Ú©Ø±ÛŒÚº)
            </span>
            <span style={{ fontSize: '11px', color: '#1B1E13', fontWeight: 600 }}>Type name for registered accounts</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={customerNameInputRef}
                type="text"
                placeholder="Customer Name (Ú¯Ø§ÛÚ© Ú©Ø§ Ù†Ø§Ù…)..."
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
                  border: '2px solid #C2BAAA',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#1B1E13',
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
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #5E6348',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(121, 125, 98, 0.2)',
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
                        borderBottom: '1.5px solid #E2DDD3',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1B1E13' }}>{cust.name}</span>
                      <span style={{ fontSize: '11px', color: '#1B1E13', fontWeight: 600 }}>{cust.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <input
                ref={customerPhoneInputRef}
                type="text"
                placeholder="Phone (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)..."
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
                  border: '2px solid #C2BAAA',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#1B1E13',
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
              height: '52px',
              borderRadius: '12px',
              backgroundColor: numWeight > 0 && numCharge > 0 ? '#E8AC65' : '#E2DDD3',
              color: numWeight > 0 && numCharge > 0 ? '#1B1E13' : '#8A8578',
              border: '2.5px solid #5E6348',
              fontSize: '17px',
              fontWeight: 900,
              cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
              boxShadow: numWeight > 0 && numCharge > 0 ? '0 4px 10px rgba(121, 125, 98, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Printer size={22} color={numWeight > 0 && numCharge > 0 ? '#1B1E13' : '#8A8578'} strokeWidth={2.5} />
            <span>Print Cash Ticket (Ù†Ù‚Ø¯ Ù¹ÙˆÚ©Ù†)</span>
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
              height: '52px',
              borderRadius: '12px',
              backgroundColor: numWeight > 0 && numCharge > 0 ? '#5E6348' : '#E2DDD3',
              color: numWeight > 0 && numCharge > 0 ? '#FFFFFF' : '#8A8578',
              border: '2.5px solid #5E6348',
              fontSize: '17px',
              fontWeight: 900,
              cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
              boxShadow: numWeight > 0 && numCharge > 0 ? '0 4px 10px rgba(121, 125, 98, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={20} color={numWeight > 0 && numCharge > 0 ? '#FFFFFF' : '#8A8578'} strokeWidth={2.5} />
            <span>Save as Credit (Ø§Ø¯Ú¾Ø§Ø± Ù¹ÙˆÚ©Ù†)</span>
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
