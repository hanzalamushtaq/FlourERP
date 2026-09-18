# project.md

## Product Name
Flour Mill (Chakki) Billing & Management System

## One-Line Summary
A web-based, mobile-responsive billing and management system for a retail flour shop that sells packaged flour products and offers a pay-per-visit wheat-grinding (Gundam Pisai) service.

## Problem We're Solving
The shop currently runs billing, credit tracking, and daily accounts manually on paper. This causes calculation errors, no historical sales/expense record, no visibility into who owes credit (udhaar), and no owner-level insight into daily/monthly performance.

## Goals
- Replace paper billing with a fast, touch-first, web-based billing app usable by staff with basic mobile literacy only.
- Automate price calculation, discounting, and credit tracking.
- Give the Admin (shop owner) real-time visibility into sales, expenses, and credit exposure.
- Maintain a permanent, chronological, auditable financial ledger.
- Support a dedicated workflow for the Gundam Pisai (wheat grinding) service, which is priced and billed differently from packaged products.

## Non-Goals (Explicitly Out of Scope)
- Inventory / stock management (no raw material or finished goods tracking).
- Purchase / supplier management.
- Offline mode — the app requires a stable internet connection at all times.
- Multi-shop / multi-branch support — single location only.
- Paid third-party notification APIs (WhatsApp Business API, SMS gateways) — all alerts are in-system only.
- Units other than KG (no Maund/Seer support).

## Target Users
| Role | Description | Technical Literacy |
|---|---|---|
| Admin (Shop Owner) | Full control: pricing, users, roles, reports, expenses, credit, returns, backups. | Basic–moderate |
| Biller (Counter Staff) | Generates bills for walk-in customers and the grinding service only. | Basic — minimal reading/typing |

**Design implication:** Because end users have limited technical literacy, the billing UI must favor large touch cards, icons, and numeric-keypad input over text-heavy forms or nested menus.

## Core Workflows (must-have, in priority order)
1. Standard product billing — tap product card → enter weight or amount → auto-calculate → optional discount → optional credit → print bill.
2. Gundam Pisai billing — weigh customer's wheat → select service type (Pisai / Safai+Pisai) → manually enter charge → print bill with large 4-digit token number.
3. Admin-only credit (udhaar) issuance and customer ledger management.
4. Admin-configurable roles & granular, feature-level permissions (fully dynamic RBAC, not hardcoded Admin/Biller).
5. Daily price confirmation (once per 24h, on first bill of the day) with an Admin-update path and a Biller-request path.
6. Daily closing with automatic backup.
7. Full audit trail of every sensitive action.

## Success Criteria
- A Biller with minimal literacy can complete a standard sale in under ~15 seconds of input.
- No bill can be generated at an unset or stale price without an explicit "keep previous" confirmation.
- Every credit, discount, void, price change, and permission change is attributable to a specific user and timestamp.
- Daily closing triggers a backup with zero manual steps beyond confirming the closing.

## Reference Document
Full requirements: `Flour_Mill_Billing_System_SRS.pdf` (v1.0, Sept 2026) — treat as the source of truth for anything not covered in `design.md`.
