import { Property, Hotel, Hostel } from '@/types/property'

export const properties: Property[] = [
  {
    id: 1,
    name: "Luxury Hotel Mumbai",
    type: "hotel",
    location: "Mumbai, India",
    description: "A luxurious 5-star hotel in the heart of Mumbai",
    images: ["/images/hotels/luxury-hotel-1.jpg", "/images/hotels/luxury-hotel-2.jpg"],
    amenities: ["Swimming Pool", "Spa", "Gym", "Restaurant", "Free WiFi"],
    status: "Active",
    rooms: [
      {
        id: 1,
        name: "Deluxe Room",
        size: "32 sqm",
        basePrice: 5000,
        originalPrice: 6000,
        maxOccupancy: 2,
        amenities: ["King Size Bed", "TV", "Mini Bar"]
      },
      {
        id: 2,
        name: "Suite",
        size: "48 sqm",
        basePrice: 8000,
        originalPrice: 10000,
        maxOccupancy: 3,
        amenities: ["King Size Bed", "TV", "Mini Bar", "Jacuzzi"]
      }
    ],
    policies: {
      checkIn: "12:00 PM",
      checkOut: "10:00 AM",
      couplesWelcome: true,
      petsAllowed: false,
      idRequired: ["Aadhar Card", "Passport"]
    }
  } as unknown as Property,
  {
    id: 2,
    name: "Backpackers Hostel Bandra",
    type: "hostel",
    location: "Bandra West, Mumbai",
    description: "Affordable and social accommodation for travelers.",
    images: ["/placeholder.svg?height=300&width=400&text=Backpackers+Hostel+Bandra"],
    amenities: ["Free Wi-Fi", "Communal Kitchen", "Locker Storage", "24/7 Reception"],
    status: "Active",
    rooms: [
      { id: 1, occupancyType: "Mixed Dorm", basePrice: 800, originalPrice: 1000, availableBeds: 4, totalBeds: 6, description: "6-bed mixed dorm", amenities: ["Individual Lockers", "Reading Light"] },
      { id: 2, occupancyType: "Female Dorm", basePrice: 900, originalPrice: 1100, availableBeds: 3, totalBeds: 4, description: "4-bed female-only dorm", amenities: ["En-suite Bathroom", "Hair Dryer"] }
    ],
    foodMenu: [
      { day: "Monday", breakfast: ["Toast", "Eggs", "Coffee"], lunch: ["Vegetable Curry", "Rice"], dinner: ["Pasta", "Salad"], timings: { breakfast: "7:00-9:00", lunch: "12:00-14:00", dinner: "19:00-21:00" } }
    ],
    services: ["Laundry Service", "Bike Rental", "Tour Desk"],
    policies: {
      checkIn: "14:00",
      checkOut: "11:00",
      notice: "24 hours notice required for cancellation",
      idRequired: ["Passport", "Student ID"],
      foodInclusive: true
    }
  } as unknown as Property,
  {
    id: 3,
    name: "Business Hotel Andheri",
    type: "hotel",
    location: "Andheri East, Mumbai",
    description: "Perfect for business travelers with easy airport access.",
    images: ["/placeholder.svg?height=300&width=400&text=Business+Hotel+Andheri"],
    amenities: ["Business Center", "Airport Shuttle", "Free Wi-Fi", "Conference Rooms"],
    status: "Active",
    rooms: [
      { id: 1, name: "Standard Room", size: "25 sqm", basePrice: 8000, originalPrice: 10000, maxOccupancy: 2, amenities: ["Work Desk", "Coffee Maker"] },
      { id: 2, name: "Executive Suite", size: "40 sqm", basePrice: 12000, originalPrice: 15000, maxOccupancy: 2, amenities: ["Separate Living Area", "Complimentary Breakfast"] }
    ],
    policies: {
      checkIn: "12:00",
      checkOut: "11:00",
      couplesWelcome: true,
      petsAllowed: false,
      idRequired: ["Passport", "Business Card"]
    }
  } as unknown as Property,
  {
    id: 4,
    name: "Eco Hostel Colaba",
    type: "hostel",
    location: "Colaba, Mumbai",
    description: "Eco-friendly hostel near major tourist attractions.",
    images: ["/placeholder.svg?height=300&width=400&text=Eco+Hostel+Colaba"],
    amenities: ["Solar Power", "Organic Breakfast", "Recycling Program", "Free Wi-Fi"],
    status: "Active",
    rooms: [
      { id: 1, occupancyType: "Mixed Dorm", basePrice: 700, originalPrice: 900, availableBeds: 6, totalBeds: 8, description: "8-bed mixed dorm", amenities: ["Recycled Furniture", "Natural Ventilation"] },
      { id: 2, occupancyType: "Private Room", basePrice: 2000, originalPrice: 2500, availableBeds: 1, totalBeds: 2, description: "Double room with shared bathroom", amenities: ["Organic Linen", "Low-flow Shower"] }
    ],
    foodMenu: [
      { day: "Tuesday", breakfast: ["Organic Muesli", "Fruit Salad"], lunch: ["Vegetable Wrap", "Smoothie"], dinner: ["Lentil Soup", "Whole Grain Bread"], timings: { breakfast: "7:30-9:30", lunch: "12:30-14:30", dinner: "19:30-21:30" } }
    ],
    services: ["Eco Tours", "Yoga Classes", "Organic Cafe"],
    policies: {
      checkIn: "15:00",
      checkOut: "10:00",
      notice: "48 hours notice required for cancellation",
      idRequired: ["Passport"],
      foodInclusive: true
    }
  } as unknown as Property,
  {
    id: 5,
    name: "Beachfront Resort Juhu",
    type: "hotel",
    location: "Juhu Beach, Mumbai",
    description: "Luxurious beachfront resort with stunning ocean views.",
    images: ["/placeholder.svg?height=300&width=400&text=Beachfront+Resort+Juhu"],
    amenities: ["Private Beach", "Infinity Pool", "Spa", "Water Sports", "Multiple Restaurants"],
    status: "Active",
    rooms: [
      { id: 1, name: "Ocean View Room", size: "40 sqm", basePrice: 20000, originalPrice: 25000, maxOccupancy: 2, amenities: ["Balcony", "Rain Shower", "Mini Bar"] },
      { id: 2, name: "Beach Villa", size: "80 sqm", basePrice: 35000, originalPrice: 45000, maxOccupancy: 4, amenities: ["Private Pool", "Kitchenette", "Butler Service"] }
    ],
    policies: {
      checkIn: "15:00",
      checkOut: "11:00",
      couplesWelcome: true,
      petsAllowed: true,
      idRequired: ["Passport", "Credit Card"]
    }
  } as unknown as Property,
  {
    id: 6,
    name: "Digital Nomad Hostel Powai",
    type: "hostel",
    location: "Powai, Mumbai",
    description: "Modern hostel catering to digital nomads and remote workers.",
    images: ["/placeholder.svg?height=300&width=400&text=Digital+Nomad+Hostel+Powai"],
    amenities: ["High-speed Wi-Fi", "Co-working Space", "Podcast Studio", "Skype Booths"],
    status: "Active",
    rooms: [
      { id: 1, occupancyType: "Pod Bed", basePrice: 1200, originalPrice: 1500, availableBeds: 10, totalBeds: 12, description: "Private pod in shared room", amenities: ["Power Outlet", "Reading Light", "Privacy Curtain"] },
      { id: 2, occupancyType: "Private Studio", basePrice: 3000, originalPrice: 3500, availableBeds: 2, totalBeds: 2, description: "Private room with work area", amenities: ["Ergonomic Chair", "Dual Monitors", "Whiteboard"] }
    ],
    foodMenu: [
      { day: "Wednesday", breakfast: ["Smoothie Bowl", "Avocado Toast"], lunch: ["Quinoa Salad", "Green Juice"], dinner: ["Stir Fry", "Kombucha"], timings: { breakfast: "7:00-10:00", lunch: "12:00-15:00", dinner: "19:00-22:00" } }
    ],
    services: ["Tech Support", "Networking Events", "Skill-sharing Workshops"],
    policies: {
      checkIn: "24/7",
      checkOut: "12:00",
      notice: "Flexible cancellation policy",
      idRequired: ["Passport", "Proof of Employment/Freelance Work"],
      foodInclusive: false
    }
  } as unknown as Property,
  {
    id: 7,
    name: "Heritage Hotel Fort",
    type: "hotel",
    location: "Fort, Mumbai",
    description: "Step back in time at this beautifully restored heritage property.",
    images: ["/placeholder.svg?height=300&width=400&text=Heritage+Hotel+Fort"],
    amenities: ["Period Furnishings", "Guided History Tours", "High Tea Service", "Antique Library"],
    status: "Active",
    rooms: [
      { id: 1, name: "Colonial Room", size: "30 sqm", basePrice: 12000, originalPrice: 15000, maxOccupancy: 2, amenities: ["Four-poster Bed", "Claw-foot Bathtub", "Vintage Decor"] },
      { id: 2, name: "Viceroy Suite", size: "60 sqm", basePrice: 25000, originalPrice: 30000, maxOccupancy: 3, amenities: ["Private Balcony", "Antique Writing Desk", "Complimentary Port Wine"] }
    ],
    policies: {
      checkIn: "14:00",
      checkOut: "12:00",
      couplesWelcome: true,
      petsAllowed: false,
      idRequired: ["Passport", "Driving License"]
    }
  } as unknown as Property,
  {
    id: 8,
    name: "Wellness Retreat Hostel Lonavala",
    type: "hostel",
    location: "Lonavala, Maharashtra",
    description: "Rejuvenate your mind and body at our wellness-focused hostel.",
    images: ["/placeholder.svg?height=300&width=400&text=Wellness+Retreat+Hostel+Lonavala"],
    amenities: ["Yoga Studio", "Meditation Garden", "Ayurvedic Spa", "Organic Farm"],
    status: "Active",
    rooms: [
      { id: 1, occupancyType: "Shared Retreat Room", basePrice: 1500, originalPrice: 1800, availableBeds: 4, totalBeds: 4, description: "4-bed shared room with mountain view", amenities: ["Yoga Mat", "Meditation Cushion", "Herbal Tea Station"] },
      { id: 2, occupancyType: "Private Wellness Suite", basePrice: 3500, originalPrice: 4000, availableBeds: 2, totalBeds: 2, description: "Private room with balcony", amenities: ["Private Jacuzzi", "Aromatherapy Diffuser", "Wellness Library"] }
    ],
    foodMenu: [
      { day: "Thursday", breakfast: ["Green Detox Juice", "Chia Seed Pudding"], lunch: ["Buddha Bowl", "Coconut Water"], dinner: ["Ayurvedic Thali", "Herbal Tea"], timings: { breakfast: "6:30-8:30", lunch: "12:30-14:30", dinner: "18:30-20:30" } }
    ],
    services: ["Daily Yoga Classes", "Meditation Sessions", "Ayurvedic Consultations"],
    policies: {
      checkIn: "13:00",
      checkOut: "11:00",
      notice: "7 days notice required for cancellation",
      idRequired: ["Passport", "Health Declaration"],
      foodInclusive: true
    }
  } as unknown as Property,
  {
    id: 9,
    name: "Skyline Hotel Worli",
    type: "hotel",
    location: "Worli, Mumbai",
    description: "Modern high-rise hotel offering panoramic views of the Mumbai skyline.",
    images: ["/placeholder.svg?height=300&width=400&text=Skyline+Hotel+Worli"],
    amenities: ["Rooftop Infinity Pool", "Observation Deck", "Revolving Restaurant", "Helipad"],
    status: "Active",
    rooms: [
      { id: 1, name: "Skyview Room", size: "35 sqm", basePrice: 18000, originalPrice: 22000, maxOccupancy: 2, amenities: ["Floor-to-ceiling Windows", "Smart Home Controls", "Nespresso Machine"] },
      { id: 2, name: "Panorama Suite", size: "70 sqm", basePrice: 30000, originalPrice: 38000, maxOccupancy: 3, amenities: ["360-degree City View", "Private Bar", "In-room Telescope"] }
    ],
    policies: {
      checkIn: "15:00",
      checkOut: "12:00",
      couplesWelcome: true,
      petsAllowed: false,
      idRequired: ["Passport", "Credit Card"]
    }
  } as unknown as Property,
  {
    id: 10,
    name: "Artisan Hostel Kala Ghoda",
    type: "hostel",
    location: "Kala Ghoda, Mumbai",
    description: "Boutique hostel celebrating local art and culture in the heart of Mumbai's art district.",
    images: ["/placeholder.svg?height=300&width=400&text=Artisan+Hostel+Kala+Ghoda"],
    amenities: ["Art Gallery", "Craft Workshop Space", "Indie Bookstore", "Rooftop Cafe"],
    status: "Active",
    rooms: [
      { id: 1, occupancyType: "Artist's Dorm", basePrice: 1000, originalPrice: 1200, availableBeds: 6, totalBeds: 6, description: "6-bed dorm with art supplies", amenities: ["Individual Easels", "Shared Art Materials", "Inspiration Wall"] },
      { id: 2, occupancyType: "Curator's Room", basePrice: 2500, originalPrice: 3000, availableBeds: 2, totalBeds: 2, description: "Private room with curated artworks", amenities: ["Art Library", "Drawing Desk", "Exhibition Space"] }
    ],
    foodMenu: [
      { day: "Friday", breakfast: ["Artisanal Coffee", "Handcrafted Pastries"], lunch: ["Gourmet Sandwiches", "Fresh Juice"], dinner: ["Fusion Tapas", "Local Craft Beer"], timings: { breakfast: "8:00-10:00", lunch: "12:00-14:00", dinner: "19:00-22:00" } }
    ],
    services: ["Art Tours", "Creative Workshops", "Open Mic Nights"],
    policies: {
      checkIn: "14:00",
      checkOut: "11:00",
      notice: "48 hours notice required for cancellation",
      idRequired: ["Passport", "Student ID (for discounts)"],
      foodInclusive: false
    }
  } as unknown as Property
]

// Add more properties (total 30)
for (let i = 11; i <= 30; i++) {
  properties.push({
    id: i,
    name: `Property ${i}`,
    type: i % 2 === 0 ? 'hotel' : 'hostel',
    location: `Location ${i}, Mumbai`,
    description: `Description for Property ${i}`,
    images: [`/placeholder.svg?height=300&width=400&text=Property+${i}`],
    amenities: ["WiFi", "AC", "TV"],
    status: "Active",
    rooms: [
      { id: 1, name: "Standard Room", size: "25 sqm", basePrice: 5000, originalPrice: 6000, maxOccupancy: 2, amenities: ["WiFi", "AC"] },
      { id: 2, name: "Deluxe Room", size: "35 sqm", basePrice: 7000, originalPrice: 8500, maxOccupancy: 3, amenities: ["WiFi", "AC", "Mini Bar"] }
    ],
    policies: {
      checkIn: "14:00",
      checkOut: "12:00",
      couplesWelcome: true,
      petsAllowed: false,
      idRequired: ["Passport", "Driving License"]
    }
  } as unknown as Property);
}

export interface Booking {
  id: number
  propertyName: string
  guestName: string
  checkIn: string
  checkOut: string
  amount: number
  status: 'Confirmed' | 'Pending' | 'Cancelled'
  bookingId: string
  image: string
  bookingType: string
  paymentMethod: string
}

export const bookings: Booking[] = [
  {
    id: 1,
    propertyName: "Super Hotel O Four Bungalow",
    guestName: "John Doe",
    checkIn: "2024-01-15",
    checkOut: "2024-01-16",
    amount: 3142,
    status: "Confirmed",
    bookingId: "BOOK123456",
    image: "/placeholder.svg?height=200&width=300&text=Hotel+Image",
    bookingType: "Online",
    paymentMethod: "Card"
  },
  {
    id: 2,
    propertyName: "Luxury Inn Mumbai",
    guestName: "Jane Smith",
    checkIn: "2024-02-01",
    checkOut: "2024-02-03",
    amount: 8632,
    status: "Pending",
    bookingId: "BOOK123457",
    image: "/placeholder.svg?height=200&width=300&text=Hotel+Image",
    bookingType: "MakeMyTrip",
    paymentMethod: "UPI"
  },
  {
    id: 3,
    propertyName: "Backpackers Hostel Bandra",
    guestName: "Mike Johnson",
    checkIn: "2024-01-20",
    checkOut: "2024-02-20",
    amount: 12000,
    status: "Confirmed",
    bookingId: "BOOK123458",
    image: "/placeholder.svg?height=200&width=300&text=Hotel+Image",
    bookingType: "Walk-in",
    paymentMethod: "Cash"
  }
]

// Add more bookings (total 30)
for (let i = 4; i <= 30; i++) {
  bookings.push({
    id: i,
    propertyName: `Property ${i}`,
    guestName: `Guest ${i}`,
    checkIn: `2024-0${i % 12 + 1}-${i % 28 + 1}`,
    checkOut: `2024-0${i % 12 + 1}-${(i % 28 + 2)}`,
    amount: 5000 + (i * 100),
    status: i % 3 === 0 ? "Confirmed" : i % 3 === 1 ? "Pending" : "Cancelled",
    bookingId: `BOOK${100000 + i}`,
    image: `/placeholder.svg?height=200&width=300&text=Property+${i}`,
    bookingType: i % 5 === 0 ? "MakeMyTrip" : i % 5 === 1 ? "Goibibo" : i % 5 === 2 ? "OYO" : i % 5 === 3 ? "Online" : "Walk-in",
    paymentMethod: i % 3 === 0 ? "Cash" : i % 3 === 1 ? "UPI" : "Card"
  });
}

export interface Expense {
  id: number
  propertyName: string
  category: string
  description: string
  amount: number
  date: string
  status: 'Paid' | 'Pending'
}

export const expenses: Expense[] = [
  {
    id: 1,
    propertyName: "Super Hotel O Four Bungalow",
    category: "Maintenance",
    description: "Monthly AC servicing",
    amount: 15000,
    date: "2024-01-05",
    status: "Paid"
  },
  {
    id: 2,
    propertyName: "Luxury Inn Mumbai",
    category: "Utilities",
    description: "Electricity bill",
    amount: 45000,
    date: "2024-01-01",
    status: "Pending"
  },
  {
    id: 3,
    propertyName: "Backpackers Hostel Bandra",
    category: "Supplies",
    description: "Kitchen supplies restocking",
    amount: 25000,
    date: "2024-01-03",
    status: "Paid"
  }
]

// Add more expenses (total 30)
for (let i = 4; i <= 30; i++) {
  expenses.push({
    id: i,
    propertyName: `Property ${i}`,
    category: i % 3 === 0 ? "Maintenance" : i % 3 === 1 ? "Utilities" : "Supplies",
    description: `Expense ${i} description`,
    amount: 1000 + (i * 50),
    date: `2024-0${i % 12 + 1}-${i % 28 + 1}`,
    status: i % 2 === 0 ? "Paid" : "Pending"
  });
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  bookings: number
  joinedDate: string
  status: 'Active' | 'Inactive'
}

export const users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
    bookings: 5,
    joinedDate: "2023-12-01",
    status: "Active"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 98765 43211",
    bookings: 3,
    joinedDate: "2023-12-15",
    status: "Active"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+91 98765 43212",
    bookings: 0,
    joinedDate: "2024-01-01",
    status: "Inactive"
  }
]

// Add more users (total 30)
for (let i = 4; i <= 30; i++) {
  users.push({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    phone: `+91 98765 432${i.toString().padStart(2, '0')}`,
    bookings: i % 5,
    joinedDate: `2023-${(i % 12 + 1).toString().padStart(2, '0')}-${(i % 28 + 1).toString().padStart(2, '0')}`,
    status: i % 3 === 0 ? "Active" : "Inactive"
  });
}

export interface Offer {
  id: number
  title: string
  description: string
  discountPercentage: number
  validFrom: string
  validTo: string
  status: 'Active' | 'Inactive'
}

export const offers: Offer[] = [
  {
    id: 1,
    title: "Early Bird Discount",
    description: "Book 30 days in advance and get 20% off",
    discountPercentage: 20,
    validFrom: "2024-01-01",
    validTo: "2024-03-31",
    status: "Active"
  },
  {
    id: 2,
    title: "Long Stay Offer",
    description: "Stay for 7 nights, pay for 6",
    discountPercentage: 15,
    validFrom: "2024-01-01",
    validTo: "2024-02-29",
    status: "Active"
  },
  {
    id: 3,
    title: "Weekend Special",
    description: "Get 10% off on weekend stays",
    discountPercentage: 10,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    status: "Active"
  }
]

// Add more offers (total 30)
for (let i = 4; i <= 30; i++) {
  offers.push({
    id: i,
    title: `Offer ${i}`,
    description: `Description for Offer ${i}`,
    discountPercentage: 5 + (i % 20),
    validFrom: `2024-0${i % 12 + 1}-01`,
    validTo: `2024-0${i % 12 + 1}-${28 + (i % 3)}`,
    status: i % 2 === 0 ? "Active" : "Inactive"
  });
}

export const dashboardStats = {
  totalProperties: 10,
  activeBookings: 45,
  monthlyRevenue: 750000,
  occupancyRate: 82
}

