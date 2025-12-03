import 'dart:convert';
import 'package:hsquare/models/property.dart';
import 'package:hsquare/services/api_client.dart';

class PropertyService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Property>> fetchProperties({String? type}) async {
    final response = await _apiClient.get(
      '/property/properties/',
      requiresAuth: false,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      List<Property> properties = data.map((json) => Property.fromJson(json)).toList();
      
      if (type != null) {
        properties = properties.where((p) => p.propertyType == type).toList();
      }
      
      return properties;
    } else {
      throw Exception('Failed to load properties: ${response.body}');
    }
  }

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
    
    String endpoint = '/property/public/search/';
    if (queryParams.isNotEmpty) {
      final queryString = queryParams.entries
          .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
          .join('&');
      endpoint += '?$queryString';
    }
    
    final response = await _apiClient.get(endpoint, requiresAuth: false);
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Property.fromJson(json)).toList();
    }
    throw Exception('Failed to search properties: ${response.body}');
  }

  Future<Property> getProperty(int propertyId) async {
    final response = await _apiClient.get(
      '/property/properties/$propertyId/',
      requiresAuth: false,
    );
    
    if (response.statusCode == 200) {
      return Property.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to fetch property: ${response.body}');
  }
}
