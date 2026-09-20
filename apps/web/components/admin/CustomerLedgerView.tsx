'use client';

import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  DollarSign,
  History,
  Check,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  BookOpen,
  Calendar,
  User,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Handcrafted Vector SVG for Ledger Book
const UdhaarBookSvg = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="5" width="23" height="26" rx="3.5" fill="#8C582B" stroke="#4A2810" strokeWidth="2.2" />
    <path d="M7 5H11V31H7C5.5 31 5 29.5 5 28V8C5 6.5 5.5 5 7 5Z" fill="#5C3617" stroke="#4A2810" strokeWidth="2.2" />
    <circle cx="20" cy="18" r="5.5" fill="#FAF4ED" stroke="#4A2810" strokeWidth="1.6" />
    <path d="M17.5 15H22.5M17.5 17.5H22.5M18.5 15V21" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 5V13L16 11.5L18 13V5" fill="#D97706" />
  </svg>
);

interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
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
    name: 'حاجی رشید',
    phone: '0300-8765432',
    balance: 14500,
    lastActivity: 'آج 2:15 PM',
    transactions: [
      { id: 't1', date: '18 Sep 2026', type: 'purchase', description: '40 KG چکی آٹا (بوری)', amount: 5600, runningBalance: 14500 },
      { id: 't2', date: '14 Sep 2026', type: 'payment', description: 'کاؤنٹر نقد وصولی', amount: 3000, runningBalance: 8900 },
      { id: 't3', date: '10 Sep 2026', type: 'purchase', description: '50 KG گندم پسائی + 20 KG میدہ', amount: 4800, runningBalance: 11900 },
    ],
  },
  {
    id: 'c2',
    name: 'طارق نان بائی',
    phone: '0321-9876543',
    balance: 38200,
    lastActivity: 'کل',
    transactions: [
      { id: 't4', date: '17 Sep 2026', type: 'purchase', description: '4 بوری فائن آٹا (160 KG)', amount: 23680, runningBalance: 38200 },
      { id: 't5', date: '12 Sep 2026', type: 'payment', description: 'بینک وصولی ٹرانسفر', amount: 15000, runningBalance: 14520 },
    ],
  },
  {
    id: 'c3',
    name: 'میاں اسلم زمیندار',
    phone: '0333-1122334',
    balance: 8400,
    lastActivity: '15 Sep',
    transactions: [
      { id: 't6', date: '15 Sep 2026', type: 'purchase', description: 'گندم صفائی + پسائی (120 KG)', amount: 1800, runningBalance: 8400 },
      { id: 't7', date: '01 Sep 2026', type: 'purchase', description: 'چوکر 2 بوری', amount: 6600, runningBalance: 6600 },
    ],
  },
];

export const CustomerLedgerView: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [isRepaymentOpen, setIsRepaymentOpen] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState('2000');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Dashboard Hover & Active States
  const [hoveredCustomer, setHoveredCustomer] = useState<string | null>(null);
  const [hoveredTopCard, setHoveredTopCard] = useState<'total' | 'new' | null>(null);
  const [hoveredRepayBtn, setHoveredRepayBtn] = useState<boolean>(false);
  const [pressedRepayBtn, setPressedRepayBtn] = useState<boolean>(false);

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
      lastActivity: isUrdu ? 'ابھی' : 'Just now',
      transactions: [
        {
          id: `t_${Date.now()}`,
          date: isUrdu ? 'آج (ابھی)' : 'Today (Now)',
          type: 'payment',
          description: t('نقد ادھار وصولی', 'Cash Payment Received'),
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
      lastActivity: isUrdu ? 'نیا کھاتہ' : 'New Account',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. TOP DASHBOARD ACTION CARDS (Aligned with bottom 2-column grid) */}
      <div className="ledger-grid-responsive">
        {/* Card 2 (Left Column): نیا کھاتہ کھولیں - Cobalt Blue Action Card */}
        <div
          onClick={() => setIsNewCustomerOpen(true)}
          onMouseEnter={() => setHoveredTopCard('new')}
          onMouseLeave={() => setHoveredTopCard(null)}
          className="touch-active"
          style={{
            backgroundColor: '#1877F2',
            borderRadius: '16px',
            border: 'none',
            boxShadow: 'none',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '84px',
            transition: 'background-color 0.15s ease',
          }}
        >
          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-start' : 'flex-start' }}>
            <h2
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: '18px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {t('+ نیا کھاتہ کھولیں', '+ Open New Ledger')}
            </h2>
            <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 700, marginTop: '2px', opacity: 0.9 }}>
              {t('نیا کسٹمر اکاؤنٹ رجسٹر کریں', 'Register New Customer Account')}
            </span>
          </div>

          {/* Icon Tile */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              border: 'none',
              flexShrink: 0,
            }}
          >
            <UserPlus size={22} color="#1877F2" strokeWidth={2.4} />
          </div>
        </div>

        {/* Card 1 (Right Column): مجموعی ادھار کھاتہ - Emerald Green */}
        <div
          onMouseEnter={() => setHoveredTopCard('total')}
          onMouseLeave={() => setHoveredTopCard(null)}
          className="dash-card-animated"
          style={{
            backgroundColor: '#0E8A54',
            borderRadius: '16px',
            border: 'none',
            boxShadow: 'none',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '84px',
            transition: 'background-color 0.15s ease',
          }}
        >
          {/* Text & Figure */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}
              >
                {t('مجموعی ادھار کھاتہ', 'Total Outstanding Ledger')}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#ECFDF5',
                  color: '#0E8A54',
                  border: 'none',
                  padding: '1px 7px',
                  borderRadius: '6px',
                }}
              >
                {customers.length} {t('کھاتے', 'Accounts')}
              </span>
            </div>

            <div
              dir="ltr"
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.15,
                marginTop: '3px',
              }}
            >
              Rs {totalOutstandingUdhaar.toLocaleString()}
            </div>
          </div>

          {/* Left: White Squircle Icon Tile */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              border: 'none',
              flexShrink: 0,
            }}
          >
            <UdhaarBookSvg />
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN BALANCED GRID (DASHBOARD STYLE) */}
      <div className="ledger-grid-responsive">
        {/* LEFT COLUMN: Customer Directory Card */}
        <div
          className="dash-card-animated"
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: 'none',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: 'none',
          }}
        >
          {/* Header with Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>👥</span>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '16.5px', fontWeight: 900, color: '#0F172A' }}>
                {t('گاہک کھاتہ جات', 'Customer Accounts')}
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#B45309',
                backgroundColor: '#FFFBEB',
                padding: '2px 8px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                border: 'none',
              }}
            >
              {filteredCustomers.length} {t('کسٹمرز', 'Customers')}
            </span>
          </div>

          {/* Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: 'none',
              borderRadius: '9px',
              padding: '0 10px',
              height: '40px',
              boxShadow: 'none',
            }}
          >
            <Search size={15} color="#64748B" />
            <input
              type="text"
              placeholder={t('گاہک تلاش کریں...', 'Search customers...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0F172A',
                textAlign: isUrdu ? 'right' : 'left',
              }}
            />
          </div>

          {/* Customer Cards List with top/bottom padding to prevent overflow clipping */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto',
              maxHeight: '520px',
              padding: '6px 4px 8px 4px',
            }}
          >
            {filteredCustomers.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px', fontWeight: 700 }}>
                {t('کوئی کسٹمر نہیں ملا', 'No customers found')}
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer.id === cust.id;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    onMouseEnter={() => setHoveredCustomer(cust.id)}
                    onMouseLeave={() => setHoveredCustomer(null)}
                    className="touch-active"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: 'none',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Squircle Avatar + Customer Info (Customer Name remains as written) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: isSelected ? '#DBEAFE' : '#F8FAFC',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: 'none',
                        }}
                      >
                        <User size={16} color={isSelected ? '#1877F2' : '#64748B'} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span
                          className={isUrdu ? 'font-nastaleeq' : ''}
                          style={{
                            fontWeight: 900,
                            fontSize: '15.5px',
                            color: isSelected ? '#1877F2' : '#0F172A',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {cust.name}
                        </span>

                        <span
                          style={{
                            fontSize: '11px',
                            color: '#64748B',
                            fontWeight: 600,
                            direction: 'ltr',
                            textAlign: isUrdu ? 'right' : 'left',
                            marginTop: '2px',
                          }}
                        >
                          📞 {cust.phone}
                        </span>
                      </div>
                    </div>

                    {/* Balance Figure & Last Activity */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-end' : 'flex-end', flexShrink: 0, [isUrdu ? 'marginRight' : 'marginLeft']: '10px' }}>
                      <span
                        dir="ltr"
                        style={{
                          fontSize: '15.5px',
                          fontWeight: 900,
                          color: '#DC2626',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        Rs {cust.balance.toLocaleString()}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        {isSelected && (
                          <span
                            className={isUrdu ? 'font-nastaleeq' : ''}
                            style={{
                              fontSize: '10px',
                              fontWeight: 900,
                              color: '#1877F2',
                            }}
                          >
                            ● {t('منتخب', 'Selected')}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '10px',
                            color: '#64748B',
                            fontWeight: 700,
                          }}
                        >
                          {cust.lastActivity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Customer Profile & Chronological Ledger */}
        <div
          className="dash-card-animated"
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            border: 'none',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'none',
          }}
        >
          {/* Profile Header Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 'none',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Squircle Avatar Tile */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} color="#1877F2" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h3
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.2 }}
                >
                  {selectedCustomer.name}
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 700, marginTop: '2px' }}>
                  📞 {selectedCustomer.phone}
                </span>
              </div>
            </div>

            {/* Current Balance Callout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-end' : 'flex-end' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>
                {t('بقایا ادھار:', 'Credit Balance:')}
              </span>
              <span
                dir="ltr"
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: selectedCustomer.balance > 0 ? '#DC2626' : '#0E8A54',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.1,
                  marginTop: '2px',
                }}
              >
                Rs {selectedCustomer.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Bar: Dashboard-Style Hero Button (Log Cash Repayment) */}
          <button
            type="button"
            onClick={() => setIsRepaymentOpen(true)}
            onMouseEnter={() => setHoveredRepayBtn(true)}
            onMouseLeave={() => {
              setHoveredRepayBtn(false);
              setPressedRepayBtn(false);
            }}
            onMouseDown={() => setPressedRepayBtn(true)}
            onMouseUp={() => setPressedRepayBtn(false)}
            onTouchStart={() => setPressedRepayBtn(true)}
            onTouchEnd={() => setPressedRepayBtn(false)}
            className="touch-active"
            style={{
              height: '48px',
              borderRadius: '14px',
              background: '#0E8A54',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: 'none',
              outline: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px 0 18px',
              transition: 'background-color 0.15s ease',
            }}
          >
            {/* White Squircle Icon Tile */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
                flexShrink: 0,
              }}
            >
              <DollarSign size={18} color="#0E8A54" strokeWidth={2.5} />
            </div>

            {/* Bold Text */}
            <span
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: '#FFFFFF',
              }}
            >
              {t('ادھار وصولی درج کریں', 'Log Cash Repayment')}
            </span>
          </button>

          {/* Chronological Append-Only Transactions Ledger */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} color="#D97706" />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>
                  {t('کھاتہ ہسٹری', 'Ledger History')}
                </span>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748B',
                  backgroundColor: '#FFFFFF',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  border: 'none',
                }}
              >
                {selectedCustomer.transactions.length} {t('اندراج', 'entries')}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '350px',
                overflowY: 'auto',
                padding: '4px 2px 6px 2px',
              }}
            >
              {selectedCustomer.transactions.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '12px', fontWeight: 700 }}>
                  {t('کوئی ٹرانزیکشن موجود نہیں ہے۔', 'No transactions found.')}
                </div>
              ) : (
                selectedCustomer.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      boxShadow: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Direction Icon + Description */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: tx.type === 'purchase' ? '#FEF2F2' : '#ECFDF5',
                          border: 'none',
                          color: tx.type === 'purchase' ? '#DC2626' : '#0E8A54',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {tx.type === 'purchase' ? <ArrowUpRight size={15} strokeWidth={2.4} /> : <ArrowDownLeft size={15} strokeWidth={2.4} />}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                          {tx.description}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                          <Calendar size={10} /> {tx.date}
                        </div>
                      </div>
                    </div>

                    {/* Amount & Running Balance */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: '14px',
                          color: tx.type === 'purchase' ? '#DC2626' : '#0E8A54',
                          fontFamily: 'var(--font-mono)',
                          direction: 'ltr',
                        }}
                      >
                        {tx.type === 'purchase' ? `+ Rs ${tx.amount.toLocaleString()}` : `- Rs ${tx.amount.toLocaleString()}`}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, marginTop: '1px' }}>
                        {t('بقایا:', 'Balance:')} Rs {tx.runningBalance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL: Log Cash Repayment */}
      {isRepaymentOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9996,
            backgroundColor: 'rgba(15, 23, 42, 0.60)',
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
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              border: '1.5px solid #EBE4DA',
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.22)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>💵</span>
                <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '18px', fontWeight: 900, color: '#1F2937', margin: 0 }}>
                  {t('ادھار وصولی درج کریں', 'Log Cash Repayment')}
                </h3>
              </div>
              <button
                onClick={() => setIsRepaymentOpen(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Customer & Current Balance Badge */}
            <div
              style={{
                backgroundColor: '#FAF5EE',
                border: '1px solid #EAE0D3',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '14px', fontWeight: 800, color: '#1F2937' }}>
                  {selectedCustomer.name}
                </span>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  📞 {selectedCustomer.phone}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '10.5px', color: '#B91C1C', fontWeight: 800 }}>
                  {t('کل بقایا', 'Total Balance')}
                </span>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#B91C1C', fontFamily: isUrdu ? 'var(--font-urdu)' : 'var(--font-mono)' }}>
                  {isUrdu ? `${selectedCustomer.balance.toLocaleString()} روپے` : `Rs ${selectedCustomer.balance.toLocaleString()}`}
                </div>
              </div>
            </div>

            {/* Input */}
            <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '12.5px', fontWeight: 800, color: '#1F2937', display: 'block', marginBottom: '4px', textAlign: 'left' }}>
              {t('وصول رقم:', 'Amount Received (Rs):')}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <input
                type="number"
                value={repaymentAmount}
                onChange={(e) => setRepaymentAmount(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1.5px solid #D5C9B8',
                  backgroundColor: '#FCFBF9',
                  color: '#111827',
                  fontSize: '19px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  padding: '0 12px 0 40px',
                  direction: 'ltr',
                  textAlign: 'right',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  fontSize: '12px',
                  fontWeight: 900,
                  color: '#4A2810',
                  backgroundColor: '#FAF3E8',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  fontFamily: isUrdu ? 'var(--font-urdu)' : 'inherit',
                }}
              >
                {isUrdu ? 'روپے' : 'Rs'}
              </span>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleRecordPayment}
              className="touch-active"
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '10px',
                background: '#21BF06',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '14.5px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Check size={16} strokeWidth={2.5} />
              <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('وصولی محفوظ کریں', 'Save Payment')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL: Add New Customer */}
      {isNewCustomerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9996,
            backgroundColor: 'rgba(15, 23, 42, 0.60)',
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
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              border: '1.5px solid #EBE4DA',
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.22)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>👤➕</span>
                <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '18px', fontWeight: 900, color: '#1F2937', margin: 0 }}>
                  {t('نیا کھاتہ کھولیں', 'Open New Ledger')}
                </h3>
              </div>
              <button
                onClick={() => setIsNewCustomerOpen(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937', display: 'block', marginBottom: '4px', textAlign: 'left' }}>
                  {t('گاہک کا نام:', 'Customer Name:')}
                </label>
                <input
                  type="text"
                  placeholder={t('مثلاً: حاجی آصف', 'e.g. Asif Khan')}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #D5C9B8',
                    backgroundColor: '#FCFBF9',
                    color: '#1F2937',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                />
              </div>

              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937', display: 'block', marginBottom: '4px', textAlign: 'left' }}>
                  {t('موبائل نمبر:', 'Mobile Phone:')}
                </label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #D5C9B8',
                    backgroundColor: '#FCFBF9',
                    color: '#1F2937',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    textAlign: 'left',
                    direction: 'ltr',
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateCustomer}
              className="touch-active"
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '10px',
                background: '#1877f2',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <UserPlus size={15} color="#FFFFFF" />
              <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('کھاتہ بنائیں', 'Create Account')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
