# Hsquare Hotel Booking Mobile App

A Flutter mobile application that provides an exact match for the frontend's mobile view, utilizing the existing Django backend APIs for hotel and hostel booking functionality.

## Features

### 🏨 **Property Management**
- Browse hotels and hostels
- Search properties by location, dates, and guests
- View detailed property information with images, amenities, and reviews
- Add properties to favorites
- Filter by property type (hotel/hostel)

### 📱 **User Authentication**
- OTP-based phone number authentication
- User profile management
- Secure JWT token storage

### 🏠 **Booking System**
- Complete booking flow with room selection
- Booking management and history
- Guest information collection
- Special requests handling

### 📝 **Blog System**
- Browse travel blogs and articles
- Read detailed blog content
- Related articles suggestions

### 🎨 **UI/UX**
- Material 3 design system
- Responsive mobile-first design
- Smooth animations and transitions
- Dark/light theme support
- Cached image loading for better performance

## Technical Architecture

### **State Management**
- Provider pattern for reactive state management
- Separate providers for authentication, properties, bookings, and favorites

### **API Integration**
- RESTful API integration with Django backend
- JWT token-based authentication
- Error handling and retry mechanisms
- Configurable API base URL

### **Data Models**
- Complete data models with JSON serialization
- Type-safe data handling
- Nested object support for complex data structures

### **Services Layer**
- Modular service architecture
- HTTP client with authentication
- Local storage management
- Image caching and optimization

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart                     # App entry point
│   ├── config/
│   │   ├── api_config.dart          # API configuration
│   │   └── theme_config.dart        # App theme and styling
│   ├── models/                      # Data models
│   │   ├── user.dart
│   │   ├── property.dart
│   │   ├── room.dart
│   │   ├── booking.dart
│   │   └── blog.dart
│   ├── providers/                    # State management
│   │   ├── auth_provider.dart
│   │   ├── property_provider.dart
│   │   ├── booking_provider.dart
│   │   └── favorites_provider.dart
│   ├── services/                    # API & storage services
│   │   ├── api_service.dart
│   │   ├── auth_service.dart
│   │   ├── property_service.dart
│   │   ├── booking_service.dart
│   │   ├── blog_service.dart
│   │   └── storage_service.dart
│   ├── screens/                     # UI screens
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   └── property_list_screen.dart
│   │   ├── auth/
│   │   │   └── login_screen.dart
│   │   ├── property/
│   │   │   ├── property_detail_screen.dart
│   │   │   └── search_screen.dart
│   │   ├── booking/
│   │   │   ├── booking_screen.dart
│   │   │   └── booking_list_screen.dart
│   │   ├── profile/
│   │   │   └── profile_screen.dart
│   │   └── blog/
│   │       ├── blog_list_screen.dart
│   │       └── blog_detail_screen.dart
│   └── widgets/                     # Reusable components
│       ├── property_card.dart
│       ├── custom_button.dart
│       ├── loading_indicator.dart
│       └── error_widget.dart
├── test/
│   ├── widget_test/                 # Widget tests
│   └── integration_test/            # Integration tests
├── pubspec.yaml
└── README.md
```

## Getting Started

### Prerequisites
- Flutter SDK (3.0 or higher)
- Dart SDK (3.0 or higher)
- Android Studio / VS Code
- Android emulator or physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure API endpoint**
   Edit `lib/config/api_config.dart` to set your backend API URL:
   ```dart
   static String _baseUrl = 'http://your-backend-url.com/api/';
   ```

4. **Run the app**
   ```bash
   flutter run
   ```

### Configuration

#### API Configuration
The app supports multiple environment configurations:

```dart
// Development
ApiConfig.setBaseUrl('http://localhost:8000/api/');

// Staging
ApiConfig.setBaseUrl('http://192.168.18.16:8000/api/');

// Production
ApiConfig.setBaseUrl('https://hsquareliving.com/api/');
```

#### Theme Configuration
The app uses a custom theme that matches the frontend design:

- **Primary Colors**: #A31C44 (Hotels), #454F61 (Hostels)
- **Material 3** design system
- **Responsive** layout for different screen sizes

## API Integration

### Authentication Flow
1. User enters phone number
2. OTP is sent to the phone
3. User enters OTP for verification
4. JWT token is stored for subsequent requests

### Property Management
- **GET** `/api/property/properties/` - List all properties
- **GET** `/api/property/properties/{id}/` - Property details
- **GET** `/api/property/public/search/` - Search properties
- **POST** `/api/property/toggle-favourite/` - Toggle favorites

### Booking System
- **GET** `/api/booking/bookings/user/` - User bookings
- **POST** `/api/booking/bookings/` - Create booking
- **GET** `/api/booking/bookings/{id}/` - Booking details

### Blog System
- **GET** `/api/blog/blogs/` - List blogs
- **GET** `/api/blog/blogs/{slug}/` - Blog details
- **GET** `/api/blog/blogs/highlighted/` - Highlighted blogs

## Testing

### Widget Tests
```bash
flutter test test/widget_test/
```

### Integration Tests
```bash
flutter test integration_test/
```

### Run All Tests
```bash
flutter test
```

## Key Features

### 🎯 **Exact Frontend Match**
- Replicates the frontend mobile view exactly
- Same color scheme and branding
- Consistent user experience

### 🔐 **Secure Authentication**
- OTP-based phone authentication
- JWT token management
- Secure local storage

### 🏨 **Property Discovery**
- Advanced search and filtering
- Image galleries with caching
- Property ratings and reviews
- Favorites management

### 📱 **Mobile-First Design**
- Responsive layout
- Touch-friendly interface
- Smooth animations
- Offline capability for cached content

### 🧪 **Comprehensive Testing**
- Widget tests for UI components
- Integration tests for user flows
- Error handling and edge cases

## Dependencies

### Core Dependencies
- `provider: ^6.1.1` - State management
- `http: ^1.1.0` - HTTP requests
- `shared_preferences: ^2.2.2` - Local storage

### UI Dependencies
- `cached_network_image: ^3.3.0` - Image caching
- `flutter_rating_bar: ^4.0.1` - Rating display
- `pin_code_fields: ^8.0.1` - OTP input
- `shimmer: ^3.0.0` - Loading placeholders

### Development Dependencies
- `flutter_test` - Testing framework
- `integration_test` - Integration testing

## Performance Optimizations

### Image Loading
- Cached network images for better performance
- Placeholder images during loading
- Error handling for failed loads

### State Management
- Efficient provider-based state management
- Minimal rebuilds with targeted updates
- Memory-efficient data handling

### Network Optimization
- Request/response interceptors
- Automatic retry mechanisms
- Timeout handling

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Verify backend server is running
   - Check API base URL configuration
   - Ensure network connectivity

2. **Authentication Problems**
   - Clear app data and restart
   - Verify OTP service is working
   - Check token expiration

3. **Image Loading Issues**
   - Check network connectivity
   - Verify image URLs are accessible
   - Clear image cache if needed

### Debug Mode
```bash
flutter run --debug
```

### Release Build
```bash
flutter build apk --release
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Flutter**