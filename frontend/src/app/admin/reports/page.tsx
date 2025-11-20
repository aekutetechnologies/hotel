'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportFilters, ReportFilters as ReportFiltersType } from '@/components/reports/ReportFilters'
import { ReportCard } from '@/components/reports/ReportCard'
import {
  downloadRevenueReport,
  downloadProfitLossReport,
  downloadGSTReport,
  downloadBookingSummaryReport,
  downloadOccupancyReport,
  downloadCancellationReport,
  downloadNoShowReport,
  downloadCustomerHistoryReport,
  downloadRepeatCustomerReport,
  downloadCustomerDemographicsReport,
} from '@/lib/api/reports'
import { toast } from 'react-toastify'
import { FileBarChart } from 'lucide-react'

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({})
  const [loading, setLoading] = useState<string | null>(null)

  const handleDownload = async (
    downloadFn: (filters: ReportFiltersType) => Promise<void>,
    reportName: string
  ) => {
    if (!filters.start_date || !filters.end_date) {
      toast.error('Please select a date range')
      return
    }

    try {
      setLoading(reportName)
      await downloadFn(filters)
      toast.success(`${reportName} downloaded successfully`)
    } catch (error: any) {
      toast.error(error.message || `Failed to download ${reportName}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileBarChart className="h-8 w-8 text-[#A31C44]" />
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        </div>
        <p className="text-gray-600">Generate and download comprehensive reports for your business</p>
      </div>

      <div className="mb-6">
        <ReportFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="operational">Operational Reports</TabsTrigger>
          <TabsTrigger value="customer">Customer Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportCard
              title="Revenue Report"
              description="Total revenue breakdown by property, booking type, and payment method with GST calculations"
              onDownloadExcel={(filters) => handleDownload(downloadRevenueReport, 'Revenue Report')}
              filters={filters}
              loading={loading === 'Revenue Report'}
            />
            <ReportCard
              title="Profit & Loss Report"
              description="Revenue minus expenses, net profit by property and date range"
              onDownloadExcel={(filters) => handleDownload(downloadProfitLossReport, 'Profit & Loss Report')}
              filters={filters}
              loading={loading === 'Profit & Loss Report'}
            />
            <ReportCard
              title="GST Report"
              description="Tax breakdown (5% for <₹7500, 18% for ≥₹7500) by date range"
              onDownloadExcel={(filters) => handleDownload(downloadGSTReport, 'GST Report')}
              filters={filters}
              loading={loading === 'GST Report'}
            />
          </div>
        </TabsContent>

        <TabsContent value="operational" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportCard
              title="Booking Summary Report"
              description="Bookings by status, property, date range with counts and revenue"
              onDownloadExcel={(filters) => handleDownload(downloadBookingSummaryReport, 'Booking Summary Report')}
              filters={filters}
              loading={loading === 'Booking Summary Report'}
            />
            <ReportCard
              title="Occupancy Report"
              description="Property-wise and room-wise occupancy rates, trends over time"
              onDownloadExcel={(filters) => handleDownload(downloadOccupancyReport, 'Occupancy Report')}
              filters={filters}
              loading={loading === 'Occupancy Report'}
            />
            <ReportCard
              title="Cancellation Report"
              description="Cancelled bookings with reasons, refund amounts, cancellation trends"
              onDownloadExcel={(filters) => handleDownload(downloadCancellationReport, 'Cancellation Report')}
              filters={filters}
              loading={loading === 'Cancellation Report'}
            />
            <ReportCard
              title="No-Show Report"
              description="No-show bookings by property, date range, customer details"
              onDownloadExcel={(filters) => handleDownload(downloadNoShowReport, 'No-Show Report')}
              filters={filters}
              loading={loading === 'No-Show Report'}
            />
          </div>
        </TabsContent>

        <TabsContent value="customer" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportCard
              title="Customer Booking History"
              description="All bookings per customer with detailed information"
              onDownloadExcel={(filters) => handleDownload(downloadCustomerHistoryReport, 'Customer Booking History')}
              filters={filters}
              loading={loading === 'Customer Booking History'}
            />
            <ReportCard
              title="Repeat Customer Report"
              description="Customers with multiple bookings, loyalty metrics"
              onDownloadExcel={(filters) => handleDownload(downloadRepeatCustomerReport, 'Repeat Customer Report')}
              filters={filters}
              loading={loading === 'Repeat Customer Report'}
            />
            <ReportCard
              title="Customer Demographics"
              description="Booking patterns by customer type, location, preferences"
              onDownloadExcel={(filters) => handleDownload(downloadCustomerDemographicsReport, 'Customer Demographics')}
              filters={filters}
              loading={loading === 'Customer Demographics'}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

