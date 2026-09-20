'use strict';
'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { ReceiptData } from '../ui/ReceiptPreviewModal';
import { useLanguage } from '../../context/LanguageContext';

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

  return (
    <div
      className="dash-card-animated"
      style={{
        backgroundColor: '#F8FAFC',
        borderRadius: '16px',
        border: 'none',
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
        {t('حالیہ بلز شفٹ لاگ', 'Recent Shift Bills')}
      </h3>

      {/* Table Container */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: '8px',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: '550px',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#1877F2',
                color: '#FFFFFF',
              }}
            >
              <th
                style={{
                  display: 'table-cell',
                  width: '13%',
                  padding: '11px 8px',
                  fontWeight: 800,
                  fontSize: '14px',
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
                  width: '24%',
                  padding: '11px 8px',
                  fontWeight: 800,
                  fontSize: '14px',
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
                  padding: '11px 8px',
                  fontWeight: 800,
                  fontSize: '14px',
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
                  padding: '11px 8px',
                  fontWeight: 800,
                  fontSize: '14px',
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
                  padding: '11px 6px',
                  fontWeight: 800,
                  fontSize: '14px',
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
                  padding: '11px 4px',
                  fontWeight: 800,
                  fontSize: '14px',
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
            {invoices.map((inv) => {
              const paymentLabel =
                inv.paymentMethod === 'cash'
                  ? t('نقد', 'Cash')
                  : inv.paymentMethod === 'cheque'
                  ? t('چیک', 'Cheque')
                  : t('ادھار', 'Credit');

              const chipBg =
                inv.paymentMethod === 'cash'
                  ? '#ECFDF5'
                  : inv.paymentMethod === 'cheque'
                  ? '#EFF6FF'
                  : '#FFFBEB';

              const chipText =
                inv.paymentMethod === 'cash'
                  ? '#0E8A54'
                  : inv.paymentMethod === 'cheque'
                  ? '#1D4ED8'
                  : '#B45309';

              return (
                <tr
                  key={inv.invoiceNumber}
                  className="table-row-hover"
                  style={{
                    borderBottom: 'none',
                    backgroundColor: '#FFFFFF',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Bill Number */}
                  <td
                    style={{
                      padding: '13px 8px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#0F172A',
                      fontSize: '13.5px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inv.invoiceNumber}
                  </td>

                  {/* Customer: Centered with ample breathing room */}
                  <td
                    style={{
                      padding: '13px 10px',
                      fontFamily: 'var(--font-urdu)',
                      fontWeight: 800,
                      color: '#0F172A',
                      fontSize: '14.5px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inv.customerName}
                  </td>

                  {/* Detail: Centered with distinct color and clean spacing */}
                  <td
                    style={{
                      padding: '13px 10px',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                      color: '#64748B',
                      fontSize: '13.5px',
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
                      padding: '13px 8px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 900,
                        fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                        color: '#0F172A',
                        fontSize: '14px',
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
                      padding: '13px 6px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      className={isUrdu ? 'font-nastaleeq' : ''}
                      style={{
                        fontWeight: 800,
                        backgroundColor: chipBg,
                        color: chipText,
                        fontSize: '13px',
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
                  <td style={{ padding: '13px 4px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => inv.rawReceiptData && onReprint(inv.rawReceiptData)}
                      className="touch-active"
                      title={t('رسید پرنٹ کریں', 'Print Receipt')}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: '#EFF6FF',
                        color: '#1877F2',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: 'none',
                        outline: 'none',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#EFF6FF';
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
