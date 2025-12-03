import 'package:flutter/material.dart';
import 'package:hsquare/models/property.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:hsquare/screens/property_details_screen.dart';

class PropertySearchCard extends StatefulWidget {
  final Property property;

  const PropertySearchCard({super.key, required this.property});

  @override
  State<PropertySearchCard> createState() => _PropertySearchCardState();
}

class _PropertySearchCardState extends State<PropertySearchCard> {
  final PageController _pageController = PageController();
  int _currentImageIndex = 0;

  IconData _getAmenityIcon(String amenityName) {
    final lower = amenityName.toLowerCase();
    if (lower.contains('wifi') || lower.contains('wi-fi')) {
      return Icons.wifi;
    } else if (lower.contains('parking')) {
      return Icons.local_parking;
    } else if (lower.contains('room service')) {
      return Icons.room_service;
    } else if (lower.contains('laundry')) {
      return Icons.local_laundry_service;
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
    } else {
      return Icons.check_circle;
    }
  }

  double _getLowestPrice() {
    if (widget.property.rooms.isEmpty) return 0.0;
    
    double lowestPrice = double.infinity;
    for (var room in widget.property.rooms) {
      final price = room.dailyRate;
      final discount = room.discount ?? 0.0;
      final finalPrice = price * (1 - discount / 100);
      if (finalPrice < lowestPrice) {
        lowestPrice = finalPrice;
      }
    }
    return lowestPrice == double.infinity ? 0.0 : lowestPrice;
  }

  double? _getOriginalPrice() {
    if (widget.property.rooms.isEmpty) return null;
    
    double? originalPrice;
    for (var room in widget.property.rooms) {
      final price = room.dailyRate;
      if (originalPrice == null || price < originalPrice) {
        originalPrice = price;
      }
    }
    return originalPrice;
  }

  double? _getDiscount() {
    if (widget.property.rooms.isEmpty) return null;
    
    double? maxDiscount;
    for (var room in widget.property.rooms) {
      final discount = room.discount ?? 0.0;
      if (maxDiscount == null || discount > maxDiscount) {
        maxDiscount = discount;
      }
    }
    return maxDiscount != null && maxDiscount > 0 ? maxDiscount : null;
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lowestPrice = _getLowestPrice();
    final originalPrice = _getOriginalPrice();
    final discount = _getDiscount();
    final displayedAmenities = widget.property.amenities.take(5).toList();
    final remainingAmenitiesCount = widget.property.amenities.length - displayedAmenities.length;
    final images = widget.property.images;

    return Card(
      margin: const EdgeInsets.only(bottom: 24),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      elevation: 2,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PropertyDetailsScreen(property: widget.property),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Slider Section
            Stack(
              children: [
                // Image Slider
                SizedBox(
                  height: 250,
                  width: double.infinity,
                  child: images.isNotEmpty
                      ? PageView.builder(
                          controller: _pageController,
                          onPageChanged: (index) {
                            setState(() {
                              _currentImageIndex = index;
                            });
                          },
                          itemCount: images.length,
                          itemBuilder: (context, index) {
                            return Image.network(
                              images[index].imageUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  Container(
                                    color: Colors.grey.shade200,
                                    child: const Icon(Icons.broken_image, size: 48),
                                  ),
                            );
                          },
                        )
                      : Container(
                          color: Colors.grey.shade200,
                          child: const Icon(Icons.image, size: 48),
                        ),
                ),
                // Property Type Badge
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      widget.property.propertyType.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                // New Badge (if applicable)
                if (widget.property.reviewCount == null || widget.property.reviewCount == 0)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primaryRed,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'New',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                // Image Indicator Dots (if multiple images)
                if (images.length > 1)
                  Positioned(
                    bottom: 12,
                    left: 0,
                    right: 0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        images.length,
                        (index) => Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _currentImageIndex == index
                                ? Colors.white
                                : Colors.white.withOpacity(0.5),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),

            // Content Section
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Property Name
                  Text(
                    widget.property.name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Location
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          widget.property.city != null && widget.property.city!.isNotEmpty
                              ? '${widget.property.location}, ${widget.property.city}'
                              : widget.property.location,
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Amenities
                  if (widget.property.amenities.isNotEmpty) ...[
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ...displayedAmenities.map((amenity) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  _getAmenityIcon(amenity.name),
                                  size: 16,
                                  color: AppColors.primaryRed,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  amenity.name,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                        if (remainingAmenitiesCount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: Text(
                              '+$remainingAmenitiesCount more',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: AppColors.primaryRed,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],

                  // Price Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Starting from ₹${lowestPrice.toStringAsFixed(0)} per night',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryRed,
                            ),
                          ),
                          if (originalPrice != null && discount != null && discount > 0) ...[
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text(
                                  '₹${originalPrice.toStringAsFixed(0)}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[600],
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade50,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    '${discount.toStringAsFixed(0)}% OFF',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green.shade700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

