import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Phone,
  Linkedin,
  Instagram,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
} from 'lucide-react'
import Image from 'next/image'

interface MemberDetailPageProps {
  params: { id: string }
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    // Fall back to NextAuth default sign-in if no custom login route is known
    redirect('/api/auth/signin')
  }

  const viewer = session.user
  const isAdmin = viewer.role === 'ADMIN'
  const isNonAlumniViewer = viewer.role === 'NON_ALUMNI_MEMBER'

  const user = await prisma.user.findUnique({
    where: {
      id: params.id,
      status: 'APPROVED',
    },
    include: {
      profile: {
        include: {
          privacySettings: true,
          contactDetails: true,
          educationRecords: {
            orderBy: { startYear: 'desc' },
          },
          jobExperiences: {
            orderBy: { startDate: 'desc' },
          },
        },
      },
    },
  })

  if (!user || !user.profile) {
    notFound()
  }

  const profile = user.profile
  const privacy = profile.privacySettings
  const isSelf = viewer.id === user.id

  const canSeeEducation =
    isSelf || isAdmin || (!isNonAlumniViewer && privacy?.educationVisible)
  const canSeeJobHistory =
    isSelf || isAdmin || (!isNonAlumniViewer && privacy?.jobHistoryVisible)
  const canSeeCurrentJob =
    isSelf || isAdmin || privacy?.currentJobVisible
  const canSeeContact =
    isSelf || isAdmin || privacy?.contactDetailsVisible
  const canSeeFamilyDetails =
    isSelf || isAdmin || (!isNonAlumniViewer && privacy?.familyDetailsVisible)

  const currentJob = profile.jobExperiences.find((j) => j.currentlyWorking)

  const displayAlumniId = isNonAlumniViewer ? null : profile.alumniId
  const displayBatchYear = isNonAlumniViewer ? null : profile.batchYear
  const displayDepartment = isNonAlumniViewer ? null : profile.department
  const displayCourse = isNonAlumniViewer ? null : profile.course

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Member Profile</h1>
        <p className="text-muted-foreground mt-1">
          Detailed profile view with privacy-aware sections
        </p>
      </div>

      {/* Profile overview */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {profile.profilePhotoUrl ? (
                <Image
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  width={96}
                  height={96}
                  className="rounded-full w-24 h-24 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                  {profile.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{profile.fullName}</CardTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{user.userType.replace('_', ' ')}</Badge>
                <Badge variant="outline">{user.role.replace('_', ' ')}</Badge>
                {displayAlumniId && (
                  <Badge variant="outline">ID: {displayAlumniId}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Account Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Status:</span> {user.status}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {displayBatchYear && (
              <div>
                <div className="text-muted-foreground">Batch Year</div>
                <div className="font-medium">{displayBatchYear}</div>
              </div>
            )}
            {displayDepartment && (
              <div>
                <div className="text-muted-foreground">Department</div>
                <div className="font-medium">{displayDepartment}</div>
              </div>
            )}
            {displayCourse && (
              <div>
                <div className="text-muted-foreground">Course</div>
                <div className="font-medium">{displayCourse}</div>
              </div>
            )}
            {(profile.city || profile.state || profile.country) && (
              <div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
                <div className="font-medium">
                  {[profile.city, profile.state, profile.country]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {profile.currentlyWorking && (
              <Badge variant="outline" className="bg-green-50">
                Currently Working
              </Badge>
            )}
            {profile.currentlyStudying && (
              <Badge variant="outline" className="bg-blue-50">
                Currently Studying
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canSeeCurrentJob && currentJob && (
            <div className="border rounded-lg p-4 bg-muted/40">
              <div className="text-sm text-muted-foreground mb-1">Current Position</div>
              <div className="font-semibold">{currentJob.jobTitle}</div>
              <div className="text-sm text-muted-foreground">
                {currentJob.companyName}
              </div>
              {currentJob.jobLocation && (
                <div className="text-xs text-muted-foreground mt-1">
                  {currentJob.jobLocation}
                </div>
              )}
            </div>
          )}

          {canSeeJobHistory && profile.jobExperiences.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4" />
                Previous Roles
              </div>
              <div className="space-y-2">
                {profile.jobExperiences.map((job) => (
                  <div key={job.id} className="border rounded-lg p-3 text-sm">
                    <div className="font-semibold">{job.jobTitle}</div>
                    <div className="text-muted-foreground">{job.companyName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(job.startDate).toLocaleDateString()} -{' '}
                      {job.currentlyWorking || !job.endDate
                        ? 'Present'
                        : new Date(job.endDate).toLocaleDateString()}
                    </div>
                    {job.jobLocation && (
                      <div className="text-xs text-muted-foreground">
                        {job.jobLocation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {canSeeJobHistory
                ? 'No work history added.'
                : 'Work history is hidden by this member.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canSeeEducation && profile.educationRecords.length > 0 ? (
            <div className="space-y-3">
              {profile.educationRecords.map((edu) => (
                <div key={edu.id} className="border rounded-lg p-3 text-sm">
                  <div className="font-semibold">
                    {edu.degree}
                    {edu.fieldOfStudy ? ` - ${edu.fieldOfStudy}` : ''}
                  </div>
                  <div className="text-muted-foreground">{edu.institution}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {edu.startYear} - {edu.currentlyStudying ? 'Present' : edu.endYear}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {canSeeEducation
                ? 'No education records added.'
                : 'Education history is hidden by this member.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact section */}
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent>
          {canSeeContact && profile.contactDetails ? (
            <div className="space-y-3">
              {profile.contactDetails.email && (
                <a
                  href={`mailto:${profile.contactDetails.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {profile.contactDetails.email}
                </a>
              )}
              {profile.contactDetails.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{profile.contactDetails.phone}</span>
                </div>
              )}
              {profile.contactDetails.whatsapp && (
                <a
                  href={`https://wa.me/${profile.contactDetails.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
              {profile.contactDetails.linkedinUrl && (
                <a
                  href={profile.contactDetails.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {profile.contactDetails.instagramUrl && (
                <a
                  href={profile.contactDetails.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-pink-600 hover:underline"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Contact information is hidden by this member.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address section (derived from profile) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(profile.city || profile.state || profile.country) ? (
            <div className="space-y-1 text-sm">
              {profile.city && (
                <div>
                  <span className="text-muted-foreground">City:</span>{' '}
                  <span className="font-medium">{profile.city}</span>
                </div>
              )}
              {profile.state && (
                <div>
                  <span className="text-muted-foreground">State:</span>{' '}
                  <span className="font-medium">{profile.state}</span>
                </div>
              )}
              {profile.country && (
                <div>
                  <span className="text-muted-foreground">Country:</span>{' '}
                  <span className="font-medium">{profile.country}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No address information provided.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

