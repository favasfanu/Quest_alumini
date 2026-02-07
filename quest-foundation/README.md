# Quest Foundation - Alumni Platform

A complete, production-ready, mobile-friendly web platform for managing alumni, staff, non-alumni members, and an internal welfare loan system (Quest Care) with digital membership cards.

## Features

### User Management
- **Three User Types**: MARKHINS Alumni, Quest Staff, Non-Alumni Members
- **Role-Based Access Control**: Admin, Alumni Member, Quest Staff, Non-Alumni Member, Loan Manager
- **Admin Approval**: Mandatory approval for all new registrations
- **User Status**: Pending, Approved, Rejected, Disabled

### Profile Management
- Comprehensive profile with education, work experience, family details
- Profile photo upload with cloud storage (Cloudinary) support
- Multiple education records and job experiences
- Privacy controls for each profile section
- Non-alumni users have restricted visibility

### Digital Membership Card
- Auto-generated digital membership cards for approved alumni and staff
- QR code generation for public profile access
- Downloadable as PNG image
- Mobile-optimized and printable
- Admin controls for card management

### Quest Care Loan System
- Admin-managed loan categories with configurable terms
- Auto-calculation of EMI, interest, and total payable
- Two guarantor requirement with eligibility checks
- Loan status workflow: Submitted → Under Review → Approved → Funds Transferred → Active → Completed
- Guarantor active loan limits
- Loan manager dashboard for approval and tracking
- Full audit trail for all loan actions

### Members Directory
- Privacy-aware search and filtering
- Search by name, batch, department, company, location
- Non-alumni see limited information only
- External contact via WhatsApp, LinkedIn, Email, Instagram
- Mobile-responsive card layout

### Security & Audit
- JWT-based authentication with NextAuth.js
- Password hashing with bcrypt
- Comprehensive audit logging for all critical actions
- IP address and user agent tracking
- Role-based API authorization

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **QR Generation**: qrcode library
- **Image Generation**: html-to-image

## Getting Started

### Prerequisites

- Node.js 18+ (Note: create-next-app requires Node.js 20.9.0+, but the app will run on 18+)
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository and navigate to the project:
```bash
cd quest-foundation
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/quest_foundation?schema=public"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (optional for local, required for production)
# Leave empty for local development (uses file system)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

**Note**: For production deployments, you must configure Cloudinary for profile photo uploads. See [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) for complete instructions.

4. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to manage data
npm run prisma:studio
```

5. Create the first admin user:
You'll need to manually set the first admin in the database:
```sql
-- After registering through the UI, update the user:
UPDATE "User" SET status = 'APPROVED', role = 'ADMIN' WHERE email = 'admin@example.com';
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
quest-foundation/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── admin/             # Admin management
│   │   ├── profile/           # Profile management
│   │   ├── loans/             # Loan system
│   │   ├── members/           # Member directory
│   │   └── membership-card/   # Membership cards
│   ├── dashboard/             # Protected dashboard pages
│   │   ├── admin/            # Admin panel
│   │   ├── loans/            # Loan application
│   │   ├── loan-manager/     # Loan management
│   │   ├── members/          # Member directory
│   │   └── membership-card/  # Digital card
│   ├── member/[id]/          # Public member profile
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Reusable UI components
│   └── dashboard/            # Dashboard components
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # Auth utilities
│   ├── utils.ts              # Helper functions
│   ├── loan-calculator.ts    # Loan calculations
│   └── audit.ts              # Audit logging
├── prisma/
│   └── schema.prisma         # Database schema
└── types/
    └── next-auth.d.ts        # NextAuth type definitions
```

## Database Schema

See `DATABASE_SCHEMA.md` for detailed schema documentation.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Admin
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users` - Update user (approve, reject, enable, disable, loan eligibility)

### Profile
- `GET /api/profile` - Get current user profile
- `PATCH /api/profile` - Update profile
- `PATCH /api/profile/privacy` - Update privacy settings

### Membership Card
- `GET /api/membership-card` - Get/generate membership card
- `POST /api/membership-card` - Regenerate QR code

### Loans
- `GET /api/loans/categories` - List loan categories (admin)
- `POST /api/loans/categories` - Create loan category (admin)
- `PATCH /api/loans/categories` - Update loan category (admin)
- `GET /api/loans/categories/public` - List enabled categories
- `GET /api/loans/eligible-guarantors` - List eligible guarantors
- `GET /api/loans/applications` - List user's applications
- `POST /api/loans/applications` - Submit loan application
- `GET /api/loans/manage` - List all applications (loan manager)
- `PATCH /api/loans/manage` - Update application status (loan manager)

### Members
- `GET /api/members` - Search members with privacy filters

## Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub

2. Import project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. Configure environment variables in Vercel:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your production URL

4. Deploy!

### Database Hosting

**Recommended Options**:
- **Neon** (https://neon.tech) - Serverless PostgreSQL
- **Supabase** (https://supabase.com) - PostgreSQL with additional features
- **AWS RDS** - Production-grade PostgreSQL
- **Railway** (https://railway.app) - Quick deployment

### Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Use production PostgreSQL database
- [ ] Configure proper CORS settings
- [ ] Set up file storage (AWS S3/Cloudinary) for profile photos
- [ ] Configure email service for notifications
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backups for database
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Review and set rate limiting
- [ ] Configure analytics (Google Analytics, Plausible)

## Mobile Optimization

- Mobile-first responsive design
- Touch-friendly UI components
- Optimized images with Next.js Image component
- Responsive tables convert to cards on mobile
- Fast loading on low bandwidth
- QR code scanning friendly layouts

## Access Control Matrix

| Feature | Non-Alumni | Alumni | Staff | Loan Manager | Admin |
|---------|-----------|--------|-------|-------------|-------|
| View own profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| View members (limited) | ✓ | ✓ | ✓ | ✓ | ✓ |
| View education/job history | ✗ | ✓* | ✓* | ✓* | ✓ |
| Membership card | ✗ | ✓ | ✓ | ✓ | ✓ |
| Apply for loans | ✗ | ✓** | ✓** | ✓** | ✓** |
| Act as guarantor | ✗ | ✓** | ✓** | ✓** | ✓** |
| Manage loan applications | ✗ | ✗ | ✗ | ✓ | ✓ |
| Approve users | ✗ | ✗ | ✗ | ✗ | ✓ |
| Manage loan categories | ✗ | ✗ | ✗ | ✗ | ✓ |
| View audit logs | ✗ | ✗ | ✗ | ✗ | ✓ |

\* Subject to privacy settings  
\** Requires loan eligibility flag set by admin

## Default Privacy Settings

- Family details: HIDDEN
- Education history: HIDDEN
- Job history: HIDDEN
- Current job: VISIBLE
- Contact details: VISIBLE

Non-alumni users can NEVER see hidden data regardless of privacy settings.

## Loan Calculation Formula

```typescript
monthlyInterest = loanAmount × (monthlyInterestRate / 100)
totalPayable = loanAmount + (monthlyInterest × repaymentMonths)
emiAmount = totalPayable / repaymentMonths
```

## Support

For issues or questions:
1. Check the documentation above
2. Review the database schema in `DATABASE_SCHEMA.md`
3. Examine the code comments in key files

## License

Proprietary - Quest Foundation, Bangalore

---

Built with ❤️ for Quest Foundation
