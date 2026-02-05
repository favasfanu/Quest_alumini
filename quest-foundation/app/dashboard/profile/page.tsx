'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  
  // Form states
  const [basicForm, setBasicForm] = useState<any>({})
  const [educationForm, setEducationForm] = useState<any>({})
  const [jobForm, setJobForm] = useState<any>({})
  const [familyForm, setFamilyForm] = useState<any>({})
  const [contactForm, setContactForm] = useState<any>({})
  const [privacyForm, setPrivacyForm] = useState<any>({})
  
  const [editingEducation, setEditingEducation] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.profile) {
        setProfile(data.profile)
        setBasicForm({
          fullName: data.profile.fullName || '',
          batchYear: data.profile.batchYear || '',
          department: data.profile.department || '',
          course: data.profile.course || '',
          city: data.profile.city || '',
          state: data.profile.state || '',
          country: data.profile.country || '',
          currentlyWorking: data.profile.currentlyWorking || false,
          currentlyStudying: data.profile.currentlyStudying || false,
        })
        
        setFamilyForm({
          maritalStatus: data.profile.maritalStatus || '',
          spouseName: data.profile.spouseName || '',
          childrenCount: data.profile.childrenCount || 0,
        })
        
        setContactForm({
          phone: data.profile.contactDetails?.phone || '',
          whatsapp: data.profile.contactDetails?.whatsapp || '',
          email: data.profile.contactDetails?.email || '',
          linkedinUrl: data.profile.contactDetails?.linkedinUrl || '',
          instagramUrl: data.profile.contactDetails?.instagramUrl || '',
        })
        
        setPrivacyForm({
          familyDetailsVisible: data.profile.privacySettings?.familyDetailsVisible || false,
          educationVisible: data.profile.privacySettings?.educationVisible || false,
          jobHistoryVisible: data.profile.privacySettings?.jobHistoryVisible || false,
          currentJobVisible: data.profile.privacySettings?.currentJobVisible || true,
          contactDetailsVisible: data.profile.privacySettings?.contactDetailsVisible || true,
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBasicInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicForm),
      })
      if (response.ok) {
        fetchProfile()
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFamilyDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(familyForm),
      })
      if (response.ok) {
        fetchProfile()
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContactDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (response.ok) {
        fetchProfile()
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePrivacySettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(privacyForm),
      })
      if (response.ok) {
        fetchProfile()
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setLoading(false)
    }
  }

  const addEducation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(educationForm),
      })
      if (response.ok) {
        fetchProfile()
        setEducationForm({})
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to add education:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEducation = async (id: string) => {
    if (!confirm('Delete this education record?')) return
    try {
      await fetch(`/api/profile/education/${id}`, { method: 'DELETE' })
      fetchProfile()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const addJob = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm),
      })
      if (response.ok) {
        fetchProfile()
        setJobForm({})
        setActiveSection(null)
      }
    } catch (error) {
      console.error('Failed to add job:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job record?')) return
    try {
      await fetch(`/api/profile/job/${id}`, { method: 'DELETE' })
      fetchProfile()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  if (loading && !profile) {
    return <div className="text-center py-12">Loading profile...</div>
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Profile not found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your personal details and current status</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection(activeSection === 'basic' ? null : 'basic')}
          >
            {activeSection === 'basic' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {activeSection === 'basic' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={basicForm.fullName}
                    onChange={(e) => setBasicForm({ ...basicForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Batch Year</Label>
                  <Input
                    type="number"
                    value={basicForm.batchYear}
                    onChange={(e) => setBasicForm({ ...basicForm, batchYear: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={basicForm.department}
                    onChange={(e) => setBasicForm({ ...basicForm, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Course</Label>
                  <Input
                    value={basicForm.course}
                    onChange={(e) => setBasicForm({ ...basicForm, course: e.target.value })}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={basicForm.city}
                    onChange={(e) => setBasicForm({ ...basicForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={basicForm.state}
                    onChange={(e) => setBasicForm({ ...basicForm, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={basicForm.country}
                    onChange={(e) => setBasicForm({ ...basicForm, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={basicForm.currentlyWorking}
                    onChange={(e) => setBasicForm({ ...basicForm, currentlyWorking: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Currently Working</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={basicForm.currentlyStudying}
                    onChange={(e) => setBasicForm({ ...basicForm, currentlyStudying: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Currently Studying</span>
                </label>
              </div>
              <Button onClick={updateBasicInfo} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Full Name</div>
                  <div className="font-medium">{profile.fullName}</div>
                </div>
                {profile.alumniId && (
                  <div>
                    <div className="text-sm text-muted-foreground">Alumni ID</div>
                    <div className="font-medium">{profile.alumniId}</div>
                  </div>
                )}
                {profile.batchYear && (
                  <div>
                    <div className="text-sm text-muted-foreground">Batch Year</div>
                    <div className="font-medium">{profile.batchYear}</div>
                  </div>
                )}
                {profile.department && (
                  <div>
                    <div className="text-sm text-muted-foreground">Department</div>
                    <div className="font-medium">{profile.department}</div>
                  </div>
                )}
                {profile.course && (
                  <div>
                    <div className="text-sm text-muted-foreground">Course</div>
                    <div className="font-medium">{profile.course}</div>
                  </div>
                )}
                {profile.city && (
                  <div>
                    <div className="text-sm text-muted-foreground">City</div>
                    <div className="font-medium">{profile.city}</div>
                  </div>
                )}
                {profile.state && (
                  <div>
                    <div className="text-sm text-muted-foreground">State</div>
                    <div className="font-medium">{profile.state}</div>
                  </div>
                )}
                {profile.country && (
                  <div>
                    <div className="text-sm text-muted-foreground">Country</div>
                    <div className="font-medium">{profile.country}</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {profile.currentlyWorking && <Badge variant="outline" className="bg-green-50">Currently Working</Badge>}
                {profile.currentlyStudying && <Badge variant="outline" className="bg-blue-50">Currently Studying</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Education</CardTitle>
            <CardDescription>Your educational qualifications</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveSection(activeSection === 'education' ? null : 'education')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSection === 'education' && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Institution</Label>
                  <Input
                    placeholder="e.g., MARKHINS College"
                    value={educationForm.institution || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Degree</Label>
                  <Input
                    placeholder="e.g., B.Tech"
                    value={educationForm.degree || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input
                    placeholder="e.g., Computer Science"
                    value={educationForm.fieldOfStudy || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Start Year</Label>
                  <Input
                    type="number"
                    placeholder="2016"
                    value={educationForm.startYear || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Year</Label>
                  <Input
                    type="number"
                    placeholder="2020"
                    value={educationForm.endYear || ''}
                    onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
                    disabled={educationForm.currentlyStudying}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={educationForm.currentlyStudying || false}
                  onChange={(e) => setEducationForm({ ...educationForm, currentlyStudying: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Currently Studying</span>
              </label>
              <div className="flex gap-2">
                <Button onClick={addEducation} size="sm" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => { setActiveSection(null); setEducationForm({}); }} size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {profile.educationRecords?.length > 0 ? (
            profile.educationRecords.map((edu: any) => (
              <div key={edu.id} className="border rounded-lg p-4 flex justify-between items-start">
                <div>
                  <div className="font-semibold">{edu.degree} - {edu.fieldOfStudy}</div>
                  <div className="text-sm text-muted-foreground">{edu.institution}</div>
                  <div className="text-sm text-muted-foreground">
                    {edu.startYear} - {edu.currentlyStudying ? 'Present' : edu.endYear}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteEducation(edu.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No education records added yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>Your professional experience</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveSection(activeSection === 'job' ? null : 'job')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSection === 'job' && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    placeholder="e.g., Tech Corp"
                    value={jobForm.companyName || ''}
                    onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Job Title</Label>
                  <Input
                    placeholder="e.g., Software Engineer"
                    value={jobForm.jobTitle || ''}
                    onChange={(e) => setJobForm({ ...jobForm, jobTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input
                    placeholder="e.g., Technology"
                    value={jobForm.industry || ''}
                    onChange={(e) => setJobForm({ ...jobForm, industry: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., Bangalore, India"
                    value={jobForm.jobLocation || ''}
                    onChange={(e) => setJobForm({ ...jobForm, jobLocation: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={jobForm.startDate || ''}
                    onChange={(e) => setJobForm({ ...jobForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={jobForm.endDate || ''}
                    onChange={(e) => setJobForm({ ...jobForm, endDate: e.target.value })}
                    disabled={jobForm.currentlyWorking}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={jobForm.currentlyWorking || false}
                  onChange={(e) => setJobForm({ ...jobForm, currentlyWorking: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Currently Working Here</span>
              </label>
              <div className="flex gap-2">
                <Button onClick={addJob} size="sm" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => { setActiveSection(null); setJobForm({}); }} size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {profile.jobExperiences?.length > 0 ? (
            profile.jobExperiences.map((job: any) => (
              <div key={job.id} className="border rounded-lg p-4 flex justify-between items-start">
                <div>
                  <div className="font-semibold">{job.jobTitle}</div>
                  <div className="text-sm text-muted-foreground">{job.companyName}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(job.startDate).toLocaleDateString()} - {job.currentlyWorking ? 'Present' : new Date(job.endDate).toLocaleDateString()}
                  </div>
                  {job.jobLocation && <div className="text-xs text-muted-foreground">{job.jobLocation}</div>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteJob(job.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No job records added yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Family Details</CardTitle>
            <CardDescription>Your family information</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection(activeSection === 'family' ? null : 'family')}
          >
            {activeSection === 'family' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {activeSection === 'family' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Marital Status</Label>
                  <select
                    value={familyForm.maritalStatus}
                    onChange={(e) => setFamilyForm({ ...familyForm, maritalStatus: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
                <div>
                  <Label>Spouse Name</Label>
                  <Input
                    value={familyForm.spouseName}
                    onChange={(e) => setFamilyForm({ ...familyForm, spouseName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Number of Children</Label>
                  <Input
                    type="number"
                    value={familyForm.childrenCount}
                    onChange={(e) => setFamilyForm({ ...familyForm, childrenCount: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={updateFamilyDetails} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.maritalStatus && <div><span className="text-muted-foreground">Marital Status:</span> {profile.maritalStatus}</div>}
              {profile.spouseName && <div><span className="text-muted-foreground">Spouse:</span> {profile.spouseName}</div>}
              {profile.childrenCount > 0 && <div><span className="text-muted-foreground">Children:</span> {profile.childrenCount}</div>}
              {!profile.maritalStatus && <div className="text-muted-foreground text-sm">No family details added</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>Your contact information and social links</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection(activeSection === 'contact' ? null : 'contact')}
          >
            {activeSection === 'contact' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {activeSection === 'contact' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={contactForm.whatsapp}
                    onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={contactForm.linkedinUrl}
                    onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={contactForm.instagramUrl}
                    onChange={(e) => setContactForm({ ...contactForm, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
              </div>
              <Button onClick={updateContactDetails} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.contactDetails?.phone && <div><span className="text-muted-foreground">Phone:</span> {profile.contactDetails.phone}</div>}
              {profile.contactDetails?.whatsapp && <div><span className="text-muted-foreground">WhatsApp:</span> {profile.contactDetails.whatsapp}</div>}
              {profile.contactDetails?.email && <div><span className="text-muted-foreground">Email:</span> {profile.contactDetails.email}</div>}
              {profile.contactDetails?.linkedinUrl && (
                <div>
                  <span className="text-muted-foreground">LinkedIn:</span>{' '}
                  <a href={profile.contactDetails.linkedinUrl} target="_blank" className="text-primary hover:underline">
                    View Profile
                  </a>
                </div>
              )}
              {profile.contactDetails?.instagramUrl && (
                <div>
                  <span className="text-muted-foreground">Instagram:</span>{' '}
                  <a href={profile.contactDetails.instagramUrl} target="_blank" className="text-primary hover:underline">
                    View Profile
                  </a>
                </div>
              )}
              {!profile.contactDetails?.phone && !profile.contactDetails?.email && (
                <div className="text-muted-foreground text-sm">No contact details added</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control who can see your information</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveSection(activeSection === 'privacy' ? null : 'privacy')}
          >
            {activeSection === 'privacy' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {activeSection === 'privacy' ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Family Details</div>
                    <div className="text-sm text-muted-foreground">Marital status, spouse, children</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.familyDetailsVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, familyDetailsVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Education History</div>
                    <div className="text-sm text-muted-foreground">All education records</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.educationVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, educationVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Job History</div>
                    <div className="text-sm text-muted-foreground">All job experiences</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.jobHistoryVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, jobHistoryVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Current Job</div>
                    <div className="text-sm text-muted-foreground">Current position only</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.currentJobVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, currentJobVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Contact Details</div>
                    <div className="text-sm text-muted-foreground">Phone, email, social links</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyForm.contactDetailsVisible}
                    onChange={(e) => setPrivacyForm({ ...privacyForm, contactDetailsVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                </label>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <strong>Note:</strong> Non-alumni members can never see hidden information, regardless of privacy settings.
              </div>
              <Button onClick={updatePrivacySettings} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span>Family Details</span>
                <Badge variant={profile.privacySettings?.familyDetailsVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.familyDetailsVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Education History</span>
                <Badge variant={profile.privacySettings?.educationVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.educationVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Job History</span>
                <Badge variant={profile.privacySettings?.jobHistoryVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.jobHistoryVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Current Job</span>
                <Badge variant={profile.privacySettings?.currentJobVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.currentJobVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Contact Details</span>
                <Badge variant={profile.privacySettings?.contactDetailsVisible ? 'default' : 'secondary'}>
                  {profile.privacySettings?.contactDetailsVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Email:</span> {session?.user?.email}</div>
          <div><span className="text-muted-foreground">User Type:</span> {session?.user?.userType}</div>
          <div><span className="text-muted-foreground">Role:</span> {session?.user?.role}</div>
          <div><span className="text-muted-foreground">Loan Eligible:</span> {session?.user?.isLoanEligible ? 'Yes' : 'No'}</div>
        </CardContent>
      </Card>
    </div>
  )
}
