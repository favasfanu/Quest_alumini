'use client'

import { useEffect, useState, MouseEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Linkedin, Instagram, MapPin, Briefcase, GraduationCap, Search, Filter } from 'lucide-react'
import Image from 'next/image'

interface Member {
  id: string
  email: string
  userType: string
  profile: {
    fullName: string
    profilePhotoUrl: string | null
    alumniId: string | null
    batchYear: number | null
    department: string | null
    course: string | null
    currentlyWorking: boolean
    city: string | null
    state: string | null
    country: string | null
    currentJob: {
      companyName: string
      jobTitle: string
      industry: string | null
      jobLocation: string | null
    } | null
    educationRecords: any[]
    jobExperiences: any[]
    contactDetails: {
      phone: string | null
      whatsapp: string | null
      email: string | null
      linkedinUrl: string | null
      instagramUrl: string | null
    } | null
  }
}

interface MemberFiltersMetadata {
  batchYears: number[]
  departments: string[]
  companies: string[]
  userTypes: string[]
  countries: string[]
  statesByCountry: Record<string, string[]>
}

export default function MembersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    batchYear: '',
    department: '',
    company: '',
    country: '',
    state: '',
    userType: '',
  })
  const [filterMetadata, setFilterMetadata] = useState<MemberFiltersMetadata | null>(null)

  const isNonAlumni = session?.user?.role === 'NON_ALUMNI_MEMBER'

  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.batchYear) params.append('batchYear', filters.batchYear)
      if (filters.department) params.append('department', filters.department)
      if (filters.company) params.append('company', filters.company)
      if (filters.country) params.append('country', filters.country)
      if (filters.state) params.append('state', filters.state)
      if (filters.userType) params.append('userType', filters.userType)

      const response = await fetch(`/api/members?${params.toString()}`)
      const data = await response.json()
      setMembers(data.members || [])
      setFilterMetadata(data.filters || null)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      // Reset dependent filters when parent changes
      ...(field === 'country' ? { state: '' } : {}),
    }))
  }

  const handleCardClick = (memberId: string) => {
    router.push(`/dashboard/members/${memberId}`)
  }

  const stopPropagation = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const hasMembers = members.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Members Directory</h1>
        <p className="text-muted-foreground mt-1">Connect with alumni and members</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search &amp; Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Name</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => handleSearchChange('search', e.target.value)}
              />
            </div>

            {!isNonAlumni && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="batchYear">Batch Year</Label>
                  <select
                    id="batchYear"
                    value={filters.batchYear}
                    onChange={(e) => handleSearchChange('batchYear', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    {filterMetadata?.batchYears?.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    value={filters.department}
                    onChange={(e) => handleSearchChange('department', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    {filterMetadata?.departments?.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <select
                id="company"
                value={filters.company}
                onChange={(e) => handleSearchChange('company', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {filterMetadata?.companies?.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <select
                id="userType"
                value={filters.userType}
                onChange={(e) => handleSearchChange('userType', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {filterMetadata?.userTypes?.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                value={filters.country}
                onChange={(e) => handleSearchChange('country', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {filterMetadata?.countries?.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                value={filters.state}
                onChange={(e) => handleSearchChange('state', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={!filters.country}
              >
                <option value="">All</option>
                {filters.country &&
                  filterMetadata?.statesByCountry?.[filters.country]?.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-3 h-3" />
              <span>
                Showing {members.length} member{members.length === 1 ? '' : 's'}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  search: '',
                  batchYear: '',
                  department: '',
                  company: '',
                  country: '',
                  state: '',
                  userType: '',
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && !hasMembers && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading members...</CardContent>
        </Card>
      )}

      {!loading && !hasMembers && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No members found matching your search criteria.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {members.map((member) => (
          <Card
            key={member.id}
            className="cursor-pointer transition hover:border-primary/50"
            onClick={() => handleCardClick(member.id)}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {member.profile.profilePhotoUrl ? (
                    <Image
                      src={member.profile.profilePhotoUrl}
                      alt={member.profile.fullName}
                      width={96}
                      height={96}
                      className="rounded-full w-24 h-24 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                      {member.profile.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold">{member.profile.fullName}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">{member.userType.replace('_', ' ')}</Badge>
                        {member.profile.alumniId && (
                          <Badge variant="outline">ID: {member.profile.alumniId}</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(member.id)
                      }}
                    >
                      View Profile
                    </Button>
                  </div>

                  {!isNonAlumni && member.profile.batchYear && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span>
                        {member.profile.course} • {member.profile.department} • Batch {member.profile.batchYear}
                      </span>
                    </div>
                  )}

                  {member.profile.currentJob && (
                    <div className="flex items-start gap-2 text-sm">
                      <Briefcase className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">{member.profile.currentJob.jobTitle}</div>
                        <div className="text-muted-foreground">{member.profile.currentJob.companyName}</div>
                        {member.profile.currentJob.jobLocation && (
                          <div className="text-muted-foreground text-xs">{member.profile.currentJob.jobLocation}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {(member.profile.city || member.profile.state || member.profile.country) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[member.profile.city, member.profile.state, member.profile.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  {member.profile.contactDetails && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {member.profile.contactDetails.email && (
                        <a
                          href={`mailto:${member.profile.contactDetails.email}`}
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                          onClick={stopPropagation}
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </a>
                      )}
                      {member.profile.contactDetails.whatsapp && (
                        <a
                          href={`https://wa.me/${member.profile.contactDetails.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                          onClick={stopPropagation}
                        >
                          <Phone className="w-4 h-4" />
                          WhatsApp
                        </a>
                      )}
                      {member.profile.contactDetails.linkedinUrl && (
                        <a
                          href={member.profile.contactDetails.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          onClick={stopPropagation}
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </a>
                      )}
                      {member.profile.contactDetails.instagramUrl && (
                        <a
                          href={member.profile.contactDetails.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-pink-600 hover:underline"
                          onClick={stopPropagation}
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
