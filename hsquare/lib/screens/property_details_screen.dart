import 'package:flutter/material.dart';
import 'package:hsquare/models/property.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:hsquare/screens/create_booking_screen.dart';
import 'package:hsquare/services/favorite_service.dart';
import 'package:hsquare/services/property_service.dart';
import 'package:provider/provider.dart';
import 'package:hsquare/providers/auth_provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:hsquare/widgets/app_footer.dart';
import 'package:intl/intl.dart';

class PropertyDetailsScreen extends StatefulWidget {
  final Property property;

  const PropertyDetailsScreen({super.key, required this.property});

  @override
  State<PropertyDetailsScreen> createState() => _PropertyDetailsScreenState();
}

class _PropertyDetailsScreenState extends State<PropertyDetailsScreen> {
  final FavoriteService _favoriteService = FavoriteService();
  final PropertyService _propertyService = PropertyService();
  Property? _fullProperty;
  bool _isFavorite = false;
  final PageController _imagePageController = PageController();
  int _currentImageIndex = 0;
  String _selectedImageCategory = 'all';
  final Map<String, int> _selectedRooms = {}; // roomId -> quantity

  @override
  void initState() {
    super.initState();
    _loadFullProperty();
    // Initialize room selections
    if (widget.property.rooms.isNotEmpty) {
      for (var room in widget.property.rooms) {
        _selectedRooms[room.id.toString()] = 0;
      }
    }
  }

  @override
  void dispose() {
    _imagePageController.dispose();
    super.dispose();
  }

  Future<void> _loadFullProperty() async {
    try {
      final property = await _propertyService.getProperty(widget.property.id);
      if (mounted) {
        setState(() {
          _fullProperty = property;
        });
      }
    } catch (e) {
      // Handle error silently or show snackbar
    }
  }

  Future<void> _toggleFavorite() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please login to add favorites')),
        );
      }
      return;
    }

    try {
      await _favoriteService.toggleFavorite(widget.property.id, !_isFavorite);
      if (mounted) {
        setState(() {
          _isFavorite = !_isFavorite;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isFavorite ? 'Added to favorites' : 'Removed from favorites'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update favorite: $e')),
        );
      }
    }
  }

  void _openMap() {
    final property = _fullProperty ?? widget.property;
    if (property.latitude != null && property.longitude != null) {
      final url = 'https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}';
      launchUrl(Uri.parse(url));
    }
  }

  List<String> _getImageCategories(Property property) {
    final categories = <String>{'all'};
    for (var image in property.images) {
      if (image.category != null) {
        categories.add(image.category!.code);
      }
    }
    return categories.toList();
  }

  List<PropertyImage> _getFilteredImages(Property property) {
    if (_selectedImageCategory == 'all') {
      return property.images;
    }
    return property.images.where((img) => 
      img.category != null && img.category!.code == _selectedImageCategory
    ).toList();
  }

  double _calculateTotalPrice(Property property) {
    double total = 0.0;
    for (var entry in _selectedRooms.entries) {
      if (entry.value > 0) {
        final room = property.rooms.firstWhere((r) => r.id.toString() == entry.key);
        final basePrice = room.dailyRate;
        final discount = room.discount ?? 0.0;
        final finalPrice = basePrice * (1 - discount / 100);
        total += finalPrice * entry.value;
      }
    }
    // Add 5% tax
    return total * 1.05;
  }

  double _calculateDiscount(Property property) {
    double discount = 0.0;
    for (var entry in _selectedRooms.entries) {
      if (entry.value > 0) {
        final room = property.rooms.firstWhere((r) => r.id.toString() == entry.key);
        final basePrice = room.dailyRate;
        final roomDiscount = room.discount ?? 0.0;
        discount += (basePrice * roomDiscount / 100) * entry.value;
      }
    }
    return discount;
  }

  double _calculateRoomCharges(Property property) {
    double total = 0.0;
    for (var entry in _selectedRooms.entries) {
      if (entry.value > 0) {
        final room = property.rooms.firstWhere((r) => r.id.toString() == entry.key);
        total += room.dailyRate * entry.value;
      }
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    final property = _fullProperty ?? widget.property;
    final filteredImages = _getFilteredImages(property);
    final imageCategories = _getImageCategories(property);
    final totalPrice = _calculateTotalPrice(property);
    final discount = _calculateDiscount(property);
    final roomCharges = _calculateRoomCharges(property);
    final tax = (roomCharges - discount) * 0.05;

    return Scaffold(
      body: Column(
        children: [
          // Custom Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Logo
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.primaryRed,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Center(
                        child: Text(
                          'H',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hsquare',
                          style: TextStyle(
                            color: AppColors.primaryRed,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'harmony in living',
                          style: TextStyle(
                            color: Colors.grey[700],
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                // Menu and Profile
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.menu, color: Colors.black87),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: const Icon(Icons.person, color: Colors.black87),
                      onPressed: () {},
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Main Content
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Property Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                property.name,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.share),
                              onPressed: () {},
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 16, color: Colors.grey),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                property.city != null && property.city!.isNotEmpty
                                    ? '${property.location}, ${property.city}'
                                    : property.location,
                                style: TextStyle(color: Colors.grey[600], fontSize: 14),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: [
                            if (property.reviewCount == null || property.reviewCount == 0)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade200,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'New',
                                  style: TextStyle(fontSize: 12),
                                ),
                              ),
                            if (property.reviews.isEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade200,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'No reviews yet',
                                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Image Category Tabs
                        if (imageCategories.length > 1) ...[
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: imageCategories.map((category) {
                                final count = category == 'all'
                                    ? property.images.length
                                    : property.images.where((img) =>
                                        img.category != null && img.category!.code == category
                                      ).length;
                                final isSelected = _selectedImageCategory == category;
                                String categoryLabel = 'All Images';
                                if (category != 'all') {
                                  try {
                                    final matchingImage = property.images.firstWhere(
                                      (img) => img.category?.code == category,
                                    );
                                    categoryLabel = matchingImage.category?.name ?? 
                                        category.substring(0, 1).toUpperCase() + category.substring(1);
                                  } catch (e) {
                                    categoryLabel = category.substring(0, 1).toUpperCase() + category.substring(1);
                                  }
                                }
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8),
                                  child: ElevatedButton(
                                    onPressed: () {
                                      setState(() {
                                        _selectedImageCategory = category;
                                        _currentImageIndex = 0;
                                      });
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: isSelected
                                          ? AppColors.primaryRed
                                          : Colors.white,
                                      foregroundColor: isSelected
                                          ? Colors.white
                                          : Colors.black87,
                                      side: BorderSide(
                                        color: isSelected
                                            ? AppColors.primaryRed
                                            : Colors.grey.shade300,
                                      ),
                                    ),
                                    child: Text('$categoryLabel ($count)'),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Image Carousel
                        if (filteredImages.isNotEmpty) ...[
                          Stack(
                            children: [
                              SizedBox(
                                height: 300,
                                width: double.infinity,
                                child: PageView.builder(
                                  controller: _imagePageController,
                                  onPageChanged: (index) {
                                    setState(() {
                                      _currentImageIndex = index;
                                    });
                                  },
                                  itemCount: filteredImages.length,
                                  itemBuilder: (context, index) {
                                    return Image.network(
                                      filteredImages[index].imageUrl,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) =>
                                          Container(
                                            color: Colors.grey.shade200,
                                            child: const Icon(Icons.broken_image, size: 48),
                                          ),
                                    );
                                  },
                                ),
                              ),
                              // Navigation Arrows
                              if (filteredImages.length > 1) ...[
                                Positioned(
                                  left: 8,
                                  top: 0,
                                  bottom: 0,
                                  child: Center(
                                    child: IconButton(
                                      icon: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.8),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.chevron_left),
                                      ),
                                      onPressed: () {
                                        if (_currentImageIndex > 0) {
                                          _imagePageController.previousPage(
                                            duration: const Duration(milliseconds: 300),
                                            curve: Curves.easeInOut,
                                          );
                                        }
                                      },
                                    ),
                                  ),
                                ),
                                Positioned(
                                  right: 8,
                                  top: 0,
                                  bottom: 0,
                                  child: Center(
                                    child: IconButton(
                                      icon: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.8),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.chevron_right),
                                      ),
                                      onPressed: () {
                                        if (_currentImageIndex < filteredImages.length - 1) {
                                          _imagePageController.nextPage(
                                            duration: const Duration(milliseconds: 300),
                                            curve: Curves.easeInOut,
                                          );
                                        }
                                      },
                                    ),
                                  ),
                                ),
                                // Image Indicator Dots
                                Positioned(
                                  bottom: 12,
                                  left: 0,
                                  right: 0,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(
                                      filteredImages.length,
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
                            ],
                          ),
                          const SizedBox(height: 8),
                          // Thumbnail Images
                          if (filteredImages.length > 1)
                            SizedBox(
                              height: 60,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: filteredImages.length,
                                itemBuilder: (context, index) {
                                  return GestureDetector(
                                    onTap: () {
                                      _imagePageController.animateToPage(
                                        index,
                                        duration: const Duration(milliseconds: 300),
                                        curve: Curves.easeInOut,
                                      );
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(right: 8),
                                      width: 60,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(
                                          color: _currentImageIndex == index
                                              ? AppColors.primaryRed
                                              : Colors.grey.shade300,
                                          width: _currentImageIndex == index ? 2 : 1,
                                        ),
                                      ),
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(4),
                                        child: Image.network(
                                          filteredImages[index].imageUrl,
                                          fit: BoxFit.cover,
                                          errorBuilder: (context, error, stackTrace) =>
                                              Container(
                                                color: Colors.grey.shade200,
                                                child: const Icon(Icons.broken_image, size: 20),
                                              ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          const SizedBox(height: 24),
                        ],
                    
                    // Amenities
                    if (property.amenities.isNotEmpty) ...[
                      Text(
                        'Amenities',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 4,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 1.2,
                            ),
                            itemCount: property.amenities.length,
                            itemBuilder: (context, index) {
                              final amenity = property.amenities[index];
                              return Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    amenity.icon != null
                                        ? _getIcon(amenity.icon!)
                                        : Icons.check_circle,
                                    size: 28,
                                    color: AppColors.primaryRed,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    amenity.name,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                    
                    // Available Rooms
                    Text(
                      'Available Rooms',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    if (property.rooms.isEmpty)
                      const Text('No rooms available.')
                    else
                      ...property.rooms.map((room) {
                        final quantity = _selectedRooms[room.id.toString()] ?? 0;
                        final basePrice = room.dailyRate;
                        final discount = room.discount ?? 0.0;
                        final finalPrice = basePrice * (1 - discount / 100);
                        
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Room Image
                                if (room.images.isNotEmpty)
                                  Container(
                                    width: 120,
                                    height: 120,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: Colors.grey.shade300),
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.network(
                                        room.images.first.imageUrl,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) =>
                                            Container(
                                              color: Colors.grey.shade200,
                                              child: const Icon(Icons.broken_image),
                                            ),
                                      ),
                                    ),
                                  ),
                                if (room.images.isNotEmpty) const SizedBox(width: 16),
                                // Room Details
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        room.name,
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      if (room.size != null) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          'Room Size: ${room.size}',
                                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                        ),
                                      ],
                                      const SizedBox(height: 8),
                                      // Room Amenities
                                      Wrap(
                                        spacing: 8,
                                        runSpacing: 4,
                                        children: [
                                          if (room.occupancyType != null)
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const Icon(Icons.check_circle, size: 14, color: Colors.green),
                                                const SizedBox(width: 4),
                                                Text(room.occupancyType!, style: const TextStyle(fontSize: 12)),
                                              ],
                                            ),
                                          if (room.bathroomType != null)
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const Icon(Icons.check_circle, size: 14, color: Colors.green),
                                                const SizedBox(width: 4),
                                                Text(
                                                  room.bathroomType == 'private' ? 'Private Bathroom' : 'Shared Bathroom',
                                                  style: const TextStyle(fontSize: 12),
                                                ),
                                              ],
                                            ),
                                          ...room.amenities.take(4).map((amenity) => Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  const Icon(Icons.check_circle, size: 14, color: Colors.green),
                                                  const SizedBox(width: 4),
                                                  Text(amenity.name, style: const TextStyle(fontSize: 12)),
                                                ],
                                              )),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      // Price and Quantity Selector
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                '₹${finalPrice.toStringAsFixed(0)}',
                                                style: const TextStyle(
                                                  fontSize: 20,
                                                  fontWeight: FontWeight.bold,
                                                  color: AppColors.primaryRed,
                                                ),
                                              ),
                                              if (discount > 0) ...[
                                                Text(
                                                  '₹${basePrice.toStringAsFixed(0)}',
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    color: Colors.grey[600],
                                                    decoration: TextDecoration.lineThrough,
                                                  ),
                                                ),
                                              ],
                                              const Text(
                                                'per night',
                                                style: TextStyle(fontSize: 12, color: Colors.grey),
                                              ),
                                            ],
                                          ),
                                          // Quantity Selector
                                          Row(
                                            children: [
                                              IconButton(
                                                icon: const Icon(Icons.remove_circle_outline),
                                                onPressed: () {
                                                  setState(() {
                                                    if (quantity > 0) {
                                                      _selectedRooms[room.id.toString()] = quantity - 1;
                                                    }
                                                  });
                                                },
                                              ),
                                              Text(
                                                '$quantity',
                                                style: const TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              IconButton(
                                                icon: const Icon(Icons.add_circle_outline),
                                                onPressed: () {
                                                  setState(() {
                                                    _selectedRooms[room.id.toString()] = quantity + 1;
                                                  });
                                                },
                                              ),
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
                      }),
                    const SizedBox(height: 24),
                    
                    // About this property
                    Text(
                      'About this property',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      property.description ?? 'No description available.',
                      style: const TextStyle(fontSize: 14, height: 1.5),
                    ),
                    const SizedBox(height: 24),
                    
                    // Location Map
                    if (property.latitude != null && property.longitude != null) ...[
                      Text(
                        'Location',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Card(
                        child: InkWell(
                          onTap: _openMap,
                          child: Container(
                            height: 200,
                            decoration: BoxDecoration(
                              color: Colors.grey[300],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.map, size: 48, color: Colors.grey[600]),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Tap to view on map',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                    
                    // Ratings and Reviews
                    Text(
                      'Ratings and reviews',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    if (property.reviews.isEmpty)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            'No reviews yet. Be the first to review this property.',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ),
                      )
                    else
                      ...property.reviews.take(3).map((review) => Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: CircleAvatar(
                                child: Text(review.userName[0].toUpperCase()),
                              ),
                              title: Row(
                                children: [
                                  Text(review.userName),
                                  const SizedBox(width: 8),
                                  ...List.generate(5, (index) {
                                    return Icon(
                                      index < review.rating
                                          ? Icons.star
                                          : Icons.star_border,
                                      size: 16,
                                      color: Colors.amber,
                                    );
                                  }),
                                ],
                              ),
                              subtitle: Text(review.review),
                            ),
                          )),
                    const SizedBox(height: 24),
                    
                    // Rules & Policies
                    if (property.rules.isNotEmpty || property.documentation.isNotEmpty) ...[
                      Text(
                        'House Rules & Policies',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Rules Section
                      if (property.rules.isNotEmpty) ...[
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Rules & Policies',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                const SizedBox(height: 12),
                                ...property.rules.map((rule) => Padding(
                                      padding: const EdgeInsets.only(bottom: 8.0),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Icon(
                                            _getRuleIcon(rule.name),
                                            size: 20,
                                            color: AppColors.primaryRed,
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              rule.name,
                                              style: const TextStyle(fontSize: 14),
                                            ),
                                          ),
                                        ],
                                      ),
                                    )),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      
                      // Documentation Section
                      if (property.documentation.isNotEmpty) ...[
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Documentation Required',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 12,
                                  runSpacing: 12,
                                  children: property.documentation.map((doc) => Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            Icons.description,
                                            size: 18,
                                            color: AppColors.primaryRed,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            doc.name,
                                            style: const TextStyle(fontSize: 14),
                                          ),
                                        ],
                                      )).toList(),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ],
                    
                    // Fine Print Section
                    Text(
                      'The fine print',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Important information about your booking:',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 12),
                            ..._buildFinePrintItems(property),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Booking Summary Section
                    Card(
                      elevation: 2,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Booking Summary',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Check-in Date:', style: TextStyle(fontSize: 14)),
                                Text(
                                  DateFormat('MMM dd, yyyy').format(DateTime.now()),
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Check-out Date:', style: TextStyle(fontSize: 14)),
                                Text(
                                  DateFormat('MMM dd, yyyy').format(DateTime.now().add(const Duration(days: 1))),
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Number of Rooms:', style: TextStyle(fontSize: 14)),
                                Text(
                                  '${_selectedRooms.values.fold(0, (sum, qty) => sum + qty)}',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Number of Guests:', style: TextStyle(fontSize: 14)),
                                const Text('1', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                              ],
                            ),
                            const SizedBox(height: 16),
                            const Divider(),
                            const SizedBox(height: 16),
                            // Selected Rooms
                            if (_selectedRooms.values.any((qty) => qty > 0)) ...[
                              const Text(
                                'Selected Rooms:',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              ...property.rooms.where((room) => 
                                (_selectedRooms[room.id.toString()] ?? 0) > 0
                              ).map((room) {
                                final qty = _selectedRooms[room.id.toString()] ?? 0;
                                final basePrice = room.dailyRate;
                                final discount = room.discount ?? 0.0;
                                final finalPrice = basePrice * (1 - discount / 100);
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '${room.name} x $qty',
                                          style: const TextStyle(fontSize: 14),
                                        ),
                                      ),
                                      Text(
                                        '₹${finalPrice.toStringAsFixed(0)}/night',
                                        style: const TextStyle(fontSize: 14),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                              const SizedBox(height: 16),
                            ],
                            const Text(
                              'Apply Offer',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'No offers available',
                              style: TextStyle(fontSize: 14, color: Colors.grey),
                            ),
                            const SizedBox(height: 16),
                            const Divider(),
                            const SizedBox(height: 16),
                            // Price Breakdown
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Room Charges:', style: TextStyle(fontSize: 14)),
                                Text(
                                  '₹${roomCharges.toStringAsFixed(2)}',
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ],
                            ),
                            if (discount > 0) ...[
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Discount:', style: TextStyle(fontSize: 14, color: Colors.green)),
                                  Text(
                                    '-₹${discount.toStringAsFixed(2)}',
                                    style: const TextStyle(fontSize: 14, color: Colors.green),
                                  ),
                                ],
                              ),
                            ],
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Taxes (5%):', style: TextStyle(fontSize: 14)),
                                Text(
                                  '₹${tax.toStringAsFixed(2)}',
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            const Divider(),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Total Price:',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  '₹${totalPrice.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primaryRed,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => CreateBookingScreen(property: property),
                                    ),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primaryRed,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                ),
                                child: const Text(
                                  'Book Now!',
                                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '12 people have booked this property in last 24 hours.',
                              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
              // Footer
              const AppFooter(),
            ],
          ),
        ),
      ),
      ],
    ),
      // Sticky Bottom Bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10)
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '₹${totalPrice > 0 ? totalPrice.toStringAsFixed(0) : "2520"} / night',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryRed,
                  ),
                ),
              ],
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CreateBookingScreen(property: property),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryRed,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: const Text(
                'View Booking Details',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildFinePrintItems(Property property) {
    final List<Widget> items = [];
    
    // Check-in time
    items.add(
      Padding(
        padding: const EdgeInsets.only(bottom: 8.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.assignment,
              size: 20,
              color: AppColors.primaryRed,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Check-in time starts at ${property.checkInTime ?? '2:00 PM'}',
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
    
    // Check-out time
    items.add(
      Padding(
        padding: const EdgeInsets.only(bottom: 8.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.assignment,
              size: 20,
              color: AppColors.primaryRed,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Check-out time is ${property.checkOutTime ?? '12:00 PM'}',
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
    
    // Front desk greeting
    items.add(
      Padding(
        padding: const EdgeInsets.only(bottom: 8.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.assignment,
              size: 20,
              color: AppColors.primaryRed,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Front desk staff will greet guests on arrival',
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
    
    // 24-hour front desk for hotels
    if (property.propertyType == 'hotel') {
      items.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.assignment,
                size: 20,
                color: AppColors.primaryRed,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '24-hour front desk service available',
                  style: const TextStyle(fontSize: 14),
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    // Security deposit
    if (property.securityDeposit != null && property.securityDeposit! > 0) {
      items.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.assignment,
                size: 20,
                color: AppColors.primaryRed,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Security deposit of ₹${property.securityDeposit!.toStringAsFixed(0)} required at check-in',
                  style: const TextStyle(fontSize: 14),
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    // Pets policy
    items.add(
      Padding(
        padding: const EdgeInsets.only(bottom: 8.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.assignment,
              size: 20,
              color: AppColors.primaryRed,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Pets are not allowed on the property',
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
    
    return items;
  }

  IconData _getIcon(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'wifi':
      case 'free wifi':
        return Icons.wifi;
      case 'parking':
        return Icons.local_parking;
      case 'pool':
        return Icons.pool;
      case 'gym':
      case 'fitness center':
        return Icons.fitness_center;
      case 'restaurant':
        return Icons.restaurant;
      case 'bar':
        return Icons.local_bar;
      case 'spa':
        return Icons.spa;
      case 'ac':
      case 'air conditioning':
        return Icons.ac_unit;
      case 'room service':
        return Icons.room_service;
      case 'laundry':
      case 'laundry service':
        return Icons.local_laundry_service;
      case '24-hour front desk':
      case 'front desk':
        return Icons.desk;
      case 'cctv':
        return Icons.videocam;
      case 'power backup':
        return Icons.power;
      case 'tv':
      case 'flat screen tv':
        return Icons.tv;
      case 'private bathroom':
      case 'bathroom':
        return Icons.bathroom;
      default:
        return Icons.check_circle;
    }
  }

  IconData _getRuleIcon(String ruleName) {
    final lowerRule = ruleName.toLowerCase();
    if (lowerRule.contains('check-in') || lowerRule.contains('check in')) {
      return Icons.access_time;
    } else if (lowerRule.contains('pet')) {
      return Icons.pets;
    } else if (lowerRule.contains('room service')) {
      return Icons.room_service;
    } else {
      return Icons.assignment;
    }
  }
}

Industries Page
Technology & Product Startups: Modern open-plan tech startup office, developers collaborating at desks with dual monitors, code on screens, energetic vibe, orange and blue ambient lighting, modern style.
Digital & E-Commerce: Concept of digital commerce, tablet displaying analytics dashboard, blurred background of modern logistics or shopping, sleek and minimal, corporate colors.
BFSI & Fintech: Futuristic fintech environment, digital financial graphs and security shields on a glass interface, professional looking at data, trustworthy blue tones with orange highlights.
Healthcare & Life Sciences: Modern medical research lab, professionals in white coats discussing over a tablet, clean and sterile white environment with blue accents, high tech healthcare.
Energy, Manufacturing & Engineering: Smart manufacturing facility, engineer in safety gear holding a tablet, automated robotic arms in background, clean energy concept, industrial modern.
Global Capability Centers (GCCs): Global business hub concept, digital world map connecting different cities, diverse team in a high-end conference room, international business, corporate skyline view.
Services Page
Permanent Recruitment: Professional handshake between two people in business attire, close up, blurred modern office background, symbolizing partnership and trust, warm tones.
Contract Staffing: Dynamic co-working space, flexible workforce concept, people working on laptops at communal tables, modern and agile environment.
RPO (Recruitment Process Outsourcing): Strategic planning session, team analyzing recruitment workflows on a whiteboard, structured and organized, professional office setting.
Executive Search: Premium executive boardroom, leather chairs, view of city skyline, silhouette of a leader, high-end corporate feel, sophisticated.
Talent Advisory: Senior consultant advising a client, reviewing documents on a table, mentorship and guidance, professional and focused atmosphere.
Insights (Blog) Page
Tech Hiring Landscape: Futuristic digital cityscape of India, network nodes connecting tech hubs, evolution and growth concept, blue and orange data lines.
Founders & Culture: Startup founders brainstorming in a casual but professional space, sticky notes on glass wall, collaborative and vibrant culture.
Recruitment Playbooks: A strategy playbook open on a wooden desk, laptop, coffee cup, planning for success, minimal and clean workspace.
AI in Recruitment: Abstract representation of AI and human collaboration, digital neural network merging with human silhouette, balance of technology and empathy.
Employer Branding: Modern office reception area with a glowing company logo, welcoming atmosphere, attractive workplace design, interior architecture.
Remote Hiring: Home office setup with a view, laptop screen showing a video conference with diverse faces, global connectivity, comfortable and professional.