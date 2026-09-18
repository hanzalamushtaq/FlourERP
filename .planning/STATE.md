# Project State: Flour Mill (Chakki) Billing & Management System

## Project Reference
- **Project**: Flour Mill (Chakki) Billing & Management System
- **Core Value**: Fast, touch-first, mobile-responsive billing & financial management system tailored for a retail flour shop with low-literacy staff, featuring dual-mode product billing, dedicated Gundam Pisai token generation, dynamic RBAC, customer credit tracking, and immutable audit ledgers.
- **Current Focus**: Phase 1: Frontend UI & Dashboard Design (Design System, Biller Touch Screen, Admin Dashboard, Urdu typography, and PIN-lock overlay).

## Current Position
- **Active Milestone**: v1.0 MVP
- **Active Phase**: Phase 1: Frontend UI & Dashboard Design
- **Phase Status**: Ready for planning & design execution
- **Overall Progress**: 0% (0 / 9 Phases completed)

```
[░░░░░░░░░░░░░░░░░░░░] 0%
```

| Phase | Plans Total | Plans Done | Status | Target Completion |
|---|---|---|---|---|
| Phase 1: Frontend UI & Dashboard Design | TBD | 0 | Ready to plan | - |
| Phase 2: Backend Foundation & Core Setup | TBD | 0 | Not started | - |
| Phase 3: Product Catalog & Price Management | TBD | 0 | Not started | - |
| Phase 4: Core Billing Engine (Standard Products) | TBD | 0 | Not started | - |
| Phase 5: Gundam Pisai (Grinding) Module | TBD | 0 | Not started | - |
| Phase 6: Credit (Udhaar) & Ledger Module | TBD | 0 | Not started | - |
| Phase 7: Expenses, Returns, Reports | TBD | 0 | Not started | - |
| Phase 8: Daily Closing, Backup, Bill Void, Audit Log | TBD | 0 | Not started | - |
| Phase 9: Testing, Polish & Deployment | TBD | 0 | Not started | - |

## Key Decisions & Architecture Log
- **UI-First Roadmap Restructuring**: Phase 1 is prioritized as Frontend UI & Dashboard Design to validate low-literacy ergonomics, touch layout, Jameel Noori Nastaleeq Urdu typography, and complete screen workflows before backend and database integration.
- **Monolithic Monorepo Layout**: `apps/web` (Next.js App Router) and `apps/api` (Express.js REST API).
- **Financial Data Integrity**: All financial mutations (bills, pisai tickets, expenses, returns, voids) write to an immutable, append-only `ledger_entries` table inside atomic database transactions. No monetary records are ever deleted.
- **Strict Monetary Types**: All currency fields stored as `numeric` or integers in PostgreSQL—never floating point.
- **Concurrency & Sequence Counters**: Two independent monotonic sequences (standard bills and 4-digit Pisai tokens) managed via PostgreSQL sequences/locks to eliminate race conditions under fast tapping.
- **Dynamic RBAC**: Fine-grained, feature-level permissions (`can_discount`, `can_view_reports`, `can_access_pisai`, `can_void_bill`) assigned to customizable roles. Nothing hardcoded to static roles.
- **Low-Literacy UI**: High-contrast, large touch cards with iconography, on-screen numeric keypad, and Urdu typography (Jameel Noori Nastaleeq font).

## Session Continuity
- **Last Action**: Shifted roadmap to prioritize Phase 1: Frontend UI & Dashboard Design across 9 phases.
- **Next Step**: Run `/gsd-plan-phase 1` to begin Phase 1 planning and build the UI design contract and frontend components.
