import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO } from 'date-fns';

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch (error) {
    return dateString;
  }
};

// Interface for booking property
interface ExtendedBookingProperty {
  id: number;
  name: string;
  description: string;
  location: string;
  area: string;
  city?: { name: string };
  state?: { name: string };
  country?: { name: string };
  property_type?: string;
  rooms: {
    id: number;
    name: string;
    amenities?: { id: number; name: string }[];
    hourly_rate?: string;
    daily_rate?: string;
    monthly_rate?: string;
    yearly_rate?: string;
    discount?: string;
  }[];
  images: { image: string }[];
  reviews?: {
    id: number;
    user: { name: string };
    rating: number;
    review: string;
    created_at: string;
    images?: string[];
  }[];
}

// Interface for booking data
export interface BookingData {
  id: number;
  user: {
    name: string;
    email: string;
    mobile: string;
  };
  property: ExtendedBookingProperty;
  status: string;
  booking_time: string;
  checkin_date: string;
  checkout_date: string;
  checkin_time?: string;
  checkout_time?: string;
  number_of_guests: number;
  number_of_rooms?: number;
  price: number | string;
  discount: number | string;
  room?: number;
  booking_room_types?: Record<string, number>[];
  created_at?: string;
  payment_type?: string;
}

/**
 * Generate a PDF invoice for a booking
 * @param booking The booking data
 * @returns jsPDF document
 */
export function generatePDFInvoice(booking: BookingData) {
  // Create a new PDF document (A4 size in portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set document properties
  doc.setProperties({
    title: `Invoice #HSQ-${booking.id} - Hsquare Living`,
    author: 'Hsquare Living',
    subject: 'Booking Invoice',
    keywords: 'invoice, booking, hsquare living'
  });

  // Define colors
  const primaryColor = [177, 30, 67]; // #B11E43
  const textColor = [51, 51, 51]; // #333333
  const mediumGray = [150, 150, 150]; // #969696
  
  // Helper function to format status
  const formatStatus = (status: string): string => {
    if (!status) return 'N/A';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  // Helper function to format payment type
  const formatPaymentType = (paymentType: string | undefined): string => {
    if (!paymentType) return 'N/A';
    return paymentType.toUpperCase();
  };
  
  // Add logo from public folder
  try {
    doc.addImage('/logo.png', 'PNG', 15, 15, 60, 15);
  } catch (error) {
    console.error('Failed to add logo:', error);
    // Continue without logo if it fails
  }
  
  // Add header
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INVOICE', 195, 25, { align: 'right' });
  
  // Add invoice number and date section
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Invoice No: HSQ-${booking.id}`, 195, 35, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', month: 'short', day: '2-digit' 
  })}`, 195, 40, { align: 'right' });
  doc.text(`Status: ${formatStatus(booking.status)}`, 195, 45, { align: 'right' });
  
  // Add company details
  doc.setFontSize(10);
  doc.text('Hsquare Living', 15, 40);
  doc.text('GSTIN: 27AAFCH4874P1Z3', 15, 45); // Add your actual GST number
  doc.text('4R8P+FHV, Juhu Galli, Andheri West', 15, 50);
  doc.text('Mumbai, Maharashtra 400049', 15, 55);
  doc.text('booking@hsquareliving.com | +917400455087', 15, 60);
  
  // Add horizontal line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, 65, 195, 65);
  
  // Add billing and property information in two columns
  // Left column - Customer details
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('BILLED TO', 15, 75);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(booking.user.name, 15, 82);
  doc.text(booking.user.email, 15, 87);
  doc.text(booking.user.mobile, 15, 92);
  
  // Right column - Property details
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PROPERTY DETAILS', 195, 75, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Handle property name with right alignment
  doc.text(booking.property.name, 195, 82, { align: 'right' });
  
  // Handle long address by breaking into multiple lines, right-aligned
  const addressParts = booking.property.location.split(', ');
  let yPos = 87;
  const maxLineLength = 50; // Characters per line

  if (addressParts.length > 1) {
    for (let i = 0; i < addressParts.length; i += 2) {
      const addressLine = addressParts.slice(i, i + 2).join(', ');
      if (addressLine.length > maxLineLength) {
        const midPoint = Math.floor(addressLine.length / 2);
        const breakPoint = addressLine.lastIndexOf(' ', midPoint);
        doc.text(addressLine.substring(0, breakPoint), 195, yPos, { align: 'right' });
        yPos += 5;
        doc.text(addressLine.substring(breakPoint + 1), 195, yPos, { align: 'right' });
      } else {
        doc.text(addressLine, 195, yPos, { align: 'right' });
      }
      yPos += 5;
    }
  } else {
    // Just one part - might need to break it into multiple lines
    const address = booking.property.location;
    let startIndex = 0;
    while (startIndex < address.length) {
      const chunk = address.substring(startIndex, startIndex + maxLineLength);
      const endIndex = (startIndex + maxLineLength >= address.length) 
        ? address.length 
        : chunk.lastIndexOf(' ') + startIndex;
      
      doc.text(address.substring(startIndex, endIndex), 195, yPos, { align: 'right' });
      yPos += 5;
      startIndex = endIndex + 1;
    }
  }

  const locationText = `${booking.property.area}, ${booking.property.city?.name || 'Unknown City'}`;
  doc.text(locationText, 195, yPos, { align: 'right' });
  yPos += 5;
  
  const stateCountryText = `${booking.property.state?.name || 'Unknown State'}, ${booking.property.country?.name || 'Unknown Country'}`;
  doc.text(stateCountryText, 195, yPos, { align: 'right' });
  
  // Add booking details section
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('BOOKING DETAILS', 15, 110);
  
  // Calculate duration based on booking type
  let duration = 0;
  let durationLabel = '';
  
  if (booking.booking_time === 'hourly' && booking.checkin_time && booking.checkout_time) {
    // Parse times properly
    const checkinHour = parseInt(booking.checkin_time.split(':')[0]);
    const checkoutHour = parseInt(booking.checkout_time.split(':')[0]);
    
    // Handle overnight bookings
    duration = checkoutHour > checkinHour 
      ? checkoutHour - checkinHour 
      : (24 - checkinHour) + checkoutHour;
    
    durationLabel = `${duration} hour${duration > 1 ? 's' : ''}`;
  } else if (booking.booking_time === 'daily') {
    // Calculate days between checkin and checkout
    const checkinDate = new Date(booking.checkin_date);
    const checkoutDate = new Date(booking.checkout_date);
    const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
    duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    durationLabel = `${duration} night${duration > 1 ? 's' : ''}`;
  } else if (booking.booking_time === 'monthly') {
    const checkinDate = new Date(booking.checkin_date);
    const checkoutDate = new Date(booking.checkout_date);
    const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
    const rawMonths = diffTime / (1000 * 60 * 60 * 24 * 30); // approximate months
    duration = Math.round(rawMonths);
    durationLabel = `${duration} month${duration !== 1 ? 's' : ''}`;
  } else if (booking.booking_time === 'yearly') {
    const checkinDate = new Date(booking.checkin_date);
    const checkoutDate = new Date(booking.checkout_date);
    const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
    const rawYears = diffTime / (1000 * 60 * 60 * 24 * 365); // approximate years
    duration = Math.round(rawYears);
    durationLabel = `${duration} year${duration !== 1 ? 's' : ''}`;
  }
  
  // Prepare room data rows for the table and calculate taxes per room
  const tableRows = [];
  let totalAmount = 0;
  let totalTaxes = 0;
  
  if (booking.booking_room_types && booking.booking_room_types.length > 0) {
    booking.booking_room_types.forEach((roomTypeObj) => {
      const roomId = Object.keys(roomTypeObj)[0];
      const quantity = roomTypeObj[roomId];
      const roomInfo = booking.property.rooms.find(r => r.id.toString() === roomId);
      
      if (roomInfo) {
        // Get the appropriate rate based on booking type
        let roomRate = '0';
        if (booking.booking_time === 'hourly' && roomInfo.hourly_rate) {
          roomRate = roomInfo.hourly_rate;
        } else if (booking.booking_time === 'daily' && roomInfo.daily_rate) {
          roomRate = roomInfo.daily_rate;
        } else if (roomInfo.monthly_rate) {
          roomRate = roomInfo.monthly_rate;
        } else if (roomInfo.yearly_rate && booking.booking_time === 'yearly') {
          roomRate = roomInfo.yearly_rate;
        }
        
        const roomDiscount = parseFloat(roomInfo.discount || '0');
        const roomBasePrice = parseFloat(roomRate);
        const roomDiscountedPrice = roomBasePrice * (1 - (roomDiscount / 100));
        
        // Calculate price per room per unit time (for GST determination)
        let pricePerRoomUnit = roomDiscountedPrice;
        if (booking.booking_time === 'yearly') {
          pricePerRoomUnit = roomDiscountedPrice; // Yearly rate is for 1 year
        } else if (booking.booking_time === 'monthly') {
          pricePerRoomUnit = roomDiscountedPrice; // Monthly rate is for 1 month
        } else if (booking.booking_time === 'hourly') {
          pricePerRoomUnit = roomDiscountedPrice; // Already per hour
        } else {
          pricePerRoomUnit = roomDiscountedPrice; // Daily rate is per day
        }
        
        // Calculate line amount based on property type and booking type
        let lineAmount = 0;
        if (booking.booking_time === 'monthly' && booking.property.property_type === 'hostel') {
          // For hostels with monthly booking, multiply by guests for shared rooms
          lineAmount = roomDiscountedPrice * quantity * duration * booking.number_of_guests;
        } else if (booking.booking_time === 'yearly') {
          // For yearly bookings, use years as duration
          const checkinDate = new Date(booking.checkin_date);
          const checkoutDate = new Date(booking.checkout_date);
          const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
          const years = Math.round(diffTime / (1000 * 60 * 60 * 24 * 365));
          lineAmount = roomDiscountedPrice * quantity * Math.max(years, 1);
        } else {
          // For hotels or non-monthly bookings
          lineAmount = roomDiscountedPrice * quantity * duration;
        }
        
        totalAmount += lineAmount;
        
        // Calculate GST per room (5% if room price < 5000, 18% if >= 5000)
        const roomTaxRate = pricePerRoomUnit < 5000 ? 0.05 : 0.18;
        const roomTax = lineAmount * roomTaxRate;
        totalTaxes += roomTax;
        
        tableRows.push([
          roomInfo.name,
          quantity.toString(),
          `${roomBasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          durationLabel,
          `${roomDiscount}%`,
          `${lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ]);
      }
    });
  } else if (booking.room) {
    const roomInfo = booking.property.rooms.find(r => r.id === booking.room);
    if (roomInfo) {
      // Get the appropriate rate based on booking type
      let roomRate = '0';
      if (booking.booking_time === 'hourly' && roomInfo.hourly_rate) {
        roomRate = roomInfo.hourly_rate;
      } else if (booking.booking_time === 'daily' && roomInfo.daily_rate) {
        roomRate = roomInfo.daily_rate;
      } else if (roomInfo.monthly_rate) {
        roomRate = roomInfo.monthly_rate;
      } else if (roomInfo.yearly_rate && booking.booking_time === 'yearly') {
        roomRate = roomInfo.yearly_rate;
      }
      
      const roomDiscount = parseFloat(roomInfo.discount || '0');
      const roomBasePrice = parseFloat(roomRate);
      const roomDiscountedPrice = roomBasePrice * (1 - (roomDiscount / 100));
      
      // Calculate price per room per unit time (for GST determination)
      let pricePerRoomUnit = roomDiscountedPrice;
      
      // Calculate line amount based on property type and booking type
      let lineAmount = 0;
      if (booking.booking_time === 'monthly' && booking.property.property_type === 'hostel') {
        // For hostels with monthly booking, multiply by guests for shared rooms
        lineAmount = roomDiscountedPrice * (booking.number_of_rooms || 1) * duration * booking.number_of_guests;
      } else if (booking.booking_time === 'yearly') {
        // For yearly bookings, use years as duration
        const checkinDate = new Date(booking.checkin_date);
        const checkoutDate = new Date(booking.checkout_date);
        const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
        const years = Math.round(diffTime / (1000 * 60 * 60 * 24 * 365));
        lineAmount = roomDiscountedPrice * (booking.number_of_rooms || 1) * Math.max(years, 1);
      } else {
        // For hotels or non-monthly bookings
        lineAmount = roomDiscountedPrice * (booking.number_of_rooms || 1) * duration;
      }
      
      totalAmount += lineAmount;
      
      // Calculate GST per room (5% if room price < 5000, 18% if >= 5000)
      const roomTaxRate = pricePerRoomUnit < 5000 ? 0.05 : 0.18;
      const roomTax = lineAmount * roomTaxRate;
      totalTaxes += roomTax;
      
      tableRows.push([
        roomInfo.name,
        (booking.number_of_rooms || 1).toString(),
        `${roomBasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        durationLabel,
        `${roomDiscount}%`,
        `${lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
    }
  }

  // Add the room details table using autoTable
  autoTable(doc, {
    startY: 115,
    head: [['Room Type', 'Quantity', 'Rate', 'Duration', 'Discount', 'Amount']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [177, 30, 67],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' }, // Ensure Rate column is right-aligned
      3: { cellWidth: 30 },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  });
  
  // Get the last table's Y position
  const finalY = (doc as any).lastAutoTable.finalY + 5;
  
  // Use calculated per-room taxes (GST is calculated per room: 5% if < 5000, 18% if >= 5000)
  const subtotal = totalAmount;
  const taxAmount = totalTaxes;
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;
  const grandTotal = subtotal + taxAmount;
  
  // Calculate effective tax rate for display (weighted average)
  const effectiveTaxRate = subtotal > 0 ? ((taxAmount / subtotal) * 100) : 0;
  const cgstRate = effectiveTaxRate / 2;
  const sgstRate = effectiveTaxRate / 2;
  
  // Add the summary table using autoTable - Now right-aligned
  autoTable(doc, {
    startY: finalY,
    body: [
      ['', 'Subtotal:', `${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['', `CGST (${cgstRate.toFixed(1)}%):`, `${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['', `SGST (${sgstRate.toFixed(1)}%):`, `${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['', 'TOTAL:', `${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
    ],
    theme: 'plain',
    styles: {
      overflow: 'linebreak',
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 }, // Reduced width to fit on page
      1: { cellWidth: 30, fontStyle: 'bold', halign: 'right' },
      2: { cellWidth: 30, halign: 'right' }
    },
    didDrawCell: (data) => {
      // Add bold styling to the total row
      if (data.row.index === 3) {
        doc.setFont("Helvetica", 'bold');
      }
    },
    margin: { left: 95, right: 15 } // Adjusted left margin to make it visible but still right-aligned
  });
  
  // Get the payment section Y position
  const summaryY = (doc as any).lastAutoTable.finalY + 10;
  
  // Add payment information
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PAYMENT INFORMATION', 15, summaryY);
  
  // Add the payment info table using autoTable
  autoTable(doc, {
    startY: summaryY + 5,
    body: [
      ['Payment Method:', formatPaymentType(booking.payment_type)],
      ['Payment Status:', formatStatus(booking.status)],
      ['Payment Date:', `${new Date(booking.created_at || new Date()).toLocaleDateString('en-IN', { 
        year: 'numeric', month: 'short', day: '2-digit' 
      })}`]
    ],
    theme: 'plain',
    styles: {
      overflow: 'linebreak',
      cellPadding: 2,
      fontSize: 9
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 65 }
    },
    margin: { left: 15, right: 15 }
  });
  
  // Add schedule information
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SCHEDULE DETAILS', 110, summaryY);
  
  // Add the schedule info table using autoTable
  autoTable(doc, {
    startY: summaryY + 5,
    body: [
      ['Check-in:', `${formatDate(booking.checkin_date)} ${booking.checkin_time ? `at ${booking.checkin_time.slice(0, 5)}` : ''}`],
      ['Check-out:', `${formatDate(booking.checkout_date)} ${booking.checkout_time ? `at ${booking.checkout_time.slice(0, 5)}` : ''}`],
      ['Number of Guests:', `${booking.number_of_guests}`]
    ],
    theme: 'plain',
    styles: {
      overflow: 'linebreak',
      cellPadding: 2,
      fontSize: 9
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 65 }
    },
    margin: { left: 110, right: 15 }
  });
  
  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  
  // Add horizontal line before footer
  doc.setDrawColor(220, 220, 220);
  doc.line(15, pageHeight - 25, 195, pageHeight - 25);
  
  // Add footer text
  doc.setFontSize(8);
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text('Thank you for choosing Hsquare Living!', 105, pageHeight - 18, { align: 'center' });
  doc.text('This is a computer-generated invoice and does not require a signature.', 105, pageHeight - 13, { align: 'center' });
  
  return doc;
} 