# Quest Foundation - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │      │
│  │   Browser    │  │   Browser    │  │   Browser    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTPS / Next.js App
                              │
┌─────────────────────────────────────────────────────────────┐
│              Next.js 14 Application (Vercel)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              App Router (Server Components)           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Pages    │  │    API     │  │   Server   │     │   │
│  │  │ Components │  │   Routes   │  │   Actions  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware & Auth Layer                  │   │
│  │         (NextAuth.js, JWT, RBAC)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    Prisma ORM (Type-safe queries)
                              │
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Profiles │  │  Loans   │  │  Audit   │   │
│  │  & Auth  │  │ & Privacy│  │ System   │  │   Logs   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    External Services
                              │
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ File Storage │  │   QR Code    │  │   WhatsApp   │     │
│  │  (Optional)  │  │  Generation  │  │   LinkedIn   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### User Registration Flow

```
User → Registration Form → API /auth/register
                              ↓
                         Validate Input
                              ↓
                         Hash Password
                              ↓
                    Create User (status: PENDING)
                              ↓
                    Create Profile + Privacy Settings
                              ↓
                         Return Success
                              ↓
User ← "Pending Approval" ← Response
```

### Login & Authentication Flow

```
User → Login Form → API /auth/[...nextauth]
                         ↓
                   Verify Credentials
                         ↓
                   Check User Status
                         ↓
                   Generate JWT Token
                         ↓
                   Set Session Cookie
                         ↓
User ← Dashboard ← Authenticated Session
```

### Loan Application Flow

```
User → Select Category → Calculate Loan → Select Guarantors
                              ↓
                       Validate Eligibility
                              ↓
                    Check Guarantor Limits
                              ↓
                    Create Loan Application
                         (status: SUBMITTED)
                              ↓
                       Create Audit Log
                              ↓
User ← Confirmation ← API Response

                              ↓
Loan Manager → Review Application → Approve/Reject
                              ↓
                       Update Status
                              ↓
                    Update Audit Log
                              ↓
Applicant ← Notification (Email/System)
```

### Membership Card Generation Flow

```
Approved User → Request Card → Check Eligibility
                                    ↓
                            Generate Card Number
                                    ↓
                            Create QR Code URL
                                    ↓
                            Generate QR Image
                                    ↓
                         Store in Database
                                    ↓
User ← Display Card ← Return Card Data
         ↓
    Download PNG
         ↓
    Scan QR Code → Public Profile Page
```

## Database Entity Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                         Core Entities                         │
└──────────────────────────────────────────────────────────────┘

    User (1) ──────────────── (1) Profile
     │                              │
     │                              │
     │                              ├──── (1) ProfilePrivacySettings
     │                              │
     │                              ├──── (1) ContactDetails
     │                              │
     │                              ├──── (N) EducationRecord
     │                              │
     │                              └──── (N) JobExperience
     │
     │
     ├──── (1) MembershipCard
     │
     │
     ├──── (N) LoanApplication (as applicant)
     │         │
     │         ├──── (1) LoanCategory
     │         │
     │         ├──── (1) User (as guarantor1)
     │         │
     │         ├──── (1) User (as guarantor2)
     │         │
     │         └──── (N) LoanRepayment
     │
     │
     └──── (N) AuditLog


┌──────────────────────────────────────────────────────────────┐
│                      Approval Hierarchy                       │
└──────────────────────────────────────────────────────────────┘

    Admin (User with role=ADMIN)
       │
       ├──── Approves/Rejects ──→ User (status: PENDING → APPROVED)
       │
       ├──── Creates ──→ LoanCategory
       │
       ├──── Assigns ──→ User (role: LOAN_MANAGER)
       │
       └──── Manages ──→ MembershipCard (enable/disable)


    Loan Manager (User with role=LOAN_MANAGER)
       │
       ├──── Reviews ──→ LoanApplication (SUBMITTED → UNDER_REVIEW)
       │
       ├──── Approves/Rejects ──→ LoanApplication (APPROVED/REJECTED)
       │
       ├──── Marks ──→ LoanApplication (FUNDS_TRANSFERRED)
       │
       └──── Completes ──→ LoanApplication (COMPLETED)
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Layer                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              NextAuth.js Middleware                │    │
│  │  • JWT token validation                            │    │
│  │  • Session management                              │    │
│  │  • Credential verification                         │    │
│  └────────────────────────────────────────────────────┘    │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Role-Based Access Control (RBAC)           │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │    Admin     │  │Loan Manager  │               │    │
│  │  │  All Access  │  │ Loan Review  │               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │   Alumni     │  │ Non-Alumni   │               │    │
│  │  │ Full Access  │  │Limited Access│               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  └────────────────────────────────────────────────────┘    │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Privacy-Aware Data Filtering             │    │
│  │  • Check user role                                 │    │
│  │  • Apply privacy settings                          │    │
│  │  • Filter restricted data                          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Privacy Model

```
┌─────────────────────────────────────────────────────────────┐
│              Privacy Settings per Profile                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  familyDetailsVisible:     false (default)         │    │
│  │  educationVisible:         false (default)         │    │
│  │  jobHistoryVisible:        false (default)         │    │
│  │  currentJobVisible:        true (default)          │    │
│  │  contactDetailsVisible:    true (default)          │    │
│  └────────────────────────────────────────────────────┘    │
│                        ↓                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Viewer Role Check                       │    │
│  │                                                    │    │
│  │  Admin        → See All (override privacy)         │    │
│  │  Alumni       → See based on privacy settings      │    │
│  │  Staff        → See based on privacy settings      │    │
│  │  Non-Alumni   → See only public data (no override) │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Password Security

```
Registration:
  User Password → bcrypt.hash(password, 12) → Hashed Password → Database

Login:
  User Password → bcrypt.compare(password, hashedPassword) → Boolean → JWT Token
```

### Audit Trail

```
Every Critical Action:
  Action → Capture {
    userId
    action (e.g., "APPROVE_USER", "SUBMIT_LOAN")
    entityType (e.g., "User", "LoanApplication")
    entityId
    oldValues (JSON)
    newValues (JSON)
    ipAddress
    userAgent
    timestamp
  } → AuditLog Table
```

## API Architecture

### REST API Patterns

```
/api/auth/*                 - Authentication endpoints
  POST /register           - User registration
  POST /[...nextauth]      - NextAuth handlers (login, logout, session)

/api/profile/*             - Profile management
  GET  /                   - Get current user profile
  PATCH /                  - Update profile
  PATCH /privacy           - Update privacy settings

/api/admin/*               - Admin operations (role: ADMIN only)
  GET  /users              - List all users
  PATCH /users             - Update user (approve, reject, enable, disable)

/api/members/*             - Member directory
  GET  /                   - Search members (privacy-filtered)

/api/membership-card/*     - Membership card
  GET  /                   - Get/generate card
  POST /                   - Regenerate QR

/api/loans/categories/*    - Loan category management
  GET  /                   - List categories (admin only)
  POST /                   - Create category (admin only)
  PATCH /                  - Update category (admin only)
  GET  /public             - List enabled categories (all users)

/api/loans/applications/*  - Loan applications
  GET  /                   - List user's applications
  POST /                   - Submit new application

/api/loans/manage/*        - Loan management (loan manager only)
  GET  /                   - List all applications
  PATCH /                  - Update application status

/api/loans/eligible-guarantors/*
  GET  /                   - List eligible guarantors
```

## Performance Considerations

### Database Optimization

```
Indexes:
  - users.email (unique)
  - users.status
  - profiles.alumniId (unique)
  - profiles.batchYear
  - jobExperiences.currentlyWorking
  - loanApplications.status
  - loanApplications.applicantId
  - auditLogs.timestamp
  - auditLogs.entityType + entityId (composite)

Connection Pooling:
  - Prisma connection pool size: 10 (default)
  - Consider PgBouncer for production
```

### Caching Strategy

```
Server Components:
  - Automatic React Server Component caching
  - Page-level caching for public profiles

API Routes:
  - No caching for user-specific data
  - Consider Redis for session storage (optional)

Static Assets:
  - Membership card images → CDN
  - Profile photos → CDN
  - QR codes → Data URL (embedded in HTML)
```

### Mobile Optimization

```
CSS:
  - Mobile-first responsive design
  - Tailwind breakpoints: sm (640px), md (768px), lg (1024px)
  - Touch-friendly buttons (min 44x44px)

Images:
  - Next.js Image component (automatic optimization)
  - Lazy loading for member directory
  - WebP format with fallback

Data Loading:
  - Pagination for large lists
  - Lazy loading for search results
  - Progressive enhancement
```

## Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel Edge                          │
│  • Global CDN                                                │
│  • Automatic HTTPS                                           │
│  • Edge Functions                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  • Server-Side Rendering                                     │
│  • API Routes                                                │
│  • Static Generation                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  • Neon / Supabase / AWS RDS                                │
│  • Automatic backups                                         │
│  • Connection pooling                                        │
└─────────────────────────────────────────────────────────────┘
```

### Monitoring & Logging

```
Application Monitoring:
  - Vercel Analytics (built-in)
  - Error tracking: Sentry (optional)
  - Performance: Vercel Speed Insights

Database Monitoring:
  - Database provider dashboard
  - Query performance logs
  - Connection pool metrics

Audit Logs:
  - All critical actions logged to database
  - Queryable by admin
  - Includes IP address and user agent
```

## Scalability Considerations

### Current Capacity

```
Database:
  - Single PostgreSQL instance
  - Handles ~10,000 users comfortably
  - Connection limit: 20-100 (plan dependent)

Application:
  - Serverless (auto-scales)
  - No connection limits
  - Cold start: ~200ms

Storage:
  - Profile photos: Local/CDN
  - QR codes: Generated on-demand
```

### Scaling Path

```
Phase 1 (0-1,000 users):
  - Basic tier database
  - Vercel free tier
  - No additional optimization needed

Phase 2 (1,000-10,000 users):
  - Upgrade database tier
  - Add connection pooling (PgBouncer)
  - Vercel Pro tier
  - Add CDN for images

Phase 3 (10,000+ users):
  - Read replicas for database
  - Redis cache for sessions
  - Advanced CDN configuration
  - Consider microservices for loan system
```

---

This architecture is designed to be simple, secure, and scalable while meeting all the requirements of the Quest Foundation platform.
