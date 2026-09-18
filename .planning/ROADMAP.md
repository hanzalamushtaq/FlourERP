# Project Roadmap: Flour Mill (Chakki) Billing & Management System

## Phase Summary Checklist
- [ ] **Phase 1: Foundation & Core Setup** - Next.js + Express + PostgreSQL scaffolding, persistent session auth, idle PIN lock, dynamic RBAC engine, and mobile-first UI framework.
- [ ] **Phase 2: Product Catalog & Price Management** - Product catalog CRUD, per-KG price management, daily price confirmation workflow (Admin & Biller paths), and Urdu font rendering.
- [ ] **Phase 3: Core Billing Engine (Standard Products)** - Dual-mode billing screen (weight↔amount), permission-gated discounts, sequential bill numbers, rate guards, and thermal ESC/POS printing.
- [ ] **Phase 4: Gundam Pisai (Grinding) Module** - Dedicated Pisai screen, service options, manual pricing, independent 4-digit token sequence, large-format token print, and credit/discount integration.
- [ ] **Phase 5: Credit (Udhaar) & Ledger Module** - Admin credit issuance, customer profiles with payment history, derived balance tracking, and unified append-only financial ledger.
- [ ] **Phase 6: Expenses, Returns, Reports** - Expense logging, standalone bill returns with ledger offsets, and reports dashboard with date/customer filtering.
- [ ] **Phase 7: Daily Closing, Backup, Bill Void, Audit Log** - End-of-day summary snapshot, automated database backup trigger, bill/Pisai voiding with reversal entries, and synchronous activity logging.
- [ ] **Phase 8: Testing, Polish & Deployment** - End-to-end billing tests, low-literacy staff usability refinements, mobile performance tuning, and production deployment scripts.

---

## Progress Table
| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Core Setup | 0/3 | Not started | - |
| 2. Product Catalog & Price Management | 0/2 | Not started | - |
| 3. Core Billing Engine (Standard Products) | 0/3 | Not started | - |
| 4. Gundam Pisai (Grinding) Module | 0/2 | Not started | - |
| 5. Credit (Udhaar) & Ledger Module | 0/2 | Not started | - |
| 6. Expenses, Returns, Reports | 0/2 | Not started | - |
| 7. Daily Closing, Backup, Bill Void, Audit Log | 0/2 | Not started | - |
| 8. Testing, Polish & Deployment | 0/2 | Not started | - |

---

## Phase Details

### Phase 1: Foundation & Core Setup
**Goal**: Establish the production monorepo architecture, secure session authentication with PIN-lock, dynamic role/permission engine, and touch-first responsive layout.
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, AUTH-01, AUTH-02, RBAC-01, RBAC-02, UI-01
**Success Criteria**:
  1. Developers can run both Next.js frontend and Express backend connected to PostgreSQL with applied migrations.
  2. Users can log in with username/password, remain authenticated across browser tabs, and resume an idle counter screen via numeric PIN without losing session state.
  3. Admin can create custom roles, assign granular permissions, and unprivileged users receive 403 Forbidden when attempting restricted API endpoints.
  4. Counter Billers can navigate the responsive mobile-first shell featuring touch cards and an on-screen numeric keypad.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Product Catalog & Price Management
**Goal**: Allow the Admin to manage products and prices with Urdu typography and enforce the 24-hour daily price confirmation protocol.
**Depends on**: Phase 1
**Requirements**: CAT-01, PRICE-01, PRICE-02, PRICE-03, FONT-01
**Success Criteria**:
  1. Admin can add, update, and deactivate packaged flour products with prices per KG, viewing historical price changes in `price_history`.
  2. Product titles display correctly in Jameel Noori Nastaleeq font across desktop and mobile screens.
  3. On the first print attempt of a new calendar day, Admin is prompted to either update prices or confirm previous rates before proceeding.
  4. If a Biller initiates the daily price confirmation with a change request, the pending bill is placed on hold until Admin approves or rejects it.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Core Billing Engine (Standard Products)
**Goal**: Enable high-speed touch-based product billing with dual calculation modes, permission-checked discounts, monotonic sequential numbering, and thermal receipt printing.
**Depends on**: Phase 2
**Requirements**: BILL-01, BILL-02, BILL-03, BILL-04, PRINT-01, PRINT-02
**Success Criteria**:
  1. Biller can tap a product card and calculate bill lines in under 15 seconds using either Weight→Amount (`qty_kg * rate`) or Amount→Weight (`amount / rate`).
  2. Users with `can_discount` permission can apply custom discount values which are explicitly recorded on the bill.
  3. Bills receive guaranteed monotonic, strictly sequential bill numbers via database locking with zero risk of duplicate numbers under rapid taps.
  4. Products with zero or unconfigured prices display a clear "Rate not set" warning and cannot be billed.
  5. The system dispatches receipt output to the thermal printer and supports exact reprint of any previously issued bill without data alteration.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Gundam Pisai (Grinding) Module
**Goal**: Deliver a dedicated, frictionless Pisai billing workflow with manual rate entry, independent 4-digit token generation, and prominent thermal ticket printing.
**Depends on**: Phase 3
**Requirements**: PISAI-01, PISAI-02, PISAI-03, PISAI-04, PISAI-05
**Success Criteria**:
  1. Biller can complete a Pisai grinding transaction by inputting wheat weight, selecting service type (*Pisai* vs *Safai+Pisai*), and entering the grinding fee.
  2. Every Pisai ticket generates a zero-padded, continuous 4-digit token number (`0001`–`9999`) from a dedicated sequence that never resets.
  3. Thermal printer outputs a specialized collection ticket featuring the large-format 4-digit token number.
  4. Pisai charges support permission-gated discounts and credit customer assignment seamlessly.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Credit (Udhaar) & Ledger Module
**Goal**: Provide Admin-controlled customer credit tracking, profile management, and a unified append-only financial ledger.
**Depends on**: Phase 4
**Requirements**: CRED-01, CRED-02, CRED-03, LEDGER-01
**Success Criteria**:
  1. Admin-authorized users can issue credit during billing by selecting an existing customer or quickly registering a new customer.
  2. Customer profile screen displays chronological purchase bills, repayments, and live materialized outstanding balance.
  3. Counter staff can log cash repayments against customer debt, updating their outstanding balance in real time.
  4. Every financial event (product sales, grinding fees, credit issuance, debt repayments) writes an append-only row to `ledger_entries`.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Expenses, Returns, Reports
**Goal**: Implement shop expense logging, bill returns with automatic ledger offsets, and comprehensive owner reporting dashboards.
**Depends on**: Phase 5
**Requirements**: EXP-01, RET-01, REP-01, REP-02
**Success Criteria**:
  1. Staff can log categorized business expenses (electricity, labor, maintenance) with server-assigned timestamps.
  2. Returns can be processed against original bills or Pisai tokens, writing offsetting entries to the business ledger.
  3. Admin dashboard presents pre-aggregated summary cards reflecting net sales, grinding revenue, expenses, and outstanding customer debt.
  4. Admin can inspect drill-down reports filtered by date range and search credit ledgers by customer name with export options.
**Plans**: TBD
**UI hint**: yes

### Phase 7: Daily Closing, Backup, Bill Void, Audit Log
**Goal**: Implement end-of-day reconciliation with snapshot freezing, automated database backups, Admin voiding with reversal entries, and comprehensive audit trails.
**Depends on**: Phase 6
**Requirements**: CLOSE-01, BACKUP-01, VOID-01, AUDIT-01
**Success Criteria**:
  1. Admin can complete Daily Closing, creating an immutable snapshot (`daily_closing_records`) and locking the day against retrospective changes.
  2. Daily closing confirmation triggers an automated PostgreSQL database backup job without requiring manual server interaction.
  3. Admin can void any standard bill or Pisai token, flagging the record as voided and writing an offsetting reversal entry to `ledger_entries` without destroying historical records.
  4. Every sensitive modification (pricing updates, voids, credit issuance, permission changes) synchronously writes an immutable entry into `activity_log`.
**Plans**: TBD
**UI hint**: yes

### Phase 8: Testing, Polish & Deployment
**Goal**: Execute comprehensive automated tests, validate usability with low-literacy counter staff, optimize mobile performance, and configure production deployment.
**Depends on**: Phase 7
**Requirements**: TEST-01, TEST-02, PERF-01, DEPLOY-01
**Success Criteria**:
  1. Automated test suite passes 100% of test cases for billing math, concurrency safety, and permission guards.
  2. Usability testing confirms that counter staff with basic literacy can complete standard sales and grinding tickets within 15 seconds without assistance.
  3. Mobile UI operates fluidly on counter Android tablets/smartphones with sub-second page transitions and responsive layouts.
  4. Production environment is fully configured with automated database seeding, process supervisor configs, and operator documentation.
**Plans**: TBD
**UI hint**: yes
