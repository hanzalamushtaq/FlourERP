'use strict';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Top Filter Bar & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F6F7F0',
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid #B6AD90',
          boxShadow: '0 4px 12px rgba(51, 61, 41, 0.08)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#333D29" />
          <span style={{ fontWeight: 800, fontSize: '14px', color: '#333D29' }}>Date Range:</span>
          {(['today', 'yesterday', '7days', 'month'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDateFilter(period)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: dateFilter === period ? 'none' : '1px solid #B6AD90',
                backgroundColor: dateFilter === period ? '#333D29' : '#C2C5AA',
                color: dateFilter === period ? '#F6F7F0' : '#333D29',
                fontWeight: 800,
                fontSize: '13px',
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
              height: '40px',
              padding: '0 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#333D29',
              color: '#F6F7F0',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PlusCircle size={16} color="#F6F7F0" /> Log Expense (اخراجات)
          </button>

          <button
            type="button"
            onClick={() => alert('Simulated CSV export generated: Ledger_Export_18_09_2026.csv')}
            className="touch-active"
            style={{
              height: '40px',
              padding: '0 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#C2C5AA',
              color: '#333D29',
              border: '1.5px solid #B6AD90',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={16} color="#333D29" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        <div style={{ backgroundColor: '#F6F7F0', padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid #B6AD90', boxShadow: '0 4px 10px rgba(51, 61, 41, 0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#333D29', textTransform: 'uppercase' }}>TOTAL REVENUE INFLOW</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#333D29', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            + Rs {totalInflow.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: '#F6F7F0', padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid #B6AD90', boxShadow: '0 4px 10px rgba(51, 61, 41, 0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#333D29', textTransform: 'uppercase' }}>TOTAL EXPENSES & RETURNS</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#333D29', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            - Rs {totalOutflow.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: '#C2C5AA', padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid #333D29', boxShadow: '0 6px 14px rgba(51, 61, 41, 0.15)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#333D29', textTransform: 'uppercase' }}>NET CASH POSITION</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#333D29', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            Rs {netDayCash.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Unified Append-Only Ledger Table */}
      <div
        style={{
          backgroundColor: '#F6F7F0',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid #B6AD90',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(51, 61, 41, 0.08)',
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
            fontSize: '12px',
            color: '#333D29',
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
                padding: '14px 18px',
                borderBottom: '1px solid #B6AD90',
                fontSize: '13px',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#333D29', fontSize: '12px', fontWeight: 600 }}>{item.timestamp}</span>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#333D29',
                    color: '#F6F7F0',
                    border: '1px solid #333D29',
                  }}
                >
                  {item.category}
                </span>
              </div>

              <span style={{ fontWeight: 700, color: '#333D29' }}>{item.description}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#656D4A', fontWeight: 600 }}>
                {item.reference}
              </span>

              <span
                style={{
                  textAlign: 'right',
                  fontWeight: 900,
                  fontSize: '15px',
                  fontFamily: 'var(--font-mono)',
                  color: '#333D29',
                }}
              >
                {item.type === 'inflow' ? `+ Rs ${item.amount}` : `- Rs ${item.amount}`}
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
            backgroundColor: 'rgba(51, 61, 41, 0.65)',
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
              backgroundColor: '#F6F7F0',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '2px solid #B6AD90',
              boxShadow: '0 20px 25px -5px rgba(51, 61, 41, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#333D29', margin: 0 }}>Log Shop Expense</h3>
              <button onClick={() => setIsExpenseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333D29' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#333D29' }}>Category (قسم)</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid #B6AD90',
                    marginTop: '4px',
                    backgroundColor: '#F6F7F0',
                    color: '#333D29',
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
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#333D29' }}>Description (تفصیل)</label>
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
                    backgroundColor: '#F6F7F0',
                    color: '#333D29',
                    outline: 'none',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#333D29' }}>Amount (رقم - Rs)</label>
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
                    backgroundColor: '#F6F7F0',
                    color: '#333D29',
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
                backgroundColor: '#333D29',
                color: '#F6F7F0',
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
