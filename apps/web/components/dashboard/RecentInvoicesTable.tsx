'use strict';
'use client';

import React from 'react';
import { History, Printer } from 'lucide-react';
import { ReceiptData } from '../ui/ReceiptPreviewModal';

export interface ShiftInvoiceItem {
  invoiceNumber: string;
  customerName: string;
  itemsDetail: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'udhaar';
  timestamp?: string;
  rawReceiptData?: ReceiptData;
}

const SAMPLE_INVOICES: ShiftInvoiceItem[] = [
  {
    invoiceNumber: 'INV-#1084',
    customerName: 'حاجی بشیر احمد اینڈ سنز',
    itemsDetail: 'چکی آٹا 20KG (4 تھیلے)',
    totalAmount: 9000,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'product',
      billNumber: '1084',
      customerName: 'حاجی بشیر احمد اینڈ سنز',
      items: [
        {
          nameEn: 'Chakki Atta 20KG (4 Bags)',
          nameUr: 'چکی آٹا 20KG (4 تھیلے)',
          weightKg: 80,
          ratePerKg: 112.5,
          total: 9000,
        },
      ],
      subtotal: 9000,
      discount: 0,
      netTotal: 9000,
      cashReceived: 9000,
      remainingBalance: 0,
      isCredit: false,
      timestamp: '18/09/2026, 06:40 PM',
      billerName: 'محمد عاصف (کاؤنٹر 01)',
    },
  },
  {
    invoiceNumber: 'INV-#1083',
    customerName: 'ملک طارق ہوٹل والے',
    itemsDetail: 'فائن میدہ 50KG بوری (2 عدد)',
    totalAmount: 15500,
    paymentMethod: 'udhaar',
    rawReceiptData: {
      type: 'product',
      billNumber: '1083',
      customerName: 'ملک طارق ہوٹل والے',
      items: [
        {
          nameEn: 'Fine Maida 50KG (2 Bags)',
          nameUr: 'فائن میدہ 50KG بوری (2 عدد)',
          weightKg: 100,
          ratePerKg: 155,
          total: 15500,
        },
      ],
      subtotal: 15500,
      discount: 0,
      netTotal: 15500,
      cashReceived: 0,
      remainingBalance: 15500,
      isCredit: true,
      timestamp: '18/09/2026, 06:25 PM',
      billerName: 'محمد عاصف (کاؤنٹر 01)',
    },
  },
  {
    invoiceNumber: 'INV-#1082',
    customerName: 'چوہدری اکرم (واک اِن)',
    itemsDetail: 'گندم پسائی اجرت (40 KG)',
    totalAmount: 400,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'pisai',
      billNumber: '1082',
      customerName: 'چوہدری اکرم (واک اِن)',
      serviceType: 'safai_pisai',
      pisaiWeightKg: 40,
      pisaiToken: '0029',
      subtotal: 400,
      discount: 0,
      netTotal: 400,
      cashReceived: 400,
      remainingBalance: 0,
      isCredit: false,
      timestamp: '18/09/2026, 06:10 PM',
      billerName: 'محمد عاصف (کاؤنٹر 01)',
    },
  },
  {
    invoiceNumber: 'INV-#1081',
    customerName: 'سردار ارشد ڈیری فارم',
    itemsDetail: 'خالص چوکر بوری (5 بوریاں)',
    totalAmount: 9250,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'product',
      billNumber: '1081',
      customerName: 'سردار ارشد ڈیری فارم',
      items: [
        {
          nameEn: 'Chokar / Wheat Bran (5 Bags)',
          nameUr: 'خالص چوکر بوری (5 بوریاں)',
          weightKg: 97.36,
          ratePerKg: 95,
          total: 9250,
        },
      ],
      subtotal: 9250,
      discount: 0,
      netTotal: 9250,
      cashReceived: 9250,
      remainingBalance: 0,
      isCredit: false,
      timestamp: '18/09/2026, 05:48 PM',
      billerName: 'محمد عاصف (کاؤنٹر 01)',
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
  onViewAllInvoices,
}) => {
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
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
            }}
          >
            <History size={18} />
          </div>
          <h3
            className="font-nastaleeq"
            style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}
          >
            حالیہ انوائسز و سیلز بلز (شفٹ لائیو ریکارڈ)
          </h3>
        </div>

        <button
          type="button"
          onClick={onViewAllInvoices}
          className="touch-active"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span
            className="font-nastaleeq"
            style={{ fontSize: '13px', fontWeight: 800, textDecoration: 'underline' }}
          >
            مکمل لسٹ دیکھیں
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>کل 142 بل |</span>
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'right',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1.5px solid #cbd5e1',
                color: '#64748b',
              }}
            >
              <th className="font-nastaleeq" style={{ padding: '10px 12px', fontWeight: 800, width: '15%' }}>
                انوائس #
              </th>
              <th className="font-nastaleeq" style={{ padding: '10px 12px', fontWeight: 800, width: '22%' }}>
                کسٹمر کا نام
              </th>
              <th className="font-nastaleeq" style={{ padding: '10px 12px', fontWeight: 800, width: '25%' }}>
                آئٹمز / تفصیل
              </th>
              <th className="font-nastaleeq" style={{ padding: '10px 12px', fontWeight: 800, width: '14%' }}>
                کل رقم
              </th>
              <th className="font-nastaleeq" style={{ padding: '10px 12px', fontWeight: 800, width: '14%' }}>
                طریقہ ادائیگی
              </th>
              <th className="font-nastaleeq" style={{ padding: '10px 12px', fontWeight: 800, textAlign: 'center', width: '10%' }}>
                پرنٹ / ایکشن
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr
                key={inv.invoiceNumber}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'background-color 0.1s ease',
                }}
              >
                {/* Invoice # */}
                <td
                  style={{
                    padding: '12px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: '#0f172a',
                    direction: 'ltr',
                    textAlign: 'right',
                  }}
                >
                  {inv.invoiceNumber}
                </td>

                {/* Customer Name */}
                <td
                  className="font-nastaleeq"
                  style={{
                    padding: '12px',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: '14px',
                  }}
                >
                  {inv.customerName}
                </td>

                {/* Items / Detail */}
                <td
                  className="font-nastaleeq"
                  style={{
                    padding: '12px',
                    color: '#475569',
                    fontSize: '13px',
                  }}
                >
                  {inv.itemsDetail}
                </td>

                {/* Amount */}
                <td
                  style={{
                    padding: '12px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#0f172a',
                    fontSize: '14px',
                  }}
                >
                  Rs {inv.totalAmount.toLocaleString()}
                </td>

                {/* Payment Method Badge */}
                <td style={{ padding: '12px' }}>
                  {inv.paymentMethod === 'cash' ? (
                    <span
                      style={{
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      نقد Cash
                    </span>
                  ) : (
                    <span
                      className="font-nastaleeq"
                      style={{
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      ادھار کھاتہ
                    </span>
                  )}
                </td>

                {/* Print Button */}
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (inv.rawReceiptData) {
                        onReprint(inv.rawReceiptData);
                      }
                    }}
                    className="touch-active"
                    title="Reprint Receipt (ESC/POS)"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Printer size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
