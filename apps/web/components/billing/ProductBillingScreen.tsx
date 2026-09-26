'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../ui/TouchCard';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Printer, Tag, Check, BookOpen, Plus, Trash2, X, AlertTriangle, Lock, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getSession, ensureValidToken, clearSession } from '../../lib/auth';
import { sound } from '../../lib/audioFeedback';
import { getApiBaseUrl } from '../../lib/api';

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

const renderProductIcon = (id: string, emoji?: string, fallbackIndex = 0) => {
  if (emoji) {
    return <span style={{ fontSize: '34px', lineHeight: 1, userSelect: 'none' }}>{emoji}</span>;
  }
  switch (id) {
    case '1': return <span style={{ fontSize: '34px', lineHeight: 1 }}>🌾</span>;
    case '2': return <span style={{ fontSize: '34px', lineHeight: 1 }}>🍚</span>;
    case '3': return <span style={{ fontSize: '34px', lineHeight: 1 }}>🥐</span>;
    case '4': return <span style={{ fontSize: '34px', lineHeight: 1 }}>🥣</span>;
    case '5': return <span style={{ fontSize: '34px', lineHeight: 1 }}>📦</span>;
    case '6': return <span style={{ fontSize: '34px', lineHeight: 1 }}>🚜</span>;
    case '7': return <span style={{ fontSize: '34px', lineHeight: 1 }}>🌱</span>;
    case '8': return <span style={{ fontSize: '34px', lineHeight: 1 }}>🏷️</span>;
    default: {
      const FALLBACK_EMOJIS = ['🌾', '🍚', '🥐', '🥣', '📦', '🚜', '🌱', '🏷️', '🌽', '🥜', '🥖', '🥯', '🍞', '🥞'];
      return <span style={{ fontSize: '34px', lineHeight: 1 }}>{FALLBACK_EMOJIS[fallbackIndex % FALLBACK_EMOJIS.length]}</span>;
    }
  }
};

export const getProductEmoji = (p: { nameUr?: string; nameEn?: string; id?: string; emoji?: string }, index = 0): string => {
  if (p.emoji && p.emoji.trim()) return p.emoji;
  const ur = (p.nameUr || '').toLowerCase();
  const en = (p.nameEn || '').toLowerCase();
  if (ur.includes('چکی') || en.includes('chakki')) return '🌾';
  if (ur.includes('فائن') || en.includes('fine')) return '🍚';
  if (ur.includes('میدہ') || en.includes('maida')) return '🥐';
  if (ur.includes('سوجی') || en.includes('suji') || en.includes('semolina')) return '🥣';
  if (ur.includes('چوکر') || en.includes('chokar') || en.includes('bran')) return '📦';
  if (ur.includes('دیسی') || en.includes('desi')) return '🚜';
  if (ur.includes('جو') || en.includes('barley') || en.includes('jau')) return '🌱';
  if (ur.includes('بیسن') || en.includes('besan') || en.includes('gram')) return '🟡';
  if (ur.includes('مکئی') || en.includes('corn') || en.includes('makai')) return '🌽';
  if (ur.includes('باجرہ') || en.includes('bajra')) return '🌾';
  if (ur.includes('بغیر ریٹ') || en.includes('unpriced') || ur.includes('اسپیشل')) return '🏷️';
  
  const FALLBACK_EMOJIS = ['🌾', '🍚', '🥐', '🥣', '📦', '🚜', '🌱', '🏷️', '🌽', '🥜', '🥖', '🥯', '🍞', '🥞', '🥟', '🧈', '🍯', '🌿'];
  return FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length];
};

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', nameEn: 'Chakki Atta', nameUr: 'چکی آٹا', ratePerKg: 140, unit: 'KG', isActive: true, emoji: '🌾' },
  { id: '2', nameEn: 'Fine Atta', nameUr: 'فائن آٹا', ratePerKg: 148, unit: 'KG', isActive: true, emoji: '🍚' },
  { id: '3', nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', ratePerKg: 155, unit: 'KG', isActive: true, emoji: '🥐' },
  { id: '4', nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', ratePerKg: 160, unit: 'KG', isActive: true, emoji: '🥣' },
  { id: '5', nameEn: 'Chokar / Bran', nameUr: 'چوکر', ratePerKg: 95, unit: 'KG', isActive: true, emoji: '📦' },
  { id: '6', nameEn: 'Desi Atta', nameUr: 'دیسی گندم آٹا', ratePerKg: 145, unit: 'KG', isActive: true, emoji: '🚜' },
  { id: '7', nameEn: 'Barley Flour / Jau Atta', nameUr: 'جو کا آٹا', ratePerKg: 205, unit: 'KG', isActive: true, emoji: '🌱' },
  { id: '8', nameEn: 'Unpriced Special Atta', nameUr: 'بغیر ریٹ آٹا', ratePerKg: 0, unit: 'KG', isActive: true, emoji: '🏷️' },
];

const MOCK_CUSTOMERS: Array<{ id: string; name: string; phone: string }> = [];

const CARD_PALETTES = [
  { bg: '#FFFBEB', bgSelected: '#FEF08A', text: '#78350F', subText: '#92400E', accent: '#B45309', badgeBg: '#FEF3C7', badgeText: '#78350F', iconBg: '#FFFFFF', border: '#FDE68A' },
  { bg: '#F0F9FF', bgSelected: '#BAE6FD', text: '#0369A1', subText: '#0284C7', accent: '#0284C7', badgeBg: '#E0F2FE', badgeText: '#0369A1', iconBg: '#FFFFFF', border: '#BAE6FD' },
  { bg: '#FDF2F8', bgSelected: '#FBCFE8', text: '#9D174D', subText: '#BE185D', accent: '#DB2777', badgeBg: '#FCE7F3', badgeText: '#9D174D', iconBg: '#FFFFFF', border: '#FBCFE8' },
  { bg: '#FFF7ED', bgSelected: '#FED7AA', text: '#9A3412', subText: '#C2410C', accent: '#EA580C', badgeBg: '#FFEDD5', badgeText: '#9A3412', iconBg: '#FFFFFF', border: '#FED7AA' },
  { bg: '#F8FAFC', bgSelected: '#E2E8F0', text: '#334155', subText: '#475569', accent: '#475569', badgeBg: '#F1F5F9', badgeText: '#334155', iconBg: '#FFFFFF', border: '#CBD5E1' },
  { bg: '#FAF5EC', bgSelected: '#EFE3CF', text: '#713F12', subText: '#854D0E', accent: '#92400E', badgeBg: '#F3E8D3', badgeText: '#713F12', iconBg: '#FFFFFF', border: '#E7D5BA' },
  { bg: '#F0FDF4', bgSelected: '#BBF7D0', text: '#166534', subText: '#15803D', accent: '#16A34A', badgeBg: '#DCFCE7', badgeText: '#166534', iconBg: '#FFFFFF', border: '#BBF7D0' },
  { bg: '#FAF5FF', bgSelected: '#E9D5FF', text: '#6B21A8', subText: '#7E22CE', accent: '#9333EA', badgeBg: '#F3E8FF', badgeText: '#6B21A8', iconBg: '#FFFFFF', border: '#E9D5FF' },
  { bg: '#FEFCE8', bgSelected: '#FEF08A', text: '#854D0E', subText: '#A16207', accent: '#CA8A04', badgeBg: '#FEF9C3', badgeText: '#854D0E', iconBg: '#FFFFFF', border: '#FEF08A' },
  { bg: '#ECFEFF', bgSelected: '#A5F3FC', text: '#155E75', subText: '#0E7490', accent: '#0891B2', badgeBg: '#CFFAFE', badgeText: '#155E75', iconBg: '#FFFFFF', border: '#A5F3FC' },
];

const DARK_CARD_PALETTES = [
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#FDE68A', subText: '#FCD34D', accent: '#F59E0B', badgeBg: '#0F172A', badgeText: '#FBBF24', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#7DD3FC', subText: '#38BDF8', accent: '#0EA5E9', badgeBg: '#0F172A', badgeText: '#38BDF8', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#F472B6', subText: '#EC4899', accent: '#DB2777', badgeBg: '#0F172A', badgeText: '#F472B6', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#FB923C', subText: '#F97316', accent: '#EA580C', badgeBg: '#0F172A', badgeText: '#FB923C', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#E2E8F0', subText: '#94A3B8', accent: '#64748B', badgeBg: '#0F172A', badgeText: '#E2E8F0', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#FDE047', subText: '#EAB308', accent: '#CA8A04', badgeBg: '#0F172A', badgeText: '#FDE047', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#4ADE80', subText: '#22C55E', accent: '#16A34A', badgeBg: '#0F172A', badgeText: '#4ADE80', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#C084FC', subText: '#A855F7', accent: '#9333EA', badgeBg: '#0F172A', badgeText: '#C084FC', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#FCD34D', subText: '#FBBF24', accent: '#D97706', badgeBg: '#0F172A', badgeText: '#FCD34D', iconBg: '#0B0F19', border: '#334155' },
  { bg: '#1E293B', bgSelected: '#1E3A8A', text: '#22D3EE', subText: '#06B6D4', accent: '#0891B2', badgeBg: '#0F172A', badgeText: '#22D3EE', iconBg: '#0B0F19', border: '#334155' },
];

const AVAILABLE_EMOJIS = [
  '🌾', '🍚', '🥐', '🥣', '📦', '🚜', '🌱', '🏷️',
  '🌽', '🥜', '🥖', '🥯', '🍞', '🥞', '🥟', '🧈',
  '🍯', '🌿', '🫓', '🍪', '🧇', '☕', '⭐', '💰'
];

const PRODUCTS_STORAGE_KEY = 'flour_erp_billing_custom_products_v3';

export interface BillItem {
  id: string;
  productId?: string;
  itemName: string;
  quantity: string;
  ratePerKg: number;
}

export interface ProductBillingScreenProps {
  initialProductId?: string;
}

export const ProductBillingScreen: React.FC<ProductBillingScreenProps> = ({
  initialProductId,
}) => {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useTheme();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productsSnapshot, setProductsSnapshot] = useState<Product[]>([]);
  const [isCustomizeMode, setIsCustomizeMode] = useState<boolean>(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState<boolean>(false);
  const [newCardForm, setNewCardForm] = useState<{
    nameUr: string;
    nameEn: string;
    ratePerKg: string;
    emoji: string;
  }>({
    nameUr: '',
    nameEn: '',
    ratePerKg: '',
    emoji: '🌾',
  });

  // Load custom products from localStorage or backend API
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          return;
        }
      }
    } catch {}

    fetch(`${getApiBaseUrl()}/api/products?active=true`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.products && json.data.products.length > 0) {
          const seen = new Set<string>();
          const mapped: Product[] = [];
          json.data.products.forEach((p: any, idx: number) => {
            const key = `${p.nameUr?.trim()}_${p.currentRate}`;
            if (!seen.has(key)) {
              seen.add(key);
              mapped.push({
                id: p.id,
                nameEn: p.nameEn,
                nameUr: p.nameUr,
                ratePerKg: p.currentRate,
                unit: p.unit || 'KG',
                isActive: p.isActive,
                emoji: getProductEmoji(p, idx),
              });
            }
          });
          setProducts(mapped);
          try {
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(mapped));
          } catch {}
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

  useEffect(() => {
    if (initialProductId && products.length > 0) {
      const match = products.find((p) => p.id === initialProductId);
      if (match) {
        setBillItems((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[0] = {
              ...updated[0],
              productId: match.id,
              itemName: isUrdu ? match.nameUr : match.nameEn,
              ratePerKg: match.ratePerKg,
            };
          }
          return updated;
        });
      }
    }
  }, [initialProductId, products, isUrdu]);
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
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number>(-1);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(-1);

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

  // Focus initial item or quantity on mount (desktop only, to keep mobile keyboard closed)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      if (quantityInputRefs.current[0]) {
        quantityInputRefs.current[0]?.focus();
        quantityInputRefs.current[0]?.select();
      }
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

    setOpenSuggestionsRow(null);
    setIsReceivedAutoUpdated(true);

    // Automatically focus the quantity input of the targeted row (desktop only)
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setTimeout(() => {
        quantityInputRefs.current[targetIdx]?.focus();
        quantityInputRefs.current[targetIdx]?.select();
      }, 50);
    }
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
      setSelectedProductIndex(0);
    } else {
      setOpenSuggestionsRow(null);
      setSelectedProductIndex(-1);
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
    setSelectedProductIndex(-1);
    setIsReceivedAutoUpdated(true);

    setTimeout(() => {
      quantityInputRefs.current[index]?.focus();
      quantityInputRefs.current[index]?.select();
    }, 50);
  };

  // Enter key & Arrow key navigation on Item input
  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const currentItem = billItems[index];
    const q = (currentItem?.itemName || '').toLowerCase().trim();
    const matchingProducts = products.filter(
      (p) => p.nameUr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q)
    );

    // Arrow navigation when dropdown is visible
    if (openSuggestionsRow === index && matchingProducts.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedProductIndex((prev) => (prev + 1) % matchingProducts.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedProductIndex((prev) => (prev <= 0 ? matchingProducts.length - 1 : prev - 1));
        return;
      }
      if (e.key === 'Enter') {
        if (selectedProductIndex >= 0 && selectedProductIndex < matchingProducts.length) {
          e.preventDefault();
          handleSelectProduct(matchingProducts[selectedProductIndex], index);
          setSelectedProductIndex(-1);
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpenSuggestionsRow(null);
        setSelectedProductIndex(-1);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      setOpenSuggestionsRow(null);

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

  // Custom Product Card Handlers (Add, Delete, Reset)
  const handleSaveNewProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCardForm.nameUr.trim()) {
      sound.playWarningSound();
      alert(isUrdu ? 'برائے مہربانی پروڈکٹ کا نام درج کریں' : 'Please enter product name');
      return;
    }

    const newProd: Product = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nameUr: newCardForm.nameUr.trim(),
      nameEn: newCardForm.nameEn.trim() || newCardForm.nameUr.trim(),
      ratePerKg: parseFloat(newCardForm.ratePerKg) || 0,
      unit: 'KG',
      isActive: true,
      emoji: newCardForm.emoji || '🌾',
    };

    const updated = [...products, newProd];
    setProducts(updated);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    sound.playSuccessSound();
    setIsAddCardModalOpen(false);
    setNewCardForm({ nameUr: '', nameEn: '', ratePerKg: '', emoji: '🌾' });
  };

  const handleEnterCustomizeMode = () => {
    setProductsSnapshot([...products]);
    setIsCustomizeMode(true);
  };

  const handleCancelCustomizeMode = () => {
    if (productsSnapshot && productsSnapshot.length > 0) {
      setProducts([...productsSnapshot]);
    }
    setIsCustomizeMode(false);
    sound.playWarningSound();
  };

  const handleSaveCustomizeMode = () => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch {}
    setIsCustomizeMode(false);
    sound.playSuccessSound();
  };

  const handleDeleteProduct = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (products.length <= 1) {
      sound.playWarningSound();
      alert(isUrdu ? 'کم از کم ایک پروڈکٹ کارڈ رہنا ضروری ہے' : 'At least one product card must remain');
      return;
    }

    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    sound.playWarningSound();
  };

  const handleResetProducts = () => {
    if (confirm(isUrdu ? 'کیا آپ تمام کارڈز کو اصل ڈیفالٹ حالت پر لانا چاہتے ہیں؟' : 'Reset all cards to default?')) {
      setProducts(INITIAL_PRODUCTS);
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      } catch {}
      setIsCustomizeMode(false);
      sound.playSuccessSound();
    }
  };

  // Customer name autocomplete suggestions (Live API with fallback)
  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    setSelectedCustomerCredit(null);
    setSelectedCustomerIndex(0);
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

  const handleSelectCustomer = (cust: { name: string; phone?: string | null; currentBalance?: number }) => {
    setCustomerName(cust.name);
    setCustomerPhone(cust.phone || '');
    setSelectedCustomerCredit(cust.currentBalance ?? null);
    setShowSuggestions(false);
    setSelectedCustomerIndex(-1);
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
        receivedAmount: numReceived || 0,
        paymentMethod: isCreditSale ? 'CREDIT' : 'CASH',
      };

      let createdBill: any = null;
      let customerLedger: any = null;
      let shortDiscount = 0;

      try {
        let res = await fetch(`${getApiBaseUrl()}/api/bills`, {
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
            res = await fetch(`${getApiBaseUrl()}/api/bills`, {
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
        if (json.success && json.data?.bill) {
          createdBill = json.data.bill;
          customerLedger = json.data.customerLedger || createdBill.customerLedger;
          shortDiscount = json.data.shortDiscount ?? createdBill.shortDiscount ?? 0;
        } else {
          sound.playWarningSound();
          alert(json.error?.message || 'Error creating bill');
          return;
        }
      } catch (networkErr: any) {
        // Fallback for offline mode, mobile browsers, or when backend API is not locally running
        console.warn('Backend API unavailable, generating offline bill receipt:', networkErr);
        const randomBillNum = Math.floor(100000 + Math.random() * 900000);
        createdBill = {
          billNumber: randomBillNum,
          createdAt: new Date().toISOString(),
          customerName: customerName.trim() || undefined,
          paymentMethod: isCreditSale ? 'CREDIT' : 'CASH',
          subtotal: subtotal,
          discount: numDiscount,
          shortDiscount: 0,
          netTotal: netTotal,
          receivedAmount: isCreditSale ? (numReceived > 0 && numReceived < netTotal ? numReceived : 0) : numReceived,
          biller: {
            fullName: sess?.fullName || (isUrdu ? 'محمد عاصف (کاؤنٹر 01)' : 'Muhammad Asif'),
          },
        };
        const prevBal = selectedCustomerCredit || 0;
        const credAdded = isCreditSale ? (netTotal - (numReceived || 0)) : 0;
        customerLedger = {
          prevBalance: prevBal,
          creditAdded: credAdded,
          newTotalBalance: prevBal + credAdded,
        };
      }

      if (!createdBill) return;

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
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // Current active product for styling cues
  const currentActiveItem = billItems[activeRowIndex] || billItems[0];
  const activeProduct = products.find((p) => p.id === currentActiveItem?.productId) || products[0];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP: Product Action Cards Header & Customization Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '2px 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🌾</span>
          <h3
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{
              margin: 0,
              fontSize: isUrdu ? '23px' : '16px',
              fontWeight: 900,
              color: '#0F172A',
            }}
          >
            {isUrdu ? 'سیلز پروڈکٹ کارڈز' : 'Sales Product Cards'}
          </h3>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#475569',
              backgroundColor: '#E2E8F0',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            {products.length}
          </span>
          {isCustomizeMode && (
            <span
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: isUrdu ? '15px' : '12px',
                fontWeight: 800,
                color: '#DC2626',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECACA',
                padding: '2px 10px',
                borderRadius: '8px',
              }}
            >
              {isUrdu ? '⚠️ کارڈ ختم کرنے کے لیے کارڈ کے اوپر سرخ ✕ بٹن دبائیں' : '⚠️ Click the red ✕ on card to delete'}
            </span>
          )}
        </div>

        {/* Buttons: Add Card & Delete Mode Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isCustomizeMode ? (
            <>
              {/* Add New Card Button */}
              <button
                type="button"
                onClick={() => setIsAddCardModalOpen(true)}
                className="touch-active"
                style={{
                  height: '42px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: isDark ? '#2563EB' : '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 2px 8px rgba(37, 99, 235, 0.35)' : '0 2px 8px rgba(15, 23, 42, 0.18)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '18px' : '13.5px',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {isUrdu ? 'نیا کارڈ شامل کریں' : 'Add New Card'}
                </span>
              </button>

              {/* Enter Delete Mode Button */}
              <button
                type="button"
                onClick={handleEnterCustomizeMode}
                className="touch-active"
                style={{
                  height: '42px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  color: isDark ? '#F87171' : '#DC2626',
                  border: isDark ? '1.5px solid #EF4444' : '1.5px solid #FECACA',
                  padding: '0 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#FEF2F2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#FFFFFF')}
              >
                <Trash2 size={17} strokeWidth={2.2} color={isDark ? '#F87171' : '#DC2626'} />
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '18px' : '13.5px',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {isUrdu ? 'کارڈز حذف کریں' : 'Delete Cards'}
                </span>
              </button>
            </>
          ) : (
            <>
              {/* 1. Save Changes Button */}
              <button
                type="button"
                onClick={handleSaveCustomizeMode}
                className="touch-active"
                style={{
                  height: '42px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: isDark ? '#16A34A' : '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0 18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 2px 8px rgba(22, 163, 74, 0.35)' : '0 2px 8px rgba(15, 23, 42, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Check size={18} strokeWidth={2.5} color="#FFFFFF" />
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '18px' : '13.5px',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Changes'}
                </span>
              </button>

              {/* 2. Cancel Button - Restores all deleted cards back to snapshot */}
              <button
                type="button"
                onClick={handleCancelCustomizeMode}
                title={isUrdu ? 'منسوخ کریں اور پرانے کارڈز بحال کریں' : 'Cancel and Revert'}
                className="touch-active"
                style={{
                  height: '42px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  color: isDark ? '#E2E8F0' : '#475569',
                  border: isDark ? '1.5px solid #475569' : '1.5px solid #CBD5E1',
                  padding: '0 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F1F5F9';
                  e.currentTarget.style.borderColor = isDark ? '#64748B' : '#94A3B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#FFFFFF';
                  e.currentTarget.style.borderColor = isDark ? '#475569' : '#CBD5E1';
                }}
              >
                <X size={16} strokeWidth={2.4} color={isDark ? '#E2E8F0' : '#64748B'} />
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '17px' : '13px',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                </span>
              </button>

              {/* 3. Reset to Defaults Button */}
              <button
                type="button"
                onClick={handleResetProducts}
                title={isUrdu ? 'تمام کارڈز اصل حالت پر بحال کریں' : 'Reset to original defaults'}
                className="touch-active"
                style={{
                  height: '42px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#94A3B8' : '#64748B',
                  border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
                  padding: '0 14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#FFFFFF';
                  e.currentTarget.style.borderColor = isDark ? '#475569' : '#CBD5E1';
                  e.currentTarget.style.color = isDark ? '#F8FAFC' : '#1E293B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#F8FAFC';
                  e.currentTarget.style.borderColor = isDark ? '#334155' : '#E2E8F0';
                  e.currentTarget.style.color = isDark ? '#94A3B8' : '#64748B';
                }}
              >
                <RotateCcw size={15} strokeWidth={2.2} />
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '16px' : '12px',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {isUrdu ? 'ڈیفالٹ بحال' : 'Reset'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid of Product Action Cards */}
      {/* Auto-Adjusting Responsive Grid of Product Action Cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%',
        }}
      >
        {products.map((p, idx) => {
          const isSelected = billItems.some((it) => it.productId === p.id);
          const isRateSet = p.ratePerKg > 0;
          const palettes = isDark ? DARK_CARD_PALETTES : CARD_PALETTES;
          const theme = palettes[idx % palettes.length];

          // Calculate ideal columns based on products count so rows are evenly balanced
          const idealCols = products.length <= 4 
            ? Math.max(1, products.length) 
            : products.length <= 6 
            ? 3 
            : products.length <= 8 
            ? 4 
            : products.length <= 10 
            ? 5 
            : 6;

          return (
            <div
              key={p.id}
              onClick={() => handleCardClick(p)}
              onMouseEnter={() => setHoveredProduct(p.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="touch-active product-action-tile"
              title={t('اس پروڈکٹ کو بل میں شامل کرنے کے لیے کلک کریں', 'Click to add this product to bill')}
              style={{
                flex: `1 1 calc(${Math.floor(100 / idealCols)}% - 12px)`,
                minWidth: '180px',
                padding: '8px 14px',
                borderRadius: '14px',
                backgroundColor: isSelected
                  ? (isDark ? '#1E3A8A' : theme.bgSelected)
                  : hoveredProduct === p.id
                  ? (isDark ? '#243046' : '#F8FAFC')
                  : (isDark ? '#1E293B' : theme.bg),
                border: isSelected
                  ? (isDark ? '2.5px solid #60A5FA' : `2.5px solid ${theme.accent}`)
                  : (isDark ? '1.5px solid #334155' : `1.5px solid ${theme.border}`),
                boxShadow: isSelected
                  ? '0 4px 12px rgba(0, 0, 0, 0.08)'
                  : hoveredProduct === p.id
                  ? '0 6px 14px rgba(0, 0, 0, 0.06)'
                  : '0 1px 3px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                minHeight: '80px',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hoveredProduct === p.id ? 'translateY(-2px)' : 'none',
                position: 'relative',
              }}
            >
              {/* Delete Button in Customize Mode */}
              {isCustomizeMode && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteProduct(p.id, e)}
                  title={isUrdu ? 'کارڈ حذف کریں' : 'Delete Card'}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: isUrdu ? '-8px' : 'auto',
                    right: isUrdu ? 'auto' : '-8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                    zIndex: 10,
                  }}
                >
                  ✕
                </button>
              )}

              {/* Left Column: Squircle Emoji Icon Tile + Rate Pill Badge Directly Underneath */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? '#0B0F19' : theme.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                    border: isDark ? '1px solid #334155' : `1px solid ${theme.border}`,
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                >
                  {renderProductIcon(p.id, p.emoji, idx)}
                </div>

                {/* Rate Badge - Directly Below Emoji */}
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontWeight: 900,
                    fontSize: isUrdu ? '17px' : '13px',
                    fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                    color: isSelected
                      ? (isDark ? '#FDE047' : '#FFFFFF')
                      : theme.badgeText,
                    backgroundColor: isSelected
                      ? (isDark ? '#1E3A8A' : theme.accent)
                      : (isDark ? '#0F172A' : theme.badgeBg),
                    padding: '2px 8px',
                    borderRadius: '7px',
                    direction: 'ltr',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    border: isDark ? '1px solid #334155' : `1px solid ${theme.border}`,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isRateSet ? (isUrdu ? `${p.ratePerKg} روپے/کلو` : `Rs ${p.ratePerKg}/kg`) : (isUrdu ? 'غیر مقرر' : 'Unset')}
                </span>
              </div>

              {/* Right Side: Product Name (Now much bigger & prominent!) + Selected Indicator */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: isUrdu ? 'flex-end' : 'flex-start',
                  minWidth: 0,
                }}
              >
                {isSelected && (
                  <span
                    className={isUrdu ? 'font-nastaleeq' : ''}
                    style={{
                      fontSize: isUrdu ? '14px' : '11px',
                      fontWeight: 900,
                      color: isDark ? '#60A5FA' : theme.accent,
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                      lineHeight: 1,
                      marginBottom: '2px',
                    }}
                  >
                    {isUrdu ? '● منتخب' : '● In Bill'}
                  </span>
                )}

                <div
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu
                      ? (p.nameUr && p.nameUr.length > 9 ? '30px' : '36px')
                      : (p.nameEn && p.nameEn.length > 12 ? '20px' : '23px'),
                    fontWeight: 900,
                    color: isSelected
                      ? (isDark ? '#FFFFFF' : theme.accent)
                      : theme.text,
                    lineHeight: 1.15,
                    textAlign: isUrdu ? 'right' : 'left',
                    letterSpacing: '0',
                    wordBreak: 'break-word',
                  }}
                >
                  {isUrdu ? p.nameUr : p.nameEn}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. 2-COLUMN BALANCED BILLING GRID (Responsive on Tablets & Mobile) */}
      <div className="product-billing-grid-split">
        {/* LEFT COLUMN: Dynamic Multi-Item Entry Card */}
        <div
          className="dash-card-animated"
          style={{
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderRadius: '16px',
            border: isDark ? '1px solid #334155' : 'none',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
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
              <span style={{ fontSize: '24px' }}>🛒</span>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '24px' : '18px',
                  fontWeight: 900,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  margin: 0,
                  lineHeight: 1.35,
                }}
              >
                {t('مصنوعات کی تفصیل اور مقدار', 'Items & Quantities')}
              </h2>
            </div>

            <span
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: isUrdu ? '16px' : '13px',
                fontWeight: 800,
                color: isDark ? '#60A5FA' : '#1877F2',
                backgroundColor: isDark ? '#0F172A' : '#EFF6FF',
                padding: '4px 12px',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : 'none',
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
                    backgroundColor: isRowActive
                      ? (isDark ? '#0F172A' : '#FFFFFF')
                      : (isDark ? '#162032' : '#F1F5F9'),
                    borderRadius: '14px',
                    padding: '14px 16px',
                    border: isRowActive
                      ? (isDark ? '2px solid #38BDF8' : '2px solid #1877F2')
                      : (isDark ? '1.5px solid #334155' : '1.5px solid transparent'),
                    boxShadow: isRowActive
                      ? (isDark ? '0 4px 12px rgba(56, 189, 248, 0.12)' : '0 4px 12px rgba(24, 119, 242, 0.08)')
                      : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative',
                  }}
                >
                  {/* Row Top Status Pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#94A3B8' : '#475569' }}>
                      #{idx + 1} {isRowActive && <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#38BDF8' : '#1877F2', fontSize: isUrdu ? '16px' : '13px', fontWeight: 900 }}>● {t('فعال قطار', 'Active Row')}</span>}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.ratePerKg > 0 && (
                        <span
                          className={isUrdu ? 'font-nastaleeq' : ''}
                          style={{
                            fontSize: isUrdu ? '17px' : '13px',
                            fontWeight: 900,
                            color: isDark ? '#34D399' : '#0E8A54',
                            backgroundColor: isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5',
                            padding: '3px 10px',
                            borderRadius: '7px',
                            border: isDark ? '1px solid #059669' : '1px solid #A7F3D0',
                            fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
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
                            color: isDark ? '#F87171' : '#DC2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '3px',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Two Inputs in Single Row: ITEM & QUANTITY */}
                  <div
                    className="item-qty-input-row"
                  >
                    {/* Input 1: Item */}
                    <div style={{ position: 'relative' }}>
                      <label
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{
                          display: 'block',
                          fontSize: isUrdu ? '18px' : '14px',
                          fontWeight: 900,
                          color: isDark ? '#E2E8F0' : '#1E293B',
                          marginBottom: '6px',
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
                        onBlur={() => {
                          setTimeout(() => {
                            setOpenSuggestionsRow(null);
                          }, 200);
                        }}
                        onChange={(e) => handleItemNameChange(e.target.value, idx)}
                        onKeyDown={(e) => handleItemKeyDown(e, idx)}
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{
                          width: '100%',
                          height: '52px',
                          borderRadius: '10px',
                          border: isDark ? '1.5px solid #475569' : '1.5px solid #CBD5E1',
                          backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                          padding: '0 14px',
                          fontSize: isUrdu ? '24px' : '17px',
                          fontWeight: 800,
                          color: isDark ? '#F8FAFC' : '#0F172A',
                          outline: 'none',
                          boxShadow: 'none',
                          textAlign: 'left',
                        }}
                      />

                      {/* Dropdown Suggestions */}
                      {openSuggestionsRow === idx && item.itemName.trim() !== '' && matchingProducts.length > 0 && (
                        <div
                          onMouseDown={(e) => e.preventDefault()}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            left: 0,
                            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                            borderRadius: '10px',
                            border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                            zIndex: 30,
                            maxHeight: '180px',
                            overflowY: 'auto',
                            marginTop: '4px',
                          }}
                        >
                          {matchingProducts.map((p, pIdx) => {
                            const isHighlighted = pIdx === selectedProductIndex;
                            return (
                              <div
                                key={p.id}
                                ref={(el) => {
                                  if (isHighlighted && el) {
                                    el.scrollIntoView({ block: 'nearest' });
                                  }
                                }}
                                onMouseEnter={() => setSelectedProductIndex(pIdx)}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSelectProduct(p, idx);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSelectProduct(p, idx);
                                }}
                                style={{
                                  padding: '10px 14px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                                  backgroundColor: isHighlighted
                                    ? (isDark ? '#334155' : '#EFF6FF')
                                    : (isDark ? '#1E293B' : '#FFFFFF'),
                                  borderLeft: isHighlighted ? '4px solid #1877F2' : '4px solid transparent',
                                  transition: 'background-color 0.1s ease',
                                }}
                              >
                                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '19px' : '15px', fontWeight: 800, color: isHighlighted ? '#1877F2' : (isDark ? '#F8FAFC' : '#0F172A') }}>
                                  {isUrdu ? p.nameUr : p.nameEn}
                                </span>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#38BDF8' : '#1877F2', fontFamily: 'var(--font-mono)' }}>
                                  {isUrdu ? `${p.ratePerKg} روپے` : `Rs ${p.ratePerKg}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Input 2: Quantity */}
                    <div style={{ position: 'relative' }}>
                      <label
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{
                          display: 'block',
                          fontSize: isUrdu ? '18px' : '14px',
                          fontWeight: 900,
                          color: isDark ? '#E2E8F0' : '#1E293B',
                          marginBottom: '6px',
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
                            height: '52px',
                            borderRadius: '10px',
                            border: isDark ? '1.5px solid #475569' : '1.5px solid #CBD5E1',
                            backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                            fontSize: '24px',
                            fontWeight: 900,
                            fontFamily: 'var(--font-mono)',
                            color: isDark ? '#F8FAFC' : '#0F172A',
                            padding: '0 56px 0 14px',
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
                            fontSize: isUrdu ? '18px' : '13px',
                            fontWeight: 900,
                            color: isDark ? '#94A3B8' : '#334155',
                            backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                            border: isDark ? '1px solid #334155' : 'none',
                            padding: '2px 8px',
                            borderRadius: '6px',
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
              height: '48px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: isDark ? '1.5px dashed #475569' : '1.5px dashed #94A3B8',
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              color: isDark ? '#38BDF8' : '#1877F2',
              fontSize: isUrdu ? '19px' : '15px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              outline: 'none',
            }}
          >
            <Plus size={18} />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('+ مزید آئٹم شامل کریں (Enter)', '+ Add Another Item (Enter)')}
            </span>
          </button>

          {/* Cash Received Row */}
          <div style={{ borderTop: isDark ? '1px solid #334155' : '1px solid #E2E8F0', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A' }}>
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
                  background: isDark ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5',
                  border: isDark ? '1px solid #059669' : '1px solid #A7F3D0',
                  color: isDark ? '#34D399' : '#0E8A54',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  fontSize: isUrdu ? '15px' : '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: 'none',
                  outline: 'none',
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
                  height: '52px',
                  borderRadius: '10px',
                  border: isDark ? '1.5px solid #475569' : '1.5px solid #CBD5E1',
                  backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                  fontSize: '24px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  padding: '0 64px 0 14px',
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
                  fontSize: isUrdu ? '18px' : '13px',
                  fontWeight: 900,
                  color: isDark ? '#60A5FA' : '#1877F2',
                  backgroundColor: isDark ? '#0F172A' : '#EFF6FF',
                  border: isDark ? '1px solid #334155' : 'none',
                  padding: '3px 10px',
                  borderRadius: '6px',
                }}
              >
                {t('روپے', 'Rs')}
              </span>
            </div>
          </div>

          {/* Customer Name */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A' }}>
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
              placeholder={t('گاہک کا نام لکھیں یا خالی چھوڑ کر Enter دبائیں...', 'Enter customer name or press Enter if empty...')}
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
                      setSelectedCustomerIndex(-1);
                      return;
                    }
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowSuggestions(false);
                    setSelectedCustomerIndex(-1);
                    return;
                  }
                }

                if (e.key === 'Enter') {
                  e.preventDefault();
                  // If empty take to save and print (or directly save & print)
                  handleFinalSubmit(false);
                }
              }}
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '10px',
                border: isDark ? '1.5px solid #475569' : '1.5px solid #CBD5E1',
                backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                padding: '0 14px',
                fontSize: isUrdu ? '20px' : '15px',
                fontWeight: 700,
                outline: 'none',
                boxShadow: 'none',
                textAlign: 'left',
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            />

            {/* Selected Customer Previous Balance Badge */}
            {selectedCustomerCredit !== null && (
              <div
                style={{
                  marginTop: '6px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: selectedCustomerCredit > 0
                    ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2')
                    : (isDark ? 'rgba(34, 197, 94, 0.15)' : '#F0FDF4'),
                  border: `1px solid ${selectedCustomerCredit > 0 ? (isDark ? '#EF4444' : '#FCA5A5') : (isDark ? '#22C55E' : '#86EFAC')}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: selectedCustomerCredit > 0 ? (isDark ? '#FCA5A5' : '#991B1B') : (isDark ? '#86EFAC' : '#166534') }}>
                  {t('سابقہ واجب الادا ادھار:', 'Previous Customer Credit:')}
                </span>
                <span style={{ color: selectedCustomerCredit > 0 ? (isDark ? '#F87171' : '#DC2626') : (isDark ? '#4ADE80' : '#16A34A'), fontSize: '13px' }}>
                  {isUrdu ? `${selectedCustomerCredit.toLocaleString()} روپے` : `Rs ${selectedCustomerCredit.toLocaleString()}`}
                </span>
              </div>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  left: 0,
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                  zIndex: 20,
                  maxHeight: '160px',
                  overflowY: 'auto',
                  marginTop: '4px',
                }}
              >
                {suggestions.map((c, cIdx) => {
                  const isHighlighted = cIdx === selectedCustomerIndex;
                  return (
                    <div
                      key={c.id || cIdx}
                      ref={(el) => {
                        if (isHighlighted && el) {
                          el.scrollIntoView({ block: 'nearest' });
                        }
                      }}
                      onMouseEnter={() => setSelectedCustomerIndex(cIdx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectCustomer(c);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectCustomer(c);
                      }}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isHighlighted ? (isDark ? '#334155' : '#EFF6FF') : (isDark ? '#1E293B' : '#FFFFFF'),
                        borderLeft: isHighlighted ? '4px solid #1877F2' : '4px solid transparent',
                        transition: 'background-color 0.1s ease',
                      }}
                    >
                      <div>
                        <span className="font-nastaleeq" style={{ fontWeight: 800, color: isHighlighted ? '#1877F2' : (isDark ? '#F8FAFC' : '#0F172A'), fontSize: isUrdu ? '18px' : '15px' }}>
                          {c.name}
                        </span>
                        {c.phone && (
                          <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '11px', marginLeft: '6px' }}>
                            ({c.phone})
                          </span>
                        )}
                      </div>
                      {c.currentBalance !== undefined && c.currentBalance > 0 && (
                        <span
                          style={{
                            color: isDark ? '#FCA5A5' : '#DC2626',
                            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
                            border: isDark ? '1px solid #EF4444' : 'none',
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
                  );
                })}
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
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderRadius: '16px',
              border: isDark ? '1px solid #334155' : 'none',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '26px' : '18px',
                  fontWeight: 900,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  letterSpacing: '0',
                }}
              >
                {t('کل رقم', 'Total Amount')}
              </span>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '17px' : '13px',
                  fontWeight: 900,
                  color: isDark ? '#FDE047' : '#B45309',
                  backgroundColor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB',
                  border: isDark ? '1px solid #78350F' : 'none',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
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
                fontSize: '44px',
                fontWeight: 900,
                color: isDark ? '#F8FAFC' : '#0F172A',
                lineHeight: 1.2,
                display: 'flex',
                alignItems: 'baseline',
                gap: '10px',
                direction: isUrdu ? 'rtl' : 'ltr',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>
                {netTotal.toLocaleString()}
              </span>
              {isUrdu && (
                <span className="font-nastaleeq" style={{ fontSize: '28px', fontWeight: 900, color: isDark ? '#94A3B8' : '#475569' }}>
                  روپے
                </span>
              )}
            </div>

            {/* Items Summary Breakdown List */}
            {billItems.filter((it) => (parseFloat(it.quantity) || 0) > 0).length > 0 && (
              <div
                style={{
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
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
                          borderBottom: i < billItems.length - 1 ? (isDark ? '1px solid #1E293B' : '1px solid #F1F5F9') : 'none',
                          paddingBottom: '6px',
                        }}
                      >
                        <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, fontSize: isUrdu ? '18px' : '14px', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          {it.itemName || t('آئٹم', 'Item')}
                        </span>
                        <span style={{ color: isDark ? '#94A3B8' : '#334155', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: isUrdu ? '16px' : '13px' }}>
                          {q} {isUrdu ? 'کلو' : 'KG'} × {it.ratePerKg} ={' '}
                          <strong style={{ color: isDark ? '#38BDF8' : '#0F172A', fontSize: isUrdu ? '17px' : '14px', fontWeight: 900 }}>Rs {tot.toLocaleString()}</strong>
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
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                  border: isDark ? '1px solid #EF4444' : '1px solid #FECACA',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '17px' : '13px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#B91C1C' }}
                >
                  {t('باقی ادھار:', 'Credit Balance:')}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: isDark ? '#F87171' : '#B91C1C', fontFamily: 'var(--font-mono)' }}>
                  {isUrdu ? `${balanceRemaining.toLocaleString()} روپے` : `Rs ${balanceRemaining.toLocaleString()}`}
                </span>
              </div>
            ) : changeToReturn > 0 ? (
              <div
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#ECFDF5',
                  border: isDark ? '1px solid #22C55E' : '1px solid #A7F3D0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '17px' : '13px', fontWeight: 900, color: isDark ? '#86EFAC' : '#0E8A54' }}
                >
                  {t('گاہک کو واپسی:', 'Change Due:')}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: isDark ? '#4ADE80' : '#0E8A54', fontFamily: 'var(--font-mono)' }}>
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
                  color: canDiscount ? (isDark ? '#94A3B8' : '#475569') : (isDark ? '#64748B' : '#94A3B8'),
                  fontSize: isUrdu ? '16px' : '13px',
                  fontWeight: 800,
                  cursor: canDiscount ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {canDiscount ? <Tag size={15} /> : <Lock size={15} color="#DC2626" />}
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
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      outline: 'none',
                    }}
                  />
                  <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 800 }}>
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
                height: '58px',
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
                padding: '0 18px 0 20px',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                <Printer size={24} color="#1877F2" strokeWidth={2.4} />
              </div>

              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '23px' : '17px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0',
                  lineHeight: 1.4,
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
                height: '54px',
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
                padding: '0 18px 0 20px',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '11px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={22} color="#0E8A54" strokeWidth={2.4} />
              </div>

              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '21px' : '16px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0',
                  lineHeight: 1.4,
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
          // Reset or keep focus on desktop only
          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            if (quantityInputRefs.current[0]) {
              quantityInputRefs.current[0]?.focus();
              quantityInputRefs.current[0]?.select();
            }
          }
        }}
        data={receiptData}
      />

      {/* Add New Product Card Modal */}
      {isAddCardModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            overflowY: 'auto',
          }}
          onClick={() => setIsAddCardModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '92vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeIn 0.18s ease-out',
              margin: 'auto',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid #F1F5F9',
                backgroundColor: '#F8FAFC',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>✨</span>
                <h3
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    margin: 0,
                    fontSize: isUrdu ? '22px' : '17px',
                    fontWeight: 900,
                    color: '#0F172A',
                    lineHeight: 1.2,
                  }}
                >
                  {isUrdu ? 'نیا کارڈ شامل کریں' : 'Add New Product Card'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCardModalOpen(false)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSaveNewProduct}
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                margin: 0,
              }}
            >
              {/* Scrollable Form Body */}
              <div
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  overflowY: 'auto',
                }}
              >
                {/* 1. Product Name (Urdu) */}
                <div>
                  <label
                    className={isUrdu ? 'font-nastaleeq' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isUrdu ? 'flex-end' : 'flex-start',
                      gap: '4px',
                      fontSize: isUrdu ? '17px' : '13px',
                      fontWeight: 800,
                      color: '#1E293B',
                      marginBottom: '5px',
                    }}
                  >
                    <span>{isUrdu ? 'پروڈکٹ کا نام (اردو)' : 'Product Name (Urdu)'}</span>
                    <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCardForm.nameUr}
                    onChange={(e) => setNewCardForm({ ...newCardForm, nameUr: e.target.value })}
                    placeholder={isUrdu ? 'مثلاً: مکئی کا آٹا، بیسن، وغیرہ' : 'e.g. مکئی کا آٹا'}
                    className={isUrdu ? 'font-nastaleeq' : ''}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 14px',
                      fontSize: isUrdu ? '18px' : '15px',
                      fontWeight: 700,
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '10px',
                      outline: 'none',
                      textAlign: isUrdu ? 'right' : 'left',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </div>

                {/* 2. Rate per KG */}
                <div>
                  <label
                    className={isUrdu ? 'font-nastaleeq' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isUrdu ? 'flex-end' : 'flex-start',
                      gap: '4px',
                      fontSize: isUrdu ? '17px' : '13px',
                      fontWeight: 800,
                      color: '#1E293B',
                      marginBottom: '5px',
                    }}
                  >
                    <span>{isUrdu ? 'ریٹ فی کلو (روپے)' : 'Rate Per KG (Rs)'}</span>
                    <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newCardForm.ratePerKg}
                    onChange={(e) => setNewCardForm({ ...newCardForm, ratePerKg: e.target.value })}
                    placeholder={isUrdu ? 'مثلاً: 160' : 'e.g. 160'}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 14px',
                      fontSize: '16px',
                      fontWeight: 700,
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '10px',
                      outline: 'none',
                      textAlign: isUrdu ? 'right' : 'left',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </div>

                {/* 3. Product Name (English - Optional) */}
                <div>
                  <label
                    className={isUrdu ? 'font-nastaleeq' : ''}
                    style={{
                      display: 'block',
                      fontSize: isUrdu ? '17px' : '13px',
                      fontWeight: 800,
                      color: '#475569',
                      marginBottom: '5px',
                      textAlign: isUrdu ? 'right' : 'left',
                    }}
                  >
                    {isUrdu ? 'پروڈکٹ کا نام (انگریزی - اختیاری)' : 'Product Name (English - Optional)'}
                  </label>
                  <input
                    type="text"
                    value={newCardForm.nameEn}
                    onChange={(e) => setNewCardForm({ ...newCardForm, nameEn: e.target.value })}
                    placeholder="e.g. Corn Flour / Besan"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 14px',
                      fontSize: '14px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '10px',
                      outline: 'none',
                      textAlign: isUrdu ? 'right' : 'left',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </div>

                {/* 3. Emoji Selection */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      className={isUrdu ? 'font-nastaleeq' : ''}
                      style={{
                        fontSize: isUrdu ? '17px' : '13px',
                        fontWeight: 800,
                        color: '#1E293B',
                      }}
                    >
                      {isUrdu ? 'کارڈ کا ایموجی منتخب کریں' : 'Select Card Emoji'}
                    </label>

                    {/* Compact Custom Emoji Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{ fontSize: isUrdu ? '14px' : '11px', color: '#64748B' }}
                      >
                        {isUrdu ? 'یا اپنا ایموجی:' : 'Custom:'}
                      </span>
                      <input
                        type="text"
                        maxLength={4}
                        value={newCardForm.emoji}
                        onChange={(e) => setNewCardForm({ ...newCardForm, emoji: e.target.value })}
                        placeholder="🌾"
                        style={{
                          width: '54px',
                          height: '32px',
                          fontSize: '17px',
                          textAlign: 'center',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px',
                          outline: 'none',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </div>
                  </div>

                  {/* Grid of quick emojis */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gap: '6px',
                      backgroundColor: '#F8FAFC',
                      padding: '8px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    {AVAILABLE_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewCardForm({ ...newCardForm, emoji: em })}
                        style={{
                          height: '36px',
                          borderRadius: '8px',
                          border: newCardForm.emoji === em ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          backgroundColor: newCardForm.emoji === em ? '#EFF6FF' : '#FFFFFF',
                          fontSize: '19px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: newCardForm.emoji === em ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
                          transition: 'all 0.1s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Modal Footer with Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  borderTop: '1px solid #F1F5F9',
                  backgroundColor: '#F8FAFC',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddCardModalOpen(false)}
                  style={{
                    height: '40px',
                    padding: '0 18px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: isUrdu ? '17px' : '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </span>
                </button>

                <button
                  type="submit"
                  style={{
                    height: '40px',
                    padding: '0 24px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontSize: isUrdu ? '18px' : '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {isUrdu ? 'کارڈ محفوظ کریں ✓' : 'Save Card ✓'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
