# Requirements Specification: Flour Mill Billing & Management System

## Overview
This document defines the functional and non-functional requirements for the Flour Mill (Chakki) Billing & Management System. Every requirement is uniquely identified and mapped to a specific roadmap phase.

---

## Requirements by Phase

### Phase 1: Frontend UI & Dashboard Design
- **UI-01**: The system shall provide a mobile-first, touch-friendly UI framework with large high-contrast touch cards, icon cues, and responsive viewport scaling.
- **UI-02**: The frontend shall provide a complete Biller touch interface mockup including product selection cards, dual-mode weight↔amount input toggle, integrated on-screen numeric keypad, and a dedicated Pisai grinding ticket screen.
- **UI-03**: The frontend shall provide a comprehensive Admin Dashboard UI mockup displaying pre-aggregated metric cards, daily price modal, customer ledger views, expense logging forms, and reports layout.
- **FONT-01**: Product cards, receipt mockups, and counter screens shall render Urdu typography using the Jameel Noori Nastaleeq font.
- **AUTH-02**: The frontend shall provide an idle-timeout PIN-lock overlay component that securely masks the screen without destroying session state.

### Phase 2: Backend Foundation & Core Setup
- **SETUP-01**: The system shall configure an Express REST backend (`apps/api`) connected to PostgreSQL with monorepo orchestration.
- **SETUP-02**: The database shall manage relational schemas with migrations, transactional safety, and strict numeric types for monetary amounts.
- **AUTH-01**: Users shall authenticate via username and password with bcrypt hashing and session-based persistent login.
- **RBAC-01**: The system shall support a dynamic role-based access control (RBAC) schema allowing custom roles with granular permission assignments.
- **RBAC-02**: The backend shall enforce granular permission checks on all API endpoints, and the frontend shall dynamically connect role-based navigation.

### Phase 3: Product Catalog & Price Management
- **CAT-01**: Admin shall create, edit, activate/deactivate packaged flour products (standard unit: KG).
- **PRICE-01**: Admin shall set and update per-KG rates with automatic historical logging in `price_history`.
- **PRICE-02**: The system shall trigger a daily price confirmation on the first bill attempt of each calendar day, allowing Admin to update or confirm previous rates.
- **PRICE-03**: Counter Billers shall be blocked from directly updating prices; Biller price change requests shall hold the pending bill until Admin review or permit continuation with an Admin notification.

### Phase 4: Core Billing Engine (Standard Products)
- **BILL-01**: The billing screen shall execute touch-card product selection with dual calculation modes: Weight → Amount (`qty_kg * rate`) and Amount → Weight (`amount / rate`).
- **BILL-02**: The billing engine shall support entering an explicit discounted final amount, calculating `discount = subtotal - final_amount`, restricted to users with `can_discount` permission.
- **BILL-03**: The backend shall allocate strictly sequential, non-resetting bill numbers using database-level locking during atomic bill transactions.
- **BILL-04**: The system shall block bill generation and display a "Rate not set" warning if a product's current rate is null or zero.
- **PRINT-01**: The system shall generate ESC/POS receipt payloads for thermal printers upon bill creation.
- **PRINT-02**: The system shall provide an Admin/Biller reprint mechanism that re-renders the stored bill payload without altering sequence numbers or records.

### Phase 5: Gundam Pisai (Grinding) Module
- **PISAI-01**: The system shall provide a dedicated high-speed Pisai billing screen capturing customer name (optional) and wheat weight in KG.
- **PISAI-02**: The Pisai billing screen shall support service selection (*Pisai* vs *Safai + Pisai*) with direct manual charge entry.
- **PISAI-03**: The backend shall maintain an independent, monotonic 4-digit sequential token counter (`0001`–`9999`) that does not reset across days.
- **PISAI-04**: The system shall output large-format thermal print tickets emphasizing the 4-digit token number for customer collection.
- **PISAI-05**: Pisai transactions shall support permission-gated discounts and credit (udhaar) assignment matching standard billing rules.

### Phase 6: Credit (Udhaar) & Ledger Module
- **CRED-01**: Admin-authorized staff shall issue credit bills by searching existing customers or creating new customer profiles (name, phone).
- **CRED-02**: The customer profile screen shall display purchase history, payment logs, and a live calculated outstanding balance.
- **CRED-03**: Customer transactions (credit additions and cash repayments) shall be append-only, with balances derived or materialized upon write.
- **LEDGER-01**: The system shall maintain a unified append-only `ledger_entries` table recording all financial events (sales, credit issuance, repayments, expenses, returns, reversals).

### Phase 7: Expenses, Returns, Reports
- **EXP-01**: Authorized users shall log operational shop expenses (category, amount, description) with server-generated timestamps.
- **RET-01**: The system shall provide a standalone product return workflow referencing original bills and writing offsetting entries to the ledger.
- **REP-01**: The dashboard shall render pre-aggregated summary cards for daily and monthly sales, grinding fees, expenses, and credit exposure.
- **REP-02**: The reports module shall provide date-range filtering, customer-name filtering, and export capabilities for all financial streams.

### Phase 8: Daily Closing, Backup, Bill Void, Audit Log
- **CLOSE-01**: Admin shall perform an end-of-day closing action that computes a day-end snapshot (`daily_closing_records`) and locks the day against backdated edits.
- **BACKUP-01**: Confirming daily closing shall automatically trigger an automated PostgreSQL database backup job.
- **VOID-01**: Admin shall have exclusive authority to void standard bills and Pisai tokens, creating linked reversal ledger entries without deleting original data.
- **AUDIT-01**: The backend shall synchronously record an immutable `activity_log` entry for all sensitive actions (price edits, discounts, voids, role changes, credit logs).

### Phase 9: Testing, Polish & Deployment
- **TEST-01**: The project shall include end-to-end automated tests verifying billing calculations, concurrency safety of sequences, and RBAC enforcement.
- **TEST-02**: The user interface shall undergo usability validation and ergonomic optimization specifically for low-literacy touch workflows.
- **PERF-01**: Frontend and backend response times and mobile device viewport responsiveness shall be profiled and optimized.
- **DEPLOY-01**: The application shall include production build configurations, deployment scripts, database seeding scripts, and operator handover guides.

---

## Out of Scope (v2 Backlog)
- Multi-location/multi-branch shop management.
- Inventory and stock reconciliation.
- SMS and WhatsApp Business notification integrations.
- Offline-first caching or local storage synchronization.
- Non-metric units (maund, seer).
