'use strict';
'use client';

import React from 'react';
import { Printer, RefreshCw, X, CheckCircle2 } from 'lucide-react';

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
  const [printed, setPrinted] = React.useState(false);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => {
      setPrinted(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
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
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
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
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="var(--wheat-700)" />
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Thermal Receipt Preview</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Receipt Body (Simulated ESC/POS 80mm Roll) */}
        <div
          style={{
            padding: '24px 20px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            color: '#111827',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: 1.4,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700 }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px', color: '#000000' }}
            >
              المدینہ چکی و فلور ملز
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>
              AL-MADINA FLOUR MILLS
            </div>
            <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
              Main Bazaar, Near Clock Tower • Ph: 0300-1234567
            </div>
            <div style={{ borderBottom: '1px dashed #9ca3af', margin: '12px 0' }} />
          </div>

          {/* Bill / Token Identifiers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>{data.type === 'pisai' ? 'PISAI TOKEN:' : 'BILL NO:'}</span>
            <strong style={{ fontSize: '14px' }}>{data.billNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
            <span>DATE/TIME:</span>
            <span>{data.timestamp}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
            <span>OPERATOR:</span>
            <span>{data.billerName}</span>
          </div>
          {data.customerName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
              <span>CUSTOMER:</span>
              <strong>{data.customerName}</strong>
            </div>
          )}

          {data.isCredit && (
            <div
              style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #d97706',
                color: '#92400e',
                fontWeight: 800,
                textAlign: 'center',
                padding: '4px',
                borderRadius: '4px',
                margin: '8px 0',
                fontSize: '12px',
              }}
            >
              *** UDHAAR / CREDIT BILL ***
            </div>
          )}

          {/* Large Pisai Token Callout */}
          {data.type === 'pisai' && data.pisaiToken && (
            <div
              style={{
                border: '2px solid #000000',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                margin: '12px 0',
                backgroundColor: '#f9fafb',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                CUSTOMER TOKEN NUMBER
              </div>
              <div
                style={{
                  fontSize: '46px',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  lineHeight: 1.1,
                  margin: '4px 0',
                }}
              >
                {data.pisaiToken}
              </div>
              <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700 }}>
                ٹوکن نمبر گندم پیسائی
              </div>
            </div>
          )}

          <div style={{ borderBottom: '1px dashed #9ca3af', margin: '12px 0' }} />

          {/* Line Items Table */}
          {data.items && data.items.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderBottom: '1px solid #d1d5db',
                  paddingBottom: '4px',
                  marginBottom: '6px',
                }}
              >
                <span>ITEM (آئٹم)</span>
                <span style={{ textAlign: 'center' }}>QTY x RATE</span>
                <span style={{ textAlign: 'right' }}>TOTAL</span>
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
                    <div style={{ fontWeight: 600 }}>{item.nameEn}</div>
                    <div className="font-nastaleeq" style={{ fontSize: '14px', lineHeight: 1.2 }}>
                      {item.nameUr}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', paddingTop: '2px' }}>
                    {item.weightKg}kg x {item.ratePerKg}
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, paddingTop: '2px' }}>
                    Rs {item.total}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.type === 'pisai' && (
            <div style={{ fontSize: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>SERVICE TYPE:</span>
                <strong>{data.serviceType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>WHEAT WEIGHT:</span>
                <strong>{data.pisaiWeightKg} KG</strong>
              </div>
            </div>
          )}

          <div style={{ borderBottom: '1px dashed #9ca3af', margin: '12px 0' }} />

          {/* Calculations */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Subtotal:</span>
            <span>Rs {data.subtotal}</span>
          </div>
          {data.discount > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
                color: '#b91c1c',
              }}
            >
              <span>Discount (رعایت):</span>
              <span>- Rs {data.discount}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 900,
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '2px solid #000000',
            }}
          >
            <span>TOTAL BILL:</span>
            <span>Rs {data.netTotal}</span>
          </div>

          {data.cashReceived !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '13px', fontWeight: 700 }}>
              <span>CASH RECEIVED (وصول):</span>
              <span>Rs {data.cashReceived}</span>
            </div>
          )}

          {data.remainingBalance !== undefined && data.remainingBalance > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontSize: '14px',
                fontWeight: 800,
                color: '#b45309',
                borderTop: '1px dashed #d1d5db',
                paddingTop: '4px',
              }}
            >
              <span>{data.isCredit ? 'CREDIT / UDHAAR (بقایا ادھار):' : 'WAIVED / SHORT (چھوٹ):'}</span>
              <span>Rs {data.remainingBalance}</span>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <div className="font-nastaleeq" style={{ fontSize: '16px' }}>
              مال موقع پر چیک کریں۔ بعد میں واپسی نہ ہوگی۔
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
              Thank You for Your Business!
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px' }}>
              * Powered by FlourERP • Continuous Sequential Audit *
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-medium)',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={handlePrint}
            className="touch-active"
            style={{
              flex: 1,
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald-600)',
              color: '#ffffff',
              border: 'none',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {printed ? <CheckCircle2 size={20} /> : <Printer size={20} />}
            {printed ? 'Print Dispatched!' : 'Print Bill (ESC/POS)'}
          </button>
          <button
            onClick={handlePrint}
            className="touch-active"
            style={{
              height: '48px',
              padding: '0 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1.5px solid var(--border-medium)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
            title="Reprint byte-identical copy"
          >
            <RefreshCw size={16} /> Reprint
          </button>
        </div>
      </div>
    </div>
  );
};
