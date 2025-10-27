import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme_config.dart';
import '../../providers/property_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../widgets/property_card.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_widget.dart';

class PropertyListScreen extends StatefulWidget {
  final String type;

  const PropertyListScreen({
    super.key,
    required this.type,
  });

  @override
  State<PropertyListScreen> createState() => _PropertyListScreenState();
}

class _PropertyListScreenState extends State<PropertyListScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadProperties();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _loadProperties() {
    context.read<PropertyProvider>().loadProperties(
      type: widget.type,
      refresh: true,
    );
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      context.read<PropertyProvider>().loadMoreProperties();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.type == 'hotel' ? 'Hotels' : 'Hostels',
          style: const TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppTheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppTheme.textPrimary),
            onPressed: () {
              // Navigate to search screen
            },
          ),
          IconButton(
            icon: const Icon(Icons.favorite, color: AppTheme.textPrimary),
            onPressed: () {
              // Navigate to favorites screen
            },
          ),
        ],
      ),
      body: Consumer<PropertyProvider>(
        builder: (context, propertyProvider, child) {
          if (propertyProvider.isLoading && propertyProvider.properties.isEmpty) {
            return const PropertyListShimmer();
          }

          if (propertyProvider.error != null && propertyProvider.properties.isEmpty) {
            return CustomErrorWidget(
              message: propertyProvider.error!,
              onRetry: _loadProperties,
            );
          }

          if (propertyProvider.properties.isEmpty) {
            return EmptyStateWidget(
              title: 'No ${widget.type}s found',
              message: 'Try adjusting your search criteria',
              icon: Icons.search_off,
              actionText: 'Refresh',
              onAction: _loadProperties,
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              _loadProperties();
            },
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: propertyProvider.properties.length + 
                         (propertyProvider.isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index >= propertyProvider.properties.length) {
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }

                final property = propertyProvider.properties[index];
                final isFavorite = context.watch<FavoritesProvider>()
                    .isFavorite(property.id);

                return PropertyCard(
                  property: property,
                  isFavorite: isFavorite,
                  onTap: () {
                    // Navigate to property detail
                    Navigator.pushNamed(
                      context,
                      '/property/${property.id}',
                    );
                  },
                  onFavoriteTap: () {
                    context.read<FavoritesProvider>().toggleFavorite(property.id);
                  },
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to search screen
        },
        backgroundColor: widget.type == 'hotel' 
            ? AppTheme.hotelPrimary 
            : AppTheme.hostelPrimary,
        child: const Icon(Icons.search, color: Colors.white),
      ),
    );
  }
}
