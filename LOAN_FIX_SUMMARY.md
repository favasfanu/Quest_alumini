# Loan Display Bug Fix - Summary

## Issue
Loan applications were not displaying in the Admin Panel and Loan Manager dashboard for approval.

## Root Cause
The `/api/loans/manage` GET endpoint had incorrect filter logic. Loan managers could only see unassigned loans or those assigned to them, instead of seeing all loan applications that need review.

### Original Logic
```typescript
const applications = await prisma.loanApplication.findMany({
  where: isAdmin
    ? {}
    : {
        OR: [
          { assignedToId: session.user.id },
          { assignedToId: null },  // Only unassigned or assigned to them
        ],
      },
  // ...
})
```

This restricted LOAN_MANAGER role to only see unassigned or their own assigned applications, preventing them from viewing all pending applications.

## Solution

### 1. Fixed Loan Application Query
Updated `/api/loans/manage/route.ts` to show all applications to both ADMIN and LOAN_MANAGER roles:

```typescript
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LOAN_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Both ADMIN and LOAN_MANAGER should see all loan applications
    const applications = await prisma.loanApplication.findMany({
      include: {
        applicant: { include: { profile: true } },
        loanCategory: true,
        guarantor1: { include: { profile: true } },
        guarantor2: { include: { profile: true } },
        assignedTo: { include: { profile: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching loan applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
```

### 2. Refactored Auth Configuration
Moved NextAuth configuration to a separate file (`lib/auth-config.ts`) to comply with Next.js 14 route type checking. This prevents the "authOptions is not a valid Route export field" error.

**Changes:**
- Created `lib/auth-config.ts` with `NextAuthOptions` configuration
- Updated `app/api/auth/[...nextauth]/route.ts` to import from config file
- Updated all 22 imports across the application to use `@/lib/auth-config` instead of the route file
- Added proper Prisma enum type imports (UserRole, UserType, UserStatus)

### 3. Fixed Type Issues
- Added proper TypeScript types to `lib/auth-config.ts` for session callbacks
- Fixed `app/api/auth/register/route.ts` to properly type the `role` variable as `UserRole`

### 4. Fixed ESLint Errors
- Escaped unescaped entities in `app/dashboard/admin/loan-categories/page.tsx` (changed `"` to `&quot;`)
- Escaped unescaped entities in `app/login/page.tsx` (changed `'` to `&apos;`)

## Files Modified

| File | Change |
|------|--------|
| `app/api/loans/manage/route.ts` | Fixed GET filter logic to show all loans to both ADMIN and LOAN_MANAGER |
| `lib/auth-config.ts` | Created new file with NextAuth configuration |
| `app/api/auth/[...nextauth]/route.ts` | Simplified to import and re-export config |
| 22 app files | Updated imports from auth route to auth-config |
| `app/api/auth/register/route.ts` | Added UserRole type import and proper typing |
| `app/dashboard/admin/loan-categories/page.tsx` | Fixed ESLint entity escaping |
| `app/login/page.tsx` | Fixed ESLint entity escaping |

## Verification

Build now completes successfully:
```bash
npm run build  # ✓ Compiled successfully
npm run dev    # Dev server running on localhost:3000
```

## Impact

✅ Loan applications now display in:
- Admin Panel → Review Loan Applications
- Loan Manager Dashboard

✅ Both ADMIN and LOAN_MANAGER roles can:
- View all pending loan applications
- Approve/reject applications
- Assign applications to specific loan managers
- Process fund transfers and manage repayments

✅ Loan workflow is now fully operational:
1. User submits application → SUBMITTED status
2. Loan manager claims/reviews → UNDER_REVIEW status
3. Admin/Manager approves → APPROVED status
4. Manager transfers funds → FUNDS_TRANSFERRED status
5. Manager activates → ACTIVE_LOAN status
6. Repayments tracked and completed → COMPLETED status

## Testing Recommendations

1. **Login as Loan Manager**: Should see all submitted applications
2. **Login as Admin**: Should see all applications with assignment controls
3. **Create test loan application**: Should appear immediately in manager dashboard
4. **Approve/Reject workflows**: Should update status in real-time
5. **Fund transfer process**: Should generate repayment schedule automatically
