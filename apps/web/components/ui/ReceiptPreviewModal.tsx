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
          boxShadow: '0 20px 35px rgba(65, 72, 51, 0.25)',
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
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#414833' }}>Thermal Receipt Preview</span>
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

        {/* Scrollable Receipt Body (Simulated ESC/POS 80mm Roll) */}
        <div
          style={{
            padding: '24px 20px',
            overflowY: 'auto',
            backgroundColor: '#F4F5EE',
            color: '#414833',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: 1.4,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#414833' }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px', color: '#414833' }}
            >
              المدینہ چکی و فلور ملز
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', color: '#414833' }}>
              AL-MADINA FLOUR MILLS
            </div>
            <div style={{ fontSize: '11px', color: '#414833', marginTop: '2px' }}>
              Main Bazaar, Near Clock Tower • Ph: 0300-1234567
            </div>
            <div style={{ borderBottom: '1px dashed #B6AD90', margin: '12px 0' }} />
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
                backgroundColor: '#C2C5AA',
                border: '1px solid #B6AD90',
                color: '#414833',
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
                border: '2px solid #414833',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                margin: '12px 0',
                backgroundColor: '#C2C5AA',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#414833' }}>
                CUSTOMER TOKEN NUMBER
              </div>
              <div
                style={{
                  fontSize: '46px',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  lineHeight: 1.1,
                  margin: '4px 0',
                  color: '#414833',
                }}
              >
                {data.pisaiToken}
              </div>
              <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: '#414833' }}>
                ٹوکن نمبر گندم پیسائی
              </div>
            </div>
          )}

          <div style={{ borderBottom: '1px dashed #B6AD90', margin: '12px 0' }} />

          {/* Line Items Table */}
          {data.items && data.items.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div
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

          <div style={{ borderBottom: '1px dashed #B6AD90', margin: '12px 0' }} />

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
                color: '#414833',
                fontWeight: 700,
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
              borderTop: '2px solid #414833',
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
                color: '#414833',
                borderTop: '1px dashed #B6AD90',
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
            <div style={{ fontSize: '11px', color: '#414833', marginTop: '4px' }}>
              Thank You for Your Business!
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
            onClick={handlePrint}
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
            {printed ? 'Print Dispatched!' : 'Print Bill (ESC/POS)'}
          </button>
          <button
            onClick={handlePrint}
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
            <RefreshCw size={16} color="#414833" /> Reprint
          </button>
        </div>
      </div>
    </div>
  );
};
