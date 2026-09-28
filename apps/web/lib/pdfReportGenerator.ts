'use strict';

export interface PdfSummaryCard {
  label: string;
  value: string;
  color?: string;
}

export interface PdfTable {
  title?: string;
  headers: string[];
  rows: (string | number)[][];
  footers?: (string | number)[];
  alignments?: ('left' | 'center' | 'right')[];
}

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  dateRangeStr?: string;
  summaryCards?: PdfSummaryCard[];
  tables: PdfTable[];
  isUrdu?: boolean;
  notes?: string;
}

export function generateTabularPdf(options: PdfReportOptions) {
  const {
    title,
    subtitle = '',
    dateRangeStr = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
    summaryCards = [],
    tables = [],
    isUrdu = false,
    notes = 'کمپیوٹرائزڈ تصدیق شدہ رپورٹ - ہنی فلور ملز ای آر پی سسٹم',
  } = options;

  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('Please allow popups to download or print PDF reports.');
    return;
  }

  const generatedTime = new Date().toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const cardsHtml = summaryCards.length > 0 ? `
    <div class="summary-cards">
      ${summaryCards.map((c) => `
        <div class="card">
          <div class="card-label">${c.label}</div>
          <div class="card-value" style="color: ${c.color || '#0F172A'}">${c.value}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const tablesHtml = tables.map((tbl, tIdx) => {
    const alignments = tbl.alignments || [];
    return `
      <div class="table-section">
        ${tbl.title ? `<div class="table-title">${tbl.title}</div>` : ''}
        <table>
          <thead>
            <tr>
              ${tbl.headers.map((h, i) => {
                const align = alignments[i] || (i === 0 ? 'left' : 'right');
                return `<th style="text-align: ${align}">${h}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${tbl.rows.length === 0 ? `
              <tr>
                <td colspan="${tbl.headers.length}" style="text-align: center; color: #64748B; padding: 18px;">
                  کوئی ریکارڈ موجود نہیں ہے (No records found)
                </td>
              </tr>
            ` : tbl.rows.map((row, rIdx) => `
              <tr class="${rIdx % 2 === 0 ? 'even' : 'odd'}">
                ${row.map((cell, cIdx) => {
                  const align = alignments[cIdx] || (cIdx === 0 ? 'left' : 'right');
                  return `<td style="text-align: ${align}">${cell}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
          ${tbl.footers && tbl.footers.length > 0 ? `
            <tfoot>
              <tr>
                ${tbl.footers.map((f, i) => {
                  const align = alignments[i] || (i === 0 ? 'left' : 'right');
                  return `<th style="text-align: ${align}">${f}</th>`;
                }).join('')}
              </tr>
            </tfoot>
          ` : ''}
        </table>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="${isUrdu ? 'ur' : 'en'}" dir="${isUrdu ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="utf-8" />
      <title>${title} - ${dateRangeStr}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 14mm 12mm 16mm 12mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Nastaliq Urdu', 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 16px;
          color: #0F172A;
          background: #FFFFFF;
          font-size: 13px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          border-bottom: 2.5px solid #0F172A;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .bismillah {
          font-size: 14px;
          color: #475569;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .mill-name {
          font-size: 24px;
          font-weight: 900;
          color: #0F172A;
          margin: 0;
        }
        .report-title {
          font-size: 18px;
          font-weight: 800;
          color: #1877F2;
          margin-top: 4px;
        }
        .meta-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          color: #475569;
          font-weight: 700;
          margin-top: 8px;
          padding: 4px 10px;
          background: #F1F5F9;
          border-radius: 6px;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }
        .card {
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          padding: 10px 12px;
          background: #F8FAFC;
        }
        .card-label {
          font-size: 11px;
          color: #64748B;
          font-weight: 700;
          text-transform: uppercase;
        }
        .card-value {
          font-size: 18px;
          font-weight: 900;
          margin-top: 2px;
        }
        .table-section {
          margin-bottom: 18px;
          page-break-inside: avoid;
        }
        .table-title {
          font-size: 14px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 6px;
          border-left: 4px solid #1877F2;
          padding-left: 8px;
        }
        html[dir="rtl"] .table-title {
          border-left: none;
          border-right: 4px solid #1877F2;
          padding-left: 0;
          padding-right: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          border: 1.5px solid #CBD5E1;
        }
        thead th {
          background-color: #0F172A !important;
          color: #FFFFFF !important;
          padding: 8px 10px;
          font-weight: 800;
          border: 1px solid #0F172A;
        }
        tbody td {
          padding: 7px 10px;
          border: 1px solid #E2E8F0;
        }
        tbody tr.even {
          background-color: #FFFFFF;
        }
        tbody tr.odd {
          background-color: #F8FAFC;
        }
        tfoot th {
          background-color: #E2E8F0 !important;
          color: #0F172A !important;
          padding: 8px 10px;
          font-weight: 900;
          border: 1.5px solid #CBD5E1;
        }
        .footer {
          margin-top: 24px;
          padding-top: 14px;
          border-top: 1.5px dashed #94A3B8;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 11px;
          color: #64748B;
        }
        .signature-box {
          text-align: center;
          width: 160px;
          border-top: 1px solid #0F172A;
          padding-top: 4px;
          font-weight: 700;
          color: #0F172A;
        }
        .no-print-bar {
          background: #1877F2;
          color: #FFFFFF;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-radius: 8px;
        }
        .btn-print {
          background: #FFFFFF;
          color: #1877F2;
          font-weight: 900;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        }
        @media print {
          .no-print-bar {
            display: none !important;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <span><strong>PDF Tabular Report Ready</strong> • Click Save as PDF in print dialog</span>
        <button class="btn-print" onclick="window.print()">📥 Save as PDF / Print</button>
      </div>

      <div class="header">
        <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <h1 class="mill-name">Honey Mills & Flour ERP</h1>
        <div class="report-title">${title}</div>
        ${subtitle ? `<div style="font-size: 12px; color: #64748B; margin-top: 2px;">${subtitle}</div>` : ''}
        <div class="meta-bar">
          <span>📅 تاریخ و دورانیہ: <strong>${dateRangeStr}</strong></span>
          <span>⏰ رپورٹ اخراج وقت: <strong>${generatedTime}</strong></span>
          <span>🏛️ کاؤنٹر: <strong>مین سسٹم کاؤنٹر</strong></span>
        </div>
      </div>

      ${cardsHtml}
      ${tablesHtml}

      <div class="footer">
        <div>
          <div>${notes}</div>
          <div style="margin-top: 4px; font-size: 10px;">Generated automatically by FlourERP System v1.0 POS</div>
        </div>
        <div class="signature-box">
          دستخط و مہر مجاز آفیسر<br />
          (Authorized Signature)
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
