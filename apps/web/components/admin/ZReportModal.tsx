'use strict';
'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Lock,
  Printer,
  X,
  CheckCircle2,
  Database,
  Banknote,
  Sparkles,
  Receipt,
  HandCoins,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCloseShift: () => void;
  shiftData?: {
    shiftName: string;
    operatorName: string;
    counter: string;
    openedAt: string;
    closedAt: string;
    totalSales: number;
    totalPisai: number;
    creditRecovery: number;
    expenses: number;
    expectedCash: number;
  };
}

export const ZReportModal: React.FC<ZReportModalProps> = ({
  isOpen,
  onClose,
  onConfirmCloseShift,
  shiftData = {
    shiftName: 'Morning Shift',
    operatorName: 'محمد عاصف',
    counter: '01',
    openedAt: '18/09/2026, 08:00 AM',
    closedAt: '18/09/2026, 06:45 PM',
    totalSales: 184500,
    totalPisai: 8640,
    creditRecovery: 42000,
    expenses: 3625,
    expectedCash: 126500,
  },
}) => {
  const { isUrdu, t } = useLanguage();
  const [actualCashInput, setActualCashInput] = useState<string>('126500');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isClosedSuccess, setIsClosedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const actualCash = parseFloat(actualCashInput) || 0;
  const discrepancy = actualCash - shiftData.expectedCash;

  const handleExecuteClosing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsClosedSuccess(true);
      setTimeout(() => {
        onConfirmCloseShift();
        onClose();
        setIsClosedSuccess(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: 'none',
          overflow: 'hidden',
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#fbbf24',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{ fontSize: '16px', fontWeight: 900, margin: 0, lineHeight: 1.2 }}
              >
                {t('شفٹ کا اختتام و اختتامی رپورٹ', 'End of Shift Report')}
              </h2>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>
                {t('شفٹ لیجر کا حساب کتاب اور ڈیٹا بیس بیک اپ', 'End of Shift Ledger Reconciliation & Database Backup')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#1e293b',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Metadata banner */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>{t('آپریٹر: ', 'Operator: ')}</span>
              <strong className="font-nastaleeq">{shiftData.operatorName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{t('کاؤنٹر: ', 'Counter: ')}</span>
              <strong>{isUrdu ? `کاؤنٹر #${shiftData.counter}` : `Counter #${shiftData.counter}`}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{t('شفٹ: ', 'Shift: ')}</span>
              <span className={isUrdu ? 'font-nastaleeq' : ''}>
                {isUrdu ? 'صبح شفٹ' : 'Morning Shift'}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{t('وقت: ', 'Time: ')}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{shiftData.closedAt}</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div
            style={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              fontSize: '13px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Banknote size={15} color="#15803d" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('کل نقد سیلز', 'Total Cash Sales')}</span>
              </span>
              <strong style={{ fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                {isUrdu ? `${shiftData.totalSales.toLocaleString()} روپے` : `Rs ${shiftData.totalSales.toLocaleString()}`}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="#b45309" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('گندم پسائی اجرت', 'Wheat Grinding Revenue')}</span>
              </span>
              <strong style={{ fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                {isUrdu ? `${shiftData.totalPisai.toLocaleString()} روپے` : `Rs ${shiftData.totalPisai.toLocaleString()}`}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HandCoins size={15} color="#0284c7" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('ادھار وصولی', 'Credit Collected')}</span>
              </span>
              <strong style={{ fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                {isUrdu ? `${shiftData.creditRecovery.toLocaleString()} روپے` : `Rs ${shiftData.creditRecovery.toLocaleString()}`}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#fff1f2',
                color: '#b91c1c',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Receipt size={15} />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('دکان کے اخراجات', 'Shop Expenses Paid')}</span>
              </span>
              <strong style={{ fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                {isUrdu ? `- ${shiftData.expenses.toLocaleString()} روپے` : `- Rs ${shiftData.expenses.toLocaleString()}`}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: '#f1f5f9',
                fontSize: '15px',
                fontWeight: 900,
              }}
            >
              <span className={isUrdu ? 'font-nastaleeq' : ''}>
                {t('سسٹم کیش دراز بیلنس', 'Expected Drawer Cash Balance')}
              </span>
              <span style={{ fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)', color: '#0f172a' }}>
                {isUrdu ? `${shiftData.expectedCash.toLocaleString()} روپے` : `Rs ${shiftData.expectedCash.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Actual Physical Cash Counted Input */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <label
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 800,
                color: '#92400e',
                marginBottom: '6px',
              }}
            >
              {t('کاؤنٹر پر گنی گئی اصل رقم:', 'Physical Cash Counted on Counter:')}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(e.target.value)}
                style={{
                  flex: 1,
                  height: '44px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '18px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  direction: 'ltr',
                  textAlign: 'left',
                }}
              />
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit' }}>
                {isUrdu ? 'روپے' : 'Rs'}
              </span>
            </div>

            {discrepancy !== 0 && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: discrepancy > 0 ? '#15803d' : '#b91c1c',
                  fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                }}
              >
                {t('فرق:', 'Discrepancy:')}{' '}
                {isUrdu
                  ? `${discrepancy > 0 ? `+${discrepancy}` : discrepancy} روپے`
                  : `${discrepancy > 0 ? `+${discrepancy}` : discrepancy} Rs`}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('منسوخ کریں', 'Cancel')}
          </button>

          <button
            type="button"
            onClick={handleExecuteClosing}
            disabled={isProcessing || isClosedSuccess}
            className="touch-active"
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isClosedSuccess ? '#10b981' : '#0f172a',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'none',
            }}
          >
            {isClosedSuccess ? (
              <>
                <CheckCircle2 size={18} />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px' }}>
                  {t('شفٹ محفوظ اور ڈیٹا بیس بیک اپ مکمل!', 'Shift Closed & Backup Complete!')}
                </span>
              </>
            ) : isProcessing ? (
              <>
                <Database size={18} className="animate-spin" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('شفٹ بند ہو رہی ہے اور بیک اپ بن رہا ہے...', 'Locking shift and generating backup...')}
                </span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <Printer size={16} />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px' }}>
                  {t('شفٹ لاک کریں اور اختتامی رپورٹ پرنٹ کریں', 'Lock Shift & Print Z-Report')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
