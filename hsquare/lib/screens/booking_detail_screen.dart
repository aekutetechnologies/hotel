import 'package:flutter/material.dart';
import 'package:hsquare/models/booking.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:intl/intl.dart';

class BookingDetailScreen extends StatelessWidget {
  final Booking booking;

  const BookingDetailScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    final timeFormat = DateFormat('hh:mm a');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Details'),
        backgroundColor: AppColors.primaryRed,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property Info
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      booking.property.name,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            booking.property.location,
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Booking Info
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Booking Information',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _InfoRow(
                      icon: Icons.confirmation_number,
                      label: 'Booking ID',
                      value: '#${booking.id}',
                    ),
                    const Divider(),
                    _InfoRow(
                      icon: Icons.calendar_today,
                      label: 'Check-in',
                      value: dateFormat.format(DateTime.parse(booking.checkInDate)),
                    ),
                    if (booking.checkInTime != null)
                      _InfoRow(
                        icon: Icons.access_time,
                        label: 'Check-in Time',
                        value: timeFormat.format(DateTime.parse('2000-01-01 ${booking.checkInTime}')),
                      ),
                    const Divider(),
                    _InfoRow(
                      icon: Icons.calendar_today,
                      label: 'Check-out',
                      value: dateFormat.format(DateTime.parse(booking.checkOutDate)),
                    ),
                    if (booking.checkOutTime != null)
                      _InfoRow(
                        icon: Icons.access_time,
                        label: 'Check-out Time',
                        value: timeFormat.format(DateTime.parse('2000-01-01 ${booking.checkOutTime}')),
                      ),
                    const Divider(),
                    _InfoRow(
                      icon: Icons.people,
                      label: 'Guests',
                      value: '${booking.numberOfGuests}',
                    ),
                    _InfoRow(
                      icon: Icons.hotel,
                      label: 'Rooms',
                      value: '${booking.numberOfRooms}',
                    ),
                    _InfoRow(
                      icon: Icons.category,
                      label: 'Booking Type',
                      value: booking.bookingType.toUpperCase(),
                    ),
                    if (booking.paymentType != null) ...[
                      const Divider(),
                      _InfoRow(
                        icon: Icons.payment,
                        label: 'Payment Type',
                        value: booking.paymentType!.toUpperCase(),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Price Breakdown
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Price Breakdown',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Room Charges'),
                        Text('₹${(booking.price + booking.discount).toStringAsFixed(2)}'),
                      ],
                    ),
                    if (booking.discount > 0) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Discount', style: TextStyle(color: Colors.green)),
                          Text(
                            '-₹${booking.discount.toStringAsFixed(2)}',
                            style: const TextStyle(color: Colors.green),
                          ),
                        ],
                      ),
                    ],
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Amount',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '₹${booking.price.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryRed,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: TextStyle(color: Colors.grey[700]),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

