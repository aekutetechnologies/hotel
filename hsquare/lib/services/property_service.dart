import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:hsquare/models/property.dart';
import 'package:hsquare/utils/constants.dart';

class PropertyService {
  final String _baseUrl = AppConstants.baseUrl;

  Future<List<Property>> fetchProperties({String? type}) async {
    // Using public search endpoint or all properties endpoint
    // Assuming /api/property/public/search/ returns list
    // Or /api/property/properties/
    
    // Let's try /api/property/properties/ first, filtering by type if possible
    // If backend doesn't support filtering by type in list, we might need to filter client side
    // But looking at urls.py: path('properties/', views.property_list, name='property-list')
    
    final response = await http.get(
      Uri.parse('$_baseUrl/property/properties/'),
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
}
