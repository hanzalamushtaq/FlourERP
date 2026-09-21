# Project Roadmap: Flour Mill (Chakki) Billing & Management System

## Phase Summary Checklist
- [x] **Phase 1: Frontend UI & Dashboard Design** - Next.js UI setup, design system, Jameel Noori Nastaleeq Urdu typography, Biller touch interface (cards, weight↔amount modes, numeric keypad, Pisai ticket screen), Admin Dashboard, and idle PIN-lock overlay.
- [x] **Phase 2: Backend Foundation & Core Setup** - Express backend scaffolding, PostgreSQL migrations, session-based auth, PIN-lock backend, dynamic RBAC engine, and fine-grained permission middleware.
- [x] **Phase 3: Product Catalog & Price Management** - Product catalog CRUD, per-KG rates, `price_history` audit tracking, and 24-hour daily price confirmation workflow (Admin & Biller paths).
- [x] **Phase 4: Core Billing Engine (Standard Products)** - Dual-mode billing screen logic, permission-gated discounts, non-resetting sequential bill numbers with DB locks, rate guards, and thermal ESC/POS printing.
- [x] **Phase 5: Gundam Pisai (Grinding) Module** - Dedicated Pisai screen logic, service options, manual pricing, independent 4-digit token sequence (`0001`–`9999`), large-format token print, and credit/discount integration.
- [x] **Phase 6: Credit (Udhaar) & Ledger Module** - Admin credit issuance, customer profiles with payment history, derived balance tracking, and unified append-only financial ledger.
- [x] **Phase 7: Expenses, Returns, Reports** - Expense logging, standalone bill returns with ledger offsets, and reports dashboard with date/customer filtering.
- [x] **Phase 8: Daily Closing, Backup, Bill Void, Audit Log** - End-of-day summary snapshot, automated database backup trigger, bill/Pisai voiding with reversal entries, and synchronous activity logging.
- [x] **Phase 9: Testing, Polish & Deployment** - End-to-end billing tests, low-literacy staff usability refinements, mobile performance tuning, and production deployment scripts.

---

## Progress Table
| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Frontend UI & Dashboard Design | 3/3 | Completed | 2026-09-18 |
| 2. Backend Foundation & Core Setup | 3/3 | Completed | 2026-09-19 |
| 3. Product Catalog & Price Management | 1/1 | Completed | 2026-09-21 |
| 4. Core Billing Engine (Standard Products) | 1/1 | Completed | 2026-09-21 |
| 5. Gundam Pisai (Grinding) Module | 1/1 | Completed | 2026-09-21 |
| 6. Credit (Udhaar) & Ledger Module | 1/1 | Completed | 2026-09-21 |
| 7. Expenses, Returns, Reports | 1/1 | Completed | 2026-09-21 |
| 8. Daily Closing, Backup, Bill Void, Audit Log | 1/1 | Completed | 2026-09-21 |
| 9. Testing, Polish & Deployment | 1/1 | Completed | 2026-09-21 |

---

## Phase Details

### Phase 1: Frontend UI & Dashboard Design
**Goal**: Design and build the entire interactive, mobile-responsive UI shell, design tokens, Urdu font rendering, Biller touch screens, Admin dashboard, and PIN-lock screen.
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02, UI-03, FONT-01, AUTH-02
**Success Criteria**:
  1. Next.js app loads with clean mobile-first design tokens, high-contrast touch cards, and responsive viewports.
  2. Biller interface renders interactive touch product cards, weight↔amount conversion toggle, an on-screen numeric keypad, and a Pisai grinding screen with large token preview.
  3. Product titles and bill previews render authentically in Jameel Noori Nastaleeq Urdu font.
  4. Admin dashboard showcases styled metric summary cards, daily price modal, customer ledger view, expense forms, and reports layout.
  5. Idle PIN-lock overlay component activates cleanly on inactivity and unlocks with a 4-digit PIN.
**Plans**:
  - [x] 01-01: Next.js Foundation, Design System & Typography
  - [x] 01-02: Biller Counter Billing & Grinding Ticket Experience
  - [x] 01-03: Admin Management Dashboard, Price Workflow & Reporting UI
**UI hint**: yes

### Phase 2: Backend Foundation & Core Setup
**Goal**: Establish Express REST backend, PostgreSQL relational database schema with migrations, persistent session auth, dynamic RBAC engine, and permission middleware.
**Depends on**: Phase 1
**Requirements**: SETUP-01, SETUP-02, AUTH-01, RBAC-01, RBAC-02
**Success Criteria**:
  1. Express API server runs and connects to PostgreSQL, executing database migrations with strict numeric currency columns.
  2. Users can log in with username/password, persist sessions securely, and log out cleanly.
  3. Admin can create custom roles and assign fine-grained permissions via backend API.
**Plans**:
  - [x] 02-01: Express Monorepo Scaffolding & PostgreSQL Database Migrations
  - [x] 02-02: Authentication Engine, Session Management & PIN-Lock API
  - [x] 02-03: Dynamic RBAC Engine & Fine-Grained Permission Middleware

### Phase 3: Product Catalog & Price Management
**Goal**: Implement product catalog management, per-KG rates, price history tracking, and the daily price confirmation workflow.
**Depends on**: Phase 2
**Requirements**: CAT-01, PRICE-01, PRICE-02, PRICE-03
**Success Criteria**:
  1. Admin can create, edit, and toggle active status of packaged flour products with per-KG pricing.
  2. Price modifications are logged automatically in `price_history` with user and timestamp.
  3. First bill of a calendar day triggers the price confirmation prompt (Admin update/keep flow).
  4. Biller price change requests hold the pending bill until Admin review or notify the Admin upon continuing.
**Plans**:
  - [x] 03-01: Product Catalog CRUD, Rate History & Daily Confirmation Workflow
**UI hint**: yes

### Phase 4: Core Billing Engine (Standard Products)
**Goal**: Implement standard product billing logic with dual calculation modes, permission-gated discounts, sequential bill numbering with DB locks, and thermal receipt printing.
**Depends on**: Phase 3
**Requirements**: BILL-01, BILL-02, BILL-03, BILL-04, PRINT-01, PRINT-02
**Success Criteria**:
  1. Biller can generate product bills using either Weight→Amount or Amount→Weight calculation modes in under 15 seconds.
  2. Discounts can only be applied by users with `can_discount` permission, and explicit discount amounts are stored.
  3. Monotonic sequential bill numbers are generated via database locking with zero duplicates under concurrent taps.
  4. Products without set rates trigger a "Rate not set" block and warning.
  5. ESC/POS receipt generation dispatches thermal print payloads, and bills can be reprinted identically.
**Plans**:
  - [x] 04-01: Core Billing Engine, Atomic Monotonic Sequencing, Rate/Discount Guards & Thermal ESC/POS Receipt Payload
**UI hint**: yes

### Phase 5: Gundam Pisai (Grinding) Module
**Goal**: Implement the dedicated Pisai grinding service module with manual pricing, independent 4-digit token sequencing, and large ticket printing.
**Depends on**: Phase 4
**Requirements**: PISAI-01, PISAI-02, PISAI-03, PISAI-04, PISAI-05
**Success Criteria**:
  1. Biller can enter customer name (optional), wheat weight, service type (*Pisai* vs *Safai+Pisai*), and manual fee.
  2. Pisai tickets receive a dedicated, non-resetting 4-digit sequential token number (`0001`–`9999`).
  3. System prints large-format collection tickets for the customer.
  4. Pisai bills integrate with discount rules and credit assignment seamlessly.
**Plans**:
  - [x] 05-01: Gundam Pisai Service Screen, Monotonic 4-Digit Token Sequencing, Thermal Ticket Payload & RBAC Guards
**UI hint**: yes

### Phase 6: Credit (Udhaar) & Ledger Module
**Goal**: Provide Admin-controlled customer credit tracking, profile management, and a unified append-only financial ledger.
**Depends on**: Phase 5
**Requirements**: CRED-01, CRED-02, CRED-03, LEDGER-01
**Success Criteria**:
  1. Authorized users can issue credit bills to new or existing customers.
  2. Customer profile screen displays chronological bills, payments, and live derived balance.
  3. Cash repayments can be logged against outstanding balances in real time.
  4. Every financial event is recorded in the append-only `ledger_entries` table.
**Plans**:
  - [x] 06-01: Customer Credit Profiles, Double-Entry Append-Only Ledger, Cash Repayments & Thermal Slip
**UI hint**: yes

### Phase 7: Expenses, Returns, Reports
**Goal**: Implement expense recording, product returns with ledger offsets, and comprehensive owner reporting dashboards.
**Depends on**: Phase 6
**Requirements**: EXP-01, RET-01, REP-01, REP-02
**Success Criteria**:
  1. Staff can log categorized shop expenses with server-assigned timestamps.
  2. Returns can be processed against original bills or Pisai tokens with offsetting ledger entries.
  3. Admin dashboard renders pre-aggregated cards for sales, grinding, expenses, and credit debt.
  4. Admin can filter reports by date range and search customer credit histories with export options.
**Plans**:
  - [x] 07-01: Shop Expenses, Returns with Ledger Offsets, Owner KPI Aggregates & Ledger Stream CSV
**UI hint**: yes

### Phase 8: Daily Closing, Backup, Bill Void, Audit Log
**Goal**: Implement end-of-day reconciliation with snapshot freezing, automated database backups, Admin voiding with reversal entries, and comprehensive audit trails.
**Depends on**: Phase 7
**Requirements**: CLOSE-01, BACKUP-01, VOID-01, AUDIT-01
**Success Criteria**:
  1. Admin can execute Daily Closing, generating an immutable `daily_closing_records` snapshot and locking the day against backdated edits.
  2. Daily closing automatically triggers a PostgreSQL database backup job.
  3. Admin can void any standard bill or Pisai token, creating linked reversal ledger entries without deleting original records.
  4. Every sensitive modification synchronously writes an immutable row to `activity_log`.
**Plans**: TBD
**UI hint**: yes

### Phase 9: Testing, Polish & Deployment
**Goal**: Execute comprehensive automated tests, validate usability with low-literacy counter staff, optimize mobile performance, and configure production deployment.
**Depends on**: Phase 8
**Requirements**: TEST-01, TEST-02, PERF-01, DEPLOY-01
**Success Criteria**:
  1. Automated test suite passes 100% of test cases for billing calculations, sequence concurrency, and RBAC guards.
  2. Usability testing confirms that counter staff with basic literacy can complete sales and grinding tickets within 15 seconds without assistance.
  3. Mobile UI operates fluidly on counter tablets and phones with sub-second page transitions.
  4. Production environment is fully configured with automated database seeding, process supervisor configs, and operator handover documentation.
**Plans**: TBD
**UI hint**: yes
