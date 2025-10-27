import '../config/api_config.dart';
import '../models/booking.dart';
import 'api_service.dart';

class BookingService {
  // Get user bookings
  static Future<List<Booking>> getUserBookings() async {
    try {
      final response = await ApiService.get(
        ApiConfig.userBookings,
        includeAuth: true,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Booking.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get user bookings: ${e.toString()}');
    }
  }
  
  // Get booking by ID
  static Future<Booking> getBookingById(int id) async {
    try {
      final response = await ApiService.get(
        '${ApiConfig.bookingDetail}$id/',
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Booking not found');
      }
      
      return Booking.fromJson(response);
    } catch (e) {
      throw Exception('Failed to get booking: ${e.toString()}');
    }
  }
  
  // Create new booking
  static Future<Booking> createBooking({
    required int propertyId,
    required List<BookingRoomData> rooms,
    required DateTime checkInDate,
    required DateTime checkOutDate,
    required int numberOfGuests,
    String? specialRequests,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConfig.bookings,
        body: {
          'property_id': propertyId,
          'rooms': rooms.map((room) => {
            'room_id': room.roomId,
            'quantity': room.quantity,
            'rate': room.rate,
          }).toList(),
          'check_in_date': checkInDate.toIso8601String().split('T')[0],
          'check_out_date': checkOutDate.toIso8601String().split('T')[0],
          'number_of_guests': numberOfGuests,
          if (specialRequests != null) 'special_requests': specialRequests,
        },
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Failed to create booking');
      }
      
      return Booking.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create booking: ${e.toString()}');
    }
  }
  
  // Update booking status
  static Future<Booking> updateBookingStatus({
    required int bookingId,
    required String status,
  }) async {
    try {
      final response = await ApiService.patch(
        '${ApiConfig.bookingDetail}$bookingId/status/',
        body: {
          'status': status,
        },
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Failed to update booking status');
      }
      
      return Booking.fromJson(response);
    } catch (e) {
      throw Exception('Failed to update booking status: ${e.toString()}');
    }
  }
  
  // Cancel booking
  static Future<Booking> cancelBooking(int bookingId) async {
    try {
      return await updateBookingStatus(
        bookingId: bookingId,
        status: 'cancelled',
      );
    } catch (e) {
      throw Exception('Failed to cancel booking: ${e.toString()}');
    }
  }
  
  // Upload booking document
  static Future<BookingDocument> uploadBookingDocument({
    required int bookingId,
    required String filePath,
    required String name,
    String? fileType,
  }) async {
    try {
      final response = await ApiService.uploadFile(
        '${ApiConfig.bookingDetail}$bookingId/documents/',
        filePath,
        fieldName: 'file',
        additionalFields: {
          'name': name,
          if (fileType != null) 'file_type': fileType,
        },
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Failed to upload document');
      }
      
      return BookingDocument.fromJson(response);
    } catch (e) {
      throw Exception('Failed to upload document: ${e.toString()}');
    }
  }
  
  // Get booking documents
  static Future<List<BookingDocument>> getBookingDocuments(int bookingId) async {
    try {
      final response = await ApiService.get(
        '${ApiConfig.bookingDetail}$bookingId/documents/',
        includeAuth: true,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => BookingDocument.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get booking documents: ${e.toString()}');
    }
  }
  
  // Get booking by user ID (admin function)
  static Future<List<Booking>> getBookingsByUserId(int userId) async {
    try {
      final response = await ApiService.get(
        '${ApiConfig.bookingDetail}user/$userId/',
        includeAuth: true,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Booking.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get bookings by user: ${e.toString()}');
    }
  }
  
  // Get all bookings (admin function)
  static Future<List<Booking>> getAllBookings({
    int? page,
    int? limit,
    String? status,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (page != null) queryParams['page'] = page.toString();
      if (limit != null) queryParams['limit'] = limit.toString();
      if (status != null) queryParams['status'] = status;
      
      final response = await ApiService.get(
        ApiConfig.bookings,
        queryParams: queryParams,
        includeAuth: true,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Booking.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get all bookings: ${e.toString()}');
    }
  }
}

// Data class for creating bookings
class BookingRoomData {
  final int roomId;
  final int quantity;
  final String? rate;
  
  BookingRoomData({
    required this.roomId,
    required this.quantity,
    this.rate,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'room_id': roomId,
      'quantity': quantity,
      'rate': rate,
    };
  }
  
  @override
  String toString() {
    return 'BookingRoomData(roomId: $roomId, quantity: $quantity, rate: $rate)';
  }
}
