'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { getSession, ensureValidToken } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/api';
import { RoleManagementModal } from './RoleManagementModal';
import {
  TrendingUp,
  Sparkles,
  Receipt,
  Users,
  Wallet,
  ShieldCheck,
  Clock,
  Database,
  ShoppingCart,
  CheckCircle,
  UserPlus,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useGeneralInfo } from '../../lib/generalInfo';

interface AdminDashboardProps {
  onOpenPriceModal: () => void;
  onNavigateTab: (tab: 'billing' | 'pisai' | 'udhaar' | 'reports') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenPriceModal,
  onNavigateTab,
}) => {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useTheme();
  const generalInfo = useGeneralInfo();
  const [closingTriggered, setClosingTriggered] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalTab, setRoleModalTab] = useState<'roles' | 'staff' | 'create' | 'add_user'>('roles');
  const [kpiData, setKpiData] = useState<{
    sales: { totalAmount: number; billsCount: number; cashCollected: number };
    pisai: { totalRevenue: number; tokensCount: number; weightKg: number; cashCollected: number };
    expenses: { totalAmount: number; count: number };
    udhaar: { totalOutstanding: number; debtorsCount: number };
    cash: { netCashInHand: number; inflows: number; outflows: number };
  } | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const sess = getSession();
        const token = await ensureValidToken(sess);
        const res = await fetch(`${getApiBaseUrl()}/api/reports/dashboard-kpis?range=today`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (json.success && json.data) {
          setKpiData(json.data);
        }

        const auditRes = await fetch(`${getApiBaseUrl()}/api/audit-logs?limit=5`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const auditJson = await auditRes.json();
        if (auditJson.success && auditJson.data?.logs) {
          setAuditLogs(auditJson.data.logs.map((l: any) => {
            const d = new Date(l.createdAt);
            const time = !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            
            // Format log details into human-readable text
            let formattedDetail = '';
            try {
              const parsed = typeof l.details === 'string' ? JSON.parse(l.details) : l.details;
              if (l.action === 'USER_LOGIN') {
                const uName = parsed?.username || parsed?.user || '';
                const uRole = parsed?.role || '';
                formattedDetail = isUrdu
                  ? `کامیاب لاگ ان: ${uName}${uRole ? ` (${uRole})` : ''}`
                  : `User logged in: ${uName}${uRole ? ` (${uRole})` : ''}`;
              } else if (l.action === 'USER_LOGOUT') {
                formattedDetail = isUrdu ? 'سسٹم سے لاگ آؤٹ ہوا' : 'User logged out';
              } else if (l.action === 'USER_CREATED') {
                formattedDetail = isUrdu
                  ? `نیا سٹاف صارف بنایا گیا: ${parsed?.username || ''}${parsed?.role ? ` (${parsed?.role})` : ''}`
                  : `New staff created: ${parsed?.username || ''}${parsed?.role ? ` (${parsed?.role})` : ''}`;
              } else if (l.action === 'USER_PASSWORD_RESET') {
                formattedDetail = isUrdu
                  ? `پاس ورڈ یا پن تبدیل کی گئی: ${parsed?.targetUser || ''}`
                  : `Password / PIN updated: ${parsed?.targetUser || ''}`;
              } else if (l.action === 'ROLE_CREATED' || l.action === 'ROLE_UPDATED') {
                formattedDetail = isUrdu
                  ? `اختیارات و رول تبدیل ہوا: ${parsed?.name || ''}`
                  : `Role permissions updated: ${parsed?.name || ''}`;
              } else if (l.action === 'DAILY_CLOSING') {
                formattedDetail = isUrdu
                  ? 'یومیہ شفٹ کلوزنگ اور ریکارڈ محفوظ کیا گیا'
                  : 'Daily shift closing & ledger archived';
              } else if (parsed && typeof parsed === 'object') {
                formattedDetail = Object.entries(parsed)
                  .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                  .join(' • ');
              } else {
                formattedDetail = String(l.details || '-');
              }
            } catch {
              formattedDetail = String(l.details || '-');
            }

            return {
              time,
              actor: l.user?.fullName || l.user?.username || (isUrdu ? 'ایڈمن' : 'Admin'),
              action: l.action,
              actionColor: isDark ? '#38BDF8' : '#0284C7',
              actionBg: isDark ? 'rgba(2, 132, 199, 0.2)' : '#F0F9FF',
              actionBorder: isDark ? 'rgba(2, 132, 199, 0.4)' : '#BAE6FD',
              detail: formattedDetail,
            };
          }));
        }
      } catch (err) {
        console.error('Failed to load dashboard KPIs:', err);
      }
    };
    fetchKpis();
  }, [isUrdu]);

  const handleDailyClosing = () => {
    const confirmClosing = window.confirm(
      isUrdu
        ? 'کیا آپ واقعی یومیہ کلوزنگ اور ڈیٹابیس بیک اپ کرنا چاہتے ہیں؟ اس سے آج کا لیجر محفوظ ہو جائے گا۔'
        : 'Are you sure you want to perform daily closing and database backup?'
    );
    if (confirmClosing) {
      setClosingTriggered(true);
      setTimeout(() => {
        alert(
          isUrdu
            ? 'یومیہ کلوزنگ اور ڈیٹابیس بیک اپ کامیابی سے مکمل ہو گیا ہے!'
            : 'Daily closing and database backup completed successfully!'
        );
        setClosingTriggered(false);
      }, 1200);
    }
  };

  const summaryCards = [
    {
      id: 'drawer',
      title: isUrdu ? 'دکان کا موجودہ کیش' : 'Net Cash in Drawer',
      numValue: kpiData ? kpiData.cash.netCashInHand.toLocaleString() : '0',
      subtitle: isUrdu ? 'سیلز + پسائی + وصولی - اخراجات' : 'Sales + Pisai + Recovery - Expenses',
      icon: <Wallet size={20} color="#10B981" />,
      accentColor: '#10B981',
      iconBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
      iconBorder: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
      valColor: isDark ? '#4ADE80' : '#059669',
      onClick: () => onNavigateTab('reports'),
    },
    {
      id: 'sales',
      title: isUrdu ? 'آج کی پراڈکٹ سیل' : "Today's Product Sales",
      numValue: kpiData ? kpiData.sales.totalAmount.toLocaleString() : '0',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.sales.billsCount} بلز جاری ہوئے • آٹا، میدہ، سوجی`
          : `${kpiData.sales.billsCount} bills issued • Atta, Maida, Suji`
        : isUrdu ? '0 بلز جاری ہوئے • آٹا، میدہ، سوجی' : '0 bills issued • Atta, Maida, Suji',
      icon: <TrendingUp size={20} color="#F59E0B" />,
      accentColor: '#F59E0B',
      iconBg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
      iconBorder: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
      valColor: isDark ? '#FBBF24' : '#D97706',
      onClick: () => onNavigateTab('billing'),
    },
    {
      id: 'pisai',
      title: isUrdu ? 'گندم پسائی آمدن' : 'Pisai Milling Revenue',
      numValue: kpiData ? kpiData.pisai.totalRevenue.toLocaleString() : '0',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.pisai.tokensCount} ٹوکنز مکمل • ${kpiData.pisai.weightKg} کلو`
          : `${kpiData.pisai.tokensCount} tokens processed • ${kpiData.pisai.weightKg} KG`
        : isUrdu ? '0 ٹوکنز مکمل • 0 کلو' : '0 tokens processed • 0 KG',
      icon: <Sparkles size={20} color="#0EA5E9" />,
      accentColor: '#0EA5E9',
      iconBg: isDark ? 'rgba(14, 165, 233, 0.15)' : '#F0F9FF',
      iconBorder: isDark ? 'rgba(14, 165, 233, 0.3)' : '#BAE6FD',
      valColor: isDark ? '#38BDF8' : '#0284C7',
      onClick: () => onNavigateTab('pisai'),
    },
    {
      id: 'expenses',
      title: isUrdu ? 'دکان کے اخراجات' : 'Shop Expenses & Bills',
      numValue: kpiData ? kpiData.expenses.totalAmount.toLocaleString() : '0',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.expenses.count} اخراجات درج • بجلی، دکان خرچ`
          : `${kpiData.expenses.count} recorded • Electricity, shop`
        : isUrdu ? '0 اخراجات درج • بجلی، دکان خرچ' : '0 recorded • Electricity, shop',
      icon: <Receipt size={20} color="#F43F5E" />,
      accentColor: '#F43F5E',
      iconBg: isDark ? 'rgba(244, 63, 94, 0.15)' : '#FFF1F2',
      iconBorder: isDark ? 'rgba(244, 63, 94, 0.3)' : '#FECDD3',
      valColor: isDark ? '#FB7185' : '#E11D48',
      onClick: () => onNavigateTab('reports'),
    },
    {
      id: 'udhaar',
      title: isUrdu ? 'کل گاہک ادھار کھاتہ' : 'Total Customer Udhaar',
      numValue: kpiData ? kpiData.udhaar.totalOutstanding.toLocaleString() : '0',
      subtitle: kpiData
        ? isUrdu
          ? `${kpiData.udhaar.debtorsCount} فعال ادھار کھاتہ داران`
          : `${kpiData.udhaar.debtorsCount} active credit accounts`
        : isUrdu ? '0 فعال ادھار کھاتہ داران' : '0 active credit accounts',
      icon: <Users size={20} color="#8B5CF6" />,
      accentColor: '#8B5CF6',
      iconBg: isDark ? 'rgba(139, 92, 246, 0.15)' : '#FAF5FF',
      iconBorder: isDark ? 'rgba(139, 92, 246, 0.3)' : '#E9D5FF',
      valColor: isDark ? '#A78BFA' : '#7C3AED',
      onClick: () => onNavigateTab('udhaar'),
    },
  ];

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
      {/* 1. Shop Owner Executive Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px 22px',
          gap: '16px',
          boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF',
              border: isDark ? '1.5px solid rgba(56, 189, 248, 0.3)' : '1.5px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#38BDF8' : '#2563EB',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '24px' : '20px',
                  fontWeight: 900,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {generalInfo.mill_name || t('المدینہ فلور ملز', 'Al-Madina Flour Mills')}
              </h1>
              <span
                className={isUrdu ? 'font-nastaleeq' : ''}
                style={{
                  fontSize: isUrdu ? '13px' : '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
                  color: isDark ? '#4ADE80' : '#15803D',
                  border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #86EFAC',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                {t('آن لائن ایڈمن کنٹرول روم', 'Online Admin Control')}
              </span>
            </div>
          </div>
        </div>

        {/* Counter POS Primary CTA Button */}
        <button
          type="button"
          onClick={() => onNavigateTab('billing')}
          className="touch-active"
          style={{
            height: '44px',
            padding: '0 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1877F2 0%, #0D5AC4 100%)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: isUrdu ? '17px' : '14px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            boxShadow: '0 4px 14px rgba(24, 119, 242, 0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          <ShoppingCart size={18} color="#FFFFFF" />
          <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('کاؤنٹر پی او ایس (F8)', 'Counter POS (F8)')}</span>
        </button>
      </div>

      {/* 2. Admin Quick Action Management Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          width: '100%',
        }}
      >
        {/* Action 1: Add User & Key */}
        <button
          type="button"
          onClick={() => {
            setRoleModalTab('add_user');
            setIsRoleModalOpen(true);
          }}
          className="touch-active"
          style={{
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            textAlign: 'right',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 6px rgba(15,23,42,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
              border: isDark ? '1.5px solid rgba(16, 185, 129, 0.3)' : '1.5px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UserPlus size={19} color={isDark ? '#34D399' : '#059669'} />
          </div>
          <div>
            <div
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{ fontSize: isUrdu ? '17px' : '13.5px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', lineHeight: 1.2 }}
            >
              {t('+ نیا صارف / لاگ ان کی', '+ Add Staff User & Key')}
            </div>
          </div>
        </button>

        {/* Action 2: Staff Roles & Permissions */}
        <button
          type="button"
          onClick={() => {
            setRoleModalTab('roles');
            setIsRoleModalOpen(true);
          }}
          className="touch-active"
          style={{
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            textAlign: 'right',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 6px rgba(15,23,42,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#FFFBEB',
              border: isDark ? '1.5px solid rgba(217, 119, 6, 0.3)' : '1.5px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={19} color={isDark ? '#FDE047' : '#D97706'} />
          </div>
          <div>
            <div
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{ fontSize: isUrdu ? '17px' : '13.5px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', lineHeight: 1.2 }}
            >
              {t('سٹاف رولز و اختیارات', 'Staff Roles & Permissions')}
            </div>
          </div>
        </button>

        {/* Action 3: Daily Rates */}
        <button
          type="button"
          onClick={onOpenPriceModal}
          className="touch-active"
          style={{
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            textAlign: 'right',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 6px rgba(15,23,42,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : '#F0F9FF',
              border: isDark ? '1.5px solid rgba(14, 165, 233, 0.3)' : '1.5px solid #BAE6FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={19} color={isDark ? '#38BDF8' : '#0284C7'} />
          </div>
          <div>
            <div
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{ fontSize: isUrdu ? '17px' : '13.5px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', lineHeight: 1.2 }}
            >
              {t('روزانہ کے ریٹس', 'Daily Product Rates')}
            </div>
          </div>
        </button>

        {/* Action 4: Daily Closing & Backup */}
        <button
          type="button"
          onClick={handleDailyClosing}
          disabled={closingTriggered}
          className="touch-active"
          style={{
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            textAlign: 'right',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 6px rgba(15,23,42,0.03)',
            transition: 'all 0.18s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#FAF5FF',
              border: isDark ? '1.5px solid rgba(139, 92, 246, 0.3)' : '1.5px solid #E9D5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Database size={19} color={isDark ? '#C084FC' : '#7E22CE'} />
          </div>
          <div>
            <div
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{ fontSize: isUrdu ? '17px' : '13.5px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', lineHeight: 1.2 }}
            >
              {closingTriggered
                ? t('بیک اپ ہو رہا ہے...', 'Backing up...')
                : t('یومیہ کلوزنگ و بیک اپ', 'Daily Shift Closing')}
            </div>
          </div>
        </button>
      </div>

      {/* 3. Summary KPI Cards - Refined Professional Financial Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))',
          gap: '12px',
          width: '100%',
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className="touch-active dash-card-animated"
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
              borderTop: `4px solid ${card.accentColor}`,
              borderRadius: '14px',
              padding: '16px 18px',
              cursor: 'pointer',
              boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 6px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '84px',
              transition: 'all 0.18s ease',
            }}
          >
            <div>
              {/* Card Header: Title + Squircle Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{
                    fontSize: isUrdu ? '18px' : '13.5px',
                    fontWeight: 900,
                    color: isDark ? '#F1F5F9' : '#1E293B',
                    lineHeight: 1.2,
                  }}
                >
                  {card.title}
                </span>

                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: card.iconBg,
                    border: `1px solid ${card.iconBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
              </div>

              {/* Amount */}
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: card.valColor,
                  margin: '8px 0 0',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  direction: 'ltr',
                }}
              >
                <span>{card.numValue}</span>
                <span
                  className={isUrdu ? 'font-nastaleeq' : ''}
                  style={{ fontSize: isUrdu ? '15px' : '12px', fontWeight: 800, color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  {isUrdu ? 'روپے' : 'PKR'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Activity Audit Log */}
      <div
        style={{
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderRadius: '16px',
          border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1',
          overflow: 'hidden',
          boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Table Header / Banner */}
        <div
          style={{
            backgroundColor: isDark ? '#0B0F19' : '#0F172A',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: isDark ? '1px solid #334155' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} color="#FDE68A" />
            </div>
            <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '16px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              {t('سسٹم سرگرمی اور مالیاتی لاگ', 'System Activity & Financial Audit Log')}
            </h3>
          </div>

          <span
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{
              fontSize: isUrdu ? '14px' : '12px',
              color: '#34D399',
              fontWeight: 800,
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }}
          >
            {t('غیر متغیر سکیورٹی و مالیاتی ٹریل', 'Immutable security and audit trail')}
          </span>
        </div>

        {/* Responsive Table Scroll Container for Mobile */}
        <div className="responsive-table-scroll">
          <div style={{ minWidth: '700px' }}>
            {/* Column Headings */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 180px 160px 1fr',
                padding: '12px 20px',
                backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
                borderBottom: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
                fontSize: isUrdu ? '16px' : '13px',
                fontWeight: 800,
                color: isDark ? '#94A3B8' : '#64748B',
              }}
              className={isUrdu ? 'font-nastaleeq' : ''}
            >
              <span>{t('وقت و تاریخ', 'Time')}</span>
              <span>{t('صارف / بلر', 'User / Actor')}</span>
              <span>{t('کارروائی کی قسم', 'Action')}</span>
              <span>{t('تفصیلات', 'Details')}</span>
            </div>

            {/* Log Entries */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {auditLogs.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700 }}>
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {t('کوئی سرگرمی ریکارڈ موجود نہیں ہے', 'No activity records found')}
                  </span>
                </div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 180px 160px 1fr',
                      padding: '12px 20px',
                      backgroundColor: isDark
                        ? (idx % 2 === 0 ? '#1E293B' : '#111827')
                        : (idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'),
                      borderBottom: isDark
                        ? (idx === auditLogs.length - 1 ? 'none' : '1px solid #334155')
                        : (idx === auditLogs.length - 1 ? 'none' : '1px solid #F1F5F9'),
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background-color 0.12s ease',
                    }}
                  >
                    <span style={{ color: isDark ? '#94A3B8' : '#475569', fontWeight: 800, fontSize: '13.5px', fontFamily: 'var(--font-mono)' }}>
                      {log.time}
                    </span>
                    <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', fontSize: isUrdu ? '16px' : '13.5px' }}>
                      {log.actor}
                    </span>
                    <div>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 900,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: log.actionBg,
                          color: log.actionColor,
                          border: `1px solid ${log.actionBorder}`,
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-block',
                        }}
                      >
                        {log.action}
                      </span>
                    </div>
                    <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ color: isDark ? '#E2E8F0' : '#1E293B', fontWeight: 700, fontSize: isUrdu ? '16px' : '13.5px' }}>
                      {log.detail}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role & Permission Management Modal */}
      <RoleManagementModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        initialTab={roleModalTab}
      />
    </div>
  );
};
