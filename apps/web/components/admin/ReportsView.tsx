'use client';

import React, { useState, useEffect } from 'react';
import { getSession, ensureValidToken } from '../../lib/auth';
import { Calendar, Download, PlusCircle, ArrowUpRight, ArrowDownLeft, RotateCcw, Filter, X, Ban, ShieldAlert, History, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LedgerItem {
  id: string;
  timestamp: string;
  category: 'SALE' | 'PISAI' | 'CREDIT' | 'PAYMENT' | 'EXPENSE' | 'RETURN';
  description: string;
  descriptionUr?: string;
  reference: string;
  amount: number;
  type: 'inflow' | 'outflow' | 'neutral';
}

const INITIAL_LEDGER: LedgerItem[] = [
  { id: '1', timestamp: 'Today, 2:30 PM', category: 'SALE', description: '40 KG Chakki Atta', descriptionUr: '40 کلو چکی آٹا', reference: 'BILL-00481', amount: 5600, type: 'inflow' },
  { id: '2', timestamp: 'Today, 2:15 PM', category: 'PISAI', description: '25 KG Safai + Pisai (Token #0482)', descriptionUr: '25 کلو صفائی + پسائی (ٹوکن #0482)', reference: 'PISAI-0482', amount: 150, type: 'inflow' },
  { id: '3', timestamp: 'Today, 1:45 PM', category: 'EXPENSE', description: 'Mill Electricity Advance Bill', descriptionUr: 'مل بجلی کا پیشگی بل', reference: 'EXP-109', amount: 2500, type: 'outflow' },
  { id: '4', timestamp: 'Today, 1:10 PM', category: 'PAYMENT', description: 'Haji Rasheed Cash Repayment', descriptionUr: 'حاجی رشید نقد وصولی کھاتہ', reference: 'PAY-055', amount: 2000, type: 'inflow' },
  { id: '5', timestamp: 'Today, 12:30 PM', category: 'SALE', description: '10 KG Fine Atta', descriptionUr: '10 کلو فائن آٹا', reference: 'BILL-00480', amount: 1480, type: 'inflow' },
  { id: '6', timestamp: 'Today, 11:15 AM', category: 'RETURN', description: 'Return 5 KG Maida (Damaged Bag)', descriptionUr: 'واپسی 5 کلو میدہ (خراب تھیلا)', reference: 'RET-012', amount: 775, type: 'outflow' },
  { id: '7', timestamp: 'Today, 10:00 AM', category: 'EXPENSE', description: 'Worker Daily Lunch / Tea', descriptionUr: 'ملازمین کا کھانا و چائے', reference: 'EXP-108', amount: 350, type: 'outflow' },
];

export const ReportsView: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'financial' | 'audit'>('financial');
  const [ledger, setLedger] = useState<LedgerItem[]>(INITIAL_LEDGER);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'month'>('today');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Electricity');

  // Void Modal State
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [targetVoidItem, setTargetVoidItem] = useState<{ id: string; type: 'bill' | 'pisai'; ref: string } | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Fetch Ledger Stream from API
  const fetchLedgerStream = async (range: string) => {
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch(`http://localhost:5000/api/reports/ledger-stream?range=${range}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success && json.data.items) {
        setLedger(json.data.items);
      }
    } catch (err) {
      console.error('Failed to load ledger stream:', err);
    }
  };

  // Fetch Audit Logs from API (AUDIT-01)
  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch('http://localhost:5000/api/audit-logs?limit=50', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success && json.data.logs) {
        setAuditLogs(json.data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'financial') {
      fetchLedgerStream(dateFilter);
    } else {
      fetchAuditLogs();
    }
  }, [dateFilter, activeSubTab]);

  const handleExecuteVoid = async () => {
    if (!targetVoidItem || !voidReason.trim()) return;
    setIsVoiding(true);
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const endpoint = targetVoidItem.type === 'bill'
        ? `http://localhost:5000/api/bills/${targetVoidItem.id}/void`
        : `http://localhost:5000/api/pisai/${targetVoidItem.id}/void`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: voidReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || 'Failed to void transaction');
        return;
      }
      setVoidModalOpen(false);
      setVoidReason('');
      setTargetVoidItem(null);
      await fetchLedgerStream(dateFilter);
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsVoiding(false);
    }
  };

  const handleAddExpense = async () => {
    const amt = parseFloat(expenseAmount) || 0;
    if (amt <= 0 || !expenseDesc.trim()) return;

    const catMap: Record<string, 'ELECTRICITY' | 'LABOR' | 'TEA_FOOD' | 'MAINTENANCE' | 'TRANSPORT' | 'MISC'> = {
      Electricity: 'ELECTRICITY',
      'Worker Tea / Food': 'TEA_FOOD',
      Labor: 'LABOR',
      'Shop Maintenance': 'MAINTENANCE',
      Transport: 'TRANSPORT',
      'Other / Miscellaneous': 'MISC',
    };

    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category: catMap[expenseCategory] || 'MISC',
          description: expenseDesc.trim(),
          amount: amt,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.error?.message || 'Failed to record expense');
        return;
      }

      setIsExpenseOpen(false);
      setExpenseDesc('');
      setExpenseAmount('');

      // Reload ledger stream
      await fetchLedgerStream(dateFilter);
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    }
  };

  const handleExportCsv = async () => {
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch(`http://localhost:5000/api/reports/export-csv?range=${dateFilter}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flour-erp-${dateFilter}-report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  const totalInflow = ledger
    .filter((i) => i.type === 'inflow')
    .reduce((s, i) => s + i.amount, 0);

  const totalOutflow = ledger
    .filter((i) => i.type === 'outflow')
    .reduce((s, i) => s + i.amount, 0);

  const netDayCash = totalInflow - totalOutflow;

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'SALE':
        return t('سیل', 'SALE');
      case 'PISAI':
        return t('پسائی', 'PISAI');
      case 'EXPENSE':
        return t('خرچہ', 'EXPENSE');
      case 'PAYMENT':
        return t('وصولی', 'PAYMENT');
      case 'RETURN':
        return t('واپسی', 'RETURN');
      case 'CREDIT':
        return t('ادھار', 'CREDIT');
      default:
        return cat;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Sub-Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #C2C5AA', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('financial')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            backgroundColor: activeSubTab === 'financial' ? '#414833' : '#F4F5EE',
            color: activeSubTab === 'financial' ? '#F4F5EE' : '#414833',
            border: '1.5px solid #414833',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={isUrdu ? 'font-nastaleeq' : ''}
        >
          <FileText size={16} />
          <span>{t('مالیاتی لیجر و رپورٹس', 'Financial Ledger & Reports')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('audit')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            backgroundColor: activeSubTab === 'audit' ? '#414833' : '#F4F5EE',
            color: activeSubTab === 'audit' ? '#F4F5EE' : '#414833',
            border: '1.5px solid #414833',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={isUrdu ? 'font-nastaleeq' : ''}
        >
          <History size={16} />
          <span>{t('سرگرمی اور آڈٹ ٹریل (Audit Log)', 'Activity & Audit Trail')}</span>
        </button>
      </div>

      {activeSubTab === 'financial' ? (
        <>
          {/* Top Filter Bar & Actions */}
          <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1.5px solid #B6AD90',
          boxShadow: 'none',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Calendar size={18} color="#414833" />
          <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800, fontSize: '13.5px', color: '#414833' }}>
            {t('تاریخ:', 'Date Range:')}
          </span>
          {(['today', 'yesterday', '7days', 'month'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDateFilter(period)}
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: dateFilter === period ? 'none' : '1.5px solid #B6AD90',
                backgroundColor: dateFilter === period ? '#414833' : '#C2C5AA',
                color: dateFilter === period ? '#F4F5EE' : '#414833',
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              {period === 'today'
                ? t('آج', 'Today')
                : period === 'yesterday'
                  ? t('گزشتہ کل', 'Yesterday')
                  : period === '7days'
                    ? t('پچھلے 7 دن', 'Last 7 Days')
                    : t('اس ماہ', 'This Month')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsExpenseOpen(true)}
            className="touch-active"
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '8px',
              backgroundColor: '#414833',
              color: '#F4F5EE',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PlusCircle size={16} color="#F4F5EE" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('اخراجات درج کریں', 'Log Expense')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="touch-active"
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: '8px',
              backgroundColor: '#C2C5AA',
              color: '#414833',
              border: '1.5px solid #B6AD90',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Download size={16} color="#414833" />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('ایکسپورٹ CSV', 'Export CSV')}
            </span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="reports-kpi-grid-responsive">
        <div style={{ backgroundColor: '#f0fdf4', padding: '14px 18px', borderRadius: '10px', border: '1.5px solid #bbf7d0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
              {isUrdu ? 'کل آمدن (سیل و فیس)' : 'Total Revenue'}
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#15803d' }}>
              {isUrdu ? 'آمدن' : 'TOTAL INFLOW'}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)', marginTop: '4px' }}>
            {isUrdu ? `+ ${totalInflow.toLocaleString()} روپے` : `+ Rs ${totalInflow.toLocaleString()}`}
          </div>
        </div>

        <div style={{ backgroundColor: '#fef2f2', padding: '14px 18px', borderRadius: '10px', border: '1.5px solid #fecaca' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b' }}>
              {isUrdu ? 'کل اخراجات و واپسی' : 'Total Expenses'}
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#b91c1c' }}>
              {isUrdu ? 'اخراجات' : 'TOTAL OUTFLOW'}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#b91c1c', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)', marginTop: '4px' }}>
            {isUrdu ? `- ${totalOutflow.toLocaleString()} روپے` : `- Rs ${totalOutflow.toLocaleString()}`}
          </div>
        </div>

        <div style={{ backgroundColor: '#fffdf5', padding: '14px 18px', borderRadius: '10px', border: '1.5px solid #fde68a' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>
              {isUrdu ? 'خالص نقد کیش' : 'Net Cash Position'}
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#d97706' }}>
              {isUrdu ? 'کاؤنٹر نقد بیلنس' : 'CLOSING BALANCE'}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#b45309', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)', marginTop: '4px' }}>
            {isUrdu ? `${netDayCash.toLocaleString()} روپے` : `Rs ${netDayCash.toLocaleString()}`}
          </div>
        </div>
      </div>

      {/* Unified Append-Only Ledger Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #B6AD90',
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        <div
          className={isUrdu ? 'font-nastaleeq' : ''}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.9fr 1.8fr 1.1fr 1fr 0.8fr',
            padding: '12px 18px',
            backgroundColor: '#C2C5AA',
            borderBottom: '1.5px solid #B6AD90',
            fontWeight: 800,
            fontSize: '12px',
            color: '#414833',
          }}
        >
          <span>{t('تاریخ / وقت', 'DATE / TIME')}</span>
          <span>{t('قسم', 'CATEGORY')}</span>
          <span>{t('تفصیل', 'DESCRIPTION')}</span>
          <span>{t('حوالہ نمبر', 'REFERENCE')}</span>
          <span style={{ textAlign: 'right' }}>{t('رقم', 'AMOUNT')}</span>
          <span style={{ textAlign: 'center' }}>{t('کارروائی', 'ACTION')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ledger.map((item) => {
            const isVoidable =
              (item.category === 'SALE' || item.category === 'PISAI') &&
              !item.description.includes('منسوخ') &&
              !item.description.includes('VOID');

            return (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 0.9fr 1.8fr 1.1fr 1fr 0.8fr',
                  padding: '12px 18px',
                  borderBottom: '1px solid #E8EAE0',
                  fontSize: '13.5px',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#414833', fontSize: '13px', fontWeight: 600 }}>{item.timestamp}</span>

                <div>
                  <span
                    className={isUrdu ? 'font-nastaleeq' : ''}
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#414833',
                      color: '#F4F5EE',
                      border: '1px solid #414833',
                    }}
                  >
                    {getCategoryLabel(item.category)}
                  </span>
                </div>

                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: '#414833', fontWeight: 700 }}>
                  {isUrdu && item.descriptionUr ? item.descriptionUr : item.description}
                </span>
                <span style={{ color: '#656D4A', fontFamily: 'var(--font-mono)', fontSize: '12.5px', fontWeight: 700 }}>{item.reference}</span>
                <span
                  style={{
                    textAlign: 'right',
                    fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '15px',
                    color: item.type === 'inflow' ? '#414833' : '#7F4F24',
                  }}
                >
                  {isUrdu
                    ? item.type === 'inflow'
                      ? `+ ${item.amount} روپے`
                      : item.type === 'outflow'
                      ? `- ${item.amount} روپے`
                      : `${item.amount} روپے`
                    : item.type === 'inflow'
                    ? `+ Rs ${item.amount}`
                    : item.type === 'outflow'
                    ? `- Rs ${item.amount}`
                    : `Rs ${item.amount}`}
                </span>

                <div style={{ textAlign: 'center' }}>
                  {isVoidable ? (
                    <button
                      type="button"
                      onClick={() => {
                        const rawId = item.id.replace('bill-', '').replace('pisai-', '');
                        setTargetVoidItem({
                          id: rawId,
                          type: item.category === 'SALE' ? 'bill' : 'pisai',
                          ref: item.reference,
                        });
                        setVoidModalOpen(true);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#fff1f2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                      className={isUrdu ? 'font-nastaleeq' : ''}
                    >
                      {t('منسوخ کریں', 'Void')}
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
    ) : (
      /* Audit Trail View */
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1.5px solid #B6AD90',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#C2C5AA',
            borderBottom: '1.5px solid #B6AD90',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#414833" />
            <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, fontSize: '14px', color: '#414833' }}>
              {t('محفوظ سسٹم لاگز (Synchronous Activity Audit Trail)', 'Immutable Activity Audit Trail')}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchAuditLogs}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #B6AD90',
              backgroundColor: '#F4F5EE',
              color: '#414833',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('تازہ کریں', 'Refresh')}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1.3fr 1.2fr 1fr 2fr',
            padding: '10px 18px',
            backgroundColor: '#E8EAE0',
            fontWeight: 800,
            fontSize: '12px',
            color: '#414833',
            borderBottom: '1px solid #B6AD90',
          }}
        >
          <span>{t('تاریخ و وقت', 'TIMESTAMP')}</span>
          <span>{t('ایکشن', 'ACTION')}</span>
          <span>{t('صارف', 'USER')}</span>
          <span>{t('شعبہ', 'ENTITY')}</span>
          <span>{t('تفصیل', 'DETAILS')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {isLoadingAudit ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              {t('لاگز لوڈ ہو رہے ہیں...', 'Loading audit logs...')}
            </div>
          ) : auditLogs.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              {t('کوئی سرگرمی لاگ موجود نہیں', 'No audit logs found.')}
            </div>
          ) : (
            auditLogs.map((log) => {
              let badgeColor = '#414833';
              let badgeBg = '#E8EAE0';

              if (log.action.includes('VOID')) {
                badgeColor = '#991b1b';
                badgeBg = '#fee2e2';
              } else if (log.action.includes('CLOSING')) {
                badgeColor = '#065f46';
                badgeBg = '#d1fae5';
              } else if (log.action.includes('DISCOUNT')) {
                badgeColor = '#92400e';
                badgeBg = '#fef3c7';
              }

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.3fr 1.3fr 1.2fr 1fr 2fr',
                    padding: '10px 18px',
                    borderBottom: '1px solid #E8EAE0',
                    fontSize: '12.5px',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                    {new Date(log.createdAt).toLocaleString('en-PK')}
                  </span>

                  <div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}33`,
                      }}
                    >
                      {log.action}
                    </span>
                  </div>

                  <span style={{ fontWeight: 700, color: '#334155' }}>
                    {log.user?.fullName || 'System'} ({log.user?.roleName || 'System'})
                  </span>

                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                    {log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                  </span>

                  <span style={{ color: '#475569', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    )}

      {/* Modal: Void Confirmation (VOID-01) */}
      {voidModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9997,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '22px',
              border: '1.5px solid #cbd5e1',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ban size={20} color="#b91c1c" />
                <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#991b1b' }}>
                  {t('بل یا ٹوکن منسوخ کریں', 'Void Transaction')} ({targetVoidItem?.ref})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVoidModalOpen(false);
                  setVoidReason('');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 14px' }} className={isUrdu ? 'font-nastaleeq' : ''}>
              {t(
                'منسوخی کے بعد یہ بل باطل ہو جائے گا اور اگر ادھار پر تھا تو کھاتہ سے خودکار کٹوتی ہو جائے گی۔ اصل ڈیٹا ریکارڈ محفوظ رہے گا۔',
                'Voiding marks this transaction as VOID and atomically reverses any customer credit balance. Original audit record is preserved.'
              )}
            </p>

            <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              {t('منسوخی کی وجہ (لازمی):', 'Void Reason (Required):')}
            </label>
            <input
              type="text"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder={isUrdu ? 'مثلاً: غلط اندراج / کسٹمر نے واپسی کی' : 'e.g. Incorrect weight entry / customer cancelled'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13.5px',
                marginBottom: '18px',
                outline: 'none',
              }}
              className={isUrdu ? 'font-nastaleeq' : ''}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setVoidModalOpen(false);
                  setVoidReason('');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t('کینسل', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleExecuteVoid}
                disabled={isVoiding || !voidReason.trim()}
                style={{
                  flex: 1.5,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
                className={isUrdu ? 'font-nastaleeq' : ''}
              >
                {isVoiding ? t('منسوخ ہو رہا ہے...', 'Voiding...') : t('منسوخی کی تصدیق کریں', 'Confirm Void')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Shop Expense */}
      {isExpenseOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9996,
            backgroundColor: 'rgba(65, 72, 51, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#F4F5EE',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '2px solid #B6AD90',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '16px', fontWeight: 900, color: '#414833', margin: 0 }}>
                {t('دکان کا خرچہ درج کریں', 'Log Shop Expense')}
              </h3>
              <button onClick={() => setIsExpenseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#414833' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', fontWeight: 800, color: '#414833' }}>
                  {t('قسم:', 'Category:')}
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid #B6AD90',
                    marginTop: '4px',
                    backgroundColor: '#F4F5EE',
                    color: '#414833',
                    outline: 'none',
                    fontWeight: 700,
                  }}
                >
                  <option value="Electricity">{t('بجلی کا بل', 'Electricity Bill')}</option>
                  <option value="Labor">{t('مزدوری', 'Labor Mazdoori')}</option>
                  <option value="Maintenance">{t('چکی مشین مرمت', 'Mill Maintenance')}</option>
                  <option value="Tea & Refreshment">{t('چائے پانی و راشن', 'Tea & Refreshment')}</option>
                  <option value="Other">{t('دیگر متفرق اخراجات', 'Other Miscellaneous')}</option>
                </select>
              </div>

              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', fontWeight: 800, color: '#414833' }}>
                  {t('تفصیل:', 'Description:')}
                </label>
                <input
                  type="text"
                  placeholder={t('مثلاً بیلٹ گریسنگ، جنریٹر ڈیزل...', 'e.g. Belt greasing, generator diesel...')}
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid #B6AD90',
                    marginTop: '4px',
                    backgroundColor: '#F4F5EE',
                    color: '#414833',
                    outline: 'none',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', fontWeight: 800, color: '#414833' }}>
                  {t('رقم:', 'Amount (Rs):')}
                </label>
                <input
                  type="number"
                  placeholder={isUrdu ? '0 روپے' : 'Rs 0'}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid #B6AD90',
                    marginTop: '4px',
                    fontSize: '18px',
                    fontWeight: 900,
                    backgroundColor: '#F4F5EE',
                    color: '#414833',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddExpense}
              className="touch-active"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#414833',
                color: '#F4F5EE',
                border: 'none',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <span className={isUrdu ? 'font-nastaleeq' : ''}>
                {t('خرچہ محفوظ کریں', 'Record Expense')}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
