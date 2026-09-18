# Flour Mill (Chakki) Billing & Management System

## Product Overview
A web-based, mobile-responsive billing and management system for a retail flour shop that sells packaged flour products and offers a pay-per-visit wheat-grinding (*Gundam Pisai*) service.

## Problem Statement
The shop currently runs billing, credit tracking, and daily accounts manually on paper. This causes calculation errors, lack of historical sales/expense records, zero visibility into who owes credit (*udhaar*), and no owner-level insight into daily or monthly financial performance.

## Core Value Proposition
- Replace paper billing with a fast, touch-first web application usable by staff with minimal literacy and basic mobile familiarity.
- Automate dual-mode price calculations (weight→amount and amount→weight), discounting, and credit tracking with audit trails.
- Provide real-time visibility into sales, expenses, and credit exposure for the Admin (shop owner).
- Maintain an immutable, append-only chronological business ledger for financial integrity.
- Deliver dedicated high-speed ticketing and billing for the Gundam Pisai grinding service.

## Architecture & Tech Stack
- **Architecture**: Monolithic 3-tier web application (`apps/web` frontend, `apps/api` backend).
- **Frontend**: Next.js (React, App Router), mobile-first responsive layout, touch-card interfaces.
- **Typography & Localization**: Jameel Noori Nastaleeq font for Urdu rendering of product names.
- **Backend**: Node.js + Express.js REST API with granular RBAC middleware.
- **Database**: PostgreSQL with transactional integrity, sequential counters with locking, and strict numeric currency types.
- **Hardware & Printing**: Thermal ESC/POS receipt and 4-digit token printing.
- **Connectivity**: Online-only architecture (stable internet connection assumed; no offline sync).

## Target Users & Operational Persona
| Role | Description | Literacy & UX Constraints |
|---|---|---|
| **Admin (Shop Owner)** | Full control over pricing, users, roles, reports, expenses, customer credit, daily closing, and backups. | Basic to moderate literacy; access from desktop and mobile. |
| **Biller (Counter Staff)** | Generates walk-in bills and grinding tokens rapidly. | Low technical literacy; minimal typing/reading; requires large high-contrast cards, icon cues, and numeric keypad input. |

## Core Workflows
1. **Standard Product Billing**: Tap product card → select weight or amount mode → numeric keypad entry → auto-calculate → optional permission-gated discount → optional credit allocation → sequential bill generation → ESC/POS thermal print.
2. **Gundam Pisai Grinding Service**: Rapid customer wheat weighing → service type selection (*Pisai* vs *Safai+Pisai*) → manual price entry → large 4-digit token generation & print.
3. **Credit (Udhaar) & Customer Ledger**: Admin-controlled customer credit approval, transaction linking, balance recalculation, and payment recording.
4. **Dynamic RBAC**: Admin-managed custom roles with granular feature-level permissions (`can_discount`, `can_view_reports`, `can_access_pisai`, `can_void_bill`).
5. **Daily Price Confirmation**: Daily midnight-to-midnight confirmation cycle on first bill print (Admin instant update or Biller update-request hold).
6. **Daily Closing & Automated Backup**: End-of-day summary snapshot lock followed by automated database backup trigger.
7. **Comprehensive Audit Trail**: Synchronous immutable activity logs for all sensitive operations (prices, voids, discounts, permissions, credits).

## Non-Goals (Out of Scope for v1)
- Inventory and stock tracking (raw grain or milled flour quantities).
- Supplier/vendor purchase management.
- Offline mode or distributed local-sync architectures.
- Multi-branch or multi-shop tenant support.
- Paid 3rd-party notification gateways (SMS / WhatsApp Business API).
- Units of measure other than KG (no Maund or Seer conversions).

## Reference Documents
- `project.md`
- `design.md`
- `structure.md`
- `tech.md`
- `Flour_Mill_Billing_System_SRS.pdf` (v1.0, Source of Truth)
