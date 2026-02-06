import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-black">Welcome, {session.user.name}!</h1>
        <p className="text-gray-600 text-base">
          {session.user.role.replace('_', ' ')} • {session.user.userType}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/members">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-black">Members Directory</CardTitle>
              <Users className="h-5 w-5 text-[#006400]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#006400]">Browse</div>
              <p className="text-xs text-gray-600 mt-1">
                Connect with alumni and members
              </p>
            </CardContent>
          </Card>
        </Link>

        {!isNonAlumni && (
          <Link href="/dashboard/membership-card">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-black">Membership Card</CardTitle>
                <CreditCard className="h-5 w-5 text-[#0A5CAA]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0A5CAA]">View</div>
                <p className="text-xs text-gray-600 mt-1">
                  Access your digital membership card
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/dashboard/loans">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-black">Quest Care Loans</CardTitle>
              <FileText className="h-5 w-5 text-[#FF9900]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF9900]">Apply</div>
              <p className="text-xs text-gray-600 mt-1">
                {session.user.isLoanEligible ? 'Apply for welfare loans' : 'Check eligibility'}
              </p>
            </CardContent>
          </Card>
        </Link>

        {isAdmin && (
          <Link href="/dashboard/admin">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-[#006400] bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-black">Admin Panel</CardTitle>
                <CheckCircle className="h-5 w-5 text-[#006400]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#006400]">Manage</div>
                <p className="text-xs text-gray-600 mt-1">
                  User approvals and system settings
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        {isLoanManager && (
          <Link href="/dashboard/loan-manager">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-[#0A5CAA] bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-black">Loan Management</CardTitle>
                <FileText className="h-5 w-5 text-[#0A5CAA]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#0A5CAA]">Review</div>
                <p className="text-xs text-gray-600 mt-1">
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
