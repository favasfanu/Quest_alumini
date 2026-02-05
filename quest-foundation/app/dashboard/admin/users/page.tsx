'use client'

import { useEffect, useState } from 'react'
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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
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
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
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
                    <p><strong>Role:</strong> {user.role.replace('_', ' ')}</p>
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
