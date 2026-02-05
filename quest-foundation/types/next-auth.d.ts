import 'next-auth'
import { UserRole, UserType, UserStatus } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name?: string | null
    role: UserRole
    userType: UserType
    status: UserStatus
    isLoanEligible: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: UserRole
      userType: UserType
      status: UserStatus
      isLoanEligible: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    userType: UserType
    status: UserStatus
    isLoanEligible: boolean
  }
}
