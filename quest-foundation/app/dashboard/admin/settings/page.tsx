import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure system-wide settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Global configuration for Quest Foundation platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Platform Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organization:</span>
                  <span className="font-medium">Quest Foundation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">Bangalore, India</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span className="font-medium">Alumni Management System</span>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Default Privacy Settings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Family Details:</span>
                  <span className="font-medium text-red-600">Hidden (Default)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Education History:</span>
                  <span className="font-medium text-red-600">Hidden (Default)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job History:</span>
                  <span className="font-medium text-red-600">Hidden (Default)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Job:</span>
                  <span className="font-medium text-green-600">Visible (Default)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Details:</span>
                  <span className="font-medium text-green-600">Visible (Default)</span>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Access Rules</h3>
              <div className="space-y-2 text-sm">
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <strong>Non-Alumni Restrictions:</strong>
                  <ul className="mt-2 list-disc list-inside text-xs space-y-1">
                    <li>Can NEVER see Education History</li>
                    <li>Can NEVER see Job History</li>
                    <li>Can NEVER see Family Details</li>
                    <li>Can only see Current Job and Contact (if visible)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a href="/dashboard/admin/users" className="block p-3 border rounded hover:bg-gray-50">
                  <div className="font-medium">User Management</div>
                  <div className="text-xs text-muted-foreground">Manage user accounts and approvals</div>
                </a>
                <a href="/dashboard/admin/loan-categories" className="block p-3 border rounded hover:bg-gray-50">
                  <div className="font-medium">Loan Categories</div>
                  <div className="text-xs text-muted-foreground">Configure loan types and terms</div>
                </a>
                <a href="/dashboard/loan-manager" className="block p-3 border rounded hover:bg-gray-50">
                  <div className="font-medium">Loan Applications</div>
                  <div className="text-xs text-muted-foreground">Review pending loan requests</div>
                </a>
                <a href="/dashboard/members" className="block p-3 border rounded hover:bg-gray-50">
                  <div className="font-medium">Members Directory</div>
                  <div className="text-xs text-muted-foreground">View all approved members</div>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Environment:</span>
            <span className="font-medium">Production</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database:</span>
            <span className="font-medium">PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Framework:</span>
            <span className="font-medium">Next.js 14</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
