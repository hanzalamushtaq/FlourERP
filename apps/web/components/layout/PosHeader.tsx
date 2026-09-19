'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, FileSpreadsheet, LogOut, UserCheck } from 'lucide-react';

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
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        userSelect: 'none',
      }}
    >
      {/* Left: Search & Shift Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', direction: 'rtl' }}>
          <input
            type="text"
            placeholder="تلاش: گاہک یا بل نمبر..."
            className="font-nastaleeq"
            style={{
              height: '36px',
              padding: '0 32px 0 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '13px',
              width: '210px',
              outline: 'none',
              textAlign: 'right',
            }}
          />
          <Search
            size={15}
            color="#94a3b8"
            style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}
          />
        </div>

        {/* Shift Badge & Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f8fafc',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#475569',
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
          <Clock size={13} color="#64748b" />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{currentTime}</span>
        </div>

        {/* End Shift (Z-Report) Button - Only if permitted */}
        {canCloseDay && (
          <button
            type="button"
            onClick={onOpenZReport}
            className="touch-active"
            style={{
              backgroundColor: '#414833',
              color: '#F4F5EE',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileSpreadsheet size={15} color="#C2C5AA" />
            <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800 }}>
              شفٹ اختتام (Z-Report)
            </span>
          </button>
        )}

        {/* Logout Quick Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="touch-active"
            title="لاگ آؤٹ"
            style={{
              backgroundColor: '#fff1f2',
              color: '#991b1b',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              padding: '7px 10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LogOut size={14} color="#991b1b" />
            <span className="font-nastaleeq" style={{ fontSize: '12px' }}>لاگ آؤٹ</span>
          </button>
        )}
      </div>

      {/* Right: Clean Header Title & Operator Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', direction: 'rtl' }}>
        <div>
          <h1
            className="font-nastaleeq"
            style={{ fontSize: '18px', fontWeight: 900, color: '#414833', margin: 0 }}
          >
            {title || (isAdmin ? 'ایڈمن کمانڈ سنٹر' : 'کاؤنٹر بلر ورک سپیس')}
          </h1>
          <div style={{ fontSize: '11px', color: '#656D4A', fontWeight: 600 }}>
            المدینہ فلور ملز و چکی سسٹم
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F4F5EE',
            border: '1px solid #C2C5AA',
            padding: '5px 10px',
            borderRadius: '10px',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: isAdmin ? '#7F4F24' : '#656D4A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
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
                color: isAdmin ? '#7F4F24' : '#656D4A',
              }}
            >
              {isAdmin ? 'سسٹم ایڈمن' : 'کاؤنٹر بلر'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
