# HSquare Hotel Management System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Backend Documentation](#backend-documentation)
3. [Frontend Documentation](#frontend-documentation)
4. [Mobile App (HSquare) Documentation](#mobile-app-hsquare-documentation)
5. [Architecture Overview](#architecture-overview)
6. [API Documentation](#api-documentation)
7. [Deployment](#deployment)

---

## Overview

HSquare is a comprehensive hotel and hostel management system consisting of three main components:
- **Backend**: Django REST Framework API
- **Frontend**: Next.js web application
- **Mobile App**: Flutter mobile application

The system manages properties (hotels/hostels), bookings, users, expenses, offers, blogs, and provides administrative capabilities with role-based access control.

---

## Backend Documentation

### Technology Stack
- **Framework**: Django 5.1.5
- **API Framework**: Django REST Framework 3.15.2
- **Authentication**: JWT (djangorestframework-simplejwt 5.4.0)
- **Database**: SQLite3 (development)
- **Cache**: Redis (django-redis 5.4.0)
- **Image Processing**: Pillow 11.1.0
- **CORS**: django-cors-headers 4.6.0
- **Static Files**: WhiteNoise 6.9.0
- **Other Libraries**: 
  - pandas 2.2.3 (data analysis)
  - reportlab 4.2.5 (PDF generation)
  - XlsxWriter 3.2.3 (Excel reports)

### Project Structure

```
backend/
├── backend/              # Main Django project settings
│   ├── settings.py      # Configuration
│   ├── urls.py          # Root URL routing
│   ├── wsgi.py          # WSGI config
│   └── asgi.py          # ASGI config
├── users/               # User management app
├── property/            # Property management app
├── booking/             # Booking management app
├── expenses/            # Expense tracking app
├── offer/               # Offers and discounts app
├── blog/                # Blog/content management app
├── stats/               # Statistics and reporting app
├── jobs/                # Background jobs app
├── manage.py            # Django management script
└── requirements.txt     # Python dependencies
```

### Core Applications

#### 1. Users App (`users/`)

**Purpose**: User authentication, authorization, and profile management

**Key Models**:
- `HsUser`: Custom user model with mobile-based authentication
  - Fields: mobile (unique), name, email, user_role, is_staff, is_active
  - Roles: admin, customer, employee
- `HsPermission`: Permission definitions
- `HsPermissionGroup`: Groups of permissions
- `UserHsPermission`: User-permission group associations
- `UserDocument`: User document storage
- `RefreshToken`: JWT refresh token management
- `UserSession`: User session tracking

**Key Features**:
- Mobile number-based authentication (OTP)
- JWT token-based authentication
- Role-based access control (RBAC)
- Permission groups management
- User document uploads
- Session management

**URLs**:
- `/api/users/send-otp/` - Send OTP for login
- `/api/users/verify-otp/` - Verify OTP and get tokens
- `/api/users/refresh-token/` - Refresh access token
- `/api/users/profile/` - Get/update user profile
- `/api/users/users/` - List users (admin)
- `/api/users/permissions/` - Permission management
- `/api/users/user-document/<id>/` - User document management

**Authentication Decorator**:
- `@custom_authentication_and_permissions()`: Custom decorator for JWT authentication and permission checking
  - Supports exempt GET views
  - Checks required permissions
  - Validates JWT tokens

#### 2. Property App (`property/`)

**Purpose**: Property, room, and image management

**Key Models**:
- `Property`: Main property model (hotel/hostel)
  - Fields: name, property_type, location, city, state, country, description, latitude, longitude
  - Types: hotel, hostel
  - Gender types: unisex, male, female
- `Room`: Room details
  - Fields: name, daily_rate, hourly_rate, monthly_rate, yearly_rate, discount, bed_type, maxoccupancy, number_of_rooms
  - Bed types: single, double, queen, king, twin, bunk, sofa, etc.
- `PropertyImage`: Property images with categories
- `RoomImage`: Room-specific images
- `Amenity`: Property amenities
- `Rule`: Property rules/policies
- `Documentation`: Required documentation
- `Review`: Property reviews
- `Reply`: Review replies
- `ImageCategory`: Image categorization
- `City`, `State`, `Country`: Location models
- `NearbyPlace`: Nearby places/landmarks
- `FavoriteProperty`: User favorites
- `UserProperty`: User-property associations
- `SitePage`: Dynamic site pages
- `SitePageImage`: Site page images
- `Setting`: Global settings

**Key Features**:
- Property CRUD operations
- Room management with multiple rate types
- Image upload with categories
- Location management (city, state, country)
- Reviews and ratings
- Favorites functionality
- Dynamic site pages
- Settings management
- Public search API

**URLs**:
- `/api/property/properties/` - List/create properties
- `/api/property/properties/<id>/` - Property detail/update/delete
- `/api/property/rooms/` - Room management
- `/api/property/images/upload/` - Image upload
- `/api/property/public/search/` - Public property search
- `/api/property/reviews/` - Review management
- `/api/property/favorite-properties/` - Favorites
- `/api/property/site-pages/` - Site pages
- `/api/property/settings/` - Settings

#### 3. Booking App (`booking/`)

**Purpose**: Booking management and tracking

**Key Models**:
- `Booking`: Main booking model
  - Booking types: walkin, online, makemytrip, tripadvisor, expedia, agoda, bookingcom, airbnb, other
  - Booking time: hourly, daily, monthly, yearly
  - Status: pending, confirmed, cancelled, completed, checked_in, checked_out, no_show
  - Payment types: card, cash, upi
  - Auto-generates booking_id: DDMMYYYYHHMM + 3-digit sequence
- `BookingDocument`: Booking-related documents
- `BookingReview`: Booking-review associations
- `HostelVisit`: Pre-visit bookings for hostels

**Key Features**:
- Booking creation and management
- Status tracking
- Document uploads
- Review creation from bookings
- Visit management for hostels
- Booking ID auto-generation

**URLs**:
- `/api/booking/bookings/` - List/create bookings
- `/api/booking/bookings/<id>/` - Booking detail/update
- `/api/booking/bookings/user/` - User's bookings
- `/api/booking/bookings/<id>/status/` - Update booking status
- `/api/booking/visits/` - Hostel visits

#### 4. Expenses App (`expenses/`)

**Purpose**: Expense tracking and management

**Key Models**:
- `Expense`: Expense records
  - Categories, properties, status tracking
  - Document attachments

**URLs**:
- `/api/expenses/` - Expense CRUD operations

#### 5. Offer App (`offer/`)

**Purpose**: Offers and discounts management

**Key Models**:
- `Offer`: Offer details
  - Discount percentages, codes, property associations
- `PropertyOffer`: Property-offer associations

**URLs**:
- `/api/offers/` - Offer management

#### 6. Blog App (`blog/`)

**Purpose**: Content/blog management

**Key Models**:
- `Blog`: Blog posts
  - Rich text content, images, categories, tags
- `BlogImage`: Blog images

**URLs**:
- `/api/blog/` - Blog CRUD operations

#### 7. Stats App (`stats/`)

**Purpose**: Statistics and reporting

**Features**:
- Dashboard statistics
- Sales reports
- Property occupancy stats
- User statistics
- Expense statistics
- PDF/Excel report generation

**URLs**:
- `/api/stats/` - Various statistics endpoints

### Database Configuration

- **Development**: SQLite3 (`db.sqlite3`)
- **Cache**: Redis (localhost:6379, database 1)
- **Media**: Local file storage (`media/` directory)
- **Static**: WhiteNoise for static file serving

### Authentication & Authorization

**JWT Configuration**:
- Access token lifetime: 5 minutes
- Refresh token lifetime: 1 day
- Algorithm: HS256
- Secret key: Django SECRET_KEY

**Permission System**:
- Custom permission model (`HsPermission`)
- Permission groups (`HsPermissionGroup`)
- User-permission associations
- Decorator-based permission checking
- Format: `admin:module:action` (e.g., `admin:property:create`)

### Logging

**Log Configuration**:
- Date-based log files in `~/logs/`
- Separate loggers for: property, users, hsquare, django.request
- Request method tracking
- Custom formatters with request type

**Log Files**:
- `hsquare-backend-log-YYYY-MM-DD.log` - General backend logs
- `hsquare-backend-requests-YYYY-MM-DD.log` - Request logs

### CORS Configuration

**Allowed Origins**:
- Local development: localhost:3000, localhost:3001, 127.0.0.1:*
- Production: hsquareliving.com, hsquareliving.in
- Network: 192.168.* (for local network access)

### Media & Static Files

- **Media URL**: `/media/`
- **Media Root**: `backend/media/`
- **Static URL**: `/static/`
- **Static Root**: `backend/static/`
- **Image Uploads**:
  - Property images: `media/property_images/`
  - Room images: `media/room_images/`
  - User documents: `media/user_documents/`
  - Booking documents: `media/booking_documents/`
  - Blog images: `media/blog_images/`
  - Site pages: `media/site_pages/`

### Key Settings

- **DEBUG**: True (development)
- **ALLOWED_HOSTS**: ["*"]
- **TIME_ZONE**: UTC
- **LANGUAGE_CODE**: en-us
- **WEBSITE_URL**: Configurable (localhost:8000 default)

---

## Frontend Documentation

### Technology Stack
- **Framework**: Next.js 15.1.6
- **Language**: TypeScript 5
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Forms**: React Hook Form (implied)
- **Maps**: Leaflet 1.9.4, react-leaflet 4.2.1
- **Rich Text**: Lexical 0.19.0
- **Charts**: Recharts 2.15.3
- **PDF**: jsPDF 3.0.1
- **Notifications**: react-toastify 11.0.3
- **Image Cropping**: react-easy-crop 5.2.0
- **Date Handling**: date-fns 3.6.0
- **Icons**: lucide-react 0.474.0

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── property/           # Property pages
│   │   ├── booking/           # Booking pages
│   │   ├── blog/              # Blog pages
│   │   ├── profile/           # User profile
│   │   └── ...                # Other public pages
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── blog/             # Blog components
│   │   ├── ui/               # Reusable UI components
│   │   └── ...               # Other components
│   ├── lib/                  # Utilities and helpers
│   │   ├── api/             # API client functions
│   │   ├── utils/           # Utility functions
│   │   └── ...              # Other libraries
│   ├── hooks/                # Custom React hooks
│   ├── providers/           # Context providers
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── package.json            # Dependencies
└── next.config.ts          # Next.js configuration
```

### Key Features

#### 1. Authentication System
- **OTP-based Login**: Mobile number + OTP verification
- **JWT Token Management**: Automatic token refresh
- **Session Management**: LocalStorage-based
- **Protected Routes**: Route-level authentication
- **Permission-based Access**: Component-level permission checks

**Components**:
- `LoginDialog.tsx`: Login/signup modal
- `MobileLogin.tsx`: Mobile-specific login
- `ProtectedRoute.tsx`: Route protection wrapper
- `PermissionGuard.tsx`: Permission-based component rendering

#### 2. Property Management
- **Property Listing**: Grid/list views with filters
- **Property Details**: Full property information with images
- **Property Creation/Editing**: Comprehensive forms
- **Image Management**: Upload, crop, categorize
- **Map Integration**: Leaflet maps for location selection
- **Search**: Advanced search with filters

**Components**:
- `PropertyCard.tsx`: Property card display
- `PropertyDetails.tsx`: Detailed property view
- `AddPropertyForm.tsx`: Create property form
- `EditPropertyForm.tsx`: Edit property form
- `SearchForm.tsx`: Search interface
- `SearchResults.tsx`: Search results display
- `FormMapPicker.tsx`: Map-based location picker
- `ImageCropper.tsx`: Image cropping tool

#### 3. Booking System
- **Booking Creation**: Multi-step booking process
- **Booking Management**: View, update, cancel bookings
- **Booking Calendar**: Date/time selection
- **Document Upload**: Booking-related documents
- **Invoice Generation**: PDF invoice creation

**Components**:
- `BookingModal.tsx`: Booking creation modal
- `BookingCard.tsx`: Booking display card
- `UserBookings.tsx`: User's booking list
- `DatePicker.tsx`: Date selection component
- `HourlyTimeSelector.tsx`: Time selection for hourly bookings

#### 4. Admin Dashboard
- **Dashboard**: Statistics and overview
- **User Management**: User CRUD, role assignment
- **Property Management**: Full property administration
- **Booking Management**: Booking oversight
- **Expense Tracking**: Expense management
- **Offer Management**: Discount/offer creation
- **Blog Management**: Content management
- **Reports**: Statistics and analytics
- **Settings**: System configuration

**Pages**:
- `/admin/dashboard` - Main dashboard
- `/admin/properties` - Property management
- `/admin/bookings` - Booking management
- `/admin/users` - User management
- `/admin/expenses` - Expense tracking
- `/admin/offers` - Offer management
- `/admin/blogs` - Blog management
- `/admin/reports` - Reports and analytics
- `/admin/settings` - Settings

#### 5. API Client
- **Centralized API Client**: `apiClient.ts`
- **Automatic Token Refresh**: Handles 401 errors
- **Error Handling**: Standardized error management
- **Request/Response Interceptors**: Custom logic
- **Type Safety**: TypeScript types for all APIs

**Key Functions**:
- `apiClient()`: Main API client function
- `apiGet()`, `apiPost()`, `apiPut()`, `apiPatch()`, `apiDelete()`: Convenience methods

**API Modules** (in `lib/api/`):
- Property APIs: `fetchProperties.ts`, `createProperty.ts`, `editProperty.ts`
- Booking APIs: `bookProperty.ts`, `fetchBookings.ts`, `updateBooking.ts`
- User APIs: `getProfile.ts`, `updateProfile.ts`, `fetchUsers.ts`
- Auth APIs: `sendOtp.ts`, `verifyOtp.ts`, `refreshToken.ts`
- Image APIs: `uploadImage.ts`, `uploadRoomImage.ts`
- And 80+ more API functions

#### 6. UI Components
**Radix UI Components**:
- Dialog, Dropdown, Select, Checkbox, Label
- Accordion, Avatar, Popover, Slider, Tabs, Tooltip
- Custom styled with Tailwind CSS

**Custom Components**:
- `Button`, `Input`, `Textarea`, `Card`
- `Spinner`, `Modal`, `Toast`
- Form components, Layout components

#### 7. Image Handling
- **Image Upload**: Multi-image upload support
- **Image Cropping**: Client-side cropping with aspect ratio
- **Image Categories**: Categorization system
- **Format Preservation**: Maintains original image format (JPEG/PNG)
- **No Compression**: Uploads images without quality loss

**Components**:
- `ImageCropper.tsx`: Image cropping interface
- `FileUpload.tsx`: File upload component
- `ImageGalleryUploader.tsx`: Multi-image upload

#### 8. Rich Text Editor
- **Lexical Editor**: Rich text editing
- **HTML Conversion**: Lexical to HTML conversion
- **Blog Content**: Used for blog posts

**Components**:
- `LexicalEditor.tsx`: Rich text editor component

#### 9. Maps Integration
- **Leaflet Maps**: Interactive maps
- **Location Picker**: Click-to-select coordinates
- **Property Maps**: Display property locations
- **Search Maps**: Map-based property search

**Components**:
- `Map.tsx`: Map display
- `MapPicker.tsx`: Location picker
- `FormMapPicker.tsx`: Form-integrated map picker
- `PropertyMap.tsx`: Property location map

#### 10. Reporting & Analytics
- **Dashboard Stats**: Real-time statistics
- **Sales Reports**: Revenue tracking
- **Occupancy Reports**: Property occupancy
- **PDF/Excel Export**: Report generation

**Components**:
- `ReportCard.tsx`: Report display card
- `ReportFilters.tsx`: Report filtering

### Routing Structure

**Public Routes**:
- `/` - Home page
- `/property/[id]` - Property details
- `/search` - Property search
- `/blog` - Blog listing
- `/blog/[slug]` - Blog post
- `/booking/[id]` - Booking details
- `/profile` - User profile
- `/favorites` - Favorite properties

**Admin Routes** (protected):
- `/admin/dashboard` - Dashboard
- `/admin/properties` - Properties
- `/admin/properties/new` - Create property
- `/admin/properties/[id]` - Edit property
- `/admin/bookings` - Bookings
- `/admin/users` - Users
- `/admin/expenses` - Expenses
- `/admin/offers` - Offers
- `/admin/blogs` - Blogs
- `/admin/reports` - Reports
- `/admin/settings` - Settings

### State Management

- **Context API**: For global state (auth, permissions)
- **Local State**: React hooks for component state
- **LocalStorage**: For persistent data (tokens, user info)

**Providers**:
- `PermissionProvider.tsx`: Permission management
- `AppErrorProvider.tsx`: Error handling

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: Brand colors and styles
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: (Potential support)

**Key Colors**:
- Primary: `#A31C44` (Red)
- Secondary: Various grays
- Accent: Brand-specific colors

### Configuration

**Next.js Config** (`next.config.ts`):
- Image optimization with remote patterns
- ESLint configuration
- Build optimizations

**API Configuration** (`lib/config.ts`):
- API URL configuration
- Environment-based settings

---

## Mobile App (HSquare) Documentation

### Technology Stack
- **Framework**: Flutter (Dart SDK 3.9.2)
- **State Management**: Provider 6.1.5+1
- **HTTP Client**: http 1.6.0
- **Local Storage**: shared_preferences 2.5.3
- **Fonts**: google_fonts 6.3.2
- **SVG**: flutter_svg 2.2.3
- **Internationalization**: intl 0.20.2

### Project Structure

```
hsquare/
├── lib/
│   ├── main.dart              # App entry point
│   ├── models/               # Data models
│   │   └── property.dart     # Property model
│   ├── screens/              # App screens
│   │   ├── home_screen.dart
│   │   ├── hotels_screen.dart
│   │   ├── hostels_screen.dart
│   │   ├── property_details_screen.dart
│   │   ├── search_screen.dart
│   │   ├── search_results_screen.dart
│   │   └── login_screen.dart
│   ├── services/             # API services
│   │   ├── auth_service.dart
│   │   └── property_service.dart
│   ├── providers/            # State providers
│   │   └── auth_provider.dart
│   ├── widgets/              # Reusable widgets
│   │   └── property_list.dart
│   └── utils/                # Utilities
│       └── constants.dart
├── assets/
│   └── images/              # App assets
├── android/                 # Android configuration
├── ios/                     # iOS configuration
└── pubspec.yaml            # Dependencies
```

### Key Features

#### 1. Authentication
- **OTP-based Login**: Mobile number + OTP
- **Token Management**: JWT token storage
- **Session Persistence**: SharedPreferences
- **Auto-login**: Check login status on app start

**Services**:
- `AuthService`: Handles authentication API calls
- `AuthProvider`: State management for auth

**Screens**:
- `LoginScreen`: Login/signup interface

#### 2. Property Browsing
- **Home Screen**: Hotel/Hostel selection
- **Property Lists**: Filtered property listings
- **Property Details**: Full property information
- **Search**: Property search functionality

**Screens**:
- `HomeScreen`: Main entry point
- `HotelsScreen`: Hotel listings
- `HostelsScreen`: Hostel listings
- `PropertyDetailsScreen`: Property details
- `SearchScreen`: Search interface
- `SearchResultsScreen`: Search results

**Services**:
- `PropertyService`: Property API calls

**Models**:
- `Property`: Property data model

#### 3. UI/UX
- **Material Design 3**: Modern Material Design
- **Custom Theme**: Brand colors (primary red)
- **Google Fonts**: Poppins font family
- **Responsive Layout**: Adaptive UI
- **Image Assets**: Custom images for hotels/hostels

**Constants**:
- `AppColors`: Color definitions
- `AppConstants`: App-wide constants (API URLs, etc.)

### App Flow

1. **Launch**: App checks authentication status
2. **Home**: User selects Hotels or Hostels
3. **List**: Property listings with filters
4. **Details**: Property details view
5. **Search**: Search for properties
6. **Login**: OTP-based authentication

### API Integration

**Base URL**: Configurable in `constants.dart`

**Endpoints Used**:
- `/api/users/send-otp/` - Send OTP
- `/api/users/verify-otp/` - Verify OTP
- `/api/property/properties/` - Get properties
- `/api/property/public/search/` - Search properties

### State Management

**Provider Pattern**:
- `AuthProvider`: Authentication state
- Future: Property providers, booking providers

**State Variables**:
- `isAuthenticated`: Login status
- `userName`: Current user name
- `isLoading`: Loading states

### Platform Support

- **Android**: Full support
- **iOS**: Full support
- **Web**: Potential support
- **Desktop**: Potential support (Linux, macOS, Windows)

### Assets

**Images**:
- Logo: `assets/images/logo.png`
- Hotels: `assets/images/hotels.png`
- Hostels: `assets/images/hostels.png`

---

## Architecture Overview

### System Architecture

```
┌─────────────────┐
│   Mobile App    │
│    (Flutter)    │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼─────────────────┐
│   Frontend (Next.js)     │
│   - Public Pages         │
│   - Admin Dashboard      │
└────────┬─────────────────┘
         │
         │ HTTP/REST
         │
┌────────▼─────────────────┐
│   Backend (Django)       │
│   - REST API             │
│   - Business Logic       │
└────────┬─────────────────┘
         │
         │
┌────────▼─────────────────┐
│   Database (SQLite)      │
│   Cache (Redis)          │
│   Media Storage          │
└──────────────────────────┘
```

### Data Flow

1. **User Request**: User interacts with frontend/mobile app
2. **API Call**: Frontend/mobile makes HTTP request to backend
3. **Authentication**: Backend validates JWT token
4. **Authorization**: Backend checks permissions
5. **Business Logic**: Backend processes request
6. **Database**: Backend queries/updates database
7. **Response**: Backend returns JSON response
8. **UI Update**: Frontend/mobile updates UI

### Security

- **JWT Authentication**: Token-based auth
- **Permission System**: Role-based access control
- **CORS**: Configured for allowed origins
- **Input Validation**: Backend validation
- **SQL Injection**: Django ORM protection
- **XSS**: React/Next.js protection

---

## API Documentation

### Base URL
- Development: `http://localhost:8000/api`
- Production: `https://hsquareliving.com/api`

### Authentication

**Send OTP**:
```
POST /users/send-otp/
Body: { "mobileNumber": "1234567890" }
```

**Verify OTP**:
```
POST /users/verify-otp/
Body: { "mobileNumber": "1234567890", "otp": "123456" }
Response: { "access_token": "...", "refresh_token": "...", "user_role": "...", "id": 1, "name": "..." }
```

**Refresh Token**:
```
POST /users/refresh-token/
Headers: { "Authorization": "Bearer <refresh_token>" }
```

### Properties

**List Properties**:
```
GET /property/properties/
Query Params: propertyType, rooms, guests, location, area, price
```

**Get Property**:
```
GET /property/properties/<id>/
```

**Create Property** (Admin):
```
POST /property/properties/
Headers: { "Authorization": "Bearer <token>" }
Body: { ...property data... }
```

**Search Properties** (Public):
```
GET /property/public/search/
Query Params: propertyType, rooms, guests, location, area, price, bookingType, id
```

### Bookings

**Create Booking**:
```
POST /booking/bookings/
Headers: { "Authorization": "Bearer <token>" }
Body: { ...booking data... }
```

**Get User Bookings**:
```
GET /booking/bookings/user/
Headers: { "Authorization": "Bearer <token>" }
```

**Update Booking Status**:
```
PUT /booking/bookings/<id>/status/
Headers: { "Authorization": "Bearer <token>" }
Body: { "status": "confirmed" }
```

### Images

**Upload Property Image**:
```
POST /property/images/upload/
Headers: { "Authorization": "Bearer <token>" }
Body: FormData with "image" file and optional "category" id
```

**Upload Room Image**:
```
POST /property/room/images/upload/
Headers: { "Authorization": "Bearer <token>" }
Body: FormData with "image" file
```

### Complete API Reference

See individual app `urls.py` files for complete endpoint documentation:
- `/api/users/` - User endpoints
- `/api/property/` - Property endpoints
- `/api/booking/` - Booking endpoints
- `/api/expenses/` - Expense endpoints
- `/api/offers/` - Offer endpoints
- `/api/blog/` - Blog endpoints
- `/api/stats/` - Statistics endpoints

---

## Deployment

### Backend Deployment

**Requirements**:
- Python 3.9+
- PostgreSQL (production) or SQLite (development)
- Redis server
- Gunicorn (WSGI server)

**Steps**:
1. Install dependencies: `pip install -r requirements.txt`
2. Run migrations: `python manage.py migrate`
3. Collect static files: `python manage.py collectstatic`
4. Run with Gunicorn: `gunicorn backend.wsgi:application`

**Environment Variables**:
- `SECRET_KEY`: Django secret key
- `DEBUG`: False for production
- `ALLOWED_HOSTS`: Production domain
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string

### Frontend Deployment

**Requirements**:
- Node.js 18+
- npm or yarn

**Steps**:
1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Start: `npm start`

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WEBSITE_URL`: Frontend URL

### Mobile App Deployment

**Requirements**:
- Flutter SDK 3.9.2+
- Android Studio / Xcode

**Steps**:
1. Install dependencies: `flutter pub get`
2. Build Android: `flutter build apk`
3. Build iOS: `flutter build ios`

**Configuration**:
- Update `lib/utils/constants.dart` with production API URL
- Configure app icons and splash screens
- Set up app signing for release builds

---

## Development Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Mobile App Setup

```bash
cd hsquare
flutter pub get
flutter run
```

---

## Key Features Summary

### Backend
✅ JWT Authentication
✅ Role-based Access Control
✅ Property Management
✅ Booking System
✅ Expense Tracking
✅ Offer Management
✅ Blog/Content Management
✅ Statistics & Reporting
✅ Image Management
✅ Document Management
✅ Redis Caching
✅ Comprehensive Logging

### Frontend
✅ Next.js 15 with App Router
✅ TypeScript
✅ Responsive Design
✅ Admin Dashboard
✅ Property Management UI
✅ Booking Interface
✅ Rich Text Editor
✅ Map Integration
✅ Image Cropping
✅ PDF Generation
✅ Charts & Analytics
✅ Permission-based UI

### Mobile App
✅ Flutter Cross-platform
✅ OTP Authentication
✅ Property Browsing
✅ Search Functionality
✅ Material Design 3
✅ State Management with Provider
✅ API Integration

---

## Future Enhancements

### Potential Improvements
- [ ] Real-time notifications
- [ ] Push notifications (mobile)
- [ ] Payment gateway integration
- [ ] Email/SMS notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA)
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## Support & Contact

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Last Updated**: 2025
**Version**: 1.0.0

