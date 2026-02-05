'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { calculateLoan } from '@/lib/loan-calculator'
import { formatCurrency } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { CheckCircle } from 'lucide-react'

interface LoanCategory {
  id: string
  name: string
  description: string
  maxLoanAmount: string
  monthlyInterestRate: string
  repaymentDurationMonths: number
  isEnabled: boolean
}

interface LoanApplication {
  id: string
  loanAmount: string
  monthlyInterest: string
  totalPayable: string
  emiAmount: string
  status: string
  submittedAt: string
  loanCategory: {
    name: string
  }
}

export default function LoansPage() {
  const { data: session } = useSession()
  const [categories, setCategories] = useState<LoanCategory[]>([])
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [selectedCategory, setSelectedCategory] = useState<LoanCategory | null>(null)
  const [loanAmount, setLoanAmount] = useState('')
  const [calculation, setCalculation] = useState<any>(null)
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    guarantor1Id: '',
    guarantor2Id: '',
    guarantor1Confirmed: false,
    guarantor2Confirmed: false,
    purpose: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchApplications()
    fetchEligibleUsers()
  }, [])

  useEffect(() => {
    if (selectedCategory && loanAmount) {
      const amount = parseFloat(loanAmount)
      if (amount > 0 && amount <= parseFloat(selectedCategory.maxLoanAmount)) {
        const calc = calculateLoan(
          amount,
          parseFloat(selectedCategory.monthlyInterestRate),
          selectedCategory.repaymentDurationMonths
        )
        setCalculation(calc)
      } else {
        setCalculation(null)
      }
    }
  }, [selectedCategory, loanAmount])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/loans/categories/public')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/loans/applications')
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    }
  }

  const fetchEligibleUsers = async () => {
    try {
      const response = await fetch('/api/loans/eligible-guarantors')
      const data = await response.json()
      setEligibleUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch eligible users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.guarantor1Confirmed || !formData.guarantor2Confirmed) {
      setError('You must confirm with both guarantors')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/loans/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanCategoryId: selectedCategory?.id,
          loanAmount,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccess(true)
      setSelectedCategory(null)
      setLoanAmount('')
      setFormData({
        guarantor1Id: '',
        guarantor2Id: '',
        guarantor1Confirmed: false,
        guarantor2Confirmed: false,
        purpose: '',
      })
      fetchApplications()

      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user.isLoanEligible) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quest Care Loans</CardTitle>
          <CardDescription>Welfare loan program for eligible members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
            You are not currently eligible for Quest Care loans. Please contact the administrator.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quest Care Loans</h1>
        <p className="text-muted-foreground mt-1">Apply for welfare loans</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Loan application submitted successfully! It is now under review.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Apply for a Loan</CardTitle>
          <CardDescription>Select a loan category and enter the amount</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Loan Category</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.filter(c => c.isEnabled).map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedCategory?.id === category.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Max: {formatCurrency(category.maxLoanAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {category.monthlyInterestRate}% monthly • {category.repaymentDurationMonths} months
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    required
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder={`Max: ${formatCurrency(selectedCategory.maxLoanAmount)}`}
                    max={selectedCategory.maxLoanAmount}
                  />
                </div>

                {calculation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-blue-900">Loan Calculation</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Loan Amount:</span>
                        <div className="font-semibold">{formatCurrency(calculation.loanAmount)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monthly Interest:</span>
                        <div className="font-semibold">{formatCurrency(calculation.monthlyInterest)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Payable:</span>
                        <div className="font-semibold">{formatCurrency(calculation.totalPayable)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monthly EMI:</span>
                        <div className="font-semibold">{formatCurrency(calculation.emiAmount)}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="guarantor1">Guarantor 1</Label>
                  <select
                    id="guarantor1"
                    required
                    value={formData.guarantor1Id}
                    onChange={(e) => setFormData({ ...formData, guarantor1Id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select guarantor</option>
                    {eligibleUsers.filter(u => u.id !== formData.guarantor2Id).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.profile.fullName}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="guarantor1Confirmed"
                      checked={formData.guarantor1Confirmed}
                      onChange={(e) => setFormData({ ...formData, guarantor1Confirmed: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="guarantor1Confirmed" className="text-sm">
                      I have confirmed with this guarantor
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guarantor2">Guarantor 2</Label>
                  <select
                    id="guarantor2"
                    required
                    value={formData.guarantor2Id}
                    onChange={(e) => setFormData({ ...formData, guarantor2Id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select guarantor</option>
                    {eligibleUsers.filter(u => u.id !== formData.guarantor1Id).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.profile.fullName}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="guarantor2Confirmed"
                      checked={formData.guarantor2Confirmed}
                      onChange={(e) => setFormData({ ...formData, guarantor2Confirmed: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="guarantor2Confirmed" className="text-sm">
                      I have confirmed with this guarantor
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose (Optional)</Label>
                  <textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Describe the purpose of this loan"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading || !calculation}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Loan Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="font-semibold">{app.loanCategory.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(app.loanAmount)} • EMI: {formatCurrency(app.emiAmount)}
                      </div>
                    </div>
                    <Badge>{app.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
