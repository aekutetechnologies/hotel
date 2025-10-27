import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme_config.dart';
import '../../models/booking.dart';
import '../../providers/booking_provider.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/custom_button.dart';

class BookingListScreen extends StatefulWidget {
  const BookingListScreen({super.key});

  @override
  State<BookingListScreen> createState() => _BookingListScreenState();
}

class _BookingListScreenState extends State<BookingListScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadBookings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadBookings() async {
    await context.read<BookingProvider>().loadUserBookings();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Bookings'),
        backgroundColor: AppTheme.surface,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.hotelPrimary,
          unselectedLabelColor: AppTheme.textSecondary,
          indicatorColor: AppTheme.hotelPrimary,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Active'),
            Tab(text: 'Completed'),
            Tab(text: 'Cancelled'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildBookingsList(context, null),
          _buildBookingsList(context, 'active'),
          _buildBookingsList(context, 'completed'),
          _buildBookingsList(context, 'cancelled'),
        ],
      ),
    );
  }

  Widget _buildBookingsList(BuildContext context, String? filter) {
    return Consumer<BookingProvider>(
      builder: (context, bookingProvider, child) {
        if (bookingProvider.isLoading) {
          return const FullScreenLoading(
            message: 'Loading your bookings...',
          );
        }

        if (bookingProvider.error != null) {
          return CustomErrorWidget(
            message: bookingProvider.error!,
            onRetry: _loadBookings,
          );
        }

        List<Booking> bookings = bookingProvider.bookings;
        
        // Apply filter
        if (filter != null) {
          switch (filter) {
            case 'active':
              bookings = bookingProvider.activeBookings;
              break;
            case 'completed':
              bookings = bookingProvider.completedBookings;
              break;
            case 'cancelled':
              bookings = bookingProvider.cancelledBookings;
              break;
          }
        }

        if (bookings.isEmpty) {
          return _buildEmptyState(context, filter);
        }

        return RefreshIndicator(
          onRefresh: _loadBookings,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: bookings.length,
            itemBuilder: (context, index) {
              final booking = bookings[index];
              return _buildBookingCard(context, booking);
            },
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context, String? filter) {
    String title;
    String message;
    IconData icon;

    switch (filter) {
      case 'active':
        title = 'No active bookings';
        message = 'You don\'t have any active bookings at the moment';
        icon = Icons.hotel;
        break;
      case 'completed':
        title = 'No completed bookings';
        message = 'You haven\'t completed any bookings yet';
        icon = Icons.check_circle;
        break;
      case 'cancelled':
        title = 'No cancelled bookings';
        message = 'You haven\'t cancelled any bookings';
        icon = Icons.cancel;
        break;
      default:
        title = 'No bookings found';
        message = 'You haven\'t made any bookings yet';
        icon = Icons.search_off;
    }

    return EmptyStateWidget(
      title: title,
      message: message,
      icon: icon,
      actionText: 'Browse Properties',
      onAction: () {
        Navigator.pushNamed(context, '/');
      },
    );
  }

  Widget _buildBookingCard(BuildContext context, Booking booking) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          // Navigate to booking details
          Navigator.pushNamed(
            context,
            '/booking/${booking.id}',
          );
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          booking.property.name,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          booking.property.fullLocation,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _buildStatusChip(booking.status),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 16,
                    color: AppTheme.textSecondary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${_formatDate(booking.checkInDate)} - ${_formatDate(booking.checkOutDate)}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.person,
                    size: 16,
                    color: AppTheme.textSecondary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${booking.numberOfGuests} guest${booking.numberOfGuests > 1 ? 's' : ''}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const Spacer(),
                  if (booking.totalAmount != null)
                    Text(
                      '₹${booking.totalAmount}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppTheme.hotelPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                ],
              ),
              if (booking.isActive) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'View Details',
                        onPressed: () {
                          Navigator.pushNamed(
                            context,
                            '/booking/${booking.id}',
                          );
                        },
                        type: ButtonType.secondary,
                        size: ButtonSize.small,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: CustomButton(
                        text: 'Cancel',
                        onPressed: () => _cancelBooking(context, booking),
                        type: ButtonType.text,
                        size: ButtonSize.small,
                        textColor: AppTheme.error,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color backgroundColor;
    Color textColor;
    String displayText;

    switch (status.toLowerCase()) {
      case 'confirmed':
        backgroundColor = AppTheme.success.withOpacity(0.1);
        textColor = AppTheme.success;
        displayText = 'Confirmed';
        break;
      case 'pending':
        backgroundColor = AppTheme.warning.withOpacity(0.1);
        textColor = AppTheme.warning;
        displayText = 'Pending';
        break;
      case 'completed':
        backgroundColor = AppTheme.hotelPrimary.withOpacity(0.1);
        textColor = AppTheme.hotelPrimary;
        displayText = 'Completed';
        break;
      case 'cancelled':
        backgroundColor = AppTheme.error.withOpacity(0.1);
        textColor = AppTheme.error;
        displayText = 'Cancelled';
        break;
      default:
        backgroundColor = AppTheme.borderLight;
        textColor = AppTheme.textSecondary;
        displayText = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Future<void> _cancelBooking(BuildContext context, Booking booking) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Booking'),
        content: const Text('Are you sure you want to cancel this booking?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Yes'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await context.read<BookingProvider>().cancelBooking(booking.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Booking cancelled successfully'),
              backgroundColor: AppTheme.success,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to cancel booking: ${e.toString()}'),
              backgroundColor: AppTheme.error,
            ),
          );
        }
      }
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
