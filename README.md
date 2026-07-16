# AssetFlow: Enterprise Asset & Resource Management System

AssetFlow is a comprehensive web application designed to manage the entire lifecycle of physical assets within an organization. It tracks inventory, allocations, maintenance, audit cycles, and resource bookings with strict role-based access controls.

## Architecture Overview

AssetFlow is built on a modern, robust stack tailored for enterprise applications:
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database / ORM**: PostgreSQL via Supabase, accessed via Prisma ORM
- **Authentication**: Supabase Auth (SSR Cookies)
- **Styling & UI**: Tailwind CSS, shadcn/ui, Recharts
- **Forms & Validation**: React Hook Form, Zod

### Core Domain Rules
- **Allocations**: Prevent double-allocations with conflict detection. Offers a transfer workflow.
- **Bookings**: Transactional overlap detection guarantees resources are never double-booked.
- **Maintenance**: Asset status dynamically gates usage. Approval transitions assets to `UNDER_MAINTENANCE`.
- **Audits**: Atomic closure of audit cycles transitions missing items to `LOST`.

## Folder Structure

```
assetflow/
├── actions/             # Next.js Server Actions (Auth/Validation boundary)
├── app/                 # App Router (Pages, Layouts, Loading Skeletons)
├── components/          # Shared UI Components (shadcn/ui, layouts)
├── features/            # Domain-specific components (e.g., booking, allocation)
├── hooks/               # Shared React Hooks
├── lib/                 # Utilities (Prisma Client, Auth Helpers, Classnames)
├── prisma/              # Schema definition, Migrations, Seed script
├── services/            # Pure Business Logic (Transactional boundaries, tested)
└── types/               # TypeScript Definitions
```

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Allocation : "has many"
    User ||--o{ Booking : "makes"
    User ||--o{ MaintenanceRequest : "raises"
    Department ||--o{ User : "contains"
    Department ||--o{ Asset : "owns"
    AssetCategory ||--o{ Asset : "categorizes"
    Asset ||--o{ Allocation : "has history"
    Asset ||--o{ Booking : "has"
    Asset ||--o{ MaintenanceRequest : "requires"
    Asset ||--o{ AuditItem : "is audited in"
    AuditCycle ||--o{ AuditItem : "contains"
```

## Installation & Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   Create a `.env` file at the root (refer to `.env.example` if available) and provide your Supabase PostgreSQL connection strings and Auth keys:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```
4. **Database Migrations**:
   ```bash
   npx prisma migrate dev
   ```
5. **Seed the Database** (⚠️ Wipes existing data and populates demo data):
   ```bash
   npm run db:seed
   ```
6. **Start the Development Server**:
   ```bash
   npm run dev
   ```

## Demo Credentials

The `npm run db:seed` script generates a realistic organization hierarchy. Ensure you create these users with matching emails and a simple password in your Supabase Auth dashboard to log in:

| Role | Email |
| :--- | :--- |
| **Admin** | `admin@assetflow.app` |
| **Asset Manager** | `mgr1@assetflow.app` |
| **Department Head** | `head.eng@assetflow.app` |
| **Employee** | `emp1@assetflow.app` |

## Known Limitations & Roadmap (Hackathon Scope)
- **Demo Mode (Email Confirmation)**: If running this for a live demo without reliable email delivery, Supabase Dashboard → Authentication → Providers → Email → "Confirm email" can be disabled for demo purposes only. This trade-off must be re-enabled before any real deployment. Do not disable it in code/config — this is an infra-level decision made per-environment, and leaving it undocumented risks someone shipping with confirmation off in production. Note that `npm run db:seed` explicitly bypasses confirmation for seeded accounts.
- **Notifications & Timers**: Overdue returns and upcoming booking reminders are currently computed "on-read" during dashboard/UI renders rather than via a background cron scheduler.
- **Auditor Assignment**: In the UI, Audit Cycle creation currently assigns all selected assets to a single auditor for simplicity, though the schema supports granular per-item assignments.
