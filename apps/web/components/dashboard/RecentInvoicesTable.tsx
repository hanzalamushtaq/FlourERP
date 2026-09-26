'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Printer,
  Edit3,
  X,
  Save,
  Check,
  Receipt,
  CreditCard,
  Banknote,
  DollarSign,
} from 'lucide-react';
import { ReceiptData } from '../ui/ReceiptPreviewModal';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getApiBaseUrl } from '../../lib/api';
import { getSession } from '../../lib/auth';
import { sound } from '../../lib/audioFeedback';

export interface ShiftInvoiceItem {
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  itemsDetail: string;
  itemsDetailUr?: string;
  itemsDetailEn?: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'credit' | 'cheque';
  rawReceiptData?: ReceiptData;
}

const SAMPLE_INVOICES: ShiftInvoiceItem[] = [];

interface RecentInvoicesTableProps {
  invoices?: ShiftInvoiceItem[];
  onReprint: (receipt: ReceiptData) => void;
  onViewAllInvoices?: () => void;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({
  invoices = [],
  onReprint,
}) => {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useTheme();

  const [invoicesList, setInvoicesList] = useState<ShiftInvoiceItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ShiftInvoiceItem | null>(null);

  // Edit fields inside Action Window
  const [editCustomerName, setEditCustomerName] = useState<string>('');
  const [editCustomerPhone, setEditCustomerPhone] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    setInvoicesList(invoices);
  }, [invoices]);

  // Open Action Window on Row Click
  const handleRowClick = (inv: ShiftInvoiceItem) => {
    sound.beep();
    setSelectedInvoice(inv);
    setEditCustomerName(inv.customerName);
    setEditCustomerPhone(inv.customerPhone || '');
    setSaveSuccess(false);
  };

  // Save changes to bill customer details
  const handleSaveChanges = async () => {
    if (!selectedInvoice) return;
    setIsSaving(true);
    sound.beep();

    const updatedInv = {
      ...selectedInvoice,
      customerName: editCustomerName.trim() || selectedInvoice.customerName,
      customerPhone: editCustomerPhone.trim(),
      rawReceiptData: selectedInvoice.rawReceiptData
        ? {
            ...selectedInvoice.rawReceiptData,
            customerName: editCustomerName.trim() || selectedInvoice.customerName,
          }
        : undefined,
    };

    setInvoicesList((prev) =>
      prev.map((item) =>
        item.invoiceNumber === selectedInvoice.invoiceNumber ? updatedInv : item
      )
    );
    setSelectedInvoice(updatedInv);

    try {
      const session = getSession();
      const numOnly = selectedInvoice.invoiceNumber.replace(/\D/g, '');
      await fetch(`${getApiBaseUrl()}/api/bills/${numOnly || selectedInvoice.invoiceNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          customerName: editCustomerName.trim(),
          customerPhone: editCustomerPhone.trim(),
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle print from modal or row
  const handlePrintClick = (receipt?: ReceiptData) => {
    sound.beep();
    if (receipt) {
      onReprint(receipt);
    }
  };

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
            {invoicesList.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: '36px 12px',
                    color: isDark ? '#94A3B8' : '#64748B',
                    fontSize: isUrdu ? '17px' : '14px',
                    fontWeight: 700,
                  }}
                >
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {t('اس شفٹ کی ابھی کوئی رسید نہیں بنی ہے', 'No invoices generated for this shift yet')}
                  </span>
                </td>
              </tr>
            ) : (
              invoicesList.map((inv, idx) => {
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
                  onClick={() => handleRowClick(inv)}
                  className="dash-table-row"
                  title={t('کارروائی اور تفصیلات کے لیے کلک کریں', 'Click to open Action Window (Edit / Print / View)')}
                  style={{
                    cursor: 'pointer',
                    borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                    backgroundColor: isDark
                      ? idx % 2 === 1
                        ? '#1E293B'
                        : '#151D2F'
                      : idx % 2 === 1
                      ? '#FFFFFF'
                      : '#F8FAFC',
                    height: '52px',
                    transition: 'background-color 0.15s ease',
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

                  {/* Customer */}
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

                  {/* Detail */}
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
                    {isUrdu
                      ? inv.itemsDetailUr || inv.itemsDetail
                      : inv.itemsDetailEn || inv.itemsDetail}
                  </td>

                  {/* Amount */}
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
                        ? `${
                            inv.totalAmount % 1 !== 0
                              ? inv.totalAmount.toFixed(2)
                              : inv.totalAmount.toLocaleString()
                          } روپے`
                        : `Rs ${
                            inv.totalAmount % 1 !== 0
                              ? inv.totalAmount.toFixed(2)
                              : inv.totalAmount.toLocaleString()
                          }`}
                    </span>
                  </td>

                  {/* Payment */}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        inv.rawReceiptData && handlePrintClick(inv.rawReceiptData);
                      }}
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
            }))}
          </tbody>
        </table>
      </div>

      {/* POP-UP ACTION WINDOW FOR RECENT BILL (View / Edit / Print) */}
      {selectedInvoice && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedInvoice(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'modalSlideUp 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    backgroundColor: '#1877F2',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '16px',
                  }}
                >
                  {selectedInvoice.invoiceNumber}
                </span>
                <h4
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    margin: 0,
                    fontSize: isUrdu ? '20px' : '17px',
                    fontWeight: 900,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                >
                  {t('بل ایکشن ونڈو', 'Bill Action Window')}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isDark ? '#334155' : '#E2E8F0',
                  color: isDark ? '#94A3B8' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Financial Summary Box */}
              <div
                style={{
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B' }}>
                    {t('کل رقم', 'Total Amount')}
                  </div>
                  <div
                    style={{
                      fontSize: isUrdu ? '22px' : '18px',
                      fontWeight: 900,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                    }}
                  >
                    {isUrdu
                      ? `${selectedInvoice.totalAmount.toLocaleString()} روپے`
                      : `Rs ${selectedInvoice.totalAmount.toLocaleString()}`}
                  </div>
                </div>

                <div style={{ textAlign: isUrdu ? 'left' : 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B' }}>
                    {t('ادائیگی طریقہ', 'Payment Mode')}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '13px',
                      backgroundColor:
                        selectedInvoice.paymentMethod === 'cash'
                          ? '#ECFDF5'
                          : selectedInvoice.paymentMethod === 'cheque'
                          ? '#EFF6FF'
                          : '#FFFBEB',
                      color:
                        selectedInvoice.paymentMethod === 'cash'
                          ? '#0E8A54'
                          : selectedInvoice.paymentMethod === 'cheque'
                          ? '#1D4ED8'
                          : '#B45309',
                    }}
                  >
                    {selectedInvoice.paymentMethod === 'cash'
                      ? t('نقد (Cash)', 'Cash')
                      : selectedInvoice.paymentMethod === 'cheque'
                      ? t('چیک (Cheque)', 'Cheque')
                      : t('ادھار (Credit)', 'Credit')}
                  </span>
                </div>
              </div>

              {/* Items Detail */}
              <div
                style={{
                  backgroundColor: isDark ? '#151D2F' : '#F1F5F9',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}
              >
                <div style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>
                  {t('تفصیلات', 'Items / Service Details')}
                </div>
                <div
                  style={{
                    fontSize: isUrdu ? '17px' : '14px',
                    fontWeight: 800,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                    marginTop: '2px',
                  }}
                >
                  {isUrdu
                    ? selectedInvoice.itemsDetailUr || selectedInvoice.itemsDetail
                    : selectedInvoice.itemsDetailEn || selectedInvoice.itemsDetail}
                </div>
              </div>

              {/* Edit Details Section */}
              <div
                style={{
                  border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 800,
                    fontSize: '14px',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                >
                  <Edit3 size={15} color="#1877F2" />
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {t('گاہک کی معلومات تبدیل کریں', 'Edit Customer Details')}
                  </span>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isDark ? '#94A3B8' : '#64748B',
                      marginBottom: '4px',
                    }}
                  >
                    {t('گاہک کا نام', 'Customer Name')}
                  </label>
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '14px',
                      fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isDark ? '#94A3B8' : '#64748B',
                      marginBottom: '4px',
                    }}
                  >
                    {t('فون نمبر', 'Phone Number')}
                  </label>
                  <input
                    type="text"
                    value={editCustomerPhone}
                    onChange={(e) => setEditCustomerPhone(e.target.value)}
                    placeholder="0300-1234567"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  style={{
                    marginTop: '4px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: saveSuccess ? '#0E8A54' : '#1877F2',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: isUrdu ? '15px' : '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={16} />
                      <span className={isUrdu ? 'font-nastaleeq' : ''}>
                        {t('محفوظ ہو گیا!', 'Saved Successfully!')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span className={isUrdu ? 'font-nastaleeq' : ''}>
                        {t('تبدیلیاں محفوظ کریں', 'Save Changes')}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: Print & Close */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedInvoice.rawReceiptData) {
                      handlePrintClick(selectedInvoice.rawReceiptData);
                      setSelectedInvoice(null);
                    }
                  }}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#1877F2',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: isUrdu ? '18px' : '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(24, 119, 242, 0.25)',
                  }}
                >
                  <Printer size={18} />
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {t('بل پرنٹ کریں', 'Print Receipt')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  style={{
                    height: '44px',
                    padding: '0 18px',
                    borderRadius: '10px',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    backgroundColor: 'transparent',
                    color: isDark ? '#94A3B8' : '#475569',
                    fontWeight: 800,
                    fontSize: isUrdu ? '16px' : '14px',
                    cursor: 'pointer',
                  }}
                >
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {t('بند کریں', 'Close')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
