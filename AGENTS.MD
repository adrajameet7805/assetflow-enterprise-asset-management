# AssetFlow — Project Rules (read this before every task)

## Mission
Enterprise Asset & Resource Management System. Not industry-specific — any org with
equipment/furniture/vehicles/rooms. Core scope only: asset lifecycle, allocation,
booking, maintenance approval, audit cycles, dashboards. NEVER add purchasing,
invoicing, or accounting features — explicitly out of scope.

## Stack (do not substitute)
- Next.js 15 (App Router), React 19, TypeScript strict mode
- Tailwind CSS + shadcn/ui, Framer Motion for transitions only (not core logic)
- React Hook Form + Zod for every form (client AND server-side re-validation)
- TanStack Table for all data tables (server-side pagination)
- Recharts for all charts
- Prisma ORM + PostgreSQL via Supabase
- Supabase Auth for authentication + session handling
- Sonner for toasts, Lucide React for icons
- Deploy target: Vercel

## Folder structure
app/                 → routes only, thin pages, no business logic in page.tsx
components/          → shared/dumb UI components
features/<module>/   → components, hooks, schemas, server actions per module
  e.g. features/allocation/, features/booking/, features/maintenance/, features/audit/
services/            → pure business-logic functions (conflict checks, overlap checks) — unit-testable, no framework imports
actions/             → Next.js server actions, call services/, handle auth+validation
hooks/               → shared client hooks
types/               → shared TS types + Zod-inferred types
prisma/              → schema.prisma, migrations/, seed.ts
lib/                 → supabase client, auth helpers, utils
middleware.ts        → route protection + role gating

## Non-negotiable rules
1. No placeholder logic. If a rule is described below, implement it exactly — do not stub it with `// TODO`.
2. Every mutation (allocate, book, approve, close cycle) must be a server action or route handler that re-validates on the server, even if the client already checked. Never trust client-only validation for conflict/overlap rules.
3. Every state transition must go through one central function per module (e.g. `transitionAssetStatus()`), never set `.status = X` ad hoc in multiple places. This is what keeps the lifecycle consistent.
4. Signup NEVER lets a user pick a role. Every signup = Employee. Role escalation happens ONLY through Admin → Employee Directory → Promote action. Enforce this server-side, not just hidden in the UI.
5. RBAC is enforced in middleware.ts AND re-checked inside every server action. UI hiding a button is not access control.
6. Every destructive/status-changing action writes an ActivityLog row in the same transaction.

## Roles & permissions (enforce exactly)
| Action                                   | Admin | Asset Manager | Dept Head | Employee |
|-------------------------------------------|:---:|:---:|:---:|:---:|
| Manage departments/categories/audit cycles | ✅ | ❌ | ❌ | ❌ |
| Promote employee to Dept Head/Asset Mgr   | ✅ | ❌ | ❌ | ❌ |
| View org-wide analytics                    | ✅ | ✅ | dept-scoped | ❌ |
| Register/allocate assets                   | ✅ | ✅ | ❌ | ❌ |
| Approve transfers/maintenance/discrepancies| ✅ | ✅ | dept-scoped | ❌ |
| Approve returns + condition check-in       | ✅ | ✅ | ❌ | ❌ |
| View assets allocated to their dept        | ✅ | ✅ | ✅ | ❌ |
| View assets allocated to self               | ✅ | ✅ | ✅ | ✅ |
| Book shared resources                      | ✅ | ✅ | ✅ | ✅ |
| Raise maintenance request                  | ✅ | ✅ | ✅ | ✅ |
| Initiate return/transfer request           | ✅ | ✅ | ✅ | ✅ |

## Domain enums (use these exact values across schema, UI, and logic)
- AssetStatus: AVAILABLE, ALLOCATED, RESERVED, UNDER_MAINTENANCE, LOST, RETIRED, DISPOSED
- AllocationTransferStatus: REQUESTED, APPROVED, REALLOCATED
- BookingStatus: UPCOMING, ONGOING, COMPLETED, CANCELLED
- MaintenanceStatus: PENDING, APPROVED, REJECTED, TECHNICIAN_ASSIGNED, IN_PROGRESS, RESOLVED
- AuditItemStatus: VERIFIED, MISSING, DAMAGED
- UserRole: ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE

## Core business rules (must be implemented exactly as written)
- ALLOCATION CONFLICT: an asset with an active allocation cannot be allocated again.
  Attempting it must be blocked, show "currently held by <name>", and offer a
  "Request Transfer" action instead of a hard failure.
- BOOKING OVERLAP: two bookings on the same resource cannot overlap. A booking ending
  exactly when another starts is NOT an overlap (back-to-back is allowed). Overlap
  check must be done server-side against all UPCOMING/ONGOING bookings for that resource.
- MAINTENANCE GATE: asset status only flips to UNDER_MAINTENANCE when a maintenance
  request is APPROVED (not on raise). It flips back to AVAILABLE only on RESOLVED.
- OVERDUE DETECTION: allocations past Expected Return Date and bookings/maintenance
  past due are computed, not manually flagged — surfaced on Dashboard + Notifications.
- AUDIT CLOSE: closing an audit cycle is irreversible in the UI (locks the cycle) and
  auto-updates asset status to LOST for any item marked MISSING and confirmed.

## Testing requirement
Every function in services/ (conflict detection, overlap validation, state transitions)
must have unit tests. No exceptions — these are the functions a hackathon demo will be
judged on.