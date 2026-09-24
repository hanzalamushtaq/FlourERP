'use strict';
'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
}) => {
  const { language, setLanguage, isUrdu, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState<string>('06:45 PM');

  const isAdmin =
    roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('owner');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: 'none',
        padding: '9px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        userSelect: 'none',
        direction: 'rtl',
        boxShadow: 'none',
      }}
    >
      {/* Right Corner (in RTL): Icon Squircle + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
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
          className={`${isUrdu ? 'font-nastaleeq dashboard-header-nastaleeq' : ''}`}
          style={{
            fontSize: isUrdu ? '32px' : '22px',
            fontWeight: 900,
            color: '#0F172A',
            margin: 0,
            lineHeight: 1.4,
            letterSpacing: '-0.02em',
          }}
        >
          {title || t('کاؤنٹر بلر ڈیوٹی بورڈ', 'Biller Duty Station')}
        </h1>
      </div>

      {/* Left Corner (in RTL): Search Bar & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Language Switcher Segmented Control */}
        <div
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
            className={`touch-active ${language === 'ur' ? 'font-nastaleeq' : ''}`}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '13px',
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
            className="touch-active"
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '4px 9px',
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

        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={t('تلاش کریں...', 'Search...')}
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{
              height: '38px',
              padding: '0 12px 0 34px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F8FAFC',
              fontSize: isUrdu ? '17px' : '14px',
              width: '240px',
              outline: 'none',
              boxShadow: 'none',
              textAlign: 'left',
              color: '#0F172A',
            }}
          />
          <Search
            size={16}
            color="#64748B"
            style={{
              position: 'absolute',
              left: '10px',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* End Shift (Z-Report) Button */}
        {canCloseDay && (
          <button
            type="button"
            onClick={onOpenZReport}
            className="touch-active"
            style={{
              backgroundColor: '#1877F2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '7px',
              padding: '6px 12px',
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
            <FileSpreadsheet size={14} color="#FFFFFF" />
            <span
              className={isUrdu ? 'font-nastaleeq' : ''}
              style={{ fontSize: '12px', fontWeight: 800 }}
            >
              {t('شفٹ اختتام', 'End Shift (Z-Report)')}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
