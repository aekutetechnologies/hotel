'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllProperties } from '@/lib/api/getAllProperties'
import { Property } from '@/types/property'
import { format, subDays, startOfWeek, startOfMonth, startOfQuarter, startOfYear, subMonths, subYears } from 'date-fns'

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  property_id?: string;
}

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const data = await getAllProperties()
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const setDateRange = (startDate: Date, endDate: Date) => {
    onFiltersChange({
      ...filters,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
    })
  }

  const setPredefinedRange = (range: string) => {
    const today = new Date()
    let start: Date
    let end: Date = today

    switch (range) {
      case 'today':
        start = today
        end = today
        break
      case 'this_week':
        start = startOfWeek(today, { weekStartsOn: 1 })
        end = today
        break
      case 'this_month':
        start = startOfMonth(today)
        end = today
        break
      case 'this_quarter':
        start = startOfQuarter(today)
        end = today
        break
      case 'this_year':
        start = startOfYear(today)
        end = today
        break
      case 'last_month':
        start = startOfMonth(subMonths(today, 1))
        end = subDays(startOfMonth(today), 1)
        break
      case 'last_year':
        start = startOfYear(subYears(today, 1))
        end = subDays(startOfYear(today), 1)
        break
      default:
        return
    }

    setDateRange(start, end)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Select date range and property to filter reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predefined Date Ranges */}
        <div>
          <Label className="mb-2 block">Quick Date Ranges</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setPredefinedRange('today')}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setPredefinedRange('this_week')}
            >
              This Week
            </Button>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setPredefinedRange('this_month')}
            >
              This Month
            </Button>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setPredefinedRange('this_quarter')}
            >
              This Quarter
            </Button>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setPredefinedRange('this_year')}
            >
              This Year
            </Button>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setPredefinedRange('last_month')}
            >
              Last Month
            </Button>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setPredefinedRange('last_year')}
            >
              Last Year
            </Button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={filters.start_date || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  start_date: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={filters.end_date || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  end_date: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Property Filter */}
        <div>
          <Label htmlFor="property">Property</Label>
          <Select
            value={filters.property_id || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                property_id: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger id="property">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {loading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

