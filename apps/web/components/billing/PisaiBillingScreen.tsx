'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, BookOpen, Check, Cog, Ticket, Sparkles } from 'lucide-react';

// 1. Handcrafted Vector SVGs matching the Dashboard & Billing Aesthetic
const SafaiPisaiSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Chakki Mill Gear Ring */}
    <circle cx="18" cy="18" r="14" stroke="#4A2810" strokeWidth="2.2" strokeDasharray="3 2" fill="#FAF4ED" />
    {/* Inner Mill Stone */}
    <circle cx="18" cy="18" r="10" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
    {/* Cleaning Sieve Mesh pattern */}
    <path d="M12 18H24M18 12V24M14 14L22 22M22 14L14 22" stroke="#FAF4ED" strokeWidth="1.6" strokeLinecap="round" />
    {/* Golden Wheat Grains being cleaned */}
    <ellipse cx="28" cy="9" rx="3.5" ry="2" transform="rotate(-30 28 9)" fill="#D97706" stroke="#4A2810" strokeWidth="1.2" />
    <path d="M28 5L28 9" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    {/* Sparkle cleanliness star */}
    <path d="M8 8L9 10L11 11L9 12L8 14L7 12L5 11L7 10L8 8Z" fill="#D97706" />
  </svg>
);

const PisaiOnlySvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Heavy Traditional Dual Stone Mill */}
    {/* Upper Millstone with Funnel */}
    <path d="M10 13L18 8L26 13L18 17L10 13Z" fill="#8C582B" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Lower Base Stone */}
    <path d="M10 17L18 21L26 17V24L18 28L10 24V17Z" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Hopper Input Funnel */}
    <path d="M15 4H21L19 8H17L15 4Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.8" />
    {/* Fresh Flour Output Stream */}
    <path d="M18 28V33M15 31H21" stroke="#FAF4ED" strokeWidth="2" strokeLinecap="round" />
    {/* Milling Motion Whirly curve */}
    <path d="M7 21C6 17 7 13 10 11" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Haji Rasheed (حاجی رشید)', phone: '0300-8765432' },
  { id: '2', name: 'Haji Altaf (حاجی الطاف)', phone: '0301-7654321' },
  { id: '3', name: 'Haji Mushtaq (حاجی مشتاق)', phone: '0302-3344556' },
  { id: '4', name: 'Tariq Naan Shop (طارق نان بائی)', phone: '0321-9876543' },
  { id: '5', name: 'Mian Aslam Zamindar (میاں اسلم)', phone: '0333-1122334' },
  { id: '6', name: 'Babar Hotel & Cafe (بابر ہوٹل)', phone: '0345-5566778' },
];

const PISAI_RATES = {
  safai_pisai: 6, // Rs 6 / KG
  pisai: 5,       // Rs 5 / KG
};

export const PisaiBillingScreen: React.FC = () => {
  const [weightKg, setWeightKg] = useState<string>('25');
  const [serviceType, setServiceType] = useState<'safai_pisai' | 'pisai'>('safai_pisai');
  const [chargeAmount, setChargeAmount] = useState<string>('150');
  const [receivedAmount, setReceivedAmount] = useState<string>('150');
  const [isReceivedAutoUpdated, setIsReceivedAutoUpdated] = useState<boolean>(true);

  // Customer State & Autocomplete
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [suggestions, setSuggestions] = useState<typeof MOCK_CUSTOMERS>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Hover & Tactile States for Dashboard-Style Polish
  const [hoveredService, setHoveredService] = useState<'safai_pisai' | 'pisai' | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<'print' | 'credit' | null>(null);
  const [pressedBtn, setPressedBtn] = useState<'print' | 'credit' | null>(null);

  const [tokenCounter, setTokenCounter] = useState<number>(482);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Input Refs
  const weightInputRef = useRef<HTMLInputElement>(null);
  const feeInputRef = useRef<HTMLInputElement>(null);
  const receivedInputRef = useRef<HTMLInputElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);

  const currentRate = PISAI_RATES[serviceType];
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

  // Auto-focus weight input on service switch
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

  // Switch service type and auto-calculate default fee
  const handleSelectService = (type: 'safai_pisai' | 'pisai') => {
    setServiceType(type);
    const rate = PISAI_RATES[type];
    const newCharge = Math.round(numWeight * rate);
    setChargeAmount(String(newCharge));
    setIsReceivedAutoUpdated(true);
    weightInputRef.current?.focus();
    weightInputRef.current?.select();
  };

  // Change weight and auto-update fee
  const handleWeightChange = (newWeightStr: string) => {
    setWeightKg(newWeightStr);
    const parsed = parseFloat(newWeightStr) || 0;
    if (parsed > 0) {
      const calcFee = Math.round(parsed * currentRate);
      setChargeAmount(String(calcFee));
      setIsReceivedAutoUpdated(true);
    }
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP: Dashboard-Style Service Action Cards with Custom SVGs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1.4fr) minmax(300px, 1fr)',
          gap: '16px',
          width: '100%',
          direction: 'rtl',
        }}
      >
        {/* Card 1: Safai + Pisai - Warm Terracotta Clay Gradient */}
        <div
          onClick={() => handleSelectService('safai_pisai')}
          onMouseEnter={() => setHoveredService('safai_pisai')}
          onMouseLeave={() => setHoveredService(null)}
          className="touch-active"
          style={{
            background:
              hoveredService === 'safai_pisai'
                ? 'linear-gradient(135deg, #DFBBB0 0%, #C9A292 50%, #B18978 100%)'
                : 'linear-gradient(135deg, #D4ADA0 0%, #BE9685 50%, #A67E6D 100%)',
            borderRadius: '16px',
            border:
              serviceType === 'safai_pisai'
                ? '3px solid #FFFFFF'
                : hoveredService === 'safai_pisai'
                ? '2.5px solid #F4DFD7'
                : '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow:
              serviceType === 'safai_pisai'
                ? '0 14px 34px rgba(190, 150, 133, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.5)'
                : hoveredService === 'safai_pisai'
                ? '0 10px 24px rgba(190, 150, 133, 0.35)'
                : '0 6px 18px rgba(190, 150, 133, 0.20), 0 1px 3px rgba(0, 0, 0, 0.06)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            opacity: serviceType === 'safai_pisai' ? 1 : hoveredService === 'safai_pisai' ? 0.92 : 0.72,
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform:
              serviceType === 'safai_pisai'
                ? 'translateY(-4px)'
                : hoveredService === 'safai_pisai'
                ? 'translateY(-2px)'
                : 'none',
          }}
        >
          {/* Left: White Squircle Icon Tile */}
          <div
            style={{
              position: 'relative',
              width: '56px',
              height: '56px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
              flexShrink: 0,
              transition: 'transform 0.25s ease',
              transform: hoveredService === 'safai_pisai' ? 'scale(1.08) rotate(-1.5deg)' : 'scale(1)',
            }}
          >
            <SafaiPisaiSvg />
            {serviceType === 'safai_pisai' && (
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  border: '2px solid #FFFFFF',
                }}
              >
                <Check size={12} strokeWidth={3.5} />
              </div>
            )}
          </div>

          {/* Right Text: Bold White Nastaleeq */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <h2
              className="font-nastaleeq"
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
              }}
            >
              صفائی و پسائی
            </h2>
          </div>
        </div>

        {/* Card 2: Pisai Only - Dusty Slate Blue Gradient */}
        <div
          onClick={() => handleSelectService('pisai')}
          onMouseEnter={() => setHoveredService('pisai')}
          onMouseLeave={() => setHoveredService(null)}
          className="touch-active"
          style={{
            background:
              hoveredService === 'pisai'
                ? 'linear-gradient(135deg, #9DB7C4 0%, #819EAD 50%, #698694 100%)'
                : 'linear-gradient(135deg, #8DAAB8 0%, #7491A0 50%, #5E7A88 100%)',
            borderRadius: '16px',
            border:
              serviceType === 'pisai'
                ? '3px solid #FFFFFF'
                : hoveredService === 'pisai'
                ? '2.5px solid #C4DCE8'
                : '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow:
              serviceType === 'pisai'
                ? '0 14px 34px rgba(116, 145, 160, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.5)'
                : hoveredService === 'pisai'
                ? '0 10px 24px rgba(116, 145, 160, 0.35)'
                : '0 6px 18px rgba(116, 145, 160, 0.20), 0 1px 3px rgba(0, 0, 0, 0.06)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            opacity: serviceType === 'pisai' ? 1 : hoveredService === 'pisai' ? 0.92 : 0.72,
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform:
              serviceType === 'pisai'
                ? 'translateY(-4px)'
                : hoveredService === 'pisai'
                ? 'translateY(-2px)'
                : 'none',
          }}
        >
          {/* Left: White Squircle Icon Tile */}
          <div
            style={{
              position: 'relative',
              width: '56px',
              height: '56px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
              flexShrink: 0,
              transition: 'transform 0.25s ease',
              transform: hoveredService === 'pisai' ? 'scale(1.08) rotate(1.5deg)' : 'scale(1)',
            }}
          >
            <PisaiOnlySvg />
            {serviceType === 'pisai' && (
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  border: '2px solid #FFFFFF',
                }}
              >
                <Check size={12} strokeWidth={3.5} />
              </div>
            )}
          </div>

          {/* Right Text: Bold White Nastaleeq */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <h2
              className="font-nastaleeq"
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
              }}
            >
              صرف پسائی
            </h2>
          </div>
        </div>
      </div>

      {/* 2. 2-COLUMN BALANCED BILLING GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1.4fr) minmax(300px, 1fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Entry Fields Card */}
        <div
          className="dash-card-animated"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #EBE4DA',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Header Banner inside Entry Card */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid #F3EDE4',
              paddingBottom: '14px',
              direction: 'rtl',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFBEB',
                  border: '1.5px solid #FCD34D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)',
                  flexShrink: 0,
                }}
              >
                {serviceType === 'safai_pisai' ? <SafaiPisaiSvg /> : <PisaiOnlySvg />}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span
                  className="font-nastaleeq"
                  style={{ fontSize: '19px', fontWeight: 900, color: '#1F2937', lineHeight: 1.2 }}
                >
                  {serviceType === 'safai_pisai' ? 'صفائی و پسائی سروس' : 'صرف پسائی سروس'}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    color: '#B45309',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: '#FEF3C7',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    direction: 'ltr',
                    marginTop: '2px',
                  }}
                >
                  معیاری ریٹ: Rs {currentRate}/KG
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FAF5EE',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #EAE0D3',
              }}
            >
              <Sparkles size={14} color="#D97706" />
              <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: '#78350F' }}>
                فاسٹ کاؤنٹر
              </span>
            </div>
          </div>

          {/* 1. Weight Entry */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '14.5px', fontWeight: 900, color: '#1F2937' }}>
                گندم وزن (KG):
              </span>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                ref={weightInputRef}
                type="number"
                step="any"
                value={weightKg}
                onChange={(e) => handleWeightChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    feeInputRef.current?.focus();
                    feeInputRef.current?.select();
                  }
                }}
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '10px',
                  border: '2px solid #D5C9B8',
                  backgroundColor: '#FCFBF9',
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#111827',
                  padding: '0 48px 0 14px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#4A2810',
                  backgroundColor: '#FAF3E8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                KG
              </span>
            </div>

            {/* Quick Weight Presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
              {[
                { label: '20 KG', val: 20 },
                { label: '25 KG', val: 25 },
                { label: '40 KG (من)', val: 40 },
                { label: '50 KG', val: 50 },
              ].map((pill) => {
                const isAct = numWeight === pill.val;
                return (
                  <button
                    key={pill.val}
                    type="button"
                    onClick={() => {
                      handleWeightChange(String(pill.val));
                      feeInputRef.current?.focus();
                    }}
                    className="touch-active"
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: isAct ? '#364E51' : '#FAF5EE',
                      color: isAct ? '#FFFFFF' : '#374151',
                      border: isAct ? '2px solid #5F8387' : '1.5px solid #E2D8CC',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '13.5px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      boxShadow: isAct ? '0 4px 10px rgba(54, 79, 82, 0.35)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Grinding Fee (Calculated / Editable) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '14.5px', fontWeight: 900, color: '#1F2937' }}>
                پسائی اجرت (Rs):
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                ({numWeight} KG × Rs {currentRate})
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
                  height: '50px',
                  borderRadius: '10px',
                  border: '2px solid #D5C9B8',
                  backgroundColor: '#FCFBF9',
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#111827',
                  padding: '0 48px 0 14px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#4A2810',
                  backgroundColor: '#FAF3E8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                Rs
              </span>
            </div>
          </div>

          {/* 3. Cash Received */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '14.5px', fontWeight: 900, color: '#1F2937' }}>
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
                  background: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  color: '#047857',
                  borderRadius: '7px',
                  padding: '3px 10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Check size={13} strokeWidth={2.5} />
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
                  height: '48px',
                  borderRadius: '10px',
                  border: '2px solid #D5C9B8',
                  backgroundColor: '#FCFBF9',
                  fontSize: '20px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#111827',
                  padding: '0 48px 0 14px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#4A2810',
                  backgroundColor: '#FAF3E8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                Rs
              </span>
            </div>
          </div>

          {/* 4. Customer Name */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '14.5px', fontWeight: 900, color: '#1F2937' }}>
                گاہک کا نام (اختیاری):
              </span>
              {balanceRemaining > 0 && (
                <span className="font-nastaleeq" style={{ fontSize: '12px', color: '#DC2626', fontWeight: 800 }}>
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
              className="font-nastaleeq"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '10px',
                border: '1.5px solid #D5C9B8',
                backgroundColor: '#FFFFFF',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
                textAlign: 'right',
                transition: 'all 0.15s ease',
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
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #D5C9B8',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  zIndex: 50,
                  marginTop: '4px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="touch-active"
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3EDE4',
                      fontSize: '13px',
                      textAlign: 'right',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <span className="font-nastaleeq" style={{ fontWeight: 800, color: '#1F2937' }}>
                      {c.name}
                    </span>
                    <span style={{ color: '#64748B', fontSize: '11.5px', marginRight: '8px' }}>
                      {c.phone}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Token Summary Card & Hero Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Token Summary Card */}
          <div
            className="dash-card-animated"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #EBE4DA',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 900, color: '#1F2937' }}>
                پسائی ٹوکن رقم
              </span>

              {/* Golden Ticket Token Badge */}
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#92400E',
                  backgroundColor: '#FEF3C7',
                  border: '1.5px solid #F59E0B',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(217, 119, 6, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Ticket size={14} color="#D97706" />
                <span>#{String(tokenCounter).padStart(4, '0')}</span>
              </div>
            </div>

            {/* Large Total Fee Display */}
            <div
              dir="ltr"
              style={{
                fontSize: '36px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#111827',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}
            >
              Rs {numCharge.toLocaleString()}
            </div>

            {/* Breakdown Subtitle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                direction: 'rtl',
                borderTop: '1px solid #F3EDE4',
                paddingTop: '10px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#78350F',
                  backgroundColor: '#FAF3E8',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  direction: 'ltr',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {numWeight} KG @ Rs {currentRate}/KG
              </span>
              <span className="font-nastaleeq" style={{ fontSize: '13px', color: '#64748B', fontWeight: 700 }}>
                {serviceType === 'safai_pisai' ? 'صفائی مع پسائی' : 'خالص پسائی'}
              </span>
            </div>

            {/* Balance or Return Status */}
            {balanceRemaining > 0 ? (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1.5px solid #FECACA',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  direction: 'rtl',
                }}
              >
                <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#B91C1C' }}>
                  باقی ادھار:
                </span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#B91C1C', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </span>
              </div>
            ) : changeToReturn > 0 ? (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  direction: 'rtl',
                }}
              >
                <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#047857' }}>
                  گاہک کو واپسی:
                </span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </span>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #D1FAE5',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  direction: 'rtl',
                }}
              >
                <Check size={14} color="#047857" strokeWidth={2.5} />
                <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: '#047857' }}>
                  مکمل رقم ادا شدہ
                </span>
              </div>
            )}
          </div>

          {/* 2 Big Dashboard-Style Hero Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Button 1: Print Token & Bill - Sapphire / Cobalt Blue Gradient */}
            <button
              type="button"
              onClick={() => handleFinalSubmit(false)}
              disabled={numWeight <= 0 || numCharge <= 0}
              onMouseEnter={() => setHoveredBtn('print')}
              onMouseLeave={() => {
                setHoveredBtn(null);
                setPressedBtn(null);
              }}
              onMouseDown={() => setPressedBtn('print')}
              onMouseUp={() => setPressedBtn(null)}
              onTouchStart={() => setPressedBtn('print')}
              onTouchEnd={() => setPressedBtn(null)}
              className="touch-active"
              style={{
                height: '60px',
                borderRadius: '16px',
                background:
                  numWeight <= 0 || numCharge <= 0
                    ? '#94A3B8'
                    : hoveredBtn === 'print'
                    ? 'linear-gradient(135deg, #DFBBB0 0%, #C9A292 50%, #B18978 100%)'
                    : 'linear-gradient(135deg, #D4ADA0 0%, #BE9685 50%, #A67E6D 100%)',
                color: '#FFFFFF',
                border:
                  numWeight <= 0 || numCharge <= 0
                    ? 'none'
                    : hoveredBtn === 'print'
                    ? '2.5px solid #F4DFD7'
                    : '2px solid #E8CDC2',
                cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 0 20px',
                boxShadow:
                  numWeight > 0 && numCharge > 0
                    ? hoveredBtn === 'print'
                      ? '0 14px 34px rgba(190, 150, 133, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                      : '0 6px 20px rgba(190, 150, 133, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)'
                    : 'none',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform:
                  pressedBtn === 'print'
                    ? 'scale(0.975) translateY(1px)'
                    : hoveredBtn === 'print'
                    ? 'translateY(-3px)'
                    : 'none',
              }}
            >
              {/* Left: White Squircle Icon Tile matching Dashboard cards */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '11px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.20)',
                  flexShrink: 0,
                  transition: 'transform 0.22s ease',
                  transform: hoveredBtn === 'print' ? 'scale(1.08) rotate(-1.5deg)' : 'scale(1)',
                }}
              >
                <Printer size={22} color="#A67E6D" strokeWidth={2.4} />
              </div>

              {/* Right: Bold Text */}
              <span
                className="font-nastaleeq"
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
                }}
              >
                ٹوکن اور بل پرنٹ کریں
              </span>
            </button>

            {/* Button 2: Save as Credit - Dusty Slate Blue Palette Gradient */}
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
              onMouseEnter={() => setHoveredBtn('credit')}
              onMouseLeave={() => {
                setHoveredBtn(null);
                setPressedBtn(null);
              }}
              onMouseDown={() => setPressedBtn('credit')}
              onMouseUp={() => setPressedBtn(null)}
              onTouchStart={() => setPressedBtn('credit')}
              onTouchEnd={() => setPressedBtn(null)}
              className="touch-active"
              style={{
                height: '54px',
                borderRadius: '16px',
                background:
                  numWeight <= 0 || numCharge <= 0
                    ? '#94A3B8'
                    : hoveredBtn === 'credit'
                    ? 'linear-gradient(135deg, #9DB7C4 0%, #819EAD 50%, #698694 100%)'
                    : 'linear-gradient(135deg, #8DAAB8 0%, #7491A0 50%, #5E7A88 100%)',
                color: '#FFFFFF',
                border:
                  numWeight <= 0 || numCharge <= 0
                    ? 'none'
                    : hoveredBtn === 'credit'
                    ? '2.5px solid #C4DCE8'
                    : '2px solid #A8C4D2',
                cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 0 20px',
                boxShadow:
                  numWeight > 0 && numCharge > 0
                    ? hoveredBtn === 'credit'
                      ? '0 14px 34px rgba(116, 145, 160, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                      : '0 6px 18px rgba(116, 145, 160, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)'
                    : 'none',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform:
                  pressedBtn === 'credit'
                    ? 'scale(0.975) translateY(1px)'
                    : hoveredBtn === 'credit'
                    ? 'translateY(-3px)'
                    : 'none',
              }}
            >
              {/* Left: White Squircle Icon Tile */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.22)',
                  flexShrink: 0,
                  transition: 'transform 0.22s ease',
                  transform: hoveredBtn === 'credit' ? 'scale(1.08) rotate(1.5deg)' : 'scale(1)',
                }}
              >
                <BookOpen size={19} color="#5E7A88" strokeWidth={2.4} />
              </div>

              {/* Right: Bold Text */}
              <span
                className="font-nastaleeq"
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
                }}
              >
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

