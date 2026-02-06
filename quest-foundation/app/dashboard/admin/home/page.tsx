import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, Settings, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/dashboard')
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Manage system settings and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground">
                Approve, reject, and manage user accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/loan-categories">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loan Categories</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Configure</div>
              <p className="text-xs text-muted-foreground">
                Manage Quest Care loan types and terms
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/settings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Settings</div>
              <p className="text-xs text-muted-foreground">
                Configure system-wide settings
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/dashboard/admin/users" className="block p-3 hover:bg-gray-50 rounded-md border">
            <div className="font-medium">Review Pending Users</div>
            <div className="text-sm text-muted-foreground">Approve or reject new registrations</div>
          </Link>
          <Link href="/dashboard/admin/loan-categories" className="block p-3 hover:bg-gray-50 rounded-md border">
            <div className="font-medium">Manage Loan Categories</div>
            <div className="text-sm text-muted-foreground">Create and configure loan types</div>
          </Link>
          <Link href="/dashboard/loan-manager" className="block p-3 hover:bg-gray-50 rounded-md border">
            <div className="font-medium">Review Loan Applications</div>
            <div className="text-sm text-muted-foreground">Manage pending loan requests</div>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
