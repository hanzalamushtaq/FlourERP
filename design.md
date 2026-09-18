# design.md

## Architecture Overview
Monolithic web app, three-tier:
- **Frontend:** Next.js (React), mobile-first, fully responsive.
- **Backend:** Node.js + Express.js, REST API.
- **Database:** PostgreSQL (relational — billing and ledgers need transactional integrity).
- **Printing:** Thermal printer (ESC/POS-style receipt printing) for bills and Pisai tokens.
- **Hosting:** Online-only; no offline-first architecture, no local sync.

## Key Design Principles
1. **Touch-first, numeric-first UI.** Large cards, minimal free text. Product names render in Urdu (Jameel Noori Nastaleeq font).
2. **Everything permission-gated, nothing role-hardcoded.** Admin defines roles and assigns permissions per feature (e.g., `can_discount`, `can_view_reports`, `can_access_pisai`, `can_void_bill`). UI renders dynamically from the current user's permission set.
3. **Never silently delete financial data.** Voids/reversals/returns are new ledger entries that reference the original transaction, not deletions.
4. **Two independent, never-resetting sequence counters:** standard bill numbers, and Pisai 4-digit tokens. Both are monotonic and continuous across days.
5. **Single active Biller session assumption.** Numbering concurrency is not designed for multiple simultaneous billing terminals in v1.

## Core Modules & Data Flow

### 1. Auth & RBAC
- Users table + Roles table + Permissions table (many-to-many via role_permissions).
- Session-based auth; sessions do not auto-expire during normal use.
- Idle timeout → PIN-lock overlay (does not destroy session) → resume with PIN.
- Password reset is Admin-only, no self-service email/SMS flow.

### 2. Product Catalog & Pricing
- Products table: id, name_en, name_ur, unit_type (KG), is_active, current_price.
- Price_History table: product_id, old_price, new_price, changed_by, changed_at.
- Daily Price Confirmation:
  - Triggered on first print attempt of the day (per calendar day, server-side check).
  - Admin path: Update (edit + save full price list) or Keep Previous (proceed).
  - Biller path: Update → creates a `price_update_request` and **holds the bill** until Admin resolves it → Keep Previous → proceeds immediately, Admin gets an informational notification.
  - Biller can never write to the price table directly — enforced at the API layer, not just UI.

### 3. Standard Product Billing
- Billing screen supports two calculation modes, both writing to the same bill record:
  - Weight → Amount: `total = qty_kg * rate_per_kg`
  - Amount → Weight: `qty_kg = amount / rate_per_kg`
- Discount: biller enters final amount → `discount = subtotal - final_amount`, stored explicitly (never inferred later). Requires `can_discount` permission.
- "Rate not set" guard: if `current_price` is null/0, block bill generation and show the warning instead of allowing a $0 or malformed bill.
- On submit: allocate next sequential `bill_number` (DB sequence, not client-generated), persist bill + line item, send to print queue, write ledger entry.

### 4. Gundam Pisai (Grinding) Billing
- Separate `pisai_bills` table: token_number (own sequence), customer_name (nullable), weight_kg, service_type (`pisai` | `safai_pisai`), amount (manually entered, no rate lookup), discount, credit flag.
- Token number: independent 4-digit sequence, zero-padded, never resets, printed in large font.
- Shares discount/credit logic with standard billing (same permission checks, same ledger writer).

### 5. Bill Lifecycle: Reprint & Void
- Reprint re-renders the stored bill payload to the print queue — never mutates or re-numbers.
- Void/Reverse (Admin-only): creates a `reversal` ledger entry linked to the original bill_id/token_id; original record is retained, flagged `voided = true`.

### 6. Credit (Udhaar) & Ledger
- `customers` table: name, phone, created_by (Admin only).
- `customer_transactions`: purchase entries (linked to bill/pisai bill) and payment entries, both append-only.
- `balance` is a derived/materialized value recalculated after every write to `customer_transactions` — never edited directly.
- `ledger_entries` is the single append-only source of truth for all money movement (sale, credit, payment, expense, return, reversal). Reports are built by querying/aggregating this table, not by re-deriving from multiple sources.

### 7. Expenses & Returns
- `expenses`: name, cost, category, timestamp (server-generated), created_by.
- `returns`: reference to original bill/pisai bill, amount, reason (optional), created_by; writes an offsetting ledger entry.

### 8. Reports & Analytics
- All dashboard summary cards are pre-aggregated queries against `ledger_entries` (today / this month), each with a drill-down route to a filterable detail report (date range for all; name search for credit customers).

### 9. Daily Closing & Backup
- Closing action: locks the day (no further backdated writes), computes and stores a `daily_closing_records` snapshot (totals: sales, Pisai, expenses, credit given), then triggers an automated DB backup job.
- Closing summary shown in-app only — no external notification integration.

### 10. Activity Log
- `activity_log`: actor_id, action_type, entity, before_value, after_value, timestamp.
- Every sensitive mutation (price change, discount, void, user/role change, credit issued, payment logged, password reset) writes one row here, in the same transaction as the business write it's logging — never as a best-effort side call.

## Database Entities (conceptual)
Users · Roles & Permissions · Products · Price History · Bills (Standard) · Pisai Bills · Customers (Credit) · Ledger Entries · Expenses · Returns · Daily Closing Records · Activity Log

## Non-Functional Constraints That Shape the Design
- No offline support → no local queue/sync layer needed; assume live DB connection for every write.
- Single active biller terminal assumption → sequence generation can rely on a simple DB sequence/lock rather than distributed coordination (revisit if multi-terminal is ever added).
- Mobile-first responsive layout, but must remain fully usable on desktop for the Admin.

## Explicitly Deferred / Not to Build
Do not add inventory tracking, supplier/purchase modules, offline sync, multi-branch support, or third-party paid notification integrations unless the SRS is formally revised.
