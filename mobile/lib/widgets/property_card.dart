import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../models/property.dart';
import '../config/theme_config.dart';
import 'custom_button.dart';

class PropertyCard extends StatelessWidget {
  final Property property;
  final VoidCallback? onTap;
  final VoidCallback? onFavoriteTap;
  final bool isFavorite;
  final bool showFavoriteButton;

  const PropertyCard({
    super.key,
    required this.property,
    this.onTap,
    this.onFavoriteTap,
    this.isFavorite = false,
    this.showFavoriteButton = true,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildImageSection(context),
            _buildContentSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
          ),
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: property.primaryImage != null
                ? CachedNetworkImage(
                    imageUrl: property.primaryImage!,
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
                  )
                : Container(
                    color: AppTheme.borderLight,
                    child: const Icon(
                      Icons.image_not_supported,
                      color: AppTheme.textTertiary,
                      size: 48,
                    ),
                  ),
          ),
        ),
        if (showFavoriteButton)
          Positioned(
            top: 12,
            right: 12,
            child: GestureDetector(
              onTap: onFavoriteTap,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(
                  isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: isFavorite ? AppTheme.error : AppTheme.textSecondary,
                  size: 20,
                ),
              ),
            ),
          ),
        if (property.type != null)
          Positioned(
            top: 12,
            left: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: property.type == 'hotel' 
                    ? AppTheme.hotelPrimary 
                    : AppTheme.hostelPrimary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                property.type!.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildContentSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTitleAndRating(context),
          const SizedBox(height: 8),
          _buildLocation(context),
          const SizedBox(height: 8),
          _buildAmenities(context),
          const SizedBox(height: 12),
          _buildPriceAndBookButton(context),
        ],
      ),
    );
  }

  Widget _buildTitleAndRating(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            property.name,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (property.reviews != null && property.reviews!.isNotEmpty) ...[
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  RatingBarIndicator(
                    rating: property.averageRating,
                    itemBuilder: (context, index) => const Icon(
                      Icons.star,
                      color: AppTheme.accent,
                    ),
                    itemCount: 5,
                    itemSize: 16,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    property.averageRating.toStringAsFixed(1),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              Text(
                '${property.reviews!.length} reviews',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.textTertiary,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildLocation(BuildContext context) {
    return Row(
      children: [
        const Icon(
          Icons.location_on,
          size: 16,
          color: AppTheme.textSecondary,
        ),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            property.fullLocation,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppTheme.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildAmenities(BuildContext context) {
    if (property.amenities == null || property.amenities!.isEmpty) {
      return const SizedBox.shrink();
    }

    final displayAmenities = property.amenities!.take(3).toList();
    
    return Wrap(
      spacing: 8,
      runSpacing: 4,
      children: displayAmenities.map((amenity) {
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
    );
  }

  Widget _buildPriceAndBookButton(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (property.rooms != null && property.rooms!.isNotEmpty) ...[
                Text(
                  'Starting from',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textTertiary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '₹${_getStartingPrice()}',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: AppTheme.hotelPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  'per night',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textTertiary,
                  ),
                ),
              ],
            ],
          ),
        ),
        CustomButton(
          text: 'View Details',
          onPressed: onTap,
          type: ButtonType.primary,
          size: ButtonSize.small,
        ),
      ],
    );
  }

  String _getStartingPrice() {
    if (property.rooms == null || property.rooms!.isEmpty) {
      return '0';
    }

    double minPrice = double.infinity;
    
    for (final room in property.rooms!) {
      if (room.dailyRate != null) {
        final price = double.tryParse(room.dailyRate!) ?? 0;
        if (price > 0 && price < minPrice) {
          minPrice = price;
        }
      }
    }

    return minPrice == double.infinity ? '0' : minPrice.toStringAsFixed(0);
  }
}

class PropertyListCard extends StatelessWidget {
  final Property property;
  final VoidCallback? onTap;
  final VoidCallback? onFavoriteTap;
  final bool isFavorite;

  const PropertyListCard({
    super.key,
    required this.property,
    this.onTap,
    this.onFavoriteTap,
    this.isFavorite = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              _buildImage(context),
              const SizedBox(width: 12),
              Expanded(
                child: _buildContent(context),
              ),
              if (onFavoriteTap != null)
                _buildFavoriteButton(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImage(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 80,
        height: 80,
        child: property.primaryImage != null
            ? CachedNetworkImage(
                imageUrl: property.primaryImage!,
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
                  ),
                ),
              )
            : Container(
                color: AppTheme.borderLight,
                child: const Icon(
                  Icons.image_not_supported,
                  color: AppTheme.textTertiary,
                ),
              ),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          property.name,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            const Icon(
              Icons.location_on,
              size: 14,
              color: AppTheme.textSecondary,
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                property.fullLocation,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.textSecondary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        if (property.reviews != null && property.reviews!.isNotEmpty)
          Row(
            children: [
              RatingBarIndicator(
                rating: property.averageRating,
                itemBuilder: (context, index) => const Icon(
                  Icons.star,
                  color: AppTheme.accent,
                ),
                itemCount: 5,
                itemSize: 12,
              ),
              const SizedBox(width: 4),
              Text(
                '${property.averageRating.toStringAsFixed(1)} (${property.reviews!.length})',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildFavoriteButton(BuildContext context) {
    return GestureDetector(
      onTap: onFavoriteTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppTheme.borderLight,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Icon(
          isFavorite ? Icons.favorite : Icons.favorite_border,
          color: isFavorite ? AppTheme.error : AppTheme.textSecondary,
          size: 20,
        ),
      ),
    );
  }
}
