'use strict';
'use client';

import React, { useState } from 'react';
import { Search, UserPlus, Phone, DollarSign, History, Check, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number; // positive = customer owes shop
  lastActivity: string;
  transactions: Array<{
    id: string;
    date: string;
    type: 'purchase' | 'payment';
    description: string;
    amount: number;
    runningBalance: number;
  }>;
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Haji Rasheed (حاجی رشید)',
    phone: '0300-8765432',
    balance: 14500,
    lastActivity: 'Today, 2:15 PM',
    transactions: [
      { id: 't1', date: '18 Sep 2026', type: 'purchase', description: '40 KG Chakki Atta (Bori)', amount: 5600, runningBalance: 14500 },
      { id: 't2', date: '14 Sep 2026', type: 'payment', description: 'Cash Repayment via Counter', amount: 3000, runningBalance: 8900 },
      { id: 't3', date: '10 Sep 2026', type: 'purchase', description: '50 KG Gundam Pisai + 20 KG Maida', amount: 4800, runningBalance: 11900 },
    ],
  },
  {
    id: 'c2',
    name: 'Tariq Naan Shop (طارق نان بائی)',
    phone: '0321-9876543',
    balance: 38200,
    lastActivity: 'Yesterday',
    transactions: [
      { id: 't4', date: '17 Sep 2026', type: 'purchase', description: '4 Bags Fine Atta (160 KG)', amount: 23680, runningBalance: 38200 },
      { id: 't5', date: '12 Sep 2026', type: 'payment', description: 'Bank Cash Deposit', amount: 15000, runningBalance: 14520 },
    ],
  },
  {
    id: 'c3',
    name: 'Mian Aslam Zamindar (میاں اسلم زمیندار)',
    phone: '0333-1122334',
    balance: 8400,
    lastActivity: '15 Sep 2026',
    transactions: [
      { id: 't6', date: '15 Sep 2026', type: 'purchase', description: 'Gundam Safai + Pisai (120 KG)', amount: 1800, runningBalance: 8400 },
      { id: 't7', date: '01 Sep 2026', type: 'purchase', description: 'Chokar 2 Bags', amount: 6600, runningBalance: 6600 },
    ],
  },
];

export const CustomerLedgerView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [isRepaymentOpen, setIsRepaymentOpen] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState('2000');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleRecordPayment = () => {
    const amount = parseFloat(repaymentAmount) || 0;
    if (amount <= 0) return;

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      balance: Math.max(0, selectedCustomer.balance - amount),
      lastActivity: 'Just Now',
      transactions: [
        {
          id: `t_${Date.now()}`,
          date: 'Today, Just Now',
          type: 'payment',
          description: 'Cash Repayment Logged',
          amount,
          runningBalance: Math.max(0, selectedCustomer.balance - amount),
        },
        ...selectedCustomer.transactions,
      ],
    };

    setCustomers((prev) =>
      prev.map((c) => (c.id === selectedCustomer.id ? updatedCustomer : c))
    );
    setSelectedCustomer(updatedCustomer);
    setIsRepaymentOpen(false);
    setRepaymentAmount('');
  };

  const handleCreateCustomer = () => {
    if (!newName.trim()) return;
    const newCust: Customer = {
      id: `c_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || 'No phone',
      balance: 0,
      lastActivity: 'New Account',
      transactions: [],
    };
    setCustomers([newCust, ...customers]);
    setSelectedCustomer(newCust);
    setIsNewCustomerOpen(false);
    setNewName('');
    setNewPhone('');
  };

  const totalOutstandingUdhaar = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Top Banner: Total Udhaar Exposure */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#EDE0D4',
          border: '2px solid #DDB892',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 4px 12px rgba(127, 85, 57, 0.08)',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#7F5539' }}>
            TOTAL OUTSTANDING CUSTOMER UDHAAR (مجموعی ادھار کھاتہ)
          </span>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#7F5539',
              fontFamily: 'var(--font-mono)',
              marginTop: '2px',
            }}
          >
            Rs {totalOutstandingUdhaar.toLocaleString()}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsNewCustomerOpen(true)}
          className="touch-active"
          style={{
            height: '46px',
            padding: '0 16px',
            borderRadius: '10px',
            backgroundColor: '#7F5539',
            color: '#EDE0D4',
            border: 'none',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <UserPlus size={18} color="#EDE0D4" /> + Add Customer (نیا کھاتہ)
        </button>
      </div>

      {/* Main Grid: Customer Search List + Customer Detail Profile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 1.4fr)',
          gap: '18px',
        }}
      >
        {/* Customer Directory */}
        <div
          style={{
            backgroundColor: '#EDE0D4',
            borderRadius: '16px',
            border: '2px solid #DDB892',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(127, 85, 57, 0.08)',
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#EDE0D4',
              border: '1.5px solid #DDB892',
              borderRadius: '10px',
              padding: '8px 12px',
            }}
          >
            <Search size={18} color="#7F5539" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                fontWeight: 700,
                color: '#7F5539',
              }}
            />
          </div>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '520px' }}>
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="touch-active"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#E6CCB2' : '#EDE0D4',
                    border: isSelected ? '2px solid #7F5539' : '1px solid #DDB892',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: isSelected ? '0 4px 10px rgba(127, 85, 57, 0.15)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#7F5539' }}>{cust.name}</div>
                    <div style={{ fontSize: '12px', color: '#B08968', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 600 }}>
                      <Phone size={12} /> {cust.phone}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#7F5539', fontFamily: 'var(--font-mono)' }}>
                      Rs {cust.balance.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#B08968', marginTop: '2px', fontWeight: 600 }}>
                      {cust.lastActivity}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Customer Profile & Chronological Ledger */}
        <div
          style={{
            backgroundColor: '#EDE0D4',
            borderRadius: '16px',
            border: '2px solid #DDB892',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(127, 85, 57, 0.08)',
          }}
        >
          {/* Profile Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid #DDB892',
              paddingBottom: '14px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#7F5539' }}>{selectedCustomer.name}</h3>
              <div style={{ fontSize: '13px', color: '#B08968', marginTop: '2px', fontWeight: 600 }}>
                Contact: {selectedCustomer.phone}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#7F5539' }}>CURRENT BALANCE (بقایا ادھار)</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#7F5539', fontFamily: 'var(--font-mono)' }}>
                Rs {selectedCustomer.balance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Bar: Log Cash Repayment */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsRepaymentOpen(true)}
              className="touch-active"
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '10px',
                backgroundColor: '#7F5539',
                color: '#EDE0D4',
                border: 'none',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <DollarSign size={18} color="#EDE0D4" /> Log Cash Repayment (ادھار وصولی)
            </button>
          </div>

          {/* Chronological Append-Only Transactions Ledger */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <History size={16} color="#7F5539" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#7F5539' }}>
                Transaction History (کھاتہ کی تفصیل)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
              {selectedCustomer.transactions.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#7F5539', fontSize: '13px', fontWeight: 600 }}>
                  No prior transactions logged for this account.
                </div>
              ) : (
                selectedCustomer.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#E6CCB2',
                      border: '1px solid #DDB892',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '9999px',
                          backgroundColor: '#7F5539',
                          color: '#EDE0D4',
                          border: '1px solid #7F5539',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {tx.type === 'purchase' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#7F5539' }}>{tx.description}</div>
                        <div style={{ fontSize: '11px', color: '#7F5539' }}>{tx.date}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: '14px',
                          color: '#7F5539',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {tx.type === 'purchase' ? `+ Rs ${tx.amount}` : `- Rs ${tx.amount}`}
                      </div>
                      <div style={{ fontSize: '11px', color: '#7F5539', fontWeight: 600 }}>
                        Bal: Rs {tx.runningBalance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Log Cash Repayment */}
      {isRepaymentOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9996,
            backgroundColor: 'rgba(127, 85, 57, 0.65)',
            backdropFilter: 'blur(8px)',
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
              backgroundColor: '#EDE0D4',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid #DDB892',
              boxShadow: '0 20px 35px rgba(127, 85, 57, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#7F5539', margin: 0 }}>Log Cash Repayment</h3>
              <button onClick={() => setIsRepaymentOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7F5539' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#7F5539', marginBottom: '14px' }}>
              Customer: <strong style={{ color: '#7F5539' }}>{selectedCustomer.name}</strong> • Current Udhaar: <strong style={{ color: '#7F5539' }}>Rs {selectedCustomer.balance}</strong>
            </p>

            <label style={{ fontSize: '12px', fontWeight: 800, color: '#7F5539' }}>
              REPAYMENT AMOUNT (وصولی رقم)
            </label>
            <input
              type="number"
              value={repaymentAmount}
              onChange={(e) => setRepaymentAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '2px solid #DDB892',
                backgroundColor: '#EDE0D4',
                color: '#7F5539',
                fontSize: '22px',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                marginTop: '6px',
                marginBottom: '18px',
              }}
            />

            <button
              type="button"
              onClick={handleRecordPayment}
              className="touch-active"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#7F5539',
                color: '#EDE0D4',
                border: 'none',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Confirm Cash Received (محفوظ کریں)
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add New Customer */}
      {isNewCustomerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9996,
            backgroundColor: 'rgba(127, 85, 57, 0.65)',
            backdropFilter: 'blur(8px)',
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
              backgroundColor: '#EDE0D4',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid #DDB892',
              boxShadow: '0 20px 35px rgba(127, 85, 57, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#7F5539', margin: 0 }}>Add Credit Customer</h3>
              <button onClick={() => setIsNewCustomerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7F5539' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#7F5539' }}>Customer Name (نام)</label>
                <input
                  type="text"
                  placeholder="e.g. Haji Asif / حاجی آصف"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #DDB892', backgroundColor: '#EDE0D4', color: '#7F5539', marginTop: '4px', outline: 'none', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#7F5539' }}>Phone Number (موبائل نمبر)</label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #DDB892', backgroundColor: '#EDE0D4', color: '#7F5539', marginTop: '4px', outline: 'none', fontWeight: 700 }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateCustomer}
              className="touch-active"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: '#7F5539',
                color: '#EDE0D4',
                border: 'none',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
