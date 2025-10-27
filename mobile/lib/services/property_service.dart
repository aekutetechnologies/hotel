import '../config/api_config.dart';
import '../models/property.dart';
import '../models/room.dart';
import 'api_service.dart';

class PropertyService {
  // Get all properties
  static Future<List<Property>> getProperties({
    String? type,
    String? location,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (type != null) queryParams['type'] = type;
      if (location != null) queryParams['location'] = location;
      if (page != null) queryParams['page'] = page.toString();
      if (limit != null) queryParams['limit'] = limit.toString();
      
      final response = await ApiService.get(
        ApiConfig.properties,
        queryParams: queryParams,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Property.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get properties: ${e.toString()}');
    }
  }
  
  // Get property by ID
  static Future<Property> getPropertyById(int id) async {
    try {
      final response = await ApiService.get(
        '${ApiConfig.propertyDetail}$id/',
        includeAuth: false,
      );
      
      if (response == null) {
        throw Exception('Property not found');
      }
      
      return Property.fromJson(response);
    } catch (e) {
      throw Exception('Failed to get property: ${e.toString()}');
    }
  }
  
  // Search properties
  static Future<List<Property>> searchProperties({
    String? location,
    String? checkInDate,
    String? checkOutDate,
    int? guests,
    String? type,
    String? city,
    String? state,
    String? country,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (location != null) queryParams['location'] = location;
      if (checkInDate != null) queryParams['check_in_date'] = checkInDate;
      if (checkOutDate != null) queryParams['check_out_date'] = checkOutDate;
      if (guests != null) queryParams['guests'] = guests.toString();
      if (type != null) queryParams['type'] = type;
      if (city != null) queryParams['city'] = city;
      if (state != null) queryParams['state'] = state;
      if (country != null) queryParams['country'] = country;
      if (page != null) queryParams['page'] = page.toString();
      if (limit != null) queryParams['limit'] = limit.toString();
      
      final response = await ApiService.get(
        ApiConfig.searchProperties,
        queryParams: queryParams,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Property.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to search properties: ${e.toString()}');
    }
  }
  
  // Toggle favorite property
  static Future<bool> toggleFavorite(int propertyId) async {
    try {
      final response = await ApiService.post(
        ApiConfig.toggleFavorite,
        body: {
          'property_id': propertyId,
        },
        includeAuth: true,
      );
      
      return response != null;
    } catch (e) {
      throw Exception('Failed to toggle favorite: ${e.toString()}');
    }
  }
  
  // Get favorite properties
  static Future<List<Property>> getFavoriteProperties() async {
    try {
      final response = await ApiService.get(
        ApiConfig.favoriteProperties,
        includeAuth: true,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Property.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get favorite properties: ${e.toString()}');
    }
  }
  
  // Get amenities
  static Future<List<Amenity>> getAmenities() async {
    try {
      final response = await ApiService.get(
        ApiConfig.amenities,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Amenity.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get amenities: ${e.toString()}');
    }
  }
  
  // Get cities
  static Future<List<City>> getCities() async {
    try {
      final response = await ApiService.get(
        ApiConfig.cities,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => City.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get cities: ${e.toString()}');
    }
  }
  
  // Get states
  static Future<List<State>> getStates() async {
    try {
      final response = await ApiService.get(
        ApiConfig.states,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => State.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get states: ${e.toString()}');
    }
  }
  
  // Get countries
  static Future<List<Country>> getCountries() async {
    try {
      final response = await ApiService.get(
        ApiConfig.countries,
        includeAuth: false,
      );
      
      if (response == null) {
        return [];
      }
      
      if (response is List) {
        return response.map((json) => Country.fromJson(json)).toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Failed to get countries: ${e.toString()}');
    }
  }
  
  // Create property review
  static Future<Review> createReview({
    required int propertyId,
    required double rating,
    required String review,
    List<String>? images,
  }) async {
    try {
      final response = await ApiService.post(
        '${ApiConfig.properties}reviews/create/',
        body: {
          'property_id': propertyId,
          'rating': rating,
          'review': review,
          if (images != null) 'images': images,
        },
        includeAuth: true,
      );
      
      if (response == null) {
        throw Exception('Failed to create review');
      }
      
      return Review.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create review: ${e.toString()}');
    }
  }
}

// Additional models for location data
class City {
  final int id;
  final String name;
  final String? state;
  final String? country;
  
  City({
    required this.id,
    required this.name,
    this.state,
    this.country,
  });
  
  factory City.fromJson(Map<String, dynamic> json) {
    return City(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      state: json['state'],
      country: json['country'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'state': state,
      'country': country,
    };
  }
  
  @override
  String toString() {
    return 'City(id: $id, name: $name)';
  }
}

class State {
  final int id;
  final String name;
  final String? country;
  
  State({
    required this.id,
    required this.name,
    this.country,
  });
  
  factory State.fromJson(Map<String, dynamic> json) {
    return State(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      country: json['country'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'country': country,
    };
  }
  
  @override
  String toString() {
    return 'State(id: $id, name: $name)';
  }
}

class Country {
  final int id;
  final String name;
  
  Country({
    required this.id,
    required this.name,
  });
  
  factory Country.fromJson(Map<String, dynamic> json) {
    return Country(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
  
  @override
  String toString() {
    return 'Country(id: $id, name: $name)';
  }
}
