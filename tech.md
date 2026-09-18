# tech.md

## Stack
- **Frontend:** Next.js (React, App Router), mobile-first CSS.
- **Backend:** Node.js + Express.js, REST API (JSON).
- **Database:** PostgreSQL. Use parameterized queries / an ORM (e.g. Prisma or Knex) — never string-concatenated SQL, this app handles money.
- **Auth:** Session-based (e.g. `express-session` + PostgreSQL session store), bcrypt for password hashing.
- **Printing:** Thermal printer integration (ESC/POS). Print payloads are generated server-side from the stored bill record so reprints are byte-identical.
- **Fonts:** Jameel Noori Nastaleeq for Urdu product names — load as a web font, ensure it renders correctly on the thermal printer output too (test print, don't assume screen rendering matches print rendering).

## Conventions
- All money values stored as integers (smallest currency unit) or `numeric` in Postgres — never `float`/`double` for currency.
- All sequential numbers (bill numbers, Pisai tokens) generated via a DB sequence or `SELECT ... FOR UPDATE` pattern inside the same transaction as the insert — never computed client-side or via `MAX(id)+1` without locking.
- Every write to a financial table (`bills`, `pisai_bills`, `ledger_entries`, `customer_transactions`, `expenses`, `returns`) must be wrapped in a DB transaction together with its corresponding `activity_log` row where applicable.
- Timestamps: server-generated (`now()` in Postgres), never trust client clocks for anything financial.
- API layer re-checks permissions on every sensitive endpoint — the frontend hiding a button is not a security control.

## Environments
- Single environment target initially (no multi-branch/multi-tenant design needed).
- Requires stable internet at all times — do not build offline queuing, service workers for offline writes, or local-storage-as-source-of-truth patterns.

## Testing Priorities
1. Billing math (weight↔amount, discount calculation) — unit tests with exact decimal expectations.
2. Sequence generation under concurrent requests (even though v1 assumes a single terminal, guard against double-submission/double-click).
3. Permission enforcement — attempt every Admin-only action as a Biller and assert 403.
4. Daily price confirmation state machine (Admin update / keep, Biller update-request / keep).
