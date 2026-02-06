import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Linkedin, Instagram, MapPin, Briefcase, GraduationCap } from 'lucide-react'
import Image from 'next/image'

export default async function PublicMemberPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id, status: 'APPROVED' },
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

  const privacy = user.profile.privacySettings
  const canSeeContact = !!privacy?.contactDetailsVisible
  const canSeeEducation = !!privacy?.educationVisible
  const canSeeJobHistory = !!privacy?.jobHistoryVisible
  const canSeeCurrentJob = privacy?.currentJobVisible !== false

  const currentJob = user.profile.jobExperiences.find((j) => j.currentlyWorking)
  const jobHistory = user.profile.jobExperiences

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-12">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              {user.profile.profilePhotoUrl ? (
                <Image
                  src={user.profile.profilePhotoUrl}
                  alt={user.profile.fullName}
                  width={120}
                  height={120}
                  className="rounded-full w-30 h-30 object-cover"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold">
                  {user.profile.fullName.charAt(0)}
                </div>
              )}
            </div>
            <CardTitle className="text-3xl">{user.profile.fullName}</CardTitle>
            <div className="flex justify-center gap-2 mt-3">
              <Badge>Quest Foundation</Badge>
              {user.profile.alumniId && <Badge variant="outline">ID: {user.profile.alumniId}</Badge>}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Work */}
            {(canSeeCurrentJob || canSeeJobHistory) && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work
                </h3>

                {canSeeCurrentJob && currentJob && (
                  <div className="pl-7">
                    <div className="text-sm text-muted-foreground">Current Position</div>
                    <div className="font-semibold text-lg">{currentJob.jobTitle}</div>
                    <div className="text-muted-foreground">{currentJob.companyName}</div>
                    {currentJob.jobLocation && (
                      <div className="text-sm text-muted-foreground mt-1">{currentJob.jobLocation}</div>
                    )}
                  </div>
                )}

                {canSeeJobHistory && jobHistory.length > 0 && (
                  <div className="pl-7 mt-4 space-y-2">
                    <div className="text-sm text-muted-foreground">Work History</div>
                    {jobHistory.map((job) => (
                      <div key={job.id} className="border rounded-lg p-3 bg-white/60 text-sm">
                        <div className="font-semibold">{job.jobTitle}</div>
                        <div className="text-muted-foreground">{job.companyName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(job.startDate).toLocaleDateString()} -{' '}
                          {job.currentlyWorking || !job.endDate
                            ? 'Present'
                            : new Date(job.endDate).toLocaleDateString()}
                        </div>
                        {job.jobLocation && (
                          <div className="text-xs text-muted-foreground">{job.jobLocation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!canSeeCurrentJob && !canSeeJobHistory && (
                  <div className="pl-7 text-sm text-muted-foreground">
                    Work details are hidden by this member.
                  </div>
                )}
              </div>
            )}

            {user.profile.currentlyWorking && (
              <div className="border-t pt-6">
                <Badge variant="outline" className="bg-green-50">Currently Working</Badge>
              </div>
            )}

            {(user.profile.city || user.profile.state || user.profile.country) && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                </h3>
                <div className="pl-7">
                  {[user.profile.city, user.profile.state, user.profile.country]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </h3>
              {canSeeEducation && user.profile.educationRecords.length > 0 ? (
                <div className="pl-7 space-y-2">
                  {user.profile.educationRecords.map((edu) => (
                    <div key={edu.id} className="border rounded-lg p-3 bg-white/60 text-sm">
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
                <div className="pl-7 text-sm text-muted-foreground">
                  {canSeeEducation ? 'No education records shared.' : 'Education is hidden by this member.'}
                </div>
              )}
            </div>

            {canSeeContact && user.profile.contactDetails && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3 pl-7">
                  {user.profile.contactDetails.email && (
                    <a
                      href={`mailto:${user.profile.contactDetails.email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {user.profile.contactDetails.email}
                    </a>
                  )}
                  {user.profile.contactDetails.whatsapp && (
                    <a
                      href={`https://wa.me/${user.profile.contactDetails.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                  {user.profile.contactDetails.linkedinUrl && (
                    <a
                      href={user.profile.contactDetails.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {user.profile.contactDetails.instagramUrl && (
                    <a
                      href={user.profile.contactDetails.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-600 hover:underline"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Quest Foundation - Bangalore</p>
        </div>
      </div>
    </div>
  )
}
