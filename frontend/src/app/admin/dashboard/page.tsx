'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Building2, 
  CalendarCheck, 
  CircleDollarSign, 
  Users, 
  Hotel, 
  Home, 
  Calendar, 
  CreditCard, 
  ShoppingBag, 
  UserPlus,
  ArrowUp
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { usePermissions } from '@/hooks/usePermissions'
import { fetchDashboardStats, DashboardStats } from '@/lib/api/fetchDashboardStats'
import { fetchPropertyOccupancyStats, PropertyOccupancyStat } from '@/lib/api/fetchPropertyOccupancyStats'

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [propertyOccupancyStats, setPropertyOccupancyStats] = useState<PropertyOccupancyStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { can, isLoaded } = usePermissions()

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const stats = await fetchDashboardStats()
      setDashboardStats(stats)
      
      try {
        // Also fetch property occupancy stats
        const occupancyStats = await fetchPropertyOccupancyStats()
        setPropertyOccupancyStats(occupancyStats)
      } catch (occupancyError: any) {
        console.error('Error fetching property occupancy stats:', occupancyError)
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error)
      toast.error(`Failed to load dashboard statistics: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      fetchStats()
    }
  }, [isLoaded, fetchStats])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12 h-[70vh]">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center p-12 h-[70vh]">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  // If no permission to view dashboard
  if (!can('admin:dashboard:view')) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your hotel management dashboard</p>
      </div>
      
      {/* Properties Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Properties Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
              <Hotel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.total_hotels || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.total_hostels || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(dashboardStats?.total_hotels || 0) + (dashboardStats?.total_hostels || 0)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.occupancy_percentage || 0}%</div>
              <p className="text-xs text-muted-foreground">Average across all properties</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Sales and Booking Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Sales & Bookings</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats?.sales.today.total.toLocaleString() || 0}</div>
              <div className="flex items-center pt-1">
                <span className="text-xs text-muted-foreground">
                  From {dashboardStats?.sales.today.confirmed || 0} confirmed bookings
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats?.sales.month.total.toLocaleString() || 0}</div>
              <div className="flex items-center pt-1">
                <span className="text-xs text-muted-foreground">
                  From {(dashboardStats?.sales.month.confirmed || 0) + (dashboardStats?.sales.month.completed || 0)} bookings
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.sales.today.confirmed || 0}</div>
              <div className="flex items-center pt-1">
                <span className="text-xs text-muted-foreground">
                  {dashboardStats?.sales.today.pending || 0} pending bookings
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats?.sales.month.pending || 0}</div>
              <div className="flex items-center pt-1">
                <span className="text-xs text-muted-foreground">
                  This month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Expenses Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Expenses</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats?.expenses.today.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardStats?.expenses.month.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Revenue (Today)</CardTitle>
              <ArrowUp className={`h-4 w-4 ${(dashboardStats?.sales.today.total || 0) - (dashboardStats?.expenses.today || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{((dashboardStats?.sales.today.total || 0) - (dashboardStats?.expenses.today || 0)).toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Revenue (Month)</CardTitle>
              <ArrowUp className={`h-4 w-4 ${(dashboardStats?.sales.month.total || 0) - (dashboardStats?.expenses.month || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{((dashboardStats?.sales.month.total || 0) - (dashboardStats?.expenses.month || 0)).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* User Stats - Only show for admins */}
      {can('admin:user:view') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">User Statistics</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.users.total || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.users.new_today || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users This Month</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.users.new_month || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Property Occupancy Section */}
      {propertyOccupancyStats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Property Occupancy</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Property</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Total Rooms</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Occupied</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Occupancy %</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyOccupancyStats.map((property) => (
                    <tr key={property.property_id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{property.property_name}</td>
                      <td className="px-6 py-4 capitalize">{property.property_type}</td>
                      <td className="px-6 py-4">{property.total_rooms}</td>
                      <td className="px-6 py-4">{property.occupied_rooms}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`mr-2 ${property.occupancy_percentage > 70 ? 'text-green-600' : property.occupancy_percentage > 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {property.occupancy_percentage}%
                          </span>
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${property.occupancy_percentage > 70 ? 'bg-green-600' : property.occupancy_percentage > 30 ? 'bg-yellow-500' : 'bg-red-600'}`}
                              style={{ width: `${property.occupancy_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Additional dashboard sections can be added here */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Summary of recent booking activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Confirmed:</span>
                <span>{dashboardStats?.sales.today.confirmed || 0} today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Completed:</span>
                <span>{dashboardStats?.sales.today.completed || 0} today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Cancelled:</span>
                <span>{dashboardStats?.sales.today.cancelled || 0} today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Pending:</span>
                <span>{dashboardStats?.sales.today.pending || 0} today</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>
              Overview of monthly booking performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Confirmed:</span>
                <span>{dashboardStats?.sales.month.confirmed || 0} bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Completed:</span>
                <span>{dashboardStats?.sales.month.completed || 0} bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Cancelled:</span>
                <span>{dashboardStats?.sales.month.cancelled || 0} bookings</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Pending:</span>
                <span>{dashboardStats?.sales.month.pending || 0} bookings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

