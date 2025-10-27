import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../../config/theme_config.dart';
import '../../models/property.dart';
import '../../providers/property_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_widget.dart';

class PropertyDetailScreen extends StatefulWidget {
  final int propertyId;

  const PropertyDetailScreen({
    super.key,
    required this.propertyId,
  });

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen>
    with TickerProviderStateMixin {
  Property? _property;
  bool _isLoading = true;
  String? _error;
  int _currentImageIndex = 0;
  int _selectedRoomIndex = -1;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadProperty();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadProperty() async {
    try {
      final property = await context.read<PropertyProvider>()
          .getPropertyById(widget.propertyId);
      if (mounted) {
        setState(() {
          _property = property;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: FullScreenLoading(
          message: 'Loading property details...',
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Property Details'),
          backgroundColor: AppTheme.surface,
        ),
        body: CustomErrorWidget(
          message: _error!,
          onRetry: _loadProperty,
        ),
      );
    }

    if (_property == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Property Details'),
          backgroundColor: AppTheme.surface,
        ),
        body: const EmptyStateWidget(
          title: 'Property not found',
          message: 'The property you are looking for does not exist',
          icon: Icons.search_off,
        ),
      );
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context),
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildImageGallery(context),
                _buildPropertyInfo(context),
                _buildTabBar(context),
                _buildTabContent(context),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(context),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 0,
      floating: true,
      pinned: true,
      backgroundColor: AppTheme.surface,
      foregroundColor: AppTheme.textPrimary,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: () => Navigator.pop(context),
      ),
      actions: [
        Consumer<FavoritesProvider>(
          builder: (context, favoritesProvider, child) {
            final isFavorite = favoritesProvider.isFavorite(_property!.id);
            return IconButton(
              icon: Icon(
                isFavorite ? Icons.favorite : Icons.favorite_border,
                color: isFavorite ? AppTheme.error : AppTheme.textSecondary,
              ),
              onPressed: () {
                favoritesProvider.toggleFavorite(_property!.id);
              },
            );
          },
        ),
        IconButton(
          icon: const Icon(Icons.share),
          onPressed: () {
            // Share property
          },
        ),
      ],
    );
  }

  Widget _buildImageGallery(BuildContext context) {
    if (_property!.images == null || _property!.images!.isEmpty) {
      return Container(
        height: 250,
        color: AppTheme.borderLight,
        child: const Center(
          child: Icon(
            Icons.image_not_supported,
            size: 64,
            color: AppTheme.textTertiary,
          ),
        ),
      );
    }

    return Container(
      height: 250,
      child: Stack(
        children: [
          PageView.builder(
            onPageChanged: (index) {
              setState(() {
                _currentImageIndex = index;
              });
            },
            itemCount: _property!.images!.length,
            itemBuilder: (context, index) {
              return CachedNetworkImage(
                imageUrl: _property!.images![index].image,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: AppTheme.borderLight,
                  child: const Center(
                    child: CircularProgressIndicator(),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  color: AppTheme.borderLight,
                  child: const Icon(
                    Icons.image_not_supported,
                    color: AppTheme.textTertiary,
                    size: 48,
                  ),
                ),
              );
            },
          ),
          if (_property!.images!.length > 1)
            Positioned(
              bottom: 16,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _property!.images!.length,
                  (index) => Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: index == _currentImageIndex
                          ? Colors.white
                          : Colors.white.withOpacity(0.5),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPropertyInfo(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (_property!.type != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _property!.type == 'hotel'
                        ? AppTheme.hotelPrimary
                        : AppTheme.hostelPrimary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _property!.type!.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              const Spacer(),
              if (_property!.reviews != null && _property!.reviews!.isNotEmpty)
                Row(
                  children: [
                    RatingBarIndicator(
                      rating: _property!.averageRating,
                      itemBuilder: (context, index) => const Icon(
                        Icons.star,
                        color: AppTheme.accent,
                      ),
                      itemCount: 5,
                      itemSize: 16,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${_property!.averageRating.toStringAsFixed(1)} (${_property!.reviews!.length})',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _property!.name,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(
                Icons.location_on,
                size: 16,
                color: AppTheme.textSecondary,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  _property!.fullLocation,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          if (_property!.description != null) ...[
            const SizedBox(height: 12),
            Text(
              _property!.description!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppTheme.textPrimary,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTabBar(BuildContext context) {
    return Container(
      color: AppTheme.surface,
      child: TabBar(
        controller: _tabController,
        labelColor: AppTheme.hotelPrimary,
        unselectedLabelColor: AppTheme.textSecondary,
        indicatorColor: AppTheme.hotelPrimary,
        tabs: const [
          Tab(text: 'Rooms'),
          Tab(text: 'Amenities'),
          Tab(text: 'Reviews'),
          Tab(text: 'Location'),
        ],
      ),
    );
  }

  Widget _buildTabContent(BuildContext context) {
    return Container(
      height: 400,
      child: TabBarView(
        controller: _tabController,
        children: [
          _buildRoomsTab(context),
          _buildAmenitiesTab(context),
          _buildReviewsTab(context),
          _buildLocationTab(context),
        ],
      ),
    );
  }

  Widget _buildRoomsTab(BuildContext context) {
    if (_property!.rooms == null || _property!.rooms!.isEmpty) {
      return const Center(
        child: Text('No rooms available'),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _property!.rooms!.length,
      itemBuilder: (context, index) {
        final room = _property!.rooms![index];
        final isSelected = _selectedRoomIndex == index;
        
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: isSelected ? 4 : 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
              color: isSelected ? AppTheme.hotelPrimary : AppTheme.border,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: InkWell(
            onTap: () {
              setState(() {
                _selectedRoomIndex = index;
              });
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          room.name,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ),
                      if (room.dailyRate != null)
                        Text(
                          '₹${room.dailyRate}/night',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppTheme.hotelPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                  if (room.capacity != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(
                          Icons.person,
                          size: 16,
                          color: AppTheme.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Capacity: ${room.capacity} guests',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (room.amenities != null && room.amenities!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: room.amenities!.take(3).map((amenity) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.borderLight,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            amenity.name,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAmenitiesTab(BuildContext context) {
    if (_property!.amenities == null || _property!.amenities!.isEmpty) {
      return const Center(
        child: Text('No amenities available'),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _property!.amenities!.length,
      itemBuilder: (context, index) {
        final amenity = _property!.amenities![index];
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppTheme.borderLight,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                Icons.check_circle,
                color: AppTheme.success,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  amenity.name,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildReviewsTab(BuildContext context) {
    if (_property!.reviews == null || _property!.reviews!.isEmpty) {
      return const Center(
        child: Text('No reviews available'),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _property!.reviews!.length,
      itemBuilder: (context, index) {
        final review = _property!.reviews![index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: AppTheme.hotelPrimary,
                      child: Text(
                        review.user.name.substring(0, 1).toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            review.user.name,
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          RatingBarIndicator(
                            rating: review.rating,
                            itemBuilder: (context, index) => const Icon(
                              Icons.star,
                              color: AppTheme.accent,
                            ),
                            itemCount: 5,
                            itemSize: 12,
                          ),
                        ],
                      ),
                    ),
                    Text(
                      _formatDate(review.createdAt),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textTertiary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  review.review,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLocationTab(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Container(
            height: 200,
            decoration: BoxDecoration(
              color: AppTheme.borderLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text('Map will be displayed here'),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(
                Icons.location_on,
                color: AppTheme.hotelPrimary,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _property!.fullLocation,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_property!.rooms != null && _property!.rooms!.isNotEmpty)
                  Text(
                    'Starting from ₹${_getStartingPrice()}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppTheme.hotelPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                Text(
                  'per night',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          CustomButton(
            text: 'Book Now',
            onPressed: _selectedRoomIndex >= 0 ? () {
              // Navigate to booking screen
            } : null,
            type: ButtonType.primary,
            size: ButtonSize.large,
            width: 120,
          ),
        ],
      ),
    );
  }

  String _getStartingPrice() {
    if (_property!.rooms == null || _property!.rooms!.isEmpty) {
      return '0';
    }

    double minPrice = double.infinity;
    
    for (final room in _property!.rooms!) {
      if (room.dailyRate != null) {
        final price = double.tryParse(room.dailyRate!) ?? 0;
        if (price > 0 && price < minPrice) {
          minPrice = price;
        }
      }
    }

    return minPrice == double.infinity ? '0' : minPrice.toStringAsFixed(0);
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours ago';
    } else {
      return 'Just now';
    }
  }
}
