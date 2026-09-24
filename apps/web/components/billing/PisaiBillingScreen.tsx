'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, BookOpen, Check, Cog, Ticket, Sparkles, Tag, Lock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSession, ensureValidToken, clearSession } from '../../lib/auth';
import { sound } from '../../lib/audioFeedback';

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
  { id: '1', name: 'حاجی رشید', phone: '0300-8765432' },
  { id: '2', name: 'حاجی الطاف', phone: '0301-7654321' },
  { id: '3', name: 'Haji Mushtaq', phone: '0302-3344556' },
  { id: '4', name: 'طارق نان بائی', phone: '0321-9876543' },
  { id: '5', name: 'Mian Aslam', phone: '0333-1122334' },
  { id: '6', name: 'بابر ہوٹل', phone: '0345-5566778' },
];

const PISAI_RATES = {
  safai_pisai: 6, // Rs 6 / KG
  pisai: 5,       // Rs 5 / KG
};

export const PisaiBillingScreen: React.FC = () => {
  const { language, isUrdu, t } = useLanguage();
  const [weightKg, setWeightKg] = useState<string>('25');
  const [serviceType, setServiceType] = useState<'safai_pisai' | 'pisai'>('safai_pisai');
  const [chargeAmount, setChargeAmount] = useState<string>('150');
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [showDiscount, setShowDiscount] = useState<boolean>(false);
  const [receivedAmount, setReceivedAmount] = useState<string>('150');
  const [isReceivedAutoUpdated, setIsReceivedAutoUpdated] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const session = getSession();
  const canDiscount = !!(session?.permissions?.includes('can_discount') || session?.role === 'SuperAdmin');
  const canCredit = !!(session?.permissions?.includes('can_issue_credit') || session?.role === 'SuperAdmin');

  // Customer State & Autocomplete
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [suggestions, setSuggestions] = useState<typeof MOCK_CUSTOMERS>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Hover & Tactile States for Dashboard-Style Polish
  const [hoveredService, setHoveredService] = useState<'safai_pisai' | 'pisai' | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<'print' | 'credit' | null>(null);
  const [pressedBtn, setPressedBtn] = useState<'print' | 'credit' | null>(null);

  const [currentTokenFormatted, setCurrentTokenFormatted] = useState<string>('0101');

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
  const numDiscount = parseFloat(discountValue) || 0;
  const netTotal = Math.max(0, numCharge - numDiscount);

  // Sync received amount when charge or discount changes
  useEffect(() => {
    if (isReceivedAutoUpdated) {
      setReceivedAmount(String(netTotal));
    }
  }, [netTotal, isReceivedAutoUpdated]);

  const numReceived = parseFloat(receivedAmount) || 0;
  const balanceRemaining = Math.max(0, netTotal - numReceived);
  const changeToReturn = Math.max(0, numReceived - netTotal);

  // Auto-focus weight input on service switch
  useEffect(() => {
    weightInputRef.current?.focus();
    weightInputRef.current?.select();
  }, [serviceType]);

  // Fetch next upcoming token on mount
  useEffect(() => {
    const sess = getSession();
    fetch('http://localhost:5000/api/pisai?limit=1', {
      headers: sess?.token ? { Authorization: `Bearer ${sess.token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.records && json.data.records.length > 0) {
          const latestToken = json.data.records[0].tokenNumber;
          setCurrentTokenFormatted(String(latestToken + 1).padStart(4, '0'));
        }
      })
      .catch(() => {});
  }, []);

  // Autocomplete via /api/customers/search with local fallback
  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    if (val.trim().length > 0) {
      const sess = getSession();
      fetch(`http://localhost:5000/api/customers/search?q=${encodeURIComponent(val)}`, {
        headers: sess?.token ? { Authorization: `Bearer ${sess.token}` } : {},
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data.customers && json.data.customers.length > 0) {
            setSuggestions(json.data.customers);
            setShowSuggestions(true);
          } else {
            const filtered = MOCK_CUSTOMERS.filter((c) =>
              c.name.toLowerCase().includes(val.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
          }
        })
        .catch(() => {
          const filtered = MOCK_CUSTOMERS.filter((c) =>
            c.name.toLowerCase().includes(val.toLowerCase())
          );
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCustomer = (cust: { name: string; phone?: string | null }) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone || '');
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

  // Submit Logic connecting to backend /api/pisai
  const handleFinalSubmit = async (forcedCredit?: boolean) => {
    if (numWeight <= 0 || numCharge <= 0) {
      alert(isUrdu ? 'برائے مہربانی وزن اور اجرت کی رقم درج کریں۔' : 'Please enter wheat weight and fee.');
      weightInputRef.current?.focus();
      return;
    }

    if (numDiscount > 0 && !canDiscount) {
      alert(isUrdu ? 'آپ کو رعایت دینے کا اختیار حاصل نہیں ہے۔' : 'You do not have permission to apply discounts.');
      return;
    }

    const hasCustomerDetails = customerName.trim().length > 0;
    const isCreditSale = forcedCredit !== undefined ? forcedCredit : (hasCustomerDetails || balanceRemaining > 0);

    if (isCreditSale && !canCredit) {
      alert(isUrdu ? 'آپ کو ادھار جاری کرنے کا اختیار حاصل نہیں ہے۔' : 'You do not have permission to issue credit.');
      return;
    }

    const sess = getSession();
    setIsSubmitting(true);

    try {
      let token = await ensureValidToken(sess);

      const payload = {
        serviceType: serviceType === 'safai_pisai' ? 'SAFAI_PISAI' : 'PISAI_ONLY',
        weightKg: numWeight,
        ratePerKg: currentRate,
        feeAmount: numCharge,
        discount: numDiscount,
        receivedAmount: isCreditSale ? 0 : numReceived,
        paymentMethod: isCreditSale ? 'CREDIT' : 'CASH',
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      };

      let res = await fetch('http://localhost:5000/api/pisai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        token = await ensureValidToken(sess);
        if (token) {
          res = await fetch('http://localhost:5000/api/pisai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
        }
      }

      if (res.status === 401) {
        alert(isUrdu ? 'سیشن ختم ہو چکا ہے۔ برائے مہربانی دوبارہ لاگ ان کریں۔' : 'Session expired. Please log in again.');
        clearSession();
        window.location.reload();
        return;
      }

      const json = await res.json();
      if (!json.success) {
        sound.playWarningSound();
        alert(json.error?.message || 'Error generating grinding ticket');
        return;
      }

      const created = json.data.ticket;
      sound.playSuccessChime();
      // Advance next token counter for upcoming ticket
      setCurrentTokenFormatted(String(created.tokenNumber + 1).padStart(4, '0'));

      const receipt: ReceiptData = {
        type: 'pisai',
        billNumber: `PISAI-${created.tokenFormatted}`,
        pisaiToken: created.tokenFormatted,
        timestamp: new Date(created.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }),
        billerName: created.biller?.fullName || sess?.fullName || (isUrdu ? 'محمد عاصف (کاؤنٹر 01)' : 'Muhammad Asif'),
        customerName: created.customerName || undefined,
        isCredit: created.paymentMethod === 'CREDIT',
        serviceType: created.serviceType === 'SAFAI_PISAI' ? 'صفائی و پسائی' : 'صرف پسائی',
        pisaiWeightKg: created.weightKg,
        subtotal: created.feeAmount,
        discount: created.discount,
        netTotal: created.netTotal,
        cashReceived: created.receivedAmount,
        remainingBalance: created.paymentMethod === 'CREDIT' ? created.netTotal : 0,
      };

      setReceiptData(receipt);
      setIsReceiptOpen(true);
    } catch (err: any) {
      sound.playWarningSound();
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. TOP: Premium Dual Service Selection Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '14px',
          width: '100%',
        }}
      >
        {/* Card 1: Safai + Pisai */}
        <div
          onClick={() => handleSelectService('safai_pisai')}
          onMouseEnter={() => setHoveredService('safai_pisai')}
          onMouseLeave={() => setHoveredService(null)}
          className="touch-active"
          style={{
            width: '360px',
            background:
              serviceType === 'safai_pisai'
                ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
                : hoveredService === 'safai_pisai'
                ? '#F8FAFC'
                : '#FFFFFF',
            borderRadius: '14px',
            border:
              serviceType === 'safai_pisai'
                ? '2px solid #92400E'
                : '1.5px solid #E2E8F0',
            boxShadow:
              serviceType === 'safai_pisai'
                ? '0 6px 16px rgba(217, 119, 6, 0.26)'
                : '0 2px 6px rgba(15, 23, 42, 0.04)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            direction: 'rtl',
            cursor: 'pointer',
            minHeight: '62px',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: serviceType === 'safai_pisai' ? '#FFFFFF' : '#FFFBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  serviceType === 'safai_pisai'
                    ? '0 2px 8px rgba(0,0,0,0.12)'
                    : 'none',
                border: serviceType === 'safai_pisai' ? 'none' : '1px solid #FEF3C7',
                flexShrink: 0,
              }}
            >
              <SafaiPisaiSvg />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '27px' : '20px',
                  fontWeight: 900,
                  color: serviceType === 'safai_pisai' ? '#FFFFFF' : '#0F172A',
                  margin: 0,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0',
                }}
              >
                {t('صفائی و پسائی', 'Cleaning & Grinding')}
              </h2>
            </div>
          </div>
        </div>

        {/* Card 2: Sirf Pisai */}
        <div
          onClick={() => handleSelectService('pisai')}
          onMouseEnter={() => setHoveredService('pisai')}
          onMouseLeave={() => setHoveredService(null)}
          className="touch-active"
          style={{
            width: '360px',
            background:
              serviceType === 'pisai'
                ? 'linear-gradient(135deg, #1877F2 0%, #1D4ED8 100%)'
                : hoveredService === 'pisai'
                ? '#F8FAFC'
                : '#FFFFFF',
            borderRadius: '14px',
            border:
              serviceType === 'pisai'
                ? '2px solid #1E40AF'
                : '1.5px solid #E2E8F0',
            boxShadow:
              serviceType === 'pisai'
                ? '0 6px 16px rgba(24, 119, 242, 0.26)'
                : '0 2px 6px rgba(15, 23, 42, 0.04)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            direction: 'rtl',
            cursor: 'pointer',
            minHeight: '62px',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: serviceType === 'pisai' ? '#FFFFFF' : '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  serviceType === 'pisai'
                    ? '0 2px 8px rgba(0,0,0,0.12)'
                    : 'none',
                border: serviceType === 'pisai' ? 'none' : '1px solid #DBEAFE',
                flexShrink: 0,
              }}
            >
              <PisaiOnlySvg />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '26px' : '19px',
                  fontWeight: 900,
                  color: serviceType === 'pisai' ? '#FFFFFF' : '#0F172A',
                  margin: 0,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0',
                }}
              >
                {t('صرف پسائی', 'Grinding Only')}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 2-COLUMN BALANCED BILLING GRID (Responsive on Mobile & Tablet) */}
      <div className="pisai-billing-grid-split">
        {/* LEFT COLUMN: Entry Fields Card */}
        <div
          className="dash-card-animated"
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: 'none',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: 'none',
          }}
        >
          {/* Header Banner inside Entry Card */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 'none',
              paddingBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFBEB',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                {serviceType === 'safai_pisai' ? <SafaiPisaiSvg /> : <PisaiOnlySvg />}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '22px' : '17px',
                    fontWeight: 900,
                    color: '#0F172A',
                    lineHeight: 1.2,
                    letterSpacing: '0',
                  }}
                >
                  {serviceType === 'safai_pisai'
                    ? t('صفائی و پسائی سروس', 'Cleaning & Grinding')
                    : t('صرف پسائی سروس', 'Grinding Only')}
                </span>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '17px' : '13px',
                    fontWeight: 900,
                    color: '#B45309',
                    fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                    backgroundColor: '#FFFBEB',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    marginTop: '2px',
                  }}
                >
                  {isUrdu ? `${t('ریٹ:', 'Rate:')} ${currentRate} روپے / کلو` : `Rate: Rs ${currentRate} / KG`}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#FFFBEB',
                padding: '3px 10px',
                borderRadius: '8px',
                border: 'none',
              }}
            >
              <Sparkles size={16} color="#D97706" />
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '16px' : '13px', fontWeight: 900, color: '#B45309' }}>
                {t('فاسٹ کاؤنٹر', 'Fast Counter')}
              </span>
            </div>
          </div>

          {/* 1. Weight Entry */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '15px', fontWeight: 900, color: '#0F172A' }}>
                {t('گندم کا وزن:', 'Wheat Weight (KG):')}
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
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    feeInputRef.current?.focus();
                    feeInputRef.current?.select();
                  }
                }}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#0F172A',
                  padding: '0 56px 0 12px',
                  direction: 'ltr',
                  unicodeBidi: 'isolate',
                  outline: 'none',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  position: 'absolute',
                  right: '10px',
                  fontSize: isUrdu ? '19px' : '14px',
                  fontWeight: 900,
                  color: '#D97706',
                  backgroundColor: '#FFFBEB',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {isUrdu ? 'کلو' : 'KG'}
              </span>
            </div>
          </div>

          {/* 2. Grinding Fee (Calculated / Editable) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '15px', fontWeight: 900, color: '#0F172A' }}>
                {t('پسائی اجرت:', 'Grinding Fee (Rs):')}
              </span>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '13px', color: '#64748B', fontWeight: 800 }}>
                {isUrdu ? `(${numWeight} کلو × ${currentRate} روپے)` : `(${numWeight} KG × Rs ${currentRate})`}
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
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    receivedInputRef.current?.focus();
                    receivedInputRef.current?.select();
                  }
                }}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#0F172A',
                  padding: '0 56px 0 12px',
                  direction: 'ltr',
                  unicodeBidi: 'isolate',
                  outline: 'none',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  position: 'absolute',
                  right: '10px',
                  fontSize: isUrdu ? '19px' : '14px',
                  fontWeight: 900,
                  color: '#D97706',
                  backgroundColor: '#FFFBEB',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {isUrdu ? 'روپے' : 'Rs'}
              </span>
            </div>

            {/* 2b. Optional RBAC Discount Control */}
            {canDiscount && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (showDiscount) {
                        setDiscountValue('0');
                      }
                      setShowDiscount(!showDiscount);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#D97706',
                      fontSize: isUrdu ? '14px' : '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className={isUrdu ? 'font-nastaleeq' : ''}>
                      {showDiscount ? t('− رعایت ہٹائیں', '− Remove Discount') : t('+ رعایت درج کریں (مجاز)', '+ Add Discount (Authorized)')}
                    </span>
                  </button>
                  {showDiscount && (
                    <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 800 }}>
                      {isUrdu ? 'مجاز رعایت' : 'Authorized'}
                    </span>
                  )}
                </div>

                {showDiscount && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={discountValue}
                      onChange={(e) => {
                        setDiscountValue(e.target.value);
                        setIsReceivedAutoUpdated(true);
                      }}
                      placeholder="0"
                      style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '8px',
                        border: '1.5px dashed #F59E0B',
                        backgroundColor: '#FFFBEB',
                        fontSize: '20px',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        color: '#B45309',
                        padding: '0 56px 0 12px',
                        direction: 'ltr',
                        outline: 'none',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        right: '10px',
                        fontSize: isUrdu ? '15px' : '12px',
                        fontWeight: 800,
                        color: '#B45309',
                      }}
                    >
                      {isUrdu ? 'روپے رعایت' : 'Rs Off'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Cash Received */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '15px', fontWeight: 900, color: '#0F172A' }}>
                {t('وصول رقم:', 'Received Amount (Rs):')}
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
                  border: 'none',
                  color: '#0E8A54',
                  borderRadius: '6px',
                  padding: isUrdu ? '2px 10px' : '2px 8px',
                  fontSize: isUrdu ? '15px' : '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: 'none',
                  outline: 'none',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Check size={14} strokeWidth={2.5} />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('مکمل ادا', 'Paid in Full')}</span>
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
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    customerNameInputRef.current?.focus();
                  }
                }}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#0F172A',
                  padding: '0 56px 0 12px',
                  direction: 'ltr',
                  unicodeBidi: 'isolate',
                  outline: 'none',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '10px',
                  fontSize: isUrdu ? '19px' : '14px',
                  fontWeight: 900,
                  color: '#D97706',
                  backgroundColor: '#FFFBEB',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                }}
              >
                {isUrdu ? 'روپے' : 'Rs'}
              </span>
            </div>
          </div>

          {/* 4. Customer Name */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '19px' : '15px', fontWeight: 900, color: '#0F172A' }}>
                {t('گاہک کا نام (اختیاری):', 'Customer Name (Optional):')}
              </span>
              {balanceRemaining > 0 && (
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '15px' : '12px', color: '#DC2626', fontWeight: 800 }}>
                  {t('* ادھار کے لیے نام ضروری ہے', '* Name is required for credit')}
                </span>
              )}
            </div>

            <input
              ref={customerNameInputRef}
              type="text"
              placeholder={t('گاہک کا نام لکھیں...', 'Enter customer name...')}
              value={customerName}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: '#FFFFFF',
                padding: '0 12px',
                fontSize: isUrdu ? '18px' : '15px',
                outline: 'none',
                boxShadow: 'none',
                textAlign: 'left',
                color: '#0F172A',
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
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  zIndex: 20,
                  marginTop: '4px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <span className="font-nastaleeq" style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 800, color: '#0F172A' }}>
                      {c.name}
                    </span>
                    <span style={{ color: '#64748B', fontSize: '12px', marginRight: '8px' }}>
                      {c.phone}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Token Summary Card & Hero Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Token Summary Card */}
          <div
            className="dash-card-animated"
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: 'none',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '22px' : '17px',
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('پسائی ٹوکن رقم', 'Milling Fee')}
              </span>

              {/* Ticket Token Badge */}
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#B45309',
                  backgroundColor: '#FFFBEB',
                  border: 'none',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Ticket size={15} color="#D97706" />
                <span>#{currentTokenFormatted}</span>
              </div>
            </div>

            {/* Large Total Fee Display */}
            <div
              style={{
                fontSize: isUrdu ? '38px' : '32px',
                fontWeight: 900,
                fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                color: '#0F172A',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}
            >
              {isUrdu ? `${netTotal.toLocaleString()} روپے` : `Rs ${netTotal.toLocaleString()}`}
            </div>

            {numDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#16A34A', fontSize: isUrdu ? '16px' : '13px', fontWeight: 800, marginTop: '-2px' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('رعایت:', 'Discount:')}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>-Rs {numDiscount.toLocaleString()}</span>
              </div>
            )}

            {/* Balance or Return Status */}
            {balanceRemaining > 0 ? (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: '#B91C1C' }}
                >
                  {t('باقی ادھار:', 'Credit Balance:')}
                </span>
                <span style={{ fontSize: isUrdu ? '20px' : '16px', fontWeight: 900, color: '#B91C1C', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                  {isUrdu ? `${balanceRemaining.toLocaleString()} روپے` : `Rs ${balanceRemaining.toLocaleString()}`}
                </span>
              </div>
            ) : changeToReturn > 0 ? (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: '#0E8A54' }}
                >
                  {t('گاہک کو واپسی:', 'Change Due:')}
                </span>
                <span style={{ fontSize: isUrdu ? '20px' : '16px', fontWeight: 900, color: '#0E8A54', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                  {isUrdu ? `${changeToReturn.toLocaleString()} روپے` : `Rs ${changeToReturn.toLocaleString()}`}
                </span>
              </div>
            ) : null}
          </div>

          {/* 2 Big Dashboard-Style Hero Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Button 1: Print Token & Bill - Warm Amber / Ochre #D97706 */}
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
                height: '48px',
                borderRadius: '12px',
                background:
                  numWeight <= 0 || numCharge <= 0
                    ? '#94A3B8'
                    : '#D97706',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: 'none',
                outline: 'none',
                cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 14px',
                transition: 'background-color 0.15s ease',
              }}
            >
              {/* Left: White Squircle Icon Tile */}
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                <Printer size={18} color="#D97706" strokeWidth={2.4} />
              </div>

              {/* Right: Bold Text */}
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '22px' : '16px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('ٹوکن اور بل پرنٹ کریں', 'Print Token & Receipt')}
              </span>
            </button>

            {/* Button 2: Save as Credit - Emerald Green #0E8A54 */}
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
                height: '44px',
                borderRadius: '12px',
                background:
                  numWeight <= 0 || numCharge <= 0
                    ? '#94A3B8'
                    : '#0E8A54',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: 'none',
                outline: 'none',
                cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 14px',
                transition: 'background-color 0.15s ease',
              }}
            >
              {/* Left: White Squircle Icon Tile */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={17} color="#0E8A54" strokeWidth={2.4} />
              </div>

              {/* Right: Bold Text */}
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '20px' : '15px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('ادھار کھاتہ میں محفوظ کریں', 'Save as Credit')}
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

