'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  Bell,
  ScanLine,
  RotateCw,
  FileSpreadsheet,
} from 'lucide-react';

interface PosHeaderProps {
  onOpenZReport: () => void;
  onRefresh: () => void;
  onSearchFocus?: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  onOpenZReport,
  onRefresh,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('18/09/2026 06:45 PM');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB');
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setCurrentDateTime(`${dateStr} ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1.5px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left Area: Controls, Search, Shift info, Z-Report */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* End Shift (Z-Report) Button */}
        <button
          type="button"
          onClick={onOpenZReport}
          className="touch-active"
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <FileSpreadsheet size={16} color="#fbbf24" />
          <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 800 }}>
            شفٹ کا اختتام (Z-Report)
          </span>
        </button>

        {/* Refresh Data Button */}
        <button
          type="button"
          onClick={handleRefreshClick}
          className="touch-active"
          style={{
            backgroundColor: '#f8fafc',
            color: '#334155',
            border: '1.5px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RotateCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 700 }}>
            ریفریش ڈیٹا
          </span>
        </button>

        {/* Shift Badge & Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f1f5f9',
            padding: '4px 10px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
          }}
        >
          <span
            className="font-nastaleeq"
            style={{
              backgroundColor: '#dcfce7',
              color: '#15803d',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #bbf7d0',
            }}
          >
            صبح شفٹ
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
            <Clock size={14} color="#64748b" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{currentDateTime}</span>
          </div>
        </div>

        {/* Action Quick Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="touch-active"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
            title="Scan Barcode / Token"
          >
            <ScanLine size={17} />
          </button>

          <button
            type="button"
            className="touch-active"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              position: 'relative',
            }}
            title="Notifications"
          >
            <Bell size={17} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
              }}
            />
          </button>
        </div>

        {/* Live Search Input (Ctrl+F) */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            direction: 'rtl',
          }}
        >
          <input
            type="text"
            placeholder="تلاش: گاہک، فون یا بل نمبر... (Ctrl+F)"
            className="font-nastaleeq"
            style={{
              height: '38px',
              padding: '0 34px 0 42px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '13px',
              width: '240px',
              outline: 'none',
              textAlign: 'right',
            }}
          />
          <Search
            size={16}
            color="#94a3b8"
            style={{
              position: 'absolute',
              right: '10px',
              pointerEvents: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '8px',
              fontSize: '10px',
              fontWeight: 700,
              backgroundColor: '#e2e8f0',
              color: '#64748b',
              padding: '2px 5px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            /
          </span>
        </div>
      </div>

      {/* Right Area: Screen Title and Mandi Ticker */}
      <div style={{ textAlign: 'right', direction: 'rtl' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
          <h1
            className="font-nastaleeq"
            style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: 0 }}
          >
            مین ڈیش بورڈ و کاؤنٹر انٹرفیس
          </h1>
        </div>
        <div
          className="font-nastaleeq"
          style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}
        >
          فوری ایکشن کارڈز منتخب کریں یا جاری شفٹ کے ٹرانزیکشنز کی نگرانی کریں
        </div>
      </div>
    </header>
  );
};
