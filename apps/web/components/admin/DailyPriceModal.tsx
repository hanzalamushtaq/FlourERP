'use strict';
'use client';

import React, { useState } from 'react';
import { Clock, Check, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DailyPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

interface PriceItem {
  id: string;
  nameEn: string;
  nameUr: string;
  yesterdayRate: number;
  todayRate: number;
}

const INITIAL_PRICES: PriceItem[] = [
  { id: '1', nameEn: 'Chakki Atta', nameUr: 'چکی آٹا', yesterdayRate: 140, todayRate: 140 },
  { id: '2', nameEn: 'Fine Atta', nameUr: 'فائن آٹا', yesterdayRate: 148, todayRate: 148 },
  { id: '3', nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', yesterdayRate: 155, todayRate: 155 },
  { id: '4', nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', yesterdayRate: 160, todayRate: 160 },
  { id: '5', nameEn: 'Chokar / Bran', nameUr: 'چوکر', yesterdayRate: 95, todayRate: 95 },
  { id: '6', nameEn: 'Desi Atta', nameUr: 'دیسی گندم آٹا', yesterdayRate: 145, todayRate: 145 },
];

export const DailyPriceModal: React.FC<DailyPriceModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
}) => {
  const { isUrdu, t } = useLanguage();
  const [prices, setPrices] = useState<PriceItem[]>(INITIAL_PRICES);
  const [billerHoldState, setBillerHoldState] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRateChange = (id: string, newRate: number) => {
    setPrices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, todayRate: newRate } : item))
    );
  };

  const handleConfirmAll = () => {
    alert(t('آج کے ریٹس محفوظ اور تصدیق کر لیے گئے ہیں۔', 'Today rates have been confirmed and saved.'));
    onClose();
  };

  const handleBillerRequestUpdate = () => {
    setBillerHoldState(true);
    alert(t('ایڈمن کو ریٹ تبدیلی کی درخواست بھیج دی گئی ہے۔', 'Rate update request sent to admin.'));
  };

  const handleBillerKeepPrevious = () => {
    alert(t('کل والے ریٹس پر بلنگ جاری رکھی گئی ہے۔', 'Continuing billing on previous rates.'));
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: 'none',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#fbbf24" />
            <div>
              <h2 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>
                {t('روزانہ نرخ نامہ کی تصدیق', 'Daily Price Confirmation')}
              </h2>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {t('آج کے نرخوں کا اندراج و تصدیق', 'Daily Price Confirmation Protocol')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Rates Table */}
        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              fontSize: '12px',
              fontWeight: 800,
              color: '#64748b',
              paddingBottom: '6px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <span>{t('پروڈکٹ', 'Product')}</span>
            <span style={{ textAlign: 'center' }}>{t('کل کا ریٹ', 'Yesterday')}</span>
            <span style={{ textAlign: 'right' }}>{t('آج کا ریٹ', 'Today Rate')}</span>
          </div>

          {prices.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f8fafc',
              }}
            >
              <div>
                <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {isUrdu ? item.nameUr : item.nameEn}
                </div>
              </div>

              <div style={{ textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '13px', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                {isUrdu ? `${item.yesterdayRate} روپے` : `Rs ${item.yesterdayRate}`}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {isAdmin ? (
                  <input
                    type="number"
                    value={item.todayRate}
                    onChange={(e) => handleRateChange(item.id, parseFloat(e.target.value) || 0)}
                    style={{
                      width: '80px',
                      height: '34px',
                      padding: '0 8px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      direction: 'ltr',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                    {isUrdu ? `${item.todayRate} روپے` : `Rs ${item.todayRate}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '10px',
          }}
        >
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={handleConfirmAll}
                className="touch-active"
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Check size={16} />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('ریٹس کی تصدیق کریں', 'Save & Confirm Rates')}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="touch-active"
                style={{
                  padding: '0 16px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('بند کریں', 'Close')}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBillerKeepPrevious}
                className="touch-active"
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('سابقہ ریٹس پر جاری رکھیں', 'Continue with Previous Rates')}
                </span>
              </button>
              <button
                type="button"
                onClick={handleBillerRequestUpdate}
                className="touch-active"
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#f59e0b',
                  color: '#0f172a',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('ایڈمن سے ریٹ تبدیلی کی درخواست', 'Request Rate Update from Admin')}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
