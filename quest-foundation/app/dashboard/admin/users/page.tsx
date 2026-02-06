'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Ban } from 'lucide-react'

interface User {
  id: string
  email: string
  userType: string
  role: string
  status: string
  isLoanEligible: boolean
  createdAt: string
  profile: {
    fullName: string
  }
}

export default function AdminUserManagement() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string>('')
  const [createSuccess, setCreateSuccess] = useState<string>('')
  const [createAdminForm, setCreateAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: 'STAFF',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users?t=${Date.now()}`, {
        method: 'GET',
      })
      const data = await response.json()
      
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: any) => {
    console.log('updateUser called', { userId, updates })
    
    // Optimistic update: update local state immediately
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, ...updates } : u
      )
    )

    try {
      const response = await fetch(`/api/admin/users?t=${Date.now()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      })

      const data = await response.json().catch(() => null)
      console.log('PATCH /api/admin/users response', response.status, data)

      if (response.ok) {
        // Refresh user list with fresh data from server
        await fetchUsers()
        
        // If we updated the current user, refresh their session
        if (userId === session?.user?.id) {
          console.log('Refreshing session for current user')
          router.refresh()
        }
      } else {
        console.error('Update failed', data)
        // Revert optimistic update on error
        await fetchUsers()
        alert('Update failed: ' + (data?.error || response.status))
      }
    } catch (error: any) {
      console.error('Failed to update user:', error)
      // Revert optimistic update on error
      await fetchUsers()
      alert('Failed to update user: ' + (error?.message || error))
    }
  }

  const createAdmin = async () => {
    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createAdminForm),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin')
      }
      setCreateSuccess('Admin created successfully.')
      setCreateAdminForm({ fullName: '', email: '', password: '', userType: 'STAFF' })
      fetchUsers()
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create admin')
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: <Badge variant="outline" className="bg-yellow-50 flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>,
      APPROVED: <Badge variant="outline" className="bg-green-50 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Approved</Badge>,
      REJECTED: <Badge variant="outline" className="bg-red-50 flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>,
      DISABLED: <Badge variant="outline" className="bg-gray-50 flex items-center gap-1"><Ban className="w-3 h-3" />Disabled</Badge>,
    }
    return badges[status as keyof typeof badges]
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'ALL') return true
    return user.status === filter
  })

  if (loading && users.length === 0) {
    return <div className="text-center py-12">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Approve, reject, and manage user accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Admin</CardTitle>
          <CardDescription>
            Create a new admin account (approved immediately). Password must be at least 10 characters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminFullName">Full Name</Label>
              <Input
                id="adminFullName"
                value={createAdminForm.fullName}
                onChange={(e) => setCreateAdminForm({ ...createAdminForm, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={createAdminForm.email}
                onChange={(e) => setCreateAdminForm({ ...createAdminForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={createAdminForm.password}
                onChange={(e) => setCreateAdminForm({ ...createAdminForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminUserType">User Type</Label>
              <select
                id="adminUserType"
                value={createAdminForm.userType}
                onChange={(e) => setCreateAdminForm({ ...createAdminForm, userType: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="STAFF">STAFF</option>
                <option value="ALUMNI">ALUMNI</option>
                <option value="NON_ALUMNI">NON_ALUMNI</option>
              </select>
            </div>
          </div>
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {createError}
            </div>
          )}
          {createSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
              {createSuccess}
            </div>
          )}
          <Button onClick={createAdmin} disabled={creating}>
            {creating ? 'Creating...' : 'Create Admin'}
          </Button>
          <div className="text-xs text-muted-foreground">
            Tip: Use the role dropdown on an existing user to assign or revoke `ADMIN` / `LOAN_MANAGER`.
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DISABLED'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No users found matching the selected filter.
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle>{user.profile?.fullName || user.email}</CardTitle>
                    <CardDescription className="mt-1">
                      {user.email} • {user.userType.replace('_', ' ')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Role:</span>
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(user.id, { role: e.target.value })}
                        disabled={session?.user?.id === user.id}
                        className="flex h-9 rounded-md border border-input bg-background px-2 py-1 text-xs"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="ALUMNI_MEMBER">ALUMNI_MEMBER</option>
                        <option value="QUEST_STAFF">QUEST_STAFF</option>
                        <option value="NON_ALUMNI_MEMBER">NON_ALUMNI_MEMBER</option>
                        <option value="LOAN_MANAGER">LOAN_MANAGER</option>
                      </select>
                    </div>
                    <p><strong>Loan Eligible:</strong> {user.isLoanEligible ? 'Yes' : 'No'}</p>
                    <p><strong>Registered:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateUser(user.id, { status: 'APPROVED' })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateUser(user.id, { status: 'REJECTED' })}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {user.status === 'APPROVED' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUser(user.id, { isLoanEligible: !user.isLoanEligible })}
                        >
                          {user.isLoanEligible ? 'Remove Loan Access' : 'Grant Loan Access'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateUser(user.id, { status: 'DISABLED' })}
                        >
                          Disable
                        </Button>
                      </>
                    )}

                    {user.status === 'DISABLED' && (
                      <Button
                        size="sm"
                        onClick={() => updateUser(user.id, { status: 'APPROVED' })}
                      >
                        Enable
                      </Button>
                    )}

                    {user.status === 'REJECTED' && (
                      <Button
                        size="sm"
                        onClick={() => updateUser(user.id, { status: 'APPROVED' })}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
