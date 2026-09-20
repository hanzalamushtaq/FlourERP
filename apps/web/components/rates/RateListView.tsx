'use strict';
'use client';

import React, { useState } from 'react';
import {
  Check,
  RotateCcw,
  Printer,
  Plus,
  Minus,
  Clock,
  ShieldCheck,
  X,
  Scale,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// --- 1. Custom Handcrafted Vector SVGs matching Dashboard & Billing aesthetic ---

// Chakki Atta Burlap Sack
const ChakkiAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 14C7 11.5 10 11 18 11C26 11 29 11.5 29 14L28 30C28 32 26 33 18 33C10 33 8 32 8 30L7 14Z" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M12 11C12 9 14 7 18 7C22 7 24 9 24 11" stroke="#4A2810" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M11 11H25" stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 16V27M18 18L15 16M18 18L21 16M18 21L14 19M18 21L22 19M18 24L15 22M18 24L21 22" stroke="#FAF4ED" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Fine Atta Bag
const FineAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="20" height="22" rx="3" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M13 10V7C13 6 14 5 15 5H21C22 5 23 6 23 7V10" stroke="#4A2810" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="18" cy="20" r="5" fill="#C99462" stroke="#4A2810" strokeWidth="1.8" />
    <path d="M18 17V23M18 18L16 19M18 18L20 19M18 21L16 22M18 21L20 22" stroke="#FAF4ED" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M26 6L27 8L29 9L27 10L26 12L25 10L23 9L25 8L26 6Z" fill="#D97706" />
  </svg>
);

// Maida Special Bag
const MaidaSpecialSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 13C8 11 11 10 18 10C25 10 28 11 28 13L27 30C27 32 25 33 18 33C11 33 9 32 9 30L8 13Z" fill="#FFFFFF" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M13 10C13 7.5 15 6 18 6C21 6 23 7.5 23 10" stroke="#4A2810" strokeWidth="2.2" />
    <circle cx="18" cy="21" r="5.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.8" />
    <path d="M14 21H22M18 17V25" stroke="#C99462" strokeWidth="2" strokeLinecap="round" />
    <path d="M15.5 18.5L20.5 23.5M20.5 18.5L15.5 23.5" stroke="#C99462" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Pure Suji Bowl
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

// Feed Chokar Sack
const ChokarSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12L10 31C10 32.5 12 33 18 33C24 33 26 32.5 26 31L28 12L22 9L18 10L14 9L8 12Z" fill="#8C582B" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <line x1="12" y1="17" x2="24" y2="17" stroke="#FAF4ED" strokeWidth="1.8" strokeDasharray="2 2" strokeLinecap="round" />
    <line x1="12" y1="22" x2="24" y2="22" stroke="#FAF4ED" strokeWidth="1.8" strokeDasharray="2 2" strokeLinecap="round" />
    <rect x="13" y="24" width="10" height="5" rx="1.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.5" />
    <circle cx="18" cy="26.5" r="1.5" fill="#8C582B" />
  </svg>
);

// Desi Wheat Atta Sack
const DesiAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="18" cy="28" rx="13" ry="4" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M10 15C10 12 13 10 18 10C23 10 26 12 26 15L25 28C22 30 14 30 11 28L10 15Z" fill="#A76F3C" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="18" cy="9" r="2.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2" />
    <path d="M18 14V23M18 16L15 18M18 16L21 18M18 19L15 21M18 19L21 21" stroke="#FAF4ED" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Safai + Pisai Mill Icon
const SafaiPisaiSvg = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="14" stroke="#4A2810" strokeWidth="2.2" strokeDasharray="3 2" fill="#FAF4ED" />
    <circle cx="18" cy="18" r="10" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
    <path d="M12 18H24M18 12V24M14 14L22 22M22 14L14 22" stroke="#FAF4ED" strokeWidth="1.6" strokeLinecap="round" />
    <ellipse cx="28" cy="9" rx="3.5" ry="2" transform="rotate(-30 28 9)" fill="#D97706" stroke="#4A2810" strokeWidth="1.2" />
    <path d="M28 5L28 9" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 8L9 10L11 11L9 12L8 14L7 12L5 11L7 10L8 8Z" fill="#D97706" />
  </svg>
);

// Pisai Only Stone Mill Icon
const PisaiOnlySvg = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 13L18 8L26 13L18 17L10 13Z" fill="#8C582B" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M10 17L18 21L26 17V24L18 28L10 24V17Z" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M15 4H21L19 8H17L15 4Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.8" />
    <path d="M18 28V33M15 31H21" stroke="#FAF4ED" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 21C6 17 7 13 10 11" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Scales / Rate Sheet Vector Icon
const RateBadgeSvg = () => (
  <svg width="40" height="36" viewBox="0 0 58 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,34 46,34 42,44 16,44" fill="#C99462" stroke="#4A2810" strokeWidth="2.5" strokeLinejoin="round" />
    <line x1="29" y1="8" x2="29" y2="34" stroke="#4A2810" strokeWidth="3" strokeLinecap="round" />
    <line x1="12" y1="14" x2="46" y2="14" stroke="#4A2810" strokeWidth="3" strokeLinecap="round" />
    <circle cx="29" cy="8" r="4" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
    <path d="M12 14L8 26C8 30 16 30 16 26L12 14Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2" strokeLinejoin="round" />
    <path d="M46 14L42 26C42 30 50 30 50 26L46 14Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

// Receipt Printer Icon
const RatePrinterSvg = () => (
  <svg width="40" height="36" viewBox="0 0 58 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="17" width="48" height="23" rx="4" fill="#C99462" stroke="#4A2810" strokeWidth="2.5" />
    <rect x="13" y="7" width="32" height="13" rx="2" fill="#FFFFFF" stroke="#4A2810" strokeWidth="2.5" />
    <line x1="17" y1="11" x2="35" y2="11" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15 25V42L20 39.5L25 42L29 39.5L34 42L38 39.5L43 42V25" fill="#FFFFFF" stroke="#4A2810" strokeWidth="2.5" strokeLinejoin="round" />
    <line x1="19" y1="30" x2="39" y2="30" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

interface RateItem {
  id: string;
  nameUr: string;
  nameEn: string;
  yesterdayMaund: number;
  todayMaund: number;
}

const INITIAL_RATES: RateItem[] = [
  { id: '1', nameUr: 'چکی آٹا', nameEn: 'Chakki Whole Wheat Atta', yesterdayMaund: 5600, todayMaund: 5600 },
  { id: '2', nameUr: 'فائن آٹا', nameEn: 'Fine Quality Atta', yesterdayMaund: 5920, todayMaund: 5920 },
  { id: '3', nameUr: 'میدہ اسپیشل', nameEn: 'Maida Special Grade', yesterdayMaund: 6200, todayMaund: 6200 },
  { id: '4', nameUr: 'خالص سوجی', nameEn: 'Pure Suji / Semolina', yesterdayMaund: 6400, todayMaund: 6400 },
  { id: '5', nameUr: 'چوکر', nameEn: 'Wheat Chokar / Bran', yesterdayMaund: 3800, todayMaund: 3800 },
  { id: '6', nameUr: 'دیسی گندم آٹا', nameEn: 'Desi Organic Atta', yesterdayMaund: 5800, todayMaund: 5800 },
];

interface PisaiRateItem {
  id: string;
  titleUr: string;
  titleEn: string;
  ratePerMaund: number;
  note: string;
}

const INITIAL_PISAI_RATES: PisaiRateItem[] = [
  {
    id: 'safai_pisai',
    titleUr: 'صفائی و پسائی',
    titleEn: 'Cleaning & Milling',
    ratePerMaund: 480,
    note: 'مکمل چھانٹی و چکی پسائی چارجز',
  },
  {
    id: 'pisai_only',
    titleUr: 'صرف پسائی',
    titleEn: 'Grinding Only',
    ratePerMaund: 400,
    note: 'صاف شدہ گندم کی چکی پسائی',
  },
];

const renderProductSvg = (id: string) => {
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

export const RateListView: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const [rates, setRates] = useState<RateItem[]>(INITIAL_RATES);
  const [pisaiRates, setPisaiRates] = useState<PisaiRateItem[]>(INITIAL_PISAI_RATES);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);

  // New Item State
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemRate, setNewItemRate] = useState<string>('');

  const setDirectMaundRate = (id: string, val: number) => {
    setRates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, todayMaund: Math.max(0, val) } : item))
    );
  };

  const setDirectPisaiRate = (id: string, val: number) => {
    setPisaiRates((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ratePerMaund: Math.max(0, val) } : p))
    );
  };

  const handleResetToYesterday = () => {
    setRates((prev) =>
      prev.map((item) => ({ ...item, todayMaund: item.yesterdayMaund }))
    );
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleSaveAndBroadcast = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim() || !newItemRate) return;
    const maundVal = parseFloat(newItemRate) || 4000;
    const newItem: RateItem = {
      id: Date.now().toString(),
      nameUr: newItemName.trim(),
      nameEn: 'Special Item',
      yesterdayMaund: maundVal,
      todayMaund: maundVal,
    };
    setRates((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemRate('');
    setIsAddItemModalOpen(false);
  };

  const todayDateStr = isUrdu ? '19 ستمبر 2026' : '19 September 2026';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 0 24px 0',
      }}
    >
      {/* SUCCESS CONFIRMATION BANNER */}
      {savedBanner && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '2px solid #10B981',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.2)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 3px 8px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Check size={22} strokeWidth={3} />
            </div>
            <div>
              <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '18px', fontWeight: 900, color: '#065F46' }}>
                {t('آج کے تمام نرخ نامے تصدیق اور لاگو ہو چکے ہیں!', 'All daily rates have been verified and applied!')}
              </div>
              <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
                {t('بلنگ کاؤنٹرز (F8) اور پسائی ٹوکن (F2) پر نیا ریٹ فوری نافذ العمل ہے۔', 'New rates are now active across all billing and milling counters.')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSavedBanner(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#047857', fontWeight: 900, fontSize: '18px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. TOP 3 DASHBOARD ACTION CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
        }}
      >
        {/* Card 1: روزانہ نرخ نامہ لسٹ */}
        <div
          onMouseEnter={() => setHoveredCard('total')}
          onMouseLeave={() => {
            setHoveredCard(null);
            setPressedCard(null);
          }}
          onMouseDown={() => setPressedCard('total')}
          onMouseUp={() => setPressedCard(null)}
          className="dash-card-animated"
          style={{
            background: '#1877f2',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform:
              pressedCard === 'total'
                ? 'scale(0.975) translateY(1px)'
                : hoveredCard === 'total'
                  ? 'translateY(-4px)'
                  : 'none',
          }}
        >
          <div
            style={{
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
              transform: hoveredCard === 'total' ? 'scale(1.08) rotate(-1.5deg)' : 'scale(1)',
            }}
          >
            <RateBadgeSvg />
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h2
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {t('روزانہ نرخ نامہ لسٹ', 'Daily Rate List')}
            </h2>
          </div>
        </div>

        {/* Card 2: تمام ریٹس لاگو کریں */}
        <div
          onClick={handleSaveAndBroadcast}
          onMouseEnter={() => setHoveredCard('save')}
          onMouseLeave={() => {
            setHoveredCard(null);
            setPressedCard(null);
          }}
          onMouseDown={() => setPressedCard('save')}
          onMouseUp={() => setPressedCard(null)}
          className="touch-active"
          style={{
            background: '#DC3545',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform:
              pressedCard === 'save'
                ? 'scale(0.975) translateY(1px)'
                : hoveredCard === 'save'
                  ? 'translateY(-4px)'
                  : 'none',
          }}
        >
          <div
            style={{
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
              transform: hoveredCard === 'save' ? 'scale(1.08) rotate(1.5deg)' : 'scale(1)',
            }}
          >
            <Check size={32} color="#DC3545" strokeWidth={2.8} />
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h2
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {t('تمام ریٹس لاگو کریں', 'Apply All Rates')}
            </h2>
          </div>
        </div>

        {/* Card 3: ریٹ لسٹ پرنٹ کریں */}
        <div
          onClick={() => setIsPrintModalOpen(true)}
          onMouseEnter={() => setHoveredCard('print')}
          onMouseLeave={() => {
            setHoveredCard(null);
            setPressedCard(null);
          }}
          onMouseDown={() => setPressedCard('print')}
          onMouseUp={() => setPressedCard(null)}
          className="touch-active"
          style={{
            background: '#0E8A54',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '96px',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform:
              pressedCard === 'print'
                ? 'scale(0.975) translateY(1px)'
                : hoveredCard === 'print'
                  ? 'translateY(-4px)'
                  : 'none',
          }}
        >
          <div
            style={{
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
              transform: hoveredCard === 'print' ? 'scale(1.08) rotate(-1.5deg)' : 'scale(1)',
            }}
          >
            <RatePrinterSvg />
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h2
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {t('ریٹ لسٹ پرنٹ کریں', 'Print Rate List')}
            </h2>
          </div>
        </div>
      </div>

      {/* 2. FLOUR PRODUCTS SECTION HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌾</span>
          <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '22px', fontWeight: 900, color: '#1F2937', margin: 0 }}>
            {t('آٹا و تیار اناج مصنوعات کے یومیہ ریٹس', 'Flour & Grain Products Daily Rates')}
          </h3>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#78350F',
              backgroundColor: '#FEF3C7',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #FDE68A',
            }}
          >
            {t('فی من ریٹ (روپے / 40 کلو)', 'Rate per Maund (Rs / 40 KG)')}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAddItemModalOpen(true)}
          className="touch-active"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            color: '#8C582B',
            border: '2px solid #8C582B',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(140, 88, 43, 0.12)',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('+ نئی پروڈکٹ شامل کریں', '+ Add Product')}</span>
        </button>
      </div>
      {/* 3. FLOUR PRODUCTS DASHBOARD CARDS GRID (3-Columns x 2-Rows) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
        }}
      >
        {rates.map((item) => {
          const diff = item.todayMaund - item.yesterdayMaund;
          const perKg = item.todayMaund > 0 ? item.todayMaund / 40 : 0;
          const isItemHovered = hoveredItem === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="dash-card-animated"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: isItemHovered ? '2px solid #C2410C' : '1.5px solid #EBE4DA',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: isItemHovered
                  ? '0 10px 24px rgba(194, 65, 12, 0.12), 0 2px 6px rgba(0,0,0,0.04)'
                  : '0 4px 14px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isItemHovered ? 'translateY(-3px)' : 'none',
              }}
            >
              {/* Card Top: Squircle Icon Tile + Derived Per KG Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.09)',
                    border: '1.5px solid #EBE4DA',
                    flexShrink: 0,
                    transition: 'transform 0.22s ease',
                    transform: isItemHovered ? 'scale(1.1) rotate(-2deg)' : 'scale(1)',
                  }}
                >
                  {renderProductSvg(item.id)}
                </div>

                {/* Per KG Derived Badge & Yesterday Rate */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-start' : 'flex-end', gap: '3px' }}>
                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 900,
                      color: '#78350F',
                      backgroundColor: '#FEF3C7',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #FDE68A',
                      fontFamily: 'var(--font-mono)',
                      boxShadow: 'none',
                    }}
                  >
                    {isUrdu ? `1 کلو: ${perKg % 1 === 0 ? perKg : perKg.toFixed(2)} روپے` : `1 KG: Rs ${perKg % 1 === 0 ? perKg : perKg.toFixed(2)}`}
                  </span>
                  <span style={{ fontSize: '11px', color: '#78716C', fontWeight: 700 }}>
                    {t('کل کا من ریٹ:', 'Yesterday Maund:')} {isUrdu ? `${item.yesterdayMaund.toLocaleString()} روپے` : `Rs ${item.yesterdayMaund.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Card Middle: Product Name (Only active language) */}
              <div>
                <h4
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#1F2937',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {isUrdu ? item.nameUr : item.nameEn}
                </h4>
              </div>

              {/* Card Bottom: Direct Price Input */}
              <div
                style={{
                  backgroundColor: '#FAF8F5',
                  border: '1.5px solid #EBE4DA',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800, color: '#8C582B' }}>
                  {t('روپے', 'Rs')}
                </span>
                <input
                  type="number"
                  value={item.todayMaund === 0 ? '' : item.todayMaund}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    setDirectMaundRate(item.id, val === '' ? 0 : parseFloat(val) || 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => (e.target as HTMLElement).blur()}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: '105px',
                    height: '38px',
                    textAlign: 'center',
                    direction: 'ltr',
                    unicodeBidi: 'isolate',
                    borderRadius: '8px',
                    border: '2px solid #8C582B',
                    backgroundColor: '#FFFFFF',
                    color: '#1F2937',
                    fontSize: '19px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    boxShadow: 'none',
                  }}
                />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12.5px', fontWeight: 800, color: '#6B7280' }}>
                  {t('/ من', '/ Maund')}
                </span>
              </div>

              {/* Trend Tag */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {diff > 0 ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#DC2626',
                      backgroundColor: '#FEE2E2',
                      padding: '1px 8px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {isUrdu ? `+${diff.toLocaleString()} روپے اضافہ (فی من) ▲` : `+Rs ${diff.toLocaleString()} Increase (per maund) ▲`}
                  </span>
                ) : diff < 0 ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#16A34A',
                      backgroundColor: '#DCFCE7',
                      padding: '1px 8px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {isUrdu ? `${diff.toLocaleString()} روپے کمی (فی من) ▼` : `Rs ${diff.toLocaleString()} Decrease (per maund) ▼`}
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>
                    {t('قیمت مستحکم', 'Price Stable')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. PISAI SERVICE CHARGES (2 Large Dashboard Cards matching PisaiBillingScreen) */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>⚙️</span>
          <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '22px', fontWeight: 900, color: '#1F2937', margin: 0 }}>
            {t('گندم چکی پسائی و صفائی کے ریٹس', 'Wheat Cleaning & Milling Rates')}
          </h3>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#065F46',
              backgroundColor: '#D1FAE5',
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            {t('فی من نرخ (روپے / 40 کلو)', 'Rate per Maund (Rs / 40 KG)')}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            width: '100%',
          }}
        >
          {pisaiRates.map((p) => {
            const perKg = p.ratePerMaund > 0 ? p.ratePerMaund / 40 : 0;
            const pisaiTitle = p.id === 'safai_pisai'
              ? t('صفائی و پسائی', 'Cleaning & Milling')
              : t('صرف پسائی', 'Grinding Only');
            const pisaiNote = p.id === 'safai_pisai'
              ? t('گندم واشنگ، چھانٹی، صفائی اور چکی پتھر پسائی', 'Washing, sorting, cleaning & stone milling')
              : t('کسٹمر کی لائی گئی صاف گندم کی پسائی', 'Direct milling of customer cleaned wheat');

            return (
              <div
                key={p.id}
                className="dash-card-animated"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #EBE4DA',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'none',
                  transition: 'all 0.22s ease',
                }}
              >
                {/* Squircle Tile + Titles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'none',
                      border: '1.5px solid #EBE4DA',
                      flexShrink: 0,
                    }}
                  >
                    {p.id === 'safai_pisai' ? <SafaiPisaiSvg /> : <PisaiOnlySvg />}
                  </div>

                  <div>
                    <h4 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '20px', fontWeight: 900, color: '#1F2937', margin: 0, lineHeight: 1.2 }}>
                      {pisaiTitle}
                    </h4>
                    <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                      {pisaiNote}
                    </div>
                    <div
                      className={isUrdu ? 'font-nastaleeq' : ''}
                      style={{
                        fontSize: '12.5px',
                        color: '#78350F',
                        fontWeight: 900,
                        backgroundColor: '#FEF3C7',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        marginTop: '4px',
                        fontFamily: isUrdu ? 'inherit' : 'var(--font-mono)',
                      }}
                    >
                      {isUrdu ? `فی کلو: ${perKg % 1 === 0 ? perKg : perKg.toFixed(2)} روپے` : `Per KG: Rs ${perKg % 1 === 0 ? perKg : perKg.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Direct Price Input (Rate Per Mann / 40 KG) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#8C582B' }}>Rs</span>
                  <input
                    type="number"
                    value={p.ratePerMaund === 0 ? '' : p.ratePerMaund}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value;
                      setDirectPisaiRate(p.id, val === '' ? 0 : parseFloat(val) || 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                      }
                    }}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: '95px',
                      height: '38px',
                      textAlign: 'center',
                      direction: 'ltr',
                      unicodeBidi: 'isolate',
                      borderRadius: '8px',
                      border: '2px solid #8C582B',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      fontSize: '18px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxShadow: 'none',
                    }}
                  />
                  <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12.5px', fontWeight: 800, color: '#6B7280' }}>
                    {t('/ من (40 KG)', '/ Maund (40 KG)')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. BOTTOM BAR: QUICK CONTROLS & OFFICIAL POLICY */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #EBE4DA',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} color="#15803D" />
          <div>
            <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '15.5px', fontWeight: 900, color: '#166534' }}>
              {t('روزانہ نرخ نامہ تصدیق پروٹوکول فعال ہے', 'Daily Rate Confirmation Protocol Active')}
            </div>
            <div style={{ fontSize: '11.5px', color: '#4B5563', fontWeight: 600 }}>
              {t('آخری تبدیلی: آج، صبح 08:30 بجے | تصدیق کنندہ: سپروائزر و ایڈمن', 'Last modified: Today, 08:30 AM | Verified by: Supervisor & Admin')}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetToYesterday}
          className="touch-active"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #CBD5E1',
            borderRadius: '10px',
            padding: '8px 18px',
            color: '#334155',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={16} color="#64748B" />
          <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('سابقہ (کل والے) ریٹس بحال کریں', "Restore Yesterday's Rates")}</span>
        </button>
      </div>

      {/* PRINT PREVIEW MODAL */}
      {isPrintModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 3000,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #EBE4DA',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} color="#FDE047" />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '18px', fontWeight: 900 }}>
                  {t('روزانہ نرخ نامہ پرنٹ پریویو', 'Daily Rate List Print Preview')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Printable Content Preview */}
            <div style={{ padding: '20px', backgroundColor: '#FAFAF9' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px dashed #D6D3D1',
                  borderRadius: '12px',
                  padding: '18px',
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '2px solid #E7E5E4', paddingBottom: '12px' }}>
                  <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '22px', fontWeight: 900, color: '#1C1917', margin: 0 }}>
                    {t('فلور ملز و چکی روزانہ نرخ نامہ', 'Al-Madina Flour Mills Daily Rates')}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 700, marginTop: '3px' }}>
                    {t('تاریخ:', 'Date:')} {todayDateStr}
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rates.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: '1px dotted #E7E5E4',
                        fontSize: '13.5px',
                      }}
                    >
                      <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800, color: '#1F2937' }}>
                        {isUrdu ? r.nameUr : r.nameEn}
                      </span>
                      <span style={{ fontWeight: 900, color: '#8C582B', fontFamily: 'var(--font-mono)' }}>
                        {isUrdu
                          ? `${r.todayMaund.toLocaleString()} روپے / من (${(r.todayMaund / 40).toFixed(2).replace(/\.00$/, '')} روپے / کلو)`
                          : `Rs ${r.todayMaund.toLocaleString()} / Maund (Rs ${(r.todayMaund / 40).toFixed(2).replace(/\.00$/, '')} / KG)`}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E7E5E4' }}>
                  <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px', fontWeight: 900, color: '#44403C' }}>
                    {t('پسائی چارجز:', 'Milling Charges:')}
                  </div>
                  {pisaiRates.map((p) => {
                    const title = p.id === 'safai_pisai'
                      ? t('صفائی اور پسائی', 'Cleaning & Milling')
                      : t('صرف پسائی', 'Milling Only');
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '3px 0',
                          fontSize: '13px',
                          color: '#57534E',
                        }}
                      >
                        <span className={isUrdu ? 'font-nastaleeq' : ''}>{title}</span>
                        <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          {isUrdu
                            ? `${p.ratePerMaund.toLocaleString()} روپے / من (${(p.ratePerMaund / 40).toFixed(2).replace(/\.00$/, '')} روپے / کلو)`
                            : `Rs ${p.ratePerMaund.toLocaleString()} / Maund (Rs ${(p.ratePerMaund / 40).toFixed(2).replace(/\.00$/, '')} / KG)`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #EBE4DA',
                display: 'flex',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setIsPrintModalOpen(false);
                }}
                className="touch-active"
                style={{
                  flex: 1,
                  height: '42px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Printer size={16} />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('پرنٹ نکالیں (Print Now)', 'Print Now')}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="touch-active"
                style={{
                  padding: '0 18px',
                  height: '42px',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('بند کریں', 'Close')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {isAddItemModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 3000,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #EBE4DA',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#FDE047" />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '18px', fontWeight: 900 }}>
                  {t('نئی آئٹم ریٹ لسٹ میں شامل کریں', 'Add New Item to Rate List')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  {t('پروڈکٹ کا نام:', 'Product Name:')}
                </label>
                <input
                  type="text"
                  placeholder={t('مثلاً: دلیا، مکئی آٹا، بیسن...', 'e.g. Corn Flour, Gram Flour...')}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  {t('فی من ریٹ (روپے / 40 کلو):', 'Rate per Maund (Rs / 40 KG):')}
                </label>
                <input
                  type="number"
                  placeholder="5600"
                  value={newItemRate}
                  onChange={(e) => setNewItemRate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #D1D5DB',
                    fontSize: '16px',
                    fontFamily: 'var(--font-mono)',
                    direction: 'ltr',
                    unicodeBidi: 'isolate',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleAddNewItem}
                  className="touch-active"
                  style={{
                    flex: 1,
                    height: '42px',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('شامل کریں', 'Add Item')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="touch-active"
                  style={{
                    padding: '0 18px',
                    height: '42px',
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('منسوخ کریں', 'Cancel')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
