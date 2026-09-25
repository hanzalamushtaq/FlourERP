'use strict';
'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { ReceiptData } from '../ui/ReceiptPreviewModal';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export interface ShiftInvoiceItem {
  invoiceNumber: string;
  customerName: string;
  itemsDetail: string;
  itemsDetailUr?: string;
  itemsDetailEn?: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'credit' | 'cheque';
  rawReceiptData?: ReceiptData;
}

const SAMPLE_INVOICES: ShiftInvoiceItem[] = [
  {
    invoiceNumber: 'B-5001',
    customerName: 'حاجی رشید',
    itemsDetail: '40 کلو آٹا',
    itemsDetailUr: '40 کلو آٹا',
    itemsDetailEn: '40 KG Atta',
    totalAmount: 4300,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'product',
      billNumber: 'B-5001',
      customerName: 'حاجی رشید',
      items: [{ nameEn: 'Chakki Atta', nameUr: 'چکی آٹا (40 کلو)', weightKg: 40, ratePerKg: 107.5, total: 4300 }],
      subtotal: 4300,
      discount: 0,
      netTotal: 4300,
      cashReceived: 4300,
      remainingBalance: 0,
      isCredit: false,
      timestamp: '19/09/2026, 06:19 PM',
      billerName: 'محمد عاصف',
    },
  },
  {
    invoiceNumber: 'B-5002',
    customerName: 'فہیم احمد',
    itemsDetail: '15 کلو پسائی',
    itemsDetailUr: '15 کلو پسائی',
    itemsDetailEn: '15 KG Grinding',
    totalAmount: 127.5,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'pisai',
      billNumber: 'B-5002',
      customerName: 'فہیم احمد',
      serviceType: 'safai_pisai',
      pisaiWeightKg: 15,
      pisaiToken: 'T-1002',
      subtotal: 127.5,
      discount: 0,
      netTotal: 127.5,
      cashReceived: 127.5,
      remainingBalance: 0,
      isCredit: false,
      timestamp: '19/09/2026, 06:15 PM',
      billerName: 'محمد عاصف',
    },
  },
  {
    invoiceNumber: 'B-5003',
    customerName: 'صادق ٹریڈرز',
    itemsDetail: 'ادھار کھاتہ',
    itemsDetailUr: 'ادھار کھاتہ',
    itemsDetailEn: 'Credit Ledger',
    totalAmount: 25000,
    paymentMethod: 'cheque',
    rawReceiptData: {
      type: 'product',
      billNumber: 'B-5003',
      customerName: 'صادق ٹریڈرز',
      items: [{ nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', weightKg: 150, ratePerKg: 166.6, total: 25000 }],
      subtotal: 25000,
      discount: 0,
      netTotal: 25000,
      cashReceived: 0,
      remainingBalance: 25000,
      isCredit: true,
      timestamp: '19/09/2026, 06:05 PM',
      billerName: 'محمد عاصف',
    },
  },
  {
    invoiceNumber: 'B-5004',
    customerName: 'صادق ٹریڈرز',
    itemsDetail: 'ادھار کھاتہ',
    itemsDetailUr: 'ادھار کھاتہ',
    itemsDetailEn: 'Credit Ledger',
    totalAmount: 25000,
    paymentMethod: 'cheque',
    rawReceiptData: {
      type: 'product',
      billNumber: 'B-5004',
      customerName: 'صادق ٹریڈرز',
      items: [{ nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', weightKg: 150, ratePerKg: 166.6, total: 25000 }],
      subtotal: 25000,
      discount: 0,
      netTotal: 25000,
      cashReceived: 0,
      remainingBalance: 25000,
      isCredit: true,
      timestamp: '19/09/2026, 05:45 PM',
      billerName: 'محمد عاصف',
    },
  },
  {
    invoiceNumber: 'B-5005',
    customerName: 'بابر ہوٹل',
    itemsDetail: 'ادھار کھاتہ',
    itemsDetailUr: 'ادھار کھاتہ',
    itemsDetailEn: 'Credit Ledger',
    totalAmount: 25000,
    paymentMethod: 'cheque',
    rawReceiptData: {
      type: 'product',
      billNumber: 'B-5005',
      customerName: 'بابر ہوٹل',
      items: [{ nameEn: 'Chokar Flour', nameUr: 'خالص چوکر', weightKg: 250, ratePerKg: 100, total: 25000 }],
      subtotal: 25000,
      discount: 0,
      netTotal: 25000,
      cashReceived: 0,
      remainingBalance: 25000,
      isCredit: true,
      timestamp: '19/09/2026, 05:30 PM',
      billerName: 'محمد عاصف',
    },
  },
];

interface RecentInvoicesTableProps {
  invoices?: ShiftInvoiceItem[];
  onReprint: (receipt: ReceiptData) => void;
  onViewAllInvoices?: () => void;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({
  invoices = SAMPLE_INVOICES,
  onReprint,
}) => {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useTheme();

  return (
    <div
      className="dash-interactive-card card-animate-1"
      style={{
        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
        borderRadius: '16px',
        border: isDark ? '1.5px solid #334155' : 'none',
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
        {t('حالیہ بلز شفٹ لاگ', 'Recent Shift Bills')}
      </h3>

      {/* Table Container */}
      <div
        style={{
          width: '100%',
          borderRadius: '8px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '520px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#1877F2',
                color: '#FFFFFF',
                height: '46px',
              }}
            >
              <th
                style={{
                  display: 'table-cell',
                  width: '13%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 6px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '0',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('بل نمبر', 'Bill #')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '23%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 6px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('گاہک', 'Customer')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '22%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 6px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('تفصیل', 'Details')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '19%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 6px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('رقم', 'Amount')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '12%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 4px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('ادائیگی', 'Payment')}
                </span>
              </th>
              <th
                style={{
                  display: 'table-cell',
                  width: '10%',
                  height: '46px',
                  verticalAlign: 'middle',
                  padding: '0 4px',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '14px',
                  borderTopRightRadius: '8px',
                  borderTopLeftRadius: '0',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('پرنٹ', 'Print')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => {
              const paymentLabel =
                inv.paymentMethod === 'cash'
                  ? t('نقد', 'Cash')
                  : inv.paymentMethod === 'cheque'
                  ? t('چیک', 'Cheque')
                  : t('ادھار', 'Credit');

              const chipBg = isDark
                ? inv.paymentMethod === 'cash'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : inv.paymentMethod === 'cheque'
                  ? 'rgba(59, 130, 246, 0.2)'
                  : 'rgba(245, 158, 11, 0.2)'
                : inv.paymentMethod === 'cash'
                  ? '#ECFDF5'
                  : inv.paymentMethod === 'cheque'
                  ? '#EFF6FF'
                  : '#FFFBEB';

              const chipText = isDark
                ? inv.paymentMethod === 'cash'
                  ? '#34D399'
                  : inv.paymentMethod === 'cheque'
                  ? '#60A5FA'
                  : '#FBBF24'
                : inv.paymentMethod === 'cash'
                  ? '#0E8A54'
                  : inv.paymentMethod === 'cheque'
                  ? '#1D4ED8'
                  : '#B45309';

              return (
                <tr
                  key={inv.invoiceNumber}
                  className="dash-table-row"
                  style={{
                    borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                    backgroundColor: isDark
                      ? (idx % 2 === 1 ? '#1E293B' : '#151D2F')
                      : (idx % 2 === 1 ? '#FFFFFF' : '#F8FAFC'),
                    height: '52px',
                  }}
                >
                  {/* Bill Number */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 6px',
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
                      {inv.invoiceNumber}
                    </span>
                  </td>

                  {/* Customer: Centered with ample breathing room */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 6px',
                      fontFamily: 'var(--font-urdu)',
                      fontWeight: 800,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: isUrdu ? '19px' : '15px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inv.customerName}
                  </td>

                  {/* Detail: Centered with distinct color and clean spacing */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 6px',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                      color: isDark ? '#94A3B8' : '#64748B',
                      fontSize: isUrdu ? '17px' : '13.5px',
                      fontWeight: 700,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isUrdu ? (inv.itemsDetailUr || inv.itemsDetail) : (inv.itemsDetailEn || inv.itemsDetail)}
                  </td>

                  {/* Amount: formatted for active language */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 6px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 900,
                        fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        fontSize: isUrdu ? '17px' : '14px',
                        display: 'inline-block',
                      }}
                    >
                      {isUrdu
                        ? `${inv.totalAmount % 1 !== 0 ? inv.totalAmount.toFixed(2) : inv.totalAmount.toLocaleString()} روپے`
                        : `Rs ${inv.totalAmount % 1 !== 0 ? inv.totalAmount.toFixed(2) : inv.totalAmount.toLocaleString()}`}
                    </span>
                  </td>

                  {/* Payment: Flat tinted badge/chip */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 4px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      className={`${isUrdu ? 'font-nastaleeq' : ''} payment-badge-animated`}
                      style={{
                        fontWeight: 800,
                        backgroundColor: chipBg,
                        color: chipText,
                        fontSize: isUrdu ? '16px' : '13px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        border: 'none',
                        boxShadow: 'none',
                      }}
                    >
                      {paymentLabel}
                    </span>
                  </td>

                  {/* Print Button */}
                  <td
                    style={{
                      height: '52px',
                      verticalAlign: 'middle',
                      padding: '0 4px',
                      textAlign: 'center',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => inv.rawReceiptData && onReprint(inv.rawReceiptData)}
                      className="touch-active print-btn-animated"
                      title={t('رسید پرنٹ کریں', 'Print Receipt')}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                        color: isDark ? '#93C5FD' : '#1877F2',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        outline: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#2563EB' : '#DBEAFE';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#1E3A8A' : '#EFF6FF';
                      }}
                    >
                      <Printer size={15} strokeWidth={2} />
                    </button>
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
