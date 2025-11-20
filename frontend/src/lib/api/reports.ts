import { API_URL } from '../config';

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  property_id?: string;
}

/**
 * Download a report file (Excel or PDF)
 */
async function downloadReport(
  endpoint: string,
  filters: ReportFilters,
  filename: string
): Promise<void> {
  try {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.property_id) params.append('property_id', filters.property_id);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${endpoint}${queryString}`;
    
    // Use apiClient but handle blob response manually
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token available');
    }

    // First attempt
    let response = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // If 401, try to refresh and retry
    if (response.status === 401) {
      const { refreshToken: refreshTokenFn } = await import('./refreshToken');
      const refreshResult = await refreshTokenFn();
      
      if (refreshResult) {
        const newToken = localStorage.getItem('accessToken');
        if (newToken) {
          response = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
          });
        }
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to download report' }));
      throw new Error(error.error || 'Failed to download report');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}

// Financial Reports
export async function downloadRevenueReport(filters: ReportFilters): Promise<void> {
  const filename = `Revenue_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/revenue/excel/', filters, filename);
}

export async function downloadProfitLossReport(filters: ReportFilters): Promise<void> {
  const filename = `Profit_Loss_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/profit-loss/excel/', filters, filename);
}

export async function downloadGSTReport(filters: ReportFilters): Promise<void> {
  const filename = `GST_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/gst/excel/', filters, filename);
}

// Operational Reports
export async function downloadBookingSummaryReport(filters: ReportFilters): Promise<void> {
  const filename = `Booking_Summary_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/booking-summary/excel/', filters, filename);
}

export async function downloadOccupancyReport(filters: ReportFilters): Promise<void> {
  const filename = `Occupancy_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/occupancy/excel/', filters, filename);
}

export async function downloadCancellationReport(filters: ReportFilters): Promise<void> {
  const filename = `Cancellation_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/cancellation/excel/', filters, filename);
}

export async function downloadNoShowReport(filters: ReportFilters): Promise<void> {
  const filename = `No_Show_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/no-show/excel/', filters, filename);
}

// Customer Reports
export async function downloadCustomerHistoryReport(filters: ReportFilters): Promise<void> {
  const filename = `Customer_History_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/customer-history/excel/', filters, filename);
}

export async function downloadRepeatCustomerReport(filters: ReportFilters): Promise<void> {
  const filename = `Repeat_Customer_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/repeat-customer/excel/', filters, filename);
}

export async function downloadCustomerDemographicsReport(filters: ReportFilters): Promise<void> {
  const filename = `Customer_Demographics_Report_${filters.start_date || 'start'}_to_${filters.end_date || 'end'}.xlsx`;
  return downloadReport('stats/reports/customer-demographics/excel/', filters, filename);
}

