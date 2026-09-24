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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Sub-Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('financial')}
          style={{
            padding: '10px 22px',
            borderRadius: '12px',
            backgroundColor: activeSubTab === 'financial' ? '#0F172A' : '#FFFFFF',
            color: activeSubTab === 'financial' ? '#FFFFFF' : '#475569',
            border: activeSubTab === 'financial' ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
            fontSize: isUrdu ? '20px' : '15px',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: activeSubTab === 'financial' ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
            transition: 'all 0.15s ease',
          }}
          className={isUrdu ? 'font-nastaleeq' : ''}
        >
          <FileText size={18} />
          <span>{t('مالیاتی لیجر و رپورٹس', 'Financial Ledger & Reports')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('audit')}
          style={{
            padding: '10px 22px',
            borderRadius: '12px',
            backgroundColor: activeSubTab === 'audit' ? '#0F172A' : '#FFFFFF',
            color: activeSubTab === 'audit' ? '#FFFFFF' : '#475569',
            border: activeSubTab === 'audit' ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
            fontSize: isUrdu ? '20px' : '15px',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: activeSubTab === 'audit' ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
            transition: 'all 0.15s ease',
          }}
          className={isUrdu ? 'font-nastaleeq' : ''}
        >
          <History size={18} />
          <span>{t('سرگرمی اور آڈٹ لاگ', 'Activity & Audit Trail')}</span>
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
              padding: '14px 20px',
              borderRadius: '16px',
              border: '1.5px solid #CBD5E1',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* Left: Date Period Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                <Calendar size={20} color="#0F172A" />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, fontSize: isUrdu ? '19px' : '14px', color: '#0F172A' }}>
                  {t('تاریخ:', 'Date:')}
                </span>
              </div>
              {(['today', 'yesterday', '7days', 'month'] as const).map((period) => {
                const isSelected = dateFilter === period;
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setDateFilter(period)}
                    className={isUrdu ? 'font-nastaleeq' : ''}
                    style={{
                      height: '40px',
                      padding: '0 18px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #1877F2' : '1.5px solid #CBD5E1',
                      backgroundColor: isSelected ? '#1877F2' : '#F8FAFC',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      fontWeight: 800,
                      fontSize: isUrdu ? '18px' : '13.5px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(24, 119, 242, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
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
                );
              })}
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setIsExpenseOpen(true)}
                className="touch-active"
                style={{
                  height: '44px',
                  padding: '0 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0E8A54 0%, #065F46 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: isUrdu ? '19px' : '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(14, 138, 84, 0.25)',
                }}
              >
                <PlusCircle size={18} color="#FFFFFF" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('اخراجات درج کریں', 'Log Expense')}
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="touch-active"
                style={{
                  height: '44px',
                  padding: '0 18px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  border: '1.5px solid #CBD5E1',
                  fontSize: isUrdu ? '18px' : '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Download size={18} color="#334155" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('ایکسپورٹ CSV', 'Export CSV')}
                </span>
              </button>
            </div>
          </div>

          {/* Large Summary KPI Cards (Responsive Grid) */}
          <div className="reports-summary-3-cards">
            {/* Card 1: Total Inflow */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                padding: '16px 22px',
                borderRadius: '16px',
                border: '1.5px solid #86EFAC',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '76px',
              }}
            >
              {/* Left: Amount */}
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 900,
                  color: '#15803D',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  direction: 'ltr',
                }}
              >
                <span>+{totalInflow.toLocaleString()}</span>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 800, color: '#166534' }}
                >
                  {isUrdu ? 'روپے' : 'PKR'}
                </span>
              </div>

              {/* Right: Title */}
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '22px' : '15px',
                  fontWeight: 900,
                  color: '#166534',
                  textAlign: 'right',
                }}
              >
                {isUrdu ? 'کل آمدن (سیل و فیس)' : 'Total Revenue'}
              </span>
            </div>

            {/* Card 2: Total Outflow */}
            <div
              style={{
                backgroundColor: '#FEF2F2',
                padding: '16px 22px',
                borderRadius: '16px',
                border: '1.5px solid #FECACA',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '76px',
              }}
            >
              {/* Left: Amount */}
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 900,
                  color: '#DC2626',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  direction: 'ltr',
                }}
              >
                <span>-{totalOutflow.toLocaleString()}</span>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 800, color: '#991B1B' }}
                >
                  {isUrdu ? 'روپے' : 'PKR'}
                </span>
              </div>

              {/* Right: Title */}
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '22px' : '15px',
                  fontWeight: 900,
                  color: '#991B1B',
                  textAlign: 'right',
                }}
              >
                {isUrdu ? 'کل اخراجات و واپسی' : 'Total Expenses'}
              </span>
            </div>

            {/* Card 3: Net Cash Balance */}
            <div
              style={{
                backgroundColor: '#FFFBEB',
                padding: '16px 22px',
                borderRadius: '16px',
                border: '1.5px solid #FDE68A',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '76px',
              }}
            >
              {/* Left: Amount */}
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 900,
                  color: '#B45309',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  direction: 'ltr',
                }}
              >
                <span>{netDayCash.toLocaleString()}</span>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 800, color: '#92400E' }}
                >
                  {isUrdu ? 'روپے' : 'PKR'}
                </span>
              </div>

              {/* Right: Title */}
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '22px' : '15px',
                  fontWeight: 900,
                  color: '#92400E',
                  textAlign: 'right',
                }}
              >
                {isUrdu ? 'خالص نقد کیش' : 'Net Cash Balance'}
              </span>
            </div>
          </div>

          {/* Unified Ledger Table (Clear, High-Contrast, Large Typography) */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Responsive Table Scroll Container for Mobile */}
            <div className="responsive-table-scroll">
              <div style={{ minWidth: '780px' }}>
                {/* Table Header */}
                <div
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr 1.8fr 1.1fr 1.2fr 0.8fr',
                    padding: '14px 20px',
                backgroundColor: '#0F172A',
                borderBottom: '2px solid #334155',
                fontWeight: 900,
                fontSize: isUrdu ? '19px' : '13px',
                color: '#FFFFFF',
                alignItems: 'center',
                direction: isUrdu ? 'rtl' : 'ltr',
              }}
            >
              <span style={{ textAlign: isUrdu ? 'right' : 'left' }}>{t('تاریخ و وقت', 'Date & Time')}</span>
              <span style={{ textAlign: 'center' }}>{t('قسم / شعبہ', 'Category')}</span>
              <span style={{ textAlign: isUrdu ? 'right' : 'left' }}>{t('تفصیل و کسٹمر', 'Description')}</span>
              <span style={{ textAlign: 'center' }}>{t('حوالہ نمبر', 'Reference')}</span>
              <span style={{ textAlign: isUrdu ? 'left' : 'right' }}>{t('رقم', 'Amount')}</span>
              <span style={{ textAlign: 'center' }}>{t('کارروائی', 'Action')}</span>
            </div>

            {/* Table Rows */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ledger.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: isUrdu ? '18px' : '14px' }} className={isUrdu ? 'font-nastaleeq' : ''}>
                  {t('اس تاریخ میں کوئی ریکارڈ موجود نہیں ہے۔', 'No ledger records found for this period.')}
                </div>
              ) : (
                ledger.map((item, idx) => {
                  const isVoidable =
                    (item.category === 'SALE' || item.category === 'PISAI') &&
                    !item.description.includes('منسوخ') &&
                    !item.description.includes('VOID');

                  let badgeBg = '#EFF6FF';
                  let badgeColor = '#1D4ED8';
                  let badgeBorder = '#BFDBFE';

                  if (item.category === 'EXPENSE') {
                    badgeBg = '#FEE2E2';
                    badgeColor = '#DC2626';
                    badgeBorder = '#FECACA';
                  } else if (item.category === 'PISAI') {
                    badgeBg = '#FEF3C7';
                    badgeColor = '#D97706';
                    badgeBorder = '#FDE68A';
                  } else if (item.category === 'PAYMENT') {
                    badgeBg = '#ECFDF5';
                    badgeColor = '#059669';
                    badgeBorder = '#A7F3D0';
                  } else if (item.category === 'RETURN') {
                    badgeBg = '#FFF1F2';
                    badgeColor = '#BE123C';
                    badgeBorder = '#FECDD3';
                  }

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 1fr 1.8fr 1.1fr 1.2fr 0.8fr',
                        padding: '14px 20px',
                        borderBottom: '1px solid #E2E8F0',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                        alignItems: 'center',
                        direction: isUrdu ? 'rtl' : 'ltr',
                      }}
                    >
                      {/* Timestamp */}
                      <span style={{ color: '#475569', fontSize: '13.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, textAlign: isUrdu ? 'right' : 'left' }}>
                        {item.timestamp}
                      </span>

                      {/* Category Badge */}
                      <div style={{ textAlign: 'center' }}>
                        <span
                          className={isUrdu ? 'font-nastaleeq' : ''}
                          style={{
                            fontSize: isUrdu ? '15px' : '12px',
                            fontWeight: 800,
                            padding: '3px 12px',
                            borderRadius: '20px',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeBorder}`,
                            display: 'inline-block',
                          }}
                        >
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>

                      {/* Description */}
                      <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: '#0F172A', fontWeight: 900, fontSize: isUrdu ? '20px' : '14.5px', textAlign: isUrdu ? 'right' : 'left' }}>
                        {isUrdu && item.descriptionUr ? item.descriptionUr : item.description}
                      </span>

                      {/* Reference Number */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ color: '#334155', fontFamily: 'var(--font-mono)', fontSize: '13.5px', fontWeight: 800, backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                          {item.reference}
                        </span>
                      </div>

                      {/* Amount */}
                      <span
                        dir="ltr"
                        style={{
                          textAlign: isUrdu ? 'left' : 'right',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 900,
                          fontSize: isUrdu ? '20px' : '16px',
                          color: item.type === 'inflow' ? '#15803D' : '#DC2626',
                        }}
                      >
                        {item.type === 'inflow'
                          ? `+ Rs ${item.amount.toLocaleString()}`
                          : item.type === 'outflow'
                          ? `- Rs ${item.amount.toLocaleString()}`
                          : `Rs ${item.amount.toLocaleString()}`}
                      </span>

                      {/* Action */}
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
                              padding: '5px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              fontSize: isUrdu ? '15px' : '12px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            className={isUrdu ? 'font-nastaleeq' : ''}
                          >
                            {t('منسوخ کریں', 'Void')}
                          </button>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '13px' }}>-</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Audit Trail View (High Contrast, Large Typography) */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #CBD5E1',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#0F172A',
              borderBottom: '2px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={20} color="#F59E0B" />
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, fontSize: isUrdu ? '20px' : '15px', color: '#FFFFFF' }}>
                {t('محفوظ سسٹم آڈٹ لاگ (System Activity Log)', 'System Activity & Security Audit Trail')}
              </span>
            </div>
            <button
              type="button"
              onClick={fetchAuditLogs}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                fontSize: isUrdu ? '16px' : '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              className={isUrdu ? 'font-nastaleeq' : ''}
            >
              {t('تازہ کریں', 'Refresh')}
            </button>
          </div>

          {/* Responsive Table Scroll Container for Audit Logs */}
          <div className="responsive-table-scroll">
            <div style={{ minWidth: '720px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 1.2fr 1.2fr 1fr 2fr',
                  padding: '12px 20px',
                  backgroundColor: '#F1F5F9',
              fontWeight: 900,
              fontSize: isUrdu ? '17px' : '12px',
              color: '#334155',
              borderBottom: '1px solid #CBD5E1',
              direction: isUrdu ? 'rtl' : 'ltr',
            }}
            className={isUrdu ? 'font-nastaleeq' : ''}
          >
            <span>{t('تاریخ و وقت', 'Timestamp')}</span>
            <span>{t('ایکشن', 'Action')}</span>
            <span>{t('صارف', 'User')}</span>
            <span>{t('شعبہ', 'Entity')}</span>
            <span>{t('تفصیل', 'Details')}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {isLoadingAudit ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '15px' }}>
                {t('لاگز لوڈ ہو رہے ہیں...', 'Loading audit logs...')}
              </div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: isUrdu ? '18px' : '14px' }} className={isUrdu ? 'font-nastaleeq' : ''}>
                {t('کوئی سرگرمی لاگ موجود نہیں ہے', 'No audit logs found.')}
              </div>
            ) : (
              auditLogs.map((log, idx) => {
                let badgeColor = '#1D4ED8';
                let badgeBg = '#EFF6FF';

                if (log.action.includes('VOID')) {
                  badgeColor = '#DC2626';
                  badgeBg = '#FEE2E2';
                } else if (log.action.includes('CLOSING')) {
                  badgeColor = '#059669';
                  badgeBg = '#ECFDF5';
                } else if (log.action.includes('DISCOUNT')) {
                  badgeColor = '#D97706';
                  badgeBg = '#FEF3C7';
                }

                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.3fr 1.2fr 1.2fr 1fr 2fr',
                      padding: '12px 20px',
                      borderBottom: '1px solid #E2E8F0',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                      fontSize: '13px',
                      alignItems: 'center',
                      direction: isUrdu ? 'rtl' : 'ltr',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#475569', fontWeight: 700 }}>
                      {new Date(log.createdAt).toLocaleString('en-PK')}
                    </span>

                    <div>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeColor}33`,
                        }}
                      >
                        {log.action}
                      </span>
                    </div>

                    <span style={{ fontWeight: 800, color: '#0F172A', fontSize: isUrdu ? '17px' : '13px' }} className={isUrdu ? 'font-nastaleeq' : ''}>
                      {log.user?.fullName || 'System'} ({log.user?.roleName || 'System'})
                    </span>

                    <span style={{ color: '#475569', fontSize: '13px', fontWeight: 700 }}>
                      {log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                    </span>

                    <span style={{ color: '#334155', fontSize: '12.5px', fontFamily: 'var(--font-mono)' }}>
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
            </div>
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
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '26px',
              border: '1.5px solid #CBD5E1',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ban size={22} color="#DC2626" />
                <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#DC2626' }}>
                  {t('بل یا ٹوکن منسوخ کریں', 'Void Transaction')} ({targetVoidItem?.ref})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVoidModalOpen(false);
                  setVoidReason('');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: isUrdu ? '16px' : '13px', color: '#475569', margin: '0 0 16px', lineHeight: 1.4 }} className={isUrdu ? 'font-nastaleeq' : ''}>
              {t(
                'منسوخی کے بعد یہ بل باطل ہو جائے گا اور اگر ادھار پر تھا تو کھاتہ سے خودکار کٹوتی ہو جائے گی۔ اصل ڈیٹا ریکارڈ محفوظ رہے گا۔',
                'Voiding marks this transaction as VOID and atomically reverses any customer credit balance. Original audit record is preserved.'
              )}
            </p>

            <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              {t('منسوخی کی وجہ (لازمی):', 'Void Reason (Required):')}
            </label>
            <input
              type="text"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder={isUrdu ? 'مثلاً: غلط اندراج / کسٹمر نے واپسی کی' : 'e.g. Incorrect weight entry / customer cancelled'}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '14px',
                marginBottom: '20px',
                outline: 'none',
              }}
              className={isUrdu ? 'font-nastaleeq' : ''}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setVoidModalOpen(false);
                  setVoidReason('');
                }}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  color: '#475569',
                  fontWeight: 800,
                  fontSize: isUrdu ? '17px' : '13.5px',
                  cursor: 'pointer',
                }}
                className={isUrdu ? 'font-nastaleeq' : ''}
              >
                {t('کینسل', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleExecuteVoid}
                disabled={isVoiding || !voidReason.trim()}
                style={{
                  flex: 1.5,
                  height: '46px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: isUrdu ? '18px' : '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
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
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1.5px solid #CBD5E1',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={22} color="#0E8A54" />
                <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {t('دکان کا نیا خرچہ درج کریں', 'Log Shop Expense')}
                </h3>
              </div>
              <button onClick={() => setIsExpenseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  {t('خرچے کی قسم:', 'Category:')}
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    outline: 'none',
                    fontWeight: 800,
                    fontSize: isUrdu ? '17px' : '13.5px',
                  }}
                >
                  <option value="Electricity">{t('بجلی کا بل', 'Electricity Bill')}</option>
                  <option value="Labor">{t('مزدوری و دیہاڑی', 'Labor Mazdoori')}</option>
                  <option value="Maintenance">{t('چکی مشین مرمت و آئلنگ', 'Mill Maintenance')}</option>
                  <option value="Tea & Refreshment">{t('چائے پانی و راشن ملازمین', 'Tea & Refreshment')}</option>
                  <option value="Other">{t('دیگر متفرق اخراجات', 'Other Miscellaneous')}</option>
                </select>
              </div>

              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  {t('تفصیل (Detail):', 'Description:')}
                </label>
                <input
                  type="text"
                  placeholder={t('مثلاً بیلٹ گریسنگ، جنریٹر ڈیزل، ٹرانسپورٹ...', 'e.g. Belt greasing, generator diesel...')}
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    outline: 'none',
                    fontWeight: 800,
                    fontSize: isUrdu ? '17px' : '13.5px',
                  }}
                  className={isUrdu ? 'font-nastaleeq' : ''}
                />
              </div>

              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  {t('رقم (Amount in PKR):', 'Amount (Rs):')}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '20px',
                    fontWeight: 900,
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    fontFamily: 'var(--font-mono)',
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
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0E8A54 0%, #065F46 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: isUrdu ? '20px' : '15px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(14, 138, 84, 0.25)',
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
