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
  rawReceiptData?: ReceiptData;
}

const SAMPLE_INVOICES: ShiftInvoiceItem[] = [
  {
    invoiceNumber: '1084',
    customerName: 'حاجی بشیر احمد',
    itemsDetail: 'چکی آٹا 20KG (4 تھیلے)',
    totalAmount: 9000,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'product',
      billNumber: '1084',
      customerName: 'حاجی بشیر احمد',
      items: [{ nameEn: 'Chakki Atta', nameUr: 'چکی آٹا 20KG', weightKg: 80, ratePerKg: 112.5, total: 9000 }],
      subtotal: 9000,
      discount: 0,
      netTotal: 9000,
      cashReceived: 9000,
      remainingBalance: 0,
      isCredit: false,
      timestamp: '18/09/2026, 06:40 PM',
      billerName: 'محمد عاصف',
    },
  },
  {
    invoiceNumber: '1083',
    customerName: 'ملک طارق ہوٹل',
    itemsDetail: 'فائن میدہ 50KG بوری',
    totalAmount: 15500,
    paymentMethod: 'udhaar',
    rawReceiptData: {
      type: 'product',
      billNumber: '1083',
      customerName: 'ملک طارق ہوٹل',
      items: [{ nameEn: 'Fine Maida', nameUr: 'فائن میدہ 50KG', weightKg: 100, ratePerKg: 155, total: 15500 }],
      subtotal: 15500,
      discount: 0,
      netTotal: 15500,
      cashReceived: 0,
      remainingBalance: 15500,
      isCredit: true,
      timestamp: '18/09/2026, 06:25 PM',
      billerName: 'محمد عاصف',
    },
  },
  {
    invoiceNumber: '1082',
    customerName: 'چوہدری اکرم (واک اِن)',
    itemsDetail: 'گندم پسائی (40 KG)',
    totalAmount: 400,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'pisai',
      billNumber: '1082',
      customerName: 'چوہدری اکرم',
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
      billerName: 'محمد عاصف',
    },
  },
  {
    invoiceNumber: '1081',
    customerName: 'سردار ارشد ڈیری',
    itemsDetail: 'خالص چوکر (5 بوریاں)',
    totalAmount: 9250,
    paymentMethod: 'cash',
    rawReceiptData: {
      type: 'product',
      billNumber: '1081',
      customerName: 'سردار ارشد ڈیری',
      items: [{ nameEn: 'Chokar', nameUr: 'خالص چوکر بوری', weightKg: 97.36, ratePerKg: 95, total: 9250 }],
      subtotal: 9250,
      discount: 0,
      netTotal: 9250,
      cashReceived: 9250,
      remainingBalance: 0,
      isCredit: false,
      timestamp: '18/09/2026, 05:48 PM',
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
          <History size={16} color="#64748b" />
          <h3
            className="font-nastaleeq"
            style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}
          >
            حالیہ بلز (شفٹ لائیو)
          </h3>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th className="font-nastaleeq" style={{ padding: '6px 8px', fontWeight: 700 }}>بل #</th>
              <th className="font-nastaleeq" style={{ padding: '6px 8px', fontWeight: 700 }}>گاہک</th>
              <th className="font-nastaleeq" style={{ padding: '6px 8px', fontWeight: 700 }}>تفصیل</th>
              <th className="font-nastaleeq" style={{ padding: '6px 8px', fontWeight: 700 }}>رقم</th>
              <th className="font-nastaleeq" style={{ padding: '6px 8px', fontWeight: 700, textAlign: 'center' }}>پرنٹ</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.invoiceNumber} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  #{inv.invoiceNumber}
                </td>
                <td className="font-nastaleeq" style={{ padding: '8px', fontWeight: 800, color: '#0f172a' }}>
                  {inv.customerName}
                </td>
                <td className="font-nastaleeq" style={{ padding: '8px', color: '#64748b', fontSize: '12px' }}>
                  {inv.itemsDetail}
                </td>
                <td style={{ padding: '8px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  Rs {inv.totalAmount.toLocaleString()}
                  {inv.paymentMethod === 'udhaar' && (
                    <span className="font-nastaleeq" style={{ fontSize: '10px', color: '#b45309', marginRight: '4px' }}>
                      (ادھار)
                    </span>
                  )}
                </td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => inv.rawReceiptData && onReprint(inv.rawReceiptData)}
                    className="touch-active"
                    title="Reprint"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Printer size={13} />
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
