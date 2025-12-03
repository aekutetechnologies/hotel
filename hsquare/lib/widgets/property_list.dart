import 'package:flutter/material.dart';
import 'package:hsquare/models/property.dart';
import 'package:hsquare/services/property_service.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:hsquare/screens/property_details_screen.dart';

class PropertyList extends StatefulWidget {
  final String propertyType;
  final String? location;

  const PropertyList({super.key, required this.propertyType, this.location});

  @override
  State<PropertyList> createState() => _PropertyListState();
}

class _PropertyListState extends State<PropertyList> {
  final PropertyService _propertyService = PropertyService();
  late Future<List<Property>> _propertiesFuture;

  @override
  void initState() {
    super.initState();
    // Use search endpoint instead of properties endpoint for better filtering
    _propertiesFuture = _propertyService.searchProperties(
      propertyType: widget.propertyType,
      city: widget.location,
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Property>>(
      future: _propertiesFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No properties found.'));
        }

        final properties = snapshot.data!;
        
        // Client-side filtering for location if provided
        final filteredProperties = widget.location != null && widget.location!.isNotEmpty
            ? properties.where((p) => 
                p.location.toLowerCase().contains(widget.location!.toLowerCase()) ||
                (p.city != null && p.city!.toLowerCase().contains(widget.location!.toLowerCase()))
              ).toList()
            : properties;

        if (filteredProperties.isEmpty) {
           return const Center(child: Text('No properties found matching your search.'));
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: filteredProperties.length,
          itemBuilder: (context, index) {
            final property = filteredProperties[index];
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => PropertyDetailsScreen(property: property),
                  ),
                );
              },
              child: Card(
                margin: const EdgeInsets.only(bottom: 16),
                clipBehavior: Clip.antiAlias,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image
                    SizedBox(
                      height: 200,
                      width: double.infinity,
                      child: property.images.isNotEmpty
                          ? Image.network(
                              property.images.first.imageUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Container(color: Colors.grey.shade200, child: const Icon(Icons.broken_image)),
                            )
                          : Container(color: Colors.grey.shade200, child: const Icon(Icons.image)),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            property.name,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 16, color: Colors.grey),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  property.location,
                                  style: const TextStyle(color: Colors.grey),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            property.rooms.isNotEmpty
                                ? 'Starting from ₹${property.rooms.first.dailyRate}'
                                : 'Price on request',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryRed,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
