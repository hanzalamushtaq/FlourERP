'use strict';
'use client';

import React, { useState } from 'react';
import { Factory, Check, Clock, Play } from 'lucide-react';

export interface ChakkiQueueItem {
  id: string;
  tokenNumber: number;
  customerName: string;
  chakkiName: string;
  weightKg: number;
  notes: string;
  status: 'grinding' | 'waiting' | 'ready';
  badgeBg: string;
}

const INITIAL_QUEUE: ChakkiQueueItem[] = [
  {
    id: '1',
    tokenNumber: 29,
    customerName: 'کامران شبیر (چکی 01)',
    chakkiName: 'چکی 01',
    weightKg: 40,
    notes: 'وزن: 40 KG • چھان کٹوتی: 1 KG',
    status: 'grinding',
    badgeBg: '#f59e0b',
  },
  {
    id: '2',
    tokenNumber: 30,
    customerName: 'میر عرفان علی (چکی 02)',
    chakkiName: 'چکی 02',
    weightKg: 80,
    notes: 'وزن: 80 KG • دو بوریاں',
    status: 'waiting',
    badgeBg: '#1e293b',
  },
  {
    id: '3',
    tokenNumber: 28,
    customerName: 'رانا زاہد حسین',
    chakkiName: 'چکی 01',
    weightKg: 35,
    notes: 'تیاری • کاؤنٹر سے وصول کریں',
    status: 'ready',
    badgeBg: '#10b981',
  },
];

interface ChakkiQueueCardProps {
  onTokenDelivered?: (tokenNumber: number) => void;
}

export const ChakkiQueueCard: React.FC<ChakkiQueueCardProps> = ({ onTokenDelivered }) => {
  const [queue, setQueue] = useState<ChakkiQueueItem[]>(INITIAL_QUEUE);

  const handleDeliver = (tokenNumber: number) => {
    setQueue((prev) => prev.filter((item) => item.tokenNumber !== tokenNumber));
    onTokenDelivered?.(tokenNumber);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        direction: 'rtl',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
            }}
          >
            <Factory size={18} />
          </div>
          <h3
            className="font-nastaleeq"
            style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}
          >
            چکی مشین و ٹوکن قطار
          </h3>
        </div>

        <span
          className="font-nastaleeq"
          style={{
            fontSize: '11px',
            fontWeight: 800,
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            padding: '3px 10px',
            borderRadius: '20px',
            border: '1px solid #bae6fd',
          }}
        >
          3 موٹرز فعال
        </span>
      </div>

      {/* Queue Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {queue.length === 0 ? (
          <div
            className="font-nastaleeq"
            style={{
              padding: '24px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '14px',
            }}
          >
            اس وقت قطار میں کوئی ٹوکن باقی نہیں ہے۔
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              {/* Right: Token Number Badge & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: item.badgeBg,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                  }}
                >
                  {item.tokenNumber}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    className="font-nastaleeq"
                    style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}
                  >
                    {item.customerName}
                  </div>
                  <div
                    className="font-nastaleeq"
                    style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}
                  >
                    {item.notes}
                  </div>
                </div>
              </div>

              {/* Left: Status Badge or Action Button */}
              <div>
                {item.status === 'grinding' && (
                  <span
                    className="font-nastaleeq"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Play size={10} fill="#b45309" />
                    پسائی جاری
                  </span>
                )}

                {item.status === 'waiting' && (
                  <span
                    className="font-nastaleeq"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Clock size={11} />
                    قطار میں (Waiting)
                  </span>
                )}

                {item.status === 'ready' && (
                  <button
                    type="button"
                    onClick={() => handleDeliver(item.tokenNumber)}
                    className="touch-active"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <Check size={14} />
                    <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800 }}>
                      ڈلیور
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
