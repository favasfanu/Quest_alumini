'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function DashboardNav({ session }: { session: any }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [liveRole, setLiveRole] = useState<string | null>(session?.user?.role || null)
  
  const moreRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/role')
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setLiveRole(data?.role || null)
        }
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAdmin = liveRole === 'ADMIN'
  const isLoanManager = liveRole === 'LOAN_MANAGER' || isAdmin
  const isNonAlumni = liveRole === 'NON_ALUMNI_MEMBER'

  // Get user initials
  const getUserInitials = () => {
    const name = session?.user?.name || session?.user?.email || 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrator'
    if (isLoanManager) return 'Loan Manager'
    if (isNonAlumni) return 'Non-Alumni Member'
    return 'Alumni Member'
  }

  // Main navigation items (4-5 items)
  const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/members', label: 'Members' },
    { href: '/dashboard/profile', label: 'My Profile' },
    { href: '/dashboard/loans', label: 'Loans' },
    { href: isAdmin ? '/dashboard/admin/events' : '/dashboard/events', label: 'Events' },
  ]

  // More dropdown items
  const moreNavItems = [
    { href: '/dashboard/membership-card', label: 'Membership Card', show: !isNonAlumni },
    { href: '/dashboard/admin', label: 'Admin Panel', show: isAdmin },
    { href: '/dashboard/loan-manager', label: 'Loan Management', show: isLoanManager },
  ].filter(item => item.show)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 flex-shrink-0">
            <Image 
              src="/favicon-32.png" 
              alt="Quest Foundation" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="font-semibold text-lg text-gray-900 hidden sm:block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Quest Foundation
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive(item.href)
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
                )}
              </Link>
            ))}

            {/* More Dropdown */}
            {moreNavItems.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150"
                >
                  <span>More</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    {moreNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`block px-4 py-2.5 text-sm transition-colors duration-150 ${
                          isActive(item.href)
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{session?.user?.name || session?.user?.email}</span>
                  <span className="text-xs text-gray-500">{getRoleLabel()}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold">
                  {getUserInitials()}
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name || session?.user?.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getRoleLabel()}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {moreNavItems.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    More
                  </div>
                  {moreNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-2.5 text-sm rounded-md ${
                        isActive(item.href)
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
            
            <div className="border-t border-gray-200 mt-3 pt-3">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || session?.user?.email}</p>
                <p className="text-xs text-gray-500 mt-0.5">{getRoleLabel()}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
