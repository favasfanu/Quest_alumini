'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface LoanCategory {
  id: string
  name: string
  description: string
  maxLoanAmount: string
  monthlyInterestRate: string
  repaymentDurationMonths: number
  guarantorActiveLoanLimit: number
  isEnabled: boolean
}

export default function AdminLoanCategories() {
  const [categories, setCategories] = useState<LoanCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxLoanAmount: '',
    monthlyInterestRate: '',
    repaymentDurationMonths: '',
    guarantorActiveLoanLimit: '3',
    isEnabled: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/loans/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = '/api/loans/categories'
      const method = editingId ? 'PATCH' : 'POST'
      const body = editingId 
        ? { ...formData, categoryId: editingId }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        fetchCategories()
        resetForm()
      }
    } catch (error) {
      console.error('Failed to save category:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: LoanCategory) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
      maxLoanAmount: category.maxLoanAmount,
      monthlyInterestRate: category.monthlyInterestRate,
      repaymentDurationMonths: category.repaymentDurationMonths.toString(),
      guarantorActiveLoanLimit: category.guarantorActiveLoanLimit.toString(),
      isEnabled: category.isEnabled,
    })
    setShowForm(true)
  }

  const handleToggleStatus = async (categoryId: string, isEnabled: boolean) => {
    try {
      await fetch('/api/loans/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, isEnabled: !isEnabled }),
      })
      fetchCategories()
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      maxLoanAmount: '',
      monthlyInterestRate: '',
      repaymentDurationMonths: '',
      guarantorActiveLoanLimit: '3',
      isEnabled: true,
    })
  }

  if (loading && categories.length === 0) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Categories</h1>
          <p className="text-muted-foreground mt-1">Manage Quest Care loan categories</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Create'} Loan Category</CardTitle>
            <CardDescription>
              Configure the terms and limits for this loan type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Personal Loan"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoanAmount">Maximum Loan Amount (₹)</Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    required
                    value={formData.maxLoanAmount}
                    onChange={(e) => setFormData({ ...formData, maxLoanAmount: e.target.value })}
                    placeholder="25000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyInterestRate">Monthly Interest Rate (%)</Label>
                  <Input
                    id="monthlyInterestRate"
                    type="number"
                    step="0.01"
                    required
                    value={formData.monthlyInterestRate}
                    onChange={(e) => setFormData({ ...formData, monthlyInterestRate: e.target.value })}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repaymentDurationMonths">Repayment Duration (Months)</Label>
                  <Input
                    id="repaymentDurationMonths"
                    type="number"
                    required
                    value={formData.repaymentDurationMonths}
                    onChange={(e) => setFormData({ ...formData, repaymentDurationMonths: e.target.value })}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guarantorActiveLoanLimit">Guarantor Active Loan Limit</Label>
                  <Input
                    id="guarantorActiveLoanLimit"
                    type="number"
                    required
                    value={formData.guarantorActiveLoanLimit}
                    onChange={(e) => setFormData({ ...formData, guarantorActiveLoanLimit: e.target.value })}
                    placeholder="3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Brief description of this loan category"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isEnabled" className="text-sm">
                  Enable this category
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {category.name}
                    {category.isEnabled ? (
                      <Badge variant="outline" className="bg-green-50">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50">Disabled</Badge>
                    )}
                  </CardTitle>
                  {category.description && (
                    <CardDescription className="mt-1">{category.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Max Amount</div>
                  <div className="font-semibold">{formatCurrency(category.maxLoanAmount)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Monthly Interest</div>
                  <div className="font-semibold">{category.monthlyInterestRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold">{category.repaymentDurationMonths} months</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Guarantor Limit</div>
                  <div className="font-semibold">{category.guarantorActiveLoanLimit} active loans</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(category.id, category.isEnabled)}
                >
                  {category.isEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No loan categories created yet. Click &quot;Add Category&quot; to create one.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
