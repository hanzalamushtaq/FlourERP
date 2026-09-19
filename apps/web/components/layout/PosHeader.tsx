'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, FileSpreadsheet } from 'lucide-react';

interface PosHeaderProps {
  onOpenZReport: () => void;
  onRefresh?: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({ onOpenZReport }) => {
  const [currentTime, setCurrentTime] = useState<string>('06:45 PM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
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

        {/* Simple End Shift (Z-Report) Button */}
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
      </div>

      {/* Right: Clean Header Title */}
      <div style={{ textAlign: 'right', direction: 'rtl' }}>
        <h1
          className="font-nastaleeq"
          style={{ fontSize: '18px', fontWeight: 900, color: '#414833', margin: 0 }}
        >
          کاؤنٹر ڈیش بورڈ
        </h1>
      </div>
    </header>
  );
};
