import 'dart:convert';
import 'package:hsquare/models/property.dart';
import 'package:hsquare/services/api_client.dart';

class FavoriteService {
  final ApiClient _apiClient = ApiClient();

  Future<void> toggleFavorite(int propertyId, bool isFavorite) async {
    final response = await _apiClient.post(
      '/property/toggle-favourite/',
      {
        'property_id': propertyId,
        'is_favourite': isFavorite,
      },
      requiresAuth: true,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to toggle favorite: ${response.body}');
    }
  }

  Future<List<Property>> getFavoriteProperties() async {
    final response = await _apiClient.get(
      '/property/favorite-properties/',
      requiresAuth: true,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((item) => Property.fromJson(item['property'])).toList();
    }
    throw Exception('Failed to fetch favorites: ${response.body}');
  }
}

