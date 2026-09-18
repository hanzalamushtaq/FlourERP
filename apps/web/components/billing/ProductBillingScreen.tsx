
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../ui/TouchCard';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, Scale, Banknote, Tag, UserCheck, Check, BookOpen } from 'lucide-react';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameEn: 'Chakki Atta', nameUr: 'Ãšâ€ ÃšÂ©Ã›Å’ Ã˜Â¢Ã™Â¹Ã˜Â§ (ÃšÂ¯Ã™â€ Ã˜Â¯Ã™â€¦)', ratePerKg: 140, unit: 'KG', isActive: true, icon: 'Ã°Å¸Å’Â¾' },
  { id: '2', nameEn: 'Fine Atta', nameUr: 'Ã™ÂÃ˜Â§Ã˜Â¦Ã™â€  Ã˜Â¢Ã™Â¹Ã˜Â§', ratePerKg: 148, unit: 'KG', isActive: true, icon: 'Ã¢Å“Â¨' },
  { id: '3', nameEn: 'Maida Special', nameUr: 'Ã™â€¦Ã›Å’Ã˜Â¯Ã›Â Ã˜Â§Ã˜Â³Ã™Â¾Ã›Å’Ã˜Â´Ã™â€ž', ratePerKg: 155, unit: 'KG', isActive: true, icon: 'Ã¢Å¡Âª' },
  { id: '4', nameEn: 'Suji / Semolina', nameUr: 'Ã˜Â®Ã˜Â§Ã™â€žÃ˜Âµ Ã˜Â³Ã™Ë†Ã˜Â¬Ã›Å’', ratePerKg: 160, unit: 'KG', isActive: true, icon: 'Ã°Å¸Â¥Â£' },
  { id: '5', nameEn: 'Chokar / Bran', nameUr: 'Ãšâ€ Ã™Ë†ÃšÂ©Ã˜Â± (ÃšÂ©ÃšÂ¾Ã™â€ž)', ratePerKg: 95, unit: 'KG', isActive: true, icon: 'Ã°Å¸â€œÂ¦' },
  { id: '6', nameEn: 'Desi Atta', nameUr: 'Ã˜Â¯Ã›Å’Ã˜Â³Ã›Å’ ÃšÂ¯Ã™â€ Ã˜Â¯Ã™â€¦ Ã˜Â¢Ã™Â¹Ã˜Â§', ratePerKg: 0, unit: 'KG', isActive: true, icon: 'Ã¢Å¡Â Ã¯Â¸Â' },
];

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Haji Rasheed (Ã˜Â­Ã˜Â§Ã˜Â¬Ã›Å’ Ã˜Â±Ã˜Â´Ã›Å’Ã˜Â¯)', phone: '0300-8765432' },
  { id: '2', name: 'Haji Altaf (Ã˜Â­Ã˜Â§Ã˜Â¬Ã›Å’ Ã˜Â§Ã™â€žÃ˜Â·Ã˜Â§Ã™Â)', phone: '0301-7654321' },
  { id: '3', name: 'Haji Mushtaq (Ã˜Â­Ã˜Â§Ã˜Â¬Ã›Å’ Ã™â€¦Ã˜Â´Ã˜ÂªÃ˜Â§Ã™â€š)', phone: '0302-3344556' },
  { id: '4', name: 'Tariq Naan Shop (Ã˜Â·Ã˜Â§Ã˜Â±Ã™â€š Ã™â€ Ã˜Â§Ã™â€  Ã˜Â¨Ã˜Â§Ã˜Â¦Ã›Å’)', phone: '0321-9876543' },
  { id: '5', name: 'Mian Aslam Zamindar (Ã™â€¦Ã›Å’Ã˜Â§ÃšÂº Ã˜Â§Ã˜Â³Ã™â€žÃ™â€¦)', phone: '0333-1122334' },
  { id: '6', name: 'Babar Hotel & Cafe (Ã˜Â¨Ã˜Â§Ã˜Â¨Ã˜Â± Ã›ÂÃ™Ë†Ã™Â¹Ã™â€ž)', phone: '0345-5566778' },
  { id: '7', name: 'Haji Asif Flour Dealer (Ã˜Â­Ã˜Â§Ã˜Â¬Ã›Å’ Ã˜Â¢Ã˜ÂµÃ™Â)', phone: '0300-9988776' },
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
                backgroundColor: isSelected ? '#FFCB69' : '#FFFFFF',
                border: isSelected ? '2.5px solid #5E6348' : '1.5px solid #C2BAAA',
                boxShadow: isSelected ? '0 4px 10px rgba(121, 125, 98, 0.2)' : '0 1px 3px rgba(121, 125, 98, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                textAlign: 'center',
                transition: 'all 0.1s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ fontWeight: 800, color: '#1B1E13', fontFamily: 'var(--font-mono)' }}>
                  {isRateSet ? `Rs ${p.ratePerKg}` : 'Ã¢Å¡Â Ã¯Â¸Â Unset'}
                </span>
                {isSelected && <Check size={12} color="#1B1E13" strokeWidth={3} />}
              </div>

              <div
                className="font-nastaleeq"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#1B1E13',
                  lineHeight: 1.2,
                }}
              >
                {p.nameUr}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1B1E13', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.nameEn}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MAIN BILLING CARD */}
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
        {/* Top Mini Strip: Selected Product + Mode Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #E2DDD3',
            paddingBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#1B1E13' }}>
              {selectedProduct.nameEn}
            </span>
            <span className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#1B1E13' }}>
              {selectedProduct.nameUr}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B1E13' }}>
              Ã¢â‚¬Â¢ Rate: Rs {selectedProduct.ratePerKg}/KG
            </span>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#F4F1EA', padding: '4px', borderRadius: '12px', border: '2px solid #C2BAAA', gap: '4px' }}>
            <button
              type="button"
              onClick={() => {
                setCalcMode('weight');
                setInputValue('10');
                setIsReceivedAutoUpdated(true);
                weightInputRef.current?.focus();
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: calcMode === 'weight' ? '1.5px solid #5E6348' : 'none',
                backgroundColor: calcMode === 'weight' ? '#5E6348' : 'transparent',
                color: calcMode === 'weight' ? '#FFFFFF' : '#1B1E13',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Scale size={16} color={calcMode === 'weight' ? '#FFFFFF' : '#1B1E13'} strokeWidth={2.5} /> Weight Mode (Ã™Ë†Ã˜Â²Ã™â€ )
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
                padding: '8px 16px',
                borderRadius: '8px',
                border: calcMode === 'amount' ? '1.5px solid #5E6348' : 'none',
                backgroundColor: calcMode === 'amount' ? '#5E6348' : 'transparent',
                color: calcMode === 'amount' ? '#FFFFFF' : '#1B1E13',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Banknote size={16} color={calcMode === 'amount' ? '#FFFFFF' : '#1B1E13'} strokeWidth={2.5} /> Rupees Mode (Ã˜Â±Ã™â€šÃ™â€¦)
            </button>
          </div>
        </div>

        {/* Entry & Total Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', alignItems: 'center' }}>
          {/* 1. Weight Input */}
          <div>
            <label style={{ fontSize: '15px', fontWeight: 900, color: '#1B1E13', display: 'block', marginBottom: '4px' }}>
              {calcMode === 'weight' ? 'Weight (Ã™Ë†Ã˜Â²Ã™â€  - KG):' : 'Desired Rupees (Ã™â€¦Ã˜Â·Ã™â€žÃ™Ë†Ã˜Â¨Ã›Â Ã˜Â±Ã™â€šÃ™â€¦):'}
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
                  height: '52px',
                  borderRadius: '12px',
                  border: '2.5px solid #5E6348',
                  backgroundColor: '#FFFFFF',
                  fontSize: '30px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#1B1E13',
                  padding: '0 50px 0 14px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '14px', fontSize: '18px', fontWeight: 900, color: '#1B1E13' }}>
                {calcMode === 'weight' ? 'KG' : 'Rs'}
              </span>
            </div>
          </div>

          {/* Right: Net Total Box (Vibrant Corn Gold Hero Box) */}
          <div
            style={{
              backgroundColor: '#FFCB69',
              border: '3px solid #5E6348',
              borderRadius: '14px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(27, 30, 19, 0.12)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontWeight: 900, color: '#1B1E13' }}>TOTAL AMOUNT (ÃšÂ©Ã™â€ž Ã˜Â±Ã™â€šÃ™â€¦)</span>
              <span style={{ fontWeight: 800, color: '#1B1E13' }}>
                {calculatedWeight} KG @ Rs {rate}/KG
              </span>
            </div>

            <div
              style={{
                fontSize: '38px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#1B1E13',
                lineHeight: 1.1,
                margin: '4px 0',
              }}
            >
              Rs {netTotal.toLocaleString()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                style={{ background: 'none', border: 'none', color: '#1B1E13', fontSize: '13px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Tag size={14} color="#1B1E13" /> {showDiscount ? 'Close Discount' : '+ Add Discount (Ã˜Â±Ã˜Â¹Ã˜Â§Ã›Å’Ã˜Âª)'}
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
                  style={{ width: '85px', padding: '4px 8px', borderRadius: '8px', border: '2px solid #C2BAAA', backgroundColor: '#FFFFFF', color: '#1B1E13', fontSize: '14px', fontWeight: 900, outline: 'none' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 2. Cash Received Row */}
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
              Cash Received (Ã™Ë†Ã˜ÂµÃ™Ë†Ã™â€ž Ã˜Â±Ã™â€šÃ™â€¦):
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
                  fontSize: '22px',
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
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#1B1E13' }}>Remaining Balance (Ã˜Â¨Ã˜Â§Ã™â€šÃ›Å’ Ã˜Â±Ã™â€šÃ™â€¦):</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#1B1E13', fontFamily: 'var(--font-mono)' }}>
                  Rs {balanceRemaining.toLocaleString()}
                </div>
              </div>
            ) : changeToReturn > 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #5E6348', borderRadius: '8px', padding: '6px 10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#1B1E13' }}>Change to Return (Ã™Ë†Ã˜Â§Ã™Â¾Ã˜Â³Ã›Å’ Ã˜Â±Ã™â€šÃ™â€¦):</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#1B1E13', fontFamily: 'var(--font-mono)' }}>
                  Rs {changeToReturn.toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #5E6348', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#1B1E13' }}>Ã¢Å“â€œ Exact Cash Paid</div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Customer Details with Autocomplete Search Dropdown */}
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
              <UserCheck size={14} color="#1B1E13" /> Customer Details (ÃšÂ¯Ã˜Â§Ã›ÂÃšÂ© ÃšÂ©Ã˜Â§ Ã™â€ Ã˜Â§Ã™â€¦ Ã™Ë† Ã™ÂÃ™Ë†Ã™â€  Ã™â€ Ã™â€¦Ã˜Â¨Ã˜Â± Ã¢â‚¬â€ Ã˜Â§Ã˜Â¯ÃšÂ¾Ã˜Â§Ã˜Â± ÃšÂ©Ã›â€™ Ã™â€žÃ›Å’Ã›â€™ Ã˜Â¯Ã˜Â±Ã˜Â¬ ÃšÂ©Ã˜Â±Ã›Å’ÃšÂº)
            </span>
            <span style={{ fontSize: '11px', color: '#1B1E13', fontWeight: 600 }}>Type name to see registered accounts</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={customerNameInputRef}
                type="text"
                placeholder="Customer Name (ÃšÂ¯Ã˜Â§Ã›ÂÃšÂ© ÃšÂ©Ã˜Â§ Ã™â€ Ã˜Â§Ã™â€¦)..."
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

              {/* Autocomplete Suggestions Dropdown */}
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
                        borderBottom: '2px solid #E2DDD3',
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
                placeholder="Phone (Ã™â€¦Ã™Ë†Ã˜Â¨Ã˜Â§Ã˜Â¦Ã™â€ž Ã™â€ Ã™â€¦Ã˜Â¨Ã˜Â± Ã˜Â§Ã˜Â®Ã˜ÂªÃ›Å’Ã˜Â§Ã˜Â±Ã›Å’)..."
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

        {/* 4. THE 2 ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => handleFinalSubmit(false)}
            disabled={rate <= 0 || calculatedWeight <= 0}
            className="touch-active"
            style={{
              height: '52px',
              borderRadius: '12px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#E8AC65' : '#E2DDD3',
              color: rate > 0 && calculatedWeight > 0 ? '#1B1E13' : '#8A8578',
              border: '2.5px solid #5E6348',
              fontSize: '17px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: rate > 0 && calculatedWeight > 0 ? '0 4px 10px rgba(121, 125, 98, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Printer size={22} color={rate > 0 && calculatedWeight > 0 ? '#1B1E13' : '#8A8578'} strokeWidth={2.5} />
            <span>Print Cash Bill (Ã™â€ Ã™â€šÃ˜Â¯ Ã˜Â¨Ã™â€ž)</span>
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
              height: '52px',
              borderRadius: '12px',
              backgroundColor: rate > 0 && calculatedWeight > 0 ? '#5E6348' : '#E2DDD3',
              color: rate > 0 && calculatedWeight > 0 ? '#FFFFFF' : '#8A8578',
              border: '2.5px solid #5E6348',
              fontSize: '17px',
              fontWeight: 900,
              cursor: rate > 0 && calculatedWeight > 0 ? 'pointer' : 'not-allowed',
              boxShadow: rate > 0 && calculatedWeight > 0 ? '0 4px 10px rgba(121, 125, 98, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <BookOpen size={20} color={rate > 0 && calculatedWeight > 0 ? '#FFFFFF' : '#8A8578'} strokeWidth={2.5} />
            <span>Save as Credit (Ã˜Â§Ã˜Â¯ÃšÂ¾Ã˜Â§Ã˜Â± Ã˜Â¨Ã™â€ž)</span>
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
