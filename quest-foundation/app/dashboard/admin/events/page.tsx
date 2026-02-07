'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, X, Users, Image as ImageIcon, Eye, EyeOff, Calendar, MapPin, ExternalLink } from 'lucide-react'

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
    visibility: string
  }>
  participants: Array<{
    userId: string
    user: {
      id: string
      email: string
      profile: {
        fullName: string
      }
    }
  }>
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    mapLink: '',
    startDate: '',
    endDate: '',
    description: '',
  })
  const [mediaLinks, setMediaLinks] = useState<Array<{ url: string; type: string; visibility: string }>>([])
  const [participantIds, setParticipantIds] = useState<string[]>([])

  useEffect(() => {
    fetchEvents()
    fetchUsers()
  }, [filterStatus])

  const fetchEvents = async () => {
    try {
      const url = filterStatus === 'all' ? '/api/events' : `/api/events?status=${filterStatus}`
      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/members')
      const data = await response.json()
      if (response.ok) {
        setAvailableUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingEvent ? `/api/events/${editingEvent}` : '/api/events'
      const method = editingEvent ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mediaLinks,
          participantIds
        })
      })

      if (response.ok) {
       await fetchEvents()
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save event')
      }
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchEvents()
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event.id)
    setFormData({
      name: event.name,
      location: event.location || '',
      mapLink: event.mapLink || '',
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      description: event.description || ''
    })
    setMediaLinks(event.media.map(m => ({ url: m.mediaUrl, type: m.mediaType || 'link', visibility: m.visibility })))
    setParticipantIds(event.participants.map(p => p.userId))
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      mapLink: '',
      startDate: '',
      endDate: '',
      description: ''
    })
    setMediaLinks([])
    setParticipantIds([])
    setShowForm(false)
setEditingEvent(null)
  }

  const addMediaLink = () => {
    setMediaLinks([...mediaLinks, { url: '', type: 'link', visibility: 'public' }])
  }

  const removeMediaLink = (index: number) => {
    setMediaLinks(mediaLinks.filter((_, i) => i !== index))
  }

  const updateMediaLink = (index: number, field: string, value: string) => {
    const updated = [...mediaLinks]
    updated[index] = { ...updated[index], [field]: value }
    setMediaLinks(updated)
  }

  const toggleParticipant = (userId: string) => {
    setParticipantIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return <Badge className={styles[status as keyof typeof styles]}>{status.toUpperCase()}</Badge>
  }

  if (loading && events.length === 0) {
    return <div className="text-center py-12">Loading events...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage alumni events</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'Create Event'}
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
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

      {/* Event Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Annual Alumni Meet 2026"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Quest Foundation Campus"
                  />
                </div>
              </div>

              <div>
                <Label>Google Maps Link</Label>
                <Input
                  type="url"
                  value={formData.mapLink}
                  onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>End Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border-2 border-gray-300 bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description..."
                />
              </div>

              {/* Media Links */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Media Links</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addMediaLink}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Media
                  </Button>
                </div>
                {mediaLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Media URL"
                      value={link.url}
                      onChange={(e) => updateMediaLink(index, 'url', e.target.value)}
                    />
                    <select
                      className="flex h-10 rounded-md border-2 border-gray-300 bg-background px-3 py-2 text-sm"
                      value={link.visibility}
                      onChange={(e) => updateMediaLink(index, 'visibility', e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="admin_only">Admin Only</option>
                    </select>
                    <Button type="button" size="sm" variant="destructive" onClick={() => removeMediaLink(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Participants */}
              <div>
                <Label>Select Participants ({participantIds.length} selected)</Label>
                <div className="border-2 border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                  {availableUsers.map(user => (
                    <label key={user.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={participantIds.includes(user.id)}
                        onChange={() => toggleParticipant(user.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{user.profile?.fullName || user.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No events found. Create your first event!
            </CardContent>
          </Card>
        ) : (
          events.map(event => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle>{event.name}</CardTitle>
                      {getStatusBadge(event.status)}
                    </div>
                    <CardDescription className="mt-2 space-y-1">
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                          {event.mapLink && (
                            <a href={event.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(event.startDate).toLocaleString()} → {new Date(event.endDate).toLocaleString()}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <Users className="w-4 h-4" />
                      Participants ({event.participants.length})
                    </div>
                    <div className="space-y-1">
                      {event.participants.slice(0, 3).map(p => (
                        <div key={p.userId} className="text-sm">{p.user.profile.fullName}</div>
                      ))}
                      {event.participants.length > 3 && (
                        <div className="text-sm text-muted-foreground">+{event.participants.length - 3} more</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <ImageIcon className="w-4 h-4" />
                      Media ({event.media.length})
                    </div>
                    <div className="space-y-1">
                      {event.media.slice(0, 2).map(m => (
                        <div key={m.id} className="flex items-center gap-2 text-sm">
                          {m.visibility === 'admin_only' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span className="truncate">{m.mediaUrl}</span>
                        </div>
                      ))}
                      {event.media.length > 2 && (
                        <div className="text-sm text-muted-foreground">+{event.media.length - 2} more</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
