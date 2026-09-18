# Project State: Flour Mill (Chakki) Billing & Management System

## Project Reference
- **Project**: Flour Mill (Chakki) Billing & Management System
- **Core Value**: Fast, touch-first, mobile-responsive billing & financial management system tailored for a retail flour shop with low-literacy staff, featuring dual-mode product billing, dedicated Gundam Pisai token generation, dynamic RBAC, customer credit tracking, and immutable audit ledgers.
- **Current Focus**: Project initialization complete. Ready to plan Phase 1 (Foundation & Core Setup).

## Current Position
- **Active Milestone**: v1.0 MVP
- **Active Phase**: Phase 1: Foundation & Core Setup
- **Phase Status**: Ready for planning
- **Overall Progress**: 0% (0 / 8 Phases completed)

```
[░░░░░░░░░░░░░░░░░░░░] 0%
```

| Phase | Plans Total | Plans Done | Status | Target Completion |
|---|---|---|---|---|
| Phase 1: Foundation & Core Setup | TBD | 0 | Not started | - |
| Phase 2: Product Catalog & Price Management | TBD | 0 | Not started | - |
| Phase 3: Core Billing Engine (Standard Products) | TBD | 0 | Not started | - |
| Phase 4: Gundam Pisai (Grinding) Module | TBD | 0 | Not started | - |
| Phase 5: Credit (Udhaar) & Ledger Module | TBD | 0 | Not started | - |
| Phase 6: Expenses, Returns, Reports | TBD | 0 | Not started | - |
| Phase 7: Daily Closing, Backup, Bill Void, Audit Log | TBD | 0 | Not started | - |
| Phase 8: Testing, Polish & Deployment | TBD | 0 | Not started | - |

## Key Decisions & Architecture Log
- **Monolithic Monorepo Layout**: `apps/web` (Next.js App Router) and `apps/api` (Express.js REST API) sharing PostgreSQL database.
- **Financial Data Integrity**: All financial mutations (bills, pisai tickets, expenses, returns, voids) write to an immutable, append-only `ledger_entries` table inside atomic database transactions. No monetary records are ever deleted.
- **Strict Monetary Types**: All currency fields stored as `numeric` or integers in PostgreSQL—never floating point.
- **Concurrency & Sequence Counters**: Two independent monotonic sequences (standard bills and 4-digit Pisai tokens) managed via PostgreSQL sequences/locks to eliminate race conditions under fast tapping.
- **Dynamic RBAC**: Fine-grained, feature-level permissions (`can_discount`, `can_view_reports`, `can_access_pisai`, `can_void_bill`) assigned to customizable roles. Nothing hardcoded to static roles.
- **Low-Literacy UI**: High-contrast, large touch cards with iconography, on-screen numeric keypad, and Urdu typography (Jameel Noori Nastaleeq font).

## Session Continuity
- **Last Action**: Created `.planning` context, project definition, requirements breakdown, 8-phase roadmap, and initial state tracking.
- **Next Step**: Run `/gsd-plan-phase 1` to create detailed execution plans for Phase 1 (Foundation & Core Setup).
