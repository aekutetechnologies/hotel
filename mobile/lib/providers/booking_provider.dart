import 'package:flutter/foundation.dart';
import '../models/booking.dart';
import '../services/booking_service.dart';

class BookingProvider with ChangeNotifier {
  List<Booking> _bookings = [];
  bool _isLoading = false;
  String? _error;
  Booking? _currentBooking;

  // Getters
  List<Booking> get bookings => _bookings;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Booking? get currentBooking => _currentBooking;

  // Load user bookings
  Future<void> loadUserBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _bookings = await BookingService.getUserBookings();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get booking by ID
  Future<Booking?> getBookingById(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentBooking = await BookingService.getBookingById(id);
      return _currentBooking;
    } catch (e) {
      _error = e.toString();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create booking
  Future<Booking?> createBooking({
    required int propertyId,
    required List<BookingRoomData> rooms,
    required DateTime checkInDate,
    required DateTime checkOutDate,
    required int numberOfGuests,
    String? specialRequests,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentBooking = await BookingService.createBooking(
        propertyId: propertyId,
        rooms: rooms,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: numberOfGuests,
        specialRequests: specialRequests,
      );

      // Add to bookings list
      _bookings.insert(0, _currentBooking!);
      
      return _currentBooking;
    } catch (e) {
      _error = e.toString();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update booking status
  Future<Booking?> updateBookingStatus({
    required int bookingId,
    required String status,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final updatedBooking = await BookingService.updateBookingStatus(
        bookingId: bookingId,
        status: status,
      );

      // Update in bookings list
      final index = _bookings.indexWhere((b) => b.id == bookingId);
      if (index != -1) {
        _bookings[index] = updatedBooking;
      }

      // Update current booking if it's the same
      if (_currentBooking?.id == bookingId) {
        _currentBooking = updatedBooking;
      }

      return updatedBooking;
    } catch (e) {
      _error = e.toString();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Cancel booking
  Future<Booking?> cancelBooking(int bookingId) async {
    return await updateBookingStatus(
      bookingId: bookingId,
      status: 'cancelled',
    );
  }

  // Upload booking document
  Future<bool> uploadBookingDocument({
    required int bookingId,
    required String filePath,
    required String name,
    String? fileType,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await BookingService.uploadBookingDocument(
        bookingId: bookingId,
        filePath: filePath,
        name: name,
        fileType: fileType,
      );

      // Reload booking to get updated documents
      await getBookingById(bookingId);
      
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get bookings by status
  List<Booking> getBookingsByStatus(String status) {
    return _bookings.where((b) => b.status == status).toList();
  }

  // Get active bookings
  List<Booking> get activeBookings {
    return _bookings.where((b) => b.isActive).toList();
  }

  // Get completed bookings
  List<Booking> get completedBookings {
    return _bookings.where((b) => b.isCompleted).toList();
  }

  // Get cancelled bookings
  List<Booking> get cancelledBookings {
    return _bookings.where((b) => b.isCancelled).toList();
  }

  // Get pending bookings
  List<Booking> get pendingBookings {
    return getBookingsByStatus('pending');
  }

  // Get confirmed bookings
  List<Booking> get confirmedBookings {
    return getBookingsByStatus('confirmed');
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Reset state
  void reset() {
    _bookings.clear();
    _currentBooking = null;
    _error = null;
    notifyListeners();
  }

  // Set current booking
  void setCurrentBooking(Booking? booking) {
    _currentBooking = booking;
    notifyListeners();
  }
}
