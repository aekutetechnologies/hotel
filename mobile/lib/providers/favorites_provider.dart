import 'package:flutter/foundation.dart';
import '../models/property.dart';
import '../services/property_service.dart';

class FavoritesProvider with ChangeNotifier {
  List<Property> _favoriteProperties = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Property> get favoriteProperties => _favoriteProperties;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load favorite properties
  Future<void> loadFavoriteProperties() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _favoriteProperties = await PropertyService.getFavoriteProperties();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Toggle favorite property
  Future<bool> toggleFavorite(int propertyId) async {
    try {
      final success = await PropertyService.toggleFavorite(propertyId);
      
      if (success) {
        // Check if property is currently in favorites
        final isCurrentlyFavorite = _favoriteProperties.any((p) => p.id == propertyId);
        
        if (isCurrentlyFavorite) {
          // Remove from favorites
          _favoriteProperties.removeWhere((p) => p.id == propertyId);
        } else {
          // Add to favorites (we would need to fetch the property details)
          // For now, just reload the favorites
          await loadFavoriteProperties();
        }
      }
      
      return success;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Check if property is favorite
  bool isFavorite(int propertyId) {
    return _favoriteProperties.any((p) => p.id == propertyId);
  }

  // Add property to favorites (local only)
  void addToFavorites(Property property) {
    if (!_favoriteProperties.any((p) => p.id == property.id)) {
      _favoriteProperties.add(property);
      notifyListeners();
    }
  }

  // Remove property from favorites (local only)
  void removeFromFavorites(int propertyId) {
    _favoriteProperties.removeWhere((p) => p.id == propertyId);
    notifyListeners();
  }

  // Get favorites by type
  List<Property> getFavoritesByType(String type) {
    return _favoriteProperties.where((p) => p.type == type).toList();
  }

  // Get favorite hotels
  List<Property> get favoriteHotels {
    return getFavoritesByType('hotel');
  }

  // Get favorite hostels
  List<Property> get favoriteHostels {
    return getFavoritesByType('hostel');
  }

  // Get favorites count
  int get favoritesCount {
    return _favoriteProperties.length;
  }

  // Get favorites count by type
  int getFavoritesCountByType(String type) {
    return _favoriteProperties.where((p) => p.type == type).length;
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Reset state
  void reset() {
    _favoriteProperties.clear();
    _error = null;
    notifyListeners();
  }
}
