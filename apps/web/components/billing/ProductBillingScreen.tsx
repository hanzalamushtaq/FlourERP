'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../ui/TouchCard';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, Tag, Check, BookOpen, Plus, Trash2, X, AlertTriangle, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSession, ensureValidToken, clearSession } from '../../lib/auth';
import { sound } from '../../lib/audioFeedback';

// 1. Custom SVG Product Illustrations matching Dashboard aesthetic
const ChakkiAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 14C7 11.5 10 11 18 11C26 11 29 11.5 29 14L28 30C28 32 26 33 18 33C10 33 8 32 8 30L7 14Z" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M12 11C12 9 14 7 18 7C22 7 24 9 24 11" stroke="#4A2810" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M11 11H25" stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 16V27M18 18L15 16M18 18L21 16M18 21L14 19M18 21L22 19M18 24L15 22M18 24L21 22" stroke="#FAF4ED" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const FineAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="20" height="22" rx="3" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M13 10V7C13 6 14 5 15 5H21C22 5 23 6 23 7V10" stroke="#4A2810" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="18" cy="20" r="5" fill="#C99462" stroke="#4A2810" strokeWidth="1.8" />
    <path d="M18 17V23M18 18L16 19M18 18L20 19M18 21L16 22M18 21L20 22" stroke="#FAF4ED" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M26 6L27 8L29 9L27 10L26 12L25 10L23 9L25 8L26 6Z" fill="#D97706" />
  </svg>
);

const MaidaSpecialSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 13C8 11 11 10 18 10C25 10 28 11 28 13L27 30C27 32 25 33 18 33C11 33 9 32 9 30L8 13Z" fill="#FFFFFF" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M13 10C13 7.5 15 6 18 6C21 6 23 7.5 23 10" stroke="#4A2810" strokeWidth="2.2" />
    <circle cx="18" cy="21" r="5.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.8" />
    <path d="M14 21H22M18 17V25" stroke="#C99462" strokeWidth="2" strokeLinecap="round" />
    <path d="M15.5 18.5L20.5 23.5M20.5 18.5L15.5 23.5" stroke="#C99462" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SujiSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 16C6 24 11 27 18 27C25 27 30 24 30 16H6Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <ellipse cx="18" cy="16" rx="12" ry="4" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M12 27L10 32H26L24 27" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M10 16C10 12 13 9 18 9C23 9 26 12 26 16" fill="#D97706" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="15" cy="13" r="1.2" fill="#FAF4ED" />
    <circle cx="18" cy="12" r="1.4" fill="#FAF4ED" />
    <circle cx="21" cy="13" r="1.2" fill="#FAF4ED" />
  </svg>
);

const ChokarSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12L10 31C10 32.5 12 33 18 33C24 33 26 32.5 26 31L28 12L22 9L18 10L14 9L8 12Z" fill="#8C582B" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <line x1="12" y1="17" x2="24" y2="17" stroke="#FAF4ED" strokeWidth="1.8" strokeDasharray="2 2" strokeLinecap="round" />
    <line x1="12" y1="22" x2="24" y2="22" stroke="#FAF4ED" strokeWidth="1.8" strokeDasharray="2 2" strokeLinecap="round" />
    <rect x="13" y="24" width="10" height="5" rx="1.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.5" />
    <circle cx="18" cy="26.5" r="1.5" fill="#8C582B" />
  </svg>
);

const DesiAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  { id: '1', nameEn: 'Chakki Atta', nameUr: 'چکی آٹا', ratePerKg: 140, unit: 'KG', isActive: true },
  { id: '2', nameEn: 'Fine Atta', nameUr: 'فائن آٹا', ratePerKg: 148, unit: 'KG', isActive: true },
  { id: '3', nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', ratePerKg: 155, unit: 'KG', isActive: true },
  { id: '4', nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', ratePerKg: 160, unit: 'KG', isActive: true },
  { id: '5', nameEn: 'Chokar / Bran', nameUr: 'چوکر', ratePerKg: 95, unit: 'KG', isActive: true },
  { id: '6', nameEn: 'Desi Atta', nameUr: 'دیسی گندم آٹا', ratePerKg: 145, unit: 'KG', isActive: true },
  { id: '7', nameEn: 'Barley Flour / Jau Atta', nameUr: 'جو کا آٹا', ratePerKg: 205, unit: 'KG', isActive: true },
  { id: '8', nameEn: 'Unpriced Special Atta', nameUr: 'بغیر ریٹ آٹا', ratePerKg: 0, unit: 'KG', isActive: true },
  { id: '9', nameEn: 'Barley Flour / Jau Atta', nameUr: 'جو کا آٹا', ratePerKg: 205, unit: 'KG', isActive: true },
  { id: '10', nameEn: 'Unpriced Special Atta', nameUr: 'بغیر ریٹ آٹا', ratePerKg: 0, unit: 'KG', isActive: true },
  { id: '11', nameEn: 'Barley Flour / Jau Atta', nameUr: 'جو کا آٹا', ratePerKg: 205, unit: 'KG', isActive: true },
  { id: '12', nameEn: 'Unpriced Special Atta', nameUr: 'بغیر ریٹ آٹا', ratePerKg: 0, unit: 'KG', isActive: true },
];

const MOCK_CUSTOMERS = [
  { id: '1', name: 'حاجی رشید', phone: '0300-8765432' },
  { id: '2', name: 'حاجی الطاف', phone: '0301-7654321' },
  { id: '3', name: 'Haji Mushtaq', phone: '0302-3344556' },
  { id: '4', name: 'طارق نان بائی', phone: '0321-9876543' },
  { id: '5', name: 'میاں اسلم', phone: '0333-1122334' },
  { id: '6', name: 'Babar Hotel', phone: '0345-5566778' },
  { id: '7', name: 'حاجی آصف', phone: '0300-9988776' },
];

const PRODUCT_THEMES: Record<string, {
  bg: string;
  bgSelected: string;
  text: string;
  subText: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
}> = {
  '1': {
    bg: '#FEF9E7',
    bgSelected: '#FDE68A',
    text: '#78350F',
    subText: '#92400E',
    accent: '#B45309',
    badgeBg: '#FEF08A',
    badgeText: '#78350F',
    iconBg: '#FFFFFF',
  },
  '2': {
    bg: '#F0F9FF',
    bgSelected: '#BAE6FD',
    text: '#0369A1',
    subText: '#0284C7',
    accent: '#0284C7',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    iconBg: '#FFFFFF',
  },
  '3': {
    bg: '#FDF2F8',
    bgSelected: '#FBCFE8',
    text: '#9D174D',
    subText: '#BE185D',
    accent: '#DB2777',
    badgeBg: '#FCE7F3',
    badgeText: '#9D174D',
    iconBg: '#FFFFFF',
  },
  '4': {
    bg: '#FFF7ED',
    bgSelected: '#FED7AA',
    text: '#9A3412',
    subText: '#C2410C',
    accent: '#EA580C',
    badgeBg: '#FFEDD5',
    badgeText: '#9A3412',
    iconBg: '#FFFFFF',
  },
  '5': {
    bg: '#F5F5F4',
    bgSelected: '#E7E5E4',
    text: '#44403C',
    subText: '#57534E',
    accent: '#78716C',
    badgeBg: '#E7E5E4',
    badgeText: '#44403C',
    iconBg: '#FFFFFF',
  },
  '6': {
    bg: '#FAF5EC',
    bgSelected: '#EFE3CF',
    text: '#713F12',
    subText: '#854D0E',
    accent: '#92400E',
    badgeBg: '#F3E8D3',
    badgeText: '#713F12',
    iconBg: '#FFFFFF',
  },
};

export interface BillItem {
  id: string;
  productId?: string;
  itemName: string;
  quantity: string;
  ratePerKg: number;
}

export const ProductBillingScreen: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Load products dynamically from backend API
  useEffect(() => {
    fetch('http://localhost:5000/api/products?active=true')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.products && json.data.products.length > 0) {
          const mapped: Product[] = json.data.products.map((p: any) => ({
            id: p.id,
            nameEn: p.nameEn,
            nameUr: p.nameUr,
            ratePerKg: p.currentRate,
            unit: p.unit || 'KG',
            isActive: p.isActive,
          }));
          setProducts(mapped);
          setBillItems((prev) =>
            prev.map((item) => {
              const matched =
                mapped.find(
                  (p) =>
                    p.id === item.productId ||
                    p.nameEn.toLowerCase() === item.itemName.toLowerCase() ||
                    p.nameUr === item.itemName
                ) || mapped[0];
              return {
                ...item,
                productId: matched.id,
                ratePerKg: matched.ratePerKg,
              };
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  const session = getSession();
  const canDiscount = !!(session?.permissions?.includes('can_discount') || session?.role === 'SuperAdmin');

  // Multi-item rows state
  const [billItems, setBillItems] = useState<BillItem[]>([
    {
      id: 'item-1',
      productId: INITIAL_PRODUCTS[0].id,
      itemName: isUrdu ? INITIAL_PRODUCTS[0].nameUr : INITIAL_PRODUCTS[0].nameEn,
      quantity: '10',
      ratePerKg: INITIAL_PRODUCTS[0].ratePerKg,
    },
  ]);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [openSuggestionsRow, setOpenSuggestionsRow] = useState<number | null>(null);

  const [discountValue, setDiscountValue] = useState<string>('0');
  const [showDiscount, setShowDiscount] = useState<boolean>(false);
  const [receivedAmount, setReceivedAmount] = useState<string>('1400');
  const [isReceivedAutoUpdated, setIsReceivedAutoUpdated] = useState<boolean>(true);

  // Customer State & Autocomplete
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedCustomerCredit, setSelectedCustomerCredit] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Hover & Tactile States
  const [hoveredBtn, setHoveredBtn] = useState<'cash' | 'credit' | null>(null);
  const [pressedBtn, setPressedBtn] = useState<'cash' | 'credit' | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isSubmittingBill, setIsSubmittingBill] = useState<boolean>(false);

  // Dynamic Input Refs for Navigation
  const itemInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const quantityInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const receivedInputRef = useRef<HTMLInputElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const customerPhoneInputRef = useRef<HTMLInputElement>(null);

  // Rate guard check (BILL-04)
  const unpricedItems = billItems.filter(
    (item) => (parseFloat(item.quantity) || 0) > 0 && (!item.ratePerKg || item.ratePerKg <= 0)
  );
  const hasRateNotSetError = unpricedItems.length > 0;

  // Calculations across all multi-item rows
  const subtotal = billItems.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    return acc + Math.round(qty * item.ratePerKg);
  }, 0);

  const totalWeight = billItems.reduce((acc, item) => {
    return acc + (parseFloat(item.quantity) || 0);
  }, 0);

  const numDiscount = parseFloat(discountValue) || 0;
  const netTotal = Math.max(0, subtotal - numDiscount);

  // Auto-sync received money with net total when items/rate changes
  useEffect(() => {
    if (isReceivedAutoUpdated) {
      setReceivedAmount(String(netTotal));
    }
  }, [netTotal, isReceivedAutoUpdated]);

  const numReceived = parseFloat(receivedAmount) || 0;
  const balanceRemaining = Math.max(0, netTotal - numReceived);
  const changeToReturn = Math.max(0, numReceived - netTotal);

  // Focus initial item or quantity on mount
  useEffect(() => {
    if (quantityInputRefs.current[0]) {
      quantityInputRefs.current[0]?.focus();
      quantityInputRefs.current[0]?.select();
    }
  }, []);

  // When user taps on a product card at the top
  const handleCardClick = (p: Product) => {
    const targetIdx =
      activeRowIndex >= 0 && activeRowIndex < billItems.length
        ? activeRowIndex
        : billItems.length - 1;

    setBillItems((prev) => {
      const updated = [...prev];
      updated[targetIdx] = {
        ...updated[targetIdx],
        productId: p.id,
        itemName: isUrdu ? p.nameUr : p.nameEn,
        ratePerKg: p.ratePerKg,
      };
      return updated;
    });

    setIsReceivedAutoUpdated(true);

    // Automatically focus the quantity input of the targeted row
    setTimeout(() => {
      quantityInputRefs.current[targetIdx]?.focus();
      quantityInputRefs.current[targetIdx]?.select();
    }, 50);
  };

  // When user types in the Item input
  const handleItemNameChange = (val: string, index: number) => {
    const matched = products.find(
      (p) =>
        p.nameEn.toLowerCase() === val.trim().toLowerCase() ||
        p.nameUr.toLowerCase() === val.trim().toLowerCase()
    );

    setBillItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        itemName: val,
        productId: matched ? matched.id : updated[index].productId,
        ratePerKg: matched ? matched.ratePerKg : updated[index].ratePerKg,
      };
      return updated;
    });

    if (val.trim().length > 0) {
      setOpenSuggestionsRow(index);
    } else {
      setOpenSuggestionsRow(null);
    }
  };

  // Select item from inline autocomplete dropdown
  const handleSelectProduct = (p: Product, index: number) => {
    setBillItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: p.id,
        itemName: isUrdu ? p.nameUr : p.nameEn,
        ratePerKg: p.ratePerKg,
      };
      return updated;
    });
    setOpenSuggestionsRow(null);
    setIsReceivedAutoUpdated(true);

    setTimeout(() => {
      quantityInputRefs.current[index]?.focus();
      quantityInputRefs.current[index]?.select();
    }, 50);
  };

  // Enter key navigation on Item input
  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setOpenSuggestionsRow(null);
      const currentItem = billItems[index];

      // If user did NOT fill the item input -> take to receiving payment input!
      if (!currentItem || currentItem.itemName.trim() === '') {
        receivedInputRef.current?.focus();
        receivedInputRef.current?.select();
      } else {
        // If filled -> move to quantity input of this row
        quantityInputRefs.current[index]?.focus();
        quantityInputRefs.current[index]?.select();
      }
    }
  };

  // Enter key navigation on Quantity input
  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // When press enter create a new row for new product!
      const nextIdx = billItems.length;
      const newRow: BillItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: '',
        itemName: '',
        quantity: '',
        ratePerKg: 0,
      };

      setBillItems((prev) => [...prev, newRow]);
      setActiveRowIndex(nextIdx);

      setTimeout(() => {
        itemInputRefs.current[nextIdx]?.focus();
      }, 50);
    }
  };

  // Add new empty item row manually
  const handleAddNewRow = () => {
    const nextIdx = billItems.length;
    const newRow: BillItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: '',
      itemName: '',
      quantity: '',
      ratePerKg: 0,
    };
    setBillItems((prev) => [...prev, newRow]);
    setActiveRowIndex(nextIdx);
    setTimeout(() => {
      itemInputRefs.current[nextIdx]?.focus();
    }, 50);
  };

  // Remove a row
  const handleRemoveRow = (index: number) => {
    if (billItems.length <= 1) {
      setBillItems([
        {
          id: `item-${Date.now()}`,
          productId: '',
          itemName: '',
          quantity: '',
          ratePerKg: 0,
        },
      ]);
      setActiveRowIndex(0);
      setTimeout(() => itemInputRefs.current[0]?.focus(), 50);
      return;
    }
    setBillItems((prev) => prev.filter((_, i) => i !== index));
    const newActive = Math.max(0, Math.min(activeRowIndex, billItems.length - 2));
    setActiveRowIndex(newActive);
  };

  // Customer name autocomplete suggestions (Live API with fallback)
  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    setSelectedCustomerCredit(null);
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

  const handleSelectCustomer = (cust: { name: string; phone?: string | null; currentBalance?: number }) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone || '');
    setSelectedCustomerCredit(cust.currentBalance ?? null);
    setShowSuggestions(false);
    customerPhoneInputRef.current?.focus();
  };

  // Submit Handler (Atomic Sequence, Rate Guard, Discount Guard via /api/bills)
  const handleFinalSubmit = async (forcedCredit?: boolean) => {
    // 1. Rate Guard Check (BILL-04)
    if (hasRateNotSetError) {
      const badItem = unpricedItems[0];
      alert(
        isUrdu
          ? `ریٹ مقرر نہیں: "${badItem.itemName}" کا ریٹ صفر یا غیر معین ہے۔ برائے مہربانی پہلے ریٹ مقرر کریں۔`
          : `Rate not set for "${badItem.itemName}". Bill creation is blocked until rate is set.`
      );
      return;
    }

    const validRows = billItems.filter(
      (item) => (parseFloat(item.quantity) || 0) > 0 && item.ratePerKg > 0
    );

    if (validRows.length === 0) {
      alert(
        isUrdu
          ? 'برائے مہربانی کم از کم ایک آئٹم اور مقدار درج کریں۔'
          : 'Please enter at least one item with a valid quantity.'
      );
      itemInputRefs.current[0]?.focus();
      return;
    }

    // 2. Discount Guard Check (BILL-02)
    if (numDiscount > 0 && !canDiscount) {
      alert(
        isUrdu
          ? 'آپ کو رعایت دینے کا اختیار حاصل نہیں ہے۔ ایڈمن سے رجوع کریں۔'
          : 'You do not have permission to apply discounts (can_discount required).'
      );
      return;
    }

    const hasCustomerDetails = customerName.trim().length > 0;
    const isCreditSale = forcedCredit !== undefined ? forcedCredit : (hasCustomerDetails || balanceRemaining > 0);
    const sess = getSession();

    setIsSubmittingBill(true);

    try {
      // Ensure we have a valid signed backend JWT token
      let token = await ensureValidToken(sess);

      const payload = {
        calculationMode: 'WEIGHT_TO_AMOUNT',
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        items: validRows.map((r) => {
          const matched =
            products.find(
              (p) =>
                p.id === r.productId ||
                p.nameEn.toLowerCase() === r.itemName.toLowerCase() ||
                p.nameUr === r.itemName
            ) || products[0];
          return {
            productId: matched ? matched.id : r.productId,
            quantityKg: parseFloat(r.quantity) || 0,
            totalAmount: Math.round((parseFloat(r.quantity) || 0) * r.ratePerKg),
          };
        }),
        discount: numDiscount,
        receivedAmount: isCreditSale ? (numReceived > 0 && numReceived < netTotal ? numReceived : 0) : numReceived,
        paymentMethod: isCreditSale ? 'CREDIT' : 'CASH',
      };

      let res = await fetch('http://localhost:5000/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      // If token expired or was rejected, retry once with a fresh token
      if (res.status === 401) {
        token = await ensureValidToken(sess);
        if (token) {
          res = await fetch('http://localhost:5000/api/bills', {
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
        alert(json.error?.message || 'Error creating bill');
        return;
      }

      const createdBill = json.data.bill;
      const customerLedger = json.data.customerLedger || createdBill.customerLedger;
      const shortDiscount = json.data.shortDiscount ?? createdBill.shortDiscount ?? 0;
      sound.playSuccessChime();
      const billNumberFormatted = String(createdBill.billNumber).padStart(6, '0');

      const receiptItems = validRows.map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const qty = parseFloat(it.quantity) || 0;
        return {
          nameEn: prod ? prod.nameEn : it.itemName,
          nameUr: prod ? prod.nameUr : it.itemName,
          weightKg: qty,
          ratePerKg: it.ratePerKg,
          total: Math.round(qty * it.ratePerKg),
        };
      });

      const receipt: ReceiptData = {
        type: 'product',
        billNumber: billNumberFormatted,
        timestamp: new Date(createdBill.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true }),
        billerName: createdBill.biller?.fullName || sess?.fullName || (isUrdu ? 'محمد عاصف (کاؤنٹر 01)' : 'Muhammad Asif'),
        customerName: createdBill.customerName || undefined,
        isCredit: createdBill.paymentMethod === 'CREDIT',
        items: receiptItems,
        subtotal: createdBill.subtotal,
        discount: createdBill.discount,
        shortDiscount: shortDiscount,
        netTotal: createdBill.netTotal,
        cashReceived: createdBill.receivedAmount,
        remainingBalance: createdBill.paymentMethod === 'CREDIT' ? (customerLedger?.creditAdded ?? createdBill.netTotal) : 0,
        prevBalance: customerLedger?.prevBalance ?? (selectedCustomerCredit || 0),
        creditAdded: customerLedger?.creditAdded ?? (createdBill.paymentMethod === 'CREDIT' ? (createdBill.netTotal - (createdBill.receivedAmount || 0)) : 0),
        newBalance: customerLedger?.newTotalBalance ?? ((customerLedger?.prevBalance ?? (selectedCustomerCredit || 0)) + (customerLedger?.creditAdded ?? (createdBill.paymentMethod === 'CREDIT' ? (createdBill.netTotal - (createdBill.receivedAmount || 0)) : 0))),
      };

      setReceiptData(receipt);
      setIsReceiptOpen(true);
    } catch (err: any) {
      sound.playWarningSound();
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // Current active product for styling cues
  const currentActiveItem = billItems[activeRowIndex] || billItems[0];
  const activeProduct = products.find((p) => p.id === currentActiveItem?.productId) || products[0];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP: Product Action Cards with Tap-To-Fill Support */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
          gap: '12px',
          width: '100%',
        }}
      >
        {products.map((p) => {
          const isSelected = billItems.some((it) => it.productId === p.id);
          const isRateSet = p.ratePerKg > 0;
          const theme = PRODUCT_THEMES[p.id] || {
            bg: '#F8FAFC',
            bgSelected: '#EFF6FF',
            text: '#0F172A',
            subText: '#64748B',
            accent: '#1877F2',
            badgeBg: '#F1F5F9',
            badgeText: '#0F172A',
            iconBg: '#FFFFFF',
          };

          return (
            <div
              key={p.id}
              onClick={() => handleCardClick(p)}
              onMouseEnter={() => setHoveredProduct(p.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="touch-active"
              title={t('اس پروڈکٹ کو بل میں شامل کرنے کے لیے کلک کریں', 'Click to add this product to bill')}
              style={{
                padding: '14px 14px 12px 14px',
                borderRadius: '16px',
                backgroundColor: isSelected ? theme.bgSelected : theme.bg,
                border: 'none',
                boxShadow: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '102px',
                transition: 'background-color 0.15s ease',
                position: 'relative',
              }}
            >
              {/* Top Row: Squircle SVG Icon Tile + Rate Pill Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '13px',
                    backgroundColor: theme.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none',
                    border: 'none',
                    flexShrink: 0,
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
                      color: isSelected ? theme.text : theme.badgeText,
                      backgroundColor: isSelected ? '#FFFFFF' : theme.badgeBg,
                      padding: '3px 8px',
                      borderRadius: '7px',
                      direction: 'ltr',
                      boxShadow: 'none',
                      border: 'none',
                    }}
                  >
                    {isRateSet ? (isUrdu ? `${p.ratePerKg} روپے` : `Rs ${p.ratePerKg}`) : (isUrdu ? 'غیر مقرر' : 'Unset')}
                  </span>

                  {isSelected && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: theme.accent,
                        fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                        lineHeight: 1,
                      }}
                    >
                      {isUrdu ? '● منتخب' : '● In Bill'}
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Product Name */}
              <div
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: theme.text,
                  lineHeight: 1.25,
                  textAlign: 'left',
                  marginTop: '12px',
                  textShadow: 'none',
                  letterSpacing: '-0.01em',
                }}
              >
                {isUrdu ? p.nameUr : p.nameEn}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. 2-COLUMN BALANCED BILLING GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 1.45fr) minmax(300px, 1fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Dynamic Multi-Item Entry Card */}
        <div
          className="dash-card-animated"
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: 'none',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'none',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🛒</span>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '17px',
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {t('مصنوعات کی تفصیل اور مقدار', 'Items & Quantities')}
              </h2>
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#1877F2',
                backgroundColor: '#EFF6FF',
                padding: '3px 10px',
                borderRadius: '6px',
              }}
            >
              {billItems.length} {t('آئٹمز', 'Items')}
            </span>
          </div>

          {/* DYNAMIC MULTI-ITEM ROWS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {billItems.map((item, idx) => {
              const rowQty = parseFloat(item.quantity) || 0;
              const rowSubtotal = Math.round(rowQty * item.ratePerKg);
              const isRowActive = activeRowIndex === idx;

              // Filter product autocomplete matches
              const matchingProducts = products.filter(
                (p) =>
                  p.nameEn.toLowerCase().includes(item.itemName.toLowerCase()) ||
                  p.nameUr.includes(item.itemName)
              );

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: isRowActive ? '#FFFFFF' : '#F1F5F9',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    border: isRowActive ? '1.5px solid #1877F2' : '1.5px solid transparent',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative',
                  }}
                >
                  {/* Row Top Status Pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>
                      #{idx + 1} {isRowActive && <span style={{ color: '#1877F2' }}>● {t('فعال قطار', 'Active Row')}</span>}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.ratePerKg > 0 && (
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 800,
                            color: '#0E8A54',
                            backgroundColor: '#ECFDF5',
                            padding: '2px 8px',
                            borderRadius: '5px',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {rowQty > 0
                            ? isUrdu
                              ? `${rowSubtotal.toLocaleString()} روپے (${item.ratePerKg} روپے/کلو)`
                              : `Rs ${rowSubtotal.toLocaleString()} (@ Rs ${item.ratePerKg})`
                            : isUrdu
                            ? `@ ${item.ratePerKg} روپے / کلو`
                            : `@ Rs ${item.ratePerKg} / KG`}
                        </span>
                      )}

                      {billItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="touch-active"
                          title={t('قطار حذف کریں', 'Remove Row')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Two Inputs in Single Row: ITEM & QUANTITY */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 1fr',
                      gap: '10px',
                      alignItems: 'end',
                    }}
                  >
                    {/* Input 1: Item */}
                    <div style={{ position: 'relative' }}>
                      <label
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#475569',
                          marginBottom: '4px',
                        }}
                      >
                        {t('آئٹم:', 'Item:')}
                      </label>
                      <input
                        ref={(el) => {
                          itemInputRefs.current[idx] = el;
                        }}
                        type="text"
                        placeholder={t('کارڈ ٹیپ کریں یا نام لکھیں...', 'Tap card or type name...')}
                        value={item.itemName}
                        onFocus={() => {
                          setActiveRowIndex(idx);
                        }}
                        onChange={(e) => handleItemNameChange(e.target.value, idx)}
                        onKeyDown={(e) => handleItemKeyDown(e, idx)}
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          padding: '0 12px',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#0F172A',
                          outline: 'none',
                          boxShadow: 'none',
                        }}
                      />

                      {/* Dropdown Suggestions */}
                      {openSuggestionsRow === idx && matchingProducts.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            zIndex: 30,
                            maxHeight: '160px',
                            overflowY: 'auto',
                            marginTop: '4px',
                          }}
                        >
                          {matchingProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleSelectProduct(p, idx)}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #F1F5F9',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                            >
                              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800 }}>
                                {isUrdu ? p.nameUr : p.nameEn}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1877F2', fontFamily: 'var(--font-mono)' }}>
                                {isUrdu ? `${p.ratePerKg} روپے` : `Rs ${p.ratePerKg}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input 2: Quantity */}
                    <div style={{ position: 'relative' }}>
                      <label
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#475569',
                          marginBottom: '4px',
                        }}
                      >
                        {t('مقدار (کلو):', 'Quantity (KG):')}
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          ref={(el) => {
                            quantityInputRefs.current[idx] = el;
                          }}
                          type="number"
                          step="any"
                          placeholder="10"
                          value={item.quantity}
                          onFocus={() => {
                            setActiveRowIndex(idx);
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBillItems((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], quantity: val };
                              return updated;
                            });
                            setIsReceivedAutoUpdated(true);
                          }}
                          onKeyDown={(e) => handleQuantityKeyDown(e, idx)}
                          onWheel={(e) => (e.target as HTMLElement).blur()}
                          style={{
                            width: '100%',
                            height: '44px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            fontSize: '18px',
                            fontWeight: 900,
                            fontFamily: 'var(--font-mono)',
                            color: '#0F172A',
                            padding: '0 40px 0 12px',
                            direction: 'ltr',
                            unicodeBidi: 'isolate',
                            outline: 'none',
                            boxShadow: 'none',
                          }}
                        />
                        <span
                          className={isUrdu ? 'font-nastaleeq' : ''}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#64748B',
                          }}
                        >
                          {t('کلو', 'KG')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Row Button */}
          <button
            type="button"
            onClick={handleAddNewRow}
            className="touch-active"
            style={{
              padding: '10px 16px',
              borderRadius: '9px',
              border: '1.5px dashed #94A3B8',
              backgroundColor: '#FFFFFF',
              color: '#1877F2',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              outline: 'none',
            }}
          >
            <Plus size={16} />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('+ مزید آئٹم شامل کریں (Enter)', '+ Add Another Item (Enter)')}
            </span>
          </button>

          {/* Cash Received Row */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>
                {t('وصول رقم:', 'Received Amount:')}
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
                  border: 'none',
                  color: '#0E8A54',
                  borderRadius: '7px',
                  padding: '3px 10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: 'none',
                  outline: 'none',
                }}
              >
                <Check size={13} strokeWidth={2.5} />
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
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#0F172A',
                  padding: '0 48px 0 14px',
                  direction: 'ltr',
                  unicodeBidi: 'isolate',
                  outline: 'none',
                  boxShadow: 'none',
                }}
              />
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  position: 'absolute',
                  right: '12px',
                  fontSize: '12.5px',
                  fontWeight: 900,
                  color: '#1877F2',
                  backgroundColor: '#EFF6FF',
                  padding: '2px 8px',
                  borderRadius: '5px',
                }}
              >
                {t('روپے', 'Rs')}
              </span>
            </div>
          </div>

          {/* Customer Name */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>
                {t('گاہک کا نام (اختیاری):', 'Customer Name (Optional):')}
              </span>
              {balanceRemaining > 0 && (
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', color: '#DC2626', fontWeight: 800 }}>
                  {t('* ادھار کے لیے نام ضروری ہے', '* Name is required for credit')}
                </span>
              )}
            </div>

            <input
              ref={customerNameInputRef}
              type="text"
              placeholder={t('گاہک کا نام لکھیں یا خالی چھوڑ کر Enter دبائیں...', 'Enter customer name or press Enter if empty...')}
              value={customerName}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // If empty take to save and print (or directly save & print)
                  handleFinalSubmit(false);
                }
              }}
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                padding: '0 12px',
                fontSize: '14px',
                outline: 'none',
                boxShadow: 'none',
                textAlign: 'left',
                color: '#0F172A',
              }}
            />

            {/* Selected Customer Previous Balance Badge */}
            {selectedCustomerCredit !== null && (
              <div
                style={{
                  marginTop: '6px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: selectedCustomerCredit > 0 ? '#FEF2F2' : '#F0FDF4',
                  border: `1px solid ${selectedCustomerCredit > 0 ? '#FCA5A5' : '#86EFAC'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: selectedCustomerCredit > 0 ? '#991B1B' : '#166534' }}>
                  {t('سابقہ واجب الادا ادھار:', 'Previous Customer Credit:')}
                </span>
                <span style={{ color: selectedCustomerCredit > 0 ? '#DC2626' : '#16A34A', fontSize: '13px' }}>
                  {isUrdu ? `${selectedCustomerCredit.toLocaleString()} روپے` : `Rs ${selectedCustomerCredit.toLocaleString()}`}
                </span>
              </div>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 0,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  zIndex: 20,
                  maxHeight: '160px',
                  overflowY: 'auto',
                  marginTop: '4px',
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
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div>
                      <span className="font-nastaleeq" style={{ fontWeight: 800, color: '#0F172A' }}>
                        {c.name}
                      </span>
                      {c.phone && (
                        <span style={{ color: '#64748B', fontSize: '11px', marginLeft: '6px' }}>
                          ({c.phone})
                        </span>
                      )}
                    </div>
                    {c.currentBalance !== undefined && c.currentBalance > 0 && (
                      <span
                        style={{
                          color: '#DC2626',
                          backgroundColor: '#FEE2E2',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        {isUrdu ? `${c.currentBalance.toLocaleString()} ادھار` : `Rs ${c.currentBalance.toLocaleString()} Due`}
                      </span>
                    )}
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
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: 'none',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('کل رقم', 'Total Amount')}
              </span>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#B45309',
                  backgroundColor: '#FFFBEB',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  border: 'none',
                }}
              >
                {isUrdu
                  ? `${totalWeight} کلو • ${billItems.length} آئٹم`
                  : `${totalWeight} KG • ${billItems.length} Items`}
              </span>
            </div>

            {/* Large Grand Total Display */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 900,
                fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                color: '#0F172A',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}
            >
              {isUrdu ? `${netTotal.toLocaleString()} روپے` : `Rs ${netTotal.toLocaleString()}`}
            </div>

            {/* Items Summary Breakdown List */}
            {billItems.filter((it) => (parseFloat(it.quantity) || 0) > 0).length > 0 && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                }}
              >
                {billItems
                  .filter((it) => (parseFloat(it.quantity) || 0) > 0)
                  .map((it, i) => {
                    const q = parseFloat(it.quantity) || 0;
                    const tot = Math.round(q * it.ratePerKg);
                    return (
                      <div
                        key={it.id || i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px',
                          borderBottom: i < billItems.length - 1 ? '1px solid #F1F5F9' : 'none',
                          paddingBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 800, color: '#0F172A' }}>
                          {it.itemName || t('آئٹم', 'Item')}
                        </span>
                        <span style={{ color: '#64748B', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {q} {t('کلو', 'KG')} x {it.ratePerKg} ={' '}
                          <strong style={{ color: '#0F172A' }}>Rs {tot.toLocaleString()}</strong>
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Balance or Return Status */}
            {balanceRemaining > 0 ? (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: '12px', fontWeight: 800, color: '#B91C1C' }}
                >
                  {t('باقی ادھار:', 'Credit Balance:')}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#B91C1C', fontFamily: 'var(--font-mono)' }}>
                  {isUrdu ? `${balanceRemaining.toLocaleString()} روپے` : `Rs ${balanceRemaining.toLocaleString()}`}
                </span>
              </div>
            ) : changeToReturn > 0 ? (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: '12px', fontWeight: 800, color: '#0E8A54' }}
                >
                  {t('گاہک کو واپسی:', 'Change Due:')}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#0E8A54', fontFamily: 'var(--font-mono)' }}>
                  {isUrdu ? `${changeToReturn.toLocaleString()} روپے` : `Rs ${changeToReturn.toLocaleString()}`}
                </span>
              </div>
            ) : null}

            {/* Discount Option Toggle (RBAC Guard BILL-02) */}
            <div style={{ borderTop: 'none', paddingTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  if (!canDiscount) {
                    alert(t('آپ کو رعایت دینے کا اختیار حاصل نہیں ہے۔ (can_discount درکار ہے)', 'You do not have permission to apply discounts. (can_discount required)'));
                    return;
                  }
                  setShowDiscount(!showDiscount);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: canDiscount ? '#64748B' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: canDiscount ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {canDiscount ? <Tag size={13} /> : <Lock size={13} color="#DC2626" />}
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {canDiscount
                    ? t('رعایت شامل کریں', 'Add Discount')
                    : t('رعایت (اختیار نہیں ہے)', 'Discount (Locked - No Permission)')}
                </span>
              </button>

              {canDiscount && showDiscount && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder={t('رعایت رقم', 'Discount')}
                    value={discountValue}
                    onChange={(e) => {
                      setDiscountValue(e.target.value);
                      setIsReceivedAutoUpdated(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                      }
                    }}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    style={{
                      width: '90px',
                      height: '36px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                  <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', color: '#64748B', fontWeight: 800 }}>
                    {t('روپے', 'Rs')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Rate Guard Alert Banner (BILL-04) */}
          {hasRateNotSetError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #F87171',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertTriangle size={20} color="#DC2626" />
              <div>
                <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 900, color: '#991B1B' }}>
                  {t('انتباہ: ریٹ مقرر نہیں (Rate Not Set)', 'Warning: Rate Not Set')}
                </div>
                <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '11.5px', color: '#B91C1C' }}>
                  {t('آئٹم کا ریٹ صفر ہے۔ ریٹ مقرر کیے بغیر بل تیار نہیں ہو سکتا۔', 'Rate not set for selected item. Bill generation is blocked.')}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Button 1: Print Cash Bill */}
            <button
              type="button"
              onClick={() => handleFinalSubmit(false)}
              disabled={subtotal <= 0 || hasRateNotSetError || isSubmittingBill}
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
                height: '56px',
                borderRadius: '16px',
                background: subtotal <= 0 || hasRateNotSetError || isSubmittingBill ? '#94A3B8' : '#1877F2',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: 'none',
                outline: 'none',
                cursor: subtotal > 0 && !hasRateNotSetError && !isSubmittingBill ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 0 20px',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '11px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                <Printer size={22} color="#1877F2" strokeWidth={2.4} />
              </div>

              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('نقد بل پرنٹ کریں (Enter)', 'Print Cash Bill (Enter)')}
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
              disabled={subtotal <= 0 || hasRateNotSetError || isSubmittingBill}
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
                height: '52px',
                borderRadius: '16px',
                background: subtotal <= 0 || hasRateNotSetError || isSubmittingBill ? '#94A3B8' : '#0E8A54',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: 'none',
                outline: 'none',
                cursor: subtotal > 0 && !hasRateNotSetError && !isSubmittingBill ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 0 20px',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} color="#0E8A54" strokeWidth={2.4} />
              </div>

              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('ادھار کھاتہ میں محفوظ کریں', 'Save to Customer Ledger')}
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
          // Reset or keep focus
          if (quantityInputRefs.current[0]) {
            quantityInputRefs.current[0]?.focus();
            quantityInputRefs.current[0]?.select();
          }
        }}
        data={receiptData}
      />
    </div>
  );
};
