'use client';

import React, { useState } from 'react';
import { Calendar, Download, PlusCircle, ArrowUpRight, ArrowDownLeft, RotateCcw, Filter, X } from 'lucide-react';
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
  const [ledger, setLedger] = useState<LedgerItem[]>(INITIAL_LEDGER);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'month'>('today');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Electricity');

  const handleAddExpense = () => {
    const amt = parseFloat(expenseAmount) || 0;
    if (amt <= 0 || !expenseDesc.trim()) return;

    const newExpense: LedgerItem = {
      id: `exp_${Date.now()}`,
      timestamp: isUrdu ? 'آج، ابھی' : 'Today, Just Now',
      category: 'EXPENSE',
      description: `${expenseCategory}: ${expenseDesc.trim()}`,
      descriptionUr: `${expenseCategory}: ${expenseDesc.trim()}`,
      reference: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      amount: amt,
      type: 'outflow',
    };

    setLedger([newExpense, ...ledger]);
    setIsExpenseOpen(false);
    setExpenseDesc('');
    setExpenseAmount('');
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
            onClick={() => alert(isUrdu ? 'CSV فائل ڈاؤنلوڈ ہو گئی' : 'Simulated CSV export generated')}
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
            gridTemplateColumns: '1.5fr 1fr 2fr 1.2fr 1fr',
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ledger.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 2fr 1.2fr 1fr',
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
            </div>
          ))}
        </div>
      </div>

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
