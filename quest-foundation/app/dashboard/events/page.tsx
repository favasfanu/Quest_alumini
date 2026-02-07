'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, ExternalLink, Image as ImageIcon, Users } from 'lucide-react'

interface Event {
  id: string
  name: string
  location: string | null
  mapLink: string | null
  startDate: string
  endDate: string
  description: string | null
  status: 'upcoming' | 'ongoing' | 'completed'
  media: Array<{
    id: string
    mediaUrl: string
    mediaType: string | null
  }>
  participants: Array<{
    userId: string
    user: {
      profile: {
        fullName: string
      }
    }
  }>
}

export default function AlumniEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const url = filterStatus === 'all' ? '/api/events' : `/api/events?status=${filterStatus}`
      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        setEvents(data.events || [])
      } else {
        console.error('Failed to fetch events:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      ongoing: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading your events...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Events</h1>
        <p className="text-muted-foreground mt-1">View events you&apos;re participating in</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'upcoming', 'ongoing', 'completed'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              {filterStatus === 'all' 
                ? "You&apos;re not participating in any events yet." 
                : `No ${filterStatus} events found.`}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map(event => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-2xl">{event.name}</CardTitle>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <CardDescription className="mt-3 space-y-2">
                      {event.location && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{event.location}</span>
                            {event.mapLink && (
                              <a 
                                href={event.mapLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                              >
                                <span className="text-xs">View Map</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-sm">Start: {formatDate(event.startDate)}</div>
                          <div className="font-semibold text-sm">End: {formatDate(event.endDate)}</div>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {event.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  {/* Participants Section */}
                  <div>
                    <div className="flex items-center gap-2 font-semibold mb-3">
                      <Users className="w-4 h-4" />
                      <span>Participants ({event.participants.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {event.participants.slice(0, 5).map(p => (
                        <div 
                          key={p.userId} 
                          className="text-sm bg-gray-50 px-3 py-1.5 rounded-md"
                        >
                          {p.user.profile.fullName}
                        </div>
                      ))}
                      {event.participants.length > 5 && (
                        <div className="text-sm text-muted-foreground italic px-3">
                          +{event.participants.length - 5} more participants
                        </div>
                      )}
                      {event.participants.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">
                          No participants yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Media Section (Public Only) */}
                  <div>
                    <div className="flex items-center gap-2 font-semibold mb-3">
                      <ImageIcon className="w-4 h-4" />
                      <span>Media ({event.media.length})</span>
                    </div>
                    {event.media.length > 0 ? (
                      <div className="space-y-2">
                        {event.media.map(m => (
                          <a
                            key={m.id}
                            href={m.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors group"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0 group-hover:text-blue-600" />
                            <span className="truncate">{m.mediaUrl}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No media available
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
