'use strict';
'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

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
  const { isUrdu, t } = useLanguage();
  const [queue, setQueue] = useState<ChakkiQueueItem[]>(SAMPLE_QUEUE);

  const handleDeliver = (tokenNumber: number | string) => {
    setQueue((prev) => prev.filter((item) => item.tokenNumber !== tokenNumber));
    onTokenDelivered?.(tokenNumber);
  };

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        borderRadius: '16px',
        border: 'none',
        outline: 'none',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
      }}
    >
      {/* Centered Title */}
      <h3
        className={isUrdu ? 'font-nastaleeq' : ''}
        style={{
          fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
          fontSize: '18px',
          fontWeight: 900,
          color: '#0F172A',
          textAlign: 'center',
          margin: '0 0 14px 0',
        }}
      >
        {t('چکی ٹوکن قطار', 'Milling Token Queue')}
      </h3>

      {/* Table Container */}
      <div style={{ width: '100%', overflowX: 'auto', borderRadius: '8px' }}>
        <table
          style={{
            width: '100%',
            minWidth: '450px',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#D97706',
                color: '#FFFFFF',
              }}
            >
              <th
                style={{
                  display: 'table-cell',
                  width: '26%',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '14px',
                  textAlign: 'left',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '0',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('حیثیت', 'Status')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '22%',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('وزن (کلو)', 'Weight (KG)')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '28%',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('گاہک کا نام', 'Customer Name')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '24%',
                  padding: '10px 14px',
                  fontWeight: 800,
                  fontSize: '14px',
                  textAlign: 'right',
                  borderTopRightRadius: '8px',
                  borderTopLeftRadius: '0',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('ٹوکن نمبر', 'Token #')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item, idx) => {
              const isReady = item.status === 'ready';
              const isGrinding = item.status === 'grinding';

              // Rule 6 Badges & Chips:
              const chipBg = isReady ? '#ECFDF5' : isGrinding ? '#FFFBEB' : '#EFF6FF';
              const chipText = isReady ? '#0E8A54' : isGrinding ? '#B45309' : '#1D4ED8';
              const statusText = isReady
                ? t('تیار', 'Ready')
                : isGrinding
                ? t('پسائی جاری', 'Grinding')
                : t('قطار میں', 'In Queue');

              return (
                <tr
                  key={item.id}
                  className="table-row-hover"
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: idx % 2 === 1 ? '#FFFFFF' : '#F8FAFC',
                  }}
                >
                  {/* Status Chip matching Rule 6 */}
                  <td
                    style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div
                      onClick={() => isReady && handleDeliver(item.tokenNumber)}
                      className={isReady ? 'touch-active' : ''}
                      title={
                        isReady
                          ? t('مکمل وصول / ڈیلیور کرنے کے لیے کلک کریں', 'Click to mark delivered')
                          : undefined
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: isReady ? 'pointer' : 'default',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: chipBg,
                        color: chipText,
                        border: 'none',
                        boxShadow: 'none',
                      }}
                    >
                      <span
                        className={isUrdu ? 'font-nastaleeq' : ''}
                        style={{
                          fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                          fontWeight: 800,
                          fontSize: '13.5px',
                          color: chipText,
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
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#0F172A',
                      fontSize: '14px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{isUrdu ? `${item.weightKg} کلو` : `${item.weightKg} KG`}</span>
                  </td>

                  {/* Customer Name */}
                  <td
                    style={{
                      padding: '12px 14px',
                      fontFamily: 'var(--font-urdu)',
                      fontWeight: 800,
                      color: '#0F172A',
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
                      color: '#0F172A',
                      fontSize: '14px',
                      textAlign: 'right',
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
