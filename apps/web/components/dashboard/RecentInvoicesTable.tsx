'use strict';
'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { ReceiptData } from '../ui/ReceiptPreviewModal';

export interface ShiftInvoiceItem {
  invoiceNumber: string;
  customerName: string;
  itemsDetail: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'udhaar' | 'cheque';
  rawReceiptData?: ReceiptData;
}

const SAMPLE_INVOICES: ShiftInvoiceItem[] = [
  {
    invoiceNumber: 'B-5001',
    customerName: 'نامعلوم',
    itemsDetail: '2x20KG آٹا',
    totalAmount: 4300,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'product',
      billNumber: 'B-5001',
      customerName: 'نامعلوم',
      items: [{ nameEn: 'Chakki Atta', nameUr: '2x20KG آٹا', weightKg: 40, ratePerKg: 107.5, total: 4300 }],
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
    itemsDetail: '15KG پسائی',
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
    customerName: 'نامعلوم',
    itemsDetail: 'ادھار کھاتہ',
    totalAmount: 25000,
    paymentMethod: 'cheque',
    rawReceiptData: {
      type: 'product',
      billNumber: 'B-5005',
      customerName: 'نامعلوم',
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
        Recent Bills / حالیہ بلز شفٹ لاگ
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
            direction: 'rtl',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#A66336', // Solid brown spanning full width matching reference
                color: '#FFFFFF',
              }}
            >
              <th
                style={{
                  width: '13%',
                  padding: '11px 8px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  borderTopRightRadius: '8px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                بل نمبر
              </th>
              <th
                style={{
                  width: '24%',
                  padding: '11px 8px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                گاہک
              </th>
              <th
                style={{
                  width: '22%',
                  padding: '11px 8px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                تفصیل
              </th>
              <th
                style={{
                  width: '19%',
                  padding: '11px 8px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                رقم
              </th>
              <th
                style={{
                  width: '12%',
                  padding: '11px 6px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                ادائیگی
              </th>
              <th
                style={{
                  width: '10%',
                  padding: '11px 4px',
                  fontWeight: 800,
                  fontSize: '14px',
                  fontFamily: 'var(--font-urdu)',
                  borderTopLeftRadius: '8px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                پرنٹ
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const paymentLabel =
                inv.paymentMethod === 'cash'
                  ? 'نقد'
                  : inv.paymentMethod === 'cheque'
                  ? 'چیک'
                  : 'ادھار';

              return (
                <tr
                  key={inv.invoiceNumber}
                  className="table-row-hover"
                  style={{
                    borderBottom: '1px solid #F3EDE4',
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
                      color: '#1F2937',
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
                      color: '#1F2937',
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
                      fontFamily: 'var(--font-urdu)',
                      color: '#4B5563',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inv.itemsDetail}
                  </td>

                  {/* Amount: LTR formatted for clean Rs. symbol alignment */}
                  <td
                    style={{
                      padding: '13px 8px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      dir="ltr"
                      style={{
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        color: '#111827',
                        fontSize: '14px',
                        display: 'inline-block',
                      }}
                    >
                      Rs. {inv.totalAmount % 1 !== 0 ? inv.totalAmount.toFixed(2) : inv.totalAmount.toLocaleString()}
                    </span>
                  </td>

                  {/* Payment: Pure clean typography - NO COLOR DOT */}
                  <td
                    style={{
                      padding: '13px 6px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      className="font-nastaleeq"
                      style={{
                        fontWeight: 800,
                        color: '#1F2937',
                        fontSize: '14px',
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
                      title="رسید پرنٹ کریں"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        border: '1.5px solid #D5C9B8',
                        backgroundColor: '#FFFFFF',
                        color: '#4A2810',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FAF3E8';
                        e.currentTarget.style.borderColor = '#B26E3A';
                        e.currentTarget.style.transform = 'scale(1.15) rotate(-2deg)';
                        e.currentTarget.style.boxShadow = '0 3px 8px rgba(178, 110, 58, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#D5C9B8';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
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
