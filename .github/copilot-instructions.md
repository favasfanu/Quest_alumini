# AI Agent Instructions for Quest Foundation

## Project Overview
Quest Foundation is a **production-ready Next.js 14 alumni platform** featuring user management (3 types: Alumni, Staff, Non-Alumni), role-based access control, profile management with privacy controls, digital membership cards with QR codes, and a comprehensive internal loan system (Quest Care) with guarantor eligibility and audit trails.

## Architecture

### Three-Layer Stack
- **Frontend**: Next.js 14 App Router (server-side rendering by default), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (all in `app/api/`), NextAuth.js for JWT-based authentication
- **Database**: PostgreSQL via Prisma ORM with comprehensive schema in [prisma/schema.prisma](../quest-foundation/prisma/schema.prisma)

### Core Data Model
- **User**: Base user with email, password_hash (bcrypt), userType (ALUMNI/STAFF/NON_ALUMNI), role (ADMIN/ALUMNI_MEMBER/QUEST_STAFF/NON_ALUMNI_MEMBER/LOAN_MANAGER), status (PENDING/APPROVED/REJECTED/DISABLED)
- **Profile**: One-to-one with User; includes education_records and job_experiences (one-to-many)
- **ProfilePrivacySettings**: Controls visibility of family_details, education, job_history, current_job, contact_details
- **LoanApplication**: Workflow states: SUBMITTED → UNDER_REVIEW → APPROVED → FUNDS_TRANSFERRED → ACTIVE_LOAN → COMPLETED
- **MembershipCard**: Auto-generated with card_number, qr_code_url, status, downloaded_count
- **AuditLog**: Tracks all actions with userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent

## Key Workflows

### Authentication & Authorization
- Use `getServerSession(authOptions)` in server components to check auth; `redirect('/login')` if missing
- NextAuth config in `app/api/auth/[...nextauth]/route.ts` uses bcrypt password verification
- RBAC enforced: query user.role and user.status before operations
- Audit log all sensitive actions via `createAuditLog()`

### Loan Management (Critical Workflow)
1. User selects category → EMI calculated via [lib/loan-calculator.ts](../quest-foundation/lib/loan-calculator.ts)
2. Select 2 guarantors (eligibility checked: active_loan_count < max_limit)
3. POST `/api/loans/applications` creates LoanApplication with SUBMITTED status + audit entry
4. Loan Manager reviews dashboard → approve/reject → updates status
5. Status APPROVED triggers fund transfer logic, then transitions to ACTIVE_LOAN

### Membership Card Generation
- Triggered on user approval (status → APPROVED)
- Generate unique card_number, create QR code URL via `qrcode` library
- Store qr_code_url in database; expose public QR endpoint for scanning
- Download as PNG via `html-to-image`

### Privacy Controls
- Profile visibility varies by user type and privacy_settings
- Non-alumni users see only contact_details and current_job (default)
- Enforce privacy checks in `/api/profile` routes before returning data

## Development Patterns

### API Route Pattern
```typescript
// Always at route.ts top level:
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })
  
  // Check role/status authorization
  if (session.user.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 })
  }
  
  // Use prisma for DB queries
  const data = await prisma.user.findUnique({...})
  
  // Log critical actions
  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entityType: 'USER',
    entityId: userId,
    newValues: { /* changed fields */ }
  })
  
  return Response.json(data)
}
```

### UI Component Conventions
- Use Shadcn UI components from `components/ui/` (button, card, input, label, badge)
- DashboardNav in `components/dashboard/DashboardNav.tsx` handles auth-based navigation
- Tailwind utility-first; responsive classes for mobile-first design
- Server components by default; 'use client' only for forms/interactivity

### Password Handling
- Hash with `hashPassword()` from [lib/auth.ts](../quest-foundation/lib/auth.ts)
- Verify with `verifyPassword()`; never store plain text
- User creation sets status to PENDING requiring admin approval

## Build & Deploy

### Commands
- `npm run dev`: Start Next.js dev server (localhost:3000)
- `npm run build`: Build optimized production bundle
- `npm run prisma:migrate`: Run pending database migrations
- `npm run prisma:generate`: Regenerate Prisma Client after schema changes
- `npm run prisma:studio`: Open web UI for database inspection/editing

### Environment Setup
Set `.env` with:
```
DATABASE_URL="postgresql://user:password@localhost:5432/quest_foundation?schema=public"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```

## Critical Conventions

1. **Always check user status & role** before data access (user.status === 'APPROVED' AND user.role in ['ADMIN', 'LOAN_MANAGER'])
2. **Audit log on mutations**: Every create/update/delete should call `createAuditLog()`
3. **Validate loan eligibility**: Check guarantor active_loan_count, user.isLoanEligible flag
4. **Privacy-aware queries**: Filter profile data based on privacy_settings and user.userType
5. **Use Prisma transactions** for multi-step workflows (loan approval cascading to status changes)
6. **Timestamps**: Rely on `@default(now())` and `@updatedAt` in schema; never hardcode dates
7. **Session data**: Access via `session.user.id`, `session.user.role`, `session.user.email`

## Key Files to Reference
- Schema & migrations: [prisma/schema.prisma](../quest-foundation/prisma/schema.prisma)
- Auth setup: `app/api/auth/[...nextauth]/route.ts` (NextAuth config)
- Audit logging: [lib/audit.ts](../quest-foundation/lib/audit.ts)
- Loan calculations: [lib/loan-calculator.ts](../quest-foundation/lib/loan-calculator.ts)
- Dashboard layout (auth guard): [app/dashboard/layout.tsx](../quest-foundation/app/dashboard/layout.tsx)
- Seed data: [prisma/seed.ts](../quest-foundation/prisma/seed.ts) (test data generation)

## Known Patterns
- **No external APIs initially**, but structure permits WhatsApp/LinkedIn/email integrations in member directory
- **QR scanning** redirects to `/member/[id]` (public profile, privacy-filtered)
- **Loan manager role** sees ALL applications (no assignment filtering); applicants see only their own (role-based filtering in queries)
- **Card downloads** increment downloaded_count; useful for tracking engagement

## Important Notes

### Auth Configuration
- NextAuth options moved to `lib/auth-config.ts` (separate from route handler) to comply with Next.js 14 type checking
- All files import authOptions from `@/lib/auth-config` not the route file
- Do NOT export non-handler symbols from route.ts files

### Loan Manager Access
- Both ADMIN and LOAN_MANAGER roles have identical query permissions for `/api/loans/manage`
- No assignment-based filtering; managers can claim unassigned applications
- The assignment system is for workload distribution only, not access control
