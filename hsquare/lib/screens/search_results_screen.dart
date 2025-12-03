import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:hsquare/models/property.dart';
import 'package:hsquare/services/property_service.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:hsquare/widgets/property_search_card.dart';

class SearchResultsScreen extends StatefulWidget {
  final String propertyType;
  final String location;
  final DateTime checkIn;
  final DateTime checkOut;
  final int guests;
  final int rooms;

  const SearchResultsScreen({
    super.key,
    required this.propertyType,
    required this.location,
    required this.checkIn,
    required this.checkOut,
    required this.guests,
    required this.rooms,
  });

  @override
  State<SearchResultsScreen> createState() => _SearchResultsScreenState();
}

class _SearchResultsScreenState extends State<SearchResultsScreen> {
  final PropertyService _propertyService = PropertyService();
  late Future<List<Property>> _propertiesFuture;
  final TextEditingController _locationController = TextEditingController();
  DateTime _checkInDate = DateTime.now();
  DateTime _checkOutDate = DateTime.now().add(const Duration(days: 1));
  int _guests = 1;
  int _rooms = 1;
  Set<String> _selectedFilters = {};

  @override
  void initState() {
    super.initState();
    _locationController.text = widget.location;
    _checkInDate = widget.checkIn;
    _checkOutDate = widget.checkOut;
    _guests = widget.guests;
    _rooms = widget.rooms;
    _loadProperties();
  }

  void _loadProperties() {
    setState(() {
      _propertiesFuture = _propertyService.searchProperties(
        propertyType: widget.propertyType,
        city: _locationController.text,
        checkInDate: DateFormat('yyyy-MM-dd').format(_checkInDate),
        checkOutDate: DateFormat('yyyy-MM-dd').format(_checkOutDate),
        rooms: _rooms,
        guests: _guests,
      );
    });
  }

  Future<void> _selectDate(BuildContext context, bool isCheckIn) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isCheckIn ? _checkInDate : _checkOutDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        if (isCheckIn) {
          _checkInDate = picked;
          if (_checkOutDate.isBefore(_checkInDate)) {
            _checkOutDate = _checkInDate.add(const Duration(days: 1));
          }
        } else {
          _checkOutDate = picked;
        }
      });
      _loadProperties();
    }
  }

  void _toggleFilter(String filter) {
    setState(() {
      if (_selectedFilters.contains(filter)) {
        _selectedFilters.remove(filter);
      } else {
        _selectedFilters.add(filter);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.propertyType == 'hotel' ? 'Hotels' : 'Hostels'} in ${widget.location}'),
        backgroundColor: AppColors.primaryRed,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [

          // Results List
          Expanded(
            child: FutureBuilder<List<Property>>(
              future: _propertiesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                        const SizedBox(height: 16),
                        Text('Error: ${snapshot.error}'),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadProperties,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off, size: 48, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text(
                          'No properties found matching your search.',
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                      ],
                    ),
                  );
                }

                final properties = snapshot.data!;
                
                // Apply filter logic (client-side filtering by amenities)
                final filteredProperties = _selectedFilters.isEmpty
                    ? properties
                    : properties.where((property) {
                        final propertyAmenities = property.amenities
                            .map((a) => a.name.toLowerCase())
                            .toSet();
                        return _selectedFilters.every((filter) =>
                            propertyAmenities.contains(filter.toLowerCase()));
                      }).toList();

                if (filteredProperties.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.filter_alt_off, size: 48, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text(
                          'No properties match the selected filters.',
                          style: TextStyle(fontSize: 16, color: Colors.grey),
                        ),
                        const SizedBox(height: 16),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _selectedFilters.clear();
                            });
                          },
                          child: const Text('Clear Filters'),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filteredProperties.length,
                  itemBuilder: (context, index) {
                    return PropertySearchCard(property: filteredProperties[index]);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  IconData _getFilterIcon(String filter) {
    final lower = filter.toLowerCase();
    if (lower.contains('wifi') || lower.contains('wi-fi')) {
      return Icons.wifi;
    } else if (lower.contains('parking')) {
      return Icons.local_parking;
    } else if (lower.contains('laundry')) {
      return Icons.local_laundry_service;
    } else if (lower.contains('room service')) {
      return Icons.room_service;
    } else if (lower.contains('front desk') || lower.contains('24')) {
      return Icons.desk;
    } else if (lower.contains('pool')) {
      return Icons.pool;
    } else if (lower.contains('gym') || lower.contains('fitness')) {
      return Icons.fitness_center;
    } else if (lower.contains('restaurant')) {
      return Icons.restaurant;
    } else if (lower.contains('bar')) {
      return Icons.local_bar;
    } else if (lower.contains('spa')) {
      return Icons.spa;
    } else if (lower.contains('ac') || lower.contains('air')) {
      return Icons.ac_unit;
    } else if (lower.contains('cctv')) {
      return Icons.videocam;
    } else if (lower.contains('power')) {
      return Icons.power;
    } else if (lower.contains('bathroom')) {
      return Icons.bathroom;
    } else if (lower.contains('tv')) {
      return Icons.tv;
    } else {
      return Icons.check_circle;
    }
  }

  Widget _buildFilterChip(String filter) {
    final isSelected = _selectedFilters.contains(filter);
    return FilterChip(
      label: Text(filter),
      selected: isSelected,
      onSelected: (selected) => _toggleFilter(filter),
      selectedColor: AppColors.primaryRed.withOpacity(0.2),
      checkmarkColor: AppColors.primaryRed,
      labelStyle: TextStyle(
        color: isSelected ? AppColors.primaryRed : Colors.black87,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      avatar: Icon(
        _getFilterIcon(filter),
        size: 16,
        color: isSelected ? AppColors.primaryRed : Colors.grey,
      ),
    );
  }
}

