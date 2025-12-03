import 'dart:convert';
import 'package:hsquare/models/booking.dart';
import 'package:hsquare/services/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';

class BookingService {
  final ApiClient _apiClient = ApiClient();

  Future<Booking> createBooking(BookingRequest request) async {
    final response = await _apiClient.post(
      '/booking/bookings/',
      request.toJson(),
      requiresAuth: true,
    );

    if (response.statusCode == 201) {
      return Booking.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to create booking: ${response.body}');
  }

  Future<List<Booking>> getUserBookings() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getInt('user_id') ?? prefs.getInt('userId');
    
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    final response = await _apiClient.get(
      '/booking/bookings/user/?user_id=$userId',
      requiresAuth: true,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Booking.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch bookings: ${response.body}');
  }

  Future<Booking> getBooking(int bookingId) async {
    final response = await _apiClient.get(
      '/booking/bookings/$bookingId/',
      requiresAuth: true,
    );

    if (response.statusCode == 200) {
      return Booking.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to fetch booking: ${response.body}');
  }
}

