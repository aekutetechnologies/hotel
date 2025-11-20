'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'
import { ReportFilters } from './ReportFilters'

interface ReportCardProps {
  title: string
  description: string
  onDownloadExcel: (filters: ReportFilters) => Promise<void>
  filters: ReportFilters
  loading?: boolean
}

export function ReportCard({
  title,
  description,
  onDownloadExcel,
  filters,
  loading = false,
}: ReportCardProps) {
  const handleDownload = async () => {
    try {
      await onDownloadExcel(filters)
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-[#A31C44] hover:bg-[#8f1836]"
        >
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Downloading...' : 'Download Excel'}
        </Button>
      </CardContent>
    </Card>
  )
}

