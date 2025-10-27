import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme_config.dart';
import '../../providers/property_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/property_card.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_widget.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _guestsController = TextEditingController();
  DateTime? _checkInDate;
  DateTime? _checkOutDate;
  String? _selectedType;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _guestsController.text = '1';
  }

  @override
  void dispose() {
    _locationController.dispose();
    _guestsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Properties'),
        backgroundColor: AppTheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          _buildSearchForm(context),
          Expanded(
            child: _isSearching ? _buildSearchResults(context) : _buildEmptyState(context),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchForm(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Location
          TextFormField(
            controller: _locationController,
            decoration: InputDecoration(
              labelText: 'Location',
              hintText: 'Enter city or area',
              prefixIcon: const Icon(Icons.location_on),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Date Range
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => _selectCheckInDate(context),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.border),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Check-in',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _checkInDate != null
                              ? '${_checkInDate!.day}/${_checkInDate!.month}/${_checkInDate!.year}'
                              : 'Select date',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: _checkInDate != null
                                ? AppTheme.textPrimary
                                : AppTheme.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: InkWell(
                  onTap: () => _selectCheckOutDate(context),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppTheme.border),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Check-out',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _checkOutDate != null
                              ? '${_checkOutDate!.day}/${_checkOutDate!.month}/${_checkOutDate!.year}'
                              : 'Select date',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: _checkOutDate != null
                                ? AppTheme.textPrimary
                                : AppTheme.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Guests and Type
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _guestsController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Guests',
                    prefixIcon: const Icon(Icons.person),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedType,
                  decoration: InputDecoration(
                    labelText: 'Type',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: const [
                    DropdownMenuItem(value: null, child: Text('All')),
                    DropdownMenuItem(value: 'hotel', child: Text('Hotels')),
                    DropdownMenuItem(value: 'hostel', child: Text('Hostels')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedType = value;
                    });
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Search Button
          CustomButton(
            text: 'Search Properties',
            onPressed: _canSearch() ? _performSearch : null,
            type: ButtonType.primary,
            size: ButtonSize.large,
            width: double.infinity,
            icon: Icons.search,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search,
            size: 64,
            color: AppTheme.textTertiary,
          ),
          SizedBox(height: 16),
          Text(
            'Search for properties',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Enter your search criteria to find the perfect place to stay',
            style: TextStyle(
              color: AppTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults(BuildContext context) {
    return Consumer<PropertyProvider>(
      builder: (context, propertyProvider, child) {
        if (propertyProvider.isLoading) {
          return const PropertyListShimmer();
        }

        if (propertyProvider.error != null) {
          return CustomErrorWidget(
            message: propertyProvider.error!,
            onRetry: _performSearch,
          );
        }

        if (propertyProvider.properties.isEmpty) {
          return EmptyStateWidget(
            title: 'No properties found',
            message: 'Try adjusting your search criteria',
            icon: Icons.search_off,
            actionText: 'Search Again',
            onAction: _performSearch,
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            _performSearch();
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: propertyProvider.properties.length,
            itemBuilder: (context, index) {
              final property = propertyProvider.properties[index];
              return PropertyCard(
                property: property,
                onTap: () {
                  Navigator.pushNamed(
                    context,
                    '/property/${property.id}',
                  );
                },
                onFavoriteTap: () {
                  context.read<PropertyProvider>().toggleFavorite(property.id);
                },
              );
            },
          ),
        );
      },
    );
  }

  bool _canSearch() {
    return _locationController.text.isNotEmpty &&
           _checkInDate != null &&
           _checkOutDate != null &&
           _guestsController.text.isNotEmpty;
  }

  Future<void> _selectCheckInDate(BuildContext context) async {
    final date = await showDatePicker(
      context: context,
      initialDate: _checkInDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    
    if (date != null) {
      setState(() {
        _checkInDate = date;
        if (_checkOutDate != null && _checkOutDate!.isBefore(date)) {
          _checkOutDate = null;
        }
      });
    }
  }

  Future<void> _selectCheckOutDate(BuildContext context) async {
    if (_checkInDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select check-in date first'),
          backgroundColor: AppTheme.warning,
        ),
      );
      return;
    }

    final date = await showDatePicker(
      context: context,
      initialDate: _checkOutDate ?? _checkInDate!.add(const Duration(days: 1)),
      firstDate: _checkInDate!.add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    
    if (date != null) {
      setState(() {
        _checkOutDate = date;
      });
    }
  }

  Future<void> _performSearch() async {
    if (!_canSearch()) return;

    setState(() {
      _isSearching = true;
    });

    try {
      await context.read<PropertyProvider>().searchProperties(
        location: _locationController.text.trim(),
        checkInDate: _checkInDate!.toIso8601String().split('T')[0],
        checkOutDate: _checkOutDate!.toIso8601String().split('T')[0],
        guests: int.tryParse(_guestsController.text.trim()) ?? 1,
        type: _selectedType,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Search failed: ${e.toString()}'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }
}
