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
        backgroundColor: 'rgba(27, 30, 19, 0.7)',
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
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '2.5px solid #5E6348',
          overflow: 'hidden',
          boxShadow: '0 20px 35px rgba(121, 125, 98, 0.25)',
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
            backgroundColor: '#FFCB69',
            borderBottom: '2px solid #5E6348',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={20} color="#1B1E13" strokeWidth={2.5} />
            <span style={{ fontWeight: 900, fontSize: '16px', color: '#1B1E13' }}>Thermal Receipt Preview</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1B1E13',
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
            backgroundColor: '#FCFBF7',
            color: '#1B1E13',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: 1.4,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div className="font-nastaleeq" style={{ fontSize: '20px', fontWeight: 700, color: '#1B1E13' }}>
              Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„ÙŽÙ‘Ù‡Ù Ø§Ù„Ø±ÙŽÙ‘Ø­Ù’Ù…ÙŽÙ°Ù†Ù Ø§Ù„Ø±ÙŽÙ‘Ø­ÙÙŠÙ…Ù
            </div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px', color: '#1B1E13' }}
            >
              Ø§Ù„Ù…Ø¯ÛŒÙ†Û Ú†Ú©ÛŒ Ùˆ ÙÙ„ÙˆØ± Ù…Ù„Ø²
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', color: '#1B1E13' }}>
              AL-MADINA FLOUR MILLS
            </div>
            <div style={{ fontSize: '11px', color: '#1B1E13', marginTop: '2px' }}>
              Main Bazaar, Near Clock Tower â€¢ Ph: 0300-1234567
            </div>
            <div style={{ borderBottom: '1px dashed #BAA587', margin: '12px 0' }} />
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
                backgroundColor: '#FFFFFF',
                border: '2px solid #5E6348',
                color: '#1B1E13',
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
                border: '2px solid #5E6348',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                margin: '12px 0',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#1B1E13' }}>
                CUSTOMER TOKEN NUMBER
              </div>
              <div
                style={{
                  fontSize: '46px',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  lineHeight: 1.1,
                  margin: '4px 0',
                  color: '#1B1E13',
                }}
              >
                {data.pisaiToken}
              </div>
              <div className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 700, color: '#1B1E13' }}>
                Ù¹ÙˆÚ©Ù† Ù†Ù…Ø¨Ø± Ú¯Ù†Ø¯Ù… Ù¾ÛŒØ³Ø§Ø¦ÛŒ
              </div>
            </div>
          )}

          <div style={{ borderBottom: '1px dashed #BAA587', margin: '12px 0' }} />

          {/* Line Items Table */}
          {data.items && data.items.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  fontWeight: 700,
                  fontSize: '11px',
                  borderBottom: '2px solid #5E6348',
                  paddingBottom: '4px',
                  marginBottom: '6px',
                }}
              >
                <span>ITEM (Ø¢Ø¦Ù¹Ù…)</span>
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

          <div style={{ borderBottom: '1px dashed #BAA587', margin: '12px 0' }} />

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
                color: '#1B1E13',
                fontWeight: 700,
              }}
            >
              <span>Discount (Ø±Ø¹Ø§ÛŒØª):</span>
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
              borderTop: '2px solid #5E6348',
            }}
          >
            <span>TOTAL BILL:</span>
            <span>Rs {data.netTotal}</span>
          </div>

          {data.cashReceived !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '13px', fontWeight: 700 }}>
              <span>CASH RECEIVED (ÙˆØµÙˆÙ„):</span>
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
                color: '#1B1E13',
                borderTop: '1px dashed #BAA587',
                paddingTop: '4px',
              }}
            >
              <span>{data.isCredit ? 'CREDIT / UDHAAR (Ø¨Ù‚Ø§ÛŒØ§ Ø§Ø¯Ú¾Ø§Ø±):' : 'WAIVED / SHORT (Ú†Ú¾ÙˆÙ¹):'}</span>
              <span>Rs {data.remainingBalance}</span>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <div className="font-nastaleeq" style={{ fontSize: '16px' }}>
              Ù…Ø§Ù„ Ù…ÙˆÙ‚Ø¹ Ù¾Ø± Ú†ÛŒÚ© Ú©Ø±ÛŒÚºÛ” Ø¨Ø¹Ø¯ Ù…ÛŒÚº ÙˆØ§Ù¾Ø³ÛŒ Ù†Û ÛÙˆÚ¯ÛŒÛ”
            </div>
            <div style={{ fontSize: '11px', color: '#1B1E13', marginTop: '4px' }}>
              Thank You for Your Business!
            </div>
            <div style={{ fontSize: '10px', color: '#1B1E13', marginTop: '6px' }}>
              * Powered by FlourERP â€¢ Continuous Sequential Audit *
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#FFFFFF',
            borderTop: '2px solid #C2BAAA',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            onClick={handlePrint}
            className="touch-active"
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#E8AC65',
              color: '#1B1E13',
              border: '2px solid #5E6348',
              fontSize: '17px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 10px rgba(121, 125, 98, 0.25)',
            }}
          >
            {printed ? <CheckCircle2 size={22} color="#1B1E13" /> : <Printer size={22} color="#1B1E13" strokeWidth={2.5} />}
            {printed ? 'Print Dispatched!' : 'Print Bill (ESC/POS)'}
          </button>
          <button
            onClick={handlePrint}
            className="touch-active"
            style={{
              height: '52px',
              padding: '0 16px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              color: '#1B1E13',
              border: '2.5px solid #5E6348',
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            title="Reprint byte-identical copy"
          >
            <RefreshCw size={16} color="#1B1E13" /> Reprint
          </button>
        </div>
      </div>
    </div>
  );
};

