'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../ui/TouchCard';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, Scale, Banknote, Tag, UserCheck, Check, BookOpen } from 'lucide-react';

// 1. Custom SVG Product Illustrations matching Dashboard aesthetic
const ChakkiAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Burlap Sack Body */}
    <path d="M7 14C7 11.5 10 11 18 11C26 11 29 11.5 29 14L28 30C28 32 26 33 18 33C10 33 8 32 8 30L7 14Z" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Tied Neck */}
    <path d="M12 11C12 9 14 7 18 7C22 7 24 9 24 11" stroke="#4A2810" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M11 11H25" stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" />
    {/* Wheat Ear on Sack */}
    <path d="M18 16V27M18 18L15 16M18 18L21 16M18 21L14 19M18 21L22 19M18 24L15 22M18 24L21 22" stroke="#FAF4ED" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const FineAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Modern Refined Bag */}
    <rect x="8" y="10" width="20" height="22" rx="3" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M13 10V7C13 6 14 5 15 5H21C22 5 23 6 23 7V10" stroke="#4A2810" strokeWidth="2.2" strokeLinecap="round" />
    {/* Golden Wheat Stamp */}
    <circle cx="18" cy="20" r="5" fill="#C99462" stroke="#4A2810" strokeWidth="1.8" />
    <path d="M18 17V23M18 18L16 19M18 18L20 19M18 21L16 22M18 21L20 22" stroke="#FAF4ED" strokeWidth="1.5" strokeLinecap="round" />
    {/* Sparkle star */}
    <path d="M26 6L27 8L29 9L27 10L26 12L25 10L23 9L25 8L26 6Z" fill="#D97706" />
  </svg>
);

const MaidaSpecialSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pristine White Bakery Sack */}
    <path d="M8 13C8 11 11 10 18 10C25 10 28 11 28 13L27 30C27 32 25 33 18 33C11 33 9 32 9 30L8 13Z" fill="#FFFFFF" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M13 10C13 7.5 15 6 18 6C21 6 23 7.5 23 10" stroke="#4A2810" strokeWidth="2.2" />
    {/* Baker's Star Badge */}
    <circle cx="18" cy="21" r="5.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.8" />
    <path d="M14 21H22M18 17V25" stroke="#C99462" strokeWidth="2" strokeLinecap="round" />
    <path d="M15.5 18.5L20.5 23.5M20.5 18.5L15.5 23.5" stroke="#C99462" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SujiSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Granule Bowl */}
    <path d="M6 16C6 24 11 27 18 27C25 27 30 24 30 16H6Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <ellipse cx="18" cy="16" rx="12" ry="4" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M12 27L10 32H26L24 27" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    {/* Granulated Semolina */}
    <path d="M10 16C10 12 13 9 18 9C23 9 26 12 26 16" fill="#D97706" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="15" cy="13" r="1.2" fill="#FAF4ED" />
    <circle cx="18" cy="12" r="1.4" fill="#FAF4ED" />
    <circle cx="21" cy="13" r="1.2" fill="#FAF4ED" />
  </svg>
);

const ChokarSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Feed Jute Burlap Bag */}
    <path d="M8 12L10 31C10 32.5 12 33 18 33C24 33 26 32.5 26 31L28 12L22 9L18 10L14 9L8 12Z" fill="#8C582B" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <line x1="12" y1="17" x2="24" y2="17" stroke="#FAF4ED" strokeWidth="1.8" strokeDasharray="2 2" strokeLinecap="round" />
    <line x1="12" y1="22" x2="24" y2="22" stroke="#FAF4ED" strokeWidth="1.8" strokeDasharray="2 2" strokeLinecap="round" />
    <rect x="13" y="24" width="10" height="5" rx="1.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.5" />
    <circle cx="18" cy="26.5" r="1.5" fill="#8C582B" />
  </svg>
);

const DesiAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Traditional Stone Chakki Sack */}
    <ellipse cx="18" cy="28" rx="13" ry="4" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M10 15C10 12 13 10 18 10C23 10 26 12 26 15L25 28C22 30 14 30 11 28L10 15Z" fill="#A76F3C" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="18" cy="9" r="2.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2" />
    <path d="M18 14V23M18 16L15 18M18 16L21 18M18 19L15 21M18 19L21 21" stroke="#FAF4ED" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const renderProductIcon = (id: string) => {
  switch (id) {
    case '1': return <ChakkiAttaSvg />;
    case '2': return <FineAttaSvg />;
    case '3': return <MaidaSpecialSvg />;
    case '4': return <SujiSvg />;
    case '5': return <ChokarSvg />;
    case '6': return <DesiAttaSvg />;
    default: return <ChakkiAttaSvg />;
  }
};

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameEn: 'Chakki Atta', nameUr: 'چکی آٹا (گندم)', ratePerKg: 140, unit: 'KG', isActive: true },
  { id: '2', nameEn: 'Fine Atta', nameUr: 'فائن آٹا', ratePerKg: 148, unit: 'KG', isActive: true },
  { id: '3', nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', ratePerKg: 155, unit: 'KG', isActive: true },
  { id: '4', nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', ratePerKg: 160, unit: 'KG', isActive: true },
  { id: '5', nameEn: 'Chokar / Bran', nameUr: 'چوکر (کھل)', ratePerKg: 95, unit: 'KG', isActive: true },
  { id: '6', nameEn: 'Desi Atta', nameUr: 'دیسی گندم آٹا', ratePerKg: 145, unit: 'KG', isActive: true },
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

  // Hover & Tactile States for Dashboard-Style Polish
  const [hoveredBtn, setHoveredBtn] = useState<'cash' | 'credit' | null>(null);
  const [pressedBtn, setPressedBtn] = useState<'cash' | 'credit' | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP: Dashboard-Style Product Action Cards with Custom SVGs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
          gap: '12px',
          width: '100%',
          direction: 'rtl',
        }}
      >
        {products.map((p) => {
          const isSelected = selectedProduct.id === p.id;
          const isHovered = hoveredProduct === p.id;
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
              onMouseEnter={() => setHoveredProduct(p.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="touch-active"
              style={{
                padding: '14px 14px 12px 14px',
                borderRadius: '16px',
                backgroundColor: isSelected ? '#FAF5F2' : '#FFFFFF',
                background: isSelected
                  ? 'linear-gradient(135deg, #FAF5F2 0%, #F5EBE5 50%, #ECE0D8 100%)'
                  : '#FFFFFF',
                border: isSelected
                  ? '2.5px solid #BE9685'
                  : isHovered
                  ? '2px solid #D4ADA0'
                  : '1.5px solid #EBE4DA',
                boxShadow: isSelected
                  ? '0 8px 24px rgba(190, 150, 133, 0.25), 0 2px 6px rgba(0, 0, 0, 0.04)'
                  : isHovered
                  ? '0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.03)'
                  : '0 2px 8px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '102px',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isSelected
                  ? 'translateY(-3px)'
                  : isHovered
                  ? 'translateY(-3px)'
                  : 'none',
                position: 'relative',
              }}
            >
              {/* Top Row: Squircle SVG Icon Tile + Rate Pill Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* White Squircle Icon Tile matching Dashboard action cards */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '13px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isSelected
                      ? '0 3px 10px rgba(190, 150, 133, 0.22)'
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    border: isSelected ? '1.5px solid #D4ADA0' : '1px solid #EBE4DA',
                    flexShrink: 0,
                    transition: 'transform 0.22s ease',
                    transform: isHovered ? 'scale(1.1) rotate(-2deg)' : 'scale(1)',
                  }}
                >
                  {renderProductIcon(p.id)}
                </div>

                {/* Rate Badge + Selected Pill */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: '12.5px',
                      fontFamily: 'var(--font-mono)',
                      color: isSelected ? '#4A2A20' : '#4A2810',
                      backgroundColor: isSelected ? '#FFFFFF' : '#F5EDE2',
                      padding: '3px 8px',
                      borderRadius: '7px',
                      direction: 'ltr',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      border: isSelected ? '1.5px solid #BE9685' : '1px solid #EAE0D3',
                    }}
                  >
                    {isRateSet ? `Rs ${p.ratePerKg}` : 'Unset'}
                  </span>

                  {isSelected && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#8A5848',
                        fontFamily: 'var(--font-urdu)',
                        lineHeight: 1,
                      }}
                    >
                      ● منتخب
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Urdu Name in Bold Nastaleeq */}
              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '17px',
                  fontWeight: 900,
                  color: isSelected ? '#4A2A20' : '#1F2937',
                  lineHeight: 1.25,
                  textAlign: 'right',
                  marginTop: '8px',
                  textShadow: isSelected ? '0 1px 2px rgba(255,255,255,0.8)' : 'none',
                }}
              >
                {p.nameUr}
              </div>

              {/* Bottom: English Name */}
              <div
                style={{
                  fontSize: '11.5px',
                  color: isSelected ? '#8A5848' : '#6B7280',
                  textAlign: 'right',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px',
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
          {/* Selected Product Banner & Mode Switcher */}
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
              {/* Product Squircle Icon Tile in header */}
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
                {renderProductIcon(selectedProduct.id)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span
                  className="font-nastaleeq"
                  style={{ fontSize: '19px', fontWeight: 900, color: '#1F2937', lineHeight: 1.2 }}
                >
                  {selectedProduct.nameUr}
                </span>
                <span
                  style={{
                    fontSize: '12.5px',
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
                  Rs {selectedProduct.ratePerKg}/KG
                </span>
              </div>
            </div>

            {/* Mode Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F3EDE4',
                padding: '3px',
                borderRadius: '9px',
                gap: '3px',
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
                className="touch-active"
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: calcMode === 'weight' ? '#364E51' : 'transparent',
                  color: calcMode === 'weight' ? '#FFFFFF' : '#4B5563',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                  boxShadow: calcMode === 'weight' ? '0 2px 6px rgba(54,79,82,0.30)' : 'none',
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
                className="touch-active"
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: calcMode === 'amount' ? '#364E51' : 'transparent',
                  color: calcMode === 'amount' ? '#FFFFFF' : '#4B5563',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                  boxShadow: calcMode === 'amount' ? '0 2px 6px rgba(54,79,82,0.30)' : 'none',
                }}
              >
                <Banknote size={13} />
                <span className="font-nastaleeq">رقم</span>
              </button>
            </div>
          </div>

          {/* Weight / Amount Entry */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '14.5px', fontWeight: 900, color: '#1F2937' }}>
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
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>

            {/* Quick Weight Block Pills */}
            {calcMode === 'weight' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
                {[
                  { label: '5 KG', val: 5 },
                  { label: '10 KG', val: 10 },
                  { label: '20 KG', val: 20 },
                  { label: '40 KG', val: 40 },
                ].map((pill) => {
                  const isAct = numInput === pill.val;
                  return (
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
            )}
          </div>

          {/* Cash Received Row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', direction: 'rtl' }}>
              <span className="font-nastaleeq" style={{ fontSize: '14.5px', fontWeight: 900, color: '#1F2937' }}>
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

          {/* Customer Name */}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  customerPhoneInputRef.current?.focus();
                }
              }}
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

        {/* RIGHT COLUMN: Total Bill Card & Hero Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Total Bill Card */}
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
                کل رقم
              </span>
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
                {calculatedWeight} KG @ Rs {rate}
              </span>
            </div>

            {/* Large Grand Total Display */}
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
              Rs {netTotal.toLocaleString()}
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
            ) : null}

            {/* Discount Option Toggle */}
            <div style={{ borderTop: '1px solid #F3EDE4', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Tag size={13} />
                <span className="font-nastaleeq">رعایت شامل کریں (+ Discount)</span>
              </button>

              {showDiscount && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="رعایت رقم"
                    value={discountValue}
                    onChange={(e) => {
                      setDiscountValue(e.target.value);
                      setIsReceivedAutoUpdated(true);
                    }}
                    style={{
                      width: '90px',
                      height: '36px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #D5C9B8',
                      fontSize: '13px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 800 }}>Rs</span>
                </div>
              )}
            </div>
          </div>

          {/* 2 Big Dashboard-Style Hero Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Button 1: Print Cash Bill - Emerald Forest Gradient */}
            <button
              type="button"
              onClick={() => handleFinalSubmit(false)}
              disabled={rate <= 0 || calculatedWeight <= 0}
              onMouseEnter={() => setHoveredBtn('cash')}
              onMouseLeave={() => {
                setHoveredBtn(null);
                setPressedBtn(null);
              }}
              onMouseDown={() => setPressedBtn('cash')}
              onMouseUp={() => setPressedBtn(null)}
              onTouchStart={() => setPressedBtn('cash')}
              onTouchEnd={() => setPressedBtn(null)}
              className="touch-active"
              style={{
                height: '60px',
                borderRadius: '16px',
                background:
                  rate <= 0 || calculatedWeight <= 0
                    ? '#94A3B8'
                    : hoveredBtn === 'cash'
                    ? 'linear-gradient(135deg, #58797D 0%, #435E62 50%, #344B4E 100%)'
                    : 'linear-gradient(135deg, #4A676B 0%, #374F52 50%, #2A3F42 100%)',
                color: '#FFFFFF',
                border:
                  rate <= 0 || calculatedWeight <= 0
                    ? 'none'
                    : hoveredBtn === 'cash'
                    ? '2.5px solid #84A9AD'
                    : '2px solid #5F8387',
                cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 0 20px',
                boxShadow:
                  rate > 0 && calculatedWeight > 0
                    ? hoveredBtn === 'cash'
                      ? '0 14px 34px rgba(54, 79, 82, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                      : '0 6px 20px rgba(54, 79, 82, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)'
                    : 'none',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform:
                  pressedBtn === 'cash'
                    ? 'scale(0.975) translateY(1px)'
                    : hoveredBtn === 'cash'
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
                  transform: hoveredBtn === 'cash' ? 'scale(1.08) rotate(-1.5deg)' : 'scale(1)',
                }}
              >
                <Printer size={22} color="#374F52" strokeWidth={2.4} />
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
                نقد بل پرنٹ کریں
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
              disabled={rate <= 0 || calculatedWeight <= 0}
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
                  rate <= 0 || calculatedWeight <= 0
                    ? '#94A3B8'
                    : hoveredBtn === 'credit'
                    ? 'linear-gradient(135deg, #9DB7C4 0%, #819EAD 50%, #698694 100%)'
                    : 'linear-gradient(135deg, #8DAAB8 0%, #7491A0 50%, #5E7A88 100%)',
                color: '#FFFFFF',
                border:
                  rate <= 0 || calculatedWeight <= 0
                    ? 'none'
                    : hoveredBtn === 'credit'
                    ? '2.5px solid #C4DCE8'
                    : '2px solid #A8C4D2',
                cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 0 20px',
                boxShadow:
                  rate > 0 && calculatedWeight > 0
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
                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.18)',
                  flexShrink: 0,
                  transition: 'transform 0.22s ease',
                  transform: hoveredBtn === 'credit' ? 'scale(1.08) rotate(2deg)' : 'scale(1)',
                }}
              >
                <BookOpen size={20} color="#5E7A88" strokeWidth={2.4} />
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
