# structure.md

## Suggested Repo Layout

```
/
├── apps/
│   ├── web/                     # Next.js frontend
│   │   ├── app/
│   │   │   ├── (admin)/         # Admin-only routes (dashboard, reports, prices, roles, etc.)
│   │   │   ├── (biller)/        # Biller dashboard + billing screens
│   │   │   ├── login/
│   │   │   └── lock/            # PIN-lock overlay route
│   │   ├── components/
│   │   │   ├── billing/         # Product billing screen, Pisai billing screen
│   │   │   ├── cards/           # Touch product cards, dashboard summary cards
│   │   │   └── ui/              # Shared primitives (buttons, numeric keypad, etc.)
│   │   └── lib/
│   └── api/                     # Express backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── products.ts
│       │   │   ├── prices.ts
│       │   │   ├── bills.ts
│       │   │   ├── pisai.ts
│       │   │   ├── credit.ts
│       │   │   ├── expenses.ts
│       │   │   ├── returns.ts
│       │   │   ├── reports.ts
│       │   │   ├── closing.ts
│       │   │   └── activityLog.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── permissions.ts   # single source of truth for permission checks
│       │   ├── services/
│       │   │   ├── billingService.ts
│       │   │   ├── ledgerService.ts
│       │   │   ├── pricingService.ts
│       │   │   └── printService.ts
│       │   └── db/
│       │       ├── migrations/
│       │       └── seed/
│       └── tests/
├── project.md
├── design.md
├── tech.md
├── structure.md
└── AGENTS.md
```

## Naming Conventions
- Tables: snake_case, plural (`bills`, `pisai_bills`, `ledger_entries`).
- API routes: `/api/<resource>` REST-style, permission-checked per route, not per controller-wide.
- React components: PascalCase; billing-screen components suffixed `Screen` (e.g. `ProductBillingScreen`, `PisaiBillingScreen`).

## Where New Work Goes
- New product/service type → `apps/web/components/cards/` + `products` table, no schema change needed (catalog is data-driven per the SRS, not hardcoded).
- New report → `apps/api/src/routes/reports.ts` (query) + a corresponding drill-down page under `(admin)`.
- New permission → add to the permissions seed list + gate both the UI element and the API route with it.
