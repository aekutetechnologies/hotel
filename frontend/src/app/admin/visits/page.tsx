'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { usePermissions } from '@/hooks/usePermissions'
import { fetchVisits, updateVisitStatus, HostelVisit } from '@/lib/api/visitManagement'

export default function HostelVisitsPage() {
  const { can } = usePermissions()
  const [visits, setVisits] = useState<HostelVisit[]>([])
  const [filteredVisits, setFilteredVisits] = useState<HostelVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadVisits()
  }, [])

  useEffect(() => {
    filterVisits()
  }, [visits, searchTerm, statusFilter])

  const loadVisits = async () => {
    try {
      setLoading(true)
      const data = await fetchVisits()
      setVisits(data)
    } catch (error) {
      console.error('Failed to load visits:', error)
      toast.error('Failed to load visits')
    } finally {
      setLoading(false)
    }
  }

  const filterVisits = () => {
    let filtered = [...visits]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(visit => visit.status === statusFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(visit =>
        visit.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visit.user?.name || visit.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visit.user?.mobile || visit.phone).includes(searchTerm)
      )
    }

    setFilteredVisits(filtered)
  }

  const handleUpdateVisitStatus = async (visitId: number, newStatus: string) => {
    try {
      await updateVisitStatus(visitId, newStatus)
      toast.success('Visit status updated')
      loadVisits()
    } catch (error) {
      console.error('Failed to update visit:', error)
      toast.error('Failed to update visit status')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
      converted_to_booking: { label: 'Converted', className: 'bg-purple-100 text-purple-800' },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hostel Visit Requests</h1>
          <p className="text-gray-600 mt-1">Manage hostel visit bookings</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by property, user name, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'neutral'}
                onClick={() => setStatusFilter('all')}
                size="sm"
                className={statusFilter === 'all' ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
              >
                All ({visits.length})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'neutral'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
                className={statusFilter === 'pending' ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
              >
                Pending ({visits.filter(v => v.status === 'pending').length})
              </Button>
              <Button
                variant={statusFilter === 'confirmed' ? 'default' : 'neutral'}
                onClick={() => setStatusFilter('confirmed')}
                size="sm"
                className={statusFilter === 'confirmed' ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
              >
                Confirmed ({visits.filter(v => v.status === 'confirmed').length})
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'neutral'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
                className={statusFilter === 'completed' ? 'bg-[#B11E43] hover:bg-[#8f1836]' : ''}
              >
                Completed ({visits.filter(v => v.status === 'completed').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visits List */}
      {filteredVisits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 text-lg">No visit requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredVisits.map((visit) => (
            <Card key={visit.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#B11E43] to-[#8f1836] rounded-lg flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          {visit.property.name}
                        </h2>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {visit.property.location}
                        </p>
                      </div>
                      {getStatusBadge(visit.status)}
                    </div>

                    {/* Visit Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(visit.visit_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{visit.visit_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{visit.user?.name || visit.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{visit.number_of_guests} guest(s)</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="text-sm text-gray-600 mb-4">
                      <strong>Contact:</strong> {visit.user?.mobile || visit.phone}
                    </div>

                    {visit.notes && (
                      <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">
                        <strong>Notes:</strong> {visit.notes}
                      </div>
                    )}

                    {/* Actions */}
                    {can('booking:update') && (
                      <div className="flex gap-2">
                        {visit.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="neutral"
                              onClick={() => handleUpdateVisitStatus(visit.id, 'confirmed')}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="neutral"
                              onClick={() => handleUpdateVisitStatus(visit.id, 'cancelled')}
                              className="bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {visit.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="neutral"
                            onClick={() => handleUpdateVisitStatus(visit.id, 'completed')}
                            className="bg-green-50 text-green-600 hover:bg-green-100"
                          >
                            Mark as Completed
                          </Button>
                        )}
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

