'use client';

import React, { useState } from 'react';
import { Calendar, Download, PlusCircle, ArrowUpRight, ArrowDownLeft, RotateCcw, Filter, X } from 'lucide-react';

interface LedgerItem {
  id: string;
  timestamp: string;
  category: 'SALE' | 'PISAI' | 'CREDIT' | 'PAYMENT' | 'EXPENSE' | 'RETURN';
  description: string;
  reference: string;
  amount: number;
  type: 'inflow' | 'outflow' | 'neutral';
}

const INITIAL_LEDGER: LedgerItem[] = [
  { id: '1', timestamp: 'Today, 2:30 PM', category: 'SALE', description: '40 KG Chakki Atta', reference: 'BILL-00481', amount: 5600, type: 'inflow' },
  { id: '2', timestamp: 'Today, 2:15 PM', category: 'PISAI', description: '25 KG Safai + Pisai (Token #0482)', reference: 'PISAI-0482', amount: 150, type: 'inflow' },
  { id: '3', timestamp: 'Today, 1:45 PM', category: 'EXPENSE', description: 'Mill Electricity Advance Bill', reference: 'EXP-109', amount: 2500, type: 'outflow' },
  { id: '4', timestamp: 'Today, 1:10 PM', category: 'PAYMENT', description: 'Haji Rasheed Cash Repayment', reference: 'PAY-055', amount: 2000, type: 'inflow' },
  { id: '5', timestamp: 'Today, 12:30 PM', category: 'SALE', description: '10 KG Fine Atta', reference: 'BILL-00480', amount: 1480, type: 'inflow' },
  { id: '6', timestamp: 'Today, 11:15 AM', category: 'RETURN', description: 'Return 5 KG Maida (Damaged Bag)', reference: 'RET-012', amount: 775, type: 'outflow' },
  { id: '7', timestamp: 'Today, 10:00 AM', category: 'EXPENSE', description: 'Worker Daily Lunch / Tea', reference: 'EXP-108', amount: 350, type: 'outflow' },
];

export const ReportsView: React.FC = () => {
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
      timestamp: 'Today, Just Now',
      category: 'EXPENSE',
      description: `${expenseCategory}: ${expenseDesc.trim()}`,
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
          boxShadow: '0 2px 6px rgba(65, 72, 51, 0.05)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Calendar size={18} color="#414833" />
          <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#414833' }}>Date Range:</span>
          {(['today', 'yesterday', '7days', 'month'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDateFilter(period)}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                border: dateFilter === period ? 'none' : '1.5px solid #B6AD90',
                backgroundColor: dateFilter === period ? '#414833' : '#C2C5AA',
                color: dateFilter === period ? '#F4F5EE' : '#414833',
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              {period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : period === '7days' ? 'Last 7 Days' : 'This Month'}
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
            <PlusCircle size={16} color="#F4F5EE" /> Log Expense (اخراجات)
          </button>

          <button
            type="button"
            onClick={() => alert('Simulated CSV export generated: Ledger_Export_18_09_2026.csv')}
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
            <Download size={16} color="#414833" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="reports-kpi-grid-responsive">
        <div style={{ backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>کل آمدن (سیل و فیس)</span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b' }}>TOTAL REVENUE</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            + Rs {totalInflow.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>کل اخراجات و واپسی</span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b' }}>TOTAL EXPENSES</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#b91c1c', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            - Rs {totalOutflow.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '10px', border: '1.5px solid #d97706' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>خالص نقد کیش</span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#d97706' }}>NET CASH POSITION</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            Rs {netDayCash.toLocaleString()}
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
          boxShadow: '0 2px 6px rgba(65, 72, 51, 0.05)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 2fr 1.2fr 1fr',
            padding: '12px 18px',
            backgroundColor: '#C2C5AA',
            borderBottom: '1.5px solid #B6AD90',
            fontWeight: 800,
            fontSize: '12.5px',
            color: '#414833',
          }}
        >
          <span>DATE / TIME</span>
          <span>CATEGORY</span>
          <span>DESCRIPTION</span>
          <span>REFERENCE</span>
          <span style={{ textAlign: 'right' }}>AMOUNT (Rs)</span>
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
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#414833',
                    color: '#F4F5EE',
                    border: '1px solid #414833',
                  }}
                >
                  {item.category}
                </span>
              </div>

              <span style={{ color: '#414833', fontWeight: 700 }}>{item.description}</span>
              <span style={{ color: '#656D4A', fontFamily: 'var(--font-mono)', fontSize: '12.5px', fontWeight: 700 }}>{item.reference}</span>
              <span
                style={{
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  fontSize: '15px',
                  color: item.type === 'inflow' ? '#414833' : '#7F4F24',
                }}
              >
                {item.type === 'inflow' ? `+ Rs ${item.amount}` : item.type === 'outflow' ? `- Rs ${item.amount}` : `Rs ${item.amount}`}
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
              boxShadow: '0 20px 25px -5px rgba(65, 72, 51, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#414833', margin: 0 }}>Log Shop Expense</h3>
              <button onClick={() => setIsExpenseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#414833' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#414833' }}>Category (قسم)</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
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
                  <option value="Electricity">Electricity (بجلی کا بل)</option>
                  <option value="Labor">Labor / Mazdoori (مزدوری)</option>
                  <option value="Maintenance">Chakki Machine Maintenance (مرمت)</option>
                  <option value="Tea & Refreshment">Tea & Refreshment (چائے پانی)</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#414833' }}>Description (تفصیل)</label>
                <input
                  type="text"
                  placeholder="e.g. Belt greasing, generator diesel..."
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
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#414833' }}>Amount (رقم - Rs)</label>
                <input
                  type="number"
                  placeholder="Rs 0"
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
              Record Expense
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
