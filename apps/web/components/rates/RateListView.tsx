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
  yesterdayRate: number;
  todayRate: number;
}

interface PisaiRateItem {
  id: string;
  titleUr: string;
  titleEn: string;
  ratePerKg: number;
  note: string;
}

const INITIAL_RATES: RateItem[] = [
  { id: '1', nameUr: 'چکی آٹا (گندم)', nameEn: 'Chakki Whole Wheat Atta', yesterdayRate: 140, todayRate: 140 },
  { id: '2', nameUr: 'فائن آٹا', nameEn: 'Fine Quality Atta', yesterdayRate: 148, todayRate: 148 },
  { id: '3', nameUr: 'میدہ اسپیشل', nameEn: 'Maida Special Grade', yesterdayRate: 155, todayRate: 155 },
  { id: '4', nameUr: 'خالص سوجی', nameEn: 'Pure Suji / Semolina', yesterdayRate: 160, todayRate: 160 },
  { id: '5', nameUr: 'چوکر (کھل)', nameEn: 'Wheat Chokar / Bran', yesterdayRate: 95, todayRate: 95 },
  { id: '6', nameUr: 'دیسی گندم آٹا', nameEn: 'Desi Organic Atta', yesterdayRate: 145, todayRate: 145 },
];

const INITIAL_PISAI_RATES: PisaiRateItem[] = [
  {
    id: 'safai_pisai',
    titleUr: 'صفائی و پسائی',
    titleEn: 'Cleaning & Milling',
    ratePerKg: 12,
    note: 'مکمل چھانٹی و چکی پسائی چارجز',
  },
  {
    id: 'pisai_only',
    titleUr: 'صرف پسائی',
    titleEn: 'Grinding Only',
    ratePerKg: 10,
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

  const updateRate = (id: string, delta: number) => {
    setRates((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = Math.max(1, item.todayRate + delta);
          return { ...item, todayRate: next };
        }
        return item;
      })
    );
  };

  const setDirectRate = (id: string, val: number) => {
    setRates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, todayRate: Math.max(0, val) } : item))
    );
  };

  const updatePisaiRate = (id: string, delta: number) => {
    setPisaiRates((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ratePerKg: Math.max(1, p.ratePerKg + delta) } : p))
    );
  };

  const handleResetToYesterday = () => {
    setRates((prev) =>
      prev.map((item) => ({ ...item, todayRate: item.yesterdayRate }))
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
    const rateVal = parseFloat(newItemRate) || 100;
    const newItem: RateItem = {
      id: Date.now().toString(),
      nameUr: newItemName.trim(),
      nameEn: 'Special Item',
      yesterdayRate: rateVal,
      todayRate: rateVal,
    };
    setRates((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemRate('');
    setIsAddItemModalOpen(false);
  };

  const todayDateUrdu = '19 ستمبر 2026';

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
            direction: 'rtl',
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
              <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 900, color: '#065F46' }}>
                آج کے تمام نرخ نامے تصدیق اور لاگو ہو چکے ہیں!
              </div>
              <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700 }}>
                بلنگ کاؤنٹرز (F8) اور پسائی ٹوکن (F2) پر نیا ریٹ فوری نافذ العمل ہے۔
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

      {/* 1. TOP 3 DASHBOARD ACTION CARDS (Exactly matching BillerDashboard Set D Design) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
          direction: 'rtl',
        }}
      >
        {/* Card 1 (Right in RTL): روزانہ نرخ نامہ کنٹرول - Charcoal Onyx with Gold Accent */}
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
            background:
              hoveredCard === 'total'
                ? 'linear-gradient(135deg, #58797D 0%, #435E62 50%, #344B4E 100%)'
                : 'linear-gradient(135deg, #4A676B 0%, #374F52 50%, #2A3F42 100%)',
            borderRadius: '16px',
            border: hoveredCard === 'total' ? '2.5px solid #84A9AD' : '2px solid #5F8387',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow:
              hoveredCard === 'total'
                ? '0 14px 34px rgba(54, 79, 82, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                : '0 6px 18px rgba(54, 79, 82, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)',
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
          {/* Left: White Squircle Icon Tile */}
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
              روزانہ نرخ نامہ لسٹ
            </h2>
          </div>
        </div>

        {/* Card 2 (Center in RTL): تمام ریٹس محفوظ و لاگو کریں - Warm Terracotta Clay Gradient */}
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
            background:
              hoveredCard === 'save'
                ? 'linear-gradient(135deg, #DFBBB0 0%, #C9A292 50%, #B18978 100%)'
                : 'linear-gradient(135deg, #D4ADA0 0%, #BE9685 50%, #A67E6D 100%)',
            borderRadius: '16px',
            border: hoveredCard === 'save' ? '2.5px solid #F4DFD7' : '2px solid #E8CDC2',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow:
              hoveredCard === 'save'
                ? '0 14px 34px rgba(190, 150, 133, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                : '0 6px 18px rgba(190, 150, 133, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)',
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
          {/* Left: White Squircle Icon Tile */}
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
            <Check size={32} color="#A67E6D" strokeWidth={2.8} />
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
              تمام ریٹس لاگو کریں
            </h2>
          </div>
        </div>

        {/* Card 3 (Left in RTL): ریٹ لسٹ پرنٹ کریں - Dusty Slate Blue Gradient */}
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
            background:
              hoveredCard === 'print'
                ? 'linear-gradient(135deg, #9DB7C4 0%, #819EAD 50%, #698694 100%)'
                : 'linear-gradient(135deg, #8DAAB8 0%, #7491A0 50%, #5E7A88 100%)',
            borderRadius: '16px',
            border: hoveredCard === 'print' ? '2.5px solid #C4DCE8' : '2px solid #A8C4D2',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow:
              hoveredCard === 'print'
                ? '0 14px 34px rgba(116, 145, 160, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                : '0 6px 18px rgba(116, 145, 160, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)',
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
          {/* Left: White Squircle Icon Tile */}
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
              ریٹ لسٹ پرنٹ کریں
            </h2>
          </div>
        </div>
      </div>

      {/* 2. FLOUR PRODUCTS SECTION HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌾</span>
          <h3 className="font-nastaleeq" style={{ fontSize: '22px', fontWeight: 900, color: '#1F2937', margin: 0 }}>
            آٹا و تیار اناج مصنوعات کے یومیہ ریٹس
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
            فی کلو گرام (Rs / KG)
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
          <span className="font-nastaleeq">+ نئی پروڈکٹ شامل کریں</span>
        </button>
      </div>

      {/* 3. FLOUR PRODUCTS DASHBOARD CARDS GRID (3-Columns x 2-Rows) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
          direction: 'rtl',
        }}
      >
        {rates.map((item) => {
          const diff = item.todayRate - item.yesterdayRate;
          const perMaund = item.todayRate * 40;
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
              {/* Card Top: Squircle Icon Tile + Per Maund Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* White Squircle Tile matching Dashboard */}
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

                {/* Per Maund (40 KG) Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
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
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    40 KG: Rs {perMaund.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '11px', color: '#78716C', fontWeight: 700 }}>
                    کل کا ریٹ: Rs {item.yesterdayRate}
                  </span>
                </div>
              </div>

              {/* Card Middle: Product Name */}
              <div>
                <h4
                  className="font-nastaleeq"
                  style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#1F2937',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {item.nameUr}
                </h4>
                <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                  {item.nameEn}
                </div>
              </div>

              {/* Card Bottom: Tactile Price Steppers & Numeric Box */}
              <div
                style={{
                  backgroundColor: '#FAF8F5',
                  border: '1.5px solid #EBE4DA',
                  borderRadius: '12px',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}
              >
                {/* Stepper Buttons (-5, -1) */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => updateRate(item.id, -5)}
                    className="touch-active"
                    title="-5 روپے"
                    style={{
                      width: '28px',
                      height: '34px',
                      borderRadius: '7px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRate(item.id, -1)}
                    className="touch-active"
                    title="-1 روپیہ"
                    style={{
                      width: '28px',
                      height: '34px',
                      borderRadius: '7px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Minus size={14} strokeWidth={2.6} />
                  </button>
                </div>

                {/* Price Display & Editable Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#8C582B' }}>Rs</span>
                  <input
                    type="number"
                    value={item.todayRate}
                    onChange={(e) => setDirectRate(item.id, parseFloat(e.target.value) || 0)}
                    style={{
                      width: '66px',
                      height: '34px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      border: '2px solid #8C582B',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      fontSize: '18px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxShadow: '0 2px 5px rgba(140, 88, 43, 0.12)',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280' }}>/KG</span>
                </div>

                {/* Stepper Buttons (+1, +5) */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => updateRate(item.id, 1)}
                    className="touch-active"
                    title="+1 روپیہ"
                    style={{
                      width: '28px',
                      height: '34px',
                      borderRadius: '7px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={14} strokeWidth={2.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRate(item.id, 5)}
                    className="touch-active"
                    title="+5 روپے"
                    style={{
                      width: '28px',
                      height: '34px',
                      borderRadius: '7px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: '11px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    +5
                  </button>
                </div>
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
                    +{diff} روپے اضافہ 🔺
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
                    {diff} روپے کمی 🔻
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>
                    ● قیمت مستحکم (No change)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. PISAI SERVICE CHARGES (2 Large Dashboard Cards matching PisaiBillingScreen) */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', direction: 'rtl', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>⚙️</span>
          <h3 className="font-nastaleeq" style={{ fontSize: '22px', fontWeight: 900, color: '#1F2937', margin: 0 }}>
            گندم چکی پسائی و صفائی کے ریٹس
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
            ٹوکن اجرت
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            width: '100%',
            direction: 'rtl',
          }}
        >
          {pisaiRates.map((p) => {
            const perMaund = p.ratePerKg * 40;

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
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.22s ease',
                }}
              >
                {/* Right Side: Squircle Tile + Titles */}
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
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      border: '1.5px solid #EBE4DA',
                      flexShrink: 0,
                    }}
                  >
                    {p.id === 'safai_pisai' ? <SafaiPisaiSvg /> : <PisaiOnlySvg />}
                  </div>

                  <div>
                    <h4 className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 900, color: '#1F2937', margin: 0, lineHeight: 1.2 }}>
                      {p.titleUr}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                      {p.note}
                    </div>
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: '#78350F',
                        fontWeight: 900,
                        backgroundColor: '#FEF3C7',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        marginTop: '4px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      فی من (40 KG): Rs {perMaund}
                    </div>
                  </div>
                </div>

                {/* Left Side: Tactile Adjust Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => updatePisaiRate(p.id, -1)}
                    className="touch-active"
                    style={{
                      width: '36px',
                      height: '42px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Minus size={16} strokeWidth={2.8} />
                  </button>

                  <div
                    style={{
                      minWidth: '92px',
                      height: '42px',
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #8C582B',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 900,
                      color: '#8C582B',
                      fontFamily: 'var(--font-mono)',
                      boxShadow: '0 2px 6px rgba(140, 88, 43, 0.12)',
                    }}
                  >
                    Rs {p.ratePerKg} / KG
                  </div>

                  <button
                    type="button"
                    onClick={() => updatePisaiRate(p.id, 1)}
                    className="touch-active"
                    style={{
                      width: '36px',
                      height: '42px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={16} strokeWidth={2.8} />
                  </button>
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
          direction: 'rtl',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} color="#15803D" />
          <div>
            <div className="font-nastaleeq" style={{ fontSize: '15.5px', fontWeight: 900, color: '#166534' }}>
              روزانہ نرخ نامہ تصدیق پروٹوکول فعال ہے
            </div>
            <div style={{ fontSize: '11.5px', color: '#4B5563', fontWeight: 600 }}>
              آخری تبدیلی: آج، صبح 08:30 بجے | تصدیق کنندہ: سپروائزر و ایڈمن
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
          <span className="font-nastaleeq">سابقہ (کل والے) ریٹس بحال کریں</span>
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
            direction: 'rtl',
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
                <span className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 900 }}>
                  روزانہ نرخ نامہ پرنٹ پریویو
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
                  <h3 className="font-nastaleeq" style={{ fontSize: '22px', fontWeight: 900, color: '#1C1917', margin: 0 }}>
                    فلور ملز و چکی روزانہ نرخ نامہ
                  </h3>
                  <div style={{ fontSize: '12px', color: '#78716C', fontWeight: 700, marginTop: '3px' }}>
                    تاریخ: {todayDateUrdu}
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
                      <span className="font-nastaleeq" style={{ fontWeight: 800, color: '#1F2937' }}>
                        {r.nameUr}
                      </span>
                      <span style={{ fontWeight: 900, color: '#8C582B', fontFamily: 'var(--font-mono)' }}>
                        Rs {r.todayRate} / KG (Rs {r.todayRate * 40} / من)
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E7E5E4' }}>
                  <div className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 900, color: '#44403C' }}>
                    پسائی چارجز:
                  </div>
                  {pisaiRates.map((p) => (
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
                      <span className="font-nastaleeq">{p.titleUr}</span>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        Rs {p.ratePerKg} / KG (Rs {p.ratePerKg * 40} / من)
                      </span>
                    </div>
                  ))}
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
                <span className="font-nastaleeq">پرنٹ نکالیں (Print Now)</span>
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
                بند کریں
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
            direction: 'rtl',
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
                <span className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 900 }}>
                  نئی آئٹم ریٹ لسٹ میں شامل کریں
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
                <label className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  پروڈکٹ کا نام (اردو میں):
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: دلیا، مکئی آٹا، بیسن..."
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
                <label className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  فی کلو گرام ریٹ (Rs / KG):
                </label>
                <input
                  type="number"
                  placeholder="120"
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
                  <span className="font-nastaleeq">شامل کریں</span>
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
                  منسوخ کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
