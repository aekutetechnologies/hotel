class ApiConfig {
  // Base API URL - configurable for different environments
  static const String _baseUrl = 'http://10.0.2.2:8000/api';
  
  // Alternative URLs for different environments
  static const String _productionUrl = 'https://hsquareliving.com/api';
  static const String _stagingUrl = 'http://147.93.97.63/api';
  
  // Get the current base URL
  static String get baseUrl {
    // In production, you might want to use environment variables
    // For now, using localhost for development
    return _baseUrl;
  }
  
  // API Endpoints
  static const String sendOtp = '/users/send-otp/';
  static const String verifyOtp = '/users/verify-otp/';
  static const String profile = '/users/profile/';
  static const String users = '/users/users/';
  
  static const String properties = '/property/properties/';
  static const String propertyDetail = '/property/properties/';
  static const String searchProperties = '/property/public/search/';
  static const String toggleFavorite = '/property/toggle-favourite/';
  static const String favoriteProperties = '/property/favorite-properties/';
  static const String amenities = '/property/amenities/';
  static const String cities = '/property/city/';
  static const String states = '/property/state/';
  static const String countries = '/property/country/';
  
  static const String bookings = '/booking/bookings/';
  static const String userBookings = '/booking/bookings/user/';
  static const String bookingDetail = '/booking/bookings/';
  
  static const String blogs = '/blog/blogs/';
  static const String highlightedBlogs = '/blog/blogs/highlighted/';
  static const String blogDetail = '/blog/blogs/';
  static const String categories = '/blog/categories/';
  static const String tags = '/blog/tags/';
  
  // Request timeout in milliseconds
  static const int timeoutMs = 30000;
  
  // Headers
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
