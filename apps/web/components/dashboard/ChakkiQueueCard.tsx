'use strict';
'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark } = useTheme();
  const [queue, setQueue] = useState<ChakkiQueueItem[]>(SAMPLE_QUEUE);

  const handleDeliver = (tokenNumber: number | string) => {
    setQueue((prev) => prev.filter((item) => item.tokenNumber !== tokenNumber));
    onTokenDelivered?.(tokenNumber);
  };

  return (
    <div
      className="dash-interactive-card card-animate-1"
      style={{
        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
        borderRadius: '16px',
        border: isDark ? '1.5px solid #334155' : 'none',
        outline: 'none',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : 'none',
        width: '100%',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Centered Title */}
      <h3
        className={isUrdu ? 'font-nastaleeq' : ''}
        style={{
          fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
          fontSize: isUrdu ? '24px' : '18px',
          fontWeight: 900,
          color: isDark ? '#F8FAFC' : '#0F172A',
          textAlign: 'center',
          margin: '0 0 12px 0',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        {t('چکی ٹوکن قطار', 'Milling Token Queue')}
      </h3>

      {/* Table Container */}
      <div style={{ width: '100%', borderRadius: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '360px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                height: '46px',
              }}
            >
              <th
                style={{
                  display: 'table-cell',
                  width: '28%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 8px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '0',
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
                  width: '44%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 8px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
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
                  width: '28%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 8px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
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
              return (
                <tr
                  key={item.id}
                  className="dash-table-row"
                  style={{
                    borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                    backgroundColor: isDark
                      ? (idx % 2 === 1 ? '#1E293B' : '#151D2F')
                      : (idx % 2 === 1 ? '#FFFFFF' : '#F8FAFC'),
                    height: '52px',
                  }}
                >
                  {/* Weight */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 8px',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                      fontWeight: 800,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: isUrdu ? '18px' : '14px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{isUrdu ? `${item.weightKg} کلو` : `${item.weightKg} KG`}</span>
                  </td>

                  {/* Customer Name */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 8px',
                      fontFamily: 'var(--font-urdu)',
                      fontWeight: 800,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: isUrdu ? '19px' : '15px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.customerName}
                  </td>

                  {/* Token No */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 8px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      className="token-badge-animated"
                      style={{
                        backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                        color: isDark ? '#93C5FD' : '#1D4ED8',
                        border: isDark ? '1px solid #2563EB' : '1px solid #BFDBFE',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        fontWeight: 900,
                        display: 'inline-block',
                      }}
                    >
                      {item.tokenNumber}
                    </span>
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
