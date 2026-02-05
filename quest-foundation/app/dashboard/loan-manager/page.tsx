'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, XCircle, Send, Clock } from 'lucide-react'

interface LoanApplication {
  id: string
  loanAmount: string
  monthlyInterest: string
  totalPayable: string
  emiAmount: string
  repaymentMonths: number
  status: string
  submittedAt: string
  purpose: string
  remarks: string
  rejectionReason: string
  loanCategory: {
    name: string
  }
  applicant: {
    profile: {
      fullName: string
    }
  }
  guarantor1: {
    profile: {
      fullName: string
    }
  }
  guarantor2: {
    profile: {
      fullName: string
    }
  }
}

export default function LoanManagerPage() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/loans/manage')
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (applicationId: string, action: string, extraData?: any) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/loans/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          action,
          ...extraData,
        }),
      })

      if (response.ok) {
        fetchApplications()
        setSelectedApp(null)
      }
    } catch (error) {
      console.error('Failed to update application:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, any> = {
      SUBMITTED: <Badge variant="outline" className="bg-blue-50">Submitted</Badge>,
      UNDER_REVIEW: <Badge variant="outline" className="bg-yellow-50">Under Review</Badge>,
      APPROVED: <Badge variant="outline" className="bg-green-50">Approved</Badge>,
      REJECTED: <Badge variant="outline" className="bg-red-50">Rejected</Badge>,
      FUNDS_TRANSFERRED: <Badge variant="outline" className="bg-purple-50">Funds Transferred</Badge>,
      ACTIVE_LOAN: <Badge variant="outline" className="bg-indigo-50">Active</Badge>,
      COMPLETED: <Badge variant="outline" className="bg-gray-50">Completed</Badge>,
    }
    return badges[status] || <Badge>{status}</Badge>
  }

  const filteredApplications = applications.filter((app) => {
    if (filter === 'ALL') return true
    return app.status === filter
  })

  if (loading) {
    return <div className="text-center py-12">Loading applications...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loan Management</h1>
        <p className="text-muted-foreground mt-1">Review and manage loan applications</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'FUNDS_TRANSFERRED', 'ACTIVE_LOAN', 'COMPLETED'].map(
          (status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.replace('_', ' ')}
            </Button>
          )
        )}
      </div>

      <div className="grid gap-4">
        {filteredApplications.map((app) => (
          <Card key={app.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{app.applicant.profile.fullName}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    {app.loanCategory.name} • {formatCurrency(app.loanAmount)}
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Monthly Interest</div>
                  <div className="font-semibold">{formatCurrency(app.monthlyInterest)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Payable</div>
                  <div className="font-semibold">{formatCurrency(app.totalPayable)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">EMI Amount</div>
                  <div className="font-semibold">{formatCurrency(app.emiAmount)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-semibold">{app.repaymentMonths} months</div>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Guarantor 1:</span>{' '}
                  <span className="font-medium">{app.guarantor1.profile.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Guarantor 2:</span>{' '}
                  <span className="font-medium">{app.guarantor2.profile.fullName}</span>
                </div>
                {app.purpose && (
                  <div>
                    <span className="text-muted-foreground">Purpose:</span>{' '}
                    <span className="font-medium">{app.purpose}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Submitted:</span>{' '}
                  <span className="font-medium">{new Date(app.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {app.status === 'SUBMITTED' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleAction(app.id, 'approve')}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:')
                        if (reason) {
                          handleAction(app.id, 'reject', { rejectionReason: reason })
                        }
                      }}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}

                {app.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    onClick={() => handleAction(app.id, 'transfer_funds')}
                    disabled={actionLoading}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Mark Funds Transferred
                  </Button>
                )}

                {app.status === 'FUNDS_TRANSFERRED' && (
                  <Button
                    size="sm"
                    onClick={() => handleAction(app.id, 'activate')}
                    disabled={actionLoading}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Activate Loan
                  </Button>
                )}

                {app.status === 'ACTIVE_LOAN' && (
                  <Button
                    size="sm"
                    onClick={() => handleAction(app.id, 'complete')}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Completed
                  </Button>
                )}
              </div>

              {app.rejectionReason && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
                  <strong>Rejection Reason:</strong> {app.rejectionReason}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No loan applications found matching the selected filter.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
