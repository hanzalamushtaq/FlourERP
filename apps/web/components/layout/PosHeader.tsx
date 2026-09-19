'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, FileSpreadsheet, LogOut } from 'lucide-react';

interface PosHeaderProps {
  onOpenZReport: () => void;
  onRefresh?: () => void;
  operatorName?: string;
  roleName?: string;
  canCloseDay?: boolean;
  onLogout?: () => void;
  title?: string;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  onOpenZReport,
  operatorName = 'محمد عاصف',
  roleName = 'Biller',
  canCloseDay = true,
  onLogout,
  title,
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
        borderBottom: '1px solid #e2e8f0',
        padding: '9px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        userSelect: 'none',
      }}
    >
      {/* Left: Search, Clock & Shift Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', direction: 'rtl' }}>
          <input
            type="text"
            placeholder="تلاش: گاہک یا بل نمبر..."
            className="font-nastaleeq"
            style={{
              height: '34px',
              padding: '0 30px 0 10px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '12.5px',
              width: '190px',
              outline: 'none',
              textAlign: 'right',
            }}
          />
          <Search
            size={14}
            color="#94a3b8"
            style={{ position: 'absolute', right: '9px', pointerEvents: 'none' }}
          />
        </div>

        {/* Shift Badge & Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#f8fafc',
            padding: '5px 9px',
            borderRadius: '7px',
            border: '1px solid #e2e8f0',
            fontSize: '11.5px',
            color: '#475569',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            className="font-nastaleeq"
            style={{
              color: '#059669',
              fontWeight: 800,
              fontSize: '11px',
            }}
          >
            صبح شفٹ
          </span>
          <span>•</span>
          <Clock size={12} color="#64748b" />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{currentTime}</span>
        </div>

        {/* End Shift (Z-Report) Button - WhiteSpace NoWrap to prevent line breaking */}
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

        {/* Logout Button (Theme-Harmonious, Soft Neutral) */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="touch-active"
            title="لاگ آؤٹ"
            style={{
              backgroundColor: '#ffffff',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: '7px',
              padding: '6px 10px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <LogOut size={13} color="#64748b" />
            <span className="font-nastaleeq" style={{ fontSize: '12px' }}>لاگ آؤٹ</span>
          </button>
        )}
      </div>

      {/* Right: Clean Header Title & Operator Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', direction: 'rtl', flexShrink: 0 }}>
        <div>
          <h1
            className="font-nastaleeq"
            style={{ fontSize: '17px', fontWeight: 900, color: '#414833', margin: 0, lineHeight: 1.1 }}
          >
            {title || (isAdmin ? 'ایڈمن کمانڈ سنٹر' : 'کاؤنٹر بلر ورک سپیس')}
          </h1>
          <div style={{ fontSize: '11px', color: '#656D4A', fontWeight: 600 }}>
            المدینہ فلور ملز و چکی سسٹم
          </div>
        </div>

        {/* Operator Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '4px 10px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: isAdmin ? '#7F4F24' : '#0284c7',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11.5px',
              fontWeight: 800,
            }}
          >
            {operatorName.slice(0, 1)}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: '#414833', lineHeight: 1.1 }}>
              {operatorName}
            </div>
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: isAdmin ? '#7F4F24' : '#0284c7',
              }}
            >
              {isAdmin ? 'سسٹم ایڈمن' : 'کاؤنٹر آپریٹر'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
