import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const batchYear = searchParams.get('batchYear') || ''
  const department = searchParams.get('department') || ''
  const company = searchParams.get('company') || ''
  const country = searchParams.get('country') || ''
  const state = searchParams.get('state') || ''
  const city = searchParams.get('city') || ''
  const userTypeFilter = searchParams.get('userType') || ''

  const isNonAlumni = session.user.role === 'NON_ALUMNI_MEMBER'
  const isAdmin = session.user.role === 'ADMIN'

  try {
    const users = await prisma.user.findMany({
      where: {
        status: 'APPROVED',
        id: { not: session.user.id },
      },
      include: {
        profile: {
          include: {
            privacySettings: true,
            contactDetails: true,
            educationRecords: isNonAlumni
              ? false
              : {
                  orderBy: { startYear: 'desc' },
                  take: 1,
                },
            jobExperiences: {
              orderBy: { startDate: 'desc' },
            },
          },
        },
      },
    })

    // First, build a privacy-aware projection of members
    const members = users
      .filter((user) => !!user.profile)
      .map((user) => {
        const profile = user.profile!
        const privacy = profile.privacySettings

        const isSelf = user.id === session.user.id

        const canSeeEducation =
          isSelf || isAdmin || (!isNonAlumni && privacy?.educationVisible)
        const canSeeJobHistory =
          isSelf || isAdmin || (!isNonAlumni && privacy?.jobHistoryVisible)
        const canSeeCurrentJob =
          isSelf || isAdmin || privacy?.currentJobVisible
        const canSeeContact =
          isSelf || isAdmin || privacy?.contactDetailsVisible
        const canSeeFamilyDetails =
          isSelf || isAdmin || (!isNonAlumni && privacy?.familyDetailsVisible)

        const currentJob = profile.jobExperiences.find((j) => j.currentlyWorking)

        return {
          id: user.id,
          userType: user.userType,
          profile: {
            fullName: profile.fullName,
            profilePhotoUrl: profile.profilePhotoUrl,
            alumniId: isNonAlumni ? null : profile.alumniId,
            batchYear: isNonAlumni ? null : profile.batchYear,
            department: isNonAlumni ? null : profile.department,
            course: isNonAlumni ? null : profile.course,
            currentlyWorking: profile.currentlyWorking,
            currentlyStudying: isNonAlumni ? null : profile.currentlyStudying,
            city: profile.city,
            state: profile.state,
            country: profile.country,

            maritalStatus: canSeeFamilyDetails ? profile.maritalStatus : null,
            spouseName: canSeeFamilyDetails ? profile.spouseName : null,
            childrenCount: canSeeFamilyDetails ? profile.childrenCount : null,

            educationRecords: canSeeEducation ? profile.educationRecords : [],

            currentJob:
              canSeeCurrentJob && currentJob
                ? {
                    companyName: currentJob.companyName,
                    jobTitle: currentJob.jobTitle,
                    industry: currentJob.industry,
                    jobLocation: currentJob.jobLocation,
                  }
                : null,

            jobExperiences: canSeeJobHistory ? profile.jobExperiences : [],

            contactDetails: canSeeContact ? profile.contactDetails : null,
          },
        }
      })

    // Build dynamic filter metadata from the privacy-aware member set
    const batchYearSet = new Set<number>()
    const departmentSet = new Set<string>()
    const companySet = new Set<string>()
    const userTypeSet = new Set<string>()
    const countrySet = new Set<string>()
    const statesByCountry: Record<string, Set<string>> = {}
    const citiesByCountryState: Record<string, Set<string>> = {}

    for (const member of members) {
      userTypeSet.add(member.userType)

      const p = member.profile
      if (!isNonAlumni && p.batchYear) {
        batchYearSet.add(p.batchYear)
      }
      if (!isNonAlumni && p.department) {
        departmentSet.add(p.department)
      }
      if (p.currentJob?.companyName) {
        companySet.add(p.currentJob.companyName)
      }
      if (p.country) {
        countrySet.add(p.country)
        if (p.state) {
          if (!statesByCountry[p.country]) {
            statesByCountry[p.country] = new Set<string>()
          }
          statesByCountry[p.country]!.add(p.state)

          if (p.city) {
            const key = `${p.country}||${p.state}`
            if (!citiesByCountryState[key]) {
              citiesByCountryState[key] = new Set<string>()
            }
            citiesByCountryState[key]!.add(p.city)
          }
        }
      }
    }

    const filters = {
      batchYears: isNonAlumni ? [] : Array.from(batchYearSet).sort(),
      departments: isNonAlumni ? [] : Array.from(departmentSet).sort(),
      companies: Array.from(companySet).sort(),
      userTypes: Array.from(userTypeSet),
      countries: Array.from(countrySet).sort(),
      statesByCountry: Object.fromEntries(
        Object.entries(statesByCountry).map(([countryKey, statesSet]) => [
          countryKey,
          Array.from(statesSet).sort(),
        ]),
      ),
      citiesByCountryState: Object.fromEntries(
        Object.entries(citiesByCountryState).map(([key, citiesSet]) => [
          key,
          Array.from(citiesSet).sort(),
        ]),
      ),
    }

    // Apply search & filters on the privacy-aware members
    const filteredMembers = members.filter((member) => {
      const p = member.profile

      const nameMatch =
        !search ||
        p.fullName.toLowerCase().includes(search.toLowerCase())

      const batchMatch =
        !batchYear ||
        (p.batchYear && p.batchYear.toString() === batchYear)

      const deptMatch =
        !department ||
        (p.department &&
          p.department.toLowerCase().includes(department.toLowerCase()))

      let companyMatch = true
      if (company) {
        companyMatch = !!(
          p.currentJob &&
          p.currentJob.companyName
            .toLowerCase()
            .includes(company.toLowerCase())
        )
      }

      const countryMatch = !country || p.country === country
      const stateMatch = !state || p.state === state
      const cityMatch =
        !city ||
        (p.city && p.city.toLowerCase().includes(city.toLowerCase()))

      const userTypeMatch =
        !userTypeFilter || member.userType === userTypeFilter

      return (
        nameMatch &&
        batchMatch &&
        deptMatch &&
        companyMatch &&
        countryMatch &&
        stateMatch &&
        cityMatch &&
        userTypeMatch
      )
    })

    return NextResponse.json({ members: filteredMembers, filters })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}
