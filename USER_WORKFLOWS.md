# HSquare Hotel Management System - User Workflows Documentation

This document provides detailed documentation of all user-side workflows in the HSquare Hotel Management System, covering the frontend (Next.js), backend (Django REST Framework), and mobile app (Flutter) implementations.

---

## Table of Contents

1. [Authentication Workflow](#1-authentication-workflow)
2. [Property Search & Browsing](#2-property-search--browsing)
3. [Property Details Viewing](#3-property-details-viewing)
4. [Booking Creation](#4-booking-creation)
5. [Viewing Bookings](#5-viewing-bookings)
6. [Favorites Management](#6-favorites-management)
7. [Profile Management](#7-profile-management)
8. [Blog Reading](#8-blog-reading)

---

## 1. Authentication Workflow

### Overview
Users authenticate using OTP (One-Time Password) sent via SMS to their mobile number. The system supports both new user registration and existing user login through the same OTP verification flow.

### Frontend Flow (Next.js)

#### Step 1: Send OTP
- **Location**: `frontend/src/components/LoginDialog.tsx`
- **User Action**: User enters mobile number and clicks "Send OTP"
- **Frontend Process**:
  1. Validates mobile number format
  2. Calls `sendOTP(mobile)` from `frontend/src/lib/api/sendOTP.ts`
  3. Shows loading state
  4. Displays success message: "OTP sent successfully"

#### Step 2: Verify OTP
- **User Action**: User enters 6-digit OTP received via SMS
- **Frontend Process**:
  1. Calls `verifyOTP(mobile, otp)` from `frontend/src/lib/api/verifyOTP.ts`
  2. On success, receives:
     - `access_token` (JWT, 15 minutes for customers, 1 year for admins)
     - `refresh_token` (JWT, 7 days)
     - `user_role` (customer/admin)
     - `name`
     - `id`
     - `permissions`
  3. Stores tokens and user info in `localStorage`:
     - `accessToken`
     - `refreshToken`
     - `name`
     - `userId`
     - `role`
     - `permissions`
  4. Updates UI to show user name in header
  5. Redirects to home page or intended destination

#### Step 3: Token Refresh (Automatic)
- **Location**: `frontend/src/lib/api/apiClient.ts`
- **Process**:
  1. On 401 Unauthorized response, automatically calls `refreshToken()` from `frontend/src/lib/api/refreshToken.ts`
  2. Updates `accessToken` in localStorage
  3. Retries original request with new token
  4. If refresh fails, clears tokens and redirects to login

### Backend API Endpoints

#### POST `/api/users/send-otp/`
**Request Body:**
```json
{
  "mobile": "9876543210"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP sent successfully",
  "is_static": false  // true for static login numbers
}
```

**Backend Implementation**: `backend/users/views.py::send_otp()`
- Generates 6-digit random OTP
- Stores OTP in Redis cache with 5-minute expiry (key: mobile number)
- Sends OTP via SMS API (StaticKing SMS service)
- Static login numbers (8342091661, 9938252725, 9820769934) skip SMS and use middle 6 digits as OTP

#### POST `/api/users/verify-otp/`
**Request Body:**
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_role": "customer",
  "name": "John Doe",
  "id": 1,
  "permissions": ["property:view", "booking:create"]
}
```

**Backend Implementation**: `backend/users/views.py::verify_otp()`
- Validates OTP against cached value (or static OTP for special numbers)
- Creates user if doesn't exist (default role: 'customer')
- Creates `UserSession` record
- Generates JWT access token (15 min for customers, 1 year for admins)
- Generates refresh token (7 days, stored in `RefreshToken` model)
- Returns user info and tokens

#### POST `/api/users/refresh-token/`
**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_role": "customer",
  "id": 1,
  "name": "John Doe",
  "permissions": ["property:view", "booking:create"]
}
```

**Backend Implementation**: `backend/users/views.py::refresh_token()`
- Validates refresh token JWT
- Checks if token exists in database and is active
- Generates new access token
- Returns new access token and user info

### Flutter App Implementation

```dart
// lib/services/auth_service.dart

class AuthService {
  static const String baseUrl = 'http://your-api-url/api';
  
  // Send OTP
  Future<bool> sendOTP(String mobile) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/send-otp/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'mobile': mobile}),
    );
    
    if (response.statusCode == 200) {
      return true;
    }
    throw Exception('Failed to send OTP');
  }
  
  // Verify OTP
  Future<Map<String, dynamic>> verifyOTP(String mobile, String otp) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/verify-otp/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'mobile': mobile, 'otp': otp}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Store tokens using shared_preferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', data['access_token']);
      await prefs.setString('refreshToken', data['refresh_token']);
      await prefs.setString('name', data['name']);
      await prefs.setInt('userId', data['id']);
      return data;
    }
    throw Exception('Invalid OTP');
  }
  
  // Refresh token
  Future<Map<String, dynamic>?> refreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('refreshToken');
    
    if (refreshToken == null) return null;
    
    final response = await http.post(
      Uri.parse('$baseUrl/users/refresh-token/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh_token': refreshToken}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await prefs.setString('accessToken', data['access_token']);
      return data;
    }
    return null;
  }
}
```

---

## 2. Property Search & Browsing

### Overview
Users can search and browse properties (hotels/hostels) by location, dates, number of rooms, and guests. Results are filtered based on search criteria.

### Frontend Flow (Next.js)

#### Step 1: Search Form
- **Location**: `frontend/src/app/home/page.tsx`
- **User Actions**:
  1. Select property type (Hotels/Hostels)
  2. Enter location (city/area)
  3. Select check-in and check-out dates
  4. Select number of rooms (1-5)
  5. Select number of guests (1-15, max 3 per room)
  6. Select booking type (Book by Day / Book by Hour)
  7. Click search button

#### Step 2: Fetch Properties
- **Location**: `frontend/src/lib/api/searchProperties.ts`
- **Process**:
  1. Constructs query parameters:
     - `property_type`: 'hotel' or 'hostel'
     - `city`: location string
     - `checkin_date`: YYYY-MM-DD
     - `checkout_date`: YYYY-MM-DD
     - `rooms`: number
     - `guests`: number
     - `booking_type`: 'daily' or 'hourly'
  2. Calls `GET /api/property/public/search/?{query_params}`
  3. Returns array of `Property` objects

#### Step 3: Display Results
- **Location**: `frontend/src/components/PropertyCard.tsx`
- **Displays**:
  - Property image
  - Property name
  - Location (city, state)
  - Property type badge
  - Rating and review count
  - Starting price
  - Clickable card linking to property details page

### Backend API Endpoints

#### GET `/api/property/public/search/`
**Query Parameters:**
- `property_type` (optional): 'hotel' or 'hostel'
- `city` (optional): City name
- `checkin_date` (optional): YYYY-MM-DD
- `checkout_date` (optional): YYYY-MM-DD
- `rooms` (optional): Number of rooms
- `guests` (optional): Number of guests
- `booking_type` (optional): 'daily' or 'hourly'

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Luxury Hotel",
    "property_type": "hotel",
    "description": "A beautiful hotel...",
    "location": "123 Main St, Mumbai",
    "city": {"id": 1, "name": "Mumbai"},
    "state": {"id": 1, "name": "Maharashtra"},
    "country": {"id": 1, "name": "India"},
    "images": [
      {
        "id": 1,
        "image_url": "http://localhost:8000/media/property_images/image.jpg",
        "category": {"id": 1, "name": "Exterior", "code": "EXT"}
      }
    ],
    "rooms": [
      {
        "id": 1,
        "name": "Deluxe Room",
        "daily_rate": "2500.00",
        "hourly_rate": "500.00",
        "discount": "10.00"
      }
    ],
    "amenities": [
      {"id": 1, "name": "WiFi", "icon": "wifi"}
    ],
    "rating": 4.5,
    "review_count": 10
  }
]
```

**Backend Implementation**: `backend/property/views.py::public_search()`
- Filters properties by type, city, availability
- Checks room availability for given dates
- Returns only published/active properties
- Includes property images, rooms, amenities, ratings

### Flutter App Implementation

```dart
// lib/models/property.dart

class Property {
  final int id;
  final String name;
  final String propertyType;
  final String location;
  final List<String> images;
  final double rating;
  final int reviewCount;
  final double startingPrice;
  
  Property.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        name = json['name'],
        propertyType = json['property_type'],
        location = json['location'],
        images = (json['images'] as List?)
            ?.map((img) => img['image_url'] as String)
            .toList() ?? [],
        rating = (json['rating'] ?? 0.0).toDouble(),
        reviewCount = json['review_count'] ?? 0,
        startingPrice = (json['rooms']?[0]?['daily_rate'] ?? 0.0).toDouble();
}

// lib/services/property_service.dart

class PropertyService {
  static const String baseUrl = 'http://your-api-url/api';
  
  Future<List<Property>> searchProperties({
    String? propertyType,
    String? city,
    String? checkInDate,
    String? checkOutDate,
    int? rooms,
    int? guests,
    String? bookingType,
  }) async {
    final queryParams = <String, String>{};
    if (propertyType != null) queryParams['property_type'] = propertyType;
    if (city != null) queryParams['city'] = city;
    if (checkInDate != null) queryParams['checkin_date'] = checkInDate;
    if (checkOutDate != null) queryParams['checkout_date'] = checkOutDate;
    if (rooms != null) queryParams['rooms'] = rooms.toString();
    if (guests != null) queryParams['guests'] = guests.toString();
    if (bookingType != null) queryParams['booking_type'] = bookingType;
    
    final uri = Uri.parse('$baseUrl/property/public/search/')
        .replace(queryParameters: queryParams);
    
    final response = await http.get(uri);
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Property.fromJson(json)).toList();
    }
    throw Exception('Failed to search properties');
  }
}
```

---

## 3. Property Details Viewing

### Overview
Users can view detailed information about a property, including images, amenities, rooms, location map, reviews, and pricing.

### Frontend Flow (Next.js)

#### Step 1: Navigate to Property
- **Location**: `frontend/src/app/property/[id]/page.tsx`
- **User Action**: Click on property card from search results
- **URL**: `/property/{id}?location=...&propertyType=...&bookingType=...&checkInDate=...&checkOutDate=...&rooms=...&guests=...`

#### Step 2: Fetch Property Details
- **Location**: `frontend/src/lib/api/fetchProperty.ts`
- **Process**:
  1. Calls `GET /api/property/properties/{id}/`
  2. Transforms response data for form compatibility
  3. Normalizes images, rooms, amenities, city/state/country objects

#### Step 3: Display Property Information
- **Components**:
  - **Image Gallery**: `frontend/src/components/PropertyImageGallery.tsx`
    - Shows property images by category (All, Room, Bathroom, Dining)
    - Fullscreen image viewer
  - **Amenities**: List of property amenities with icons
  - **Available Rooms**: `frontend/src/components/RoomCard.tsx`
    - Room images, name, size, features
    - Pricing (hourly/daily/monthly/yearly)
    - Quantity selector
  - **About Property**: Description text
  - **Nearby Places**: Points of interest with distances
  - **Location Map**: `frontend/src/components/PropertyMap.tsx`
    - Leaflet map showing property location
  - **Ratings & Reviews**: Average rating, rating distribution, review list
  - **House Rules & Policies**: Rules and required documentation
  - **Booking Card**: `frontend/src/components/BookingCard.tsx`
    - Date selection
    - Room/guest selection
    - Price calculation
    - Offer application
    - "Book Now" button

### Backend API Endpoints

#### GET `/api/property/properties/{id}/`
**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Luxury Hotel",
  "property_type": "hotel",
  "description": "A beautiful hotel...",
  "location": "123 Main St",
  "area": "Downtown",
  "city": {"id": 1, "name": "Mumbai"},
  "state": {"id": 1, "name": "Maharashtra"},
  "country": {"id": 1, "name": "India"},
  "latitude": "19.0760",
  "longitude": "72.8777",
  "images": [
    {
      "id": 1,
      "image_url": "http://localhost:8000/media/property_images/image.jpg",
      "category": {
        "id": 1,
        "name": "Exterior",
        "code": "EXT"
      }
    }
  ],
  "rooms": [
    {
      "id": 1,
      "name": "Deluxe Room",
      "size": "350 sq. ft",
      "occupancy_type": "single",
      "bathroom_type": "private",
      "smoking_allowed": false,
      "daily_rate": "2500.00",
      "hourly_rate": "500.00",
      "monthly_rate": "60000.00",
      "yearly_rate": "600000.00",
      "discount": "10.00",
      "images": [
        {
          "id": 1,
          "image_url": "http://localhost:8000/media/room_images/image.jpg"
        }
      ],
      "amenities": [
        {"id": 1, "name": "WiFi", "icon": "wifi"}
      ]
    }
  ],
  "amenities": [
    {"id": 1, "name": "WiFi", "icon": "wifi"}
  ],
  "rules": [
    {"id": 1, "name": "No smoking"}
  ],
  "documentation": [
    {"id": 1, "name": "ID Proof"}
  ],
  "reviews": [
    {
      "id": 1,
      "user": {"name": "John Doe"},
      "rating": 5,
      "review": "Great stay!",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "rating": 4.5,
  "review_count": 10,
  "nearby_places": [
    {
      "name": "Mall of Asia",
      "type": "Shopping",
      "distance": "2.0 Km"
    }
  ]
}
```

**Backend Implementation**: `backend/property/views.py::property_detail()`
- Retrieves property with all related data
- Includes images, rooms, amenities, reviews
- Calculates average rating
- Returns nearby places if available

### Flutter App Implementation

```dart
// lib/screens/property_detail_screen.dart

class PropertyDetailScreen extends StatefulWidget {
  final int propertyId;
  
  const PropertyDetailScreen({Key? key, required this.propertyId}) : super(key: key);
  
  @override
  _PropertyDetailScreenState createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  Property? property;
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    loadProperty();
  }
  
  Future<void> loadProperty() async {
    try {
      final propertyService = PropertyService();
      final data = await propertyService.getProperty(widget.propertyId);
      setState(() {
        property = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load property: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('Property Details')),
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    if (property == null) {
      return Scaffold(
        appBar: AppBar(title: Text('Property Details')),
        body: Center(child: Text('Property not found')),
      );
    }
    
    return Scaffold(
      appBar: AppBar(title: Text(property!.name)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image carousel
            ImageCarousel(images: property!.images),
            
            // Property info
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(property!.name, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  Text(property!.location),
                  // Rating, amenities, rooms, etc.
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 4. Booking Creation

### Overview
Users can create bookings for properties by selecting dates, rooms, guests, and applying offers. The booking process includes price calculation, payment selection, and confirmation.

### Frontend Flow (Next.js)

#### Step 1: Navigate to Booking Page
- **Location**: `frontend/src/app/property/[id]/book/page.tsx`
- **User Action**: Click "Book Now" button on property details page
- **URL Parameters**:
  - `checkInDate`: YYYY-MM-DD
  - `checkOutDate`: YYYY-MM-DD
  - `checkInTime`: HH:MM (for hourly bookings)
  - `checkOutTime`: HH:MM (for hourly bookings)
  - `rooms`: number
  - `guests`: number
  - `bookingType`: 'daily' | 'hourly' | 'monthly' | 'yearly'
  - `selectedRooms`: JSON array of `{id, name, quantity, price}`
  - `selectedOffer`: offer ID (optional)

#### Step 2: Review Booking Details
- **Displays**:
  - Property summary
  - Selected dates/times
  - Selected rooms with quantities
  - Price breakdown:
    - Room charges
    - Discount (if offer applied)
    - Taxes (5% GST)
    - Total price
  - Payment type selection (Cash/Online)
  - Guest information form (if not logged in)

#### Step 3: Submit Booking
- **Process**:
  1. Validates user is logged in (shows login dialog if not)
  2. Validates all required fields
  3. Calls `bookProperty()` from `frontend/src/lib/api/bookProperty.ts`
  4. Shows loading state
  5. On success, redirects to `/bookingconfirmation`

#### Step 4: Booking Confirmation
- **Location**: `frontend/src/app/bookingconfirmation/page.tsx`
- **Displays**:
  - Success message
  - Booking confirmation details
  - Link to "My Bookings" page
  - "Return to Homepage" button

### Backend API Endpoints

#### POST `/api/booking/bookings/`
**Request Body:**
```json
{
  "property": 1,
  "room": 3,
  "user": 1,
  "checkin_date": "2025-11-27",
  "checkout_date": "2025-11-28",
  "checkin_time": "14:00",
  "checkout_time": "12:00",
  "status": "pending",
  "discount": 250.00,
  "price": 2362.50,
  "offer_id": 1,
  "booking_type": "daily",
  "booking_time": "daily",
  "payment_type": "cash",
  "number_of_guests": 2,
  "number_of_rooms": 1,
  "booking_room_types": [
    {"3": 1}
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 123,
  "property": 1,
  "room": 3,
  "user": 1,
  "checkin_date": "2025-11-27",
  "checkout_date": "2025-11-28",
  "status": "pending",
  "price": 2362.50,
  "booking_type": "daily",
  "created_at": "2025-01-15T10:00:00Z"
}
```

**Backend Implementation**: `backend/booking/views.py::booking_list()`
- Validates booking data
- Checks room availability
- Calculates price with taxes and discounts
- Creates `Booking` record
- Returns booking details

### Flutter App Implementation

```dart
// lib/models/booking.dart

class BookingRequest {
  final int propertyId;
  final int roomId;
  final String checkInDate;
  final String checkOutDate;
  final String? checkInTime;
  final String? checkOutTime;
  final int numberOfGuests;
  final int numberOfRooms;
  final String bookingType;
  final String paymentType;
  final double price;
  final double discount;
  final int? offerId;
  final Map<String, int> bookingRoomTypes;
  
  Map<String, dynamic> toJson() {
    final List<Map<String, int>> roomTypesList = 
        bookingRoomTypes.entries.map((e) => {e.key: e.value}).toList();
    
    return {
      'property': propertyId,
      'room': roomId,
      'checkin_date': checkInDate,
      'checkout_date': checkOutDate,
      if (checkInTime != null) 'checkin_time': checkInTime,
      if (checkOutTime != null) 'checkout_time': checkOutTime,
      'number_of_guests': numberOfGuests,
      'number_of_rooms': numberOfRooms,
      'booking_type': bookingType,
      'booking_time': bookingType,
      'payment_type': paymentType,
      'status': 'pending',
      'price': price,
      'discount': discount,
      if (offerId != null) 'offer_id': offerId,
      'booking_room_types': roomTypesList,
    };
  }
}

// lib/services/booking_service.dart

class BookingService {
  static const String baseUrl = 'http://your-api-url/api';
  
  Future<Map<String, dynamic>> createBooking(BookingRequest request) async {
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString('accessToken');
    
    if (accessToken == null) {
      throw Exception('User not authenticated');
    }
    
    final response = await http.post(
      Uri.parse('$baseUrl/booking/bookings/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: jsonEncode(request.toJson()),
    );
    
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to create booking: ${response.body}');
  }
}
```

---

## 5. Viewing Bookings

### Overview
Users can view all their bookings, including past, current, and upcoming bookings. They can also download invoices and write reviews for completed bookings.

### Frontend Flow (Next.js)

#### Step 1: Navigate to Bookings Page
- **Location**: `frontend/src/app/booking/page.tsx`
- **User Action**: Click "My Bookings" in header or navigate to `/booking`
- **Requires**: User must be logged in (redirects to home if not)

#### Step 2: Fetch User Bookings
- **Location**: `frontend/src/lib/api/fetchUserBookings.ts`
- **Process**:
  1. Gets `userId` from localStorage
  2. Calls `GET /api/booking/bookings/user/?user_id={userId}`
  3. Returns array of `Booking` objects

#### Step 3: Display Bookings
- **For Each Booking**:
  - Booking ID and status badge
  - Property image and name
  - Booking type (Daily/Hourly/Monthly)
  - Check-in/check-out dates and times
  - Room details with quantities
  - Amount paid
  - Actions:
    - **Write Review** (if completed and no review exists)
    - **View Review** (if review exists)
    - **Download Invoice** (PDF generation)

#### Step 4: Write Review
- **Process**:
  1. Click "Write a Review" button
  2. Dialog opens with:
     - Star rating selector (1-5)
     - Review text area
  3. Submit calls `createUserReview()` from `frontend/src/lib/api/createUserReview.ts`
  4. Updates booking to show "View Review" instead

#### Step 5: Download Invoice
- **Location**: `frontend/src/lib/invoice/generatePDFInvoice.ts`
- **Process**:
  1. Uses jsPDF library
  2. Generates PDF with:
     - Booking details
     - Property information
     - Price breakdown
     - Payment information
  3. Downloads as `invoice-{bookingId}.pdf`

### Backend API Endpoints

#### GET `/api/booking/bookings/user/?user_id={userId}`
**Response (200 OK):**
```json
[
  {
    "id": 123,
    "property": {
      "id": 1,
      "name": "Luxury Hotel",
      "location": "123 Main St, Mumbai",
      "images": [
        {"image": "http://localhost:8000/media/property_images/image.jpg"}
      ],
      "rooms": [
        {
          "id": 3,
          "name": "Deluxe Room",
          "daily_rate": "2500.00"
        }
      ],
      "reviews": [
        {
          "id": 1,
          "rating": 5,
          "review": "Great stay!",
          "created_at": "2025-01-15T10:00:00Z"
        }
      ]
    },
    "room": 3,
    "checkin_date": "2025-11-27",
    "checkout_date": "2025-11-28",
    "checkin_time": "14:00",
    "checkout_time": "12:00",
    "status": "confirmed",
    "booking_time": "daily",
    "booking_type": "daily",
    "price": 2362.50,
    "discount": 250.00,
    "number_of_guests": 2,
    "number_of_rooms": 1,
    "booking_room_types": [
      {"3": 1}
    ],
    "is_review_created": true,
    "review_id": 1,
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

**Backend Implementation**: `backend/booking/views.py::booking_list_by_user()`
- Filters bookings by user ID
- Includes property details, rooms, reviews
- Returns bookings ordered by creation date (newest first)

#### POST `/api/property/reviews/create/`
**Request Body:**
```json
{
  "booking_id": 123,
  "property": 1,
  "rating": 5,
  "review": "Great stay! Excellent service."
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "booking": 123,
  "property": 1,
  "user": 1,
  "rating": 5,
  "review": "Great stay! Excellent service.",
  "created_at": "2025-01-15T10:00:00Z"
}
```

**Backend Implementation**: `backend/property/views.py::create_review()`
- Validates booking exists and belongs to user
- Checks if review already exists for booking
- Creates `Review` record
- Updates booking's `is_review_created` flag

### Flutter App Implementation

```dart
// lib/screens/bookings_screen.dart

class BookingsScreen extends StatefulWidget {
  @override
  _BookingsScreenState createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  List<Booking> bookings = [];
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    loadBookings();
  }
  
  Future<void> loadBookings() async {
    try {
      final bookingService = BookingService();
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');
      
      if (userId == null) {
        // Redirect to login
        return;
      }
      
      final data = await bookingService.getUserBookings(userId);
      setState(() {
        bookings = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load bookings: $e')),
      );
    }
  }
  
  Future<void> writeReview(int bookingId, int propertyId, int rating, String review) async {
    try {
      final reviewService = ReviewService();
      await reviewService.createReview(
        bookingId: bookingId,
        propertyId: propertyId,
        rating: rating,
        review: review,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Review submitted successfully')),
      );
      loadBookings(); // Refresh list
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit review: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('My Bookings')),
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    return Scaffold(
      appBar: AppBar(title: Text('My Bookings')),
      body: ListView.builder(
        itemCount: bookings.length,
        itemBuilder: (context, index) {
          final booking = bookings[index];
          return BookingCard(
            booking: booking,
            onWriteReview: (booking) {
              // Show review dialog
            },
            onDownloadInvoice: (booking) {
              // Generate and download PDF
            },
          );
        },
      ),
    );
  }
}
```

---

## 6. Favorites Management

### Overview
Users can add properties to their favorites list and view all favorited properties. Favorites are stored per user and persist across sessions.

### Frontend Flow (Next.js)

#### Step 1: Add to Favorites
- **Location**: `frontend/src/components/PropertyCard.tsx` or property details page
- **User Action**: Click heart icon on property card
- **Process**:
  1. Calls `toggleFavourite(propertyId, true)` from `frontend/src/lib/api/toggleFavourite.ts`
  2. Updates UI to show filled heart icon
  3. Shows toast notification: "Property added to favorites"

#### Step 2: Remove from Favorites
- **User Action**: Click filled heart icon
- **Process**:
  1. Calls `toggleFavourite(propertyId, false)`
  2. Updates UI to show empty heart icon
  3. Shows toast notification: "Property removed from favorites"

#### Step 3: View Favorites Page
- **Location**: `frontend/src/app/favorites/page.tsx`
- **User Action**: Click "Favorites" in header or navigate to `/favorites`
- **Requires**: User must be logged in (redirects to home if not)

#### Step 4: Display Favorites
- **Location**: `frontend/src/components/favorite-properties.tsx`
- **Process**:
  1. Calls `fetchFavouriteProperties()` from `frontend/src/lib/api/fetchFavouriteProperties.ts`
  2. Displays list of favorited properties using `PropertyCard` component
  3. Shows empty state if no favorites

### Backend API Endpoints

#### POST `/api/property/toggle-favourite/`
**Request Body:**
```json
{
  "property_id": 1,
  "is_favourite": true
}
```

**Response (200 OK):**
```json
{
  "message": "Property added to favorites"
}
```
or
```json
{
  "message": "Property removed from favorites"
}
```

**Backend Implementation**: `backend/property/views.py::add_favorite_property()`
- If `is_favourite: true`: Creates or gets `FavoriteProperty` record
- If `is_favourite: false`: Deletes `FavoriteProperty` record if exists
- Returns success message

#### GET `/api/property/favorite-properties/`
**Response (200 OK):**
```json
[
  {
    "id": 1,
    "property": {
      "id": 1,
      "name": "Luxury Hotel",
      "property_type": "hotel",
      "location": "123 Main St, Mumbai",
      "images": [
        {"image_url": "http://localhost:8000/media/property_images/image.jpg"}
      ],
      "rooms": [
        {
          "id": 1,
          "name": "Deluxe Room",
          "daily_rate": "2500.00"
        }
      ]
    },
    "user": 1,
    "created_at": "2025-01-15T10:00:00Z",
    "is_active": true
  }
]
```

**Backend Implementation**: `backend/property/views.py::get_favorite_properties()`
- Filters `FavoriteProperty` by authenticated user and `is_active=True`
- Returns properties with full details

### Flutter App Implementation

```dart
// lib/services/favorite_service.dart

class FavoriteService {
  static const String baseUrl = 'http://your-api-url/api';
  
  Future<void> toggleFavorite(int propertyId, bool isFavorite) async {
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString('accessToken');
    
    if (accessToken == null) {
      throw Exception('User not authenticated');
    }
    
    final response = await http.post(
      Uri.parse('$baseUrl/property/toggle-favourite/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $accessToken',
      },
      body: jsonEncode({
        'property_id': propertyId,
        'is_favourite': isFavorite,
      }),
    );
    
    if (response.statusCode != 200) {
      throw Exception('Failed to toggle favorite');
    }
  }
  
  Future<List<Property>> getFavoriteProperties() async {
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString('accessToken');
    
    if (accessToken == null) {
      throw Exception('User not authenticated');
    }
    
    final response = await http.get(
      Uri.parse('$baseUrl/property/favorite-properties/'),
      headers: {
        'Authorization': 'Bearer $accessToken',
      },
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((item) => Property.fromJson(item['property'])).toList();
    }
    throw Exception('Failed to fetch favorites');
  }
}
```

---

## 7. Profile Management

### Overview
Users can view and update their profile information, including name and email. Mobile number cannot be changed.

### Frontend Flow (Next.js)

#### Step 1: Navigate to Profile Page
- **Location**: `frontend/src/app/profile/page.tsx`
- **User Action**: Click user name/avatar in header or navigate to `/profile`
- **Requires**: User must be logged in (redirects to home if not)

#### Step 2: Fetch Profile
- **Location**: `frontend/src/lib/api/getProfile.ts`
- **Process**:
  1. Calls `GET /api/users/profile/`
  2. Returns user profile data

#### Step 3: Display Profile Form
- **Fields**:
  - **Name**: Editable text input
  - **Email**: Editable email input
  - **Mobile**: Read-only (cannot be changed)
- **Actions**:
  - "Update Profile" button

#### Step 4: Update Profile
- **Process**:
  1. User edits name and/or email
  2. Clicks "Update Profile"
  3. Calls `updateProfile()` from `frontend/src/lib/api/updateProfile.ts`
  4. Updates localStorage with new name
  5. Shows success toast: "Profile updated successfully!"

### Backend API Endpoints

#### GET `/api/users/profile/`
**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "user_role": "customer",
  "created_at": "2025-01-01T10:00:00Z"
}
```

**Backend Implementation**: `backend/users/views.py::profile()`
- Returns authenticated user's profile data

#### PUT `/api/users/profile/`
**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "mobile": "9876543210",
  "user_role": "customer",
  "created_at": "2025-01-01T10:00:00Z"
}
```

**Backend Implementation**: `backend/users/views.py::profile()`
- Updates user's name and email
- Mobile number cannot be updated (ignored if sent)
- Returns updated profile

### Flutter App Implementation

```dart
// lib/screens/profile_screen.dart

class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  String? name;
  String? email;
  String? mobile;
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    loadProfile();
  }
  
  Future<void> loadProfile() async {
    try {
      final profileService = ProfileService();
      final data = await profileService.getProfile();
      setState(() {
        name = data['name'];
        email = data['email'];
        mobile = data['mobile'];
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load profile: $e')),
      );
    }
  }
  
  Future<void> updateProfile() async {
    if (!_formKey.currentState!.validate()) return;
    
    try {
      final profileService = ProfileService();
      await profileService.updateProfile(
        name: name!,
        email: email!,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Profile updated successfully')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update profile: $e')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('My Profile')),
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    return Scaffold(
      appBar: AppBar(title: Text('My Profile')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            TextFormField(
              initialValue: name,
              decoration: InputDecoration(labelText: 'Name'),
              onChanged: (value) => name = value,
              validator: (value) => value?.isEmpty ?? true ? 'Name is required' : null,
            ),
            SizedBox(height: 16),
            TextFormField(
              initialValue: email,
              decoration: InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
              onChanged: (value) => email = value,
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Email is required';
                if (!value!.contains('@')) return 'Invalid email';
                return null;
              },
            ),
            SizedBox(height: 16),
            TextFormField(
              initialValue: mobile,
              decoration: InputDecoration(
                labelText: 'Mobile',
                enabled: false,
              ),
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: updateProfile,
              child: Text('Update Profile'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 8. Blog Reading

### Overview
Users can browse and read blog posts published on the platform. Blogs can be filtered by category, tag, and searched by keywords.

### Frontend Flow (Next.js)

#### Step 1: Navigate to Blog Page
- **Location**: `frontend/src/app/blog/page.tsx`
- **User Action**: Click "Blog" in navigation or navigate to `/blog`

#### Step 2: Fetch Blogs
- **Location**: `frontend/src/lib/api/fetchBlogs.ts`
- **Process**:
  1. Calls `GET /api/blog/blogs/` with optional query parameters:
     - `category`: category slug
     - `tag`: tag slug
     - `search`: search keyword
     - `highlighted`: true/false
     - `all`: true (to get all blogs including unpublished, admin only)
  2. Returns array of `Blog` objects

#### Step 3: Display Blog List
- **For Each Blog**:
  - Featured image
  - Category badge
  - Title
  - Excerpt
  - Author and publish date
  - Read time estimate
  - Tags
  - Clickable card linking to blog detail page

#### Step 4: View Blog Detail
- **Location**: `frontend/src/app/blog/[slug]/page.tsx`
- **Process**:
  1. Calls `GET /api/blog/blogs/{slug}/`
  2. Increments view count on backend
  3. Displays:
     - Full blog content (HTML/Markdown)
     - Author information
     - Publish date
     - Category and tags
     - Related blogs section

#### Step 5: Search and Filter
- **Search**: Enter keyword in search box, filters blogs by title/excerpt/content
- **Category Filter**: Click category button, filters by category
- **Tag Filter**: Click tag, filters by tag

### Backend API Endpoints

#### GET `/api/blog/blogs/`
**Query Parameters:**
- `category` (optional): Category slug
- `tag` (optional): Tag slug
- `search` (optional): Search keyword
- `highlighted` (optional): true/false
- `all` (optional): true (admin only, includes unpublished)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "10 Best Hotels in Mumbai",
    "slug": "10-best-hotels-in-mumbai",
    "excerpt": "Discover the top hotels...",
    "content": "<p>Full blog content...</p>",
    "featured_image": "http://localhost:8000/media/blog_images/image.jpg",
    "category": {
      "id": 1,
      "name": "Travel Tips",
      "slug": "travel-tips"
    },
    "tags": [
      {"id": 1, "name": "Mumbai", "slug": "mumbai"}
    ],
    "author": "Admin",
    "published_at": "2025-01-15T10:00:00Z",
    "views_count": 150,
    "is_published": true,
    "is_highlighted": false
  }
]
```

**Backend Implementation**: `backend/blog/views.py::blog_list()`
- Filters by published status (unless `all=true` and user is admin)
- Applies category, tag, search filters
- Orders by published date (newest first)
- Returns blog list with basic info

#### GET `/api/blog/blogs/{slug}/`
**Response (200 OK):**
```json
{
  "id": 1,
  "title": "10 Best Hotels in Mumbai",
  "slug": "10-best-hotels-in-mumbai",
  "excerpt": "Discover the top hotels...",
  "content": "<p>Full blog content...</p>",
  "featured_image": "http://localhost:8000/media/blog_images/image.jpg",
  "category": {
    "id": 1,
    "name": "Travel Tips",
    "slug": "travel-tips"
  },
  "tags": [
    {"id": 1, "name": "Mumbai", "slug": "mumbai"}
  ],
  "author": "Admin",
  "published_at": "2025-01-15T10:00:00Z",
  "views_count": 151,
  "is_published": true,
  "is_highlighted": false,
  "images": [
    {
      "id": 1,
      "image_url": "http://localhost:8000/media/blog_images/image.jpg",
      "alt_text": "Hotel image"
    }
  ]
}
```

**Backend Implementation**: `backend/blog/views.py::blog_detail()`
- Retrieves blog by slug
- Increments `views_count`
- Returns full blog content with images
- Only shows published blogs to public (unless admin)

#### GET `/api/blog/blogs/{slug}/related/`
**Response (200 OK):**
```json
[
  {
    "id": 2,
    "title": "Travel Guide to Mumbai",
    "slug": "travel-guide-to-mumbai",
    "excerpt": "A comprehensive guide...",
    "featured_image": "http://localhost:8000/media/blog_images/image2.jpg",
    "published_at": "2025-01-10T10:00:00Z"
  }
]
```

**Backend Implementation**: `backend/blog/views.py::related_blogs()`
- Finds blogs with same category or tags
- Excludes current blog
- Returns top 3 related blogs

### Flutter App Implementation

```dart
// lib/models/blog.dart

class Blog {
  final int id;
  final String title;
  final String slug;
  final String excerpt;
  final String content;
  final String? featuredImage;
  final BlogCategory? category;
  final List<BlogTag> tags;
  final String author;
  final DateTime publishedAt;
  final int viewsCount;
  final bool isPublished;
  final bool isHighlighted;
  
  Blog.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        title = json['title'],
        slug = json['slug'],
        excerpt = json['excerpt'],
        content = json['content'],
        featuredImage = json['featured_image'],
        category = json['category'] != null
            ? BlogCategory.fromJson(json['category'])
            : null,
        tags = (json['tags'] as List?)
            ?.map((tag) => BlogTag.fromJson(tag))
            .toList() ?? [],
        author = json['author'],
        publishedAt = DateTime.parse(json['published_at']),
        viewsCount = json['views_count'],
        isPublished = json['is_published'],
        isHighlighted = json['is_highlighted'];
}

// lib/services/blog_service.dart

class BlogService {
  static const String baseUrl = 'http://your-api-url/api';
  
  Future<List<Blog>> getBlogs({
    String? category,
    String? tag,
    String? search,
    bool? highlighted,
  }) async {
    final queryParams = <String, String>{};
    if (category != null) queryParams['category'] = category;
    if (tag != null) queryParams['tag'] = tag;
    if (search != null) queryParams['search'] = search;
    if (highlighted != null) queryParams['highlighted'] = highlighted.toString();
    
    final uri = Uri.parse('$baseUrl/blog/blogs/')
        .replace(queryParameters: queryParams);
    
    final response = await http.get(uri);
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Blog.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch blogs');
  }
  
  Future<Blog> getBlogBySlug(String slug) async {
    final response = await http.get(
      Uri.parse('$baseUrl/blog/blogs/$slug/'),
    );
    
    if (response.statusCode == 200) {
      return Blog.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to fetch blog');
  }
  
  Future<List<Blog>> getRelatedBlogs(String slug) async {
    final response = await http.get(
      Uri.parse('$baseUrl/blog/blogs/$slug/related/'),
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Blog.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch related blogs');
  }
}
```

---

## Summary

This documentation covers all major user workflows in the HSquare Hotel Management System:

1. **Authentication**: OTP-based login/signup with JWT tokens
2. **Property Search & Browsing**: Search and filter properties by location, dates, rooms, guests
3. **Property Details**: View comprehensive property information including images, amenities, rooms, reviews, and location
4. **Booking Creation**: Create bookings with date/time selection, room selection, offer application, and payment
5. **Viewing Bookings**: View all bookings, write reviews, and download invoices
6. **Favorites Management**: Add/remove properties from favorites and view favorites list
7. **Profile Management**: View and update user profile (name, email)
8. **Blog Reading**: Browse and read blog posts with search and filter capabilities

Each workflow includes:
- Frontend implementation details (Next.js/React)
- Backend API endpoints with request/response formats
- Flutter app implementation examples
- Step-by-step user flow descriptions

This documentation serves as a comprehensive guide for developers working on any part of the HSquare system.

