# Deployment Guide - Quest Foundation Platform

## Prerequisites

- Node.js 18+ installed locally
- PostgreSQL 12+ database
- Vercel account (free tier works)
- GitHub account

## Step 1: Database Setup

### Option A: Neon (Recommended for beginners)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)
4. The format will be:
   ```
   postgresql://user:password@host/database?sslmode=require
   ```

### Option B: Supabase

1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" under "Connection pooling"

### Option C: Railway

1. Go to https://railway.app and sign up
2. Create new project → Add PostgreSQL
3. Copy the `DATABASE_URL` from the Variables tab

## Step 2: Local Setup & Testing

1. Navigate to the project directory:
```bash
cd quest-foundation
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp env.example .env
```

4. Edit `.env` with your values:
```env
DATABASE_URL="your-postgresql-connection-string-here"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

5. Initialize the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

6. Test locally:
```bash
npm run dev
```

Visit http://localhost:3000 and test the registration flow.

## Step 3: Create First Admin User

1. Register a new account through the UI
2. Connect to your database and run:
```sql
UPDATE "User" 
SET status = 'APPROVED', role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

For Neon/Supabase, you can use their web SQL editor.

## Step 4: Deploy to Vercel

### A. Push to GitHub

1. Initialize git (if not already):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin https://github.com/yourusername/quest-foundation.git
git branch -M main
git push -u origin main
```

### B. Deploy on Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./quest-foundation`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add these three variables:
     ```
     DATABASE_URL = your-production-database-url
     NEXTAUTH_SECRET = generate-new-secret-with-openssl-rand-base64-32
     NEXTAUTH_URL = https://your-app-name.vercel.app
     ```
   - Make sure to use your PRODUCTION database URL, not localhost!

6. Click "Deploy"

7. Wait for deployment (usually 2-3 minutes)

8. Once deployed, update `NEXTAUTH_URL` with your actual Vercel URL

## Step 5: Run Database Migrations in Production

After first deployment, you need to apply migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy
```

Or manually run migrations through Prisma Studio or your database client.

## Step 6: Production Configuration

### Update NEXTAUTH_URL

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your actual domain:
   ```
   https://quest-foundation.vercel.app
   ```
   or your custom domain if you've set one up

3. Redeploy the application

### Set Up Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `alumni.questfoundation.org`)
3. Follow Vercel's DNS configuration instructions
4. Update `NEXTAUTH_URL` to use your custom domain

## Step 7: File Upload Configuration (Optional)

For profile photos, set up cloud storage:

### Option A: Cloudinary

1. Sign up at https://cloudinary.com
2. Get your API credentials
3. Add to Vercel environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Option B: AWS S3

1. Create S3 bucket
2. Add to Vercel environment variables:
   ```
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=us-east-1
   ```

## Production Checklist

- [ ] Database is set up and migrations are applied
- [ ] All environment variables are configured in Vercel
- [ ] NEXTAUTH_SECRET is strong and unique (32+ characters)
- [ ] NEXTAUTH_URL matches your production domain
- [ ] First admin user is created and approved
- [ ] Test user registration flow
- [ ] Test login and authentication
- [ ] Test admin panel access
- [ ] Test loan application flow
- [ ] Test membership card generation
- [ ] Test member directory
- [ ] Mobile responsiveness verified
- [ ] SSL certificate is active (automatic with Vercel)
- [ ] Database backups are configured

## Monitoring & Maintenance

### Vercel Analytics

Enable in Vercel Dashboard → Your Project → Analytics

### Database Monitoring

- Neon: Built-in monitoring dashboard
- Supabase: Database → Reports
- Railway: Project → Metrics

### Error Tracking

Add Sentry (optional):
```bash
npm install @sentry/nextjs
```

## Scaling Considerations

### Database
- Start with basic tier
- Monitor connection limits
- Consider connection pooling with PgBouncer
- Upgrade plan as user base grows

### Vercel
- Free tier: 100GB bandwidth, good for ~1000 users
- Pro tier ($20/mo): Unlimited bandwidth
- Consider upgrading as traffic grows

### File Storage
- Use CDN for profile photos (Cloudinary, AWS CloudFront)
- Optimize images with Next.js Image component

## Troubleshooting

### Build Fails
- Check Node.js version in Vercel settings
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Database Connection Issues
- Verify DATABASE_URL format
- Check database allows external connections
- Verify SSL mode is correct

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain exactly
- Check NEXTAUTH_SECRET is set
- Clear browser cookies and try again

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Apply migrations manually
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Backup Strategy

### Database Backups
- Neon: Automatic daily backups
- Supabase: Automatic backups (Pro plan)
- Manual: Schedule pg_dump via cron

### Code Backups
- GitHub repository is your backup
- Use tags for release versions:
  ```bash
  git tag -a v1.0.0 -m "Production release"
  git push origin v1.0.0
  ```

## Support Contacts

For deployment issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Prisma documentation: https://www.prisma.io/docs
3. Check Next.js documentation: https://nextjs.org/docs

---

**Estimated Setup Time**: 30-45 minutes  
**Monthly Cost**: $0-20 (depending on usage and features)  
**Technical Difficulty**: Intermediate
