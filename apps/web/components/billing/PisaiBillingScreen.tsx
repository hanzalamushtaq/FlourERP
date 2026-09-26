'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import {
  Printer,
  BookOpen,
  Check,
  Cog,
  Ticket,
  Sparkles,
  Tag,
  Lock,
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Edit3,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getSession, ensureValidToken, clearSession } from '../../lib/auth';
import { sound } from '../../lib/audioFeedback';
import { getApiBaseUrl } from '../../lib/api';

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
  const { isDark } = useTheme();
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
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number>(-1);

  // Hover & Tactile States for Dashboard-Style Polish
  const [hoveredService, setHoveredService] = useState<'safai_pisai' | 'pisai' | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<'print' | 'credit' | null>(null);
  const [pressedBtn, setPressedBtn] = useState<'print' | 'credit' | null>(null);

  const [currentTokenFormatted, setCurrentTokenFormatted] = useState<string>('0101');

  // Token Status & Action Lookup State
  const [searchTokenInput, setSearchTokenInput] = useState<string>('');
  const [isSearchingToken, setIsSearchingToken] = useState<boolean>(false);
  const [searchedTokenData, setSearchedTokenData] = useState<any | null>(null);
  const [searchTokenError, setSearchTokenError] = useState<string | null>(null);
  const [isUpdatingTokenStatus, setIsUpdatingTokenStatus] = useState<boolean>(false);
  const [isEditingTokenCustomer, setIsEditingTokenCustomer] = useState<boolean>(false);
  const [editTokenCustName, setEditTokenCustName] = useState<string>('');
  const [editTokenCustPhone, setEditTokenCustPhone] = useState<string>('');
  const [editTokenFee, setEditTokenFee] = useState<string>('0');
  const [editTokenReceived, setEditTokenReceived] = useState<string>('0');
  const [editTokenSaveLedger, setEditTokenSaveLedger] = useState<boolean>(false);
  const [isSavingTokenEdit, setIsSavingTokenEdit] = useState<boolean>(false);

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

  // Auto-focus weight input on service switch (desktop only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      weightInputRef.current?.focus();
      weightInputRef.current?.select();
    }
  }, [serviceType]);

  // Fetch next upcoming token on mount
  useEffect(() => {
    const sess = getSession();
    fetch(`${getApiBaseUrl()}/api/pisai?limit=1`, {
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
      fetch(`${getApiBaseUrl()}/api/customers/search?q=${encodeURIComponent(val)}`, {
        headers: sess?.token ? { Authorization: `Bearer ${sess.token}` } : {},
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data.customers && json.data.customers.length > 0) {
            setSuggestions(json.data.customers);
            setShowSuggestions(true);
            setSelectedCustomerIndex(0);
          } else {
            const filtered = MOCK_CUSTOMERS.filter((c) =>
              c.name.toLowerCase().includes(val.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
            setSelectedCustomerIndex(filtered.length > 0 ? 0 : -1);
          }
        })
        .catch(() => {
          const filtered = MOCK_CUSTOMERS.filter((c) =>
            c.name.toLowerCase().includes(val.toLowerCase())
          );
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
          setSelectedCustomerIndex(filtered.length > 0 ? 0 : -1);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedCustomerIndex(-1);
    }
  };

  const handleSelectCustomer = (cust: { name: string; phone?: string | null }) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone || '');
    setShowSuggestions(false);
    setSelectedCustomerIndex(-1);
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
        receivedAmount: numReceived || 0,
        paymentMethod: isCreditSale ? 'CREDIT' : 'CASH',
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      };

      let created: any = null;

      try {
        let res = await fetch(`${getApiBaseUrl()}/api/pisai`, {
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
            res = await fetch(`${getApiBaseUrl()}/api/pisai`, {
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
        if (json.success && json.data?.ticket) {
          created = json.data.ticket;
        } else {
          sound.playWarningSound();
          alert(json.error?.message || 'Error generating grinding ticket');
          return;
        }
      } catch (networkErr: any) {
        // Fallback for offline mode, mobile browsers, or when backend API is not locally running
        console.warn('Backend API unavailable, generating offline pisai ticket:', networkErr);
        const nextNum = parseInt(currentTokenFormatted || '1', 10);
        created = {
          tokenNumber: nextNum,
          tokenFormatted: String(nextNum).padStart(4, '0'),
          createdAt: new Date().toISOString(),
          customerName: customerName.trim() || undefined,
          serviceType: serviceType === 'safai_pisai' ? 'SAFAI_PISAI' : 'PISAI_ONLY',
          weightKg: numWeight,
          feeAmount: numCharge,
          discount: numDiscount,
          netTotal: netTotal,
          receivedAmount: isCreditSale ? 0 : numReceived,
          paymentMethod: isCreditSale ? 'CREDIT' : 'CASH',
          biller: {
            fullName: sess?.fullName || (isUrdu ? 'محمد عاصف (کاؤنٹر 01)' : 'Muhammad Asif'),
          },
        };
      }

      if (!created) return;

      sound.playSuccessChime();
      // Advance next token counter for upcoming ticket
      setCurrentTokenFormatted(String((created.tokenNumber || 1) + 1).padStart(4, '0'));

      const receipt: ReceiptData = {
        type: 'pisai',
        billNumber: `PISAI-${created.tokenFormatted || '0001'}`,
        pisaiToken: created.tokenFormatted || '0001',
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
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Token Lookup
  const handleSearchToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tokenQuery = searchTokenInput.trim();
    if (!tokenQuery) return;

    sound.beep();
    setIsSearchingToken(true);
    setSearchTokenError(null);
    setSearchedTokenData(null);
    setIsEditingTokenCustomer(false);

    try {
      const sess = getSession();
      const res = await fetch(`${getApiBaseUrl()}/api/pisai/token/${encodeURIComponent(tokenQuery)}`, {
        headers: sess?.token ? { Authorization: `Bearer ${sess.token}` } : {},
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        sound.success();
        setSearchedTokenData(json.data);
        setEditTokenCustName(json.data.customerName || json.data.customer?.name || '');
        setEditTokenCustPhone(json.data.customerPhone || json.data.customer?.phone || '');
        const fee = json.data.netTotal || json.data.feeAmount || 0;
        const rec = json.data.receivedAmount !== undefined ? json.data.receivedAmount : (json.data.paymentMethod === 'CREDIT' ? 0 : fee);
        setEditTokenFee(String(fee));
        setEditTokenReceived(String(rec));
        setEditTokenSaveLedger(json.data.paymentMethod === 'CREDIT' || (fee - rec) > 0);
      } else {
        sound.playWarningSound();
        setSearchTokenError(json.error?.message || (isUrdu ? 'ٹوکن نمبر نہیں ملا' : 'Token not found'));
      }
    } catch {
      sound.playWarningSound();
      setSearchTokenError(isUrdu ? 'ٹوکن تلاش کرنے میں خرابی ہوئی' : 'Error looking up token');
    } finally {
      setIsSearchingToken(false);
    }
  };

  // Toggle delivery status for looked up token
  const handleToggleSearchedTokenStatus = async () => {
    if (!searchedTokenData) return;

    // If moving to delivered and has unpaid balance, expand settlement to allow entering cash or credit
    const fee = searchedTokenData.netTotal || searchedTokenData.feeAmount || 0;
    const rec = searchedTokenData.receivedAmount || 0;
    if (searchedTokenData.deliveryStatus === 'IN_QUEUE' && (fee - rec) > 0 && !isEditingTokenCustomer) {
      setIsEditingTokenCustomer(true);
      return;
    }

    const nextStatus = searchedTokenData.deliveryStatus === 'IN_QUEUE' ? 'DELIVERED' : 'IN_QUEUE';
    setIsUpdatingTokenStatus(true);
    sound.success();

    const updated = {
      ...searchedTokenData,
      deliveryStatus: nextStatus,
      deliveredAt: nextStatus === 'DELIVERED' ? new Date().toISOString() : null,
    };
    setSearchedTokenData(updated);

    try {
      const sess = getSession();
      await fetch(`${getApiBaseUrl()}/api/pisai/${searchedTokenData.id}/delivery-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(sess?.token ? { Authorization: `Bearer ${sess.token}` } : {}),
        },
        body: JSON.stringify({ deliveryStatus: nextStatus }),
      });
    } catch {
      // ignore
    } finally {
      setIsUpdatingTokenStatus(false);
    }
  };

  // Save edited customer, money, and credit ledger for looked up token
  const handleSaveSearchedTokenEdit = async (markDelivered?: boolean) => {
    if (!searchedTokenData) return;
    setIsSavingTokenEdit(true);
    sound.beep();

    const numFee = parseFloat(editTokenFee) || 0;
    const numRec = parseFloat(editTokenReceived) || 0;
    const debt = Math.max(0, numFee - numRec);
    const isCredit = editTokenSaveLedger || debt > 0;
    const nextDeliveryStatus = markDelivered ? 'DELIVERED' : searchedTokenData.deliveryStatus;

    const updated = {
      ...searchedTokenData,
      customerName: editTokenCustName.trim() || searchedTokenData.customerName,
      customerPhone: editTokenCustPhone.trim(),
      feeAmount: numFee,
      netTotal: numFee,
      receivedAmount: numRec,
      paymentMethod: isCredit ? 'CREDIT' : 'CASH',
      deliveryStatus: nextDeliveryStatus,
      deliveredAt: nextDeliveryStatus === 'DELIVERED' ? new Date().toISOString() : searchedTokenData.deliveredAt,
    };
    setSearchedTokenData(updated);

    try {
      const sess = getSession();
      const res = await fetch(`${getApiBaseUrl()}/api/pisai/${searchedTokenData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(sess?.token ? { Authorization: `Bearer ${sess.token}` } : {}),
        },
        body: JSON.stringify({
          customerName: editTokenCustName.trim() || searchedTokenData.customerName,
          customerPhone: editTokenCustPhone.trim(),
          feeAmount: numFee,
          receivedAmount: numRec,
          paymentMethod: isCredit ? 'CREDIT' : 'CASH',
          saveToLedger: isCredit,
          deliveryStatus: nextDeliveryStatus,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSearchedTokenData(json.data);
      }
      setIsEditingTokenCustomer(false);
      sound.success();
    } catch {
      setIsEditingTokenCustomer(false);
      sound.success();
    } finally {
      setIsSavingTokenEdit(false);
    }
  };

  // Print searched token ticket
  const handlePrintSearchedToken = () => {
    if (!searchedTokenData) return;
    sound.beep();
    const tokenDisplay = searchedTokenData.tokenFormatted || `T-${searchedTokenData.tokenNumber}`;
    const dateFormatted = searchedTokenData.createdAt
      ? new Date(searchedTokenData.createdAt).toLocaleString('en-PK', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleString();

    const receipt: ReceiptData = {
      type: 'pisai',
      billNumber: tokenDisplay,
      customerName: searchedTokenData.customerName || searchedTokenData.customer?.name,
      serviceType: searchedTokenData.serviceType || 'SAFAI_PISAI',
      pisaiWeightKg: searchedTokenData.weightKg,
      pisaiToken: tokenDisplay,
      subtotal: searchedTokenData.feeAmount || searchedTokenData.netTotal || 0,
      discount: searchedTokenData.discount || 0,
      netTotal: searchedTokenData.netTotal || searchedTokenData.feeAmount || 0,
      cashReceived: searchedTokenData.receivedAmount || searchedTokenData.netTotal || 0,
      remainingBalance: searchedTokenData.paymentMethod === 'CREDIT' ? searchedTokenData.netTotal : 0,
      isCredit: searchedTokenData.paymentMethod === 'CREDIT',
      timestamp: dateFormatted,
      billerName: searchedTokenData.biller?.fullName || 'محمد عاصف',
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 0. TOP: Token Status & Action Lookup Card */}
      <div
        style={{
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderRadius: '16px',
          border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
          padding: '14px 18px',
          boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#334155' : '#EFF6FF',
                color: isDark ? '#93C5FD' : '#1877F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={17} />
            </div>
            <div>
              <h3
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  margin: 0,
                  fontSize: isUrdu ? '20px' : '15px',
                  fontWeight: 900,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              >
                {t('ٹوکن نمبر اسٹیٹس اور فوری کارروائی', 'Token Status & Action Lookup')}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: isUrdu ? '14px' : '12px',
                  color: isDark ? '#94A3B8' : '#64748B',
                }}
              >
                {t('ٹوکن نمبر درج کریں اور اسٹیٹس (قطار / فراہم شدہ) چیک کریں', 'Insert token number to check status, mark delivered, edit or print')}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchToken} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={searchTokenInput}
              onChange={(e) => {
                setSearchTokenInput(e.target.value);
                if (searchTokenError) setSearchTokenError(null);
              }}
              placeholder={t('ٹوکن نمبر درج کریں (مثال: 1001 یا 101)', 'Enter Token # (e.g. 1001 or 101)...')}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 14px',
                borderRadius: '10px',
                border: isDark ? '1.5px solid #475569' : '1.5px solid #CBD5E1',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                color: isDark ? '#F8FAFC' : '#0F172A',
                fontSize: '15px',
                fontWeight: 700,
                outline: 'none',
                fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
              }}
            />
            {searchTokenInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchTokenInput('');
                  setSearchedTokenData(null);
                  setSearchTokenError(null);
                }}
                style={{
                  position: 'absolute',
                  right: isUrdu ? 'auto' : '10px',
                  left: isUrdu ? '10px' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!searchTokenInput.trim() || isSearchingToken}
            style={{
              height: '42px',
              padding: '0 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#1877F2',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: isUrdu ? '16px' : '14px',
              cursor: searchTokenInput.trim() && !isSearchingToken ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)',
              opacity: searchTokenInput.trim() && !isSearchingToken ? 1 : 0.65,
            }}
          >
            {isSearchingToken ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('چیک کریں', 'Check')}
            </span>
          </button>
        </form>

        {/* Error message */}
        {searchTokenError && (
          <div
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {searchTokenError}
          </div>
        )}

        {/* Result & Action Card */}
        {searchedTokenData && (
          <div
            style={{
              backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
              borderRadius: '12px',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header: Token # + Status Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '16px',
                  }}
                >
                  {searchedTokenData.tokenFormatted || `T-${searchedTokenData.tokenNumber}`}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: isUrdu ? '18px' : '15px',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontFamily: 'var(--font-urdu)',
                  }}
                >
                  {searchedTokenData.customerName || searchedTokenData.customer?.name || (isUrdu ? 'عام گاہک' : 'Walk-in Customer')}
                </span>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: isUrdu ? '15px' : '13px',
                  backgroundColor:
                    searchedTokenData.deliveryStatus === 'DELIVERED'
                      ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5')
                      : (isDark ? 'rgba(217, 119, 6, 0.2)' : '#FFFBEB'),
                  color:
                    searchedTokenData.deliveryStatus === 'DELIVERED'
                      ? '#0E8A54'
                      : '#B45309',
                  border:
                    searchedTokenData.deliveryStatus === 'DELIVERED'
                      ? '1px solid #10B981'
                      : '1px solid #D97706',
                }}
              >
                {searchedTokenData.deliveryStatus === 'DELIVERED' ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{t('فراہم کر دیا گیا (Delivered)', 'Delivered')}</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    <span>{t('قطار میں ہے (In Queue)', 'In Queue')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Specs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  {t('گندم کا وزن', 'Wheat Weight')}
                </span>
                <span style={{ fontWeight: 900, fontSize: '15px', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {searchedTokenData.weightKg} KG
                </span>
              </div>

              <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  {t('سروس', 'Service')}
                </span>
                <span style={{ fontWeight: 900, fontSize: '14px', color: '#D97706' }}>
                  {searchedTokenData.serviceType === 'PISAI_ONLY' ? t('صرف پسائی', 'Pisai Only') : t('صفائی و پسائی', 'Safai & Pisai')}
                </span>
              </div>

              <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  {t('پسائی اجرت', 'Grinding Fee')}
                </span>
                <span style={{ fontWeight: 900, fontSize: '15px', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Rs {searchedTokenData.netTotal || searchedTokenData.feeAmount}
                </span>
              </div>

              <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  {t('ادائیگی', 'Payment')}
                </span>
                <span style={{ fontWeight: 800, fontSize: '13px', color: searchedTokenData.paymentMethod === 'CREDIT' ? '#B45309' : '#0E8A54' }}>
                  {searchedTokenData.paymentMethod === 'CREDIT' ? t('ادھار', 'Credit') : t('نقد', 'Cash')}
                </span>
              </div>
            </div>

            {/* Inline Money & Customer Settlement Form (if toggled) */}
            {isEditingTokenCustomer && (
              <div
                style={{
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: isDark ? '1.5px solid #475569' : '1.5px solid #CBD5E1',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '14px', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    <Edit3 size={15} color="#D97706" />
                    <span className={isUrdu ? 'font-nastaleeq' : ''}>
                      {t('رقم و کھاتہ سیٹلمنٹ / معلومات', 'Payment Settlement & Details')}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: searchedTokenData.deliveryStatus === 'DELIVERED' ? '#ECFDF5' : '#FFFBEB',
                      color: searchedTokenData.deliveryStatus === 'DELIVERED' ? '#0E8A54' : '#B45309',
                    }}
                  >
                    {searchedTokenData.deliveryStatus === 'DELIVERED' ? t('فراہم شدہ', 'Delivered') : t('قطار میں', 'In Queue')}
                  </span>
                </div>

                {/* Customer Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                      {t('گاہک کا نام', 'Customer Name')}
                    </label>
                    <input
                      type="text"
                      value={editTokenCustName}
                      onChange={(e) => setEditTokenCustName(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        fontSize: '13.5px',
                        fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                      {t('فون نمبر', 'Phone Number')}
                    </label>
                    <input
                      type="text"
                      value={editTokenCustPhone}
                      onChange={(e) => setEditTokenCustPhone(e.target.value)}
                      placeholder="0300-1234567"
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Money Settlement Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', marginBottom: '4px' }}>
                      {t('کل پسائی اجرت (روپے)', 'Total Grinding Fee (Rs)')}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editTokenFee}
                      onChange={(e) => setEditTokenFee(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        fontSize: '15px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B' }}>
                        {t('نقد وصولی (روپے)', 'Cash Received (Rs)')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditTokenReceived(editTokenFee);
                          setEditTokenSaveLedger(false);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0E8A54',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        {t('مکمل ادا', 'Paid in Full')}
                      </button>
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={editTokenReceived}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditTokenReceived(val);
                        const numF = parseFloat(editTokenFee) || 0;
                        const numR = parseFloat(val) || 0;
                        setEditTokenSaveLedger(numF - numR > 0);
                      }}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        fontSize: '15px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Remaining Credit & Ledger Notification */}
                {(() => {
                  const numF = parseFloat(editTokenFee) || 0;
                  const numR = parseFloat(editTokenReceived) || 0;
                  const debt = Math.max(0, numF - numR);

                  return (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: debt > 0
                          ? (isDark ? 'rgba(217, 119, 6, 0.15)' : '#FFFBEB')
                          : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5'),
                        border: debt > 0 ? '1px solid #F59E0B' : '1px solid #10B981',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: debt > 0 ? '#B45309' : '#0E8A54' }}>
                          {debt > 0
                            ? (isUrdu ? `بقایا ادھار: Rs ${debt}` : `Remaining Credit: Rs ${debt}`)
                            : (isUrdu ? 'مکمل نقد ادائیگی (No Credit Debt)' : 'Full Payment Settled')}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B' }}>
                          {debt > 0 ? t('ادھار کھاتہ', 'Credit Account') : t('نقد ادا', 'Cash Settled')}
                        </span>
                      </div>

                      {debt > 0 && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          <input
                            type="checkbox"
                            checked={editTokenSaveLedger}
                            onChange={(e) => setEditTokenSaveLedger(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>
                            {t('گاہک کے کھاتے میں ادھار درج کریں (Save in Customer Ledger)', 'Save remaining credit in customer ledger')}
                          </span>
                        </label>
                      )}
                    </div>
                  );
                })()}

                {/* Actions: Save & Mark Delivered, Save Changes, Cancel */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleSaveSearchedTokenEdit(true)}
                    disabled={isSavingTokenEdit}
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0E8A54',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: isUrdu ? '15px' : '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(14, 138, 84, 0.25)',
                    }}
                  >
                    <Check size={16} />
                    <span className={isUrdu ? 'font-nastaleeq' : ''}>
                      {t('محفوظ اور فراہم کریں', 'Save & Mark Delivered')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveSearchedTokenEdit(false)}
                    disabled={isSavingTokenEdit}
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#1877F2',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: isUrdu ? '15px' : '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Save size={16} />
                    <span className={isUrdu ? 'font-nastaleeq' : ''}>
                      {t('تبدیلیاں محفوظ کریں', 'Save Changes')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingTokenCustomer(false)}
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      background: 'transparent',
                      color: isDark ? '#94A3B8' : '#64748B',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {t('منسوخ', 'Cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Action 1: Status Toggle Button */}
              <button
                type="button"
                onClick={handleToggleSearchedTokenStatus}
                disabled={isUpdatingTokenStatus}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: isUrdu ? '15px' : '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor:
                    searchedTokenData.deliveryStatus === 'IN_QUEUE' ? '#0E8A54' : '#D97706',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                {searchedTokenData.deliveryStatus === 'IN_QUEUE' ? (
                  <>
                    <Check size={16} />
                    <span className={isUrdu ? 'font-nastaleeq' : ''}>
                      {t('گاہک کو فراہم کر دیا گیا (Mark Delivered)', 'Mark as Delivered')}
                    </span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    <span className={isUrdu ? 'font-nastaleeq' : ''}>
                      {t('واپس قطار میں ڈالیں (Move to Queue)', 'Move back to Queue')}
                    </span>
                  </>
                )}
              </button>

              {/* Action 2: Print Ticket */}
              <button
                type="button"
                onClick={handlePrintSearchedToken}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: isUrdu ? '15px' : '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={16} />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('پرچی پرنٹ کریں', 'Print Ticket')}
                </span>
              </button>

              {/* Action 3: Edit Details */}
              <button
                type="button"
                onClick={() => setIsEditingTokenCustomer((prev) => !prev)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontWeight: 800,
                  fontSize: isUrdu ? '14px' : '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Edit3 size={15} />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('معلومات درست کریں', 'Edit Details')}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. TOP: Premium Dual Service Selection Switcher (Responsive) */}
      <div className="dual-top-action-cards">
        {/* Card 1: Safai + Pisai */}
        <div
          onClick={() => handleSelectService('safai_pisai')}
          onMouseEnter={() => setHoveredService('safai_pisai')}
          onMouseLeave={() => setHoveredService(null)}
          className="dual-action-card touch-active"
          style={{
            width: '100%',
            maxWidth: '360px',
            background:
              serviceType === 'safai_pisai'
                ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
                : hoveredService === 'safai_pisai'
                ? (isDark ? '#243046' : '#F8FAFC')
                : (isDark ? '#1E293B' : '#FFFFFF'),
            borderRadius: '14px',
            border:
              serviceType === 'safai_pisai'
                ? (isDark ? '2px solid #F59E0B' : '2px solid #92400E')
                : (isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0'),
            boxShadow:
              serviceType === 'safai_pisai'
                ? '0 6px 16px rgba(217, 119, 6, 0.35)'
                : '0 2px 6px rgba(15, 23, 42, 0.04)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            direction: isUrdu ? 'rtl' : 'ltr',
            cursor: 'pointer',
            minHeight: '62px',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: serviceType === 'safai_pisai'
                  ? '#FFFFFF'
                  : (isDark ? '#0B0F19' : '#FFFBEB'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  serviceType === 'safai_pisai'
                    ? '0 2px 8px rgba(0,0,0,0.12)'
                    : 'none',
                border: serviceType === 'safai_pisai'
                  ? 'none'
                  : (isDark ? '1px solid #334155' : '1px solid #FEF3C7'),
                flexShrink: 0,
              }}
            >
              <SafaiPisaiSvg />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-start' : 'flex-start' }}>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '21px' : '16px',
                  fontWeight: 900,
                  color: serviceType === 'safai_pisai'
                    ? '#FFFFFF'
                    : (isDark ? '#F8FAFC' : '#0F172A'),
                  margin: 0,
                  lineHeight: 1.3,
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
          className="dual-action-card touch-active"
          style={{
            width: '100%',
            maxWidth: '360px',
            background:
              serviceType === 'pisai'
                ? 'linear-gradient(135deg, #1877F2 0%, #1D4ED8 100%)'
                : hoveredService === 'pisai'
                ? (isDark ? '#243046' : '#F8FAFC')
                : (isDark ? '#1E293B' : '#FFFFFF'),
            borderRadius: '14px',
            border:
              serviceType === 'pisai'
                ? (isDark ? '2px solid #60A5FA' : '2px solid #1E40AF')
                : (isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0'),
            boxShadow:
              serviceType === 'pisai'
                ? '0 6px 16px rgba(24, 119, 242, 0.35)'
                : '0 2px 6px rgba(15, 23, 42, 0.04)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            direction: isUrdu ? 'rtl' : 'ltr',
            cursor: 'pointer',
            minHeight: '62px',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: serviceType === 'pisai'
                  ? '#FFFFFF'
                  : (isDark ? '#0B0F19' : '#EFF6FF'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  serviceType === 'pisai'
                    ? '0 2px 8px rgba(0,0,0,0.12)'
                    : 'none',
                border: serviceType === 'pisai'
                  ? 'none'
                  : (isDark ? '1px solid #334155' : '1px solid #DBEAFE'),
                flexShrink: 0,
              }}
            >
              <PisaiOnlySvg />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '22px' : '17px',
                  fontWeight: 900,
                  color: serviceType === 'pisai'
                    ? '#FFFFFF'
                    : (isDark ? '#F8FAFC' : '#0F172A'),
                  margin: 0,
                  lineHeight: 1.3,
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
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderRadius: '12px',
            border: isDark ? '1px solid #334155' : 'none',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
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
                  backgroundColor: isDark ? '#0B0F19' : '#FFFBEB',
                  border: isDark ? '1px solid #334155' : 'none',
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
                    color: isDark ? '#F8FAFC' : '#0F172A',
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
                    color: isDark ? '#FDE047' : '#B45309',
                    fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                    backgroundColor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB',
                    border: isDark ? '1px solid #78350F' : 'none',
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
                backgroundColor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB',
                padding: '3px 10px',
                borderRadius: '8px',
                border: isDark ? '1px solid #78350F' : 'none',
              }}
            >
              <Sparkles size={16} color={isDark ? '#FBBF24' : '#D97706'} />
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '16px' : '13px', fontWeight: 900, color: isDark ? '#FDE047' : '#B45309' }}>
                {t('فاسٹ کاؤنٹر', 'Fast Counter')}
              </span>
            </div>
          </div>

          {/* 1. Weight Entry */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '15px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A' }}>
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
                  border: isDark ? '1.5px solid #475569' : 'none',
                  backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: isDark ? '#F8FAFC' : '#0F172A',
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
                  color: isDark ? '#FDE047' : '#D97706',
                  backgroundColor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB',
                  border: isDark ? '1px solid #78350F' : 'none',
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
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '15px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {t('پسائی اجرت:', 'Grinding Fee (Rs):')}
              </span>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '13px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 800 }}>
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
                  border: isDark ? '1.5px solid #475569' : 'none',
                  backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: isDark ? '#F8FAFC' : '#0F172A',
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
                  color: isDark ? '#FDE047' : '#D97706',
                  backgroundColor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB',
                  border: isDark ? '1px solid #78350F' : 'none',
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
                      color: isDark ? '#FBBF24' : '#D97706',
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
                    <span style={{ fontSize: '12px', color: isDark ? '#4ADE80' : '#16A34A', fontWeight: 800 }}>
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
                        backgroundColor: isDark ? '#0B0F19' : '#FFFBEB',
                        fontSize: '20px',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        color: isDark ? '#FDE047' : '#B45309',
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
                        color: isDark ? '#FDE047' : '#B45309',
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
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '15px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A' }}>
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
                  background: isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5',
                  border: isDark ? '1px solid #059669' : 'none',
                  color: isDark ? '#34D399' : '#0E8A54',
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
                  border: isDark ? '1.5px solid #475569' : 'none',
                  backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                  fontSize: '28px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: isDark ? '#F8FAFC' : '#0F172A',
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
                  color: isDark ? '#FDE047' : '#D97706',
                  backgroundColor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB',
                  border: isDark ? '1px solid #78350F' : 'none',
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
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '19px' : '15px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {t('گاہک کا نام (اختیاری):', 'Customer Name (Optional):')}
              </span>
              {balanceRemaining > 0 && (
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '15px' : '12px', color: '#F87171', fontWeight: 800 }}>
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
              onKeyDown={(e) => {
                if (showSuggestions && suggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedCustomerIndex((prev) => (prev + 1) % suggestions.length);
                    return;
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedCustomerIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
                    return;
                  }
                  if (e.key === 'Enter') {
                    if (selectedCustomerIndex >= 0 && selectedCustomerIndex < suggestions.length) {
                      e.preventDefault();
                      handleSelectCustomer(suggestions[selectedCustomerIndex]);
                      return;
                    }
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowSuggestions(false);
                    return;
                  }
                }
              }}
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '9px',
                border: isDark ? '1.5px solid #475569' : 'none',
                backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                padding: '0 12px',
                fontSize: isUrdu ? '18px' : '15px',
                outline: 'none',
                boxShadow: 'none',
                textAlign: 'left',
                color: isDark ? '#F8FAFC' : '#0F172A',
                transition: 'all 0.15s ease',
              }}
            />

            {/* Suggestions Dropdown with Keyboard Navigation */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 0,
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  zIndex: 30,
                  marginTop: '4px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}
              >
                {suggestions.map((c, idx) => {
                  const isHighlighted = idx === selectedCustomerIndex;
                  return (
                    <div
                      key={c.id}
                      ref={(el) => {
                        if (isHighlighted && el) {
                          el.scrollIntoView({ block: 'nearest' });
                        }
                      }}
                      onClick={() => handleSelectCustomer(c)}
                      onMouseEnter={() => setSelectedCustomerIndex(idx)}
                      style={{
                        padding: '9px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                        backgroundColor: isHighlighted
                          ? (isDark ? '#334155' : '#EFF6FF')
                          : (isDark ? '#1E293B' : '#FFFFFF'),
                        borderLeft: isHighlighted ? '3px solid #1877F2' : '3px solid transparent',
                        transition: 'background-color 0.1s ease',
                      }}
                    >
                      <span className="font-nastaleeq" style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 800, color: isHighlighted ? '#1877F2' : (isDark ? '#F8FAFC' : '#0F172A') }}>
                        {c.name}
                      </span>
                      <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '12px', marginRight: '8px', fontFamily: 'var(--font-mono)' }}>
                        {c.phone}
                      </span>
                    </div>
                  );
                })}
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
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderRadius: '12px',
              border: isDark ? '1px solid #334155' : 'none',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '22px' : '17px',
                  fontWeight: 900,
                  color: isDark ? '#F8FAFC' : '#0F172A',
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
                  color: isDark ? '#FDE047' : '#B45309',
                  backgroundColor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB',
                  border: isDark ? '1px solid #78350F' : 'none',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Ticket size={15} color={isDark ? '#FBBF24' : '#D97706'} />
                <span>#{currentTokenFormatted}</span>
              </div>
            </div>

            {/* Large Total Fee Display */}
            <div
              style={{
                fontSize: isUrdu ? '38px' : '32px',
                fontWeight: 900,
                fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                color: isDark ? '#F8FAFC' : '#0F172A',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}
            >
              {isUrdu ? `${netTotal.toLocaleString()} روپے` : `Rs ${netTotal.toLocaleString()}`}
            </div>

            {numDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: isDark ? '#4ADE80' : '#16A34A', fontSize: isUrdu ? '16px' : '13px', fontWeight: 800, marginTop: '-2px' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('رعایت:', 'Discount:')}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>-Rs {numDiscount.toLocaleString()}</span>
              </div>
            )}

            {/* Balance or Return Status */}
            {balanceRemaining > 0 ? (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                  border: isDark ? '1px solid #EF4444' : 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: isDark ? '#FCA5A5' : '#B91C1C' }}
                >
                  {t('باقی ادھار:', 'Credit Balance:')}
                </span>
                <span style={{ fontSize: isUrdu ? '20px' : '16px', fontWeight: 900, color: isDark ? '#F87171' : '#B91C1C', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                  {isUrdu ? `${balanceRemaining.toLocaleString()} روپے` : `Rs ${balanceRemaining.toLocaleString()}`}
                </span>
              </div>
            ) : changeToReturn > 0 ? (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#ECFDF5',
                  border: isDark ? '1px solid #22C55E' : 'none',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: isDark ? '#86EFAC' : '#0E8A54' }}
                >
                  {t('گاہک کو واپسی:', 'Change Due:')}
                </span>
                <span style={{ fontSize: isUrdu ? '20px' : '16px', fontWeight: 900, color: isDark ? '#4ADE80' : '#0E8A54', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
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
          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            weightInputRef.current?.focus();
            weightInputRef.current?.select();
          }
        }}
        data={receiptData}
      />
    </div>
  );
};

