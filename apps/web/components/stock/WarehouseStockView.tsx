'use strict';
'use client';

import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Check,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// --- Handcrafted Vector SVGs matching Dashboard aesthetic ---

// Warehouse Silo Vector Icon
const WarehouseSiloSvg = () => (
  <svg width="40" height="36" viewBox="0 0 58 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="6,20 29,8 52,20" fill="#C99462" stroke="#4A2810" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="8" y="20" width="42" height="24" rx="2" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.5" />
    <rect x="22" y="27" width="14" height="17" rx="1" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
    <line x1="22" y1="32" x2="36" y2="32" stroke="#4A2810" strokeWidth="1.5" />
    <line x1="22" y1="37" x2="36" y2="37" stroke="#4A2810" strokeWidth="1.5" />
    <rect x="11" y="24" width="7" height="10" rx="1.5" fill="#C99462" stroke="#4A2810" strokeWidth="1.5" />
    <rect x="40" y="24" width="7" height="10" rx="1.5" fill="#C99462" stroke="#4A2810" strokeWidth="1.5" />
  </svg>
);

// Stock Inward Truck Vector Icon
const StockInwardSvg = () => (
  <svg width="40" height="36" viewBox="0 0 58 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="14" width="30" height="24" rx="2" fill="#C99462" stroke="#4A2810" strokeWidth="2.5" />
    <line x1="12" y1="20" x2="28" y2="20" stroke="#FAF4ED" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="26" x2="28" y2="26" stroke="#FAF4ED" strokeWidth="2" strokeLinecap="round" />
    <path d="M36 21H46L51 28V38H36V21Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="40" y="24" width="7" height="6" rx="1" fill="#C99462" stroke="#4A2810" strokeWidth="1.5" />
    <circle cx="15" cy="40" r="5" fill="#4A2810" />
    <circle cx="43" cy="40" r="5" fill="#4A2810" />
  </svg>
);

// Stock Outward Trolley Vector Icon
const StockOutwardSvg = () => (
  <svg width="40" height="36" viewBox="0 0 58 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="20" width="24" height="7" rx="1.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2" />
    <rect x="17" y="13" width="18" height="7" rx="1.5" fill="#C99462" stroke="#4A2810" strokeWidth="2" />
    <line x1="8" y1="28" x2="44" y2="28" stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="8" y1="28" x2="8" y2="12" stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="14" cy="36" r="4.5" fill="#4A2810" />
    <circle cx="38" cy="36" r="4.5" fill="#4A2810" />
  </svg>
);

// Wheat Raw Grain Sack SVG
const WheatGrainSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12C8 10 11 9 18 9C25 9 28 10 28 12L27 30C27 32 25 33 18 33C11 33 9 32 9 30L8 12Z" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="18" cy="19" r="6" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.8" />
    <ellipse cx="18" cy="19" rx="2.5" ry="4" fill="#D97706" />
  </svg>
);

// Chakki Atta Bag SVG
const ChakkiAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 14C7 11.5 10 11 18 11C26 11 29 11.5 29 14L28 30C28 32 26 33 18 33C10 33 8 32 8 30L7 14Z" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M12 11C12 9 14 7 18 7C22 7 24 9 24 11" stroke="#4A2810" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M11 11H25" stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 16V27M18 18L15 16M18 18L21 16M18 21L14 19M18 21L22 19" stroke="#FAF4ED" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Fine Atta Bag SVG
const FineAttaSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="20" height="22" rx="3" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M13 10V7C13 6 14 5 15 5H21C22 5 23 6 23 7V10" stroke="#4A2810" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="18" cy="20" r="5" fill="#C99462" stroke="#4A2810" strokeWidth="1.8" />
  </svg>
);

// Maida Special Bag SVG
const MaidaSpecialSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 13C8 11 11 10 18 10C25 10 28 11 28 13L27 30C27 32 25 33 18 33C11 33 9 32 9 30L8 13Z" fill="#FFFFFF" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M13 10C13 7.5 15 6 18 6C21 6 23 7.5 23 10" stroke="#4A2810" strokeWidth="2.2" />
    <circle cx="18" cy="21" r="5.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.8" />
  </svg>
);

// Suji Bag SVG
const SujiSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 16C6 24 11 27 18 27C25 27 30 24 30 16H6Z" fill="#FAF4ED" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <ellipse cx="18" cy="16" rx="12" ry="4" fill="#C99462" stroke="#4A2810" strokeWidth="2.2" />
  </svg>
);

// Chokar Bran Sack SVG
const ChokarSvg = () => (
  <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12L10 31C10 32.5 12 33 18 33C24 33 26 32.5 26 31L28 12L22 9L18 10L14 9L8 12Z" fill="#8C582B" stroke="#4A2810" strokeWidth="2.2" strokeLinejoin="round" />
    <line x1="12" y1="17" x2="24" y2="17" stroke="#FAF4ED" strokeWidth="1.8" strokeDasharray="2 2" />
  </svg>
);

interface StockItem {
  id: string;
  nameUr: string;
  nameEn: string;
  quantityBags: number;
  weightPerBagKg: number;
  ratePerKg: number;
}

const INITIAL_STOCK_ITEMS: StockItem[] = [
  { id: '1', nameUr: 'گندم خام اسٹاک', nameEn: 'Wheat Grain (50 KG)', quantityBags: 420, weightPerBagKg: 50, ratePerKg: 100 },
  { id: '2', nameUr: 'چکی آٹا', nameEn: 'Chakki Atta (20 KG)', quantityBags: 95, weightPerBagKg: 20, ratePerKg: 140 },
  { id: '3', nameUr: 'فائن آٹا', nameEn: 'Fine Quality Atta (50 KG)', quantityBags: 65, weightPerBagKg: 50, ratePerKg: 148 },
  { id: '4', nameUr: 'میدہ اسپیشل', nameEn: 'Maida Special (50 KG)', quantityBags: 30, weightPerBagKg: 50, ratePerKg: 155 },
  { id: '5', nameUr: 'خالص سوجی', nameEn: 'Pure Suji (50 KG)', quantityBags: 25, weightPerBagKg: 50, ratePerKg: 160 },
  { id: '6', nameUr: 'چوکر', nameEn: 'Wheat Chokar (35 KG)', quantityBags: 110, weightPerBagKg: 35, ratePerKg: 95 },
];

const renderStockSvg = (id: string) => {
  switch (id) {
    case '1': return <WheatGrainSvg />;
    case '2': return <ChakkiAttaSvg />;
    case '3': return <FineAttaSvg />;
    case '4': return <MaidaSpecialSvg />;
    case '5': return <SujiSvg />;
    case '6': return <ChokarSvg />;
    default: return <WheatGrainSvg />;
  }
};

export const WarehouseStockView: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const [stockItems, setStockItems] = useState<StockItem[]>(INITIAL_STOCK_ITEMS);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Inward / Outward Modal
  const [modalMode, setModalMode] = useState<'inward' | 'outward' | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>(INITIAL_STOCK_ITEMS[0].id);
  const [modalQuantity, setModalQuantity] = useState<string>('10');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const updateQuantity = (id: string, delta: number) => {
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = Math.max(0, item.quantityBags + delta);
          return { ...item, quantityBags: next };
        }
        return item;
      })
    );
  };

  const handleModalSubmit = () => {
    const qty = parseInt(modalQuantity) || 0;
    if (qty <= 0) return;

    const delta = modalMode === 'inward' ? qty : -qty;
    updateQuantity(selectedItemId, delta);

    const target = stockItems.find((i) => i.id === selectedItemId);
    const itemName = isUrdu ? target?.nameUr : target?.nameEn;
    setToastMessage(
      modalMode === 'inward'
        ? `+${qty} ${t('بوریاں', 'bags')} ${itemName} ${t('گودام میں داخل کر دی گئیں!', 'added to warehouse!')}`
        : `-${qty} ${t('بوریاں', 'bags')} ${itemName} ${t('کی نکاسی درج کر لی گئی!', 'dispatched from warehouse!')}`
    );
    setTimeout(() => setToastMessage(null), 3000);

    setModalMode(null);
    setModalQuantity('10');
  };

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
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '2px solid #10B981',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.18)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Check size={18} strokeWidth={3} />
            </div>
            <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '16.5px', fontWeight: 900, color: '#065F46' }}>
              {toastMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#047857', fontWeight: 900 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. TOP DASHBOARD ACTION CARDS (Centered Dual Cards - Exact Match to Picture 2) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '14px',
          width: '100%',
        }}
      >
        {/* Card 1: نیا اسٹاک آمد - Cobalt Blue Action Card */}
        <div
          onClick={() => setModalMode('inward')}
          onMouseEnter={() => setHoveredCard('inward')}
          onMouseLeave={() => {
            setHoveredCard(null);
            setPressedCard(null);
          }}
          onMouseDown={() => setPressedCard('inward')}
          onMouseUp={() => setPressedCard(null)}
          className="touch-active"
          style={{
            width: '360px',
            background: 'linear-gradient(135deg, #1877F2 0%, #1D4ED8 100%)',
            borderRadius: '14px',
            border: '2px solid #1E40AF',
            boxShadow: '0 6px 16px rgba(24, 119, 242, 0.26)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            direction: 'rtl',
            cursor: 'pointer',
            minHeight: '62px',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            transform:
              pressedCard === 'inward'
                ? 'scale(0.975) translateY(1px)'
                : hoveredCard === 'inward'
                  ? 'translateY(-2px)'
                  : 'none',
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                flexShrink: 0,
              }}
            >
              <StockInwardSvg />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '26px' : '19px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0',
                }}
              >
                {t('+ نیا اسٹاک آمد', '+ Stock Inward')}
              </h2>
            </div>
          </div>
        </div>

        {/* Card 2: اسٹاک نکاسی و ترسیل - Emerald Green Action Card */}
        <div
          onClick={() => setModalMode('outward')}
          onMouseEnter={() => setHoveredCard('outward')}
          onMouseLeave={() => {
            setHoveredCard(null);
            setPressedCard(null);
          }}
          onMouseDown={() => setPressedCard('outward')}
          onMouseUp={() => setPressedCard(null)}
          className="touch-active"
          style={{
            width: '360px',
            background: 'linear-gradient(135deg, #0E8A54 0%, #065F46 100%)',
            borderRadius: '14px',
            border: '2px solid #065F46',
            boxShadow: '0 6px 16px rgba(14, 138, 84, 0.26)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            direction: 'rtl',
            cursor: 'pointer',
            minHeight: '62px',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            transform:
              pressedCard === 'outward'
                ? 'scale(0.975) translateY(1px)'
                : hoveredCard === 'outward'
                  ? 'translateY(-2px)'
                  : 'none',
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                flexShrink: 0,
              }}
            >
              <StockOutwardSvg />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '26px' : '19px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0',
                }}
              >
                {t('اسٹاک نکاسی و ترسیل', 'Stock Outward')}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STOCK ITEMS DASHBOARD CARDS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
          marginTop: '4px',
        }}
      >
        {stockItems.map((item) => {
          const totalItemValue = item.quantityBags * item.weightPerBagKg * item.ratePerKg;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="dash-card-animated"
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: 'none',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: 'none',
                transition: 'background-color 0.15s ease',
              }}
            >
              {/* Card Header: Squircle Icon + Status */}
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
                    boxShadow: 'none',
                    border: 'none',
                    flexShrink: 0,
                  }}
                >
                  {renderStockSvg(item.id)}
                </div>

                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '13px' : '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#ECFDF5',
                    color: '#0E8A54',
                    boxShadow: 'none',
                  }}
                >
                  ● {t('اسٹاک دستیاب', 'In Stock')}
                </span>
              </div>

              {/* Title (Only active language) */}
              <div>
                <h4
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '24px' : '18px',
                    fontWeight: 900,
                    color: '#0F172A',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {isUrdu ? item.nameUr : item.nameEn}
                </h4>
              </div>

              {/* Quantity Box & Steppers */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'none',
                }}
              >
                <div>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    {item.quantityBags}
                  </span>
                  <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '15px' : '12px', fontWeight: 800, color: '#64748B', marginLeft: '4px' }}>
                    {t('بوریاں', 'Bags')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="touch-active"
                    title={t('1 بوری نکاسی', '1 Bag Outward')}
                    style={{
                      width: '32px',
                      height: '34px',
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'none',
                      outline: 'none',
                    }}
                  >
                    <Minus size={15} strokeWidth={2.8} />
                  </button>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="touch-active"
                    title={t('1 بوری آمد', '1 Bag Inward')}
                    style={{
                      width: '32px',
                      height: '34px',
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: '#ECFDF5',
                      color: '#0E8A54',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'none',
                      outline: 'none',
                    }}
                  >
                    <Plus size={15} strokeWidth={2.8} />
                  </button>
                </div>
              </div>

              {/* Valuation */}
              <div style={{ textAlign: 'right', fontSize: isUrdu ? '15px' : '12px', fontWeight: 800, color: '#0F172A', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                {isUrdu ? `${t('مالیت:', 'Valuation:')} ${totalItemValue.toLocaleString()} روپے` : `Valuation: Rs ${totalItemValue.toLocaleString()}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL FOR INWARD / OUTWARD */}
      {modalMode && (
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
            {/* Header */}
            <div
              style={{
                backgroundColor: modalMode === 'inward' ? '#065F46' : '#0369A1',
                color: '#FFFFFF',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '22px' : '18px', fontWeight: 900 }}>
                {modalMode === 'inward' ? t('+ نیا اسٹاک داخل کریں', '+ Stock Inward') : t('اسٹاک نکاسی و ترسیل', 'Stock Outward / Dispatch')}
              </span>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  {t('پروڈکٹ منتخب کریں:', 'Select Product:')}
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #D1D5DB',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    fontWeight: 700,
                  }}
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {isUrdu ? item.nameUr : item.nameEn} ({item.quantityBags} {t('بوری دستیاب', 'bags available')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px', fontWeight: 800, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  {t('تعداد (بوریاں):', 'Quantity (Bags):')}
                </label>
                <input
                  type="number"
                  value={modalQuantity}
                  onChange={(e) => setModalQuantity(e.target.value)}
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
                  onClick={handleModalSubmit}
                  className="touch-active"
                  style={{
                    flex: 1,
                    height: '42px',
                    backgroundColor: modalMode === 'inward' ? '#059669' : '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('محفوظ کریں', 'Save')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
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
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('منسوخ', 'Cancel')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
