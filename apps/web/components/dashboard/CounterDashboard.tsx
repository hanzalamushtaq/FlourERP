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
        gap: '20px',
        width: '100%',
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '16px 20px',
      }}
    >
      {/* 1. Hero Quick Action Cards [F8], [F2], [F3] */}
      <section>
        <HeroActionCards
          onNewBill={onNewBill}
          onNewPisaiToken={onNewPisaiToken}
          onEditRates={onEditRates}
          todayBillsCount={142}
          activePisaiTokensCount={28}
          ratesLastUpdated="09:00 AM"
        />
      </section>

      {/* 2. Shift Financial Metric Summary Tiles */}
      <section>
        <ShiftKpiCards
          todaySales={184500}
          creditRecovery={42000}
          todayPisaiKg={1250}
          cashDrawerBalance={126500}
          onCardClick={onMetricCardClick}
        />
      </section>

      {/* 3. Operational Real-Time Monitoring (Chakki Queue + Recent Bills Feed) */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(480px, 2fr)',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        {/* Left Column: Chakki Machine & Token Live Queue */}
        <div>
          <ChakkiQueueCard />
        </div>

        {/* Right Column: Shift Recent Invoices & Live Bills */}
        <div>
          <RecentInvoicesTable
            onReprint={onReprintReceipt}
            onViewAllInvoices={onViewAllInvoices}
          />
        </div>
      </section>
    </div>
  );
};
