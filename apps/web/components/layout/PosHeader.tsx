'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Clock,
  FileSpreadsheet,
  LogOut,
  Check,
  Home,
  PlusCircle,
  BookOpen,
  Tag,
  Boxes,
  Calculator,
  ShieldCheck,
  Globe,
  Menu,
  Sun,
  Moon,
  X,
  User,
  Phone,
  BarChart2,
  FileText,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getSession, ensureValidToken } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/api';
import { NotificationDropdown } from './NotificationDropdown';

// Chakki Grinder Outline Icon matching sidebar
const ChakkiMachineIcon = ({ size = 21, color = '#6B4A28' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="6,3 18,3 15,8 9,8" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="8" y="8" width="8" height="7" rx="1" stroke={color} strokeWidth="1.8" />
    <circle cx="12" cy="11.5" r="1.5" fill={color} />
    <path d="M16 10H19V13H16" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <polygon points="5,15 19,15 21,20 3,20" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const renderHeaderIcon = (tab?: string) => {
  const iconColor = '#1877F2';
  switch (tab) {
    case 'dashboard':
      return <Home size={21} color={iconColor} strokeWidth={2} />;
    case 'billing':
      return <PlusCircle size={21} color={iconColor} strokeWidth={2} />;
    case 'pisai':
      return <ChakkiMachineIcon size={21} color={iconColor} />;
    case 'udhaar':
      return <BookOpen size={21} color={iconColor} strokeWidth={2} />;
    case 'rates':
      return <Tag size={21} color={iconColor} strokeWidth={2} />;
    case 'stock':
      return <Boxes size={21} color={iconColor} strokeWidth={1.8} />;
    case 'reports':
      return <Calculator size={21} color={iconColor} strokeWidth={2} />;
    case 'admin':
      return <ShieldCheck size={21} color={iconColor} strokeWidth={2} />;
    default:
      return <Home size={21} color={iconColor} strokeWidth={2} />;
  }
};

interface PosHeaderProps {
  onOpenZReport: () => void;
  onRefresh?: () => void;
  operatorName?: string;
  roleName?: string;
  canCloseDay?: boolean;
  onLogout?: () => void;
  title?: string;
  activeTab?: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  isMobileNavOpen?: boolean;
  onOpenPriceModal?: () => void;
  onNavigateTab?: (
    tab: string,
    extra?: { subTab?: string; customerId?: string; customerName?: string; productId?: string }
  ) => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  onOpenZReport,
  operatorName = 'محمد عاصف',
  roleName = 'Biller',
  canCloseDay = true,
  onLogout,
  title,
  activeTab,
  onToggleSidebar,
  isSidebarCollapsed = false,
  isMobileNavOpen = false,
  onOpenPriceModal,
  onNavigateTab,
}) => {
  const { language, setLanguage, isUrdu, t } = useLanguage();
  const { theme, resolvedTheme, setTheme, toggleTheme, isDark, isNightMode } = useTheme();
  const [currentTime, setCurrentTime] = useState<string>('06:45 PM');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [liveCustomers, setLiveCustomers] = useState<Array<{ id: string; name: string; phone: string; balance: number }>>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [productsCatalog, setProductsCatalog] = useState<Array<{ id: string; nameEn: string; nameUr: string; ratePerKg: number; emoji?: string }>>([
    { id: '1', nameEn: 'Chakki Atta', nameUr: 'چکی آٹا', ratePerKg: 140, emoji: '🌾' },
    { id: '2', nameEn: 'Fine Atta', nameUr: 'فائن آٹا', ratePerKg: 148, emoji: '🍚' },
    { id: '3', nameEn: 'Maida Special', nameUr: 'میدہ اسپیشل', ratePerKg: 155, emoji: '🥐' },
    { id: '4', nameEn: 'Suji / Semolina', nameUr: 'خالص سوجی', ratePerKg: 160, emoji: '🥣' },
    { id: '5', nameEn: 'Chokar / Bran', nameUr: 'چوکر', ratePerKg: 95, emoji: '📦' },
    { id: '6', nameEn: 'Desi Atta', nameUr: 'دیسی گندم آٹا', ratePerKg: 145, emoji: '🚜' },
    { id: '7', nameEn: 'Barley Flour / Jau Atta', nameUr: 'جو کا آٹا', ratePerKg: 205, emoji: '🌱' },
  ]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load custom products from localStorage or API
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flour_erp_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProductsCatalog(parsed);
        }
      }
    } catch {}
  }, []);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / '/' shortcut to focus search
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && !isInput)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Debounced Customer Live API Search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setLiveCustomers([]);
      setIsLoadingCustomers(false);
      return;
    }

    setIsLoadingCustomers(true);
    const timer = setTimeout(async () => {
      try {
        const sess = getSession();
        const token = await ensureValidToken(sess);
        const res = await fetch(`${getApiBaseUrl()}/api/customers?q=${encodeURIComponent(q)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.customers)) {
          setLiveCustomers(json.data.customers.slice(0, 5));
        } else {
          setLiveCustomers([]);
        }
      } catch {
        setLiveCustomers([]);
      } finally {
        setIsLoadingCustomers(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Catalog of Services
  const ALL_SERVICES = [
    {
      id: 'srv-billing',
      category: 'service' as const,
      titleEn: 'New Product Bill',
      titleUr: 'نیا بل بنائیں (پروڈکٹ سیلز)',
      subtitleEn: 'F8 Shortcut • Atta, Maida, Suji Sale',
      subtitleUr: 'شارٹ کٹ F8 • آٹا و مصنوعات سیل',
      badgeEn: 'Service',
      badgeUr: 'سروس',
      badgeBg: 'rgba(24, 119, 242, 0.12)',
      badgeColor: '#1877F2',
      icon: <PlusCircle size={18} color="#1877F2" />,
      keywords: ['bill', 'sale', 'billing', 'atta', 'flour', 'نیا بل', 'سیل', 'فروخت'],
      action: () => {
        onNavigateTab?.('billing');
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-pisai',
      category: 'service' as const,
      titleEn: 'Wheat Milling & Token',
      titleUr: 'گندم پسائی و ٹوکن جاری کریں',
      subtitleEn: 'F2 Shortcut • Grinding & Cleaning',
      subtitleUr: 'شارٹ کٹ F2 • صفائی و پسائی ٹوکن',
      badgeEn: 'Service',
      badgeUr: 'سروس',
      badgeBg: 'rgba(217, 119, 6, 0.12)',
      badgeColor: '#D97706',
      icon: <ChakkiMachineIcon size={18} color="#D97706" />,
      keywords: ['pisai', 'milling', 'grinding', 'token', 'wheat', 'پسائی', 'ٹوکن', 'گندم', 'صفائی'],
      action: () => {
        onNavigateTab?.('pisai');
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-udhaar',
      category: 'service' as const,
      titleEn: 'Customer Ledger & Recovery',
      titleUr: 'کسٹمر ادھار کھاتہ و نقد وصولی',
      subtitleEn: 'Customer credit ledger & cash recovery',
      subtitleUr: 'ادھار کھاتے، تفصیلات اور وصولی',
      badgeEn: 'Ledger',
      badgeUr: 'کھاتہ',
      badgeBg: 'rgba(14, 138, 84, 0.12)',
      badgeColor: '#0E8A54',
      icon: <BookOpen size={18} color="#0E8A54" />,
      keywords: ['customer', 'ledger', 'udhaar', 'credit', 'recovery', 'کھاتہ', 'ادھار', 'گاہک', 'وصولی'],
      action: () => {
        onNavigateTab?.('udhaar');
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-rates',
      category: 'service' as const,
      titleEn: 'Daily Flour Rates',
      titleUr: 'روزانہ ریٹ لسٹ و نرخ نامہ',
      subtitleEn: 'F3 Shortcut • Current price list',
      subtitleUr: 'شارٹ کٹ F3 • یومیہ نرخ نامہ',
      badgeEn: 'Pricing',
      badgeUr: 'ریٹ لسٹ',
      badgeBg: 'rgba(124, 58, 237, 0.12)',
      badgeColor: '#7C3AED',
      icon: <Tag size={18} color="#7C3AED" />,
      keywords: ['rates', 'price', 'pricing', 'rate list', 'ریٹ', 'نرخ', 'قیمت'],
      action: () => {
        onNavigateTab?.('rates');
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-price-modal',
      category: 'service' as const,
      titleEn: 'Confirm / Update Daily Prices',
      titleUr: 'یومیہ ریٹس کنفرم و تبدیل کریں',
      subtitleEn: 'Daily price confirmation popup',
      subtitleUr: 'روزانہ ریٹ کنفرمیشن پاپ اپ',
      badgeEn: 'Pricing',
      badgeUr: 'ریٹس',
      badgeBg: 'rgba(124, 58, 237, 0.12)',
      badgeColor: '#7C3AED',
      icon: <Tag size={18} color="#7C3AED" />,
      keywords: ['update price', 'confirm price', 'ریٹ تبدیل'],
      action: () => {
        onOpenPriceModal?.();
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-zreport',
      category: 'service' as const,
      titleEn: 'End of Shift Z-Report / Closing',
      titleUr: 'شفٹ کا اختتام و زیڈ رپورٹ کلوزنگ',
      subtitleEn: 'Daily cash reconciliation & closing',
      subtitleUr: 'روزانہ کلوزنگ و کیش دراز پڑتال',
      badgeEn: 'Closing',
      badgeUr: 'کلوزنگ',
      badgeBg: 'rgba(220, 38, 38, 0.12)',
      badgeColor: '#DC2626',
      icon: <FileSpreadsheet size={18} color="#DC2626" />,
      keywords: ['zreport', 'closing', 'shift', 'drawer', 'کلوزنگ', 'زیڈ رپورٹ', 'شفٹ'],
      action: () => {
        onOpenZReport();
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-admin',
      category: 'service' as const,
      titleEn: 'Admin Command Center',
      titleUr: 'مالک و ایڈمنسٹریٹر کمانڈ سنٹر',
      subtitleEn: 'User roles, security & management',
      subtitleUr: 'صارفین، اختیارات اور سیکیورٹی',
      badgeEn: 'Admin',
      badgeUr: 'ایڈمن',
      badgeBg: 'rgba(15, 23, 42, 0.12)',
      badgeColor: '#0F172A',
      icon: <ShieldCheck size={18} color="#0F172A" />,
      keywords: ['admin', 'users', 'roles', 'permissions', 'ایڈمن', 'رولز', 'اختیارات'],
      action: () => {
        onNavigateTab?.('admin');
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-stock',
      category: 'service' as const,
      titleEn: 'Warehouse & Stock Inventory',
      titleUr: 'گودام و اسٹاک انوینٹری',
      subtitleEn: 'Bags stock & wheat storage count',
      subtitleUr: 'گودام اسٹاک اور بوریوں کی گنتی',
      badgeEn: 'Stock',
      badgeUr: 'اسٹاک',
      badgeBg: 'rgba(14, 118, 110, 0.12)',
      badgeColor: '#0F766E',
      icon: <Boxes size={18} color="#0F766E" />,
      keywords: ['stock', 'inventory', 'warehouse', 'bags', 'اسٹاک', 'گودام', 'بوریاں'],
      action: () => {
        onNavigateTab?.('stock');
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-settings',
      category: 'service' as const,
      titleEn: 'General Settings & Profile',
      titleUr: 'عمومی معلومات و مل پروفائل',
      subtitleEn: 'Shop name, receipt footer, phone number',
      subtitleUr: 'دکان و فلور مل عمومی معلومات',
      badgeEn: 'Settings',
      badgeUr: 'سیٹنگز',
      badgeBg: 'rgba(71, 85, 105, 0.12)',
      badgeColor: '#475569',
      icon: <Home size={18} color="#475569" />,
      keywords: ['settings', 'config', 'profile', 'سیٹنگز', 'معلومات'],
      action: () => {
        onNavigateTab?.('settings');
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'srv-dashboard',
      category: 'service' as const,
      titleEn: 'Duty Station Dashboard',
      titleUr: 'کاؤنٹر بلر ڈیوٹی بورڈ',
      subtitleEn: 'Active counter overview & queue',
      subtitleUr: 'مرکزی کاؤنٹر و حالیہ رسیدیں',
      badgeEn: 'Dashboard',
      badgeUr: 'ڈیش بورڈ',
      badgeBg: 'rgba(24, 119, 242, 0.12)',
      badgeColor: '#1877F2',
      icon: <Home size={18} color="#1877F2" />,
      keywords: ['dashboard', 'home', 'main', 'ڈیوٹی بورڈ', 'ڈیش بورڈ'],
      action: () => {
        onNavigateTab?.('dashboard');
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
  ];

  // Catalog of Reports
  const ALL_REPORTS = [
    {
      id: 'rep-sales',
      category: 'report' as const,
      titleEn: 'Sales & Revenue Report',
      titleUr: 'سیلز رپورٹ و مالیاتی روزنامچہ',
      subtitleEn: 'Daily sales, pisai fees & net drawer cash',
      subtitleUr: 'روزانہ آمدن، فیس پسائی اور خالص نقد',
      badgeEn: 'Report',
      badgeUr: 'رپورٹ',
      badgeBg: 'rgba(24, 119, 242, 0.12)',
      badgeColor: '#1877F2',
      icon: <BarChart2 size={18} color="#1877F2" />,
      keywords: ['sales report', 'revenue', 'income', 'سیلز رپورٹ', 'آمدن', 'سیل'],
      action: () => {
        onNavigateTab?.('reports', { subTab: 'sales' });
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'rep-daily-log',
      category: 'report' as const,
      titleEn: 'Daily Log & Timeline Diary',
      titleUr: 'روزانہ لاگ رپورٹ و ٹائم لائن ڈائری',
      subtitleEn: 'Sequential invoice & token history',
      subtitleUr: 'دن بھر کی تمام رسیدوں اور ٹوکنز کا ریکارڈ',
      badgeEn: 'Report',
      badgeUr: 'رپورٹ',
      badgeBg: 'rgba(220, 38, 38, 0.12)',
      badgeColor: '#DC2626',
      icon: <Clock size={18} color="#DC2626" />,
      keywords: ['daily log', 'diary', 'history', 'timeline', 'روزانہ لاگ', 'ڈائری'],
      action: () => {
        onNavigateTab?.('reports', { subTab: 'daily_log' });
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'rep-customer',
      category: 'report' as const,
      titleEn: 'Customer Receivables Report',
      titleUr: 'کسٹمر ادھار کھاتے و واجبات رپورٹ',
      subtitleEn: 'Outstanding debtor balances & summary',
      subtitleUr: 'گاہکوں کے ادھار کھاتے اور واجب الادا رقوم',
      badgeEn: 'Report',
      badgeUr: 'رپورٹ',
      badgeBg: 'rgba(217, 119, 6, 0.12)',
      badgeColor: '#D97706',
      icon: <BookOpen size={18} color="#D97706" />,
      keywords: ['customer report', 'debtors', 'receivables', 'کسٹمر رپورٹ', 'ادھار رپورٹ'],
      action: () => {
        onNavigateTab?.('reports', { subTab: 'customer' });
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'rep-audit',
      category: 'report' as const,
      titleEn: 'Security & Audit Trail Report',
      titleUr: 'سیکیورٹی آڈٹ ٹریل و لاگز رپورٹ',
      subtitleEn: 'Immutable logs, logins & staff actions',
      subtitleUr: 'صارفین کی تمام سرگرمیاں اور سیکیورٹی لاگز',
      badgeEn: 'Report',
      badgeUr: 'رپورٹ',
      badgeBg: 'rgba(124, 58, 237, 0.12)',
      badgeColor: '#7C3AED',
      icon: <ShieldCheck size={18} color="#7C3AED" />,
      keywords: ['audit', 'logs', 'security', 'trail', 'آڈٹ', 'لاگز', 'سیکیورٹی'],
      action: () => {
        onNavigateTab?.('reports', { subTab: 'audit' });
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'rep-user-sales',
      category: 'report' as const,
      titleEn: 'User Wise Sales Report',
      titleUr: 'یوزر وائز سیلز و کاؤنٹر رپورٹ',
      subtitleEn: 'Cashier-specific collections & bills',
      subtitleUr: 'ہر آپریٹر کی الگ الگ سیل اور پسائی',
      badgeEn: 'Report',
      badgeUr: 'رپورٹ',
      badgeBg: 'rgba(71, 85, 105, 0.12)',
      badgeColor: '#475569',
      icon: <User size={18} color="#475569" />,
      keywords: ['user sales', 'cashier report', 'staff sales', 'یوزر رپورٹ'],
      action: () => {
        onNavigateTab?.('reports', { subTab: 'user_sales' });
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'rep-purchase',
      category: 'report' as const,
      titleEn: 'Raw Wheat Purchase Report',
      titleUr: 'خام گندم خریداری رپورٹ',
      subtitleEn: 'Grain procurement & supplier intake',
      subtitleUr: 'گندم اور خام مال کی خریداری کا خلاصہ',
      badgeEn: 'Report',
      badgeUr: 'رپورٹ',
      badgeBg: 'rgba(14, 138, 84, 0.12)',
      badgeColor: '#0E8A54',
      icon: <ShoppingBag size={18} color="#0E8A54" />,
      keywords: ['purchase report', 'wheat purchase', 'خریداری رپورٹ', 'گندم خریداری'],
      action: () => {
        onNavigateTab?.('reports', { subTab: 'purchase' });
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
    {
      id: 'rep-supplier',
      category: 'report' as const,
      titleEn: 'Wheat Supplier Accounts Report',
      titleUr: 'گندم سپلائر کھاتہ رپورٹ',
      subtitleEn: 'Supplier payables & ledger summary',
      subtitleUr: 'گندم سپلائرز کے واجب الادا کھاتے',
      badgeEn: 'Report',
      badgeUr: 'رپورٹ',
      badgeBg: 'rgba(8, 145, 178, 0.12)',
      badgeColor: '#0891B2',
      icon: <FileText size={18} color="#0891B2" />,
      keywords: ['supplier report', 'payables', 'سپلائر رپورٹ', 'سپلائر'],
      action: () => {
        onNavigateTab?.('reports', { subTab: 'supplier' });
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    },
  ];

  // Normalized Query
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter Services
  const matchedServices = ALL_SERVICES.filter((s) => {
    if (!normalizedQuery) return true;
    return (
      s.titleEn.toLowerCase().includes(normalizedQuery) ||
      s.titleUr.includes(normalizedQuery) ||
      s.subtitleEn?.toLowerCase().includes(normalizedQuery) ||
      s.subtitleUr?.includes(normalizedQuery) ||
      s.keywords?.some((k) => k.toLowerCase().includes(normalizedQuery))
    );
  });

  // Filter Reports
  const matchedReports = ALL_REPORTS.filter((r) => {
    if (!normalizedQuery) return true;
    return (
      r.titleEn.toLowerCase().includes(normalizedQuery) ||
      r.titleUr.includes(normalizedQuery) ||
      r.subtitleEn?.toLowerCase().includes(normalizedQuery) ||
      r.subtitleUr?.includes(normalizedQuery) ||
      r.keywords?.some((k) => k.toLowerCase().includes(normalizedQuery))
    );
  });

  // Filter Products
  const matchedProducts = productsCatalog
    .filter((p) => {
      if (!normalizedQuery) return false;
      return (
        p.nameEn.toLowerCase().includes(normalizedQuery) ||
        p.nameUr.toLowerCase().includes(normalizedQuery)
      );
    })
    .map((p) => ({
      id: `prod-${p.id}`,
      category: 'product' as const,
      titleEn: p.nameEn,
      titleUr: p.nameUr,
      subtitleEn: `Rate: Rs ${p.ratePerKg} / KG`,
      subtitleUr: `نرخ: ${p.ratePerKg} روپے فی کلو`,
      badgeEn: 'Product',
      badgeUr: 'پروڈکٹ',
      badgeBg: 'rgba(180, 83, 9, 0.12)',
      badgeColor: '#B45309',
      icon: <span style={{ fontSize: '16px' }}>{p.emoji || '🌾'}</span>,
      action: () => {
        onNavigateTab?.('billing', { productId: p.id });
        setIsSearchOpen(false);
        setSearchQuery('');
      },
    }));

  // Map Customers
  const matchedCustomers = liveCustomers.map((c) => ({
    id: `cust-${c.id}`,
    category: 'customer' as const,
    titleEn: c.name,
    titleUr: c.name,
    subtitleEn: `Phone: ${c.phone || '-'} • Balance: Rs ${c.balance.toLocaleString()}`,
    subtitleUr: `فون: ${c.phone || '-'} • بقایا: ${c.balance.toLocaleString()} روپے`,
    badgeEn: 'Customer',
    badgeUr: 'گاہک',
    badgeBg: c.balance > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
    badgeColor: c.balance > 0 ? '#DC2626' : '#166534',
    icon: <User size={18} color="#1877F2" />,
    action: () => {
      onNavigateTab?.('udhaar', { customerId: c.id, customerName: c.name });
      setIsSearchOpen(false);
      setSearchQuery('');
    },
  }));

  // Flattened List for Keyboard Navigation
  const allResults = [
    ...matchedServices.slice(0, normalizedQuery ? 4 : 5),
    ...matchedReports.slice(0, normalizedQuery ? 3 : 3),
    ...matchedProducts.slice(0, 4),
    ...matchedCustomers,
  ];

  // Keyboard navigation handler on Search Input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsSearchOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (allResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % allResults.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (allResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        allResults[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const isAdmin =
    roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('owner');

  return (
    <header
      className="pos-header-container"
      style={{
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid #F1F5F9',
        padding: '9px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        userSelect: 'none',
        direction: 'rtl',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Title & Icon & Bell Side (Always on the Right) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, direction: 'rtl' }}>
        {/* Top Right Bell Icon with Notifications & Daily Rate Alert */}
        <NotificationDropdown
          isAdmin={isAdmin}
          onOpenPriceModal={onOpenPriceModal}
          onOpenZReport={onOpenZReport}
        />

        <div
          className="header-icon-squircle"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            backgroundColor: '#F8FAFC',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'none',
          }}
        >
          {renderHeaderIcon(activeTab)}
        </div>
        <h1
          className={`${isUrdu ? 'font-nastaleeq dashboard-header-nastaleeq' : ''} header-title-responsive`}
          style={{
            fontWeight: 900,
            color: '#0F172A',
            margin: 0,
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {title || t('کاؤنٹر بلر ڈیوٹی بورڈ', 'Biller Duty Station')}
        </h1>
      </div>

      {/* Action Buttons Side (Always on the Left) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, direction: 'ltr' }}>
        {/* Mobile Hamburger Menu Button (Full Left Corner) */}
        {onToggleSidebar && !isMobileNavOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={t('مینیو کھولیں', 'Toggle Menu')}
            className="touch-active header-menu-toggle-btn"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0F172A',
              boxShadow: 'none',
              outline: 'none',
              flexShrink: 0,
            }}
          >
            <Menu size={20} strokeWidth={2.2} />
          </button>
        )}

        {/* Language Switcher Segmented Control */}
        <div
          className="header-lang-switcher"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            borderRadius: '8px',
            padding: '2px',
            gap: '2px',
            userSelect: 'none',
            flexShrink: 0,
          }}
          title={isUrdu ? 'زبان تبدیل کریں' : 'Switch Language'}
        >
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`touch-active header-lang-btn ${language === 'ur' ? 'font-nastaleeq' : ''}`}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '4px 9px',
              fontSize: '12.5px',
              fontWeight: language === 'ur' ? 900 : 600,
              backgroundColor: language === 'ur' ? '#1877F2' : 'transparent',
              color: language === 'ur' ? '#FFFFFF' : '#64748B',
              cursor: 'pointer',
              lineHeight: 1.2,
              boxShadow: 'none',
              outline: 'none',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            اردو
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className="touch-active header-lang-btn"
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11.5px',
              fontWeight: language === 'en' ? 800 : 600,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              backgroundColor: language === 'en' ? '#1877F2' : 'transparent',
              color: language === 'en' ? '#FFFFFF' : '#64748B',
              cursor: 'pointer',
              lineHeight: 1.2,
              boxShadow: 'none',
              outline: 'none',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            EN
          </button>
        </div>

        {/* Theme Mode Toggle (System Auto / Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={
            theme === 'system'
              ? t(`سسٹم تھیم (آٹو) - اب ${isNightMode ? 'ڈارک' : 'لائٹ'} ہے`, `System Theme (Auto) - Currently ${isNightMode ? 'Dark' : 'Light'}`)
              : isNightMode
              ? t('ڈارک موڈ آن ہے - لائٹ پر سوئچ کریں', 'Dark Mode - Switch to Light')
              : t('لائٹ موڈ آن ہے - ڈارک پر سوئچ کریں', 'Light Mode - Switch to Dark')
          }
          className="touch-active header-theme-btn"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: isNightMode ? '#1E293B' : '#F8FAFC',
            border: isNightMode ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'none',
            outline: 'none',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          {isNightMode ? (
            <Moon size={18} strokeWidth={2.2} color="#FBBF24" />
          ) : (
            <Sun size={18} strokeWidth={2.2} color="#D97706" />
          )}
        </button>

        {/* Search Bar & Autocomplete Dropdown */}
        <div
          ref={searchContainerRef}
          className="header-search-container"
          style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
              setSelectedIndex(0);
            }}
            onFocus={() => {
              setIsSearchOpen(true);
              setIsSearchFocused(true);
            }}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t('سروس، گاہک، پروڈکٹ یا رپورٹ تلاش کریں...', 'Search service, customer, report, product...')}
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{
              height: '38px',
              padding: isUrdu ? '0 32px 0 32px' : '0 32px 0 32px',
              borderRadius: '8px',
              border: isSearchFocused || isSearchOpen
                ? '1.5px solid #1877F2'
                : (isNightMode ? '1.5px solid #334155' : '1.5px solid #E2E8F0'),
              backgroundColor: isNightMode ? '#1E293B' : '#F8FAFC',
              fontSize: isUrdu ? '15.5px' : '13px',
              fontWeight: 600,
              width: isSearchFocused || searchQuery ? '260px' : '200px',
              transition: 'all 0.18s ease',
              outline: 'none',
              boxShadow: isSearchFocused ? '0 0 0 3px rgba(24, 119, 242, 0.18)' : 'none',
              textAlign: isUrdu ? 'right' : 'left',
              color: isNightMode ? '#F8FAFC' : '#0F172A',
            }}
          />
          <Search
            size={16}
            color={isSearchFocused ? '#1877F2' : '#64748B'}
            style={{
              position: 'absolute',
              [isUrdu ? 'right' : 'left']: '10px',
              pointerEvents: 'none',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                [isUrdu ? 'left' : 'right']: '8px',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '50%',
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* Interactive Suggestions Popover */}
          {isSearchOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                [isUrdu ? 'left' : 'right']: 0,
                width: '420px',
                maxWidth: '92vw',
                maxHeight: '440px',
                backgroundColor: isNightMode ? '#0F172A' : '#FFFFFF',
                borderRadius: '14px',
                border: isNightMode ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
                boxShadow: isNightMode
                  ? '0 16px 40px rgba(0, 0, 0, 0.65)'
                  : '0 16px 40px rgba(15, 23, 42, 0.16)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 9999,
              }}
            >
              {/* Header Label */}
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: isNightMode ? '#1E293B' : '#F8FAFC',
                  borderBottom: isNightMode ? '1px solid #334155' : '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: isNightMode ? '#94A3B8' : '#64748B',
                }}
                className={isUrdu ? 'font-nastaleeq' : ''}
              >
                <span>
                  {normalizedQuery
                    ? t('تلاش کے نتائج', 'Search Results')
                    : t('فوری خدمات و کارروائیاں', 'Quick Services & Actions')}
                </span>
                {isLoadingCustomers && (
                  <span style={{ color: '#1877F2', fontSize: '11px' }}>
                    {t('گاہک تلاش ہو رہے ہیں...', 'Searching customers...')}
                  </span>
                )}
              </div>

              {/* Suggestions List Container */}
              <div
                style={{
                  overflowY: 'auto',
                  maxHeight: '360px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {allResults.length === 0 ? (
                  <div
                    style={{
                      padding: '36px 16px',
                      textAlign: 'center',
                      color: isNightMode ? '#94A3B8' : '#64748B',
                      fontSize: isUrdu ? '17px' : '13px',
                      fontWeight: 700,
                    }}
                    className={isUrdu ? 'font-nastaleeq' : ''}
                  >
                    {t('کوئی سروس، پروڈکٹ، کسٹمر یا رپورٹ نہیں ملی', 'No matching service, product, customer or report found')}
                  </div>
                ) : (
                  allResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: isSelected
                            ? (isNightMode ? '#1E293B' : '#EFF6FF')
                            : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease',
                          border: isSelected
                            ? (isNightMode ? '1px solid #3B82F6' : '1px solid #BFDBFE')
                            : '1px solid transparent',
                        }}
                      >
                        {/* Left: Icon & Titles */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              backgroundColor: item.badgeBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span
                              className={isUrdu ? 'font-nastaleeq' : ''}
                              style={{
                                fontSize: isUrdu ? '17px' : '13.5px',
                                fontWeight: 800,
                                color: isNightMode ? '#F8FAFC' : '#0F172A',
                                lineHeight: 1.25,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {isUrdu ? item.titleUr : item.titleEn}
                            </span>
                            <span
                              className={isUrdu ? 'font-nastaleeq' : ''}
                              style={{
                                fontSize: isUrdu ? '13px' : '11.5px',
                                color: isNightMode ? '#94A3B8' : '#64748B',
                                fontWeight: 600,
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {isUrdu ? item.subtitleUr : item.subtitleEn}
                            </span>
                          </div>
                        </div>

                        {/* Right: Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                          <span
                            className={isUrdu ? 'font-nastaleeq' : ''}
                            style={{
                              fontSize: isUrdu ? '13px' : '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: item.badgeBg,
                              color: item.badgeColor,
                            }}
                          >
                            {isUrdu ? item.badgeUr : item.badgeEn}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer with Keyboard Shortcuts Tip */}
              <div
                style={{
                  padding: '8px 14px',
                  backgroundColor: isNightMode ? '#1E293B' : '#F8FAFC',
                  borderTop: isNightMode ? '1px solid #334155' : '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: isNightMode ? '#64748B' : '#94A3B8',
                  fontWeight: 600,
                }}
              >
                <span>{t('↑↓ نیویگیشن • ↵ منتخب کریں • Esc بند کریں', '↑↓ Navigate • ↵ Select • Esc Close')}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>Ctrl+K</span>
              </div>
            </div>
          )}
        </div>

        {/* End Shift (Z-Report) Button */}
        {canCloseDay && (
          <button
            type="button"
            onClick={onOpenZReport}
            className="touch-active header-shift-btn"
            style={{
              backgroundColor: '#1877F2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: isUrdu ? '15px' : '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: 'none',
              outline: 'none',
            }}
          >
            <FileSpreadsheet size={15} color="#FFFFFF" />
            <span
              className={`header-shift-btn-text ${isUrdu ? 'font-nastaleeq' : ''}`}
              style={{ fontSize: '12px', fontWeight: 800 }}
            >
              {t('شفٹ اختتام', 'End Shift')}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
