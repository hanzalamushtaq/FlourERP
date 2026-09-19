'use strict';
'use client';

import React from 'react';
import { HeroActionCards } from './HeroActionCards';
import { ShiftKpiCards } from './ShiftKpiCards';
import { ChakkiQueueCard } from './ChakkiQueueCard';
import { RecentInvoicesTable } from './RecentInvoicesTable';
import { ReceiptData } from '../ui/ReceiptPreviewModal';

interface CounterDashboardProps {
  onNewBill: () => void;
  onNewPisaiToken: () => void;
  onEditRates: () => void;
  onReprintReceipt: (receipt: ReceiptData) => void;
  onViewAllInvoices?: () => void;
  onMetricCardClick?: (metric: 'sales' | 'recovery' | 'pisai' | 'drawer') => void;
}

export const CounterDashboard: React.FC<CounterDashboardProps> = ({
  onNewBill,
  onNewPisaiToken,
  onEditRates,
  onReprintReceipt,
  onViewAllInvoices,
  onMetricCardClick,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px',
      }}
    >
      {/* 1. Clean Quick Action Cards */}
      <HeroActionCards
        onNewBill={onNewBill}
        onNewPisaiToken={onNewPisaiToken}
        onEditRates={onEditRates}
      />

      {/* 2. Key Metrics Row */}
      <ShiftKpiCards
        todaySales={184500}
        creditRecovery={42000}
        todayPisaiKg={1250}
        cashDrawerBalance={126500}
        onCardClick={onMetricCardClick}
      />

      {/* 3. Operational Queue & Invoices */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px',
          alignItems: 'stretch',
        }}
      >
        <ChakkiQueueCard />
        <RecentInvoicesTable
          onReprint={onReprintReceipt}
          onViewAllInvoices={onViewAllInvoices}
        />
      </div>
    </div>
  );
};
