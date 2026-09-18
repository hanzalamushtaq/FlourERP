'use strict';
'use client';

import React, { useState } from 'react';
import { NumericKeypad } from '../ui/NumericKeypad';
import { ReceiptPreviewModal, ReceiptData } from '../ui/ReceiptPreviewModal';
import { Sparkles, Ticket, Printer, User, ShieldCheck } from 'lucide-react';

export const PisaiBillingScreen: React.FC = () => {
  const [weightKg, setWeightKg] = useState<string>('25');
  const [chargeAmount, setChargeAmount] = useState<string>('150');
  const [activeInput, setActiveInput] = useState<'weight' | 'charge'>('weight');
  const [serviceType, setServiceType] = useState<'pisai' | 'safai_pisai'>('safai_pisai');
  const [customerName, setCustomerName] = useState<string>('');
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [tokenCounter, setTokenCounter] = useState<number>(482);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const numWeight = parseFloat(weightKg) || 0;
  const numCharge = parseFloat(chargeAmount) || 0;

  // Keypad Handlers
  const handleKeyPress = (key: string) => {
    if (activeInput === 'weight') {
      if (key === '.' && weightKg.includes('.')) return;
      setWeightKg((prev) => (prev === '0' && key !== '.' ? key : prev + key));
    } else {
      if (key === '.' && chargeAmount.includes('.')) return;
      setChargeAmount((prev) => (prev === '0' && key !== '.' ? key : prev + key));
    }
  };

  const handleClear = () => {
    if (activeInput === 'weight') setWeightKg('0');
    else setChargeAmount('0');
  };

  const handleBackspace = () => {
    if (activeInput === 'weight') {
      setWeightKg((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else {
      setChargeAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }
  };

  const handleQuickAdd = (amount: number) => {
    if (activeInput === 'weight') {
      const curr = parseFloat(weightKg) || 0;
      setWeightKg(String(curr + amount));
    } else {
      const curr = parseFloat(chargeAmount) || 0;
      setChargeAmount(String(curr + amount));
    }
  };

  const handleGenerateTicket = () => {
    if (numWeight <= 0 || numCharge <= 0) {
      alert('Please enter valid wheat weight and grinding fee.');
      return;
    }

    const tokenFormatted = String(tokenCounter).padStart(4, '0');
    setTokenCounter((prev) => prev + 1);

    const receipt: ReceiptData = {
      type: 'pisai',
      billNumber: `PISAI-${tokenFormatted}`,
      pisaiToken: tokenFormatted,
      serviceType: serviceType === 'safai_pisai' ? 'Safai + Pisai (صفائی اور پیسائی)' : 'Pisai Only (صرف پیسائی)',
      pisaiWeightKg: numWeight,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      billerName: 'Biller 1 (Counter)',
      customerName: customerName.trim() || undefined,
      isCredit,
      subtotal: numCharge,
      discount: 0,
      netTotal: numCharge,
    };

    setReceiptData(receipt);
    setIsReceiptOpen(true);
  };

  const currentTokenPreview = String(tokenCounter).padStart(4, '0');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(340px, 1fr)',
        gap: '20px',
        width: '100%',
      }}
    >
      {/* Left Column: Grinding Service Options & Token Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Pisai Header Banner */}
        <div
          style={{
            backgroundColor: 'var(--wheat-50)',
            border: '2px solid var(--wheat-400)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--wheat-700)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--wheat-700)' }}>
                Gundam Pisai Service
              </h2>
            </div>
            <p
              className="font-nastaleeq"
              style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}
            >
              گندم پیسائی و صفائی کاؤنٹر
            </p>
          </div>

          {/* Large Token Badge Preview */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '2px solid #000000',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              NEXT TOKEN
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                letterSpacing: '2px',
              }}
            >
              #{currentTokenPreview}
            </div>
          </div>
        </div>

        {/* Service Type Toggle Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div
            onClick={() => setServiceType('safai_pisai')}
            className="touch-active"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: serviceType === 'safai_pisai' ? 'var(--wheat-100)' : 'var(--bg-surface)',
              border: serviceType === 'safai_pisai' ? '2.5px solid var(--wheat-600)' : '1.5px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>Safai + Pisai</span>
              {serviceType === 'safai_pisai' && <ShieldCheck size={20} color="var(--wheat-700)" />}
            </div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '22px', fontWeight: 700, color: 'var(--wheat-700)', marginTop: '8px' }}
            >
              صفائی اور پیسائی
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Complete grain cleaning + fine grinding
            </div>
          </div>

          <div
            onClick={() => setServiceType('pisai')}
            className="touch-active"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: serviceType === 'pisai' ? 'var(--wheat-100)' : 'var(--bg-surface)',
              border: serviceType === 'pisai' ? '2.5px solid var(--wheat-600)' : '1.5px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>Pisai Only</span>
              {serviceType === 'pisai' && <ShieldCheck size={20} color="var(--wheat-700)" />}
            </div>
            <div
              className="font-nastaleeq"
              style={{ fontSize: '22px', fontWeight: 700, color: 'var(--wheat-700)', marginTop: '8px' }}
            >
              صرف پیسائی
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Standard grinding without pre-clean
            </div>
          </div>
        </div>

        {/* Customer Name & Udhaar Option */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--text-secondary)" />
            <span style={{ fontWeight: 700, fontSize: '14px' }}>Customer Details (اختیاری)</span>
          </div>
          <input
            type="text"
            placeholder="Enter customer name or phone (optional)..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border-medium)',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isCredit}
              onChange={(e) => setIsCredit(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--wheat-600)' }}
            />
            <span style={{ fontWeight: 700, fontSize: '13px', color: isCredit ? 'var(--wheat-700)' : 'var(--text-secondary)' }}>
              Assign to Udhaar / Credit Ledger (ادھار پر رکھیں)
            </span>
          </label>
        </div>
      </div>

      {/* Right Column: Weight & Charge Active Inputs + Numpad */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: 'var(--bg-surface)',
          padding: '18px',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Active Input Switchers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Weight Box */}
          <div
            onClick={() => setActiveInput('weight')}
            className="touch-active"
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeInput === 'weight' ? 'var(--wheat-50)' : 'var(--bg-subtle)',
              border: activeInput === 'weight' ? '2.5px solid var(--wheat-600)' : '1.5px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              WHEAT WEIGHT (وزن)
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                marginTop: '4px',
              }}
            >
              {weightKg || '0'} <span style={{ fontSize: '16px' }}>KG</span>
            </div>
          </div>

          {/* Charge Box */}
          <div
            onClick={() => setActiveInput('charge')}
            className="touch-active"
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeInput === 'charge' ? 'var(--wheat-50)' : 'var(--bg-subtle)',
              border: activeInput === 'charge' ? '2.5px solid var(--wheat-600)' : '1.5px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              MANUAL CHARGE (رقم)
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: 'var(--emerald-600)',
                marginTop: '4px',
              }}
            >
              Rs {chargeAmount || '0'}
            </div>
          </div>
        </div>

        {/* Informational Guidance */}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '2px 4px',
          }}
        >
          <span>Currently Editing: <strong>{activeInput === 'weight' ? 'Weight (KG)' : 'Amount (Rs)'}</strong></span>
          <span>Effective Rate: ~Rs {(numCharge / (numWeight || 1)).toFixed(1)}/KG</span>
        </div>

        {/* Numpad */}
        <NumericKeypad
          mode={activeInput === 'weight' ? 'weight' : 'amount'}
          onKeyPress={handleKeyPress}
          onClear={handleClear}
          onBackspace={handleBackspace}
          onQuickAdd={handleQuickAdd}
        />

        {/* Print Pisai Token Ticket Button */}
        <button
          type="button"
          onClick={handleGenerateTicket}
          disabled={numWeight <= 0 || numCharge <= 0}
          className="touch-active"
          style={{
            height: '66px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: numWeight > 0 && numCharge > 0 ? 'var(--wheat-600)' : 'var(--border-medium)',
            color: '#ffffff',
            border: 'none',
            fontSize: '19px',
            fontWeight: 800,
            cursor: numWeight > 0 && numCharge > 0 ? 'pointer' : 'not-allowed',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ticket size={28} />
            <div style={{ textAlign: 'left' }}>
              <div>Issue Token #{currentTokenPreview}</div>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 500 }}>
                {numWeight} KG Pisai • Print Ticket
              </div>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
            Rs {numCharge}
          </div>
        </button>
      </div>

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={receiptData}
      />
    </div>
  );
};
