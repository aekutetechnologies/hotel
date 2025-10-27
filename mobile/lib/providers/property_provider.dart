import 'package:flutter/foundation.dart';
import '../models/property.dart';
import '../services/property_service.dart';

class PropertyProvider with ChangeNotifier {
  List<Property> _properties = [];
  List<Property> _favoriteProperties = [];
  bool _isLoading = false;
  bool _isLoadingFavorites = false;
  String? _error;
  String? _selectedType;
  String? _selectedLocation;
  int _currentPage = 1;
  bool _hasMoreData = true;

  // Getters
  List<Property> get properties => _properties;
  List<Property> get favoriteProperties => _favoriteProperties;
  bool get isLoading => _isLoading;
  bool get isLoadingFavorites => _isLoadingFavorites;
  String? get error => _error;
  String? get selectedType => _selectedType;
  String? get selectedLocation => _selectedLocation;
  bool get hasMoreData => _hasMoreData;

  // Load properties
  Future<void> loadProperties({
    String? type,
    String? location,
    bool refresh = false,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasMoreData = true;
      _properties.clear();
    }

    if (!_hasMoreData) return;

    _isLoading = true;
    _error = null;
    _selectedType = type;
    _selectedLocation = location;
    notifyListeners();

    try {
      final newProperties = await PropertyService.getProperties(
        type: type,
        location: location,
        page: _currentPage,
        limit: 20,
      );

      if (refresh) {
        _properties = newProperties;
      } else {
        _properties.addAll(newProperties);
      }

      _hasMoreData = newProperties.length == 20;
      _currentPage++;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Search properties
  Future<void> searchProperties({
    String? location,
    String? checkInDate,
    String? checkOutDate,
    int? guests,
    String? type,
    String? city,
    String? state,
    String? country,
  }) async {
    _isLoading = true;
    _error = null;
    _properties.clear();
    notifyListeners();

    try {
      _properties = await PropertyService.searchProperties(
        location: location,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guests: guests,
        type: type,
        city: city,
        state: state,
        country: country,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get property by ID
  Future<Property?> getPropertyById(int id) async {
    try {
      return await PropertyService.getPropertyById(id);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  // Load favorite properties
  Future<void> loadFavoriteProperties() async {
    _isLoadingFavorites = true;
    _error = null;
    notifyListeners();

    try {
      _favoriteProperties = await PropertyService.getFavoriteProperties();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoadingFavorites = false;
      notifyListeners();
    }
  }

  // Toggle favorite property
  Future<bool> toggleFavorite(int propertyId) async {
    try {
      final success = await PropertyService.toggleFavorite(propertyId);
      
      if (success) {
        // Update local state
        final propertyIndex = _properties.indexWhere((p) => p.id == propertyId);
        if (propertyIndex != -1) {
          // Reload favorites to get updated state
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

  // Filter properties by type
  List<Property> getPropertiesByType(String type) {
    return _properties.where((p) => p.type == type).toList();
  }

  // Get hotels
  List<Property> get hotels {
    return getPropertiesByType('hotel');
  }

  // Get hostels
  List<Property> get hostels {
    return getPropertiesByType('hostel');
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Reset state
  void reset() {
    _properties.clear();
    _favoriteProperties.clear();
    _error = null;
    _selectedType = null;
    _selectedLocation = null;
    _currentPage = 1;
    _hasMoreData = true;
    notifyListeners();
  }

  // Load more properties (pagination)
  Future<void> loadMoreProperties() async {
    if (!_isLoading && _hasMoreData) {
      await loadProperties(
        type: _selectedType,
        location: _selectedLocation,
        refresh: false,
      );
    }
  }
}
