'use strict';
'use client';

import React, { useState } from 'react';
import { Factory, Check } from 'lucide-react';

export interface ChakkiQueueItem {
  id: string;
  tokenNumber: number;
  customerName: string;
  weightKg: number;
  status: 'grinding' | 'waiting' | 'ready';
}

const INITIAL_QUEUE: ChakkiQueueItem[] = [
  {
    id: '1',
    tokenNumber: 29,
    customerName: 'کامران شبیر',
    weightKg: 40,
    status: 'grinding',
  },
  {
    id: '2',
    tokenNumber: 30,
    customerName: 'میر عرفان علی',
    weightKg: 80,
    status: 'waiting',
  },
  {
    id: '3',
    tokenNumber: 28,
    customerName: 'رانا زاہد حسین',
    weightKg: 35,
    status: 'ready',
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
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px',
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
          marginBottom: '12px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Factory size={16} color="#64748b" />
          <h3
            className="font-nastaleeq"
            style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}
          >
            چکی ٹوکن قطار
          </h3>
        </div>

        <span
          className="font-nastaleeq"
          style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700 }}
        >
          3 موٹرز فعال
        </span>
      </div>

      {/* Queue Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {queue.length === 0 ? (
          <div
            className="font-nastaleeq"
            style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}
          >
            کوئی ٹوکن قطار میں نہیں ہے۔
          </div>
        ) : (
          queue.map((item) => {
            const isGrinding = item.status === 'grinding';
            const isWaiting = item.status === 'waiting';
            const isReady = item.status === 'ready';

            const itemBg = isGrinding ? '#fffbeb' : isWaiting ? '#f0f9ff' : '#ecfdf5';
            const itemBorder = isGrinding ? '#fde68a' : isWaiting ? '#bae6fd' : '#a7f3d0';

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: itemBg,
                  border: `1px solid ${itemBorder}`,
                  borderRadius: '8px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: isGrinding ? '#b45309' : isWaiting ? '#0369a1' : '#15803d',
                      width: '28px',
                    }}
                  >
                    #{item.tokenNumber}
                  </span>

                  <div>
                    <div className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      {item.customerName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.weightKg} KG</div>
                  </div>
                </div>

                <div>
                  {isGrinding && (
                    <span
                      className="font-nastaleeq"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #fde68a',
                        color: '#b45309',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      پسائی جاری
                    </span>
                  )}

                  {isWaiting && (
                    <span
                      className="font-nastaleeq"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #bae6fd',
                        color: '#0369a1',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      قطار میں
                    </span>
                  )}

                  {isReady && (
                    <button
                      type="button"
                      onClick={() => handleDeliver(item.tokenNumber)}
                      className="touch-active"
                      style={{
                        backgroundColor: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 1px 2px rgba(21, 128, 61, 0.2)',
                      }}
                    >
                      <Check size={13} />
                      <span className="font-nastaleeq">ڈلیور</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
