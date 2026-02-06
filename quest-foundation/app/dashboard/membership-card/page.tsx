'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import * as htmlToImage from 'html-to-image'

interface MembershipCard {
  id: string
  cardNumber: string
  qrCodeUrl: string
  cardStatus: string
  issuedAt: string
  user: {
    profile: {
      fullName: string
      alumniId: string | null
      batchYear: number | null
      department: string | null
      profilePhotoUrl: string | null
    }
  }
}

export default function MembershipCardPage() {
  const { data: session } = useSession()
  const [card, setCard] = useState<MembershipCard | null>(null)
  const [globalTemplate, setGlobalTemplate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCard()
    fetchGlobalTemplate()
  }, [])

  const fetchCard = async () => {
    try {
      const response = await fetch('/api/membership-card')
      const data = await response.json()
      
      if (response.ok) {
        setCard(data.card)
      }
    } catch (error) {
      console.error('Failed to fetch card:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGlobalTemplate = async () => {
    try {
      const response = await fetch('/api/card-template')
      const data = await response.json()
      
      if (response.ok && data.template?.templateUrl) {
        setGlobalTemplate(data.template.templateUrl)
      }
    } catch (error) {
      console.error('Failed to fetch template:', error)
    }
  }

  const regenerateCard = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/membership-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setCard(data.card)
      }
    } catch (error) {
      console.error('Failed to regenerate card:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadCard = async () => {
    if (!cardRef.current) return

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      })

      const link = document.createElement('a')
      link.download = `quest-foundation-card-${card?.cardNumber}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to download card:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading membership card...</div>
  }

  if (!card) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Unable to load membership card.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Membership Card</h1>
        <p className="text-muted-foreground mt-1">Your digital Quest Foundation membership card</p>
      </div>

      <div 
        ref={cardRef}
        className={`rounded-xl p-8 text-white shadow-2xl ${
          globalTemplate 
            ? 'bg-cover bg-center' 
            : 'bg-gradient-to-br from-blue-600 to-indigo-700'
        }`}
        style={{
          aspectRatio: '1.586/1',
          backgroundImage: globalTemplate ? `url(${globalTemplate})` : undefined,
        }}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Quest Foundation</h2>
              <p className="text-blue-100 text-sm">Bangalore</p>
            </div>
            {card.user.profile.profilePhotoUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <Image 
                  src={card.user.profile.profilePhotoUrl} 
                  alt={card.user.profile.fullName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                QF
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{card.user.profile.fullName}</p>
              {card.user.profile.alumniId && (
                <p className="text-blue-100">ID: {card.user.profile.alumniId}</p>
              )}
              {card.user.profile.batchYear && (
                <p className="text-blue-100">Batch: {card.user.profile.batchYear}</p>
              )}
              {card.user.profile.department && (
                <p className="text-blue-100">{card.user.profile.department}</p>
              )}
              <p className="text-xs text-blue-200 mt-2">Card: {card.cardNumber}</p>
            </div>

            {card.qrCodeUrl && (
              <div className="bg-white p-2 rounded-lg">
                <Image 
                  src={card.qrCodeUrl} 
                  alt="QR Code" 
                  width={100} 
                  height={100}
                  className="w-24 h-24"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={downloadCard} className="flex-1 sm:flex-none">
          <Download className="w-4 h-4 mr-2" />
          Download Card
        </Button>
        <Button onClick={regenerateCard} variant="outline" disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate QR
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Card Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium">{card.cardStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Issued:</span>
            <span className="font-medium">{new Date(card.issuedAt).toLocaleDateString()}</span>
          </div>
          {globalTemplate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Template:</span>
              <span className="font-medium">Custom (Admin)</span>
            </div>
          )}
          <div className="pt-3 text-muted-foreground">
            <p>Scan the QR code to view public profile information.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
