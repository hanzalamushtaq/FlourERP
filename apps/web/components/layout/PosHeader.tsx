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
} from 'lucide-react';

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
  const iconColor = '#6B4A28';
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
        backgroundColor: '#ffffff',
        borderBottom: '1.5px solid #EBE4DA',
        padding: '9px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        userSelect: 'none',
        direction: 'rtl',
      }}
    >
      {/* Right Corner (in RTL): Icon Squircle + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            backgroundColor: '#F5EFE6',
            border: '1.5px solid #E8DED1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(60, 40, 20, 0.05)',
          }}
        >
          {renderHeaderIcon(activeTab)}
        </div>
        <h1
          className="font-nastaleeq"
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: '#1F2937',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {title || 'کاؤنٹر بلر ڈیوٹی بورڈ'}
        </h1>
      </div>

      {/* Left Corner (in RTL): Search Bar & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search Bar moved to left corner */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="تلاش کریں..."
            className="font-nastaleeq"
            style={{
              height: '35px',
              padding: '0 32px 0 12px',
              borderRadius: '8px',
              border: '1.5px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '13px',
              width: '260px',
              outline: 'none',
              textAlign: 'right',
              color: '#1F2937',
            }}
          />
          <Search
            size={15}
            color="#94A3B8"
            style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}
          />
        </div>

        {/* End Shift (Z-Report) Button */}
        {canCloseDay && (
          <button
            type="button"
            onClick={onOpenZReport}
            className="touch-active"
            style={{
              backgroundColor: '#414833',
              color: '#F4F5EE',
              border: 'none',
              borderRadius: '7px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={14} color="#C2C5AA" />
            <span className="font-nastaleeq" style={{ fontSize: '12.5px', fontWeight: 800 }}>
              شفٹ اختتام (Z-Report)
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
