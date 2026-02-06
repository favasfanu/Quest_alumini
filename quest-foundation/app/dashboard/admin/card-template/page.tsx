'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface CardTemplate {
  id: string
  templateUrl?: string
  uploadedAt?: string
}

export default function CardTemplateManagementPage() {
  const [template, setTemplate] = useState<CardTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTemplate()
  }, [])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/card-template')
      const data = await response.json()
      if (response.ok && data.template) {
        setTemplate(data.template)
      }
    } catch (err) {
      console.error('Error fetching template:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Please upload a PNG, JPG, or WebP image')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
    const file = input.files?.[0]
    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/card-template', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to upload template')
        return
      }

      setSuccess('Template uploaded successfully! All member cards will be updated.')
      setTemplate(data.template)
      setPreview(null)
      input.value = ''
      fetchTemplate()
    } catch (err) {
      setError('Error uploading template')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove the card template? Members will see cards without a background.')) {
      return
    }

    try {
      setError('')
      setSuccess('')
      const response = await fetch('/api/card-template', {
        method: 'DELETE',
      })

      if (!response.ok) {
        setError('Failed to delete template')
        return
      }

      setSuccess('Template removed successfully.')
      setTemplate(null)
      setPreview(null)
      fetchTemplate()
    } catch (err) {
      setError('Error deleting template')
      console.error('Delete error:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Membership Card Template</h1>
          <p className="text-muted-foreground mt-1">
            Upload or manage the global card design for all members
          </p>
        </div>
        <Link href="/dashboard/admin/settings" className="text-sm text-blue-600 hover:underline">
          Back to Settings
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Template</CardTitle>
            <CardDescription>
              Select an image to use as the card background
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileSelect}
                  className="block w-full text-sm"
                />
              </div>

              {preview && (
                <div>
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="border rounded overflow-hidden bg-gray-100">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <strong>Recommended specifications:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Dimensions: 1586 × 1000 pixels</li>
                  <li>• Format: PNG, JPG, or WebP</li>
                  <li>• Max file size: 5MB</li>
                  <li>• Aspect ratio: ~1.6:1</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={!preview || uploading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? 'Uploading...' : 'Upload Template'}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Current Template Section */}
        <Card>
          <CardHeader>
            <CardTitle>Current Template</CardTitle>
            <CardDescription>
              {template?.templateUrl ? 'The template being used by all member cards' : 'No template currently set'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-muted-foreground">Loading...</div>
            ) : template?.templateUrl ? (
              <div className="space-y-4">
                <div className="border rounded overflow-hidden bg-gray-100">
                  <img
                    src={template.templateUrl}
                    alt="Current Template"
                    className="w-full h-48 object-cover"
                  />
                </div>
                {template.uploadedAt && (
                  <div className="text-sm text-muted-foreground">
                    Uploaded: {new Date(template.uploadedAt).toLocaleDateString()}
                  </div>
                )}
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                  <strong>✓ Active</strong>
                  <p className="text-xs mt-1">
                    This template is currently displayed on all member membership cards.
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 font-medium"
                >
                  Remove Template
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <p className="text-sm">No template set</p>
                  <p className="text-xs mt-2">Upload one using the form on the left</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  When no template is set, member cards display with a plain background.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Upload Template</strong>
            <p className="text-muted-foreground">
              Select an image and upload it as the global card template.
            </p>
          </div>
          <div>
            <strong>2. Automatic Update</strong>
            <p className="text-muted-foreground">
              All member membership cards instantly reflect the new template design.
            </p>
          </div>
          <div>
            <strong>3. No Individual Customization</strong>
            <p className="text-muted-foreground">
              Members cannot customize their individual cards—they all use the same admin-set template.
            </p>
          </div>
          <div>
            <strong>4. Easy Management</strong>
            <p className="text-muted-foreground">
              You can update or remove the template at any time. Changes are immediate.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
