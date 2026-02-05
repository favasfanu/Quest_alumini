import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const isAdmin = session.user.role === 'ADMIN'
  const isLoanManager = session.user.role === 'LOAN_MANAGER' || isAdmin
  const isNonAlumni = session.user.role === 'NON_ALUMNI_MEMBER'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {session.user.name}!</h1>
        <p className="text-muted-foreground mt-1">
          {session.user.role.replace('_', ' ')} • {session.user.userType}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/members">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members Directory</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Browse</div>
              <p className="text-xs text-muted-foreground">
                Connect with alumni and members
              </p>
            </CardContent>
          </Card>
        </Link>

        {!isNonAlumni && (
          <Link href="/dashboard/membership-card">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Membership Card</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">View</div>
                <p className="text-xs text-muted-foreground">
                  Access your digital membership card
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/dashboard/loans">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quest Care Loans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Apply</div>
              <p className="text-xs text-muted-foreground">
                {session.user.isLoanEligible ? 'Apply for welfare loans' : 'Check eligibility'}
              </p>
            </CardContent>
          </Card>
        </Link>

        {isAdmin && (
          <Link href="/dashboard/admin">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Panel</CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage</div>
                <p className="text-xs text-muted-foreground">
                  User approvals and system settings
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {isLoanManager && (
          <Link href="/dashboard/loan-manager">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loan Management</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Review</div>
                <p className="text-xs text-muted-foreground">
                  Review and approve loan applications
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}
