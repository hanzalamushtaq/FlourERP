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
      lastActivity: 'ابھی',
      transactions: [
        {
          id: `t_${Date.now()}`,
          date: 'آج (ابھی)',
          type: 'payment',
          description: 'نقد ادھار وصولی',
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
      lastActivity: 'نیا کھاتہ',
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
        {/* Card 2 (Left Column): نیا کھاتہ کھولیں - Sapphire Blue Dashboard Action Card */}
        <div
          onClick={() => setIsNewCustomerOpen(true)}
          onMouseEnter={() => setHoveredTopCard('new')}
          onMouseLeave={() => setHoveredTopCard(null)}
          className="touch-active"
          style={{
            direction: 'rtl',
            background:
              hoveredTopCard === 'new'
                ? 'linear-gradient(135deg, #9DB7C4 0%, #819EAD 50%, #698694 100%)'
                : 'linear-gradient(135deg, #8DAAB8 0%, #7491A0 50%, #5E7A88 100%)',
            borderRadius: '16px',
            border: hoveredTopCard === 'new' ? '2.5px solid #C4DCE8' : '2px solid #A8C4D2',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow:
              hoveredTopCard === 'new'
                ? '0 12px 28px rgba(116, 145, 160, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                : '0 6px 18px rgba(116, 145, 160, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)',
            minHeight: '84px',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: hoveredTopCard === 'new' ? 'translateY(-3px)' : 'none',
          }}
        >
          {/* Right: Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h2
              className="font-nastaleeq"
              style={{
                fontSize: '18px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
              }}
            >
              + نیا کھاتہ کھولیں
            </h2>
            <span style={{ fontSize: '11px', color: '#F0F7FA', fontWeight: 700, marginTop: '2px' }}>
              نیا کسٹمر اکاؤنٹ رجسٹر کریں
            </span>
          </div>

          {/* Left: White Squircle Icon Tile */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.20)',
              flexShrink: 0,
              transition: 'transform 0.22s ease',
              transform: hoveredTopCard === 'new' ? 'scale(1.08) rotate(2deg)' : 'scale(1)',
            }}
          >
            <UserPlus size={22} color="#5E7A88" strokeWidth={2.4} />
          </div>
        </div>

        {/* Card 1 (Right Column): مجموعی ادھار کھاتہ - Slate Pine Teal Palette */}
        <div
          onMouseEnter={() => setHoveredTopCard('total')}
          onMouseLeave={() => setHoveredTopCard(null)}
          className="dash-card-animated"
          style={{
            direction: 'rtl',
            background:
              hoveredTopCard === 'total'
                ? 'linear-gradient(135deg, #58797D 0%, #435E62 50%, #344B4E 100%)'
                : 'linear-gradient(135deg, #4A676B 0%, #374F52 50%, #2A3F42 100%)',
            borderRadius: '16px',
            border: hoveredTopCard === 'total' ? '2.5px solid #84A9AD' : '2px solid #5F8387',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow:
              hoveredTopCard === 'total'
                ? '0 12px 28px rgba(54, 79, 82, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                : '0 6px 18px rgba(54, 79, 82, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)',
            minHeight: '84px',
            transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: hoveredTopCard === 'total' ? 'translateY(-3px)' : 'none',
          }}
        >
          {/* Right: Text & Figure */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="font-nastaleeq"
                style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                مجموعی ادھار کھاتہ
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                  color: '#FDE047',
                  border: '1px solid rgba(253, 224, 71, 0.4)',
                  padding: '1px 7px',
                  borderRadius: '6px',
                }}
              >
                {customers.length} کھاتے
              </span>
            </div>

            <div
              dir="ltr"
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#FDE047',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.15,
                marginTop: '3px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
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
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.22)',
              flexShrink: 0,
              transition: 'transform 0.22s ease',
              transform: hoveredTopCard === 'total' ? 'scale(1.08) rotate(-2deg)' : 'scale(1)',
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
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #EBE4DA',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Header with Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>👥</span>
              <span className="font-nastaleeq" style={{ fontSize: '16.5px', fontWeight: 900, color: '#1F2937' }}>
                گاہک کھاتہ جات
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#78350F',
                backgroundColor: '#FEF3C7',
                padding: '2px 8px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {filteredCustomers.length} کسٹمرز
            </span>
          </div>

          {/* Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FCFBF9',
              border: '1.5px solid #D5C9B8',
              borderRadius: '9px',
              padding: '0 10px',
              height: '40px',
            }}
          >
            <Search size={15} color="#8C582B" />
            <input
              type="text"
              placeholder="گاہک تلاش کریں..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-nastaleeq"
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1F2937',
                textAlign: 'right',
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
                کوئی کسٹمر نہیں ملا
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer.id === cust.id;
                const isHovered = hoveredCustomer === cust.id;

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
                      backgroundColor: isSelected ? '#FAF5F2' : '#FFFFFF',
                      background: isSelected
                        ? 'linear-gradient(135deg, #FAF5F2 0%, #F5EBE5 50%, #ECE0D8 100%)'
                        : '#FFFFFF',
                      border: isSelected
                        ? '2.5px solid #BE9685'
                        : isHovered
                        ? '2px solid #D4ADA0'
                        : '1.5px solid #EBE4DA',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected
                        ? '0 6px 16px rgba(190, 150, 133, 0.25)'
                        : isHovered
                        ? '0 4px 12px rgba(0, 0, 0, 0.05)'
                        : 'none',
                      transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: isSelected || isHovered ? 'translateY(-2px)' : 'none',
                      direction: 'rtl',
                    }}
                  >
                    {/* Right: Squircle Avatar + Customer Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      {/* White Squircle Avatar Tile */}
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: isSelected ? '#FFFFFF' : '#FAF5EE',
                          border: isSelected ? '1.5px solid #D4ADA0' : '1px solid #EAE0D3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isSelected ? '0 2px 6px rgba(190, 150, 133, 0.20)' : 'none',
                        }}
                      >
                        <User size={16} color={isSelected ? '#8A5848' : '#64748B'} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span
                          className="font-nastaleeq"
                          style={{
                            fontWeight: 900,
                            fontSize: '15.5px',
                            color: isSelected ? '#4A2A20' : '#1F2937',
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
                            color: isSelected ? '#8A5848' : '#64748B',
                            fontWeight: 600,
                            direction: 'ltr',
                            textAlign: 'right',
                            marginTop: '2px',
                          }}
                        >
                          📞 {cust.phone}
                        </span>
                      </div>
                    </div>

                    {/* Left: Balance Figure & Last Activity */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, marginRight: '10px' }}>
                      <span
                        dir="ltr"
                        style={{
                          fontSize: '15.5px',
                          fontWeight: 900,
                          color: isSelected ? '#991B1B' : '#B91C1C',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        Rs {cust.balance.toLocaleString()}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 900,
                              color: '#8A5848',
                              fontFamily: 'var(--font-urdu)',
                            }}
                          >
                            ● منتخب
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '10px',
                            color: isSelected ? '#8A5848' : '#64748B',
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
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #EBE4DA',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Profile Header Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid #F3EDE4',
              paddingBottom: '12px',
              direction: 'rtl',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* White Squircle Avatar Tile */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#FAF5F2',
                  border: '1.5px solid #D4ADA0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(190, 150, 133, 0.20)',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} color="#8A5848" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h3
                  className="font-nastaleeq"
                  style={{ fontSize: '19px', fontWeight: 900, color: '#1F2937', margin: 0, lineHeight: 1.2 }}
                >
                  {selectedCustomer.name}
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 700, marginTop: '2px' }}>
                  📞 {selectedCustomer.phone}
                </span>
              </div>
            </div>

            {/* Current Balance Callout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>
                بقایا ادھار:
              </span>
              <span
                dir="ltr"
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: selectedCustomer.balance > 0 ? '#B91C1C' : '#047857',
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
              background:
                hoveredRepayBtn
                  ? 'linear-gradient(135deg, #DFBBB0 0%, #C9A292 50%, #B18978 100%)'
                  : 'linear-gradient(135deg, #D4ADA0 0%, #BE9685 50%, #A67E6D 100%)',
              color: '#FFFFFF',
              border: hoveredRepayBtn ? '2px solid #F4DFD7' : '1.5px solid #E8CDC2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px 0 18px',
              boxShadow:
                hoveredRepayBtn
                  ? '0 10px 24px rgba(190, 150, 133, 0.45), 0 2px 6px rgba(0, 0, 0, 0.08)'
                  : '0 4px 14px rgba(190, 150, 133, 0.30), 0 1px 3px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform:
                pressedRepayBtn
                  ? 'scale(0.975) translateY(1px)'
                  : hoveredRepayBtn
                  ? 'translateY(-2px)'
                  : 'none',
            }}
          >
            {/* Left: White Squircle Icon Tile */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.20)',
                flexShrink: 0,
                transition: 'transform 0.22s ease',
                transform: hoveredRepayBtn ? 'scale(1.08) rotate(-2deg)' : 'scale(1)',
              }}
            >
              <DollarSign size={18} color="#A67E6D" strokeWidth={2.5} />
            </div>

            {/* Right: Bold Nastaleeq Text */}
            <span
              className="font-nastaleeq"
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: '#FFFFFF',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
              }}
            >
              ادھار وصولی درج کریں
            </span>
          </button>

          {/* Chronological Append-Only Transactions Ledger */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', direction: 'rtl' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} color="#D97706" />
                <span className="font-nastaleeq" style={{ fontSize: '14.5px', fontWeight: 900, color: '#1F2937' }}>
                  کھاتہ ہسٹری
                </span>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748B',
                  backgroundColor: '#FAF5EE',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  border: '1px solid #EAE0D3',
                }}
              >
                {selectedCustomer.transactions.length} اندراج
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
                  کوئی ٹرانزیکشن موجود نہیں ہے۔
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
                      backgroundColor: '#FCFBF9',
                      border: '1px solid #EBE4DA',
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
                          border: tx.type === 'purchase' ? '1px solid #FECACA' : '1px solid #A7F3D0',
                          color: tx.type === 'purchase' ? '#DC2626' : '#047857',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {tx.type === 'purchase' ? <ArrowUpRight size={15} strokeWidth={2.4} /> : <ArrowDownLeft size={15} strokeWidth={2.4} />}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#1F2937' }}>
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
                          color: tx.type === 'purchase' ? '#DC2626' : '#047857',
                          fontFamily: 'var(--font-mono)',
                          direction: 'ltr',
                        }}
                      >
                        {tx.type === 'purchase' ? `+ Rs ${tx.amount.toLocaleString()}` : `- Rs ${tx.amount.toLocaleString()}`}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, marginTop: '1px' }}>
                        بقایا: Rs {tx.runningBalance.toLocaleString()}
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
                <h3 className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 900, color: '#1F2937', margin: 0 }}>
                  ادھار وصولی درج کریں
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
                direction: 'rtl',
              }}
            >
              <div>
                <span className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800, color: '#1F2937' }}>
                  {selectedCustomer.name}
                </span>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  📞 {selectedCustomer.phone}
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <span className="font-nastaleeq" style={{ fontSize: '10.5px', color: '#B91C1C', fontWeight: 800 }}>
                  کل بقایا
                </span>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#B91C1C', fontFamily: 'var(--font-mono)' }}>
                  Rs {selectedCustomer.balance.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Quick Repayment Amount Presets */}
            <div style={{ marginBottom: '12px' }}>
              <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '5px', textAlign: 'right' }}>
                تیز رفتار بٹنز:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
                {[
                  { label: '500', val: 500 },
                  { label: '1,000', val: 1000 },
                  { label: '2,000', val: 2000 },
                  { label: 'کل رقم', val: selectedCustomer.balance },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setRepaymentAmount(String(preset.val))}
                    className="touch-active"
                    style={{
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: repaymentAmount === String(preset.val) ? '#364E51' : '#FAF5EE',
                      color: repaymentAmount === String(preset.val) ? '#FFFFFF' : '#374151',
                      border: repaymentAmount === String(preset.val) ? '1.5px solid #5F8387' : '1px solid #E2D8CC',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <label className="font-nastaleeq" style={{ fontSize: '12.5px', fontWeight: 800, color: '#1F2937', display: 'block', marginBottom: '4px', textAlign: 'right' }}>
              وصول رقم (Rs):
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
                  padding: '0 40px 0 12px',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '10px',
                  fontSize: '12px',
                  fontWeight: 900,
                  color: '#4A2810',
                  backgroundColor: '#FAF3E8',
                  padding: '2px 6px',
                  borderRadius: '5px',
                }}
              >
                Rs
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
                background: 'linear-gradient(135deg, #D4ADA0 0%, #BE9685 50%, #A67E6D 100%)',
                color: '#FFFFFF',
                border: '1.5px solid #E8CDC2',
                fontSize: '14.5px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(190, 150, 133, 0.30)',
              }}
            >
              <Check size={16} strokeWidth={2.5} />
              <span className="font-nastaleeq">وصولی محفوظ کریں</span>
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
                <h3 className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 900, color: '#1F2937', margin: 0 }}>
                  نیا کھاتہ کھولیں
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
                <label className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937', display: 'block', marginBottom: '4px', textAlign: 'right' }}>
                  گاہک کا نام:
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: حاجی آصف"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="font-nastaleeq"
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
                    textAlign: 'right',
                  }}
                />
              </div>

              <div>
                <label className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937', display: 'block', marginBottom: '4px', textAlign: 'right' }}>
                  موبائل نمبر:
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
                background: 'linear-gradient(135deg, #4A676B 0%, #374F52 50%, #2A3F42 100%)',
                color: '#FFFFFF',
                border: '1.5px solid #5F8387',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(54, 79, 82, 0.25)',
              }}
            >
              <UserPlus size={15} color="#FFFFFF" />
              <span className="font-nastaleeq">کھاتہ بنائیں</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
