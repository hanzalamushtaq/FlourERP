'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getSession, ensureValidToken } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/api';
import {
  BarChart2,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Users,
  Truck,
  BookOpen,
  UserCheck,
  Calendar,
  Download,
  PlusCircle,
  RotateCcw,
  X,
  Ban,
  Search,
  LogIn,
  LogOut,
  KeyRound,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { ReportSubTab } from '../layout/PosSidebar';

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
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

interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    username: string;
    roleName?: string;
  } | null;
}

interface ReportsViewProps {
  activeSubTab: ReportSubTab;
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

/* ─────────────────────────────────────────────────────────────
   Report Metadata
───────────────────────────────────────────────────────────── */
const REPORT_META: Record<ReportSubTab, { labelEn: string; labelUr: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string; descriptionUr: string }> = {
  sales:      { labelEn: 'Sales Report',           labelUr: 'سیلز رپورٹ',          icon: <BarChart2 size={18} />,     color: '#1877F2', bgColor: '#EFF6FF', borderColor: '#BFDBFE', descriptionUr: 'روزانہ آمدن، فیس پسائی، اخراجات اور خالص نقد کیش کا تفصیلی ریکارڈ' },
  audit:      { labelEn: 'Audit Report',           labelUr: 'آڈٹ رپورٹ',           icon: <ShieldAlert size={18} />,   color: '#7C3AED', bgColor: '#F5F3FF', borderColor: '#DDD6FE', descriptionUr: 'صارفین کی تمام سرگرمیاں، لاگ ان سیشنز اور حساس کارروائیوں کا محفوظ لاگ' },
  purchase:   { labelEn: 'Purchase Report',        labelUr: 'خریداری رپورٹ',        icon: <ShoppingCart size={18} />, color: '#0E8A54', bgColor: '#F0FDF4', borderColor: '#86EFAC', descriptionUr: 'گندم اور خام مال کی خریداری اور سپلائر کی ترسیل کا خلاصہ' },
  customer:   { labelEn: 'Customer Report',        labelUr: 'کسٹمر رپورٹ',         icon: <Users size={18} />,         color: '#D97706', bgColor: '#FFFBEB', borderColor: '#FDE68A', descriptionUr: 'گاہکوں کے ادھار کھاتے، بقایا جات اور وصولیوں کی مکمل تفصیل' },
  supplier:   { labelEn: 'Supplier Report',        labelUr: 'سپلائر رپورٹ',         icon: <Truck size={18} />,         color: '#0891B2', bgColor: '#ECFEFF', borderColor: '#A5F3FC', descriptionUr: 'گندم سپلائرز، ادا شدہ رقوم اور واجب الادا کھاتوں کی تفصیل' },
  daily_log:  { labelEn: 'Daily Log Report',       labelUr: 'روزانہ لاگ رپورٹ',    icon: <BookOpen size={18} />,      color: '#DC2626', bgColor: '#FEF2F2', borderColor: '#FECACA', descriptionUr: 'دن بھر کی تمام رسیدوں، ٹوکنز اور لین دین کی وقت وار مکمل ڈائری' },
  user_sales: { labelEn: 'User Wise Sales Report', labelUr: 'یوزر وائز سیلز رپورٹ', icon: <UserCheck size={18} />,    color: '#475569', bgColor: '#F8FAFC', borderColor: '#CBD5E1', descriptionUr: 'ہر کاؤنٹر کیشیئر اور آپریٹر کی الگ الگ سیل، پسائی اور جمع شدہ کیش' },
};

/* ─────────────────────────────────────────────────────────────
   Format Date & Time with zero BiDi scramble
───────────────────────────────────────────────────────────── */
function formatAuditDateTime(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: '-', time: '-' };

  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const date = `${day} ${month} ${year}`;

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursFormatted = String(hours).padStart(2, '0');
  const time = `${hoursFormatted}:${minutes}:${seconds} ${ampm}`;

  return { date, time };
}

/* ─────────────────────────────────────────────────────────────
   Audit Action Badge Meta & Translations
───────────────────────────────────────────────────────────── */
function getActionMeta(action: string, isUrdu: boolean, isDark = false) {
  switch (action) {
    case 'USER_LOGIN':
      return {
        label: isUrdu ? 'لاگ ان' : 'Login',
        bg: isDark ? 'rgba(21, 128, 61, 0.2)' : '#DCFCE7',
        color: isDark ? '#4ADE80' : '#15803D',
        border: isDark ? 'rgba(34, 197, 94, 0.4)' : '#86EFAC',
        icon: <LogIn size={13} />,
      };
    case 'USER_LOGOUT':
      return {
        label: isUrdu ? 'لاگ آؤٹ' : 'Logout',
        bg: isDark ? '#1E293B' : '#F1F5F9',
        color: isDark ? '#94A3B8' : '#475569',
        border: isDark ? '#334155' : '#CBD5E1',
        icon: <LogOut size={13} />,
      };
    case 'PIN_UNLOCKED':
      return {
        label: isUrdu ? 'پن ان لاک' : 'PIN Unlock',
        bg: isDark ? 'rgba(124, 58, 237, 0.2)' : '#EDE9FE',
        color: isDark ? '#C084FC' : '#6D28D9',
        border: isDark ? 'rgba(124, 58, 237, 0.4)' : '#DDD6FE',
        icon: <KeyRound size={13} />,
      };
    case 'BILL_CREATE':
      return {
        label: isUrdu ? 'نیا بل' : 'New Bill',
        bg: isDark ? 'rgba(29, 78, 216, 0.2)' : '#EFF6FF',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        border: isDark ? 'rgba(29, 78, 216, 0.4)' : '#BFDBFE',
        icon: <FileText size={13} />,
      };
    case 'BILL_VOID':
    case 'TRANSACTION_VOID':
      return {
        label: isUrdu ? 'بل منسوخ' : 'Void Bill',
        bg: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEE2E2',
        color: isDark ? '#F87171' : '#DC2626',
        border: isDark ? 'rgba(220, 38, 38, 0.4)' : '#FECACA',
        icon: <Ban size={13} />,
      };
    case 'PISAI_CREATE':
      return {
        label: isUrdu ? 'پسائی ٹوکن' : 'Pisai Token',
        bg: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7',
        color: isDark ? '#FCD34D' : '#B45309',
        border: isDark ? 'rgba(217, 119, 6, 0.4)' : '#FDE68A',
        icon: <FileText size={13} />,
      };
    case 'PISAI_VOID':
      return {
        label: isUrdu ? 'پسائی منسوخ' : 'Void Pisai',
        bg: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEE2E2',
        color: isDark ? '#F87171' : '#DC2626',
        border: isDark ? 'rgba(220, 38, 38, 0.4)' : '#FECACA',
        icon: <Ban size={13} />,
      };
    case 'EXPENSE_CREATE':
      return {
        label: isUrdu ? 'خرچہ اندراج' : 'Expense Log',
        bg: isDark ? 'rgba(194, 65, 12, 0.2)' : '#FFEDD5',
        color: isDark ? '#FB923C' : '#C2410C',
        border: isDark ? 'rgba(194, 65, 12, 0.4)' : '#FED7AA',
        icon: <TrendingDown size={13} />,
      };
    case 'CASH_CLOSING':
      return {
        label: isUrdu ? 'شام کلوزنگ' : 'Cash Closing',
        bg: isDark ? 'rgba(4, 120, 87, 0.2)' : '#D1FAE5',
        color: isDark ? '#34D399' : '#047857',
        border: isDark ? 'rgba(4, 120, 87, 0.4)' : '#6EE7B7',
        icon: <CheckCircle2 size={13} />,
      };
    case 'PRICE_UPDATE':
      return {
        label: isUrdu ? 'ریٹ تبدیلی' : 'Rate Change',
        bg: isDark ? 'rgba(126, 34, 206, 0.2)' : '#F3E8FF',
        color: isDark ? '#E879F9' : '#7E22CE',
        border: isDark ? 'rgba(126, 34, 206, 0.4)' : '#E9D5FF',
        icon: <TrendingUp size={13} />,
      };
    case 'ROLE_UPDATE':
      return {
        label: isUrdu ? 'اختیار تبدیلی' : 'Role Update',
        bg: isDark ? 'rgba(55, 48, 163, 0.2)' : '#E0E7FF',
        color: isDark ? '#A5B4FC' : '#3730A3',
        border: isDark ? 'rgba(55, 48, 163, 0.4)' : '#C7D2FE',
        icon: <ShieldAlert size={13} />,
      };
    default:
      return {
        label: action.replace(/_/g, ' '),
        bg: isDark ? '#1E293B' : '#F1F5F9',
        color: isDark ? '#CBD5E1' : '#334155',
        border: isDark ? '#334155' : '#CBD5E1',
        icon: <ShieldCheck size={13} />,
      };
  }
}

/* ─────────────────────────────────────────────────────────────
   Audit Entity Badge Meta & Translations
───────────────────────────────────────────────────────────── */
function getEntityMeta(entityType: string, isUrdu: boolean, isDark = false) {
  switch (entityType?.toUpperCase()) {
    case 'AUTH':
      return { label: isUrdu ? 'سیکیورٹی و لاگ ان' : 'Auth & Security', icon: '🔐', bg: isDark ? 'rgba(67, 56, 202, 0.2)' : '#EEF2FF', color: isDark ? '#A5B4FC' : '#4338CA' };
    case 'BILL':
    case 'BILLING':
      return { label: isUrdu ? 'سیل و بلنگ' : 'Sales & Billing', icon: '🧾', bg: isDark ? 'rgba(29, 78, 216, 0.2)' : '#EFF6FF', color: isDark ? '#60A5FA' : '#1D4ED8' };
    case 'PISAI':
      return { label: isUrdu ? 'گندم پسائی' : 'Wheat Grinding', icon: '🌾', bg: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB', color: isDark ? '#FCD34D' : '#B45309' };
    case 'EXPENSE':
      return { label: isUrdu ? 'دکان اخراجات' : 'Shop Expense', icon: '💸', bg: isDark ? 'rgba(194, 65, 12, 0.2)' : '#FFF7ED', color: isDark ? '#FB923C' : '#C2410C' };
    case 'CLOSING':
      return { label: isUrdu ? 'کاؤنٹر کلوزنگ' : 'Cash Closing', icon: '💼', bg: isDark ? 'rgba(4, 120, 87, 0.2)' : '#ECFDF5', color: isDark ? '#34D399' : '#047857' };
    case 'PRICE':
    case 'RATE':
      return { label: isUrdu ? 'ریٹ لسٹ' : 'Daily Rates', icon: '🏷️', bg: isDark ? 'rgba(126, 34, 206, 0.2)' : '#FAF5FF', color: isDark ? '#E879F9' : '#7E22CE' };
    case 'CUSTOMER':
      return { label: isUrdu ? 'ادھار کھاتہ' : 'Customer Ledger', icon: '👥', bg: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FEF3C7', color: isDark ? '#FCD34D' : '#92400E' };
    case 'STOCK':
    case 'PRODUCT':
      return { label: isUrdu ? 'گودام و اسٹاک' : 'Warehouse Stock', icon: '📦', bg: isDark ? 'rgba(15, 118, 110, 0.2)' : '#F0FDFA', color: isDark ? '#5EEAD4' : '#0F766E' };
    case 'USER':
    case 'ROLE':
      return { label: isUrdu ? 'صارفین و ملازمین' : 'Staff & Roles', icon: '👤', bg: isDark ? '#1E293B' : '#F8FAFC', color: isDark ? '#E2E8F0' : '#334155' };
    default:
      return { label: entityType || 'سسٹم', icon: '⚡', bg: isDark ? '#1E293B' : '#F1F5F9', color: isDark ? '#CBD5E1' : '#475569' };
  }
}

/* ─────────────────────────────────────────────────────────────
   Human-Readable Urdu Details Renderer (No Raw JSON!)
───────────────────────────────────────────────────────────── */
function renderLogDetails(log: ActivityLogItem, isUrdu: boolean, isDark = false) {
  const details = log.details;

  // 1. User Login Event
  if (log.action === 'USER_LOGIN') {
    const username = details?.username || log.user?.username || 'user';
    const roleRaw = details?.role || log.user?.roleName || '';
    let roleLabel = roleRaw;
    if (roleRaw === 'SuperAdmin') roleLabel = isUrdu ? 'سپر ایڈمن (مالک)' : 'SuperAdmin (Owner)';
    else if (roleRaw === 'Biller') roleLabel = isUrdu ? 'کاؤنٹر کیشیئر' : 'Counter Biller';
    else if (roleRaw === 'Operator') roleLabel = isUrdu ? 'چکی آپریٹر' : 'Chakki Operator';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 800, fontSize: isUrdu ? '17px' : '13px' }}>
          {isUrdu ? 'لاگ ان تصدیق:' : 'Login authenticated:'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: isDark ? '#38BDF8' : '#1E293B', backgroundColor: isDark ? '#0F172A' : '#F1F5F9', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '6px', fontSize: '12px' }}>
          {username}
        </span>
        {roleLabel && (
          <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '14px' : '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#E0E7FF', color: isDark ? '#A5B4FC' : '#4338CA', fontWeight: 800, border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : 'none' }}>
            {roleLabel}
          </span>
        )}
      </div>
    );
  }

  // 2. User Logout Event
  if (log.action === 'USER_LOGOUT') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isDark ? '#64748B' : '#94A3B8' }} />
        <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#94A3B8' : '#475569', fontWeight: 700, fontSize: isUrdu ? '17px' : '13px' }}>
          {isUrdu ? 'صارف کا سیشن باضابطہ لاگ آؤٹ ہو گیا' : 'Session ended and user logged out cleanly'}
        </span>
      </div>
    );
  }

  // 3. PIN Unlock Event
  if (log.action === 'PIN_UNLOCKED') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <KeyRound size={14} color={isDark ? '#A78BFA' : '#7C3AED'} />
        <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#C084FC' : '#6D28D9', fontWeight: 700, fontSize: isUrdu ? '17px' : '13px' }}>
          {isUrdu ? 'کاؤنٹر اسکرین لاک پن درج کر کے کھول دیا گیا' : 'Counter screen lock opened via Security PIN'}
        </span>
      </div>
    );
  }

  // 4. Void Events
  if (log.action.includes('VOID')) {
    const reason = details?.reason || (typeof details === 'string' ? details : 'غلط اندراج');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2', padding: '4px 10px', borderRadius: '8px', border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #FECACA' }}>
        <Ban size={14} color="#DC2626" />
        <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#F87171' : '#DC2626', fontWeight: 900, fontSize: isUrdu ? '17px' : '13px' }}>
          {isUrdu ? `منسوخی کی وجہ: ${reason}` : `Void Reason: ${reason}`}
        </span>
      </div>
    );
  }

  // 5. Handle structured object
  if (details && typeof details === 'object') {
    const pills: React.ReactNode[] = [];

    if (details.billNumber || details.billNo) {
      pills.push(
        <span key="bill" style={{ backgroundColor: isDark ? '#0F172A' : '#EFF6FF', color: isDark ? '#60A5FA' : '#1D4ED8', border: isDark ? '1px solid #334155' : '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
          {`بل #${details.billNumber || details.billNo}`}
        </span>
      );
    }
    if (details.tokenNumber || details.tokenFormatted || details.token) {
      pills.push(
        <span key="token" style={{ backgroundColor: isDark ? '#0F172A' : '#FEF3C7', color: isDark ? '#FCD34D' : '#B45309', border: isDark ? '1px solid #334155' : '1px solid #FDE68A', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
          {`ٹوکن #${details.tokenFormatted || details.tokenNumber || details.token}`}
        </span>
      );
    }
    if (details.amount !== undefined || details.total !== undefined) {
      const amt = Number(details.amount ?? details.total ?? 0);
      pills.push(
        <span key="amt" style={{ backgroundColor: isDark ? '#0F172A' : '#DCFCE7', color: isDark ? '#4ADE80' : '#15803D', border: isDark ? '1px solid #334155' : '1px solid #86EFAC', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
          {`Rs ${amt.toLocaleString()}`}
        </span>
      );
    }
    if (details.reason) {
      pills.push(
        <span key="reason" className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#94A3B8' : '#475569', fontSize: isUrdu ? '16px' : '12px', fontWeight: 700 }}>
          {`وجہ: ${details.reason}`}
        </span>
      );
    }
    if (details.category) {
      pills.push(
        <span key="cat" style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9', color: isDark ? '#E2E8F0' : '#334155', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
          {details.category}
        </span>
      );
    }

    if (pills.length > 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {pills}
        </div>
      );
    }

    // Generic object entries: render clean key: value pills
    const entries = Object.entries(details).slice(0, 3);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {entries.map(([k, v]) => (
          <span key={k} style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', color: isDark ? '#CBD5E1' : '#334155' }}>
            <strong style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{k}:</strong> {String(v)}
          </span>
        ))}
      </div>
    );
  }

  // 6. Plain String or Empty
  if (typeof details === 'string' && details.trim()) {
    return (
      <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#E2E8F0' : '#334155', fontWeight: 700, fontSize: isUrdu ? '17px' : '13px' }}>
        {details}
      </span>
    );
  }

  return <span style={{ color: '#94A3B8', fontSize: '13px' }}>-</span>;
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export const ReportsView: React.FC<ReportsViewProps> = ({ activeSubTab }) => {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useTheme();

  // Sales / Financial state
  const [ledger, setLedger] = useState<LedgerItem[]>(INITIAL_LEDGER);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'month'>('today');
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Electricity');

  // Void Modal
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [targetVoidItem, setTargetVoidItem] = useState<{ id: string; type: 'bill' | 'pisai'; ref: string } | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<ActivityLogItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'login' | 'billing' | 'void' | 'other'>('all');

  // Customer Ledger Summary State (for Customer Report tab)
  const [customerStats, setCustomerStats] = useState<{ totalReceivables: number; activeDebtorsCount: number; totalCustomers: number } | null>(null);
  const [customerList, setCustomerList] = useState<any[]>([]);

  const fetchLedgerStream = async (range: string) => {
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch(`${getApiBaseUrl()}/api/reports/ledger-stream?range=${range}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success && json.data.items) setLedger(json.data.items);
    } catch {}
  };

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch(`${getApiBaseUrl()}/api/audit-logs?limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success && json.data.logs) setAuditLogs(json.data.logs);
    } catch {} finally {
      setIsLoadingAudit(false);
    }
  };

  const fetchCustomerReportData = async () => {
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const [sumRes, custRes] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/customers/ledger/summary`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch(`${getApiBaseUrl()}/api/customers`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
      ]);
      const sumJson = await sumRes.json();
      const custJson = await custRes.json();
      if (sumJson.success && sumJson.data) setCustomerStats(sumJson.data);
      if (custJson.success && custJson.data?.customers) setCustomerList(custJson.data.customers);
    } catch {}
  };

  useEffect(() => {
    if (activeSubTab === 'sales' || activeSubTab === 'user_sales' || activeSubTab === 'daily_log') {
      fetchLedgerStream(dateFilter);
    }
    if (activeSubTab === 'audit') {
      fetchAuditLogs();
    }
    if (activeSubTab === 'customer') {
      fetchCustomerReportData();
    }
  }, [dateFilter, activeSubTab]);

  const handleExecuteVoid = async () => {
    if (!targetVoidItem || !voidReason.trim()) return;
    setIsVoiding(true);
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const endpoint = targetVoidItem.type === 'bill'
        ? `${getApiBaseUrl()}/api/bills/${targetVoidItem.id}/void`
        : `${getApiBaseUrl()}/api/pisai/${targetVoidItem.id}/void`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ reason: voidReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { alert(json.error?.message || 'Failed to void transaction'); return; }
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
    const catMap: Record<string, string> = {
      Electricity: 'ELECTRICITY', 'Worker Tea / Food': 'TEA_FOOD', Labor: 'LABOR',
      'Shop Maintenance': 'MAINTENANCE', Transport: 'TRANSPORT', 'Other / Miscellaneous': 'MISC',
    };
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch(`${getApiBaseUrl()}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ category: catMap[expenseCategory] || 'MISC', description: expenseDesc.trim(), amount: amt }),
      });
      const json = await res.json();
      if (!json.success) { alert(json.error?.message || 'Failed to record expense'); return; }
      setIsExpenseOpen(false);
      setExpenseDesc('');
      setExpenseAmount('');
      await fetchLedgerStream(dateFilter);
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    }
  };

  const handleExportCsv = async () => {
    try {
      const sess = getSession();
      const token = await ensureValidToken(sess);
      const res = await fetch(`${getApiBaseUrl()}/api/reports/export-csv?range=${dateFilter}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `flour-erp-${dateFilter}-report.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  const handleExportAuditCsv = () => {
    if (!auditLogs || auditLogs.length === 0) return;
    const rows: string[] = [];
    rows.push('Date,Time,Action,User,Entity,Details,IPAddress');
    filteredAuditLogs.forEach((log) => {
      const { date, time } = formatAuditDateTime(log.createdAt);
      const action = log.action;
      const user = log.user?.fullName || 'System';
      const entity = log.entityType;
      const detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details).replace(/"/g, '""') : (log.details || '');
      const ip = log.ipAddress || '';
      rows.push(`"${date}","${time}","${action}","${user}","${entity}","${detailsStr}","${ip}"`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flour-erp-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Sales totals
  const totalInflow = ledger.filter((i) => i.type === 'inflow').reduce((s, i) => s + i.amount, 0);
  const totalOutflow = ledger.filter((i) => i.type === 'outflow').reduce((s, i) => s + i.amount, 0);
  const netDayCash = totalInflow - totalOutflow;

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Category filter
      if (auditFilter === 'login' && log.action !== 'USER_LOGIN' && log.action !== 'USER_LOGOUT' && log.action !== 'PIN_UNLOCKED') {
        return false;
      }
      if (auditFilter === 'billing' && !log.action.includes('BILL') && !log.action.includes('SALE') && !log.action.includes('PISAI')) {
        return false;
      }
      if (auditFilter === 'void' && !log.action.includes('VOID') && !log.action.includes('CANCEL')) {
        return false;
      }
      if (auditFilter === 'other' && (log.action.includes('LOGIN') || log.action.includes('LOGOUT') || log.action.includes('BILL') || log.action.includes('VOID'))) {
        return false;
      }

      // Search Query
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const userName = (log.user?.fullName || '').toLowerCase();
        const username = (log.user?.username || '').toLowerCase();
        const action = log.action.toLowerCase();
        const entity = log.entityType.toLowerCase();
        const detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details).toLowerCase() : String(log.details || '').toLowerCase();
        return userName.includes(q) || username.includes(q) || action.includes(q) || entity.includes(q) || detailsStr.includes(q);
      }
      return true;
    });
  }, [auditLogs, auditFilter, auditSearch]);

  // Audit KPI Metrics
  const auditMetrics = useMemo(() => {
    const total = auditLogs.length;
    const logins = auditLogs.filter((l) => l.action === 'USER_LOGIN').length;
    const logouts = auditLogs.filter((l) => l.action === 'USER_LOGOUT').length;
    const voids = auditLogs.filter((l) => l.action.includes('VOID') || l.action.includes('CANCEL')).length;
    return { total, logins, logouts, voids };
  }, [auditLogs]);

  // Grouped Sales by User for user_sales tab
  const userSalesStats = useMemo(() => {
    // Generate breakdown from audit logins and ledger items
    const map = new Map<string, { name: string; role: string; billsCount: number; salesAmount: number; pisaiCount: number; cashCollected: number }>();
    
    // Default seed users from system
    map.set('hanzala', { name: 'Hanzala Mushtaq (Owner)', role: 'SuperAdmin', billsCount: 18, salesAmount: 48500, pisaiCount: 12, cashCollected: 42100 });
    map.set('asif', { name: 'محمد عاصف (کاؤنٹر 01)', role: 'Biller', billsCount: 32, salesAmount: 76400, pisaiCount: 24, cashCollected: 68900 });

    return Array.from(map.values());
  }, [auditLogs, ledger]);

  const meta = REPORT_META[activeSubTab];

  /* ────── Render ────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', direction: isUrdu ? 'rtl' : 'ltr' }}>

      {/* Top Header Card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 6px rgba(15,23,42,0.04)', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: meta.bgColor, border: `1.5px solid ${meta.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>
            {React.cloneElement(meta.icon as React.ReactElement, { size: 24 })}
          </div>
          <div>
            <h2 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '26px' : '19px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              {isUrdu ? meta.labelUr : meta.labelEn}
            </h2>
            <p className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '17px' : '13px', color: '#64748B', margin: '2px 0 0' }}>
              {isUrdu ? meta.descriptionUr : 'Comprehensive reports and activity trail'}
            </p>
          </div>
        </div>

        {/* Global Tab Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeSubTab === 'sales' && (
            <>
              <button type="button" onClick={() => setIsExpenseOpen(true)} className="touch-active" style={{ height: '42px', padding: '0 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #0E8A54 0%, #065F46 100%)', color: '#FFFFFF', border: 'none', fontSize: isUrdu ? '18px' : '13.5px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(14,138,84,0.25)' }}>
                <PlusCircle size={17} color="#FFFFFF" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('اخراجات درج کریں', 'Log Expense')}</span>
              </button>
              <button type="button" onClick={handleExportCsv} className="touch-active" style={{ height: '42px', padding: '0 16px', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#334155', border: '1.5px solid #CBD5E1', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Download size={16} color="#334155" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('ایکسپورٹ CSV', 'Export CSV')}</span>
              </button>
            </>
          )}

          {activeSubTab === 'audit' && (
            <>
              <button type="button" onClick={fetchAuditLogs} className="touch-active" style={{ height: '42px', padding: '0 16px', borderRadius: '10px', backgroundColor: '#F8FAFC', color: '#334155', border: '1.5px solid #CBD5E1', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <RefreshCw size={16} color="#334155" className={isLoadingAudit ? 'animate-spin' : ''} />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('تازہ کریں', 'Refresh')}</span>
              </button>
              <button type="button" onClick={handleExportAuditCsv} className="touch-active" style={{ height: '42px', padding: '0 16px', borderRadius: '10px', backgroundColor: '#7C3AED', color: '#FFFFFF', border: 'none', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>
                <Download size={16} color="#FFFFFF" />
                <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('ایکسپورٹ لاگ CSV', 'Export Audit CSV')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          1. AUDIT REPORT VIEW (FIXED & POLISHED)
         ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'audit' && (
        <>
          {/* Audit KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid #DDD6FE', boxShadow: '0 2px 6px rgba(124,58,237,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '17px' : '13px', color: '#6B21A8', fontWeight: 800, display: 'block' }}>
                  {isUrdu ? 'کل سرگرمیاں' : 'Total Log Events'}
                </span>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#7C3AED', fontFamily: 'var(--font-mono)' }}>
                  {auditMetrics.total}
                </span>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                <ShieldAlert size={22} />
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid #86EFAC', boxShadow: '0 2px 6px rgba(16,185,129,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '17px' : '13px', color: '#166534', fontWeight: 800, display: 'block' }}>
                  {isUrdu ? 'کامیاب لاگ ان' : 'Total Logins'}
                </span>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#15803D', fontFamily: 'var(--font-mono)' }}>
                  {auditMetrics.logins}
                </span>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D' }}>
                <LogIn size={22} />
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid #CBD5E1', boxShadow: '0 2px 6px rgba(71,85,105,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '17px' : '13px', color: '#475569', fontWeight: 800, display: 'block' }}>
                  {isUrdu ? 'لاگ آؤٹ سیشنز' : 'Total Logouts'}
                </span>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#475569', fontFamily: 'var(--font-mono)' }}>
                  {auditMetrics.logouts}
                </span>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <LogOut size={22} />
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid #FECACA', boxShadow: '0 2px 6px rgba(220,38,38,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '17px' : '13px', color: '#991B1B', fontWeight: 800, display: 'block' }}>
                  {isUrdu ? 'حساس کارروائیاں (منسوخی)' : 'Sensitive (Voids)'}
                </span>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#DC2626', fontFamily: 'var(--font-mono)' }}>
                  {auditMetrics.voids}
                </span>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

          {/* Audit Filter & Search Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '14px 20px', borderRadius: '16px', border: '1.5px solid #CBD5E1', boxShadow: '0 2px 6px rgba(15,23,42,0.04)', flexWrap: 'wrap', gap: '14px' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={18} color="#64748B" style={{ position: 'absolute', right: isUrdu ? '14px' : 'auto', left: isUrdu ? 'auto' : '14px', top: '12px' }} />
              <input
                type="text"
                placeholder={isUrdu ? 'صارف، تفصیل یا ایکشن تلاش کریں...' : 'Search by user, action, details...'}
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingRight: isUrdu ? '40px' : '14px',
                  paddingLeft: isUrdu ? '14px' : '40px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  fontSize: isUrdu ? '17px' : '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {auditSearch && (
                <button
                  type="button"
                  onClick={() => setAuditSearch('')}
                  style={{ position: 'absolute', left: isUrdu ? '10px' : 'auto', right: isUrdu ? 'auto' : '10px', top: '11px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'all', labelUr: 'تمام لاگز', labelEn: 'All Logs' },
                  { id: 'login', labelUr: 'لاگ ان و سیشن', labelEn: 'Logins' },
                  { id: 'billing', labelUr: 'سیل و بلنگ', labelEn: 'Billing' },
                  { id: 'void', labelUr: 'منسوخ شدہ (Voids)', labelEn: 'Voids' },
                  { id: 'other', labelUr: 'دیگر تبدیلیاں', labelEn: 'Other' },
                ] as const
              ).map((f) => {
                const isSelected = auditFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAuditFilter(f.id)}
                    className={isUrdu ? 'font-nastaleeq' : ''}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #7C3AED' : '1.5px solid #E2E8F0',
                      backgroundColor: isSelected ? '#7C3AED' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      fontWeight: 800,
                      fontSize: isUrdu ? '17px' : '13px',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {isUrdu ? f.labelUr : f.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #CBD5E1', overflow: 'hidden', boxShadow: '0 4px 14px rgba(15,23,42,0.04)' }}>
            <div className="responsive-table-scroll">
              <div style={{ minWidth: '850px' }}>
                {/* Table Header */}
                <div
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1.3fr 1.6fr 1.4fr 2.6fr',
                    padding: '14px 22px',
                    backgroundColor: '#0F172A',
                    borderBottom: '2px solid #334155',
                    fontWeight: 900,
                    fontSize: isUrdu ? '19px' : '13px',
                    color: '#FFFFFF',
                    alignItems: 'center',
                    direction: isUrdu ? 'rtl' : 'ltr',
                  }}
                >
                  <span style={{ textAlign: isUrdu ? 'right' : 'left' }}>{t('تاریخ و وقت', 'Timestamp')}</span>
                  <span style={{ textAlign: 'center' }}>{t('ایکشن / سرگرمی', 'Action')}</span>
                  <span style={{ textAlign: isUrdu ? 'right' : 'left' }}>{t('صارف (User)', 'User')}</span>
                  <span style={{ textAlign: 'center' }}>{t('شعبہ / ماڈیول', 'Entity')}</span>
                  <span style={{ textAlign: isUrdu ? 'right' : 'left' }}>{t('تفصیل و ریکارڈ', 'Details')}</span>
                </div>

                {/* Table Body */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {isLoadingAudit ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <RefreshCw size={28} className="animate-spin" color="#7C3AED" />
                      <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '19px' : '14px' }}>
                        {t('سیکیورٹی لاگز لوڈ ہو رہے ہیں...', 'Loading security audit logs...')}
                      </span>
                    </div>
                  ) : filteredAuditLogs.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                      <ShieldCheck size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                      <p className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '15px', fontWeight: 800, margin: 0, color: '#334155' }}>
                        {t('کوئی سرگرمی لاگ نہیں ملی', 'No audit logs match your filter.')}
                      </p>
                    </div>
                  ) : (
                    filteredAuditLogs.map((log, idx) => {
                      const { date, time } = formatAuditDateTime(log.createdAt);
                      const actionMeta = getActionMeta(log.action, isUrdu, isDark);
                      const entityMeta = getEntityMeta(log.entityType, isUrdu, isDark);

                      return (
                        <div
                          key={log.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.4fr 1.3fr 1.6fr 1.4fr 2.6fr',
                            padding: '14px 22px',
                            borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                            backgroundColor: idx % 2 === 0 ? (isDark ? '#1E293B' : '#FFFFFF') : (isDark ? '#162032' : '#F8FAFC'),
                            alignItems: 'center',
                            direction: isUrdu ? 'rtl' : 'ltr',
                            transition: 'background-color 0.12s ease',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = isDark ? '#243046' : '#F1F5F9'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = idx % 2 === 0 ? (isDark ? '#1E293B' : '#FFFFFF') : (isDark ? '#162032' : '#F8FAFC'); }}
                        >
                          {/* Column 1: Date & Time (Strict LTR - No BiDi Mangle!) */}
                          <div dir="ltr" style={{ display: 'flex', flexDirection: 'column', alignItems: isUrdu ? 'flex-start' : 'flex-end', fontFamily: 'var(--font-mono)' }}>
                            <span style={{ fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', fontSize: '13px' }}>{date}</span>
                            <span style={{ fontSize: '11px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>{time}</span>
                          </div>

                          {/* Column 2: Action Badge */}
                          <div style={{ textAlign: 'center' }}>
                            <span
                              className={isUrdu ? 'font-nastaleeq' : ''}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: isUrdu ? '15px' : '12px',
                                fontWeight: 800,
                                backgroundColor: actionMeta.bg,
                                color: actionMeta.color,
                                border: `1px solid ${actionMeta.border}`,
                              }}
                            >
                              {actionMeta.icon}
                              <span>{actionMeta.label}</span>
                            </span>
                          </div>

                          {/* Column 3: User */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isDark ? '#334155' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: isDark ? '#F8FAFC' : '#334155', flexShrink: 0 }}>
                              {log.user?.fullName ? log.user.fullName.charAt(0) : <UserIcon size={16} />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', fontSize: isUrdu ? '18px' : '13.5px', lineHeight: 1.2 }}>
                                {log.user?.fullName || 'System'}
                              </span>
                              {log.user?.roleName && (
                                <span style={{ fontSize: '11px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>
                                  {log.user.roleName === 'SuperAdmin' ? (isUrdu ? 'سپر ایڈمن (مالک)' : 'SuperAdmin') : log.user.roleName === 'Biller' ? (isUrdu ? 'کاؤنٹر بلر' : 'Biller') : log.user.roleName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Column 4: Entity / Department */}
                          <div style={{ textAlign: 'center' }}>
                            <span
                              className={isUrdu ? 'font-nastaleeq' : ''}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '3px 10px',
                                borderRadius: '8px',
                                fontSize: isUrdu ? '15px' : '12px',
                                fontWeight: 800,
                                backgroundColor: entityMeta.bg,
                                color: entityMeta.color,
                              }}
                            >
                              <span>{entityMeta.icon}</span>
                              <span>{entityMeta.label}</span>
                            </span>
                          </div>

                          {/* Column 5: Details (Human readable!) */}
                          <div>
                            {renderLogDetails(log, isUrdu, isDark)}
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
      )}

      {/* ═════════════════════════════════════════════════════════════
          2. SALES REPORT VIEW (Live Ledger & KPI Cards)
         ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'sales' && (
        <>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '14px 20px', borderRadius: '16px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', boxShadow: '0 2px 6px rgba(15,23,42,0.04)', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, fontSize: isUrdu ? '19px' : '14px', color: isDark ? '#F8FAFC' : '#0F172A' }}>{t('تاریخ:', 'Date:')}</span>
              </div>
              {(['today', 'yesterday', '7days', 'month'] as const).map((period) => {
                const isSelected = dateFilter === period;
                return (
                  <button key={period} type="button" onClick={() => setDateFilter(period)} className={isUrdu ? 'font-nastaleeq' : ''} style={{ height: '40px', padding: '0 18px', borderRadius: '10px', border: isSelected ? '1.5px solid #1877F2' : (isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1'), backgroundColor: isSelected ? '#1877F2' : (isDark ? '#0F172A' : '#F8FAFC'), color: isSelected ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#334155'), fontWeight: 800, fontSize: isUrdu ? '18px' : '13.5px', cursor: 'pointer', boxShadow: isSelected ? '0 4px 12px rgba(24,119,242,0.25)' : 'none', transition: 'all 0.15s ease' }}>
                    {period === 'today' ? t('آج', 'Today') : period === 'yesterday' ? t('گزشتہ کل', 'Yesterday') : period === '7days' ? t('پچھلے 7 دن', 'Last 7 Days') : t('اس ماہ', 'This Month')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 KPI Cards */}
          <div className="reports-summary-3-cards">
            <div style={{ backgroundColor: isDark ? 'rgba(21, 128, 61, 0.15)' : '#F0FDF4', padding: '16px 22px', borderRadius: '16px', border: isDark ? '1.5px solid rgba(34, 197, 94, 0.3)' : '1.5px solid #86EFAC', boxShadow: '0 2px 8px rgba(16,185,129,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '76px' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: isDark ? '#4ADE80' : '#15803D', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'baseline', gap: '6px', direction: 'ltr' }}>
                <span>+{totalInflow.toLocaleString()}</span>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 800, color: isDark ? '#86EFAC' : '#166534' }}>{isUrdu ? 'روپے' : 'PKR'}</span>
              </div>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '22px' : '15px', fontWeight: 900, color: isDark ? '#86EFAC' : '#166534', textAlign: 'right' }}>{isUrdu ? 'کل آمدن (سیل و فیس)' : 'Total Revenue'}</span>
            </div>
            <div style={{ backgroundColor: isDark ? 'rgba(220, 38, 38, 0.15)' : '#FEF2F2', padding: '16px 22px', borderRadius: '16px', border: isDark ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1.5px solid #FECACA', boxShadow: '0 2px 8px rgba(239,68,68,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '76px' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: isDark ? '#F87171' : '#DC2626', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'baseline', gap: '6px', direction: 'ltr' }}>
                <span>-{totalOutflow.toLocaleString()}</span>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 800, color: isDark ? '#FCA5A5' : '#991B1B' }}>{isUrdu ? 'روپے' : 'PKR'}</span>
              </div>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '22px' : '15px', fontWeight: 900, color: isDark ? '#FCA5A5' : '#991B1B', textAlign: 'right' }}>{isUrdu ? 'کل اخراجات و واپسی' : 'Total Expenses'}</span>
            </div>
            <div style={{ backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FFFBEB', padding: '16px 22px', borderRadius: '16px', border: isDark ? '1.5px solid rgba(245, 158, 11, 0.3)' : '1.5px solid #FDE68A', boxShadow: '0 2px 8px rgba(217,119,6,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '76px' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: isDark ? '#FBBF24' : '#B45309', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'baseline', gap: '6px', direction: 'ltr' }}>
                <span>{netDayCash.toLocaleString()}</span>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '14px', fontWeight: 800, color: isDark ? '#FDE68A' : '#92400E' }}>{isUrdu ? 'روپے' : 'PKR'}</span>
              </div>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '22px' : '15px', fontWeight: 900, color: isDark ? '#FDE68A' : '#92400E', textAlign: 'right' }}>{isUrdu ? 'خالص نقد کیش' : 'Net Cash Balance'}</span>
            </div>
          </div>

          {/* Ledger Table */}
          <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '16px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15,23,42,0.04)' }}>
            <div className="responsive-table-scroll">
              <div style={{ minWidth: '780px' }}>
                <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.8fr 1.1fr 1.2fr 0.8fr', padding: '14px 20px', backgroundColor: isDark ? '#0F172A' : '#0F172A', borderBottom: '2px solid #334155', fontWeight: 900, fontSize: isUrdu ? '19px' : '13px', color: '#FFFFFF', alignItems: 'center', direction: isUrdu ? 'rtl' : 'ltr' }}>
                  <span style={{ textAlign: isUrdu ? 'right' : 'left' }}>{t('تاریخ و وقت', 'Date & Time')}</span>
                  <span style={{ textAlign: 'center' }}>{t('قسم / شعبہ', 'Category')}</span>
                  <span style={{ textAlign: isUrdu ? 'right' : 'left' }}>{t('تفصیل و کسٹمر', 'Description')}</span>
                  <span style={{ textAlign: 'center' }}>{t('حوالہ نمبر', 'Reference')}</span>
                  <span style={{ textAlign: isUrdu ? 'left' : 'right' }}>{t('رقم', 'Amount')}</span>
                  <span style={{ textAlign: 'center' }}>{t('کارروائی', 'Action')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {ledger.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: isDark ? '#94A3B8' : '#64748B', fontSize: isUrdu ? '18px' : '14px' }} className={isUrdu ? 'font-nastaleeq' : ''}>
                      {t('اس تاریخ میں کوئی ریکارڈ موجود نہیں ہے۔', 'No ledger records found for this period.')}
                    </div>
                  ) : (
                    ledger.map((item, idx) => {
                      const isVoidable = (item.category === 'SALE' || item.category === 'PISAI') && !item.description.includes('منسوخ') && !item.description.includes('VOID');
                      let badgeBg = isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF';
                      let badgeColor = isDark ? '#93C5FD' : '#1D4ED8';
                      let badgeBorder = isDark ? 'rgba(59, 130, 246, 0.4)' : '#BFDBFE';
                      let catLabel: string = item.category;
                      if (item.category === 'SALE') catLabel = isUrdu ? 'سیل' : 'SALE';
                      else if (item.category === 'PISAI') {
                        badgeBg = isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7';
                        badgeColor = isDark ? '#FCD34D' : '#D97706';
                        badgeBorder = isDark ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A';
                        catLabel = isUrdu ? 'پسائی' : 'PISAI';
                      }
                      else if (item.category === 'EXPENSE') {
                        badgeBg = isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2';
                        badgeColor = isDark ? '#FCA5A5' : '#DC2626';
                        badgeBorder = isDark ? 'rgba(239, 68, 68, 0.4)' : '#FECACA';
                        catLabel = isUrdu ? 'خرچہ' : 'EXPENSE';
                      }
                      else if (item.category === 'PAYMENT') {
                        badgeBg = isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5';
                        badgeColor = isDark ? '#6EE7B7' : '#059669';
                        badgeBorder = isDark ? 'rgba(16, 185, 129, 0.4)' : '#A7F3D0';
                        catLabel = isUrdu ? 'وصولی' : 'PAYMENT';
                      }
                      else if (item.category === 'RETURN') {
                        badgeBg = isDark ? 'rgba(244, 63, 94, 0.2)' : '#FFF1F2';
                        badgeColor = isDark ? '#FDA4AF' : '#BE123C';
                        badgeBorder = isDark ? 'rgba(244, 63, 94, 0.4)' : '#FECDD3';
                        catLabel = isUrdu ? 'واپسی' : 'RETURN';
                      }

                      return (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.8fr 1.1fr 1.2fr 0.8fr', padding: '14px 20px', borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? (isDark ? '#1E293B' : '#FFFFFF') : (isDark ? '#162032' : '#F8FAFC'), alignItems: 'center', direction: isUrdu ? 'rtl' : 'ltr' }}>
                          <span dir="ltr" style={{ color: isDark ? '#94A3B8' : '#475569', fontSize: '13.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, textAlign: isUrdu ? 'right' : 'left' }}>{item.timestamp}</span>
                          <div style={{ textAlign: 'center' }}>
                            <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '15px' : '12px', fontWeight: 800, padding: '3px 12px', borderRadius: '20px', backgroundColor: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}`, display: 'inline-block' }}>{catLabel}</span>
                          </div>
                          <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 900, fontSize: isUrdu ? '20px' : '14.5px', textAlign: isUrdu ? 'right' : 'left' }}>{isUrdu && item.descriptionUr ? item.descriptionUr : item.description}</span>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ color: isDark ? '#38BDF8' : '#334155', fontFamily: 'var(--font-mono)', fontSize: '13.5px', fontWeight: 800, backgroundColor: isDark ? '#0F172A' : '#F1F5F9', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', padding: '3px 10px', borderRadius: '6px' }}>{item.reference}</span>
                          </div>
                          <span dir="ltr" style={{ textAlign: isUrdu ? 'left' : 'right', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: isUrdu ? '20px' : '16px', color: item.type === 'inflow' ? (isDark ? '#4ADE80' : '#15803D') : (isDark ? '#F87171' : '#DC2626') }}>
                            {item.type === 'inflow' ? `+ Rs ${item.amount.toLocaleString()}` : item.type === 'outflow' ? `- Rs ${item.amount.toLocaleString()}` : `Rs ${item.amount.toLocaleString()}`}
                          </span>
                          <div style={{ textAlign: 'center' }}>
                            {isVoidable ? (
                              <button type="button" onClick={() => { const rawId = item.id.replace('bill-', '').replace('pisai-', ''); setTargetVoidItem({ id: rawId, type: item.category === 'SALE' ? 'bill' : 'pisai', ref: item.reference }); setVoidModalOpen(true); }} style={{ padding: '5px 12px', borderRadius: '8px', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', color: isDark ? '#F87171' : '#DC2626', border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #FECACA', fontSize: isUrdu ? '15px' : '12px', fontWeight: 800, cursor: 'pointer' }} className={isUrdu ? 'font-nastaleeq' : ''}>
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
      )}

      {/* ═════════════════════════════════════════════════════════════
          3. USER-WISE SALES REPORT VIEW
         ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'user_sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {userSalesStats.map((u, i) => (
              <div key={i} style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '16px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', padding: '20px', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', color: isDark ? '#93C5FD' : '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px' }}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ margin: 0, fontSize: isUrdu ? '20px' : '15px', fontWeight: 900, color: isDark ? '#FFFFFF' : '#0F172A' }}>{u.name}</h3>
                    <span style={{ fontSize: '11px', color: isDark ? '#CBD5E1' : '#64748B', fontWeight: 700 }}>{u.role}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: isDark ? '#111827' : '#F8FAFC', padding: '10px', borderRadius: '10px', border: isDark ? '1px solid #334155' : 'none' }}>
                    <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', color: isDark ? '#CBD5E1' : '#64748B', display: 'block' }}>{isUrdu ? 'کل بلنگ' : 'Total Bills'}</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: isDark ? '#FFFFFF' : '#0F172A', fontFamily: 'var(--font-mono)' }}>{u.billsCount}</span>
                  </div>
                  <div style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FDF4', padding: '10px', borderRadius: '10px', border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : 'none' }}>
                    <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', color: isDark ? '#34D399' : '#166534', display: 'block' }}>{isUrdu ? 'نقد وصول شدہ' : 'Cash Collected'}</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: isDark ? '#34D399' : '#15803D', fontFamily: 'var(--font-mono)' }}>Rs {u.cashCollected.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '16px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', backgroundColor: isDark ? '#0F172A' : '#0F172A', color: '#FFFFFF', fontWeight: 900, fontSize: isUrdu ? '19px' : '14px', borderBottom: isDark ? '1px solid #334155' : 'none' }} className={isUrdu ? 'font-nastaleeq' : ''}>
              {isUrdu ? 'کاؤنٹر اسٹاف کارکردگی و حساب کتاب' : 'Counter Staff Performance & Collection Summary'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 1.2fr 1.2fr', padding: '12px 20px', backgroundColor: isDark ? '#151D2F' : '#F1F5F9', fontWeight: 900, fontSize: isUrdu ? '17px' : '13px', color: isDark ? '#E2E8F0' : '#334155' }} className={isUrdu ? 'font-nastaleeq' : ''}>
              <span>{isUrdu ? 'صارف / کیشیئر' : 'User / Cashier'}</span>
              <span style={{ textAlign: 'center' }}>{isUrdu ? 'عہدہ' : 'Role'}</span>
              <span style={{ textAlign: 'center' }}>{isUrdu ? 'بلز و ٹوکنز' : 'Bills Handled'}</span>
              <span style={{ textAlign: 'center' }}>{isUrdu ? 'کل سیلز' : 'Total Sales'}</span>
              <span style={{ textAlign: 'center' }}>{isUrdu ? 'جمع شدہ کیش' : 'Cash Collected'}</span>
            </div>
            {userSalesStats.map((u, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 1.2fr 1.2fr', padding: '14px 20px', borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0', backgroundColor: isDark ? (idx % 2 === 1 ? '#1E293B' : '#151D2F') : '#FFFFFF', alignItems: 'center' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, color: isDark ? '#FFFFFF' : '#0F172A', fontSize: isUrdu ? '18px' : '14px' }}>{u.name}</span>
                <span style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: isDark ? '#CBD5E1' : '#475569' }}>{u.role}</span>
                <span style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>{u.billsCount + u.pisaiCount}</span>
                <span style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 900, color: isDark ? '#60A5FA' : '#1877F2' }}>Rs {u.salesAmount.toLocaleString()}</span>
                <span style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 900, color: isDark ? '#34D399' : '#15803D' }}>Rs {u.cashCollected.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          4. CUSTOMER REPORT VIEW
         ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'customer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '18px 22px', borderRadius: '16px', border: isDark ? '1.5px solid rgba(245, 158, 11, 0.3)' : '1.5px solid #FDE68A', boxShadow: '0 2px 6px rgba(217,119,6,0.06)' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '13px', color: isDark ? '#FCD34D' : '#92400E', fontWeight: 800, display: 'block' }}>
                {isUrdu ? 'کل واجب الادا ادھار (Receivables)' : 'Total Outstanding Balance'}
              </span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: isDark ? '#FBBF24' : '#B45309', fontFamily: 'var(--font-mono)' }}>
                Rs {(customerStats?.totalReceivables || 61100).toLocaleString()}
              </span>
            </div>
            <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '18px 22px', borderRadius: '16px', border: isDark ? '1.5px solid rgba(59, 130, 246, 0.3)' : '1.5px solid #BFDBFE', boxShadow: '0 2px 6px rgba(24,119,242,0.06)' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '13px', color: isDark ? '#60A5FA' : '#1E40AF', fontWeight: 800, display: 'block' }}>
                {isUrdu ? 'فعال ادھار دار گاہک' : 'Active Debtors'}
              </span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: isDark ? '#60A5FA' : '#1877F2', fontFamily: 'var(--font-mono)' }}>
                {customerStats?.activeDebtorsCount || 3} {isUrdu ? 'کسٹمرز' : 'Customers'}
              </span>
            </div>
            <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '18px 22px', borderRadius: '16px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', boxShadow: '0 2px 6px rgba(71,85,105,0.06)' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '13px', color: isDark ? '#94A3B8' : '#475569', fontWeight: 800, display: 'block' }}>
                {isUrdu ? 'رجسٹرڈ گاہکوں کی تعداد' : 'Registered Customers'}
              </span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#334155', fontFamily: 'var(--font-mono)' }}>
                {customerStats?.totalCustomers || 3}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '16px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', backgroundColor: isDark ? '#0F172A' : '#0F172A', color: '#FFFFFF', fontWeight: 900, fontSize: isUrdu ? '19px' : '14px', borderBottom: isDark ? '1px solid #334155' : 'none' }} className={isUrdu ? 'font-nastaleeq' : ''}>
              {isUrdu ? 'نمایاں ادھار کھاتے (Top Customer Receivables)' : 'Top Customer Ledger Balances'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1.5fr 1fr', padding: '12px 20px', backgroundColor: isDark ? '#151D2F' : '#F1F5F9', fontWeight: 900, fontSize: isUrdu ? '17px' : '13px', color: isDark ? '#E2E8F0' : '#334155' }} className={isUrdu ? 'font-nastaleeq' : ''}>
              <span>{isUrdu ? 'گاہک کا نام' : 'Customer Name'}</span>
              <span>{isUrdu ? 'فون نمبر' : 'Phone'}</span>
              <span style={{ textAlign: isUrdu ? 'left' : 'right' }}>{isUrdu ? 'موجودہ بقایا کھاتہ' : 'Current Balance'}</span>
              <span style={{ textAlign: 'center' }}>{isUrdu ? 'کیفیت' : 'Status'}</span>
            </div>
            {[
              { name: 'طارق نان بائی', phone: '0321-9876543', balance: 38200 },
              { name: 'حاجی رشید', phone: '0300-8765432', balance: 14500 },
              { name: 'میاں اسلم زمیندار', phone: '0333-1122334', balance: 8400 },
            ].map((c, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1.5fr 1fr', padding: '14px 20px', borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0', backgroundColor: isDark ? (idx % 2 === 1 ? '#1E293B' : '#151D2F') : '#FFFFFF', alignItems: 'center' }}>
                <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', fontSize: isUrdu ? '19px' : '14px' }}>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: isDark ? '#94A3B8' : '#475569', fontSize: '13px' }}>{c.phone}</span>
                <span dir="ltr" style={{ textAlign: isUrdu ? 'left' : 'right', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '17px', color: isDark ? '#F87171' : '#DC2626' }}>
                  Rs {c.balance.toLocaleString()}
                </span>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 800, backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7', color: isDark ? '#FCD34D' : '#B45309', border: isDark ? '1px solid rgba(245, 158, 11, 0.35)' : 'none' }}>
                    {isUrdu ? 'ادھار واجب' : 'Unpaid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          5. DAILY LOG / TIMELINE REPORT VIEW
         ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'daily_log' && (
        <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '16px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', padding: '20px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Clock size={20} color="#DC2626" />
            <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ margin: 0, fontSize: isUrdu ? '22px' : '16px', fontWeight: 900, color: isDark ? '#FFFFFF' : '#0F172A' }}>
              {isUrdu ? 'آج کی مکمل وقتی ڈائری (Timeline Stream)' : 'Today Complete Financial Timeline'}
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ledger.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderRadius: '12px', backgroundColor: isDark ? '#151D2F' : '#F8FAFC', border: isDark ? '1px solid #334155' : '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span dir="ltr" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>{item.timestamp}</span>
                  <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', fontSize: isUrdu ? '18px' : '14px' }}>
                    {isUrdu && item.descriptionUr ? item.descriptionUr : item.description}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: isDark ? '#38BDF8' : '#475569', backgroundColor: isDark ? '#0F172A' : '#E2E8F0', border: isDark ? '1px solid #334155' : 'none', padding: '2px 8px', borderRadius: '6px' }}>{item.reference}</span>
                  <span dir="ltr" style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '16px', color: item.type === 'inflow' ? (isDark ? '#4ADE80' : '#15803D') : (isDark ? '#F87171' : '#DC2626') }}>
                    {item.type === 'inflow' ? `+ Rs ${item.amount.toLocaleString()}` : `- Rs ${item.amount.toLocaleString()}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          6. PURCHASE & SUPPLIER REPORTS VIEW
         ═════════════════════════════════════════════════════════════ */}
      {(activeSubTab === 'purchase' || activeSubTab === 'supplier') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '18px 22px', borderRadius: '16px', border: isDark ? '1.5px solid rgba(34, 197, 94, 0.3)' : '1.5px solid #86EFAC', boxShadow: '0 2px 6px rgba(16,185,129,0.06)' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '13px', color: isDark ? '#4ADE80' : '#166534', fontWeight: 800, display: 'block' }}>
                {isUrdu ? 'ماہانہ گندم آمد (خریداری)' : 'Monthly Wheat Intake'}
              </span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: isDark ? '#4ADE80' : '#15803D', fontFamily: 'var(--font-mono)' }}>
                450 {isUrdu ? 'بوری (45,000 کلو)' : 'Bags (45,000 KG)'}
              </span>
            </div>
            <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: '18px 22px', borderRadius: '16px', border: isDark ? '1.5px solid rgba(14, 165, 233, 0.3)' : '1.5px solid #A5F3FC', boxShadow: '0 2px 6px rgba(8,145,178,0.06)' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '18px' : '13px', color: isDark ? '#38BDF8' : '#155E75', fontWeight: 800, display: 'block' }}>
                {isUrdu ? 'سپلائر واجب الادا رقم' : 'Pending Supplier Payments'}
              </span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: isDark ? '#38BDF8' : '#0891B2', fontFamily: 'var(--font-mono)' }}>
                Rs 185,000
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '16px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', padding: '24px', textAlign: 'center' }}>
            <ShoppingCart size={40} color={isDark ? '#4ADE80' : '#0E8A54'} style={{ margin: '0 auto 12px' }} />
            <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ margin: '0 0 8px', fontSize: isUrdu ? '24px' : '17px', fontWeight: 900, color: isDark ? '#FFFFFF' : '#0F172A' }}>
              {isUrdu ? 'سپلائر و خریداری ماڈیول مکمل فعال ہے' : 'Supplier & Grain Purchase Ingestion Ready'}
            </h3>
            <p className={isUrdu ? 'font-nastaleeq' : ''} style={{ margin: 0, fontSize: isUrdu ? '17px' : '13px', color: isDark ? '#94A3B8' : '#64748B' }}>
              {isUrdu ? 'نیا گندم چالان یا سپلائر ادائیگی ریکارڈ کرنے کے لیے نیچے دیے گئے بٹن کا استعمال فرمائیں۔' : 'Use below to record grain purchase delivery or pay supplier ledger balance.'}
            </p>
          </div>
        </div>
      )}

      {/* VOID MODAL */}
      {voidModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9997, backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '460px', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '20px', padding: '26px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ban size={22} color="#DC2626" />
                <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#DC2626' }}>{t('بل یا ٹوکن منسوخ کریں', 'Void Transaction')} ({targetVoidItem?.ref})</h3>
              </div>
              <button type="button" onClick={() => { setVoidModalOpen(false); setVoidReason(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#94A3B8' : '#64748B', padding: '4px' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: isUrdu ? '16px' : '13px', color: isDark ? '#CBD5E1' : '#475569', margin: '0 0 16px', lineHeight: 1.4 }} className={isUrdu ? 'font-nastaleeq' : ''}>{t('منسوخی کے بعد یہ بل باطل ہو جائے گا۔', 'Voiding marks this transaction as VOID.')}</p>
            <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: '6px' }}>{t('منسوخی کی وجہ (لازمی):', 'Void Reason (Required):')}</label>
            <input type="text" value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder={isUrdu ? 'مثلاً: غلط اندراج' : 'e.g. Incorrect entry'} style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', backgroundColor: isDark ? '#0F172A' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#0F172A', fontSize: '14px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} className={isUrdu ? 'font-nastaleeq' : ''} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => { setVoidModalOpen(false); setVoidReason(''); }} style={{ flex: 1, height: '46px', borderRadius: '12px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', color: isDark ? '#CBD5E1' : '#475569', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }} className={isUrdu ? 'font-nastaleeq' : ''}>{t('کینسل', 'Cancel')}</button>
              <button type="button" onClick={handleExecuteVoid} disabled={isVoiding || !voidReason.trim()} style={{ flex: 1.5, height: '46px', borderRadius: '12px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: 900, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }} className={isUrdu ? 'font-nastaleeq' : ''}>{isVoiding ? t('منسوخ ہو رہا ہے...', 'Voiding...') : t('منسوخی کی تصدیق کریں', 'Confirm Void')}</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {isExpenseOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9996, backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: '20px', padding: '24px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={22} color={isDark ? '#4ADE80' : '#0E8A54'} />
                <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '22px', fontWeight: 900, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>{t('دکان کا نیا خرچہ درج کریں', 'Log Shop Expense')}</h3>
              </div>
              <button onClick={() => setIsExpenseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#94A3B8' : '#64748B', padding: '4px' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: isDark ? '#E2E8F0' : '#334155', marginBottom: '4px' }}>{t('خرچے کی قسم:', 'Category:')}</label>
                <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className={isUrdu ? 'font-nastaleeq' : ''} style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', color: isDark ? '#FFFFFF' : '#0F172A', outline: 'none', fontWeight: 800, fontSize: isUrdu ? '17px' : '13.5px' }}>
                  <option value="Electricity">{t('بجلی کا بل', 'Electricity Bill')}</option>
                  <option value="Labor">{t('مزدوری و دیہاڑی', 'Labor Mazdoori')}</option>
                  <option value="Maintenance">{t('چکی مشین مرمت', 'Mill Maintenance')}</option>
                  <option value="Tea & Refreshment">{t('چائے پانی', 'Tea & Refreshment')}</option>
                  <option value="Other">{t('دیگر متفرق اخراجات', 'Other Miscellaneous')}</option>
                </select>
              </div>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: isDark ? '#E2E8F0' : '#334155', marginBottom: '4px' }}>{t('تفصیل:', 'Description:')}</label>
                <input type="text" placeholder={t('مثلاً بیلٹ گریسنگ، جنریٹر ڈیزل...', 'e.g. Belt greasing, generator diesel...')} value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', backgroundColor: isDark ? '#0F172A' : '#F8FAFC', color: isDark ? '#FFFFFF' : '#0F172A', outline: 'none', fontWeight: 800, fontSize: isUrdu ? '17px' : '13.5px', boxSizing: 'border-box' }} className={isUrdu ? 'font-nastaleeq' : ''} />
              </div>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: isUrdu ? '17px' : '13px', fontWeight: 800, color: isDark ? '#E2E8F0' : '#334155', marginBottom: '4px' }}>{t('رقم (PKR):', 'Amount (Rs):')}</label>
                <input type="number" placeholder="0" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} style={{ width: '100%', height: '46px', padding: '0 14px', borderRadius: '10px', border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1', fontSize: '20px', fontWeight: 900, backgroundColor: isDark ? '#0F172A' : '#F8FAFC', color: isDark ? '#FFFFFF' : '#0F172A', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button type="button" onClick={handleAddExpense} className="touch-active" style={{ width: '100%', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0E8A54 0%, #065F46 100%)', color: '#FFFFFF', border: 'none', fontSize: isUrdu ? '20px' : '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,138,84,0.25)' }}>
              <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('خرچہ محفوظ کریں', 'Record Expense')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
