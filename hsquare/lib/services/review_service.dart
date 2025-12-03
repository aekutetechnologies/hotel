import 'dart:convert';
import 'package:hsquare/services/api_client.dart';

class ReviewService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> createReview({
    required int bookingId,
    required int propertyId,
    required int rating,
    required String review,
  }) async {
    final response = await _apiClient.post(
      '/property/reviews/create/',
      {
        'booking_id': bookingId,
        'property': propertyId,
        'rating': rating,
        'review': review,
      },
      requiresAuth: true,
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to create review: ${response.body}');
  }
}

