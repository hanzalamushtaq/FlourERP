'use strict';
'use client';

import React, { useState } from 'react';

export interface ChakkiQueueItem {
  id: string;
  tokenNumber: string | number;
  customerName: string;
  weightKg: number;
  status: 'grinding' | 'waiting' | 'ready';
}

const SAMPLE_QUEUE: ChakkiQueueItem[] = [
  {
    id: '1',
    tokenNumber: 'T-1001',
    customerName: 'احمد خان',
    weightKg: 50,
    status: 'ready',
  },
  {
    id: '2',
    tokenNumber: 'T-1002',
    customerName: 'بلال شیخ',
    weightKg: 30,
    status: 'grinding',
  },
  {
    id: '3',
    tokenNumber: 'T-1003',
    customerName: 'عمران علی',
    weightKg: 80,
    status: 'waiting',
  },
  {
    id: '4',
    tokenNumber: 'T-1004',
    customerName: 'عمران علی',
    weightKg: 40,
    status: 'ready',
  },
  {
    id: '5',
    tokenNumber: 'T-1005',
    customerName: 'عمران علی',
    weightKg: 30,
    status: 'waiting',
  },
];

interface ChakkiQueueCardProps {
  onTokenDelivered?: (tokenNumber: number | string) => void;
}

export const ChakkiQueueCard: React.FC<ChakkiQueueCardProps> = ({ onTokenDelivered }) => {
  const [queue, setQueue] = useState<ChakkiQueueItem[]>(SAMPLE_QUEUE);

  const handleDeliver = (tokenNumber: number | string) => {
    setQueue((prev) => prev.filter((item) => item.tokenNumber !== tokenNumber));
    onTokenDelivered?.(tokenNumber);
  };

  return (
    <div
      className="dash-card-animated"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid #EBE4DA',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Centered Title */}
      <h3
        style={{
          fontFamily: 'var(--font-urdu)',
          fontSize: '18px',
          fontWeight: 900,
          color: '#1F2937',
          textAlign: 'center',
          margin: '0 0 14px 0',
          direction: 'rtl',
        }}
      >
        Token Queue / چکی ٹوکن قطار
      </h3>

      {/* Table Container */}
      <div style={{ width: '100%', overflowX: 'auto', borderRadius: '8px' }}>
        <table
          style={{
            width: '100%',
            minWidth: '450px',
            borderCollapse: 'collapse',
            direction: 'rtl',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#A66336', // Solid brown spanning full width
                color: '#FFFFFF',
              }}
            >
              <th
                style={{
                  width: '26%',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  textAlign: 'right',
                  borderTopRightRadius: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                حیثیت
              </th>
              <th
                style={{
                  width: '22%',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                مقدار KG
              </th>
              <th
                style={{
                  width: '28%',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                گاہک کا نام
              </th>
              <th
                style={{
                  width: '24%',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'left',
                  borderTopLeftRadius: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                Token No
              </th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item, idx) => {
              const isReady = item.status === 'ready';
              const isGrinding = item.status === 'grinding';
              const dotColor = isReady ? '#16A34A' : isGrinding ? '#0284C7' : '#EA580C';
              const statusText = isReady ? 'تیار' : isGrinding ? 'پسائی جاری' : 'قطار میں';

              return (
                <tr
                  key={item.id}
                  className="table-row-hover"
                  style={{
                    borderBottom: '1px solid #F3EDE4',
                    backgroundColor: idx % 2 === 1 ? '#FDFCFB' : '#FFFFFF',
                  }}
                >
                  {/* Status with Colored Dot */}
                  <td
                    style={{
                      padding: '12px 14px',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div
                      onClick={() => isReady && handleDeliver(item.tokenNumber)}
                      className={isReady ? 'touch-active' : ''}
                      title={isReady ? 'مکمل وصول / ڈیلیور کرنے کے لیے کلک کریں' : undefined}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        cursor: isReady ? 'pointer' : 'default',
                      }}
                    >
                      <span
                        className="pulse-dot"
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          backgroundColor: dotColor,
                          display: 'inline-block',
                          flexShrink: 0,
                          boxShadow: `0 0 6px ${dotColor}88`,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-urdu)',
                          fontWeight: 800,
                          fontSize: '14px',
                          color: '#1F2937',
                        }}
                      >
                        {statusText}
                      </span>
                    </div>
                  </td>

                  {/* Weight */}
                  <td
                    style={{
                      padding: '12px 14px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#1F2937',
                      fontSize: '14px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span dir="ltr">{item.weightKg} KG</span>
                  </td>

                  {/* Customer Name */}
                  <td
                    style={{
                      padding: '12px 14px',
                      fontFamily: 'var(--font-urdu)',
                      fontWeight: 800,
                      color: '#1F2937',
                      fontSize: '15px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.customerName}
                  </td>

                  {/* Token No */}
                  <td
                    style={{
                      padding: '12px 14px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#1F2937',
                      fontSize: '14px',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.tokenNumber}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
