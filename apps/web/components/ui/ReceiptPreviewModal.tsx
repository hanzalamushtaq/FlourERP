'use client';

import React from 'react';
import { Printer, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useGeneralInfo } from '../../lib/generalInfo';

export interface ReceiptData {
  type: 'product' | 'pisai';
  billNumber: string;
  timestamp: string;
  billerName: string;
  customerName?: string;
  items?: Array<{
    nameEn: string;
    nameUr: string;
    weightKg: number;
    ratePerKg: number;
    total: number;
  }>;
  serviceType?: string;
  pisaiWeightKg?: number;
  pisaiToken?: string;
  subtotal: number;
  discount: number;
  netTotal: number;
  cashReceived?: number;
  remainingBalance?: number;
  isCredit?: boolean;
  shortDiscount?: number;
  prevBalance?: number;
  creditAdded?: number;
  newBalance?: number;
}

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { isUrdu, t } = useLanguage();
  const generalInfo = useGeneralInfo();
  const [printed, setPrinted] = React.useState(false);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    setPrinted(true);

    try {
      let iframe = document.getElementById('thermal-print-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'thermal-print-iframe';
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

      const printableWidth = '72mm';
      const fontSize = '13px';
      const titleSize = '18px';

      const itemsHtml = data?.items && data.items.length > 0 ? `
        <table class="table">
          <thead>
            <tr>
              <th class="left">ITEM</th>
              <th class="center">QTY x RATE</th>
              <th class="right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((it) => `
              <tr>
                <td class="left bold">${it.nameUr || it.nameEn}</td>
                <td class="center">${Math.round(it.weightKg * 100) / 100} KG x ${it.ratePerKg}</td>
                <td class="right bold">Rs ${it.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="dashed"></div>
      ` : '';

      const pisaiDetailsHtml = data?.type === 'pisai' ? `
        <div class="row">
          <span>Service:</span>
          <span class="bold">${data.serviceType || 'Pisai'}</span>
        </div>
        <div class="row">
          <span>Wheat Weight:</span>
          <span class="bold">${data.pisaiWeightKg} KG</span>
        </div>
        <div class="dashed"></div>
      ` : '';

      const creditLedgerHtml = (data?.isCredit || (data?.newBalance !== undefined && data.newBalance > 0)) ? `
        <div class="dashed"></div>
        <div class="center bold" style="font-size: 11px; margin: 3px 0;">* CUSTOMER UDHAAR LEDGER (ادھار کھاتہ) *</div>
        <div class="row">
          <span>Current Credit:</span>
          <span>Rs ${data.creditAdded ?? (data.netTotal - (data.cashReceived || 0))}</span>
        </div>
        <div class="row">
          <span>Previous Balance:</span>
          <span>Rs ${data.prevBalance ?? 0}</span>
        </div>
        <div class="solid-double"></div>
        <div class="row bold">
          <span>TOTAL OUTSTANDING:</span>
          <span>Rs ${data.newBalance ?? ((data.prevBalance ?? 0) + (data.creditAdded ?? (data.netTotal - (data.cashReceived || 0))))}</span>
        </div>
        <div class="solid-double"></div>
      ` : '';

      const receiptHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Receipt #${data?.billNumber || 'Thermal'}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0mm !important;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              width: ${printableWidth};
              margin: 0 auto;
              padding: 2mm 1mm 16mm 1mm;
              font-family: 'Courier New', Courier, 'Lucida Console', monospace, system-ui, sans-serif;
              font-size: ${fontSize};
              font-weight: 600;
              color: #000000;
              line-height: 1.3;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .left { text-align: left; }
            .bold { font-weight: 900; }
            .dashed {
              border-bottom: 1px dashed #000000;
              margin: 5px 0;
            }
            .solid-double {
              border-bottom: 2px solid #000000;
              margin: 5px 0;
            }
            .header-title {
              font-size: ${titleSize};
              font-weight: 900;
              text-align: center;
              margin-bottom: 2px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .sub-header {
              font-size: 10px;
              text-align: center;
              color: #111;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              margin: 2px 0;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
            }
            .table th {
              border-bottom: 1px dashed #000;
              padding: 3px 0;
              font-size: ${fontSize};
              font-weight: 900;
            }
            .table td {
              padding: 3px 0;
              vertical-align: top;
            }
            .large-total {
              font-size: 18px;
              font-weight: 900;
            }
            .cutter-space {
              height: 18mm;
            }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 13px; margin-bottom: 4px;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <div class="header-title">${generalInfo.mill_name || 'AL-MADINA FLOUR MILLS'}</div>
          ${generalInfo.tagline ? `<div class="sub-header">${generalInfo.tagline}</div>` : ''}
          <div class="sub-header">
            ${[generalInfo.address, generalInfo.city].filter(Boolean).join(', ') || 'Main Bazaar, Near Clock Tower'}
          </div>
          ${generalInfo.phone_primary ? `<div class="sub-header">Phone: ${generalInfo.phone_primary}</div>` : ''}
          <div class="dashed"></div>

          <div class="row">
            <span>${data?.type === 'pisai' ? 'PISAI TOKEN:' : 'BILL NO:'}</span>
            <span class="bold">#${data?.billNumber}</span>
          </div>
          <div class="row">
            <span>DATE/TIME:</span>
            <span>${data?.timestamp}</span>
          </div>
          <div class="row">
            <span>OPERATOR:</span>
            <span>${data?.billerName}</span>
          </div>
          ${data?.customerName ? `
          <div class="row">
            <span>CUSTOMER:</span>
            <span class="bold">${data.customerName}</span>
          </div>` : ''}

          ${data?.isCredit ? `
          <div class="center bold" style="border: 1px solid #000; padding: 2px; margin: 4px 0;">
            *** CREDIT BILL / ادھار کھاتہ ***
          </div>` : ''}

          ${data?.type === 'pisai' && data.pisaiToken ? `
          <div class="center" style="border: 2px solid #000; padding: 6px; margin: 6px 0;">
            <div style="font-size: 10px;">TOKEN NUMBER</div>
            <div class="bold" style="font-size: 26px;">${data.pisaiToken}</div>
          </div>` : ''}

          <div class="dashed"></div>

          ${itemsHtml}
          ${pisaiDetailsHtml}

          <div class="row">
            <span>Subtotal:</span>
            <span>Rs ${data?.subtotal}</span>
          </div>
          ${(data?.discount || 0) > 0 ? `
          <div class="row">
            <span>Discount:</span>
            <span>-Rs ${data.discount}</span>
          </div>` : ''}
          ${(data?.shortDiscount || 0) > 0 ? `
          <div class="row">
            <span>Short Discount:</span>
            <span>-Rs ${data.shortDiscount}</span>
          </div>` : ''}

          <div class="solid-double"></div>
          <div class="row large-total">
            <span>TOTAL BILL:</span>
            <span>Rs ${data?.netTotal}</span>
          </div>
          <div class="solid-double"></div>

          <div class="row">
            <span>Cash Received:</span>
            <span class="bold">Rs ${data?.cashReceived ?? data?.netTotal}</span>
          </div>
          ${(data?.cashReceived || 0) > (data?.netTotal || 0) ? `
          <div class="row">
            <span>Change Returned:</span>
            <span class="bold">Rs ${(data?.cashReceived || 0) - (data?.netTotal || 0)}</span>
          </div>` : ''}

          ${creditLedgerHtml}

          <div class="center" style="margin-top: 8px; font-size: 10px;">
            <div>Thank you for your patronage!</div>
            <div style="font-size: 9px; margin-top: 2px;">مال موقع پر چیک کریں۔ بعد میں واپسی نہ ہوگی۔</div>
            <div style="font-size: 8px; margin-top: 4px; color: #555;">* Powered by FlourERP *</div>
          </div>

          <div class="cutter-space"></div>
        </body>
        </html>
      `;

      doc.open();
      doc.write(receiptHtml);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Iframe print error, falling back to window.print():', e);
          window.print();
        }
      }, 250);
    } catch (err) {
      console.error('Thermal print failed:', err);
      window.print();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        backgroundColor: 'rgba(65, 72, 51, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#F4F5EE',
          borderRadius: '16px',
          border: '2px solid #B6AD90',
          overflow: 'hidden',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: '#C2C5AA',
            borderBottom: '1.5px solid #B6AD90',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="#414833" />
            <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800, fontSize: '15px', color: '#414833' }}>
              {t('تھرمل پرچی پیش نظارہ', 'Thermal Receipt Preview')}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#414833',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Print Stylesheet for Thermal Roll (80mm) */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: 80mm auto !important;
              margin: 0mm !important;
            }
            html, body {
              width: 72mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
            body * {
              visibility: hidden !important;
            }
            #thermal-receipt-printable, #thermal-receipt-printable * {
              visibility: visible !important;
            }
            #thermal-receipt-printable {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 72mm !important;
              max-width: 72mm !important;
              padding: 2mm 1mm 16mm 1mm !important;
              margin: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              border: none !important;
              box-shadow: none !important;
            }
          }
        `}} />

        {/* Scrollable Receipt Body (Simulated ESC/POS Roll) */}
        <div
          id="thermal-receipt-printable"
          style={{
            padding: '20px 18px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: 1.4,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            {isUrdu && (
              <div className="font-nastaleeq" style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}
            {generalInfo.logo_url && (
              <img
                src={generalInfo.logo_url}
                alt="Mill Logo"
                style={{
                  maxHeight: '40px',
                  maxWidth: '120px',
                  objectFit: 'contain',
                  margin: '0 auto 6px auto',
                  display: 'block',
                }}
              />
            )}
            <div
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{ fontSize: '16px', fontWeight: 900, marginTop: '2px', color: '#0f172a', letterSpacing: isUrdu ? 'normal' : '0.5px' }}
            >
              {generalInfo.mill_name || t('المدینہ چکی و فلور ملز', 'AL-MADINA FLOUR MILLS')}
            </div>
            {generalInfo.tagline && (
              <div style={{ fontSize: '9px', fontStyle: 'italic', color: '#475569', marginTop: '1px' }}>
                {generalInfo.tagline}
              </div>
            )}
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
              {[
                generalInfo.address,
                generalInfo.city,
                generalInfo.phone_primary ? `${t('فون:', 'Ph:')} ${generalInfo.phone_primary}` : null,
              ].filter(Boolean).join(' • ') || t('مین بازار، نزد گھنٹہ گھر • فون: 0300-1234567', 'Main Bazaar, Near Clock Tower • Ph: 0300-1234567')}
            </div>
            <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '10px 0' }} />
          </div>

          {/* Bill / Token Identifiers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{data.type === 'pisai' ? t('پسائی ٹوکن نمبر:', 'PISAI TOKEN:') : t('بل نمبر:', 'BILL NO:')}</span>
            <strong style={{ fontSize: '13px' }}>{data.billNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '11px' }}>
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('تاریخ / وقت:', 'DATE/TIME:')}</span>
            <span>{data.timestamp}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '11px' }}>
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('آپریٹر:', 'OPERATOR:')}</span>
            <span className="font-nastaleeq">{data.billerName}</span>
          </div>
          {data.customerName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '11px' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('گاہک کا نام:', 'CUSTOMER:')}</span>
              {/* Customer name is kept verbatim in the language written */}
              <strong className="font-nastaleeq">{data.customerName}</strong>
            </div>
          )}

          {data.isCredit && (
            <div
              style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#b45309',
                fontWeight: 800,
                textAlign: 'center',
                padding: '4px',
                borderRadius: '4px',
                margin: '8px 0',
                fontSize: '11px',
              }}
            >
              {t('*** ادھار کھاتہ بل ***', '*** CREDIT BILL ***')}
            </div>
          )}

          {/* Clean Pisai Token Callout */}
          {data.type === 'pisai' && data.pisaiToken && (
            <div
              style={{
                border: '1.5px solid #0f172a',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center',
                margin: '10px 0',
                backgroundColor: '#f8fafc',
              }}
            >
              <div
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{ fontSize: '11px', fontWeight: 700, letterSpacing: isUrdu ? 'normal' : '0.5px', color: '#64748b' }}
              >
                {t('گاہک ٹوکن نمبر', 'CUSTOMER TOKEN NUMBER')}
              </div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 900,
                  letterSpacing: '2px',
                  lineHeight: 1.1,
                  margin: '4px 0',
                  color: '#0f172a',
                }}
              >
                {data.pisaiToken}
              </div>
            </div>
          )}

          <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '10px 0' }} />

          {/* Line Items Table */}
          {data.items && data.items.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderBottom: '1px solid #B6AD90',
                  paddingBottom: '4px',
                  marginBottom: '6px',
                }}
              >
                <span>{t('آئٹم', 'ITEM')}</span>
                <span style={{ textAlign: 'center' }}>{t('مقدار x ریٹ', 'QTY x RATE')}</span>
                <span style={{ textAlign: 'right' }}>{t('رقم', 'TOTAL')}</span>
              </div>
              {data.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    fontSize: '12px',
                    marginBottom: '4px',
                  }}
                >
                  <div>
                    <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', fontWeight: 700 }}>
                      {isUrdu ? item.nameUr : item.nameEn}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', paddingTop: '2px' }}>
                    {Math.round(item.weightKg * 100) / 100} {isUrdu ? 'کلو' : 'kg'} x {item.ratePerKg}
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, paddingTop: '2px' }}>
                    {isUrdu ? `${item.total} روپے` : `Rs ${item.total}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pisai Specific Details */}
          {data.type === 'pisai' && (
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('پسائی کی قسم:', 'SERVICE TYPE:')}</span>
                <strong>{data.serviceType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('گندم کا وزن:', 'WHEAT WEIGHT:')}</span>
                <strong>{data.pisaiWeightKg} {isUrdu ? 'کلو' : 'KG'}</strong>
              </div>
            </div>
          )}

          <div style={{ borderBottom: '1px dashed #B6AD90', margin: '12px 0' }} />

          {/* Calculations */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('کل بل:', 'Total Bill:')}</span>
            <span>{isUrdu ? `${data.subtotal} روپے` : `Rs ${data.subtotal}`}</span>
          </div>

          {(() => {
            const calculatedDiscount = Math.max(0, (data.subtotal || 0) - (data.netTotal || 0));
            const displayDiscount = calculatedDiscount > 0 ? calculatedDiscount : ((data.discount || 0) + (data.shortDiscount || 0));
            const creditPortion = data.isCredit && (data.creditAdded !== undefined ? data.creditAdded : (data.remainingBalance || 0)) > 0
              ? (data.creditAdded !== undefined ? data.creditAdded : (data.remainingBalance || 0))
              : 0;

            const deduction = displayDiscount > 0 ? displayDiscount : creditPortion;
            if (deduction <= 0) return null;

            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                  color: '#B91C1C',
                  fontWeight: 700,
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('رعایت / ادھار:', 'Discount / Credit:')}
                </span>
                <span>{isUrdu ? `- ${deduction} روپے` : `- Rs ${deduction}`}</span>
              </div>
            );
          })()}

          {/* Cash Received (Primary Total) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 900,
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '2px solid #414833',
            }}
          >
            <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('وصول شدہ نقد:', 'Cash Received:')}</span>
            <span>{isUrdu ? `${data.cashReceived !== undefined ? data.cashReceived : data.netTotal} روپے` : `Rs ${data.cashReceived !== undefined ? data.cashReceived : data.netTotal}`}</span>
          </div>

          {/* Change Returned if paid more than net total */}
          {data.cashReceived !== undefined && data.cashReceived > data.netTotal && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '13px', fontWeight: 700, color: '#047857' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('بقایا واپسی:', 'Change Returned:')}</span>
              <span>{isUrdu ? `${data.cashReceived - data.netTotal} روپے` : `Rs ${data.cashReceived - data.netTotal}`}</span>
            </div>
          )}

          {/* Credit Ledger Card on Receipt */}
          {(data.isCredit || (data.newBalance !== undefined && data.newBalance > 0)) && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#EFECE6',
                border: '1.5px dashed #A39B8B',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#5C3617',
                  textAlign: 'center',
                  borderBottom: '1px solid #D5CEBF',
                  paddingBottom: '4px',
                }}
              >
                {t('ادھار کھاتہ تفصیل (Customer Ledger)', 'Customer Udhaar Ledger')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#414833' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('موجودہ بل ادھار:', 'Current Bill Credit:')}</span>
                <span>{isUrdu ? `${data.creditAdded ?? (data.netTotal - (data.cashReceived || 0))} روپے` : `Rs ${data.creditAdded ?? (data.netTotal - (data.cashReceived || 0))}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('سابقہ بقایا ادھار:', 'Previous Credit:')}</span>
                <span>{isUrdu ? `${(data.prevBalance || 0).toLocaleString()} روپے` : `Rs ${(data.prevBalance || 0).toLocaleString()}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#B91C1C',
                  borderTop: '1.5px solid #8C582B',
                  paddingTop: '6px',
                  marginTop: '2px',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('کل واجب الادا رقم:', 'TOTAL OUTSTANDING:')}</span>
                <span>{isUrdu ? `${(data.newBalance ?? ((data.prevBalance || 0) + (data.creditAdded ?? (data.netTotal - (data.cashReceived || 0))))).toLocaleString()} روپے` : `Rs ${(data.newBalance ?? ((data.prevBalance || 0) + (data.creditAdded ?? (data.netTotal - (data.cashReceived || 0))))).toLocaleString()}`}</span>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <div className="font-nastaleeq" style={{ fontSize: '16px' }}>
              {t('مال موقع پر چیک کریں۔ بعد میں واپسی نہ ہوگی۔', 'Please check items upon receiving. No returns afterwards.')}
            </div>
            <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '11px', color: '#414833', marginTop: '4px' }}>
              {t('آپ کی تشریف آوری کا شکریہ!', 'Thank You for Your Business!')}
            </div>
            <div style={{ fontSize: '10px', color: '#656D4A', marginTop: '6px' }}>
              * Powered by FlourERP • Continuous Sequential Audit *
            </div>
          </div>
        </div>



        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#C2C5AA',
            borderTop: '1.5px solid #B6AD90',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={() => handlePrint()}
            className="touch-active"
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#7F4F24',
              color: '#F4F5EE',
              border: 'none',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {printed ? <CheckCircle2 size={20} color="#F4F5EE" /> : <Printer size={20} color="#F4F5EE" />}
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {printed ? t('پرنٹ ڈائیلاگ کھل گیا!', 'Print Dialog Opened!') : t('تھرمل پرنٹر پر پرنٹ کریں', 'Print Thermal Receipt')}
            </span>
          </button>
          <button
            onClick={() => handlePrint()}
            className="touch-active"
            style={{
              height: '48px',
              padding: '0 14px',
              borderRadius: '12px',
              backgroundColor: '#F4F5EE',
              color: '#414833',
              border: '1.5px solid #B6AD90',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
            title="Reprint byte-identical copy"
          >
            <RefreshCw size={16} color="#414833" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('دوبارہ پرنٹ', 'Reprint')}
            </span>
          </button>
          <button
            onClick={onClose}
            className="touch-active"
            style={{
              height: '48px',
              padding: '0 14px',
              borderRadius: '12px',
              backgroundColor: '#414833',
              color: '#F4F5EE',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('بند کریں', 'Done / Close')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
