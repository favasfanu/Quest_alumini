'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, Users, CreditCard, Settings, LogOut, FileText } from 'lucide-react'
import { useState } from 'react'

export default function DashboardNav({ session }: { session: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN'
  const isLoanManager = session?.user?.role === 'LOAN_MANAGER' || isAdmin
  const isNonAlumni = session?.user?.role === 'NON_ALUMNI_MEMBER'

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, show: true },
    { href: '/dashboard/members', label: 'Members', icon: Users, show: true },
    { href: '/dashboard/profile', label: 'My Profile', icon: Users, show: true },
    { href: '/dashboard/membership-card', label: 'Membership Card', icon: CreditCard, show: !isNonAlumni },
    { href: '/dashboard/loans', label: 'Quest Care Loans', icon: FileText, show: true },
    { href: '/dashboard/admin', label: 'Admin Panel', icon: Settings, show: isAdmin },
    { href: '/dashboard/loan-manager', label: 'Loan Management', icon: FileText, show: isLoanManager },
  ]

  const visibleItems = navItems.filter(item => item.show)

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              QF
            </div>
            <span className="font-bold text-xl hidden sm:inline">Quest Foundation</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {visibleItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {visibleItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 rounded-md"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 rounded-md w-full text-left text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
