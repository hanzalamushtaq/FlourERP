'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  Banknote,
  Sparkles,
  Receipt,
  HandCoins,
  RefreshCw,
  Calculator,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getSession, ensureValidToken } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/api';
import { useGeneralInfo } from '../../lib/generalInfo';
import { generateTabularPdf } from '../../lib/pdfReportGenerator';

export interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCloseShift?: () => void;
  shiftData?: {
    shiftName?: string;
    operatorName?: string;
    counter?: string;
    openedAt?: string;
    closedAt?: string;
    totalSales?: number;
    totalPisai?: number;
    creditRecovery?: number;
    expenses?: number;
    expectedCash?: number;
  };
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  shiftData = {
    operatorName: 'آپریٹر',
    counter: '01',
    totalSales: 0,
    totalPisai: 0,
    creditRecovery: 0,
    expenses: 0,
    expectedCash: 0,
  },
}) => {
  const { isUrdu, t } = useLanguage();
  const generalInfo = useGeneralInfo();

  const [actualCashInput, setActualCashInput] = useState<string>('0');
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [liveData, setLiveData] = useState({
    totalSales: shiftData.totalSales || 0,
    cashSales: 0,
    creditSales: 0,
    totalPisai: shiftData.totalPisai || 0,
    cashPisai: 0,
    creditPisai: 0,
    creditRecovery: shiftData.creditRecovery || 0,
    expenses: shiftData.expenses || 0,
    cashReturns: 0,
    expectedCash: shiftData.expectedCash || 0,
    billCount: 0,
    pisaiCount: 0,
  });

  const fetchPreview = async () => {
    setIsLoadingMetrics(true);
    setErrorMessage(null);
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch(`${getApiBaseUrl()}/api/closing/preview`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setLiveData({
          totalSales: d.totalSales ?? ((d.cashSales || 0) + (d.creditSales || 0)),
          cashSales: d.cashSales ?? 0,
          creditSales: d.creditSales ?? 0,
          totalPisai: d.totalPisai ?? ((d.cashPisai || 0) + (d.creditPisai || 0)),
          cashPisai: d.cashPisai ?? 0,
          creditPisai: d.creditPisai ?? 0,
          creditRecovery: d.totalUdhaarCollected ?? 0,
          expenses: d.totalExpenses ?? 0,
          cashReturns: d.cashReturns ?? 0,
          expectedCash: d.expectedCashInDrawer ?? 0,
          billCount: d.billCount ?? 0,
          pisaiCount: d.pisaiCount ?? 0,
        });
        setActualCashInput(String(Math.round(d.expectedCashInDrawer ?? 0)));
      }
    } catch (err: any) {
      console.error('Failed to load daily report preview:', err);
      setErrorMessage(err.message || 'Failed to load report data');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPreview();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeExpectedCash = liveData.expectedCash;
  const actualCash = parseFloat(actualCashInput) || 0;
  const discrepancy = actualCash - activeExpectedCash;

  const currentDateStr = new Date().toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTimeStr = new Date().toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // 1. Direct Thermal Printer Slip (80mm/58mm format)
  const handleThermalPrint = () => {
    try {
      let iframe = document.getElementById('daily-report-thermal-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'daily-report-thermal-iframe';
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        return;
      }

      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Daily Report - ${currentDateStr}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 3mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              font-size: 13px;
              line-height: 1.35;
              color: #000;
              margin: 0;
              padding: 4px;
              width: 72mm;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .left { text-align: left; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .double-divider { border-top: 2px solid #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .sub-row { display: flex; justify-content: space-between; margin: 1px 0 1px 10px; font-size: 11.5px; color: #333; }
            .header { margin-bottom: 8px; text-align: center; }
            .header h2 { margin: 0; font-size: 17px; font-weight: 900; }
            .header p { margin: 2px 0; font-size: 11px; }
            .total-box { border: 1.5px solid #000; padding: 6px 8px; margin: 8px 0; text-align: center; }
            .total-title { font-size: 11px; font-weight: bold; }
            .total-amount { font-size: 19px; font-weight: 900; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${generalInfo.mill_name || 'AL-MADINA FLOUR MILLS'}</h2>
            <p>${generalInfo.address || 'Chakki & General Store'}</p>
            ${generalInfo.phone_primary ? `<p>Tel: ${generalInfo.phone_primary}</p>` : ''}
            <div class="double-divider"></div>
            <div style="font-weight: 900; font-size: 14px;">DAILY BUSINESS REPORT</div>
            <div style="font-size: 11px;">(یومیہ کاروباری سمری رپورٹ)</div>
          </div>

          <div class="divider"></div>
          <div class="row"><span>Date:</span><span class="bold">${currentDateStr}</span></div>
          <div class="row"><span>Time:</span><span class="bold">${currentTimeStr}</span></div>
          <div class="row"><span>Operator:</span><span class="bold">${shiftData.operatorName || 'Cashier'}</span></div>
          <div class="row"><span>Counter:</span><span class="bold">#${shiftData.counter || '01'}</span></div>
          <div class="divider"></div>

          <div style="font-weight: bold; margin: 4px 0 2px;">1. PRODUCT SALES (پراڈکٹ سیلز)</div>
          <div class="row"><span>Total Bills:</span><span class="bold">${liveData.billCount}</span></div>
          <div class="row"><span>Gross Sales:</span><span class="bold">Rs ${Math.round(liveData.totalSales).toLocaleString()}</span></div>
          <div class="sub-row"><span>- Cash Collected:</span><span>Rs ${Math.round(liveData.cashSales).toLocaleString()}</span></div>
          <div class="sub-row"><span>- Credit (Udhaar):</span><span>Rs ${Math.round(liveData.creditSales).toLocaleString()}</span></div>
          <div class="divider"></div>

          <div style="font-weight: bold; margin: 4px 0 2px;">2. GUNDAM PISAI (گندم پسائی)</div>
          <div class="row"><span>Total Tokens:</span><span class="bold">${liveData.pisaiCount}</span></div>
          <div class="row"><span>Gross Pisai Fee:</span><span class="bold">Rs ${Math.round(liveData.totalPisai).toLocaleString()}</span></div>
          <div class="sub-row"><span>- Cash Collected:</span><span>Rs ${Math.round(liveData.cashPisai).toLocaleString()}</span></div>
          <div class="sub-row"><span>- Credit (Udhaar):</span><span>Rs ${Math.round(liveData.creditPisai).toLocaleString()}</span></div>
          <div class="divider"></div>

          <div style="font-weight: bold; margin: 4px 0 2px;">3. UDHAAR RECOVERY (ادھار وصولی)</div>
          <div class="row"><span>Cash Recovered:</span><span class="bold">Rs ${Math.round(liveData.creditRecovery).toLocaleString()}</span></div>
          <div class="divider"></div>

          <div style="font-weight: bold; margin: 4px 0 2px;">4. EXPENSES & RETURNS (اخراجات و واپسی)</div>
          <div class="row"><span>Shop Expenses:</span><span class="bold">- Rs ${Math.round(liveData.expenses).toLocaleString()}</span></div>
          <div class="row"><span>Cash Returns:</span><span class="bold">- Rs ${Math.round(liveData.cashReturns).toLocaleString()}</span></div>
          <div class="double-divider"></div>

          <div class="total-box">
            <div class="total-title">NET CASH IN DRAWER (کیش دراز)</div>
            <div class="total-amount">Rs ${Math.round(activeExpectedCash).toLocaleString()}</div>
          </div>

          ${actualCash > 0 && discrepancy !== 0 ? `
            <div class="row"><span>Counted Cash:</span><span class="bold">Rs ${Math.round(actualCash).toLocaleString()}</span></div>
            <div class="row"><span>Difference (فرق):</span><span class="bold">${discrepancy >= 0 ? '+' : ''}Rs ${Math.round(discrepancy).toLocaleString()}</span></div>
            <div class="divider"></div>
          ` : ''}

          <div class="center" style="font-size: 11px; margin-top: 10px; color: #444;">
            <div>کمپیوٹرائزڈ تصدیق شدہ یومیہ رپورٹ</div>
            <div>FlourERP • Al-Madina System</div>
          </div>
        </body>
        </html>
      `;

      doc.open();
      doc.write(content);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 300);
    } catch (e) {
      console.error('Thermal print error:', e);
      window.print();
    }
  };

  // 2. Full A4 / PDF Export
  const handleA4PdfPrint = () => {
    generateTabularPdf({
      title: generalInfo.mill_name ? `${generalInfo.mill_name} - یومیہ مالیاتی رپورٹ` : 'Al-Madina Flour Mills - Daily Financial Report',
      subtitle: isUrdu ? 'آج کی مکمل کاروباری سمری، سیلز، پسائی و کیش دراز حساب' : 'Daily Sales, Pisai Milling, Credit Recoveries & Cash Reconciliation',
      dateRangeStr: currentDateStr,
      isUrdu,
      summaryCards: [
        { label: isUrdu ? 'کل پروڈکٹ سیلز' : 'Total Sales', value: `Rs ${Math.round(liveData.totalSales).toLocaleString()}`, color: '#059669' },
        { label: isUrdu ? 'گندم پسائی آمدن' : 'Pisai Milling', value: `Rs ${Math.round(liveData.totalPisai).toLocaleString()}`, color: '#EA580C' },
        { label: isUrdu ? 'ادھار وصولی' : 'Credit Recovered', value: `Rs ${Math.round(liveData.creditRecovery).toLocaleString()}`, color: '#D97706' },
        { label: isUrdu ? 'دکان کے اخراجات' : 'Shop Expenses', value: `Rs ${Math.round(liveData.expenses).toLocaleString()}`, color: '#DC2626' },
        { label: isUrdu ? 'کیش دراز خالص رقم' : 'Net Cash in Drawer', value: `Rs ${Math.round(activeExpectedCash).toLocaleString()}`, color: '#2563EB' },
      ],
      tables: [
        {
          title: isUrdu ? 'تفصیلات برائے یومیہ حساب کتاب' : 'Daily Accounts Breakdown',
          headers: isUrdu
            ? ['شعبہ / مد', 'تعداد', 'نقد وصولی', 'ادھار', 'کل رقم']
            : ['Section / Description', 'Count', 'Cash Collected', 'Credit (Udhaar)', 'Total Amount'],
          rows: [
            [
              isUrdu ? 'پروڈکٹ سیلز (آٹا، سوجی، میدہ)' : 'Product Sales (Atta, Suji, Maida)',
              `${liveData.billCount} bills`,
              `Rs ${Math.round(liveData.cashSales).toLocaleString()}`,
              `Rs ${Math.round(liveData.creditSales).toLocaleString()}`,
              `Rs ${Math.round(liveData.totalSales).toLocaleString()}`,
            ],
            [
              isUrdu ? 'گندم پسائی اجرت' : 'Wheat Grinding Services',
              `${liveData.pisaiCount} tokens`,
              `Rs ${Math.round(liveData.cashPisai).toLocaleString()}`,
              `Rs ${Math.round(liveData.creditPisai).toLocaleString()}`,
              `Rs ${Math.round(liveData.totalPisai).toLocaleString()}`,
            ],
            [
              isUrdu ? 'ادھار وصولی (کھاتہ داران)' : 'Customer Credit Repayments',
              '-',
              `Rs ${Math.round(liveData.creditRecovery).toLocaleString()}`,
              '-',
              `Rs ${Math.round(liveData.creditRecovery).toLocaleString()}`,
            ],
            [
              isUrdu ? 'دکان اخراجات و نقد واپسی' : 'Shop Expenses & Cash Returns',
              '-',
              `- Rs ${Math.round(liveData.expenses + liveData.cashReturns).toLocaleString()}`,
              '-',
              `- Rs ${Math.round(liveData.expenses + liveData.cashReturns).toLocaleString()}`,
            ],
          ],
          footers: [
            isUrdu ? 'خالص کیش دراز بیلنس (Net Cash)' : 'Net Cash in Drawer',
            '',
            `Rs ${Math.round(activeExpectedCash).toLocaleString()}`,
            '',
            `Rs ${Math.round(activeExpectedCash).toLocaleString()}`,
          ],
          alignments: ['left', 'center', 'right', 'right', 'right'],
        },
      ],
      notes: isUrdu ? 'کمپیوٹرائزڈ یومیہ مالیاتی رپورٹ - تصدیق شدہ' : 'Computerized Daily Financial Report - Verified and Stored',
    });
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
          maxWidth: '580px',
          maxHeight: '92vh',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          overflowY: 'auto',
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
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#1877F2',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Printer size={20} />
            </div>
            <div>
              <h2
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{ fontSize: '18px', fontWeight: 900, margin: 0, lineHeight: 1.2 }}
              >
                {t('آج کی یومیہ رپورٹ', 'Today\'s Daily Report')}
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>
                {t('فروخت، گندم پسائی، ادھار وصولی اور کیش دراز کا خلاصہ', 'Summary of sales, pisai, recoveries & drawer cash')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={fetchPreview}
              title={t('تازہ ترین ڈیٹا لائیں', 'Refresh data')}
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
              <RefreshCw size={15} className={isLoadingMetrics ? 'animate-spin' : ''} />
            </button>
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
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Metadata banner */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              fontSize: '12.5px',
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>{t('آپریٹر: ', 'Operator: ')}</span>
              <strong className="font-nastaleeq">{shiftData.operatorName || 'Cashier'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{t('کاؤنٹر: ', 'Counter: ')}</span>
              <strong>{isUrdu ? `کاؤنٹر #${shiftData.counter || '01'}` : `Counter #${shiftData.counter || '01'}`}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{t('تاریخ: ', 'Date: ')}</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{currentDateStr}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{t('وقت: ', 'Time: ')}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{currentTimeStr}</span>
            </div>
          </div>

          {/* Error banner */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1.5px solid #f87171',
                borderRadius: '10px',
                padding: '8px 12px',
                color: '#991b1b',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div
            style={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              fontSize: '13px',
            }}
          >
            {/* Row 1: Product Sales */}
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Banknote size={16} color="#15803d" />
                  <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800 }}>
                    {t('کل پروڈکٹ سیلز', 'Product Sales')}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>({liveData.billCount} {isUrdu ? 'بلز' : 'bills'})</span>
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#15803d', fontSize: '15px' }}>
                  {isUrdu ? `${Math.round(liveData.totalSales).toLocaleString()} روپے` : `Rs ${Math.round(liveData.totalSales).toLocaleString()}`}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginTop: '3px', paddingLeft: '22px' }}>
                <span>{t('نقد وصولی:', 'Cash:')} Rs {Math.round(liveData.cashSales).toLocaleString()}</span>
                <span>{t('ادھار:', 'Credit:')} Rs {Math.round(liveData.creditSales).toLocaleString()}</span>
              </div>
            </div>

            {/* Row 2: Pisai Milling */}
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#b45309" />
                  <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800 }}>
                    {t('گندم پسائی آمدن', 'Milling Revenue')}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>({liveData.pisaiCount} {isUrdu ? 'ٹوکنز' : 'tokens'})</span>
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#b45309', fontSize: '15px' }}>
                  {isUrdu ? `${Math.round(liveData.totalPisai).toLocaleString()} روپے` : `Rs ${Math.round(liveData.totalPisai).toLocaleString()}`}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginTop: '3px', paddingLeft: '22px' }}>
                <span>{t('نقد وصولی:', 'Cash:')} Rs {Math.round(liveData.cashPisai).toLocaleString()}</span>
                <span>{t('ادھار:', 'Credit:')} Rs {Math.round(liveData.creditPisai).toLocaleString()}</span>
              </div>
            </div>

            {/* Row 3: Credit Recovery */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#ffffff',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HandCoins size={16} color="#0284c7" />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800 }}>
                  {t('ادھار وصولی', 'Credit Recovered')}
                </span>
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#0284c7', fontSize: '15px' }}>
                {isUrdu ? `${Math.round(liveData.creditRecovery).toLocaleString()} روپے` : `Rs ${Math.round(liveData.creditRecovery).toLocaleString()}`}
              </strong>
            </div>

            {/* Row 4: Expenses & Returns */}
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
                <Receipt size={16} />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800 }}>
                  {t('دکان کے اخراجات و نقد واپسی', 'Shop Expenses & Returns')}
                </span>
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '15px' }}>
                {isUrdu
                  ? `- ${Math.round(liveData.expenses + liveData.cashReturns).toLocaleString()} روپے`
                  : `- Rs ${Math.round(liveData.expenses + liveData.cashReturns).toLocaleString()}`}
              </strong>
            </div>

            {/* Row 5: Drawer Cash Balance */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                backgroundColor: '#f0fdf4',
                borderTop: '2px solid #bbf7d0',
                fontSize: '15px',
                fontWeight: 900,
              }}
            >
              <div>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: '#166534' }}>
                  {t('کیش دراز میں کل نقد رقم', 'Net Cash in Drawer')}
                </span>
                <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                  {isUrdu ? 'نقد سیلز + نقد پسائی + ادھار وصولی - اخراجات' : 'Cash Sales + Pisai + Recovery - Expenses'}
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#15803d', fontSize: '20px', fontWeight: 900 }}>
                {isUrdu ? `${Math.round(activeExpectedCash).toLocaleString()} روپے` : `Rs ${Math.round(activeExpectedCash).toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Optional Counter Cash Calculator */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '12px',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Calculator size={15} />
                {t('کاؤنٹر کیش پڑتال (اختیاری):', 'Physical Cash Check (Optional):')}
              </label>
              {discrepancy !== 0 && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: discrepancy > 0 ? '#15803d' : '#b91c1c',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {t('فرق:', 'Diff:')} {discrepancy > 0 ? `+Rs ${Math.round(discrepancy).toLocaleString()}` : `-Rs ${Math.round(Math.abs(discrepancy)).toLocaleString()}`}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(e.target.value)}
                placeholder="0"
                style={{
                  flex: 1,
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '16px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  direction: 'ltr',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#475569' }}>
                {isUrdu ? 'روپے' : 'PKR'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Print Actions */}
        <div
          style={{
            padding: '14px 22px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('بند کریں', 'Close')}
          </button>

          <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
            {/* 1. Thermal Slip Print Button */}
            <button
              type="button"
              onClick={handleThermalPrint}
              className="touch-active"
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1.5px solid #1877F2',
                backgroundColor: '#EFF6FF',
                color: '#1877F2',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Receipt size={16} color="#1877F2" />
              <span className={isUrdu ? 'font-nastaleeq' : ''}>
                {t('تھرمل پرچی پرنٹ کریں', 'Print Thermal Slip')}
              </span>
            </button>

            {/* 2. Full A4 / PDF Report Button */}
            <button
              type="button"
              onClick={handleA4PdfPrint}
              className="touch-active"
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#1877F2',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: '0 2px 6px rgba(24, 119, 242, 0.3)',
              }}
            >
              <Printer size={16} color="#ffffff" />
              <span className={isUrdu ? 'font-nastaleeq' : ''}>
                {t('مکمل رپورٹ (A4 / PDF)', 'Print Full Report')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Backward-compatibility alias
export const ZReportModal = DailyReportModal;
export default DailyReportModal;
